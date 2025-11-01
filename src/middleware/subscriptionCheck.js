/**
 * Subscription Check Middleware
 * Use this to protect API routes that require an active subscription
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkSubscriptionAccess } from '@/lib/subscriptionHelpers';

/**
 * Middleware to require active subscription
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse|null>} Error response if no access, null if access granted
 */
export async function requireSubscription(request) {
  try {
    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription access (uses 3-tier caching)
    const { hasAccess, status, daysLeft, needsPayment } = await checkSubscriptionAccess(
      session.id,
      session
    );

    if (!hasAccess) {
      console.log(`[Subscription] Access denied for user ${session.id} - status: ${status}`);

      return NextResponse.json(
        {
          error: 'Subscription required',
          status,
          daysLeft,
          needsPayment,
          message: getAccessDeniedMessage(status),
        },
        { status: 403 }
      );
    }

    // Access granted
    return null;
  } catch (error) {
    console.error('[Subscription] Middleware error:', error);

    // Fail open - allow access if subscription check fails
    // This prevents locking out users if there's a technical issue
    console.warn('[Subscription] Allowing access due to check failure');
    return null;
  }
}

/**
 * Get user-friendly message for access denial
 * @param {string} status - Subscription status
 * @returns {string} Message
 */
function getAccessDeniedMessage(status) {
  switch (status) {
    case 'trial_expired':
      return 'Your free trial has ended. Please subscribe to continue.';
    case 'past_due':
      return 'Your payment is past due. Please update your payment method.';
    case 'canceled':
      return 'Your subscription has been canceled. Please resubscribe to continue.';
    case 'unpaid':
      return 'Your subscription is unpaid. Please update your payment method.';
    default:
      return 'Active subscription required to access this feature.';
  }
}

export default requireSubscription;
