import { redirect } from 'next/navigation';
import { exchangeLINECode, getLINEProfile, createSession, setSessionCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    return redirect('/setup?error=auth_failed');
  }

  if (!code) {
    return redirect('/setup?error=missing_code');
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
    });

    // Create session token
    const sessionToken = await createSession({
      id: owner.id,
      lineUserId: owner.lineUserId,
      displayName: owner.displayName,
      pictureUrl: owner.pictureUrl,
      email: owner.email,
    });

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Redirect to setup (outside try/catch to avoid catching NEXT_REDIRECT)
    redirect('/setup');
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - let them propagate
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('LINE authentication error:', error);
    return redirect('/setup?error=auth_failed');
  }
}
