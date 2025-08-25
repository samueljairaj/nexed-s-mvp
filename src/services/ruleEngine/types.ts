/**
 * Smart Compliance Rule Engine - Type Definitions
 * 
 * This file defines the core types for the intelligent rule engine that provides
 * personalized, context-aware compliance tasks and guidance.
 */

import { Task } from "@/hooks/useComplianceTasks";

// ============================================================================
// CORE RULE SYSTEM TYPES
// ============================================================================

/**
 * Supported operators for rule conditions
 */
export type RuleOperator = 
  | 'equals' 
  | 'notEquals'
  | 'lessThan' 
  | 'lessThanOrEqual'
  | 'greaterThan' 
  | 'greaterThanOrEqual'
  | 'contains'
  | 'notContains'
  | 'in'
  | 'notIn'
  | 'exists'
  | 'notExists'
  | 'between'
  | 'regex';

/**
 * Time-based values for smart date calculations
 */
export type TimeValue = string; // e.g., "30days", "6months", "1year", "90days"

/**
 * Date calculation methods
 */
export type DateCalculationType = 
  | 'fixed'           // Specific date
  | 'relative'        // Relative to another date
  | 'calculated'      // Complex calculation
  | 'recurring';      // Recurring pattern

/**
 * Rule condition - supports complex logic
 */
export interface RuleCondition {
  field: string;                    // User data field to check
  operator: RuleOperator;
  value: any;                      // Value to compare against
  timeValue?: TimeValue;           // For time-based comparisons
  logicOperator?: 'AND' | 'OR';    // For chaining conditions
  nested?: RuleCondition[];        // For complex nested logic
}

/**
 * Smart date calculation configuration
 */
export interface SmartDateConfig {
  type: DateCalculationType;
  baseDate?: string;               // Field name for base date
  offset?: string;                 // e.g., "-90days", "+30days"
  calculation?: string;            // Custom calculation logic
  minDate?: string;                // Minimum allowed date
  maxDate?: string;                // Maximum allowed date
  businessDaysOnly?: boolean;      // Skip weekends
  excludeHolidays?: boolean;       // Skip holidays
}

/**
 * Task template for rule-generated tasks
 */
export interface RuleTaskTemplate {
  titleTemplate: string;           // Template with placeholders
  descriptionTemplate: string;     // Template with placeholders
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDateConfig: SmartDateConfig;
  dependsOn?: string[];            // IDs of prerequisite rules
  autoCompleteConditions?: RuleCondition[]; // Conditions for auto-completion
  reminderSchedule?: {
    intervals: string[];           // e.g., ["30days", "7days", "1day"]
    customMessage?: string;
  };
  universityOverrides?: {
    [universityId: string]: Partial<RuleTaskTemplate>;
  };
}

/**
 * Core rule definition
 */
export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  ruleGroup: RuleGroup;
  phase: VisaPhase | VisaPhase[];   // Which phases this rule applies to
  visaTypes: VisaType[];            // Applicable visa types
  conditions: RuleCondition[];      // When this rule should trigger
  taskTemplate: RuleTaskTemplate;   // What task to generate
  priority: number;                 // Rule priority (higher = more important)
  isActive: boolean;
  universitySpecific?: string;      // University ID for overrides
  tags?: string[];                  // For categorization
  version: string;                  // For rule versioning
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER CONTEXT TYPES
// ============================================================================

/**
 * Visa types supported by the system
 */
export type VisaType = 'F1' | 'J1' | 'H1B' | 'OPT' | 'STEM_OPT' | 'Other';

/**
 * Phases in the visa journey
 */
export type VisaPhase = 
  | 'pre_arrival'      // Before entering US
  | 'initial_entry'    // First 30 days in US
  | 'during_program'   // Active F1/J1 status
  | 'pre_graduation'   // 90 days before graduation
  | 'post_graduation'  // After graduation, before OPT
  | 'opt_application'  // Applying for OPT
  | 'opt_active'       // On OPT
  | 'stem_application' // Applying for STEM extension
  | 'stem_active'      // On STEM OPT
  | 'status_change'    // Changing to H1B, etc.
  | 'departure_prep'   // Preparing to leave US
  | 'general';         // Applies to all phases

/**
 * Rule groupings for organization
 */
export type RuleGroup = 
  | 'visa_status'
  | 'academic'
  | 'employment' 
  | 'documents'
  | 'deadlines'
  | 'reporting'
  | 'travel'
  | 'university_specific'
  | 'emergency';

/**
 * Comprehensive user context for rule evaluation
 */
export interface UserContext {
  // Basic Info
  userId: string;
  email: string;
  name?: string;
  
  // Visa Information
  visaType: VisaType;
  currentPhase: VisaPhase;
  visaStatus?: string;
  sevisId?: string;
  i94Number?: string;
  
  // Important Dates
  dates: {
    usEntryDate?: Date;
    visaExpiryDate?: Date;
    passportExpiryDate?: Date;
    courseStartDate?: Date;
    graduationDate?: Date;
    employmentStartDate?: Date;
    employmentEndDate?: Date;
    optStartDate?: Date;
    optEndDate?: Date;
    stemOptEndDate?: Date;
    i20ExpiryDate?: Date;
    lastAddressUpdate?: Date;
  };
  
  // Academic Information
  academic: {
    university?: string;
    universityId?: string;
    fieldOfStudy?: string;
    degreeLevel?: string;
    isSTEM?: boolean;
    gpa?: number;
    creditsCompleted?: number;
    totalCredits?: number;
    isTransferStudent?: boolean;
    previousUniversities?: string[];
  };
  
  // Employment Information
  employment: {
    status: string;
    employer?: string;
    jobTitle?: string;
    isFieldRelated?: boolean;
    authorizationType?: string;
    eadNumber?: string;
    unemploymentDaysUsed?: number;
    maxUnemploymentDays?: number;
    eVerifyCompliant?: boolean;
  };
  
  // Document Status
  documents: {
    passportValid?: boolean;
    visaValid?: boolean;
    i20Current?: boolean;
    eadValid?: boolean;
    i983Submitted?: boolean;
    [key: string]: boolean | undefined;
  };
  
  // Location & Contact
  location: {
    currentAddress?: string;
    state?: string;
    zipCode?: string;
    lastMoved?: Date;
    addressReportedToSevis?: boolean;
  };
  
  // Compliance History
  compliance: {
    tasksCompleted: number;
    tasksOverdue: number;
    lastComplianceCheck?: Date;
    riskScore?: number;
    warningsIssued?: string[];
  };
  
  // Contextual Flags
  flags: {
    hasUnemploymentPeriods?: boolean;
    hasTransferHistory?: boolean;
    isFirstTimeOpt?: boolean;
    hasH1BPetition?: boolean;
    planningToTravel?: boolean;
    addressChangeRecent?: boolean;
  };
  
  // University-specific data
  universityContext?: {
    [key: string]: any;
  };
}

// ============================================================================
// RULE EVALUATION TYPES
// ============================================================================

/**
 * Result of rule condition evaluation
 */
export interface ConditionEvaluationResult {
  condition: RuleCondition;
  passed: boolean;
  actualValue: any;
  expectedValue: any;
  reason?: string;
}

/**
 * Result of rule evaluation
 */
export interface RuleEvaluationResult {
  rule: RuleDefinition;
  matched: boolean;
  conditionResults: ConditionEvaluationResult[];
  generatedTask?: GeneratedTask;
  evaluatedAt: Date;
  context: UserContext;
  skipReason?: string;
}

/**
 * Task generated by rule engine
 */
export interface GeneratedTask extends Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  ruleId: string;
  contextData: {
    userPhase: VisaPhase;
    triggerConditions: string[];
    smartDateCalculation: string;
    placeholderValues: { [key: string]: any };
  };
  dependencies: string[];
  autoCompleteWhen?: RuleCondition[];
}

/**
 * Complete rule engine evaluation result
 */
export interface RuleEngineResult {
  userId: string;
  evaluatedAt: Date;
  userContext: UserContext;
  ruleResults: RuleEvaluationResult[];
  generatedTasks: GeneratedTask[];
  errors: string[];
  performance: {
    totalRulesEvaluated: number;
    executionTimeMs: number;
    rulesMatched: number;
    tasksGenerated: number;
  };
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Rule engine configuration
 */
export interface RuleEngineConfig {
  enableSmartDates: boolean;
  enableDependencies: boolean;
  enableUniversityOverrides: boolean;
  enableAutoCompletion: boolean;
  maxTasksPerEvaluation: number;
  cacheEvaluationResults: boolean;
  debugMode: boolean;
  performanceTracking: boolean;
}

/**
 * Template placeholder context for string interpolation
 */
export interface TemplateContext {
  user: UserContext;
  calculated: {
    daysUntilDeadline?: number;
    daysUntilExpiry?: number;
    timeRemaining?: string;
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    [key: string]: any;
  };
  dates: {
    [key: string]: string; // Formatted dates
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class RuleEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public ruleId?: string,
    public userId?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'RuleEngineError';
  }
}

export type RuleEngineErrorCode = 
  | 'INVALID_RULE_DEFINITION'
  | 'CONDITION_EVALUATION_FAILED'
  | 'DATE_CALCULATION_FAILED'
  | 'TEMPLATE_RENDERING_FAILED'
  | 'USER_CONTEXT_INVALID'
  | 'DEPENDENCY_CYCLE_DETECTED'
  | 'RULE_EXECUTION_TIMEOUT';
