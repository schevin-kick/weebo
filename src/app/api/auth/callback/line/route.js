import { redirect } from 'next/navigation';
import { exchangeLINECode, getLINEProfile, createSession, setSessionCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateAccess } from '@/lib/subscriptionHelpers';

/**
 * GET /api/auth/callback/line
 * Handles LINE OAuth callback for business owner login
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

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

    // Create or update business owner in database
    const owner = await prisma.businessOwner.upsert({
      where: { lineUserId: lineProfile.userId },
      update: {
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
      },
      create: {
        lineUserId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        email: lineProfile.email || null,
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

    // Create session token WITH subscription data for Tier 1 caching
    const sessionToken = await createSession({
      id: owner.id,
      lineUserId: owner.lineUserId,
      displayName: owner.displayName,
      pictureUrl: owner.pictureUrl,
      email: owner.email,
    }, subscriptionData);

    // Set session cookie
    const csrfToken = await setSessionCookie(sessionToken);
    console.log(`[Auth] Session cookie set for user ${owner.id}, CSRF token: ${csrfToken ? 'generated' : 'failed'}`);
    console.log(`[Auth] Cookie config: secure=true, sameSite=none, httpOnly=true`);

    // Redirect to dashboard (will auto-route to setup if no businesses)
    redirect('/dashboard');
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - let them propagate
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('LINE authentication error:', error);
    return redirect('/dashboard?error=auth_failed');
  }
}
