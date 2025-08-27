import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleEngine } from './RuleEngine';
import {
  RuleDefinition,
  UserContext,
  VisaType,
  VisaPhase,
  RuleEngineResult,
} from './types';
import { ContextBuilder } from './ContextBuilder';

vi.mock('./ContextBuilder');

describe('RuleEngine Performance Test', () => {
  let ruleEngine: RuleEngine;

  const mockUserContext: UserContext = {
    userId: 'user-perf-test',
    email: 'test@example.com',
    visaType: 'F1',
    currentPhase: 'during_program',
    dates: {
      usEntryDate: new Date('2023-08-15'),
      graduationDate: new Date('2025-05-20'),
    },
    academic: {
      university: 'Test University',
      universityId: 'test-uni',
      isSTEM: true,
    },
    employment: {
      status: 'not_employed',
    },
    documents: {},
    location: {},
    compliance: {
      tasksCompleted: 0,
      tasksOverdue: 0,
    },
    flags: {},
  };

  const generateMockRules = (count: number): RuleDefinition[] => {
    const rules: RuleDefinition[] = [];
    for (let i = 0; i < count; i++) {
      rules.push({
        id: `rule-${i}`,
        name: `Performance Rule ${i}`,
        description: `This is a test rule.`,
        ruleGroup: 'employment',
        phase: 'during_program',
        visaTypes: ['F1'],
        conditions: [
          {
            field: 'academic.isSTEM',
            operator: 'equals',
            value: i % 2 === 0, // Alternate conditions
          },
        ],
        taskTemplate: {
          titleTemplate: `Task for rule ${i}`,
          descriptionTemplate: `Description for rule ${i}`,
          category: 'employment',
          priority: 'medium',
          dueDateConfig: {
            type: 'relative',
            baseDate: 'dates.usEntryDate',
            offset: `+${i}days`,
          },
        },
        priority: i,
        isActive: true,
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return rules;
  };

  beforeEach(() => {
    vi.spyOn(ContextBuilder.prototype, 'buildContext').mockResolvedValue(
      mockUserContext
    );
  });

  it('should evaluate a large number of rules within an acceptable time', async () => {
    ruleEngine = RuleEngine.getInstance({
      enableSmartDates: true,
      enableDependencies: false, // Disable for performance measurement
      enableUniversityOverrides: false,
      enableAutoCompletion: false,
      maxTasksPerEvaluation: 1000,
      cacheEvaluationResults: false,
      debugMode: false,
      performanceTracking: true,
    });

    const rules = generateMockRules(1000);
    await ruleEngine.loadRules(rules);

    console.time('evaluate-1000-rules');
    const result = await ruleEngine.evaluateRulesForUser('user-perf-test');
    console.timeEnd('evaluate-1000-rules');

    expect(result.generatedTasks.length).toBe(500); // Half the rules should match
    expect(result.performance.executionTimeMs).toBeLessThan(2000); // Expect to complete in under 2 seconds
  });

  it('should utilize cache for subsequent evaluations', async () => {
    ruleEngine = RuleEngine.getInstance({
      enableSmartDates: true,
      enableDependencies: false,
      enableUniversityOverrides: false,
      enableAutoCompletion: false,
      maxTasksPerEvaluation: 1000,
      cacheEvaluationResults: true,
      debugMode: false,
      performanceTracking: true,
    });

    const rules = generateMockRules(1000);
    await ruleEngine.loadRules(rules);

    // First run - populates the cache
    const firstResult = await ruleEngine.evaluateRulesForUser('user-perf-test');

    // Second run - should be faster due to cache
    const secondResult = await ruleEngine.evaluateRulesForUser('user-perf-test');

    expect(secondResult.performance.executionTimeMs).toBeLessThan(
      firstResult.performance.executionTimeMs
    );
  });
});
