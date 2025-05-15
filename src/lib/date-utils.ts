/**
 * Date utility functions for consistent date handling across the application
 */
export const dateUtils = {
  /**
   * Format a date object or string to a human-readable format
   * @param date The date to format
   * @param format Optional format (default: 'MMMM d, yyyy')
   * @returns Formatted date string
   */
  formatDate: (date: Date | string | null | undefined, format?: string): string => {
    if (!date) return "Not specified";
    
    try {
      // Convert to Date object if it's a string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error("Date formatting error:", error);
      return String(date);
    }
  },
  
  /**
   * Calculate if a date is within a certain number of days from now
   * @param date The date to check
   * @param days The number of days threshold
   * @returns boolean indicating if date is within specified days
   */
  isWithinDays: (date: Date | string | null | undefined, days: number): boolean => {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      return dateObj <= futureDate && dateObj >= today;
    } catch (error) {
      console.error("Date comparison error:", error);
      return false;
    }
  },
  
  /**
   * Convert a date string from API to a Date object
   * @param dateString The date string from API (usually in ISO format)
   * @returns Date object
   */
  parseApiDate: (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    
    try {
      return new Date(dateString);
    } catch (error) {
      console.error("Date parsing error:", error);
      return null;
    }
  },
  
  /**
   * Format a date for API submission (ISO format with time zone)
   * @param date The date to format
   * @returns ISO date string
   */
  formatForApi: (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString();
    } catch (error) {
      console.error("API date formatting error:", error);
      return null;
    }
  },
  
  /**
   * Format a date to YYYY-MM-DD string
   * @param date The date to format 
   * @returns YYYY-MM-DD formatted string or null if invalid
   */
  formatToYYYYMMDD: (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Format as YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("YYYY-MM-DD formatting error:", error);
      return null;
    }
  },

  /**
   * Calculate days between two dates
   * @param date1 First date
   * @param date2 Second date (default: today)
   * @returns Number of days between dates
   */
  daysBetween: (date1: Date | string | null | undefined, date2?: Date | string): number => {
    if (!date1) return 0;
    
    try {
      const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
      const d2 = date2 ? (typeof date2 === 'string' ? new Date(date2) : date2) : new Date();
      
      // Convert time difference to days
      const timeDiff = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch (error) {
      console.error("Days calculation error:", error);
      return 0;
    }
  }
};

/**
 * Format dates for display consistently across the application
 */
export function formatDisplayDate(dateInput: string | Date | null | undefined): string {
  return dateUtils.formatDate(dateInput);
}

/**
 * Create a utility function to create a countrires array
 * @returns Array of countries with name and code
 */
export function createCountriesArray() {
  return [
    { name: "United States", code: "US" },
    { name: "Afghanistan", code: "AF" },
    { name: "Albania", code: "AL" },
    // ... other countries
  ];
}
