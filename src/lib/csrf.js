import { randomBytes, createHash } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'weebo_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a CSRF token for storage in cookie
 * @param {string} token - CSRF token
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Set CSRF token cookie
 * @param {string} token - CSRF token to store
 */
export async function setCSRFCookie(token) {
  const cookieStore = await cookies();
  const hashedToken = hashToken(token);

  cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * Get CSRF token from cookie
 * @returns {Promise<string|null>} CSRF token hash or null
 */
export async function getCSRFCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Validate CSRF token from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<boolean>} True if token is valid
 */
export async function validateCSRFToken(request) {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!headerToken) {
    console.warn('[CSRF] No CSRF token in header');
    return false;
  }

  // Get hashed token from cookie
  const cookieToken = await getCSRFCookie();

  if (!cookieToken) {
    console.warn('[CSRF] No CSRF token in cookie');
    return false;
  }

  // Hash the header token and compare with cookie
  const hashedHeaderToken = hashToken(headerToken);

  if (hashedHeaderToken !== cookieToken) {
    console.warn('[CSRF] CSRF token mismatch');
    return false;
  }

  return true;
}

/**
 * Clear CSRF cookie
 */
export async function clearCSRFCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * Middleware wrapper for CSRF protection
 * Only validates POST, PUT, PATCH, DELETE requests
 * @param {function} handler - Route handler function
 * @param {object} options - Options { validateMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] }
 * @returns {function} Wrapped handler with CSRF protection
 */
export function withCSRFProtection(handler, options = {}) {
  const validateMethods = options.validateMethods || ['POST', 'PUT', 'PATCH', 'DELETE'];

  return async (request, ...args) => {
    const method = request.method;

    // Only validate specified methods (default: POST, PUT, PATCH, DELETE)
    if (validateMethods.includes(method)) {
      const isValid = await validateCSRFToken(request);

      if (!isValid) {
        return new Response(
          JSON.stringify({
            error: 'Invalid CSRF token',
            message: 'CSRF token validation failed. Please refresh the page and try again.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Token is valid or method doesn't require validation
    return handler(request, ...args);
  };
}

/**
 * Check if CSRF protection should be enforced
 * Can be disabled via environment variable for development
 * @returns {boolean} True if CSRF protection is enabled
 */
export function isCSRFEnabled() {
  // Allow disabling in development for testing
  if (process.env.DISABLE_CSRF === 'true' && process.env.NODE_ENV !== 'production') {
    console.warn('[CSRF] CSRF protection is disabled (development only)');
    return false;
  }
  return true;
}

/**
 * Safe CSRF validation that returns detailed result
 * @param {Request} request - Next.js request object
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
export async function checkCSRF(request) {
  if (!isCSRFEnabled()) {
    return { valid: true };
  }

  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return { valid: false, reason: 'Missing CSRF token in header' };
  }

  const cookieToken = await getCSRFCookie();
  if (!cookieToken) {
    return { valid: false, reason: 'Missing CSRF token in cookie' };
  }

  const hashedHeaderToken = hashToken(headerToken);
  if (hashedHeaderToken !== cookieToken) {
    return { valid: false, reason: 'CSRF token mismatch' };
  }

  return { valid: true };
}

export default {
  generateCSRFToken,
  setCSRFCookie,
  getCSRFCookie,
  validateCSRFToken,
  clearCSRFCookie,
  withCSRFProtection,
  isCSRFEnabled,
  checkCSRF,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
};
