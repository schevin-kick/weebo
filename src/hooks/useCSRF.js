/**
 * CSRF Token Management Hook
 * Fetches and stores CSRF token for authenticated requests
 */

import { useState, useEffect, useCallback } from 'react';

let cachedToken = null;
let tokenPromise = null;

/**
 * Fetch CSRF token from server
 */
async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/auth/csrf', {
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      console.warn('[CSRF] Failed to fetch token:', response.status);
      return null;
    }

    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('[CSRF] Error fetching token:', error);
    return null;
  }
}

/**
 * Get CSRF token (with caching and deduplication)
 */
export async function getCSRFToken() {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }

  // Deduplicate concurrent requests
  if (tokenPromise) {
    return tokenPromise;
  }

  // Fetch new token
  tokenPromise = fetchCSRFToken().then((token) => {
    cachedToken = token;
    tokenPromise = null;
    return token;
  });

  return tokenPromise;
}

/**
 * Clear cached CSRF token (call on logout)
 */
export function clearCSRFToken() {
  cachedToken = null;
  tokenPromise = null;
}

/**
 * Update cached CSRF token (call when server returns a new token)
 * This is used when the session regenerates and a new CSRF token is issued
 * @param {string} newToken - The new CSRF token from the server
 */
export function updateCSRFToken(newToken) {
  if (newToken) {
    cachedToken = newToken;
    tokenPromise = null;
    console.log('[CSRF] Token updated from server');
  }
}

/**
 * Hook to use CSRF token in components
 */
export function useCSRF() {
  const [token, setToken] = useState(cachedToken);
  const [loading, setLoading] = useState(!cachedToken);

  useEffect(() => {
    if (!cachedToken) {
      getCSRFToken().then((newToken) => {
        setToken(newToken);
        setLoading(false);
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    cachedToken = null; // Clear cache
    setLoading(true);
    const newToken = await getCSRFToken();
    setToken(newToken);
    setLoading(false);
    return newToken;
  }, []);

  return { token, loading, refreshToken };
}

/**
 * Enhanced fetch with automatic CSRF token inclusion
 * Use this instead of regular fetch for POST/PUT/PATCH/DELETE
 * Also handles automatic CSRF token refresh from server responses
 */
export async function fetchWithCSRF(url, options = {}) {
  const method = options.method?.toUpperCase() || 'GET';

  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCSRFToken();

    if (token) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': token,
      };
    } else {
      console.warn('[CSRF] No token available for request:', method, url);
    }
  }

  const response = await fetch(url, options);

  // Check if server returned a new CSRF token (session regeneration)
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    try {
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();

      if (data.newCsrfToken) {
        updateCSRFToken(data.newCsrfToken);
      }
    } catch (error) {
      // Ignore parsing errors, response will be handled by caller
    }
  }

  return response;
}

export default useCSRF;
