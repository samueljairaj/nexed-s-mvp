/**
 * Smart Date Calculator - Intelligent due date calculation
 * 
 * This class handles complex date calculations for compliance tasks,
 * including business days, holidays, and contextual deadline logic.
 */

import { SmartDateConfig, UserContext, RuleEngineError } from './types';

export class DateCalculator {
  
  // US Federal Holidays (can be extended)
  private readonly federalHolidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 6, day: 4 },   // Independence Day
    { month:10, day: 11 },  // Veterans Day
    { month: 11, day: 25 }   // Christmas Day
  ];

  /**
   * Calculate smart due date based on configuration and user context
   */
  public async calculateDueDate(config: SmartDateConfig, userContext: UserContext): Promise<Date> {
    try {
      switch (config.type) {
        case 'fixed':
          return this.calculateFixedDate(config, userContext);
          
        case 'relative':
          return this.calculateRelativeDate(config, userContext);
          
        case 'calculated':
          return this.calculateComplexDate(config, userContext);
          
        case 'recurring':
          return this.calculateRecurringDate(config, userContext);
          
        default:
          throw new RuleEngineError(`Unsupported date calculation type: ${config.type}`, 'DATE_CALCULATION_FAILED');
      }
    } catch (error) {
      throw new RuleEngineError(
        `Date calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DATE_CALCULATION_FAILED'
      );
    }
  }

  /**
   * Calculate fixed date (specific date)
   */
  private calculateFixedDate(config: SmartDateConfig, userContext: UserContext): Date {
    if (!config.baseDate) {
      throw new RuleEngineError('Fixed date calculation requires baseDate', 'DATE_CALCULATION_FAILED');
    }
    
    const date = new Date(config.baseDate);
    if (isNaN(date.getTime())) {
      throw new RuleEngineError(`Invalid base date: ${config.baseDate}`, 'DATE_CALCULATION_FAILED');
    }
    
    return this.applyDateConstraints(date, config);
  }

  /**
   * Calculate relative date (relative to another date)
   */
  private calculateRelativeDate(config: SmartDateConfig, userContext: UserContext): Date {
    if (!config.baseDate || !config.offset) {
      throw new RuleEngineError('Relative date calculation requires baseDate and offset', 'DATE_CALCULATION_FAILED');
    }
    
    // Get base date from user context
    const baseDate = this.getDateFromContext(config.baseDate, userContext);
    if (!baseDate) {
      throw new RuleEngineError(`Base date not found in context: ${config.baseDate}`, 'DATE_CALCULATION_FAILED');
    }
    
    // Apply offset
    const targetDate = this.applyOffset(baseDate, config.offset);
    
    // Apply business days and holiday constraints
    let finalDate = targetDate;
    if (config.businessDaysOnly) {
      finalDate = this.adjustToBusinessDay(finalDate);
    }
    if (config.excludeHolidays) {
      finalDate = this.adjustForHolidays(finalDate);
    }
    
    return this.applyDateConstraints(finalDate, config);
  }

  /**
   * Calculate complex date using custom logic
   */
  private calculateComplexDate(config: SmartDateConfig, userContext: UserContext): Date {
    if (!config.calculation) {
      throw new RuleEngineError('Complex date calculation requires calculation logic', 'DATE_CALCULATION_FAILED');
    }
    
    // Handle predefined complex calculations
    switch (config.calculation) {
      case 'opt_application_window':
        return this.calculateOptApplicationWindow(userContext);
        
      case 'stem_extension_deadline':
        return this.calculateStemExtensionDeadline(userContext);
        
      case 'passport_renewal_urgent':
        return this.calculatePassportRenewalUrgent(userContext);
        
      case 'address_update_deadline':
        return this.calculateAddressUpdateDeadline(userContext);
        
      case 'unemployment_grace_end':
        return this.calculateUnemploymentGraceEnd(userContext);
        
      default:
        throw new RuleEngineError(`Unknown calculation logic: ${config.calculation}`, 'DATE_CALCULATION_FAILED');
    }
  }

  /**
   * Calculate recurring date (next occurrence)
   */
  private calculateRecurringDate(config: SmartDateConfig, userContext: UserContext): Date {
    if (!config.calculation) {
      throw new RuleEngineError('Recurring date calculation requires calculation pattern', 'DATE_CALCULATION_FAILED');
    }
    
    const now = new Date();
    const pattern = config.calculation; // e.g., "monthly", "quarterly", "yearly"
    
    let nextDate: Date;
    
    switch (pattern) {
      case 'monthly':
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
        
      case 'quarterly':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const nextQuarterMonth = (currentQuarter + 1) * 3;
        nextDate = new Date(now.getFullYear(), nextQuarterMonth, 1);
        break;
        
      case 'yearly':
        nextDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        break;
        
      case 'semi-annually':
        nextDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
        break;
        
      default:
        // Try to parse as custom interval (e.g., "90days")
        nextDate = this.applyOffset(now, pattern);
    }
    
    return this.applyDateConstraints(nextDate, config);
  }

  // ============================================================================
  // COMPLEX CALCULATION IMPLEMENTATIONS
  // ============================================================================

  /**
   * Calculate OPT application window (90 days before graduation)
   */
  private calculateOptApplicationWindow(userContext: UserContext): Date {
    const graduationDate = userContext.dates.graduationDate;
    if (!graduationDate) {
      throw new RuleEngineError('OPT calculation requires graduation date', 'DATE_CALCULATION_FAILED');
    }
    
    // OPT can be applied 90 days before graduation
    const applicationStart = this.applyOffset(graduationDate, '-90days');
    
    // If we're already in the window, return a near-future date for urgency
    const now = new Date();
    if (now >= applicationStart) {
      return this.applyOffset(now, '+7days'); // Apply within a week
    }
    
    return applicationStart;
  }

  /**
   * Calculate STEM extension deadline (90 days before OPT expiry)
   */
  private calculateStemExtensionDeadline(userContext: UserContext): Date {
    const optEndDate = userContext.dates.optEndDate;
    if (!optEndDate) {
      throw new RuleEngineError('STEM extension calculation requires OPT end date', 'DATE_CALCULATION_FAILED');
    }
    
    // STEM extension must be filed 90 days before OPT expires
    return this.applyOffset(optEndDate, '-90days');
  }

  /**
   * Calculate urgent passport renewal deadline
   */
  private calculatePassportRenewalUrgent(userContext: UserContext): Date {
    const passportExpiry = userContext.dates.passportExpiryDate;
    if (!passportExpiry) {
      throw new RuleEngineError('Passport renewal calculation requires expiry date', 'DATE_CALCULATION_FAILED');
    }
    
    // Passport should be renewed 6 months before expiry for visa status maintenance
    const renewalDeadline = this.applyOffset(passportExpiry, '-6months');
    
    // If already past the deadline, make it urgent (within 2 weeks)
    const now = new Date();
    if (now >= renewalDeadline) {
      return this.applyOffset(now, '+14days');
    }
    
    return renewalDeadline;
  }

  /**
   * Calculate address update deadline (10 days after move)
   */
  private calculateAddressUpdateDeadline(userContext: UserContext): Date {
    const lastMoved = userContext.location.lastMoved;
    if (!lastMoved) {
      // If no move date, assume they need to update soon
      return this.applyOffset(new Date(), '+3days');
    }
    
    // Must update within 10 days of moving
    return this.applyOffset(lastMoved, '+10days');
  }

  /**
   * Calculate unemployment grace period end
   */
  private calculateUnemploymentGraceEnd(userContext: UserContext): Date {
    const employmentEndDate = userContext.dates.employmentEndDate;
    if (!employmentEndDate) {
      throw new RuleEngineError('Unemployment calculation requires employment end date', 'DATE_CALCULATION_FAILED');
    }
    
    // OPT students have 90 days of unemployment allowed
    const maxUnemploymentDays = userContext.employment.maxUnemploymentDays || 90;
    const usedDays = userContext.employment.unemploymentDaysUsed || 0;
    const remainingDays = maxUnemploymentDays - usedDays;
    
    return this.applyOffset(employmentEndDate, `+${remainingDays}days`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get date from user context using field path
   */
  private getDateFromContext(fieldPath: string, userContext: UserContext): Date | null {
    const paths = fieldPath.split('.');
    let value: any = userContext;
    
    for (const path of paths) {
      if (value === null || value === undefined) {
        return null;
      }
      value = value[path];
    }
    
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  /**
   * Apply time offset to a date
   */
  private applyOffset(baseDate: Date, offset: string): Date {
    const regex = /^([+-]?)(\d+)(days?|months?|years?|weeks?)$/i;
    const match = offset.match(regex);
    
    if (!match) {
      throw new RuleEngineError(`Invalid offset format: ${offset}`, 'DATE_CALCULATION_FAILED');
    }
    
    const [, sign, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10) * (sign === '-' ? -1 : 1);
    const result = new Date(baseDate);
    
    switch (unit.toLowerCase()) {
      case 'day':
      case 'days':
        result.setDate(result.getDate() + amount);
        break;
      case 'week':
      case 'weeks':
        result.setDate(result.getDate() + (amount * 7));
        break;
      case 'month':
      case 'months':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'year':
      case 'years':
        result.setFullYear(result.getFullYear() + amount);
        break;
      default:
        throw new RuleEngineError(`Unsupported time unit: ${unit}`, 'DATE_CALCULATION_FAILED');
    }
    
    return result;
  }

  /**
   * Adjust date to next business day if it falls on weekend
   */
  private adjustToBusinessDay(date: Date): Date {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    
    // If Saturday (6), move to Monday
    if (dayOfWeek === 6) {
      result.setDate(result.getDate() + 2);
    }
    // If Sunday (0), move to Monday
    else if (dayOfWeek === 0) {
      result.setDate(result.getDate() + 1);
    }
    
    return result;
  }

  /**
   * Adjust date to avoid federal holidays
   */
  private adjustForHolidays(date: Date): Date {
    let result = new Date(date);
    
    // Check if date is a federal holiday
    while (this.isFederalHoliday(result)) {
      result.setDate(result.getDate() + 1);
      // Also ensure it's not a weekend
      result = this.adjustToBusinessDay(result);
    }
    
    return result;
  }

  /**
   * Check if date is a federal holiday
   */
  private isFederalHoliday(date: Date): boolean {
    const month = date.getMonth();
    const day = date.getDate();
    
    return this.federalHolidays.some(holiday => 
      holiday.month === month && holiday.day === day
    );
  }

  /**
   * Apply min/max date constraints
   */
  private applyDateConstraints(date: Date, config: SmartDateConfig): Date {
    let result = new Date(date);
    
    if (config.minDate) {
      const minDate = new Date(config.minDate);
      if (result < minDate) {
        result = minDate;
      }
    }
    
    if (config.maxDate) {
      const maxDate = new Date(config.maxDate);
      if (result > maxDate) {
        result = maxDate;
      }
    }
    
    return result;
  }

  /**
   * Calculate days between two dates
   */
  public daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is in the past
   */
  public isInPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is within a certain number of days from now
   */
  public isWithinDays(date: Date, days: number): boolean {
    const now = new Date();
    const diffDays = this.daysBetween(now, date);
    return diffDays <= days;
  }
}
