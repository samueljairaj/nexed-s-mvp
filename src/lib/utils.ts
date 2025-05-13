import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string or Date object
 * @param date - String date or Date object
 * @param dateFormat - Format string for date-fns
 * @returns Formatted date string or "Not available" if invalid
 */
export function formatDate(date: Date | string | null | undefined, dateFormat: string = 'MMM dd, yyyy'): string {
  if (!date) return 'Not available';
  
  try {
    // If string, parse with parseISO first
    if (typeof date === 'string') {
      return format(parseISO(date), dateFormat);
    }
    
    // Otherwise assume it's a Date object
    return format(date, dateFormat);
  } catch (error) {
    console.error('Date formatting error:', error);
    return typeof date === 'string' ? date : 'Invalid date';
  }
}
