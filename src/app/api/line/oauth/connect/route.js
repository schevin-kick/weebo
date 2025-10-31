/**
 * LINE OAuth Connect Route
 * Initiates LINE OAuth flow with bot scope for Messaging API access
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getLINELoginUrl } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    // Get businessId from query parameters (if provided)
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state and businessId in cookies for verification in callback
    const cookieStore = await cookies();
    cookieStore.set('line_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    if (businessId) {
      cookieStore.set('line_oauth_business_id', businessId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });
    }

    // Generate LINE OAuth URL with bot scope
    const lineOAuthUrl = getLINELoginUrl(state, true); // true = request bot scope

    return NextResponse.redirect(lineOAuthUrl);
  } catch (error) {
    console.error('LINE OAuth connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LINE OAuth flow' },
      { status: 500 }
    );
  }
}
