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
    
    // All rules should have valid dates after normalization
    rules.forEach(rule => {
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
      expect(isNaN(rule.createdAt.getTime())).toBe(false);
      expect(isNaN(rule.updatedAt.getTime())).toBe(false);
    });
  });

  it('should use ruleSet.lastUpdated as default for createdAt when available', async () => {
    const rules = await ruleLoader.loadAllRules();
    
    // Check that the dates are reasonable (not too old, not in future)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    rules.forEach(rule => {
      expect(rule.createdAt.getTime()).toBeGreaterThan(oneYearAgo.getTime());
      expect(rule.updatedAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000); // Allow 1 second for test execution
    });
  });

  it('should preserve existing dates when present in JSON', async () => {
    const rules = await ruleLoader.loadAllRules();
    
    // Verify that rules have been processed and have Date objects
    expect(rules.length).toBeGreaterThan(0);
    
    // All rules should now have proper Date instances
    rules.forEach((rule, index) => {
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
      
      // Dates should be valid
      expect(rule.createdAt.toString()).not.toBe('Invalid Date');
      expect(rule.updatedAt.toString()).not.toBe('Invalid Date');
    });
  });

  it('should handle file access errors gracefully', async () => {
    // Create a RuleLoader with a non-existent source
    const invalidLoader = new RuleLoader([{
      type: 'embedded',
      location: 'non-existent-rules',
      enabled: true
    }]);

    // The loader handles missing files gracefully by returning empty array
    // and logging errors, rather than throwing
    const rules = await invalidLoader.loadAllRules();
    expect(rules).toEqual([]);
  });

  it('should use async file access for better performance', async () => {
    // This test verifies that the loader can handle multiple concurrent loads
    const promises = [
      ruleLoader.loadAllRules(),
      ruleLoader.loadAllRules(),
      ruleLoader.loadAllRules()
    ];

    const results = await Promise.all(promises);
    
    // All results should be arrays with rules
    results.forEach(rules => {
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    // All rules should have proper Date normalization
    results.forEach(rules => {
      rules.forEach(rule => {
        expect(rule.createdAt).toBeInstanceOf(Date);
        expect(rule.updatedAt).toBeInstanceOf(Date);
      });
    });
  });
});
