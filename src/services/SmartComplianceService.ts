/**
 * Smart Compliance Service - Integration between rule engine and existing system
 * 
 * This service provides the bridge between the intelligent rule engine and the
 * existing compliance system, offering both smart task generation and fallback capabilities.
 */

import { RuleEngine } from './ruleEngine/RuleEngine';
import { RuleLoader } from './ruleEngine/RuleLoader';
import { ComplianceService } from './complianceService';
import { Task } from '@/hooks/useComplianceTasks';
import { GeneratedTask, RuleEngineResult, RuleEngineConfig } from './ruleEngine/types';
import { toast } from 'sonner';

/**
 * Service configuration options
 */
export interface SmartComplianceConfig {
  enableRuleEngine: boolean;
  enableFallback: boolean;
  enableCaching: boolean;
  debugMode: boolean;
  maxTasksPerUser: number;
  cacheExpirationMinutes: number;
}

/**
 * Task generation result
 */
export interface TaskGenerationResult {
  tasks: Task[];
  source: 'rule-engine' | 'fallback' | 'hybrid';
  generatedAt: Date;
  performance?: {
    executionTimeMs: number;
    rulesEvaluated: number;
    rulesMatched: number;
  };
  errors?: string[];
}

/**
 * Cache entry for task results
 */
interface TaskCacheEntry {
  tasks: Task[];
  generatedAt: Date;
  expiresAt: Date;
  source: string;
}

/**
 * Main Smart Compliance Service
 */
export class SmartComplianceService {
  private static instance: SmartComplianceService;
  private ruleEngine: RuleEngine | null = null;
  private ruleLoader: RuleLoader;
  private isInitialized = false;
  private taskCache = new Map<string, TaskCacheEntry>();
  
  private config: SmartComplianceConfig = {
    enableRuleEngine: true,
    enableFallback: true,
    enableCaching: true,
    debugMode: false,
    maxTasksPerUser: 50,
    cacheExpirationMinutes: 10
  };

  private constructor(config?: Partial<SmartComplianceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.ruleLoader = new RuleLoader();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<SmartComplianceConfig>): SmartComplianceService {
    if (!SmartComplianceService.instance) {
      SmartComplianceService.instance = new SmartComplianceService(config);
    }
    return SmartComplianceService.instance;
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.config.debugMode) {
        console.log('🚀 Initializing Smart Compliance Service...');
      }

      // Load rules
      const rules = await this.ruleLoader.loadAllRules();
      
      if (this.config.debugMode) {
        console.log(`📋 Loaded ${rules.length} compliance rules`);
      }

      // Initialize rule engine
      const ruleEngineConfig: RuleEngineConfig = {
        enableSmartDates: true,
        enableDependencies: true,
        enableUniversityOverrides: true,
        enableAutoCompletion: true,
        maxTasksPerEvaluation: this.config.maxTasksPerUser,
        cacheEvaluationResults: this.config.enableCaching,
        debugMode: this.config.debugMode,
        performanceTracking: true
      };

      this.ruleEngine = RuleEngine.getInstance(ruleEngineConfig);
      await this.ruleEngine.loadRules(rules);

      this.isInitialized = true;
      
      if (this.config.debugMode) {
        console.log('✅ Smart Compliance Service initialized successfully');
      }

    } catch (error) {
      console.error('❌ Failed to initialize Smart Compliance Service:', error);
      
      if (!this.config.enableFallback) {
        throw error;
      }
      
      console.warn('⚠️ Continuing with fallback mode only');
    }
  }

  /**
   * Generate intelligent compliance tasks for user
   */
  public async generateSmartTasks(userId: string): Promise<TaskGenerationResult> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedTasks(userId);
        if (cached) {
          return {
            tasks: cached.tasks,
            source: cached.source as any,
            generatedAt: cached.generatedAt
          };
        }
      }

      // Ensure service is initialized
      await this.initialize();

      // Try rule engine first
      if (this.config.enableRuleEngine && this.ruleEngine) {
        try {
          const result = await this.generateWithRuleEngine(userId);
          
          const taskResult: TaskGenerationResult = {
            tasks: result.tasks,
            source: 'rule-engine',
            generatedAt: new Date(),
            performance: {
              executionTimeMs: Date.now() - startTime,
              rulesEvaluated: result.performance?.totalRulesEvaluated || 0,
              rulesMatched: result.performance?.rulesMatched || 0
            }
          };

          // Cache the results
          if (this.config.enableCaching) {
            this.cacheTaskResult(userId, taskResult);
          }

          if (this.config.debugMode) {
            console.log(`✅ Generated ${result.tasks.length} smart tasks for user ${userId}`);
          }

          return taskResult;

        } catch (ruleEngineError) {
          console.error('Rule engine failed:', ruleEngineError);
          
          if (!this.config.enableFallback) {
            throw ruleEngineError;
          }
          
          // Fall back to existing system
          console.warn('🔄 Falling back to existing compliance system');
        }
      }

      // Fallback to existing system
      if (this.config.enableFallback) {
        const fallbackTasks = await this.generateWithFallback(userId);
        
        const taskResult: TaskGenerationResult = {
          tasks: fallbackTasks,
          source: 'fallback',
          generatedAt: new Date(),
          performance: {
            executionTimeMs: Date.now() - startTime,
            rulesEvaluated: 0,
            rulesMatched: 0
          }
        };

        // Cache fallback results too
        if (this.config.enableCaching) {
          this.cacheTaskResult(userId, taskResult);
        }

        return taskResult;
      }

      // No fallback enabled and rule engine failed
      throw new Error('Smart compliance generation failed and fallback is disabled');

    } catch (error) {
      console.error('❌ Task generation failed completely:', error);
      
      // Return empty result as last resort
      return {
        tasks: [],
        source: 'fallback',
        generatedAt: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Generate tasks using the rule engine
   */
  private async generateWithRuleEngine(userId: string): Promise<{ tasks: Task[]; performance?: any }> {
    if (!this.ruleEngine) {
      throw new Error('Rule engine not initialized');
    }

    // Evaluate rules for user
    const ruleResult: RuleEngineResult = await this.ruleEngine.evaluateRulesForUser(userId);

    // Convert generated tasks to app Task format
    const tasks = ruleResult.generatedTasks.map(task => this.convertToAppTask(task));

    // Limit tasks if configured
    const limitedTasks = tasks.slice(0, this.config.maxTasksPerUser);

    // Optionally save to database
    if (limitedTasks.length > 0) {
      await this.saveTasksToDatabase(userId, limitedTasks);
    }

    return {
      tasks: limitedTasks,
      performance: ruleResult.performance
    };
  }

  /**
   * Generate tasks using existing system (fallback)
   */
  private async generateWithFallback(userId: string): Promise<Task[]> {
    try {
      return await ComplianceService.fetchTasks(userId);
    } catch (error) {
      console.error('Fallback system also failed:', error);
      return [];
    }
  }

  /**
   * Convert rule engine generated task to app Task format
   */
  private convertToAppTask(generatedTask: GeneratedTask): Task {
    return {
      id: `rule-${generatedTask.ruleId}-${Date.now()}`,
      title: generatedTask.title,
      description: generatedTask.description,
      dueDate: generatedTask.dueDate,
      deadline: generatedTask.deadline,
      completed: generatedTask.completed,
      category: generatedTask.category as any,
      priority: generatedTask.priority,
      phase: generatedTask.phase,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRecurring: generatedTask.isRecurring,
      recurringInterval: generatedTask.recurringInterval
    };
  }

  /**
   * Save generated tasks to database
   */
  private async saveTasksToDatabase(userId: string, tasks: Task[]): Promise<void> {
    try {
      // For now, we'll just log that we would save these
      // In a full implementation, you'd save to the compliance_tasks table
      if (this.config.debugMode) {
        console.log(`💾 Would save ${tasks.length} tasks to database for user ${userId}`);
      }

      // TODO: Implement actual database saving
      // const saveTasks = tasks.map(task => ComplianceService.createTask({
      //   user_id: userId,
      //   title: task.title,
      //   description: task.description,
      //   due_date: task.dueDate,
      //   priority: task.priority,
      //   category: task.category,
      //   phase: task.phase || 'general',
      //   is_completed: task.completed
      // }));
      // 
      // await Promise.allSettled(saveTasks);

    } catch (error) {
      console.error('Failed to save tasks to database:', error);
      // Don't throw - saving to DB is optional
    }
  }

  /**
   * Cache task generation result
   */
  private cacheTaskResult(userId: string, result: TaskGenerationResult): void {
    const expirationMs = this.config.cacheExpirationMinutes * 60 * 1000;
    
    const cacheEntry: TaskCacheEntry = {
      tasks: result.tasks,
      generatedAt: result.generatedAt,
      expiresAt: new Date(Date.now() + expirationMs),
      source: result.source
    };

    this.taskCache.set(userId, cacheEntry);
  }

  /**
   * Get cached tasks if not expired
   */
  private getCachedTasks(userId: string): TaskCacheEntry | null {
    const entry = this.taskCache.get(userId);
    
    if (entry && entry.expiresAt > new Date()) {
      return entry;
    }
    
    // Remove expired entry
    if (entry) {
      this.taskCache.delete(userId);
    }
    
    return null;
  }

  /**
   * Clear cache for user
   */
  public clearUserCache(userId: string): void {
    this.taskCache.delete(userId);
  }

  /**
   * Clear all cache
   */
  public clearAllCache(): void {
    this.taskCache.clear();
  }

  /**
   * Get tasks by phase for user
   */
  public async getTasksByPhase(userId: string, phase: string): Promise<Task[]> {
    const result = await this.generateSmartTasks(userId);
    return result.tasks.filter(task => task.phase === phase);
  }

  /**
   * Get urgent tasks for user
   */
  public async getUrgentTasks(userId: string): Promise<Task[]> {
    const result = await this.generateSmartTasks(userId);
    return result.tasks.filter(task => task.priority === 'high');
  }

  /**
   * Get overdue tasks for user
   */
  public async getOverdueTasks(userId: string): Promise<Task[]> {
    const result = await this.generateSmartTasks(userId);
    const now = new Date();
    return result.tasks.filter(task => task.deadline && task.deadline < now && !task.completed);
  }

  /**
   * Refresh tasks for user (bypass cache)
   */
  public async refreshUserTasks(userId: string): Promise<TaskGenerationResult> {
    // Clear cache first
    this.clearUserCache(userId);
    
    // Generate fresh tasks
    return this.generateSmartTasks(userId);
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): {
    isInitialized: boolean;
    cacheEntries: number;
    ruleEngineAvailable: boolean;
    config: SmartComplianceConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      cacheEntries: this.taskCache.size,
      ruleEngineAvailable: this.ruleEngine !== null,
      config: { ...this.config }
    };
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<SmartComplianceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.debugMode) {
      console.log('🔧 Smart Compliance Service config updated:', newConfig);
    }
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      ruleEngine: boolean;
      ruleLoader: boolean;
      cache: boolean;
      fallback: boolean;
    };
    message: string;
  }> {
    const details = {
      ruleEngine: this.ruleEngine !== null && this.isInitialized,
      ruleLoader: true, // RuleLoader is always available
      cache: this.config.enableCaching,
      fallback: this.config.enableFallback
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'All systems operational';

    if (!details.ruleEngine) {
      if (details.fallback) {
        status = 'degraded';
        message = 'Rule engine unavailable, using fallback system';
      } else {
        status = 'unhealthy';
        message = 'Rule engine unavailable and no fallback configured';
      }
    }

    return { status, details, message };
  }
}

// Export a default instance for convenience
export const smartComplianceService = SmartComplianceService.getInstance();
