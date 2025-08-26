/**
 * Smart Compliance Rule Engine - Main Engine Class
 * 
 * This is the core engine that evaluates rules against user context and generates
 * intelligent, personalized compliance tasks with smart dates and dependencies.
 */

import {
  RuleDefinition,
  RuleEvaluationResult,
  RuleEngineResult,
  UserContext,
  GeneratedTask,
  RuleEngineConfig,
  RuleEngineError,
  VisaPhase,
  VisaType
} from './types';
import { RuleEvaluator } from './RuleEvaluator';
import { DateCalculator } from './DateCalculator';
import { ContextBuilder } from './ContextBuilder';
import { TemplateRenderer } from './TemplateRenderer';
import { DependencyResolver } from './DependencyResolver';

/**
 * Main Rule Engine class - orchestrates the entire rule evaluation process
 */
export class RuleEngine {
  private static instance: RuleEngine;
  private config: RuleEngineConfig;
  private rules: Map<string, RuleDefinition> = new Map();
  private evaluator: RuleEvaluator;
  private dateCalculator: DateCalculator;
  private contextBuilder: ContextBuilder;
  private templateRenderer: TemplateRenderer;
  private dependencyResolver: DependencyResolver;
  
  // Caching mechanism
  private evaluationCache: Map<string, { result: RuleEngineResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

  private constructor(config: RuleEngineConfig) {
    this.config = config;
    this.evaluator = new RuleEvaluator();
    this.dateCalculator = new DateCalculator();
    this.contextBuilder = new ContextBuilder();
    this.templateRenderer = new TemplateRenderer();
    this.dependencyResolver = new DependencyResolver();
  }

  /**
   * Get singleton instance of RuleEngine
   */
  public static getInstance(config?: RuleEngineConfig): RuleEngine {
    if (!RuleEngine.instance) {
      const defaultConfig: RuleEngineConfig = {
        enableSmartDates: true,
        enableDependencies: true,
        enableUniversityOverrides: true,
        enableAutoCompletion: true,
        maxTasksPerEvaluation: 50,
        cacheEvaluationResults: true,
        debugMode: false,
        performanceTracking: true
      };
      RuleEngine.instance = new RuleEngine(config || defaultConfig);
    }
    return RuleEngine.instance;
  }

  /**
   * Load rules into the engine
   */
  public async loadRules(rules: RuleDefinition[]): Promise<void> {
    try {
      this.rules.clear();
      
      for (const rule of rules) {
        this.validateRule(rule);
        this.rules.set(rule.id, rule);
      }
      
      if (this.config.debugMode) {
        console.log(`✅ Loaded ${rules.length} rules into engine`);
      }
    } catch (error) {
      throw new RuleEngineError(
        `Failed to load rules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_LOADING_FAILED'
      );
    }
  }

  /**
   * Main method: Evaluate all rules for a user and generate tasks
   */
  public async evaluateRulesForUser(userId: string): Promise<RuleEngineResult> {
    const startTime = Date.now();
    
    // Check cache if enabled
    if (this.config.cacheEvaluationResults) {
      const cached = this.getCachedResult(userId);
      if (cached) {
        if (this.config.debugMode) {
          console.log(`🚀 Cache hit for user ${userId}`);
        }
        return cached;
      }
    }
    
    try {
      // Build comprehensive user context
      const userContext = await this.contextBuilder.buildContext(userId);
      
      if (this.config.debugMode) {
        console.log(`📊 Built context for user ${userId}:`, {
          visaType: userContext.visaType,
          currentPhase: userContext.currentPhase,
          university: userContext.academic.university
        });
      }

      // Get applicable rules for this user
      const applicableRules = this.getApplicableRules(userContext);
      
      if (this.config.debugMode) {
        console.log(`🎯 Found ${applicableRules.length} applicable rules`);
      }

      // Evaluate each rule
      const ruleResults: RuleEvaluationResult[] = [];
      const generatedTasks: GeneratedTask[] = [];
      const errors: string[] = [];

      for (const rule of applicableRules) {
        try {
          const result = await this.evaluateRule(rule, userContext);
          ruleResults.push(result);
          
          if (result.matched && result.generatedTask) {
            generatedTasks.push(result.generatedTask);
          }
        } catch (error) {
          const errorMsg = `Rule ${rule.id} evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          
          if (this.config.debugMode) {
            console.error(`❌ ${errorMsg}`);
          }
        }
      }

      // Resolve task dependencies with graceful degradation
      let resolvedTasks = generatedTasks;
      if (this.config.enableDependencies) {
        try {
          resolvedTasks = await this.dependencyResolver.resolveDependencies(generatedTasks);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`Dependency resolution failed: ${msg}`);
          if (this.config.debugMode) {
            console.error('⚠️ Dependency resolution failed — returning unsorted tasks:', msg);
          }
        }
      }

      // Limit tasks if configured
      const finalTasks = resolvedTasks.slice(0, this.config.maxTasksPerEvaluation);

      const result: RuleEngineResult = {
        userId,
        evaluatedAt: new Date(),
        userContext,
        ruleResults,
        generatedTasks: finalTasks,
        errors,
        performance: {
          totalRulesEvaluated: applicableRules.length,
          executionTimeMs: Date.now() - startTime,
          rulesMatched: ruleResults.filter(r => r.matched).length,
          tasksGenerated: finalTasks.length
        }
      };

      if (this.config.debugMode) {
        console.log(`🎉 Rule evaluation complete:`, {
          rulesEvaluated: result.performance.totalRulesEvaluated,
          rulesMatched: result.performance.rulesMatched,
          tasksGenerated: result.performance.tasksGenerated,
          executionTime: `${result.performance.executionTimeMs}ms`
        });
      }

      // Cache the result if enabled
      if (this.config.cacheEvaluationResults) {
        this.cacheResult(userId, result);
      }

      return result;

    } catch (error) {
      throw new RuleEngineError(
        `Rule evaluation failed for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_EVALUATION_FAILED',
        undefined,
        userId
      );
    }
  }

  /**
   * Evaluate a single rule against user context
   */
  private async evaluateRule(rule: RuleDefinition, userContext: UserContext): Promise<RuleEvaluationResult> {
    try {
      // Evaluate rule conditions
      const conditionResults = await this.evaluator.evaluateConditions(rule.conditions, userContext);
      const matched = conditionResults.every(result => result.passed);

      let generatedTask: GeneratedTask | undefined;

      if (matched) {
        // Generate task from template
        generatedTask = await this.generateTaskFromRule(rule, userContext);
        
        if (this.config.debugMode) {
          console.log(`✅ Rule ${rule.id} matched - generated task: ${generatedTask.title}`);
        }
      } else {
        if (this.config.debugMode) {
          const failedConditions = conditionResults.filter(r => !r.passed);
          console.log(`❌ Rule ${rule.id} not matched - failed conditions:`, failedConditions.map(c => c.reason));
        }
      }

      return {
        rule,
        matched,
        conditionResults,
        generatedTask,
        evaluatedAt: new Date(),
        context: userContext
      };

    } catch (error) {
      throw new RuleEngineError(
        `Failed to evaluate rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_EVALUATION_FAILED',
        rule.id,
        userContext.userId
      );
    }
  }

  /**
   * Generate a task from a matched rule
   */
  private async generateTaskFromRule(rule: RuleDefinition, userContext: UserContext): Promise<GeneratedTask> {
    try {
      // Calculate smart due date
      const dueDate = this.config.enableSmartDates
        ? await this.dateCalculator.calculateDueDate(rule.taskTemplate.dueDateConfig, userContext)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days from now

      // Render title and description from templates
      const renderedTitle = await this.templateRenderer.render(rule.taskTemplate.titleTemplate, userContext);
      const renderedDescription = await this.templateRenderer.render(rule.taskTemplate.descriptionTemplate, userContext);

      // Apply university overrides if applicable
      const finalTemplate = this.applyUniversityOverrides(rule.taskTemplate, userContext);

      const task: GeneratedTask = {
        ruleId: rule.id,
        title: renderedTitle,
        description: renderedDescription,
        dueDate: dueDate.toISOString().split('T')[0], // YYYY-MM-DD format
        deadline: dueDate,
        category: finalTemplate.category,
        priority: finalTemplate.priority,
        phase: Array.isArray(rule.phase) ? rule.phase[0] : rule.phase,
        completed: false,
        contextData: {
          userPhase: userContext.currentPhase,
          triggerConditions: rule.conditions.map(c => `${c.field} ${c.operator} ${c.value}`),
          smartDateCalculation: `Calculated from ${rule.taskTemplate.dueDateConfig.type}`,
          placeholderValues: this.extractPlaceholderValues(userContext)
        },
        dependencies: rule.taskTemplate.dependsOn || [],
        autoCompleteWhen: rule.taskTemplate.autoCompleteConditions,
        isRecurring: rule.taskTemplate.dueDateConfig.type === 'recurring',
        recurringInterval: rule.taskTemplate.dueDateConfig.type === 'recurring' ? rule.taskTemplate.dueDateConfig.calculation : undefined
      };

      return task;

    } catch (error) {
      throw new RuleEngineError(
        `Failed to generate task from rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TASK_GENERATION_FAILED',
        rule.id,
        userContext.userId
      );
    }
  }

  /**
   * Get rules applicable to the user's current context
   */
  private getApplicableRules(userContext: UserContext): RuleDefinition[] {
    const applicableRules: RuleDefinition[] = [];

    for (const rule of this.rules.values()) {
      // Skip inactive rules
      if (!rule.isActive) continue;

      // Check visa type applicability
      if (!rule.visaTypes.includes(userContext.visaType)) continue;

      // Check phase applicability
      const rulePhases = Array.isArray(rule.phase) ? rule.phase : [rule.phase];
      if (!rulePhases.includes(userContext.currentPhase) && !rulePhases.includes('general')) continue;

      // Check university-specific rules
      if (rule.universitySpecific && rule.universitySpecific !== userContext.academic.universityId) continue;

      applicableRules.push(rule);
    }

    // Sort by priority (higher priority first)
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Apply university-specific overrides to task template
   */
  private applyUniversityOverrides(template: any, userContext: UserContext): any {
    if (!this.config.enableUniversityOverrides || !template.universityOverrides || !userContext.academic.universityId) {
      return template;
    }

    const overrides = template.universityOverrides[userContext.academic.universityId];
    if (!overrides) return template;

    return { ...template, ...overrides };
  }

  /**
   * Extract values for template placeholders
   */
  private extractPlaceholderValues(userContext: UserContext): { [key: string]: any } {
    return {
      userName: userContext.name || 'Student',
      university: userContext.academic.university || 'your university',
      visaType: userContext.visaType,
      currentPhase: userContext.currentPhase,
      graduationDate: userContext.dates.graduationDate?.toLocaleDateString(),
      optEndDate: userContext.dates.optEndDate?.toLocaleDateString(),
      passportExpiry: userContext.dates.passportExpiryDate?.toLocaleDateString(),
      // Add more as needed
    };
  }

  /**
   * Validate rule definition
   */
  private validateRule(rule: RuleDefinition): void {
    if (!rule.id || !rule.name) {
      throw new RuleEngineError('Rule must have id and name', 'INVALID_RULE_DEFINITION', rule.id);
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      throw new RuleEngineError('Rule must have at least one condition', 'INVALID_RULE_DEFINITION', rule.id);
    }

    if (!rule.taskTemplate) {
      throw new RuleEngineError('Rule must have a task template', 'INVALID_RULE_DEFINITION', rule.id);
    }

    if (!rule.visaTypes || rule.visaTypes.length === 0) {
      throw new RuleEngineError('Rule must specify applicable visa types', 'INVALID_RULE_DEFINITION', rule.id);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): RuleEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RuleEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get loaded rules count
   */
  public getRulesCount(): number {
    return this.rules.size;
  }

  /**
   * Get rule by ID
   */
  public getRule(ruleId: string): RuleDefinition | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Clear all loaded rules
   */
  public clearRules(): void {
    this.rules.clear();
  }

  // ============================================================================
  // CACHING METHODS
  // ============================================================================

  /**
   * Get cached evaluation result for a user
   */
  private getCachedResult(userId: string): RuleEngineResult | null {
    const cacheKey = this.generateCacheKey(userId);
    const cached = this.evaluationCache.get(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache has expired
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL_MS) {
      this.evaluationCache.delete(cacheKey);
      return null;
    }
    
    return cached.result;
  }

  /**
   * Cache evaluation result for a user
   */
  private cacheResult(userId: string, result: RuleEngineResult): void {
    const cacheKey = this.generateCacheKey(userId);
    this.evaluationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    // Clean up expired entries periodically
    if (this.evaluationCache.size % 10 === 0) {
      this.cleanupExpiredCache();
    }
  }

  /**
   * Generate cache key for a user
   */
  private generateCacheKey(userId: string): string {
    return `eval_${userId}`;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.evaluationCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL_MS) {
        this.evaluationCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached results
   */
  public clearCache(): void {
    this.evaluationCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; ttlMs: number } {
    return {
      size: this.evaluationCache.size,
      ttlMs: this.CACHE_TTL_MS
    };
  }
}
