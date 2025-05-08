
import { parse, format, isValid, isAfter, isBefore, isSameDay } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export const dateUtils = {
  /**
   * Format a date in "PPP" format (e.g., April 12th, 2023)
   */
  formatDate: (date: Date | number): string => {
    return format(date, "PPP");
  },
  
  /**
   * Parse a date string in various formats
   */
  parseDate: (dateString: string): Date | null => {
    // Try common formats
    const formats = ["MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "MM-dd-yyyy", "yyyy/MM/dd"];
    
    for (const dateFormat of formats) {
      const parsedDate = parse(dateString, dateFormat, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    
    return null;
  },
  
  /**
   * Validate a date range to ensure the "to" date is after the "from" date
   */
  validateDateRange: (from: Date | null, to: Date | null): boolean => {
    if (!from || !to) return false;
    return isAfter(to, from) || isSameDay(from, to);
  },
  
  /**
   * Check if a date is in the past
   */
  isPast: (date: Date): boolean => {
    return isBefore(date, new Date());
  },
  
  /**
   * Check if a date is in the future
   */
  isFuture: (date: Date): boolean => {
    return isAfter(date, new Date());
  },
  
  /**
   * Check if a date is between a range
   */
  isWithinRange: (date: Date, range: DateRange): boolean => {
    return (
      (isAfter(date, range.from) || isSameDay(date, range.from)) && 
      (isBefore(date, range.to) || isSameDay(date, range.to))
    );
  }
};
