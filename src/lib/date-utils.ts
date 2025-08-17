/**
 * Utility functions for date formatting and manipulation
 * Using native Date methods to avoid adding date-fns dependency
 */

/**
 * Format date using various patterns
 */
export function format(date: Date, formatStr: string): string {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (formatStr) {
    case 'MMMM d, yyyy':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'MMM d':
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'yyyy-MM-dd':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Add months to date
 */
export function addMonths(date: Date, amount: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Safely convert date values for form inputs
 * Handles Date objects, strings, and various date formats
 */
export function formatDateForInput(dateValue: Date | string | null | undefined): string {
  if (!dateValue) return '';
  
  try {
    let date: Date;
    
    if (typeof dateValue === 'string') {
      // Handle different date string formats
      if (dateValue.includes('/')) {
        // Handle DD/MM/YYYY format
        const [day, month, year] = dateValue.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = dateValue;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD for input type="date"
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return '';
  }
}

/**
 * Convert date string to Date object for form submission
 */
export function convertDateStringToDate(dateValue: Date | string | null | undefined): Date | undefined {
  if (!dateValue) return undefined;
  
  try {
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return dateValue;
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return undefined;
  }
}

/**
 * Format date for display (e.g., "Aug 13, 2025")
 */
export function formatDateForDisplay(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
}