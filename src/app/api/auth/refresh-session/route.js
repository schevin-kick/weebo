/**
 * POST /api/auth/refresh-session
 * Refresh the session cookie with fresh subscription data
 * Call this after subscription changes (Stripe webhooks, etc.)
 */

import { NextResponse } from 'next/server';
import { getSession, createSession, setSessionCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateAccess } from '@/lib/subscriptionHelpers';

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fresh subscription data from database
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.id },
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

    if (!owner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate fresh subscription access
    const subscriptionData = calculateAccess(owner);

    // Create new session token with updated subscription data
    const newSessionToken = await createSession({
      id: owner.id,
      lineUserId: owner.lineUserId,
      displayName: owner.displayName,
      pictureUrl: owner.pictureUrl,
      email: owner.email,
    }, subscriptionData);

    const newCsrfToken = await setSessionCookie(newSessionToken);

    console.log(`[Auth] Refreshed session for user ${owner.id} - subscription status: ${subscriptionData.status}`);

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
      newCsrfToken,
    });
  } catch (error) {
    console.error('[Auth] Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session', details: error.message },
      { status: 500 }
    );
  }
}
