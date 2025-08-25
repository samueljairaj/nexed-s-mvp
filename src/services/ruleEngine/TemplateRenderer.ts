/**
 * Template Renderer - Renders task templates with user context
 * 
 * This class handles string template rendering with smart placeholder replacement,
 * date formatting, and contextual value calculation for task titles and descriptions.
 */

import { UserContext, TemplateContext, RuleEngineError } from './types';

export class TemplateRenderer {
  
  /**
   * Render template string with user context
   */
  public async render(template: string, userContext: UserContext): Promise<string> {
    try {
      // Build template context with calculated values
      const templateContext = this.buildTemplateContext(userContext);
      
      // Replace placeholders in template
      return this.replacePlaceholders(template, templateContext);
      
    } catch (error) {
      throw new RuleEngineError(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_RENDERING_FAILED'
      );
    }
  }

  /**
   * Build comprehensive template context with calculated values
   */
  private buildTemplateContext(userContext: UserContext): TemplateContext {
    const now = new Date();
    
    return {
      user: userContext,
      calculated: {
        daysUntilDeadline: this.calculateDaysUntilDeadline(userContext),
        daysUntilExpiry: this.calculateDaysUntilExpiry(userContext),
        timeRemaining: this.calculateTimeRemaining(userContext),
        urgencyLevel: this.calculateUrgencyLevel(userContext),
        daysUntilGraduation: this.calculateDaysUntilGraduation(userContext),
        daysUntilOptExpiry: this.calculateDaysUntilOptExpiry(userContext),
        daysUntilPassportExpiry: this.calculateDaysUntilPassportExpiry(userContext),
        unemploymentDaysRemaining: this.calculateUnemploymentDaysRemaining(userContext),
        visaStatusSummary: this.buildVisaStatusSummary(userContext),
        nextImportantDate: this.findNextImportantDate(userContext),
        complianceScore: this.calculateComplianceScore(userContext)
      },
      dates: {
        today: this.formatDate(now),
        graduationDate: this.formatDate(userContext.dates.graduationDate),
        optEndDate: this.formatDate(userContext.dates.optEndDate),
        passportExpiryDate: this.formatDate(userContext.dates.passportExpiryDate),
        visaExpiryDate: this.formatDate(userContext.dates.visaExpiryDate),
        employmentStartDate: this.formatDate(userContext.dates.employmentStartDate),
        usEntryDate: this.formatDate(userContext.dates.usEntryDate),
        courseStartDate: this.formatDate(userContext.dates.courseStartDate)
      }
    };
  }

  /**
   * Replace placeholders in template string
   */
  private replacePlaceholders(template: string, context: TemplateContext): string {
    let result = template;
    
    // Replace conditional placeholders: {?condition:trueValue:falseValue}
    result = result.replace(/\{\?([^}]+)\}/g, (match, expression) => {
      return this.evaluateConditionalExpression(expression, context);
    });
    
    // Replace calculated placeholders: {#calculation}
    result = result.replace(/\{#([^}]+)\}/g, (match, calculation) => {
      return this.evaluateCalculation(calculation, context);
    });
    
    // Replace simple placeholders: {fieldName} (exclude {?...} and {#...})
    result = result.replace(/\{(?![?#])([^}]+)\}/g, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return this.formatValue(value);
    });

    return result;
  }

  /**
   * Get value from context using dot notation path
   */
  private getValueByPath(context: TemplateContext, path: string): any {
    const parts = path.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return this.formatDate(value);
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  }

  /**
   * Evaluate conditional expression: condition:trueValue:falseValue
   */
  private evaluateConditionalExpression(expression: string, context: TemplateContext): string {
    const parts = expression.split(':');
    if (parts.length !== 3) {
      return `{Invalid conditional: ${expression}}`;
    }
    
    const [condition, trueValue, falseValue] = parts;
    const conditionResult = this.evaluateCondition(condition.trim(), context);
    
    return conditionResult ? trueValue.trim() : falseValue.trim();
  }

  /**
   * Evaluate simple condition
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    // Handle simple existence checks
    if (condition.startsWith('!')) {
      const path = condition.substring(1);
      const value = this.getValueByPath(context, path);
      return !value;
    }
    
    // Handle comparison operators
    const operators = ['>=', '<=', '>', '<', '==', '!='];
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftValue = this.getValueByPath(context, left);
        const rightValue = this.parseValue(right);
        
        return this.compareValues(leftValue, op, rightValue);
      }
    }
    
    // Simple existence check
    const value = this.getValueByPath(context, condition);
    return Boolean(value);
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): any {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Parse booleans
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    return value;
  }

  /**
   * Compare values with operator
   */
  private compareValues(left: any, operator: string, right: any): boolean {
    switch (operator) {
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '>':
        return left > right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
      default:
        return false;
    }
  }

  /**
   * Evaluate calculation expression
   */
  private evaluateCalculation(calculation: string, context: TemplateContext): string {
    switch (calculation.toLowerCase()) {
      case 'days_until_graduation':
        return String(context.calculated.daysUntilGraduation || 'N/A');
        
      case 'days_until_opt_expiry':
        return String(context.calculated.daysUntilOptExpiry || 'N/A');
        
      case 'days_until_passport_expiry':
        return String(context.calculated.daysUntilPassportExpiry || 'N/A');
        
      case 'unemployment_days_remaining':
        return String(context.calculated.unemploymentDaysRemaining || 'N/A');
        
      case 'time_remaining_friendly':
        return context.calculated.timeRemaining || 'Unknown';
        
      case 'urgency_indicator':
        return this.getUrgencyIndicator(context.calculated.urgencyLevel);
        
      default:
        return `{Unknown calculation: ${calculation}}`;
    }
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  private calculateDaysUntilDeadline(userContext: UserContext): number | undefined {
    // This would be set by the specific rule context
    return undefined;
  }

  private calculateDaysUntilExpiry(userContext: UserContext): number | undefined {
    const passportExpiry = userContext.dates.passportExpiryDate;
    if (!passportExpiry) return undefined;
    
    return this.daysBetween(new Date(), passportExpiry);
  }

  private calculateTimeRemaining(userContext: UserContext): string | undefined {
    const passportExpiry = userContext.dates.passportExpiryDate;
    if (!passportExpiry) return undefined;
    
    const days = this.daysBetween(new Date(), passportExpiry);
    return this.formatTimeRemaining(days);
  }

  private calculateUrgencyLevel(userContext: UserContext): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = userContext.compliance.riskScore || 0;
    
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  private calculateDaysUntilGraduation(userContext: UserContext): number | undefined {
    const graduationDate = userContext.dates.graduationDate;
    if (!graduationDate) return undefined;
    
    return this.daysBetween(new Date(), graduationDate);
  }

  private calculateDaysUntilOptExpiry(userContext: UserContext): number | undefined {
    const optEndDate = userContext.dates.optEndDate;
    if (!optEndDate) return undefined;
    
    return this.daysBetween(new Date(), optEndDate);
  }

  private calculateDaysUntilPassportExpiry(userContext: UserContext): number | undefined {
    const passportExpiry = userContext.dates.passportExpiryDate;
    if (!passportExpiry) return undefined;
    
    return this.daysBetween(new Date(), passportExpiry);
  }

  private calculateUnemploymentDaysRemaining(userContext: UserContext): number | undefined {
    const maxDays = userContext.employment.maxUnemploymentDays || 0;
    const usedDays = userContext.employment.unemploymentDaysUsed || 0;
    
    if (maxDays === 0) return undefined;
    
    return Math.max(0, maxDays - usedDays);
  }

  private buildVisaStatusSummary(userContext: UserContext): string {
    const { visaType, currentPhase } = userContext;
    return `${visaType} - ${this.formatPhase(currentPhase)}`;
  }

  private findNextImportantDate(userContext: UserContext): Date | undefined {
    const dates = [
      userContext.dates.graduationDate,
      userContext.dates.optEndDate,
      userContext.dates.passportExpiryDate,
      userContext.dates.visaExpiryDate
    ].filter(date => date && date > new Date());
    
    if (dates.length === 0) return undefined;
    
    return dates.reduce((earliest, current) => 
      current && current < earliest ? current : earliest
    );
  }

  private calculateComplianceScore(userContext: UserContext): number {
    return Math.max(0, 100 - (userContext.compliance.riskScore || 0));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private formatDate(date: Date | undefined): string {
    if (!date) return '';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTimeRemaining(days: number): string {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 month' : `${months} months`;
    }
    
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    
    let result = years === 1 ? '1 year' : `${years} years`;
    if (remainingMonths > 0) {
      result += remainingMonths === 1 ? ' 1 month' : ` ${remainingMonths} months`;
    }
    
    return result;
  }

  private formatPhase(phase: string): string {
    const phaseMap: { [key: string]: string } = {
      'pre_arrival': 'Pre-Arrival',
      'initial_entry': 'Initial Entry',
      'during_program': 'During Program',
      'pre_graduation': 'Pre-Graduation',
      'post_graduation': 'Post-Graduation',
      'opt_application': 'OPT Application',
      'opt_active': 'On OPT',
      'stem_application': 'STEM Extension Application',
      'stem_active': 'On STEM OPT',
      'status_change': 'Status Change',
      'departure_prep': 'Departure Preparation',
      'general': 'General'
    };
    
    return phaseMap[phase] || phase;
  }

  private getUrgencyIndicator(urgency?: 'low' | 'medium' | 'high' | 'critical'): string {
    const indicators = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    
    return indicators[urgency || 'low'];
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
