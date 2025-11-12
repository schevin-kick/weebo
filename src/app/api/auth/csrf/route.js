import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateCSRFToken, setCSRFCookie } from '@/lib/csrf';

/**
 * GET /api/auth/csrf
 * Get or generate a CSRF token for the current session
 * Returns the token so client can include it in requests
 * Note: Also works for unauthenticated users (e.g., public booking pages)
 */
export async function GET() {
  // Session is optional - CSRF tokens work for both authenticated and unauthenticated users
  // The booking detail page is public and needs CSRF protection too
  const session = await getSession();

  // Generate a new CSRF token
  const csrfToken = generateCSRFToken();

  // Set the cookie (hashed version)
  await setCSRFCookie(csrfToken);

  // Return the plain token to the client
  return NextResponse.json({
    csrfToken,
    authenticated: !!session,
    message: 'Include this token in X-CSRF-Token header for all state-changing requests',
  });
}
