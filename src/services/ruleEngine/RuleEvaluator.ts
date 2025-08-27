/**
 * Rule Evaluator - Handles condition evaluation logic
 * 
 * This class evaluates rule conditions against user context data,
 * supporting complex logical operations and type-safe comparisons.
 */

import {
  RuleCondition,
  ConditionEvaluationResult,
  UserContext,
  RuleOperator,
  RuleEngineError
} from './types';

export class RuleEvaluator {
  
  /**
   * Evaluate all conditions for a rule
   */
  public async evaluateConditions(
    conditions: RuleCondition[], 
    userContext: UserContext
  ): Promise<ConditionEvaluationResult[]> {
    const results: ConditionEvaluationResult[] = [];
    
    for (const condition of conditions) {
      try {
        const result = await this.evaluateCondition(condition, userContext);
        results.push(result);
      } catch (error) {
        results.push({
          condition,
          passed: false,
          actualValue: null,
          expectedValue: condition.value,
          reason: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return results;
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(
    condition: RuleCondition, 
    userContext: UserContext
  ): Promise<ConditionEvaluationResult> {
    
    // Handle nested conditions (complex logic)
    if (condition.nested && condition.nested.length > 0) {
      return this.evaluateNestedConditions(condition, userContext);
    }

    // Get actual value from user context
    const actualValue = this.getValueFromContext(condition.field, userContext);
    
    // Perform comparison
    const passed = this.compareValues(actualValue, condition.operator, condition.value, condition.timeValue);
    
    return {
      condition,
      passed,
      actualValue,
      expectedValue: condition.value,
      reason: passed ? 'Condition met' : this.getFailureReason(actualValue, condition)
    };
  }

  /**
   * Evaluate nested conditions with logical operators
   */
  private async evaluateNestedConditions(
    condition: RuleCondition, 
    userContext: UserContext
  ): Promise<ConditionEvaluationResult> {
    
    if (!condition.nested) {
      throw new RuleEngineError('Nested conditions array is empty', 'CONDITION_EVALUATION_FAILED');
    }

    const nestedResults = await this.evaluateConditions(condition.nested, userContext);
    
    // Apply logical operator (default to AND)
    const logicOperator = condition.logicOperator || 'AND';
    let passed: boolean;
    
    if (logicOperator === 'AND') {
      passed = nestedResults.every(result => result.passed);
    } else if (logicOperator === 'OR') {
      passed = nestedResults.some(result => result.passed);
    } else {
      throw new RuleEngineError(`Unsupported logic operator: ${logicOperator}`, 'CONDITION_EVALUATION_FAILED');
    }
    
    // Apply group-level negation (NOT)
    if (condition.negate) {
      passed = !passed;
    }
    
    return {
      condition,
      passed,
      actualValue: nestedResults.map(r => r.actualValue),
      expectedValue: nestedResults.map(r => r.expectedValue),
      reason: passed ? 'Nested conditions met' : `Nested conditions failed (${logicOperator} logic)`
    };
  }

  /**
   * Get value from user context using dot notation
   */
  private getValueFromContext(fieldPath: string, userContext: UserContext): any {
    const paths = fieldPath.split('.');
    let value: any = userContext;
    
    for (const path of paths) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[path];
    }
    
    return value;
  }

  /**
   * Compare actual value with expected value using operator
   */
  private compareValues(
    actualValue: any,
    operator: RuleOperator, 
    expectedValue: any,
    timeValue?: string
  ): boolean {
    
    // Handle null/undefined values
    if (operator === 'exists') {
      return actualValue !== null && actualValue !== undefined;
    }
    
    if (operator === 'notExists') {
      return actualValue === null || actualValue === undefined;
    }
    
    if (actualValue === null || actualValue === undefined) {
      return false;
    }

    // Handle time-based comparisons
    if (timeValue) {
      return this.compareTimeValues(actualValue, operator, expectedValue, timeValue);
    }

    // Standard comparisons
    switch (operator) {
      case 'equals':
        return this.isEqual(actualValue, expectedValue);
        
      case 'notEquals':
        return !this.isEqual(actualValue, expectedValue);
        
      case 'lessThan':
        return this.comparePrimitive(actualValue, expectedValue) < 0;
        
      case 'lessThanOrEqual':
        return this.comparePrimitive(actualValue, expectedValue) <= 0;
        
      case 'greaterThan':
        return this.comparePrimitive(actualValue, expectedValue) > 0;
        
      case 'greaterThanOrEqual':
        return this.comparePrimitive(actualValue, expectedValue) >= 0;
        
      case 'contains':
        return this.contains(actualValue, expectedValue);
        
      case 'notContains':
        return !this.contains(actualValue, expectedValue);
        
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
        
      case 'notIn':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
        
      case 'between':
        return this.isBetween(actualValue, expectedValue);
        
      case 'regex':
        return this.matchesRegex(actualValue, expectedValue);
        
      default:
        throw new RuleEngineError(`Unsupported operator: ${operator}`, 'CONDITION_EVALUATION_FAILED');
    }
  }

  /**
   * Compare time-based values (e.g., dates with offsets)
   */
  private compareTimeValues(
    actualValue: any,
    operator: RuleOperator, 
    expectedValue: any,
    timeValue: string
  ): boolean {
    
    const actualDate = this.parseDate(actualValue);
    if (!actualDate) return false;
    
    const offsetMs = this.parseTimeValue(timeValue);
    const comparisonDate = new Date(Date.now() + offsetMs);
    
    switch (operator) {
      case 'lessThan':
        return actualDate < comparisonDate;
      case 'lessThanOrEqual':
        return actualDate <= comparisonDate;
      case 'greaterThan':
        return actualDate > comparisonDate;
      case 'greaterThanOrEqual':
        return actualDate >= comparisonDate;
      default:
        return this.compareValues(actualDate, operator, comparisonDate);
    }
  }

  /**
   * Parse time value string to milliseconds
   */
  private parseTimeValue(timeValue: string): number {
    const regex = /^(\d+)(days?|months?|years?|weeks?|hours?|minutes?)$/i;
    const match = timeValue.match(regex);
    
    if (!match) {
      throw new RuleEngineError(`Invalid time value format: ${timeValue}`, 'CONDITION_EVALUATION_FAILED');
    }
    
    const [, amount, unit] = match;
    const num = parseInt(amount, 10);
    
    switch (unit.toLowerCase()) {
      case 'minute':
      case 'minutes':
        return num * 60 * 1000;
      case 'hour':
      case 'hours':
        return num * 60 * 60 * 1000;
      case 'day':
      case 'days':
        return num * 24 * 60 * 60 * 1000;
      case 'week':
      case 'weeks':
        return num * 7 * 24 * 60 * 60 * 1000;
      case 'month':
      case 'months':
        return num * 30 * 24 * 60 * 60 * 1000; // Approximate
      case 'year':
      case 'years':
        return num * 365 * 24 * 60 * 60 * 1000; // Approximate
      default:
        throw new RuleEngineError(`Unsupported time unit: ${unit}`, 'CONDITION_EVALUATION_FAILED');
    }
  }

  /**
   * Parse various date formats to Date object
   */
  private parseDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    return null;
  }

  /**
   * Deep equality comparison
   */
  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase() === b.toLowerCase();
    }
    
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((val, index) => this.isEqual(val, b[index]));
    }
    
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return keysA.length === keysB.length && keysA.every(key => this.isEqual(a[key], b[key]));
    }
    
    return false;
  }

  /**
   * Compare primitive values
   */
  private comparePrimitive(a: any, b: any): number {
    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    
    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    // Handle strings
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    
    // Convert to strings and compare
    return String(a).localeCompare(String(b));
  }

  /**
   * Check if value contains substring or element
   */
  private contains(haystack: any, needle: any): boolean {
    if (typeof haystack === 'string' && typeof needle === 'string') {
      return haystack.toLowerCase().includes(needle.toLowerCase());
    }
    
    if (Array.isArray(haystack)) {
      return haystack.some(item => this.isEqual(item, needle));
    }
    
    if (typeof haystack === 'object' && haystack !== null) {
      return Object.values(haystack).some(value => this.isEqual(value, needle));
    }
    
    return false;
  }

  /**
   * Check if value is between two values
   */
  private isBetween(value: any, range: any): boolean {
    if (!Array.isArray(range) || range.length !== 2) {
      throw new RuleEngineError('Between operator requires array with exactly 2 values', 'CONDITION_EVALUATION_FAILED');
    }
    
    const [min, max] = range;
    return this.comparePrimitive(value, min) >= 0 && this.comparePrimitive(value, max) <= 0;
  }

  /**
   * Check if value matches regex pattern
   */
  private matchesRegex(value: any, pattern: string): boolean {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    try {
      // Basic safety guardrails to reduce ReDoS risk without new deps
      // 1) limit pattern length
      if (pattern.length > 200) {
        throw new RuleEngineError(`Regex pattern too long`, 'CONDITION_EVALUATION_FAILED');
      }
      // 2) reject some common catastrophic constructs: nested quantifiers like (a+)+ or (.*)+
      const dangerous = /(\([^)]*[+*][^)]*\)\s*[+*])|(\.\*\+)|(\+\+)|(\*\*)/;
      if (dangerous.test(pattern)) {
        throw new RuleEngineError(`Potentially unsafe regex pattern`, 'CONDITION_EVALUATION_FAILED');
      }
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch (error) {
      throw new RuleEngineError(`Invalid regex pattern: ${pattern}`, 'CONDITION_EVALUATION_FAILED');
    }
  }

  /**
   * Generate failure reason for debugging
   */
  private getFailureReason(actualValue: any, condition: RuleCondition): string {
    const { field, operator, value, timeValue } = condition;
    
    let reason = `Field '${field}' (${actualValue}) ${operator} ${value}`;
    
    if (timeValue) {
      reason += ` (time: ${timeValue})`;
    }
    
    return `${reason} - condition not met`;
  }
}
