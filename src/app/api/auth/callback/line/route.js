import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { exchangeLINECode, getLINEProfile, createSession, setSessionCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/auth/callback/line
 * Handles LINE OAuth callback
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

    // Get LINE user profile
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
  } catch (error) {
    console.error('LINE authentication error:', error);
    return redirect('/setup?error=auth_failed');
  }

  // Redirect to business dashboard (outside try/catch to avoid catching NEXT_REDIRECT)
  redirect('/setup');
}
