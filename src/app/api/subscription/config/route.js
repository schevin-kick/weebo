/**
 * GET /api/subscription/config
 * Get subscription pricing configuration from Stripe
 */

import { NextResponse } from 'next/server';
import { getSubscriptionConfig } from '@/lib/subscriptionConfig';

export async function GET(request) {
  try {
    const config = await getSubscriptionConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error('[API] Get subscription config error:', error);
    return NextResponse.json(
      { error: 'Failed to load subscription configuration' },
      { status: 500 }
    );
  }
}
