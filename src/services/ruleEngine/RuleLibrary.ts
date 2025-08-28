/**
 * Rule Library - Sample Rule Definitions and Validation
 * 
 * This file provides TypeScript definitions of the sample rules and validation
 * utilities to ensure rule integrity and proper structure.
 */

// Note: These types will eventually be imported from the main rule engine
// For now, we define simplified versions for validation

interface RuleCondition {
  field: string;
  operator: string;
  value?: any;
  timeValue?: string;
  logicOperator?: 'AND' | 'OR';
  nested?: RuleCondition[];
}

interface TaskTemplate {
  titleTemplate: string;
  descriptionTemplate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDateConfig: {
    type: string;
    calculation?: string;
    baseDate?: string;
    offset?: string;
  };
  dependsOn?: string[];
}

interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  ruleGroup: string;
  phase: string | string[];
  visaTypes: string[];
  priority: number;
  conditions: RuleCondition[];
  taskTemplate: TaskTemplate;
  isActive: boolean;
  tags: string[];
  version: string;
}

interface RuleSet {
  ruleSet: {
    name: string;
    description: string;
    version: string;
    lastUpdated: string;
  };
  rules: RuleDefinition[];
}

/**
 * Sample rule definitions demonstrating intelligent compliance guidance
 */
export const sampleRules = {
  
  /**
   * Critical F1 passport renewal rule
   */
  passportRenewalUrgent: {
    id: "f1-passport-renewal-urgent",
    name: "Passport Renewal - Urgent F1 Status Risk",
    description: "Intelligent passport renewal guidance with F1 status implications",
    ruleGroup: "documents",
    phase: ["during_program", "pre_graduation", "general"],
    visaTypes: ["F1"],
    priority: 90,
    conditions: [
      {
        field: "dates.passportExpiryDate",
        operator: "lessThan",
        timeValue: "6months",
        logicOperator: "AND"
      },
      {
        field: "visaType",
        operator: "equals",
        value: "F1"
      }
    ],
    taskTemplate: {
      titleTemplate: "🚨 Renew Passport - F1 Status at Risk",
      descriptionTemplate: `Your passport expires on {dates.passportExpiryDate} ({#days_until_passport_expiry} days). Renew immediately to maintain F1 status.

⚠️ **Critical**: Passports must be valid for 6+ months for:
• Travel authorization
• I-20 renewals
• Status maintenance
• Future visa applications

📋 **Next Steps**:
1. Apply for passport renewal at your country's consulate
2. Allow 4-8 weeks processing time
3. Update passport info in SEVIS once received`,
      category: "immigration",
      priority: "high" as const,
      dueDateConfig: {
        type: "calculated",
        calculation: "passport_renewal_urgent"
      }
    },
    isActive: true,
    tags: ["passport", "urgent", "f1-status"],
    version: "1.0"
  },

  /**
   * OPT application window rule
   */
  optApplicationWindow: {
    id: "f1-graduation-opt-window",
    name: "OPT Application Window Opens",
    description: "Smart OPT application timing with graduation-based calculation",
    ruleGroup: "employment",
    phase: ["pre_graduation"],
    visaTypes: ["F1"],
    priority: 75,
    conditions: [
      {
        field: "dates.graduationDate",
        operator: "exists",
        logicOperator: "AND"
      },
      {
        field: "dates.graduationDate",
        operator: "lessThan",
        timeValue: "90days",
        logicOperator: "AND"
      },
      {
        field: "employment.optApplicationSubmitted",
        operator: "equals",
        value: false
      }
    ],
    taskTemplate: {
      titleTemplate: "🎓 OPT Application Window Now Open",
      descriptionTemplate: `You graduate on {dates.graduationDate} ({#days_until_graduation} days). Your OPT application window is now open!

📅 **Application Window**:
• **Opens**: 90 days before graduation
• **Closes**: 60 days after graduation
• **Recommended**: Apply ASAP for maximum work time

💼 **OPT Benefits**:
• 12 months of work authorization
• {?academic.isSTEM:Additional 24 months if STEM:Standard 12 months}
• Gain valuable US work experience
• Potential pathway to H1B

📋 **Required Documents**:
• Form I-765 (Application)
• I-20 with OPT recommendation
• $410 filing fee
• Passport-style photos

🏃‍♂️ **Next Steps**:
1. Meet with DSO for OPT recommendation
2. Gather required documents
3. Submit I-765 to USCIS

⏰ **Optimal Timeline**: Submit within next 2 weeks`,
      category: "employment",
      priority: "high" as const,
      dueDateConfig: {
        type: "calculated",
        calculation: "opt_application_window"
      },
      dependsOn: ["f1-meet-dso-opt"]
    },
    isActive: true,
    tags: ["opt", "graduation", "employment", "application"],
    version: "1.0"
  },

  /**
   * STEM OPT extension deadline rule
   */
  stemExtensionDeadline: {
    id: "stem-opt-application-window",
    name: "STEM OPT Extension Application Window",
    description: "Critical STEM extension timing with work authorization gap prevention",
    ruleGroup: "employment",
    phase: ["opt_active", "stem_application"],
    visaTypes: ["OPT"],
    priority: 95,
    conditions: [
      {
        field: "dates.optEndDate",
        operator: "lessThan",
        timeValue: "90days",
        logicOperator: "AND"
      },
      {
        field: "academic.isSTEM",
        operator: "equals",
        value: true,
        logicOperator: "AND"
      },
      {
        field: "employment.stemOptApplicationSubmitted",
        operator: "equals",
        value: false
      }
    ],
    taskTemplate: {
      titleTemplate: "🚀 STEM OPT Application Window Open - Apply Now!",
      descriptionTemplate: `Your OPT expires on {dates.optEndDate} ({#days_until_opt_expiry} days). Apply for STEM extension immediately!

🎓 **Your STEM Eligibility**:
• **Degree**: {academic.fieldOfStudy}
• **CIP Code**: {academic.cipCode}
• **University**: {academic.university}
• **STEM Verified**: ✅ Confirmed

⏰ **Critical Timeline**:
• **OPT Expires**: {dates.optEndDate}
• **Application Deadline**: Must apply within 90 days
• **Processing Time**: 3-5 months typical
• **Gap Risk**: Apply NOW to avoid work authorization gap

📋 **Required for Application**:
• Form I-765 with STEM documents
• Form I-983 (Training Plan)
• E-Verify employer confirmation
• $410 filing fee
• Current I-20 with STEM recommendation

💼 **Employer Requirements**:
• Must be enrolled in E-Verify
• Provide structured training program
• Complete Form I-983 training plan
• Commit to mentorship and evaluation

🏃‍♂️ **URGENT NEXT STEPS**:
1. Confirm employer E-Verify enrollment TODAY
2. Schedule DSO meeting this week
3. Complete I-983 with employer
4. Gather all required documents
5. Submit I-765 application ASAP

⚠️ **CRITICAL**: Delays can result in work authorization gaps!`,
      category: "employment",
      priority: "high" as const,
      dueDateConfig: {
        type: "calculated",
        calculation: "stem_extension_deadline"
      },
      dependsOn: ["stem-opt-everify-check", "stem-opt-i983-completion"]
    },
    isActive: true,
    tags: ["stem-extension", "application", "urgent", "deadline"],
    version: "1.0"
  },

  /**
   * Unemployment tracking rule for OPT
   */
  optUnemploymentTracking: {
    id: "opt-unemployment-tracking",
    name: "OPT Unemployment Days Alert",
    description: "Real-time unemployment tracking with status termination prevention",
    ruleGroup: "employment",
    phase: ["opt_active"],
    visaTypes: ["OPT"],
    priority: 95,
    conditions: [
      {
        field: "employment.unemploymentDaysUsed",
        operator: "greaterThan",
        value: 60,
        logicOperator: "AND"
      },
      {
        field: "employment.status",
        operator: "equals",
        value: "unemployed"
      }
    ],
    taskTemplate: {
      titleTemplate: "🚨 OPT Unemployment Limit Warning ({employment.unemploymentDaysUsed}/90 days used)",
      descriptionTemplate: `⚠️ **CRITICAL**: You've used {employment.unemploymentDaysUsed} of your 90 allowed unemployment days.

📊 **Your Status**:
• Days Used: {employment.unemploymentDaysUsed}/90
• Days Remaining: {#unemployment_days_remaining}
• Current Status: Unemployed since {dates.lastEmploymentEndDate}

🚨 **Immediate Action Required**:
• Find employment within {#unemployment_days_remaining} days
• Report new job to DSO within 10 days of starting
• Consider returning to school if no job prospects

💼 **Job Search Resources**:
• University career center
• Professional networking events
• LinkedIn job alerts
• Industry-specific job boards

📞 **DSO Contact**: {user.academic.dsoContact.name}
📧 **Email**: {user.academic.dsoContact.email}

⏰ **Status at Risk**: Exceeding 90 days terminates OPT authorization`,
      category: "employment",
      priority: "high" as const,
      dueDateConfig: {
        type: "calculated",
        calculation: "unemployment_grace_end"
      }
    },
    isActive: true,
    tags: ["unemployment", "critical", "job-search"],
    version: "1.0"
  }
};

/**
 * Rule validation utilities
 */
export class RuleValidator {
  
  /**
   * Validate a single rule definition
   */
  static validateRule(rule: RuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    if (!rule.id || typeof rule.id !== 'string') {
      errors.push('Rule must have a valid string id');
    }
    
    if (!rule.name || typeof rule.name !== 'string') {
      errors.push('Rule must have a valid name');
    }
    
    if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      errors.push('Rule must have at least one condition');
    }
    
    if (!rule.taskTemplate) {
      errors.push('Rule must have a taskTemplate');
    }
    
    if (!rule.visaTypes || !Array.isArray(rule.visaTypes) || rule.visaTypes.length === 0) {
      errors.push('Rule must specify applicable visa types');
    }
    
    // Priority validation
    if (typeof rule.priority !== 'number' || rule.priority < 0 || rule.priority > 100) {
      errors.push('Priority must be a number between 0 and 100');
    }
    
    // Task template validation
    if (rule.taskTemplate) {
      if (!rule.taskTemplate.titleTemplate) {
        errors.push('Task template must have a titleTemplate');
      }
      
      if (!rule.taskTemplate.descriptionTemplate) {
        errors.push('Task template must have a descriptionTemplate');
      }
      
      if (!['low', 'medium', 'high'].includes(rule.taskTemplate.priority)) {
        errors.push('Task template priority must be low, medium, or high');
      }
    }
    
    // Conditions validation
    rule.conditions?.forEach((condition, index) => {
      // If condition has nested conditions, validate those instead of expecting field/operator
      if (Array.isArray(condition.nested)) {
        if (condition.nested.length === 0) {
          errors.push(`Condition ${index} has an empty nested group`);
        }
        if (!condition.logicOperator) {
          errors.push(`Condition ${index} with nested group must specify a logicOperator (AND/OR)`);
        } else if (condition.logicOperator !== 'AND' && condition.logicOperator !== 'OR') {
          errors.push(`Condition ${index} logicOperator must be AND or OR`);
        }
        if (condition.field || condition.operator || 'value' in condition || 'timeValue' in condition) {
          errors.push(`Condition ${index} must not mix "field/operator/value/timeValue" with "nested" group`);
        }
        condition.nested.forEach((nestedCondition, nestedIndex) => {
          if (!nestedCondition.field) {
            errors.push(`Condition ${index} nested condition ${nestedIndex} must have a field`);
          }
          if (!nestedCondition.operator) {
            errors.push(`Condition ${index} nested condition ${nestedIndex} must have an operator`);
          }
        });
      } else {
        // Regular condition validation
        if (!condition.field) {
          errors.push(`Condition ${index} must have a field`);
        }
        
        if (!condition.operator) {
          errors.push(`Condition ${index} must have an operator`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a complete rule set
   */
  static validateRuleSet(ruleSet: RuleSet): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const ruleIds = new Set<string>();
    
    // Validate rule set metadata
    if (!ruleSet.ruleSet?.name) {
      errors.push('Rule set must have a name');
    }
    
    if (!ruleSet.rules || !Array.isArray(ruleSet.rules)) {
      errors.push('Rule set must contain an array of rules');
      return { valid: false, errors };
    }
    
    // Validate individual rules
    ruleSet.rules.forEach((rule, index) => {
      // Check for duplicate IDs
      if (ruleIds.has(rule.id)) {
        errors.push(`Duplicate rule ID found: ${rule.id}`);
      }
      ruleIds.add(rule.id);
      
      // Validate individual rule
      const ruleValidation = this.validateRule(rule);
      if (!ruleValidation.valid) {
        errors.push(`Rule ${index} (${rule.id}): ${ruleValidation.errors.join(', ')}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Extract all placeholder references from templates
   */
  static extractPlaceholders(template: string): string[] {
    const placeholders: string[] = [];
    
    // Standard placeholders: {field.path}
    const standardMatches = template.match(/\{([^}#?]+)\}/g);
    if (standardMatches) {
      placeholders.push(...standardMatches.map(match => match.slice(1, -1)));
    }
    
    // Calculated placeholders: {#calculation}
    const calculatedMatches = template.match(/\{#([^}]+)\}/g);
    if (calculatedMatches) {
      placeholders.push(...calculatedMatches.map(match => match.slice(2, -1)));
    }
    
    // Conditional placeholders: {?condition:true:false}
    const conditionalMatches = template.match(/\{\?([^}]+)\}/g);
    if (conditionalMatches) {
      placeholders.push(...conditionalMatches.map(match => match.slice(2, -1)));
    }
    
    return [...new Set(placeholders)];
  }
  
  /**
   * Validate template placeholders
   */
  static validateTemplatePlaceholders(rule: RuleDefinition): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    const titlePlaceholders = this.extractPlaceholders(rule.taskTemplate.titleTemplate);
    const descPlaceholders = this.extractPlaceholders(rule.taskTemplate.descriptionTemplate);
    
    // Check for common placeholder patterns
    const allPlaceholders = [...titlePlaceholders, ...descPlaceholders];
    
    allPlaceholders.forEach(placeholder => {
      // Check for potential typos in common fields
      if (placeholder.includes('user.') && !placeholder.startsWith('user.')) {
        issues.push(`Potential typo in placeholder: ${placeholder}`);
      }
      
      // Check for missing calculation prefix
      // Heuristic: calculated placeholders typically don't contain dots and use snake_case (e.g., days_until_*, *_deadline)
      const isLikelyCalculated = (name: string) => !name.includes('.') && /_/.test(name);
      if (isLikelyCalculated(placeholder)) {
        const titleHasProperFormat = rule.taskTemplate.titleTemplate.includes(`{#${placeholder}}`);
        const descHasProperFormat = rule.taskTemplate.descriptionTemplate.includes(`{#${placeholder}}`);
        const titleHasPlain = rule.taskTemplate.titleTemplate.includes(`{${placeholder}}`);
        const descHasPlain = rule.taskTemplate.descriptionTemplate.includes(`{${placeholder}}`);
        if ((titleHasPlain || descHasPlain) && !titleHasProperFormat && !descHasProperFormat) {
          issues.push(`Calculated placeholder missing # prefix: ${placeholder}`);
        }
      }
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

/**
 * Rule statistics and analysis
 */
export class RuleAnalyzer {
  
  /**
   * Analyze rule complexity and coverage
   */
  static analyzeRuleSet(ruleSet: RuleSet) {
    const rules = ruleSet.rules;
    
    return {
      totalRules: rules.length,
      rulesByGroup: this.groupBy(rules, 'ruleGroup'),
      rulesByPhase: this.groupBy(rules, rule => Array.isArray(rule.phase) ? rule.phase : [rule.phase]),
      rulesByVisa: this.groupBy(rules, rule => rule.visaTypes),
      priorityDistribution: this.groupBy(rules, rule => 
        rule.priority >= 80 ? 'high' : rule.priority >= 50 ? 'medium' : 'low'
      ),
      averagePriority: rules.reduce((sum, rule) => sum + rule.priority, 0) / rules.length,
      rulesWithDependencies: rules.filter(rule => rule.taskTemplate.dependsOn?.length).length,
      uniqueTags: [...new Set(rules.flatMap(rule => rule.tags))],
      templateComplexity: {
        avgTitleLength: rules.reduce((sum, rule) => sum + rule.taskTemplate.titleTemplate.length, 0) / rules.length,
        avgDescLength: rules.reduce((sum, rule) => sum + rule.taskTemplate.descriptionTemplate.length, 0) / rules.length,
        totalPlaceholders: rules.reduce((sum, rule) => {
          const titlePlaceholders = RuleValidator.extractPlaceholders(rule.taskTemplate.titleTemplate);
          const descPlaceholders = RuleValidator.extractPlaceholders(rule.taskTemplate.descriptionTemplate);
          return sum + titlePlaceholders.length + descPlaceholders.length;
        }, 0)
      }
    };
  }
  
  /**
   * Group array items by a key or function
   */
  private static groupBy<T>(array: T[], keyOrFn: string | ((item: T) => any)): Record<string, number> {
    const groups: Record<string, number> = {};
    
    array.forEach(item => {
      let keys: string[];
      
      if (typeof keyOrFn === 'string') {
        const value = (item as any)[keyOrFn];
        keys = Array.isArray(value) ? value : [value];
      } else {
        const value = keyOrFn(item);
        keys = Array.isArray(value) ? value : [value];
      }
      
      keys.forEach(key => {
        groups[key] = (groups[key] || 0) + 1;
      });
    });
    
    return groups;
  }
}

/**
 * Export utilities for rule development and testing
 */
export const RuleLibraryUtils = {
  sampleRules,
  RuleValidator,
  RuleAnalyzer
};
