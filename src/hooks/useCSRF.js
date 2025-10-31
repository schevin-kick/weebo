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

  return fetch(url, options);
}

export default useCSRF;
