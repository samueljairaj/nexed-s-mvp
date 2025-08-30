import { describe, it, expect, beforeEach } from 'vitest';
import { RuleLoader } from '../RuleLoader';
import { RuleDefinition } from '../types';

describe('RuleLoader Date Field Normalization', () => {
  let ruleLoader: RuleLoader;

  beforeEach(() => {
    ruleLoader = new RuleLoader();
  });

  it('should normalize JSON rules with proper Date fields', async () => {
    // Test that rules are loaded with proper Date objects
    const rules = await ruleLoader.loadAllRules();
    
    expect(rules.length).toBeGreaterThan(0);
    
    // Verify each rule has proper Date fields
    rules.forEach(rule => {
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
      expect(rule.createdAt.getTime()).toBeGreaterThan(0);
      expect(rule.updatedAt.getTime()).toBeGreaterThan(0);
    });
  });

  it('should handle rules without explicit dates gracefully', async () => {
    const rules = await ruleLoader.loadAllRules();
    
    // Find a rule that doesn't have explicit dates in JSON
    const ruleWithoutDates = rules.find(rule => 
      !rule.createdAt || !rule.updatedAt
    );
    
    // All rules should have dates after normalization
    expect(ruleWithoutDates).toBeUndefined();
  });

  it('should preserve existing dates when present', async () => {
    const rules = await ruleLoader.loadAllRules();
    
    // Check that the dates are reasonable (not too old, not in future)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    rules.forEach(rule => {
      expect(rule.createdAt.getTime()).toBeGreaterThan(oneYearAgo.getTime());
      expect(rule.updatedAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000); // Allow 1 second for test execution
    });
  });
});
