import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateCSRFToken, setCSRFCookie } from '@/lib/csrf';

/**
 * GET /api/auth/csrf
 * Get or generate a CSRF token for the current session
 * Returns the token so client can include it in requests
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Generate a new CSRF token
  const csrfToken = generateCSRFToken();

  // Set the cookie (hashed version)
  await setCSRFCookie(csrfToken);

  // Return the plain token to the client
  return NextResponse.json({
    csrfToken,
    message: 'Include this token in X-CSRF-Token header for all state-changing requests',
  });
}
