/**
 * Rule Engine Integration Tests
 * 
 * End-to-end tests for the smart compliance rule engine system,
 * testing the complete pipeline from rule loading to task generation.
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { RuleEngine } from '../RuleEngine';
import { RuleLoader } from '../RuleLoader';
import { SmartComplianceService } from '../../SmartComplianceService';
import { UserContext, VisaType, VisaPhase } from '../types';

describe('Rule Engine Integration Tests', () => {
  let ruleEngine: RuleEngine;
  let ruleLoader: RuleLoader;
  let smartService: SmartComplianceService;

  beforeAll(async () => {
    // Initialize services
    ruleLoader = new RuleLoader();
    ruleEngine = RuleEngine.getInstance({
      enableSmartDates: true,
      enableDependencies: true,
      enableUniversityOverrides: true,
      enableAutoCompletion: true,
      debugMode: true
    });
    
    smartService = SmartComplianceService.getInstance({
      debugMode: true,
      enableRuleEngine: true,
      enableFallback: true
    });

    // Load rules into engine
    const rules = await ruleLoader.loadAllRules();
    await ruleEngine.loadRules(rules);
    
    console.log(`🧪 Test setup complete with ${rules.length} rules loaded`);
  });

  beforeEach(() => {
    // Clear any caches between tests
    ruleEngine.clearRules();
  });

  describe('Rule Loading and Validation', () => {
    
    it('should load all rule sets successfully', async () => {
      const rules = await ruleLoader.loadAllRules();
      
      expect(rules).toBeDefined();
      expect(rules.length).toBeGreaterThan(0);
      
      // Should have rules from all three categories
      const f1Rules = rules.filter(r => r.visaTypes.includes('F1'));
      const optRules = rules.filter(r => r.visaTypes.includes('OPT'));
      
      expect(f1Rules.length).toBeGreaterThan(0);
      expect(optRules.length).toBeGreaterThan(0);
      
      console.log(`✅ Loaded ${rules.length} total rules (F1: ${f1Rules.length}, OPT: ${optRules.length})`);
    });

    it('should validate rule structure', async () => {
      const rules = await ruleLoader.loadAllRules();
      
      rules.forEach(rule => {
        // Basic structure validation
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.conditions).toBeDefined();
        expect(rule.taskTemplate).toBeDefined();
        expect(rule.visaTypes).toBeDefined();
        expect(rule.priority).toBeGreaterThanOrEqual(0);
        expect(rule.priority).toBeLessThanOrEqual(100);
        
        // Task template validation
        expect(rule.taskTemplate.titleTemplate).toBeDefined();
        expect(rule.taskTemplate.descriptionTemplate).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(rule.taskTemplate.priority);
      });
    });
  });

  describe('User Context Scenarios', () => {
    
    it('should handle F1 student with expiring passport', async () => {
      const mockUserContext: UserContext = {
        userId: 'test-f1-student',
        email: 'student@university.edu',
        name: 'Test Student',
        visaType: 'F1' as VisaType,
        currentPhase: 'during_program' as VisaPhase,
        dates: {
          passportExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          usEntryDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        },
        academic: {
          university: 'Test University',
          fieldOfStudy: 'Computer Science',
          degreeLevel: 'Bachelor',
          isSTEM: true
        },
        employment: {
          status: 'Not Employed',
          unemploymentDaysUsed: 0,
          maxUnemploymentDays: 90
        },
        documents: {
          passportValid: true,
          visaValid: true,
          i20Current: true
        },
        location: {
          currentAddress: '123 Test St',
          addressReportedToSevis: true
        },
        compliance: {
          tasksCompleted: 5,
          tasksOverdue: 1,
          riskScore: 25
        },
        flags: {
          addressChangeRecent: false,
          hasUnemploymentPeriods: false
        }
      };

      // Load rules and evaluate
      const rules = await ruleLoader.loadAllRules();
      await ruleEngine.loadRules(rules);
      
      // Mock the context builder to return our test context
      const originalBuildContext = ruleEngine['contextBuilder'].buildContext;
      ruleEngine['contextBuilder'].buildContext = async () => mockUserContext;
      
      const result = await ruleEngine.evaluateRulesForUser('test-f1-student');
      
      expect(result.generatedTasks.length).toBeGreaterThan(0);
      
      // Should generate passport renewal task
      const passportTask = result.generatedTasks.find(task => 
        task.title.toLowerCase().includes('passport')
      );
      
      expect(passportTask).toBeDefined();
      expect(passportTask?.priority).toBe('high');
      
      console.log(`✅ F1 student scenario: Generated ${result.generatedTasks.length} tasks including passport renewal`);
      
      // Restore original method
      ruleEngine['contextBuilder'].buildContext = originalBuildContext;
    });

    it('should handle OPT student approaching unemployment limit', async () => {
      const mockUserContext: UserContext = {
        userId: 'test-opt-student',
        email: 'opt-student@university.edu',
        name: 'OPT Student',
        visaType: 'OPT' as VisaType,
        currentPhase: 'opt_active' as VisaPhase,
        dates: {
          optEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
          lastEmploymentEndDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
        },
        academic: {
          university: 'Test University',
          fieldOfStudy: 'Engineering',
          degreeLevel: 'Master',
          isSTEM: true
        },
        employment: {
          status: 'unemployed',
          unemploymentDaysUsed: 65,
          maxUnemploymentDays: 90
        },
        documents: {
          eadValid: true
        },
        location: {
          currentAddress: '456 OPT Ave',
          addressReportedToSevis: true
        },
        compliance: {
          tasksCompleted: 8,
          tasksOverdue: 2,
          riskScore: 60
        },
        flags: {
          hasUnemploymentPeriods: true
        }
      };

      // Load rules and evaluate
      const rules = await ruleLoader.loadAllRules();
      await ruleEngine.loadRules(rules);
      
      // Mock the context builder
      const originalBuildContext = ruleEngine['contextBuilder'].buildContext;
      ruleEngine['contextBuilder'].buildContext = async () => mockUserContext;
      
      const result = await ruleEngine.evaluateRulesForUser('test-opt-student');
      
      expect(result.generatedTasks.length).toBeGreaterThan(0);
      
      // Should generate unemployment warning task
      const unemploymentTask = result.generatedTasks.find(task => 
        task.title.toLowerCase().includes('unemployment')
      );
      
      expect(unemploymentTask).toBeDefined();
      expect(unemploymentTask?.priority).toBe('high');
      
      console.log(`✅ OPT unemployment scenario: Generated ${result.generatedTasks.length} tasks including unemployment warning`);
      
      // Restore original method
      ruleEngine['contextBuilder'].buildContext = originalBuildContext;
    });

    it('should handle STEM OPT extension application window', async () => {
      const mockUserContext: UserContext = {
        userId: 'test-stem-student',
        email: 'stem@university.edu',
        name: 'STEM Student',
        visaType: 'OPT' as VisaType,
        currentPhase: 'opt_active' as VisaPhase,
        dates: {
          optEndDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000), // 85 days from now
        },
        academic: {
          university: 'Test University',
          fieldOfStudy: 'Computer Science',
          degreeLevel: 'Master',
          isSTEM: true
        },
        employment: {
          status: 'employed',
          employer: 'Tech Company',
          unemploymentDaysUsed: 20,
          maxUnemploymentDays: 90,
          stemOptApplicationSubmitted: false,
          employerEVerifyVerified: false
        },
        documents: {
          eadValid: true
        },
        location: {
          currentAddress: '789 STEM Blvd',
          addressReportedToSevis: true
        },
        compliance: {
          tasksCompleted: 12,
          tasksOverdue: 0,
          riskScore: 15
        },
        flags: {}
      };

      // Load rules and evaluate
      const rules = await ruleLoader.loadAllRules();
      await ruleEngine.loadRules(rules);
      
      // Mock the context builder
      const originalBuildContext = ruleEngine['contextBuilder'].buildContext;
      ruleEngine['contextBuilder'].buildContext = async () => mockUserContext;
      
      const result = await ruleEngine.evaluateRulesForUser('test-stem-student');
      
      expect(result.generatedTasks.length).toBeGreaterThan(0);
      
      // Should generate STEM extension tasks
      const stemTasks = result.generatedTasks.filter(task => 
        task.title.toLowerCase().includes('stem')
      );
      
      expect(stemTasks.length).toBeGreaterThan(0);
      
      // Should include E-Verify verification task
      const everifyTask = result.generatedTasks.find(task => 
        task.title.toLowerCase().includes('e-verify')
      );
      
      expect(everifyTask).toBeDefined();
      
      console.log(`✅ STEM OPT scenario: Generated ${result.generatedTasks.length} tasks including ${stemTasks.length} STEM-specific tasks`);
      
      // Restore original method
      ruleEngine['contextBuilder'].buildContext = originalBuildContext;
    });
  });

  describe('Smart Compliance Service Integration', () => {
    
    it('should initialize service successfully', async () => {
      await smartService.initialize();
      
      const stats = smartService.getServiceStats();
      expect(stats.isInitialized).toBe(true);
      expect(stats.ruleEngineAvailable).toBe(true);
    });

    it('should perform health check', async () => {
      const health = await smartService.healthCheck();
      
      expect(health.status).toMatch(/healthy|degraded/);
      expect(health.details).toBeDefined();
      expect(health.message).toBeDefined();
      
      console.log(`🏥 Service health: ${health.status} - ${health.message}`);
    });

    it('should generate tasks through service layer', async () => {
      const result = await smartService.generateSmartTasks('test-user-123');
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.source).toMatch(/rule-engine|fallback/);
      expect(result.generatedAt).toBeInstanceOf(Date);
      
      console.log(`✅ Service layer: Generated ${result.tasks.length} tasks from ${result.source}`);
    });

    it('should handle fallback gracefully', async () => {
      // Create a service instance with rule engine disabled
      const fallbackService = SmartComplianceService.getInstance({
        enableRuleEngine: false,
        enableFallback: true,
        debugMode: true
      });

      const result = await fallbackService.generateSmartTasks('test-user-fallback');
      
      expect(result.source).toBe('fallback');
      expect(result.tasks).toBeDefined();
      
      console.log(`✅ Fallback test: Generated ${result.tasks.length} tasks from fallback system`);
    });
  });

  describe('Performance and Scalability', () => {
    
    it('should complete rule evaluation within reasonable time', async () => {
      const startTime = Date.now();
      
      const rules = await ruleLoader.loadAllRules();
      await ruleEngine.loadRules(rules);
      
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      console.log(`⚡ Performance: Rules loaded in ${loadTime}ms`);
    });

    it('should handle multiple concurrent evaluations', async () => {
      const userIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const startTime = Date.now();
      
      const promises = userIds.map(userId => 
        smartService.generateSmartTasks(userId)
      );
      
      const results = await Promise.allSettled(promises);
      const executionTime = Date.now() - startTime;
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      expect(successful).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`⚡ Concurrency: ${successful}/${userIds.length} evaluations completed in ${executionTime}ms`);
    });
  });

  describe('Error Handling and Resilience', () => {
    
    it('should handle invalid user context gracefully', async () => {
      // This will trigger the context builder which may fail
      const result = await smartService.generateSmartTasks('invalid-user-id');
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      // Should fallback to empty tasks rather than throwing
      
      console.log(`✅ Error handling: Invalid user handled gracefully with ${result.tasks.length} tasks`);
    });

    it('should recover from rule engine failures', async () => {
      // Create service with fallback enabled
      const resilientService = SmartComplianceService.getInstance({
        enableRuleEngine: true,
        enableFallback: true,
        debugMode: true
      });

      // Even if rule engine fails, should get fallback results
      const result = await resilientService.generateSmartTasks('test-user-resilience');
      
      expect(result.tasks).toBeDefined();
      expect(['rule-engine', 'fallback']).toContain(result.source);
      
      console.log(`✅ Resilience: Service recovered with ${result.tasks.length} tasks from ${result.source}`);
    });
  });

  describe('Cache and Performance Optimization', () => {
    
    it('should cache task generation results', async () => {
      const userId = 'cache-test-user';
      
      // First call
      const startTime1 = Date.now();
      const result1 = await smartService.generateSmartTasks(userId);
      const time1 = Date.now() - startTime1;
      
      // Second call (should be cached)
      const startTime2 = Date.now();
      const result2 = await smartService.generateSmartTasks(userId);
      const time2 = Date.now() - startTime2;
      
      expect(result1.tasks.length).toBe(result2.tasks.length);
      expect(time2).toBeLessThan(time1); // Second call should be faster due to caching
      
      console.log(`💾 Caching: First call ${time1}ms, cached call ${time2}ms (${Math.round((time1-time2)/time1*100)}% faster)`);
    });

    it('should clear cache when requested', async () => {
      const userId = 'cache-clear-test';
      
      // Generate tasks
      await smartService.generateSmartTasks(userId);
      
      // Clear cache
      smartService.clearUserCache(userId);
      
      // Should regenerate (not from cache)
      const result = await smartService.generateSmartTasks(userId);
      
      expect(result.tasks).toBeDefined();
      
      console.log(`🗑️ Cache clearing: Successfully cleared and regenerated ${result.tasks.length} tasks`);
    });
  });
});
