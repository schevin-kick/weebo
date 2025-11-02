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
const SESSION_CACHE_TTL = 300000; // 5 minutes in milliseconds

/**
 * Start a free trial for a business owner
 * Trial duration is configurable via SUBSCRIPTION_TRIAL_DAYS environment variable
 * @param {string} businessOwnerId - BusinessOwner ID
 * @returns {Promise<object>} Updated business owner
 */
export async function startTrial(businessOwnerId) {
  const now = new Date();
  const trialDays = await getTrialDays();
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

  // Incomplete subscription - payment processing or requires authentication
  // Allow access temporarily while payment is being confirmed
  if (owner.subscriptionStatus === 'incomplete') {
    return {
      hasAccess: true,
      status: 'incomplete',
      trialEndsAt: null,
      daysLeft: null,
      needsPayment: false, // Payment is in progress
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

  // Incomplete expired - payment never completed within the time window
  if (owner.subscriptionStatus === 'incomplete_expired') {
    return {
      hasAccess: false,
      status: 'incomplete_expired',
      trialEndsAt: owner.trialEndsAt,
      daysLeft: 0,
      needsPayment: true,
    };
  }

  // Past due or other inactive status
  if (['past_due', 'unpaid', 'canceled', 'paused'].includes(owner.subscriptionStatus)) {
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
 * Tier 1: Session cache (fastest, 5 minutes)
 * Tier 2: Redis cache (fast, 10 minutes)
 * Tier 3: Database (fallback)
 *
 * @param {string} businessOwnerId - BusinessOwner ID
 * @param {object} session - User session (optional, for Tier 1 cache)
 * @param {object} options - Options: { bypassCache: boolean }
 * @returns {Promise<object>} Access information
 */
export async function checkSubscriptionAccess(businessOwnerId, session = null, options = {}) {
  const { bypassCache = false } = options;

  // If bypass requested, skip caches and go straight to database
  if (bypassCache) {
    console.log(`[Subscription] Cache BYPASSED (forced fresh fetch) for user ${businessOwnerId}`);

    // Query database directly (Tier 3)
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
    console.log(`[Subscription] ✓ Database query complete (bypassed cache) for user ${businessOwnerId} - status: ${result.status}`);

    // Still write to Redis for subsequent requests
    if (redisEnabled && redis) {
      try {
        await redis.set(
          `subscription:${businessOwnerId}`,
          JSON.stringify(result),
          { ex: REDIS_CACHE_TTL }
        );
        console.log(`[Subscription] ✓ Cached to Redis (Tier 2) for user ${businessOwnerId} - TTL: ${REDIS_CACHE_TTL}s`);
      } catch (error) {
        console.error('[Subscription] ✗ Redis cache write ERROR:', error);
      }
    }

    return result;
  }

  // Tier 1: Session cache check
  if (session?.subscription && session?.subscriptionCheckedAt) {
    const age = Date.now() - new Date(session.subscriptionCheckedAt).getTime();
    const ageMinutes = Math.floor(age / 60000);

    if (age < SESSION_CACHE_TTL) {
      console.log(`[Subscription] ✓ Cache HIT (Tier 1: Session) for user ${businessOwnerId} - age: ${ageMinutes}m - status: ${session.subscription.status}`);
      return session.subscription;
    } else {
      console.log(`[Subscription] ✗ Session cache EXPIRED for user ${businessOwnerId} - age: ${ageMinutes}m (TTL: 5m)`);
    }
  } else {
    const reason = !session ? 'no session' : !session.subscription ? 'no subscription data' : 'no timestamp';
    console.log(`[Subscription] ✗ Session cache MISS for user ${businessOwnerId} - reason: ${reason}`);
  }

  // Tier 2: Redis cache check
  if (redisEnabled && redis) {
    try {
      const cached = await redis.get(`subscription:${businessOwnerId}`);
      if (cached) {
        const result = typeof cached === 'string' ? JSON.parse(cached) : cached;
        console.log(`[Subscription] ✓ Cache HIT (Tier 2: Redis) for user ${businessOwnerId} - status: ${result.status}`);
        return result;
      } else {
        console.log(`[Subscription] ✗ Redis cache MISS for user ${businessOwnerId}`);
      }
    } catch (error) {
      console.error('[Subscription] ✗ Redis cache read ERROR:', error);
    }
  } else {
    console.log(`[Subscription] ⊘ Redis DISABLED - skipping Tier 2 cache`);
  }

  // Tier 3: Database fallback
  console.log(`[Subscription] → Querying database (Tier 3) for user ${businessOwnerId}`);

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
  console.log(`[Subscription] ✓ Database query complete for user ${businessOwnerId} - status: ${result.status}`);

  // Cache result in Redis
  if (redisEnabled && redis) {
    try {
      await redis.set(
        `subscription:${businessOwnerId}`,
        JSON.stringify(result),
        { ex: REDIS_CACHE_TTL }
      );
      console.log(`[Subscription] ✓ Cached to Redis (Tier 2) for user ${businessOwnerId} - TTL: ${REDIS_CACHE_TTL}s`);
    } catch (error) {
      console.error('[Subscription] ✗ Redis cache write ERROR:', error);
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
 * Note: This only invalidates Tier 2 (Redis) cache. Tier 1 (Session) cache
 * will expire naturally within 1 hour or when user gets a new session token.
 * @param {string} businessOwnerId - BusinessOwner ID
 */
export async function invalidateSubscriptionCache(businessOwnerId) {
  if (redisEnabled && redis) {
    try {
      const deleted = await redis.del(`subscription:${businessOwnerId}`);
      if (deleted) {
        console.log(`[Subscription] ✓ Cache invalidated (Tier 2: Redis) for user ${businessOwnerId}`);
      } else {
        console.log(`[Subscription] ⊘ No cache to invalidate for user ${businessOwnerId} (key didn't exist)`);
      }
    } catch (error) {
      console.error('[Subscription] ✗ Failed to invalidate cache:', error);
    }
  } else {
    console.log(`[Subscription] ⊘ Redis DISABLED - skipping cache invalidation for user ${businessOwnerId}`);
  }
}

export default {
  startTrial,
  calculateAccess,
  checkSubscriptionAccess,
  syncStripeSubscription,
  invalidateSubscriptionCache,
};
