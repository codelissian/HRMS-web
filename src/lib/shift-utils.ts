/**
 * Converts a time string (HH:MM) to ISO format for a specific date
 * @param time - Time string in HH:MM format (e.g., "09:00")
 * @param dateString - Optional date string in YYYY-MM-DD format (defaults to "2025-08-10")
 * @returns ISO string (e.g., "2025-08-10T09:00:00Z")
 */
export function convertTimeToISO(time: string, dateString: string = "2025-08-10"): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create date object with the specified date
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCHours(hours, minutes, 0, 0);
  
  return date.toISOString();
}

/**
 * Gets the organisation_id from localStorage
 * @returns organisation_id string or empty string if not found
 */
export function getOrganisationId(): string {
  try {
    // Try to get from localStorage first
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.organisation_id) {
        return parsedUserData.organisation_id;
      }
    }
    
    // If not in localStorage, try to extract from JWT token
    const token = localStorage.getItem('hrms_auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.organisations && payload.organisations.length > 0) {
          return payload.organisations[0].id;
        }
      } catch (error) {
        // JWT parsing failed, continue to fallback
      }
    }
    
    // Fallback to default or empty string
    return '';
  } catch (error) {
    return '';
  }
}

/**
 * Formats time for display (HH:MM) in 24-hour format
 * @param isoString - ISO time string
 * @returns Formatted time string (HH:MM) in 24-hour format
 */
export function formatTimeForDisplay(isoString: string): string {
  try {
    const date = new Date(isoString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '00:00'; // Return default time if parsing fails
    }
    
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    // Check if hours or minutes are NaN
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) {
      return '00:00'; // Return default time if parsing fails
    }
    
    return `${hours}:${minutes}`;
  } catch (error) {
    return '00:00'; // Return default time if any error occurs
  }
}

/**
 * Formats time for display (HH:MM) in 24-hour format from any date object
 * @param date - Date object
 * @returns Formatted time string (HH:MM) in 24-hour format
 */
export function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Validates if a time string is in correct 24-hour format (HH:MM)
 * @param time - Time string to validate
 * @returns boolean indicating if time is valid
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Converts 12-hour format to 24-hour format
 * @param time12h - Time in 12-hour format (e.g., "9:30 AM")
 * @returns Time in 24-hour format (e.g., "09:30")
 */
export function convert12To24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00';
  } else if (modifier === 'PM') {
    hours = (parseInt(hours) + 12).toString();
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
} 