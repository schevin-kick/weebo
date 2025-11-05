/**
 * Locale Utilities
 * Helper functions for detecting and managing user locale preferences
 */

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ['en', 'zh-tw'];
export const DEFAULT_LOCALE = 'zh-tw'; // Default to Traditional Chinese for Taiwan

/**
 * Detect locale from Next.js request headers
 * @param {object} request - Next.js request object with headers
 * @param {string} fallbackLocale - Optional fallback locale to use instead of DEFAULT_LOCALE
 * @returns {string} Locale code ('en' or 'zh-tw')
 */
export function detectLocaleFromRequest(request, fallbackLocale = null) {
  // Try to get locale from cookies
  const cookieLocale = request.cookies?.get?.('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Try to get from headers
  const acceptLanguage = request.headers?.get?.('accept-language') || '';

  // Check for English first (more specific check)
  if (acceptLanguage.includes('en-US') || acceptLanguage.includes('en-GB') || acceptLanguage.startsWith('en')) {
    return 'en';
  }

  // Check for Traditional Chinese
  if (acceptLanguage.includes('zh-TW') || acceptLanguage.includes('zh-Hant')) {
    return 'zh-tw';
  }

  // Check for Chinese (might be simplified, but default to traditional for Taiwan)
  if (acceptLanguage.startsWith('zh')) {
    return 'zh-tw';
  }

  // Use provided fallback if valid, otherwise use DEFAULT_LOCALE
  if (fallbackLocale && SUPPORTED_LOCALES.includes(fallbackLocale)) {
    return fallbackLocale;
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

/**
 * Translation messages cache
 */
let messagesCache = null;

/**
 * Load translation messages from JSON files
 * @returns {object} Messages object with locale keys
 */
async function loadMessages() {
  if (messagesCache) {
    return messagesCache;
  }

  try {
    const enMessages = await import('@/messages/en.json');
    const zhTwMessages = await import('@/messages/zh-tw.json');

    messagesCache = {
      'en': enMessages.default,
      'zh-tw': zhTwMessages.default
    };

    return messagesCache;
  } catch (error) {
    console.error('Failed to load translation messages:', error);
    return {
      'en': {},
      'zh-tw': {}
    };
  }
}

/**
 * Get nested property from object using dot notation
 * @param {object} obj - Object to search
 * @param {string} path - Dot-notation path (e.g., 'api.contact.success')
 * @returns {any} Value at path or undefined
 */
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Server-side translation function
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @param {string} key - Translation key in dot notation (e.g., 'api.contact.success')
 * @param {object} values - Optional values for interpolation (e.g., {bookingId: '123'})
 * @returns {Promise<string>} Translated string
 */
export async function translate(locale, key, values = {}) {
  const normalizedLocale = normalizeLocale(locale);
  const messages = await loadMessages();

  const message = getNestedProperty(messages[normalizedLocale], key);

  if (!message) {
    console.warn(`Translation missing for key: ${key} in locale: ${normalizedLocale}`);
    return key;
  }

  // Simple interpolation for values like {bookingId}
  let result = message;
  Object.keys(values).forEach(valueKey => {
    result = result.replace(new RegExp(`\\{${valueKey}\\}`, 'g'), values[valueKey]);
  });

  return result;
}
