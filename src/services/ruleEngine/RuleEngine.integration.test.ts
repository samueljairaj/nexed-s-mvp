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
import { DependencyResolver } from './DependencyResolver';
import { RuleEvaluator } from './RuleEvaluator';

// Mock the helper classes
const mockUserContext: UserContext = {
  userId: 'user-123',
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

const mockBuildContext = vi.fn();
vi.mock('./ContextBuilder', () => ({
  ContextBuilder: vi.fn().mockImplementation(() => ({
    buildContext: mockBuildContext,
  })),
}));

const mockResolveDependencies = vi.fn();
vi.mock('./DependencyResolver', () => ({
  DependencyResolver: vi.fn().mockImplementation(() => ({
    resolveDependencies: mockResolveDependencies,
  })),
}));

const mockEvaluateConditions = vi.fn();
vi.mock('./RuleEvaluator', () => ({
  RuleEvaluator: vi.fn().mockImplementation(() => ({
    evaluateConditions: mockEvaluateConditions,
  })),
}));

describe('RuleEngine Integration Test', () => {
  let ruleEngine: RuleEngine;

  const mockRules: RuleDefinition[] = [
    {
      id: 'rule-1',
      name: 'CPT Reminder',
      description: 'Reminds students about CPT application.',
      ruleGroup: 'employment',
      phase: 'during_program',
      visaTypes: ['F1'],
      conditions: [
        {
          field: 'academic.isSTEM',
          operator: 'equals',
          value: true,
        },
      ],
      taskTemplate: {
        titleTemplate: 'Consider applying for CPT',
        descriptionTemplate:
          'CPT can be a great way to gain work experience.',
        category: 'employment',
        priority: 'medium',
        dueDateConfig: {
          type: 'relative',
          baseDate: 'dates.usEntryDate',
          offset: '+90days',
        },
      },
      priority: 10,
      isActive: true,
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockBuildContext.mockResolvedValue(mockUserContext);
    mockResolveDependencies.mockImplementation(async (tasks) => tasks);
    mockEvaluateConditions.mockResolvedValue([{ passed: true, condition: mockRules[0].conditions[0], actualValue: true, expectedValue: true }]);


    // Get a fresh instance of the RuleEngine for each test
    ruleEngine = RuleEngine.getInstance({
      enableSmartDates: true,
      enableDependencies: true,
      enableUniversityOverrides: true,
      enableAutoCompletion: true,
      maxTasksPerEvaluation: 50,
      cacheEvaluationResults: false,
      debugMode: true,
      performanceTracking: true,
    });
  });

  it('should evaluate rules and generate a task for a matching user', async () => {
    await ruleEngine.loadRules(mockRules);
    const result: RuleEngineResult = await ruleEngine.evaluateRulesForUser(
      'user-123'
    );

    expect(result.generatedTasks.length).toBe(1);
    const task = result.generatedTasks[0];
    expect(task.title).toBe('Consider applying for CPT');
    expect(task.ruleId).toBe('rule-1');
  });

  it('should handle fallback when dependency resolution fails', async () => {
    const dependencyError = new Error('Dependency cycle detected');
    mockResolveDependencies.mockRejectedValue(dependencyError);

    await ruleEngine.loadRules(mockRules);
    const result: RuleEngineResult = await ruleEngine.evaluateRulesForUser(
      'user-123'
    );

    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Dependency resolution failed');
    // Still expect tasks to be generated, just not sorted
    expect(result.generatedTasks.length).toBe(1);
  });

  it('should not generate a task if conditions are not met', async () => {
    mockEvaluateConditions.mockResolvedValue([{ passed: false, reason: 'isSTEM is false', condition: mockRules[0].conditions[0], actualValue: false, expectedValue: true }]);

    await ruleEngine.loadRules(mockRules);
    const result: RuleEngineResult = await ruleEngine.evaluateRulesForUser(
      'user-123'
    );

    expect(result.generatedTasks.length).toBe(0);
  });

  it('should handle invalid user data gracefully', async () => {
    const invalidUserContext: any = {
      userId: 'user-invalid',
      visaType: 'F1',
      currentPhase: 'during_program',
      academic: {},
      // Missing other required data
    };
    mockBuildContext.mockResolvedValue(invalidUserContext);

    await ruleEngine.loadRules(mockRules);

    const result = await ruleEngine.evaluateRulesForUser('user-invalid');
    expect(result.generatedTasks.length).toBe(0);
  });

  it('should return an empty result when no rules are loaded', async () => {
    ruleEngine.clearRules(); // Ensure no rules are loaded
    const result = await ruleEngine.evaluateRulesForUser('user-123');
    expect(result.generatedTasks.length).toBe(0);
    expect(result.ruleResults.length).toBe(0);
  });

  it('should handle concurrent evaluations for different users', async () => {
    const user1Context = { ...mockUserContext, userId: 'user1' };
    const user2Context = { ...mockUserContext, userId: 'user2', academic: { ...mockUserContext.academic, isSTEM: false } };

    mockBuildContext
      .mockResolvedValueOnce(user1Context)
      .mockResolvedValueOnce(user2Context);

    mockEvaluateConditions
      .mockResolvedValueOnce([{ passed: true, condition: mockRules[0].conditions[0], actualValue: true, expectedValue: true }])
      .mockResolvedValueOnce([{ passed: false, reason: 'isSTEM is false', condition: mockRules[0].conditions[0], actualValue: false, expectedValue: true }]);

    await ruleEngine.loadRules(mockRules);

    const [result1, result2] = await Promise.all([
      ruleEngine.evaluateRulesForUser('user1'),
      ruleEngine.evaluateRulesForUser('user2'),
    ]);

    expect(result1.generatedTasks.length).toBe(1);
    expect(result1.userId).toBe('user1');
    expect(result2.generatedTasks.length).toBe(0);
    expect(result2.userId).toBe('user2');
  });

  it('should handle errors during rule evaluation gracefully', async () => {
    mockEvaluateConditions.mockRejectedValue(new Error('Big boom'));

    await ruleEngine.loadRules(mockRules);
    const result = await ruleEngine.evaluateRulesForUser('user-123');

    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Failed to evaluate rule rule-1: Big boom');
    expect(result.generatedTasks.length).toBe(0);
  });
});
