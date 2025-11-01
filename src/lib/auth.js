import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { generateCSRFToken, setCSRFCookie } from './csrf';

const SESSION_COOKIE_NAME = 'kitsune_session';
const SESSION_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-in-production'
);

/**
 * Create a session token for authenticated user
 * @param {object} user - User data { id, lineUserId, displayName, pictureUrl, email }
 * @param {object} subscription - Optional subscription data for caching
 * @returns {Promise<string>} JWT token
 */
export async function createSession(user, subscription = null) {
  const payload = { user };

  // Include subscription data for session-level caching
  if (subscription) {
    payload.subscription = subscription;
    payload.subscriptionCheckedAt = new Date().toISOString();
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days expiration
    .sign(SESSION_SECRET);

  return token;
}

/**
 * Verify and decode session token
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} User data or null if invalid
 */
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload.user;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session from cookies (server-side only)
 * @returns {Promise<object|null>} User data or null
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Set session cookie (server-side only)
 * Also generates and sets CSRF token
 * @param {string} token - JWT token
 */
export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  // Generate and set CSRF token
  const csrfToken = generateCSRFToken();
  await setCSRFCookie(csrfToken);

  // Return CSRF token so it can be sent to client
  return csrfToken;
}

/**
 * Clear session cookie (logout)
 * Also clears CSRF token
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  // Also clear CSRF cookie
  const { clearCSRFCookie } = await import('./csrf');
  await clearCSRFCookie();
}

/**
 * Exchange LINE authorization code for access token
 * @param {string} code - Authorization code from LINE
 * @returns {Promise<object>} LINE token response
 */
export async function exchangeLINECode(code) {
  const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/line`,
    client_id: process.env.LINE_LOGIN_CHANNEL_ID,
    client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange LINE authorization code');
  }

  return response.json();
}

/**
 * Get LINE user profile
 * @param {string} accessToken - LINE access token
 * @returns {Promise<object>} LINE profile { userId, displayName, pictureUrl, email }
 */
export async function getLINEProfile(accessToken) {
  const profileUrl = 'https://api.line.me/v2/profile';

  const response = await fetch(profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch LINE profile');
  }

  return response.json();
}

/**
 * Generate LINE Login URL
 * @param {string} state - State parameter for CSRF protection
 * @param {boolean} requestBotScope - Whether to request bot scope for Messaging API
 * @returns {string} LINE OAuth URL
 */
export function getLINELoginUrl(state = null, requestBotScope = false) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINE_LOGIN_CHANNEL_ID,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/line`,
    state: state || Math.random().toString(36).substring(7),
    scope: requestBotScope ? 'profile openid email bot' : 'profile openid email',
  });

  // Force user to add bot as friend when requesting bot scope
  if (requestBotScope) {
    params.append('bot_prompt', 'aggressive');
  }

  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

/**
 * Refresh LINE access token using refresh token
 * @param {string} refreshToken - LINE refresh token
 * @returns {Promise<object>} New token response { access_token, refresh_token, expires_in }
 */
export async function refreshLINEToken(refreshToken) {
  const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINE_LOGIN_CHANNEL_ID,
    client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh LINE token: ${error.error_description || error.error}`);
  }

  return response.json();
}

export default {
  createSession,
  verifySession,
  getSession,
  setSessionCookie,
  clearSession,
  exchangeLINECode,
  getLINEProfile,
  getLINELoginUrl,
  refreshLINEToken,
};
