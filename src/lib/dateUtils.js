/**
 * Date/Time Utilities for Kitsune Dashboard
 * Using date-fns for date manipulation and formatting
 */

import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  addMinutes,
} from 'date-fns';

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date
 */
export function formatDate(date, formatString = 'MMM d, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format time for display
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string (default: 'h:mm a')
 * @returns {string} Formatted time
 */
export function formatTime(date, formatString = 'h:mm a') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time (e.g., "Jan 15, 2025 at 2:30 PM")
 */
export function formatDateTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format date with relative time if recent (Today, Tomorrow, Yesterday)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "Today", "Tomorrow", "Jan 15")
 */
export function formatRelativeDate(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';

  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format date and time with relative date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted (e.g., "Today at 2:30 PM", "Tomorrow at 10:00 AM")
 */
export function formatRelativeDateTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  const relativeDate = formatRelativeDate(dateObj);
  const time = formatTime(dateObj);

  return `${relativeDate} at ${time}`;
}

/**
 * Get distance to now (e.g., "in 2 hours", "3 days ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Distance string
 */
export function getDistanceToNow(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get start and end of today
 * @returns {{ start: Date, end: Date }}
 */
export function getTodayRange() {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

/**
 * Get start and end of current week
 * @returns {{ start: Date, end: Date }}
 */
export function getWeekRange() {
  const now = new Date();
  return {
    start: startOfWeek(now),
    end: endOfWeek(now),
  };
}

/**
 * Get start and end of current month
 * @returns {{ start: Date, end: Date }}
 */
export function getMonthRange() {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Calculate end time from start time and duration
 * @param {Date|string} startTime - Start time
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Date} End time
 */
export function calculateEndTime(startTime, durationMinutes) {
  const startDate = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  return addMinutes(startDate, durationMinutes);
}

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m", "45m")
 */
export function formatDuration(minutes) {
  if (!minutes) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPast(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export function isFuture(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
}

/**
 * Parse ISO string to Date object
 * @param {string} isoString - ISO date string
 * @returns {Date|null} Date object or null if invalid
 */
export function parseISODate(isoString) {
  if (!isoString) return null;
  try {
    return parseISO(isoString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}
