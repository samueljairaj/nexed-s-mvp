/**
 * Rule Validation Tests
 * 
 * Tests to ensure rule definitions are well-formed and follow expected patterns.
 * These tests validate the sample rules without requiring the full rule engine.
 */

import { describe, it, expect } from 'vitest';
import { RuleLibraryUtils } from '../RuleLibrary';
import fs from 'fs';
import path from 'path';

const { RuleValidator, RuleAnalyzer, sampleRules } = RuleLibraryUtils;

describe('Rule Validation Tests', () => {
  
  describe('Sample Rule Definitions', () => {
    
    it('should have valid passport renewal rule', () => {
      const rule = sampleRules.passportRenewalUrgent;
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(rule.id).toBe('f1-passport-renewal-urgent');
      expect(rule.priority).toBe(90);
      expect(rule.visaTypes).toContain('F1');
    });
    
    it('should have valid OPT application rule', () => {
      const rule = sampleRules.optApplicationWindow;
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(rule.taskTemplate.dependsOn).toContain('f1-meet-dso-opt');
      expect(rule.conditions).toHaveLength(3);
    });
    
    it('should have valid STEM extension rule', () => {
      const rule = sampleRules.stemExtensionDeadline;
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(rule.priority).toBe(95); // Highest priority
      expect(rule.tags).toContain('urgent');
    });
    
    it('should have valid unemployment tracking rule', () => {
      const rule = sampleRules.optUnemploymentTracking;
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(rule.conditions[0].value).toBe(60); // Trigger at 60 days
    });
  });
  
  describe('Rule Structure Validation', () => {
    
    it('should validate required fields', () => {
      const invalidRule = {
        // Missing required fields
        name: 'Test Rule',
        conditions: [],
        taskTemplate: null
      };
      
      const validation = RuleValidator.validateRule(invalidRule as any);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Rule must have a valid string id');
      expect(validation.errors).toContain('Rule must have at least one condition');
      expect(validation.errors).toContain('Rule must have a taskTemplate');
    });
    
    it('should validate priority range', () => {
      const rule = {
        ...sampleRules.passportRenewalUrgent,
        priority: 150 // Invalid priority
      };
      
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Priority must be a number between 0 and 100');
    });
    
    it('should validate task template priority', () => {
      const rule = {
        ...sampleRules.passportRenewalUrgent,
        taskTemplate: {
          ...sampleRules.passportRenewalUrgent.taskTemplate,
          priority: 'invalid' as any
        }
      };
      
      const validation = RuleValidator.validateRule(rule);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Task template priority must be low, medium, or high');
    });
  });
  
  describe('Template Placeholder Validation', () => {
    
    it('should extract placeholders correctly', () => {
      const template = "Your passport expires on {dates.passportExpiryDate} ({#days_until_expiry} days). Status: {?academic.isSTEM:STEM:Regular}";
      
      const placeholders = RuleValidator.extractPlaceholders(template);
      
      expect(placeholders).toContain('dates.passportExpiryDate');
      expect(placeholders).toContain('days_until_expiry');
      expect(placeholders).toContain('academic.isSTEM:STEM:Regular');
    });
    
    it('should validate template placeholders', () => {
      const rule = sampleRules.passportRenewalUrgent;
      const validation = RuleValidator.validateTemplatePlaceholders(rule);
      
      if (!validation.valid) {
        console.log('Template validation issues:', validation.issues);
        console.log('Title template:', rule.taskTemplate.titleTemplate);
        console.log('Description template:', rule.taskTemplate.descriptionTemplate.substring(0, 200) + '...');
      }
      
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
    
    it('should detect placeholder issues', () => {
      const rule = {
        ...sampleRules.passportRenewalUrgent,
        taskTemplate: {
          ...sampleRules.passportRenewalUrgent.taskTemplate,
          titleTemplate: 'Days until expiry: {days_until_expiry}', // Missing # prefix
          descriptionTemplate: 'User name: {user.name}' // Correct format
        }
      };
      
      const validation = RuleValidator.validateTemplatePlaceholders(rule);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('Calculated placeholder missing # prefix: days_until_expiry');
    });
  });
  
  describe('JSON Rule Files Validation', () => {
    
    const ruleFiles = [
      'f1-student-rules.json',
      'opt-rules.json', 
      'stem-opt-rules.json'
    ];
    
    ruleFiles.forEach(filename => {
      it(`should have valid JSON structure in ${filename}`, () => {
        const filePath = path.join(__dirname, '..', 'sampleRules', filename);
        
        // Check if file exists
        expect(fs.existsSync(filePath)).toBe(true);
        
        // Parse JSON
        const fileContent = fs.readFileSync(filePath, 'utf8');
        expect(() => JSON.parse(fileContent)).not.toThrow();
        
        const ruleSet = JSON.parse(fileContent);
        
        // Validate rule set structure
        expect(ruleSet).toHaveProperty('ruleSet');
        expect(ruleSet).toHaveProperty('rules');
        expect(Array.isArray(ruleSet.rules)).toBe(true);
        expect(ruleSet.rules.length).toBeGreaterThan(0);
      });
      
      it(`should have valid rules in ${filename}`, () => {
        const filePath = path.join(__dirname, '..', 'sampleRules', filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const ruleSet = JSON.parse(fileContent);
        
        const validation = RuleValidator.validateRuleSet(ruleSet);
        
        if (!validation.valid) {
          console.log(`Validation errors in ${filename}:`, validation.errors);
        }
        
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });
  });
  
  describe('Rule Analysis', () => {
    
    it('should analyze F1 student rules', () => {
      const filePath = path.join(__dirname, '..', 'sampleRules', 'f1-student-rules.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ruleSet = JSON.parse(fileContent);
      
      const analysis = RuleAnalyzer.analyzeRuleSet(ruleSet);
      
      expect(analysis.totalRules).toBeGreaterThan(0);
      expect(analysis.rulesByGroup).toHaveProperty('documents');
      expect(analysis.rulesByGroup).toHaveProperty('employment');
      expect(analysis.rulesByVisa).toHaveProperty('F1');
      expect(analysis.averagePriority).toBeGreaterThan(0);
    });
    
    it('should analyze OPT rules', () => {
      const filePath = path.join(__dirname, '..', 'sampleRules', 'opt-rules.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ruleSet = JSON.parse(fileContent);
      
      const analysis = RuleAnalyzer.analyzeRuleSet(ruleSet);
      
      expect(analysis.totalRules).toBeGreaterThan(0);
      expect(analysis.rulesByGroup).toHaveProperty('employment');
      expect(analysis.rulesByVisa).toHaveProperty('OPT');
      expect(analysis.uniqueTags).toContain('unemployment');
    });
    
    it('should analyze STEM OPT rules', () => {
      const filePath = path.join(__dirname, '..', 'sampleRules', 'stem-opt-rules.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ruleSet = JSON.parse(fileContent);
      
      const analysis = RuleAnalyzer.analyzeRuleSet(ruleSet);
      
      expect(analysis.totalRules).toBeGreaterThan(0);
      expect(analysis.rulesByGroup).toHaveProperty('employment');
      expect(analysis.uniqueTags).toContain('stem');
      expect(analysis.rulesWithDependencies).toBeGreaterThan(0);
    });
  });
  
  describe('Rule Content Quality', () => {
    
    it('should have meaningful rule descriptions', () => {
      Object.values(sampleRules).forEach(rule => {
        expect(rule.description.length).toBeGreaterThan(20);
        expect(rule.description).not.toMatch(/lorem ipsum/i);
      });
    });
    
    it('should have actionable task templates', () => {
      Object.values(sampleRules).forEach(rule => {
        const template = rule.taskTemplate;
        
        // Title should be descriptive
        expect(template.titleTemplate.length).toBeGreaterThan(10);
        
        // Description should provide guidance
        expect(template.descriptionTemplate.length).toBeGreaterThan(50);
        expect(template.descriptionTemplate).toMatch(/\*\*.*\*\*/); // Should have bold text for emphasis
        
        // Should have clear category
        expect(['immigration', 'employment', 'reporting', 'travel', 'academic', 'financial']).toContain(template.category);
      });
    });
    
    it('should have appropriate tags', () => {
      Object.values(sampleRules).forEach(rule => {
        expect(Array.isArray(rule.tags)).toBe(true);
        expect(rule.tags.length).toBeGreaterThan(0);
        
        // Tags should be lowercase and descriptive
        rule.tags.forEach(tag => {
          expect(tag).toMatch(/^[a-z0-9-]+$/);
          expect(tag.length).toBeGreaterThan(2);
        });
      });
    });
    
    it('should have logical priority assignments', () => {
      // High priority rules (80+) should have urgent or critical tags
      Object.values(sampleRules).forEach(rule => {
        if (rule.priority >= 80) {
          const hasUrgentTag = rule.tags.some(tag => 
            ['urgent', 'critical', 'high', 'deadline'].includes(tag)
          );
          expect(hasUrgentTag).toBe(true);
        }
      });
    });
  });
  
  describe('Rule Consistency', () => {
    
    it('should have consistent ID naming convention', () => {
      Object.values(sampleRules).forEach(rule => {
        // IDs should be kebab-case with visa type prefix
        expect(rule.id).toMatch(/^[a-z0-9]+-[a-z0-9-]+$/);
        expect(rule.id.length).toBeGreaterThan(5);
      });
    });
    
    it('should have consistent version numbering', () => {
      Object.values(sampleRules).forEach(rule => {
        expect(rule.version).toMatch(/^\d+\.\d+$/);
      });
    });
    
    it('should have consistent condition structures', () => {
      Object.values(sampleRules).forEach(rule => {
        rule.conditions.forEach(condition => {
          expect(condition).toHaveProperty('field');
          expect(condition).toHaveProperty('operator');
          
          if (condition.logicOperator) {
            expect(['AND', 'OR']).toContain(condition.logicOperator);
          }
        });
      });
    });
  });
});

describe('Rule Integration Readiness', () => {
  
  it('should be ready for rule engine integration', () => {
    // Verify all sample rules are valid
    Object.values(sampleRules).forEach(rule => {
      const validation = RuleValidator.validateRule(rule);
      expect(validation.valid).toBe(true);
    });
    
    // Verify no duplicate IDs
    const ids = Object.values(sampleRules).map(rule => rule.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    
    // Verify all JSON files are valid
    const ruleFiles = ['f1-student-rules.json', 'opt-rules.json', 'stem-opt-rules.json'];
    
    ruleFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'sampleRules', filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const ruleSet = JSON.parse(fileContent);
      const validation = RuleValidator.validateRuleSet(ruleSet);
      
      expect(validation.valid).toBe(true);
    });
  });
});
