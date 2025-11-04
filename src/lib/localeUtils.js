/**
 * Locale Utilities
 * Helper functions for detecting and managing user locale preferences
 */

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ['en', 'zh-tw'];
export const DEFAULT_LOCALE = 'en';

/**
 * Detect locale from Next.js request headers
 * @param {object} request - Next.js request object with headers
 * @returns {string} Locale code ('en' or 'zh-tw')
 */
export function detectLocaleFromRequest(request) {
  // Try to get locale from cookies
  const cookieLocale = request.cookies?.get?.('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Try to get from headers
  const acceptLanguage = request.headers?.get?.('accept-language') || '';

  // Check for Traditional Chinese
  if (acceptLanguage.includes('zh-TW') || acceptLanguage.includes('zh-Hant')) {
    return 'zh-tw';
  }

  // Check for Chinese (might be simplified, but default to traditional for Taiwan)
  if (acceptLanguage.startsWith('zh')) {
    return 'zh-tw';
  }

  return DEFAULT_LOCALE;
}

/**
 * Detect locale from URL pathname
 * @param {string} pathname - URL pathname (e.g., '/en/book', '/zh-tw/dashboard')
 * @returns {string} Locale code ('en' or 'zh-tw')
 */
export function detectLocaleFromPathname(pathname) {
  if (!pathname) return DEFAULT_LOCALE;

  // Extract locale from pathname like /en/... or /zh-tw/...
  const match = pathname.match(/^\/([^/]+)/);
  if (match && SUPPORTED_LOCALES.includes(match[1])) {
    return match[1];
  }

  return DEFAULT_LOCALE;
}

/**
 * Normalize locale string to supported format
 * @param {string} locale - Locale string to normalize
 * @returns {string} Normalized locale code ('en' or 'zh-tw')
 */
export function normalizeLocale(locale) {
  if (!locale) return DEFAULT_LOCALE;

  const normalized = locale.toLowerCase();

  // Handle various Chinese Traditional formats
  if (normalized.includes('zh-tw') || normalized.includes('zh-hant') || normalized === 'zh_tw') {
    return 'zh-tw';
  }

  // Handle English variants
  if (normalized.startsWith('en')) {
    return 'en';
  }

  return DEFAULT_LOCALE;
}

/**
 * Get customer's preferred locale
 * Checks customer object, falls back to default
 * @param {object} customer - Customer object with optional language field
 * @returns {string} Locale code ('en' or 'zh-tw')
 */
export function getCustomerLocale(customer) {
  if (customer?.language && SUPPORTED_LOCALES.includes(customer.language)) {
    return customer.language;
  }
  return DEFAULT_LOCALE;
}
