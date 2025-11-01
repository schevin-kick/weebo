/**
 * Subscription Helpers
 * Core logic for managing trials, subscriptions, and access control
 * Implements 3-tier caching: Session → Redis → Database
 */

import prisma from './prisma';
import { redis, redisEnabled } from './redis';
import stripe from './stripe';
import { getTrialDays } from './subscriptionConfig';

const REDIS_CACHE_TTL = 600; // 10 minutes
const SESSION_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Start a free trial for a business owner
 * Trial duration is configurable via SUBSCRIPTION_TRIAL_DAYS environment variable
 * @param {string} businessOwnerId - BusinessOwner ID
 * @returns {Promise<object>} Updated business owner
 */
export async function startTrial(businessOwnerId) {
  const now = new Date();
  const trialDays = getTrialDays();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const owner = await prisma.businessOwner.update({
    where: { id: businessOwnerId },
    data: {
      subscriptionStatus: 'trialing',
      trialStartsAt: now,
      trialEndsAt: trialEndsAt,
    },
  });

  // Invalidate cache
  if (redisEnabled && redis) {
    await redis.del(`subscription:${businessOwnerId}`).catch((err) => {
      console.error('[Subscription] Failed to invalidate Redis cache:', err);
    });
  }

  console.log(`[Subscription] Trial started for user ${businessOwnerId} - ends ${trialEndsAt.toISOString()}`);

  return owner;
}

/**
 * Calculate subscription access based on owner data
 * Pure function - no external calls
 * @param {object} owner - BusinessOwner record with subscription fields
 * @returns {object} Access information
 */
export function calculateAccess(owner) {
  if (!owner) {
    return {
      hasAccess: false,
      status: 'no_user',
      trialEndsAt: null,
      daysLeft: 0,
      needsPayment: false,
    };
  }

  // No trial started yet - allow access (before first business)
  if (!owner.trialStartsAt) {
    return {
      hasAccess: true,
      status: 'pre_trial',
      trialEndsAt: null,
      daysLeft: null,
      needsPayment: false,
    };
  }

  // Active subscription
  if (owner.subscriptionStatus === 'active') {
    return {
      hasAccess: true,
      status: 'active',
      trialEndsAt: null,
      daysLeft: null,
      needsPayment: false,
      currentPeriodEnd: owner.currentPeriodEnd,
    };
  }

  // Trialing - check if expired
  if (owner.subscriptionStatus === 'trialing') {
    const now = new Date();
    const trialEnd = new Date(owner.trialEndsAt);
    const isExpired = now > trialEnd;

    if (isExpired) {
      // Trial expired, no subscription
      return {
        hasAccess: false,
        status: 'trial_expired',
        trialEndsAt: owner.trialEndsAt,
        daysLeft: 0,
        needsPayment: true,
      };
    }

    // Trial active
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return {
      hasAccess: true,
      status: 'trialing',
      trialEndsAt: owner.trialEndsAt,
      daysLeft,
      needsPayment: false,
    };
  }

  // Past due or other inactive status
  if (['past_due', 'unpaid', 'canceled'].includes(owner.subscriptionStatus)) {
    return {
      hasAccess: false,
      status: owner.subscriptionStatus,
      trialEndsAt: owner.trialEndsAt,
      daysLeft: 0,
      needsPayment: true,
    };
  }

  // Unknown status - deny access to be safe
  return {
    hasAccess: false,
    status: owner.subscriptionStatus || 'unknown',
    trialEndsAt: owner.trialEndsAt,
    daysLeft: 0,
    needsPayment: true,
  };
}

/**
 * Check subscription access with 3-tier caching
 * Tier 1: Session cache (fastest, 1 hour)
 * Tier 2: Redis cache (fast, 10 minutes)
 * Tier 3: Database (fallback)
 *
 * @param {string} businessOwnerId - BusinessOwner ID
 * @param {object} session - User session (optional, for Tier 1 cache)
 * @returns {Promise<object>} Access information
 */
export async function checkSubscriptionAccess(businessOwnerId, session = null) {
  // Tier 1: Session cache check
  if (session?.subscription && session?.subscriptionCheckedAt) {
    const age = Date.now() - new Date(session.subscriptionCheckedAt).getTime();
    if (age < SESSION_CACHE_TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Subscription] Cache HIT (session) for user ${businessOwnerId}`);
      }
      return session.subscription;
    }
  }

  // Tier 2: Redis cache check
  if (redisEnabled && redis) {
    try {
      const cached = await redis.get(`subscription:${businessOwnerId}`);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Subscription] Cache HIT (Redis) for user ${businessOwnerId}`);
        }
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch (error) {
      console.error('[Subscription] Redis cache read error:', error);
    }
  }

  // Tier 3: Database fallback
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Subscription] Cache MISS - querying DB for user ${businessOwnerId}`);
  }

  const owner = await prisma.businessOwner.findUnique({
    where: { id: businessOwnerId },
    select: {
      id: true,
      subscriptionStatus: true,
      trialStartsAt: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      canceledAt: true,
    },
  });

  const result = calculateAccess(owner);

  // Cache result in Redis
  if (redisEnabled && redis) {
    try {
      await redis.set(
        `subscription:${businessOwnerId}`,
        JSON.stringify(result),
        { ex: REDIS_CACHE_TTL }
      );
    } catch (error) {
      console.error('[Subscription] Redis cache write error:', error);
    }
  }

  return result;
}

/**
 * Sync subscription status from Stripe
 * Use as fallback when cache might be stale
 * @param {string} businessOwnerId - BusinessOwner ID
 * @returns {Promise<object>} Updated subscription info
 */
export async function syncStripeSubscription(businessOwnerId) {
  if (!stripe) {
    console.warn('[Subscription] Stripe not initialized - cannot sync');
    return null;
  }

  const owner = await prisma.businessOwner.findUnique({
    where: { id: businessOwnerId },
    select: {
      id: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!owner || !owner.stripeSubscriptionId) {
    return calculateAccess(owner);
  }

  try {
    // Fetch latest subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(owner.stripeSubscriptionId);

    // Update database
    const updated = await prisma.businessOwner.update({
      where: { id: businessOwnerId },
      data: {
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    });

    // Invalidate Redis cache
    if (redisEnabled && redis) {
      await redis.del(`subscription:${businessOwnerId}`).catch((err) => {
        console.error('[Subscription] Failed to invalidate cache:', err);
      });
    }

    console.log(`[Subscription] Synced from Stripe for user ${businessOwnerId} - status: ${subscription.status}`);

    return calculateAccess(updated);
  } catch (error) {
    console.error('[Subscription] Failed to sync from Stripe:', error);
    return calculateAccess(owner);
  }
}

/**
 * Invalidate subscription cache
 * Call this after any subscription changes
 * @param {string} businessOwnerId - BusinessOwner ID
 */
export async function invalidateSubscriptionCache(businessOwnerId) {
  if (redisEnabled && redis) {
    try {
      await redis.del(`subscription:${businessOwnerId}`);
      console.log(`[Subscription] Cache invalidated for user ${businessOwnerId}`);
    } catch (error) {
      console.error('[Subscription] Failed to invalidate cache:', error);
    }
  }
}

export default {
  startTrial,
  calculateAccess,
  checkSubscriptionAccess,
  syncStripeSubscription,
  invalidateSubscriptionCache,
};
