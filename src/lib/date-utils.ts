import { format, formatISO, parse, parseISO, differenceInDays, isBefore, isAfter, addDays } from 'date-fns';

// Add DateRange interface needed by CalendarView component
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const dateUtils = {
  // Existing functions
  formatDate: (date: string | Date, format: string = 'yyyy-MM-dd'): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, format);
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  },
  
  isWithinDays: (date: string | Date, days: number): boolean => {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const now = new Date();
      const diffInDays = differenceInDays(dateObj, now);
      
      return diffInDays >= 0 && diffInDays <= days;
    } catch (e) {
      console.error('Error checking if date is within days:', e);
      return false;
    }
  },
  
  parseApiDate: (dateString: string): Date => {
    return parseISO(dateString);
  },
  
  formatForApi: (date: string | Date): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatISO(dateObj).split('T')[0];
    } catch (e) {
      console.error('Error formatting date for API:', e);
      return '';
    }
  },
  
  formatToYYYYMMDD: (date: string | Date): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'yyyy-MM-dd');
    } catch (e) {
      console.error('Error formatting date to YYYY-MM-DD:', e);
      return '';
    }
  },
  
  daysBetween: (date1: string | Date, date2: string | Date = new Date()): number => {
    if (!date1 || !date2) return 0;
    
    try {
      const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
      const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
      
      return Math.abs(differenceInDays(date1Obj, date2Obj));
    } catch (e) {
      console.error('Error calculating days between dates:', e);
      return 0;
    }
  },
  
  // Add missing functions referenced in error messages
  formatShort: (date: string | Date): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date to short format:', e);
      return '';
    }
  },
  
  isPast: (date: string | Date): boolean => {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const now = new Date();
      return isBefore(dateObj, now);
    } catch (e) {
      console.error('Error checking if date is in the past:', e);
      return false;
    }
  },
  
  isWithinRange: (date: Date, rangeStart: Date, rangeEnd: Date): boolean => {
    if (!date || !rangeStart || !rangeEnd) return false;
    
    try {
      return (isAfter(date, rangeStart) || date.getTime() === rangeStart.getTime()) && 
             (isBefore(date, rangeEnd) || date.getTime() === rangeEnd.getTime());
    } catch (e) {
      console.error('Error checking if date is within range:', e);
      return false;
    }
  },
  
  validateDateRange: (start: Date, end: Date): boolean => {
    if (!start || !end) return false;
    return !isBefore(end, start);
  }
};
