/**
 * Smart Compliance Rule Engine - Main Export
 * 
 * This file exports all the core components of the rule engine for easy importing.
 */

export { RuleEngine } from './RuleEngine';
export { RuleEvaluator } from './RuleEvaluator';
export { DateCalculator } from './DateCalculator';
export { ContextBuilder } from './ContextBuilder';
export { TemplateRenderer } from './TemplateRenderer';
export { DependencyResolver } from './DependencyResolver';

export * from './types';

// Re-export for convenience
export type {
  RuleDefinition,
  RuleEvaluationResult,
  RuleEngineResult,
  UserContext,
  GeneratedTask,
  RuleEngineConfig,
  VisaPhase,
  VisaType,
  RuleGroup
} from './types';
