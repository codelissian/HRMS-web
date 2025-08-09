// Utility functions for date formatting and manipulation
// Using native Date methods to avoid adding date-fns dependency

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

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, amount: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}