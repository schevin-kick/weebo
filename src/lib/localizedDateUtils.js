/**
 * Localized Date/Time Utilities for Weebo Dashboard
 * Provides locale-aware date and time formatting
 */

import { format, parseISO } from 'date-fns';
import { enUS, zhTW } from 'date-fns/locale';

// Map of locale codes to date-fns locale objects
const localeMap = {
  'en': enUS,
  'en-US': enUS,
  'zh-tw': zhTW,
  'zh-TW': zhTW,
};

/**
 * Get date-fns locale object from locale code
 * @param {string} localeCode - Locale code (e.g., 'en', 'zh-tw')
 * @returns {Locale} date-fns locale object
 */
function getDateFnsLocale(localeCode) {
  return localeMap[localeCode] || enUS;
}

/**
 * Format date and time for display (localized)
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code
 * @returns {string} Formatted date and time (e.g., "Jan 15, 2025 at 2:30 PM" or "2025年1月15日 下午2:30")
 */
export function formatDateTime(date, locale = 'en') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dateFnsLocale = getDateFnsLocale(locale);

  // For Chinese, use a different format
  if (locale.startsWith('zh')) {
    return format(dateObj, "yyyy年M月d日 aaa h:mm", { locale: dateFnsLocale });
  }

  return format(dateObj, "MMM d, yyyy 'at' h:mm a", { locale: dateFnsLocale });
}

/**
 * Format duration in minutes to human-readable string (localized)
 * @param {number} minutes - Duration in minutes
 * @param {Object} translations - Translation function or object with hour/minute keys
 * @returns {string} Formatted duration (e.g., "1h 30m" or "1小時 30分鐘")
 */
export function formatDuration(minutes, translations) {
  if (!minutes) return `0${translations?.minute || 'm'}`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // If translations is a function (from useTranslations)
  if (typeof translations === 'function') {
    if (hours === 0) return `${mins}${translations('minute')}`;
    if (mins === 0) return `${hours}${translations('hour')}`;
    return `${hours}${translations('hour')} ${mins}${translations('minute')}`;
  }

  // If translations is an object with hour/minute properties
  if (translations && typeof translations === 'object') {
    if (hours === 0) return `${mins}${translations.minute}`;
    if (mins === 0) return `${hours}${translations.hour}`;
    return `${hours}${translations.hour} ${mins}${translations.minute}`;
  }

  // Fallback to English
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
