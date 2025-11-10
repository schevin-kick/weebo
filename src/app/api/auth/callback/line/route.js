import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { exchangeLINECode, getLINEProfile, createSession, setSessionCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateAccess } from '@/lib/subscriptionHelpers';
import { detectLocaleFromRequest } from '@/lib/localeUtils';

/**
 * GET /api/auth/callback/line
 * Handles LINE OAuth callback for business owner login
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Get return URL from cookie if set
  const cookieStore = await cookies();
  const returnUrl = cookieStore.get('auth_return_url')?.value;

  // Handle OAuth errors
  if (error) {
    console.error('LINE OAuth error:', error);
    return redirect('/dashboard?error=auth_failed');
  }

  if (!code) {
    return redirect('/dashboard?error=missing_code');
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeLINECode(code);

    // LOGIN FLOW - Create/update business owner
    const lineProfile = await getLINEProfile(tokenData.access_token);

    // Detect language from request (cookies, Accept-Language header)
    const language = detectLocaleFromRequest(request);

    // Create or update business owner in database
    const owner = await prisma.businessOwner.upsert({
      where: { lineUserId: lineProfile.userId },
      update: {
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        language: language,
      },
      create: {
        lineUserId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        email: lineProfile.email || null,
        language: language,
      },
      // Fetch subscription fields for session caching
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        pictureUrl: true,
        email: true,
        subscriptionStatus: true,
        trialStartsAt: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        canceledAt: true,
      },
    });

    // Calculate subscription access for session caching
    const subscriptionData = calculateAccess(owner);
    console.log(`[Auth] Login successful for user ${owner.id} - subscription status: ${subscriptionData.status}`);

    // Fetch businesses user has permission to access
    const permissions = await prisma.businessPermission.findMany({
      where: { lineUserId: owner.lineUserId },
      select: { businessId: true },
    });
    const permittedBusinessIds = permissions.map(p => p.businessId);

    // Create session token WITH subscription data and permissions for fast access checks
    const sessionToken = await createSession({
      id: owner.id,
      lineUserId: owner.lineUserId,
      displayName: owner.displayName,
      pictureUrl: owner.pictureUrl,
      email: owner.email,
    }, subscriptionData, permittedBusinessIds);

    // Set session cookie
    const csrfToken = await setSessionCookie(sessionToken);
    console.log(`[Auth] Session cookie set for user ${owner.id}, CSRF token: ${csrfToken ? 'generated' : 'failed'}`);
    console.log(`[Auth] Cookie config: secure=true, sameSite=none, httpOnly=true`);

    // Clear return URL cookie after reading
    if (returnUrl) {
      cookieStore.delete('auth_return_url');
    }

    // Redirect to return URL if set, otherwise dashboard
    redirect(returnUrl || '/dashboard');
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - let them propagate
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('LINE authentication error:', error);
    return redirect('/dashboard?error=auth_failed');
  }
}
