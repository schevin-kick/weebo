import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLINELoginUrl } from '@/lib/auth';

/**
 * GET /api/auth/login
 * Initiates LINE Login flow
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('returnUrl');

  // Store return URL in cookie if provided
  if (returnUrl) {
    const cookieStore = await cookies();
    cookieStore.set('auth_return_url', returnUrl, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });
  }

  const lineLoginUrl = getLINELoginUrl();
  redirect(lineLoginUrl);
}
