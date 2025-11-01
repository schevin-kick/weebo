/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkSubscriptionAccess } from '@/lib/subscriptionHelpers';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription access (with 3-tier caching)
    const subscriptionInfo = await checkSubscriptionAccess(session.id, session);

    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('[Subscription] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status', details: error.message },
      { status: 500 }
    );
  }
}
