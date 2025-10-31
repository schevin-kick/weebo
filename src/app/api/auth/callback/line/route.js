import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { exchangeLINECode, getLINEProfile, createSession, setSessionCookie, getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/callback/line
 * Handles LINE OAuth callback for both login and messaging API connection
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('LINE OAuth error:', error);
    return redirect('/setup?error=auth_failed');
  }

  if (!code) {
    return redirect('/setup?error=missing_code');
  }

  // Check if this is a messaging OAuth flow (has state cookie)
  const cookieStore = await cookies();
  const storedState = cookieStore.get('line_oauth_state')?.value;
  const businessId = cookieStore.get('line_oauth_business_id')?.value;
  const isMessagingOAuth = storedState && state && storedState === state;

  try {
    // Exchange code for access token
    const tokenData = await exchangeLINECode(code);

    if (isMessagingOAuth) {
      // MESSAGING OAUTH FLOW - Save tokens to business
      const session = await getSession();

      if (!session) {
        cookieStore.delete('line_oauth_state');
        cookieStore.delete('line_oauth_business_id');
        return redirect('/api/auth/login');
      }

      // Clear OAuth cookies
      cookieStore.delete('line_oauth_state');
      cookieStore.delete('line_oauth_business_id');

      // Find business owned by this user
      let targetBusiness;

      if (businessId) {
        targetBusiness = await prisma.business.findFirst({
          where: {
            id: businessId,
            ownerId: session.id,
          },
        });
      } else {
        targetBusiness = await prisma.business.findFirst({
          where: {
            ownerId: session.id,
          },
        });
      }

      if (!targetBusiness) {
        return redirect('/dashboard?error=no_business');
      }

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      // Save tokens to business
      await prisma.business.update({
        where: { id: targetBusiness.id },
        data: {
          lineChannelAccessToken: tokenData.access_token,
          lineRefreshToken: tokenData.refresh_token,
          lineTokenExpiresAt: expiresAt,
        },
      });

      // Redirect to messaging settings page with success message (outside try/catch)
      redirect(`/dashboard/${targetBusiness.id}/messaging?success=line_connected`);
    } else {
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
    }
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - let them propagate
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('LINE authentication error:', error);

    if (isMessagingOAuth && businessId) {
      return redirect(`/dashboard/${businessId}/messaging?error=oauth_callback_failed`);
    }

    return redirect('/setup?error=auth_failed');
  }
}
