/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */

import { NextResponse } from 'next/server';
import { getSession, createSession, setSessionCookie } from '@/lib/auth';
import { checkSubscriptionAccess } from '@/lib/subscriptionHelpers';

const SESSION_CACHE_TTL = 300000; // 5 minutes in milliseconds

export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if bypass cache is requested (for billing pages and Stripe redirects)
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass') === 'true';

    if (bypassCache) {
      console.log(`[Subscription] Bypass cache requested for user ${session.id}`);
    }

    // Check if session cache is expired
    let sessionCacheExpired = false;
    if (session.subscription && session.subscriptionCheckedAt) {
      const age = Date.now() - new Date(session.subscriptionCheckedAt).getTime();
      sessionCacheExpired = age >= SESSION_CACHE_TTL;
      if (sessionCacheExpired) {
        console.log(`[Subscription] Session cache expired (age: ${Math.floor(age / 60000)}m) - will refresh`);
      }
    }

    // Check subscription access (with optional cache bypass)
    let subscriptionInfo = await checkSubscriptionAccess(session.id, session, {
      bypassCache
    });

    // If status is "incomplete" and bypass was requested (e.g., returning from Stripe checkout),
    // sync directly from Stripe to get the most up-to-date status (webhooks might be delayed)
    if (subscriptionInfo.status === 'incomplete' && bypassCache) {
      console.log(`[Subscription] Status is "incomplete" with bypass - syncing from Stripe for user ${session.id}`);
      const { syncStripeSubscription } = await import('@/lib/subscriptionHelpers');
      const syncedInfo = await syncStripeSubscription(session.id);
      if (syncedInfo) {
        subscriptionInfo = syncedInfo;
        console.log(`[Subscription] ✓ Synced from Stripe - new status: ${subscriptionInfo.status}`);
      }
    }

    // If session cache expired or bypass was requested, update session cookie with fresh data
    // This ensures subsequent requests can use fresh session cache for 5 more minutes
    let newCsrfToken = null;
    if (sessionCacheExpired || bypassCache) {
      try {
        const newSessionToken = await createSession({
          id: session.id,
          lineUserId: session.lineUserId,
          displayName: session.displayName,
          pictureUrl: session.pictureUrl,
          email: session.email,
        }, subscriptionInfo);
        newCsrfToken = await setSessionCookie(newSessionToken);
        console.log(`[Subscription] ✓ Session cookie refreshed for user ${session.id} - status: ${subscriptionInfo.status}`);
      } catch (error) {
        console.error('[Subscription] Failed to refresh session cookie:', error);
        // Don't fail the request if session update fails
      }
    }

    // Include new CSRF token in response if session was regenerated
    const response = { ...subscriptionInfo };
    if (newCsrfToken) {
      response.newCsrfToken = newCsrfToken;
      console.log(`[Subscription] ✓ Returning new CSRF token to client for user ${session.id}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Subscription] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status', details: error.message },
      { status: 500 }
    );
  }
}
