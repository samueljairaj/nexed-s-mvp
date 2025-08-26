/**
 * Smart Compliance Hook - React integration for intelligent compliance
 * 
 * This hook provides React components with access to the smart compliance system,
 * offering enhanced task management with intelligent rule-based generation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SmartComplianceService, TaskGenerationResult } from '@/services/SmartComplianceService';
import { Task } from '@/hooks/useComplianceTasks';
import { toast } from 'sonner';

/**
 * Hook configuration options
 */
export interface UseSmartComplianceOptions {
  enableAutoRefresh?: boolean;
  refreshIntervalMinutes?: number;
  enableNotifications?: boolean;
  debugMode?: boolean;
}

/**
 * Hook return type
 */
export interface UseSmartComplianceReturn {
  // Core data
  tasks: Task[];
  isLoading: boolean;
  isGenerating: boolean;
  lastGeneratedAt: Date | null;
  source: 'rule-engine' | 'fallback' | 'hybrid' | null;
  
  // Actions
  generateSmartTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  clearCache: () => void;
  
  // Enhanced queries
  getTasksByPhase: (phase: string) => Task[];
  getUrgentTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByCategory: (category: string) => Task[];
  
  // Statistics
  getTaskStats: () => {
    total: number;
    completed: number;
    overdue: number;
    urgent: number;
    byPhase: { [phase: string]: number };
    byCategory: { [category: string]: number };
  };
  
  // Service info
  serviceHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    ruleEngineAvailable: boolean;
    fallbackAvailable: boolean;
  };
  
  // Performance metrics
  performance: {
    executionTimeMs: number;
    rulesEvaluated: number;
    rulesMatched: number;
  } | null;
  
  // Errors
  errors: string[];
}

/**
 * Smart Compliance Hook
 */
export const useSmartCompliance = (options: UseSmartComplianceOptions = {}): UseSmartComplianceReturn => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);
  const [source, setSource] = useState<'rule-engine' | 'fallback' | 'hybrid' | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [serviceHealth, setServiceHealth] = useState({
    status: 'healthy' as const,
    ruleEngineAvailable: true,
    fallbackAvailable: true
  });

  // Configuration with defaults
  const config = {
    enableAutoRefresh: options.enableAutoRefresh ?? false,
    refreshIntervalMinutes: options.refreshIntervalMinutes ?? 30,
    enableNotifications: options.enableNotifications ?? true,
    debugMode: options.debugMode ?? false,
    ...options
  };

  // Get smart compliance service instance
  const smartService = SmartComplianceService.getInstance({
    debugMode: config.debugMode,
    enableRuleEngine: true,
    enableFallback: true,
    enableCaching: true
  });

  /**
   * Generate smart tasks for current user
   */
  const generateSmartTasks = useCallback(async () => {
    if (!currentUser?.id) {
      if (config.debugMode) {
        console.log('👤 No current user, skipping task generation');
      }
      return;
    }

    setIsGenerating(true);
    setErrors([]);

    try {
      if (config.debugMode) {
        console.log(`🚀 Generating smart tasks for user: ${currentUser.id}`);
      }

      const result: TaskGenerationResult = await smartService.generateSmartTasks(currentUser.id);
      
      setTasks(result.tasks);
      setLastGeneratedAt(result.generatedAt);
      setSource(result.source);
      setPerformance(result.performance || null);
      
      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors);
        
        if (config.enableNotifications) {
          toast.warning('Some tasks may not be up to date', {
            description: 'Using cached or fallback data'
          });
        }
      } else if (config.enableNotifications && result.tasks.length > 0) {
        toast.success(`Generated ${result.tasks.length} personalized compliance tasks`, {
          description: `Source: ${result.source}`
        });
      }

      if (config.debugMode) {
        console.log(`✅ Generated ${result.tasks.length} tasks from ${result.source}`, {
          performance: result.performance,
          errors: result.errors
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors([errorMessage]);
      
      console.error('❌ Failed to generate smart tasks:', error);
      
      if (config.enableNotifications) {
        toast.error('Failed to generate compliance tasks', {
          description: errorMessage
        });
      }
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  }, [currentUser?.id, config.debugMode, config.enableNotifications, smartService]);

  /**
   * Refresh tasks (bypass cache)
   */
  const refreshTasks = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      if (config.debugMode) {
        console.log('🔄 Refreshing tasks (bypassing cache)');
      }

      const result = await smartService.refreshUserTasks(currentUser.id);
      
      setTasks(result.tasks);
      setLastGeneratedAt(result.generatedAt);
      setSource(result.source);
      setPerformance(result.performance || null);

      if (config.enableNotifications) {
        toast.success('Tasks refreshed successfully');
      }

    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      
      if (config.enableNotifications) {
        toast.error('Failed to refresh tasks');
      }
    }
  }, [currentUser?.id, config.debugMode, config.enableNotifications, smartService]);

  /**
   * Clear cache for current user
   */
  const clearCache = useCallback(() => {
    if (currentUser?.id) {
      smartService.clearUserCache(currentUser.id);
      
      if (config.enableNotifications) {
        toast.info('Task cache cleared');
      }
    }
  }, [currentUser?.id, config.enableNotifications, smartService]);

  /**
   * Enhanced query functions
   */
  const getTasksByPhase = useCallback((phase: string): Task[] => {
    return tasks.filter(task => task.phase === phase);
  }, [tasks]);

  const getUrgentTasks = useCallback((): Task[] => {
    return tasks.filter(task => task.priority === 'high');
  }, [tasks]);

  const getOverdueTasks = useCallback((): Task[] => {
    const now = new Date();
    return tasks.filter(task => 
      task.deadline && 
      task.deadline < now && 
      !task.completed
    );
  }, [tasks]);

  const getCompletedTasks = useCallback((): Task[] => {
    return tasks.filter(task => task.completed);
  }, [tasks]);

  const getTasksByCategory = useCallback((category: string): Task[] => {
    return tasks.filter(task => task.category === category);
  }, [tasks]);

  /**
   * Get task statistics
   */
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = getCompletedTasks().length;
    const overdue = getOverdueTasks().length;
    const urgent = getUrgentTasks().length;

    // Group by phase
    const byPhase: { [phase: string]: number } = {};
    tasks.forEach(task => {
      const phase = task.phase || 'general';
      byPhase[phase] = (byPhase[phase] || 0) + 1;
    });

    // Group by category
    const byCategory: { [category: string]: number } = {};
    tasks.forEach(task => {
      const category = task.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      total,
      completed,
      overdue,
      urgent,
      byPhase,
      byCategory
    };
  }, [tasks, getCompletedTasks, getOverdueTasks, getUrgentTasks]);

  /**
   * Check service health
   */
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await smartService.healthCheck();
      
      setServiceHealth({
        status: health.status,
        ruleEngineAvailable: health.details.ruleEngine,
        fallbackAvailable: health.details.fallback
      });

      if (config.debugMode) {
        console.log('🏥 Service health check:', health);
      }

    } catch (error) {
      setServiceHealth({
        status: 'unhealthy',
        ruleEngineAvailable: false,
        fallbackAvailable: false
      });
      
      console.error('Health check failed:', error);
    }
  }, [smartService, config.debugMode]);

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (!config.enableAutoRefresh || !currentUser?.id) {
      return;
    }

    const intervalMs = config.refreshIntervalMinutes * 60 * 1000;
    const interval = setInterval(() => {
      if (config.debugMode) {
        console.log('🔄 Auto-refreshing smart compliance tasks');
      }
      generateSmartTasks();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.enableAutoRefresh, config.refreshIntervalMinutes, currentUser?.id, generateSmartTasks, config.debugMode]);

  /**
   * Initial load effect
   */
  useEffect(() => {
    if (currentUser?.id) {
      generateSmartTasks();
      checkServiceHealth();
    }
  }, [currentUser?.id, generateSmartTasks, checkServiceHealth]);

  /**
   * Service health monitoring effect
   */
  useEffect(() => {
    // Check service health periodically
    const healthCheckInterval = setInterval(checkServiceHealth, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(healthCheckInterval);
  }, [checkServiceHealth]);

  return {
    // Core data
    tasks,
    isLoading,
    isGenerating,
    lastGeneratedAt,
    source,
    
    // Actions
    generateSmartTasks,
    refreshTasks,
    clearCache,
    
    // Enhanced queries
    getTasksByPhase,
    getUrgentTasks,
    getOverdueTasks,
    getCompletedTasks,
    getTasksByCategory,
    
    // Statistics
    getTaskStats,
    
    // Service info
    serviceHealth,
    
    // Performance metrics
    performance,
    
    // Errors
    errors
  };
};
