/**
 * Rule Loader - Manages loading and caching of compliance rules
 * 
 * This class handles loading rules from various sources and provides
 * caching and management capabilities for the rule engine.
 */

import { RuleDefinition, RuleEngineError, VisaPhase, VisaType, RuleGroup } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Rule source configuration
 */
export interface RuleSource {
  type: 'embedded' | 'database' | 'api';
  location: string;
  priority?: number;
  enabled?: boolean;
}

/**
 * Rule loading result
 */
export interface RuleLoadResult {
  rules: RuleDefinition[];
  source: RuleSource;
  loadedAt: Date;
  errors: string[];
}

/**
 * Rule cache entry
 */
interface RuleCacheEntry {
  rules: RuleDefinition[];
  loadedAt: Date;
  expiresAt: Date;
  source: RuleSource;
}

/**
 * Main RuleLoader class
 */
export class RuleLoader {
  private cache = new Map<string, RuleCacheEntry>();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private sources: RuleSource[] = [];

  constructor(sources: RuleSource[] = []) {
    this.sources = sources;
    this.setupDefaultSources();
  }

  /**
   * Setup default rule sources
   */
  private setupDefaultSources(): void {
    if (this.sources.length === 0) {
      // Default to embedded rule sources
      this.sources = [
        {
          type: 'embedded',
          location: 'f1-student-rules',
          priority: 100,
          enabled: true
        },
        {
          type: 'embedded', 
          location: 'opt-rules',
          priority: 100,
          enabled: true
        },
        {
          type: 'embedded',
          location: 'stem-opt-rules',
          priority: 100,
          enabled: true
        }
      ];
    }
  }

  /**
   * Load all rules from configured sources
   */
  public async loadAllRules(): Promise<RuleDefinition[]> {
    const allRules: RuleDefinition[] = [];
    const loadPromises: Promise<RuleLoadResult>[] = [];

    // Load from all enabled sources
    const enabledSources = this.sources.filter(s => s.enabled !== false);
    for (const source of enabledSources) {
      loadPromises.push(this.loadFromSource(source));
    }

    try {
      const results = await Promise.allSettled(loadPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const loadResult = result.value;
          allRules.push(...loadResult.rules);
          
          // Cache the results (use the actual source returned)
          this.cacheRules(loadResult.source, loadResult.rules);
        } else {
          console.error(`Failed to load rules from source ${index}:`, result.reason);
        }
      });

      // Remove duplicates based on rule ID
      const uniqueRules = this.deduplicateRules(allRules);
      
      console.log(`✅ Loaded ${uniqueRules.length} unique rules from ${this.sources.length} sources`);
      
      return uniqueRules;

    } catch (error) {
      throw new RuleEngineError(
        `Failed to load rules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_LOADING_FAILED'
      );
    }
  }

  /**
   * Load rules from a specific source
   */
  private async loadFromSource(source: RuleSource): Promise<RuleLoadResult> {
    const cacheKey = `${source.type}:${source.location}`;
    
    // Check cache first
    const cached = this.getCachedRules(cacheKey);
    if (cached) {
      return {
        rules: cached.rules,
        source,
        loadedAt: cached.loadedAt,
        errors: []
      };
    }

    try {
      let rules: RuleDefinition[] = [];
      
      switch (source.type) {
        case 'embedded':
          rules = await this.loadEmbeddedRules(source.location);
          break;
        case 'database':
          rules = await this.loadFromDatabase(source.location);
          break;
        case 'api':
          rules = await this.loadFromAPI(source.location);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }

      return {
        rules,
        source,
        loadedAt: new Date(),
        errors: []
      };

    } catch (error) {
      throw new RuleEngineError(
        `Failed to load from ${source.type} source ${source.location}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_LOADING_FAILED'
      );
    }
  }

  /**
   * Load embedded rules based on location
   */
  private async loadEmbeddedRules(location: string): Promise<RuleDefinition[]> {
    const filePath = path.join(process.cwd(), 'src', 'services', 'ruleEngine', 'sampleRules', `${location}.json`);
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const ruleSet = JSON.parse(fileContent);
      if (ruleSet && Array.isArray(ruleSet.rules)) {
        return ruleSet.rules;
      }
      console.warn(`Warning: Rule file at ${location}.json is not structured correctly or has no rules.`);
      return [];
    } catch (error) {
      console.error(`Error loading rule file ${location}.json:`, error);
      throw new RuleEngineError(
        `Failed to load or parse rule file: ${location}.json`,
        'RULE_LOADING_FAILED'
      );
    }
  }


  /**
   * Load rules from database (placeholder)
   */
  private async loadFromDatabase(connectionString: string): Promise<RuleDefinition[]> {
    // TODO: Implement database loading
    // This would connect to Supabase and load rules from compliance_rules table
    throw new Error('Database rule loading not yet implemented');
  }

  /**
   * Load rules from API (placeholder)
   */
  private async loadFromAPI(apiUrl: string): Promise<RuleDefinition[]> {
    // TODO: Implement API loading
    // This would fetch rules from an external API
    throw new Error('API rule loading not yet implemented');
  }

  /**
   * Cache rules for a source
   */
  private cacheRules(source: RuleSource, rules: RuleDefinition[]): void {
    const cacheKey = `${source.type}:${source.location}`;
    const entry: RuleCacheEntry = {
      rules,
      loadedAt: new Date(),
      expiresAt: new Date(Date.now() + this.defaultCacheTTL),
      source
    };
    
    this.cache.set(cacheKey, entry);
  }

  /**
   * Get cached rules if not expired
   */
  private getCachedRules(cacheKey: string): RuleCacheEntry | null {
    const entry = this.cache.get(cacheKey);
    
    if (entry && entry.expiresAt > new Date()) {
      return entry;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Remove duplicate rules based on ID, keeping highest priority
   */
  private deduplicateRules(rules: RuleDefinition[]): RuleDefinition[] {
    const ruleMap = new Map<string, RuleDefinition>();
    
    rules.forEach(rule => {
      const existing = ruleMap.get(rule.id);
      
      if (!existing || rule.priority > existing.priority) {
        ruleMap.set(rule.id, rule);
      }
    });
    
    return Array.from(ruleMap.values());
  }

  /**
   * Reload rules and clear cache
   */
  public async reloadRules(): Promise<RuleDefinition[]> {
    this.clearCache();
    return this.loadAllRules();
  }

  /**
   * Clear rule cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current sources
   */
  public getSources(): RuleSource[] {
    return [...this.sources];
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { entries: number; totalRules: number; oldestEntry: Date | null } {
    let totalRules = 0;
    let oldestEntry: Date | null = null;
    
    this.cache.forEach(entry => {
      totalRules += entry.rules.length;
      if (!oldestEntry || entry.loadedAt < oldestEntry) {
        oldestEntry = entry.loadedAt;
      }
    });
    
    return {
      entries: this.cache.size,
      totalRules,
      oldestEntry
    };
  }
}
