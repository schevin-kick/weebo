/**
 * Subscription Configuration
 * Fetches pricing and trial configuration from Stripe API
 * Single source of truth - all config comes from Stripe Dashboard
 */

import stripe from './stripe';
import redis from './redis';

const PRICE_CACHE_KEY = 'stripe:price:config';
const CACHE_TTL = 60 * 60 * 24; // 24 hours

/**
 * Get subscription configuration from Stripe API
 * Cached in Redis for performance (24 hour TTL)
 * @returns {Promise<Object>} Subscription config
 */
export async function getSubscriptionConfig() {
  if (!stripe) {
    console.warn('[SubscriptionConfig] Stripe not configured, using defaults');
    return {
      priceAmount: 210,
      priceCurrency: 'TWD',
      trialDays: 14,
      interval: 'month',
      priceId: null,
    };
  }

  if (!process.env.STRIPE_PRICE_ID) {
    console.warn('[SubscriptionConfig] STRIPE_PRICE_ID not set, using defaults');
    return {
      priceAmount: 210,
      priceCurrency: 'TWD',
      trialDays: 14,
      interval: 'month',
      priceId: null,
    };
  }

  try {
    // Try cache first
    if (redis) {
      const cached = await redis.get(PRICE_CACHE_KEY);
      if (cached) {
        // Upstash Redis might return already-parsed object or JSON string
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    }

    // Fetch from Stripe
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);

    const config = {
      priceAmount: price.unit_amount / 100, // Convert cents to dollars
      priceCurrency: price.currency.toUpperCase(),
      trialDays: price.recurring?.trial_period_days || 14,
      interval: price.recurring?.interval || 'month',
      priceId: price.id,
    };

    // Cache for 1 hour
    if (redis) {
      await redis.set(PRICE_CACHE_KEY, JSON.stringify(config), { ex: CACHE_TTL });
    }

    console.log('[SubscriptionConfig] Loaded from Stripe:', config);
    return config;
  } catch (error) {
    console.error('[SubscriptionConfig] Error fetching from Stripe:', error);
    // Fallback to defaults if Stripe fetch fails
    return {
      priceAmount: 210,
      priceCurrency: 'TWD',
      trialDays: 14,
      interval: 'month',
      priceId: process.env.STRIPE_PRICE_ID,
    };
  }
}

/**
 * Format price for display
 * @returns {Promise<string>} Formatted price (e.g., "200 TWD")
 */
export async function getFormattedPrice() {
  const config = await getSubscriptionConfig();
  return `${config.priceAmount} ${config.priceCurrency}`;
}

/**
 * Get trial duration text
 * @returns {Promise<string>} Trial text (e.g., "14-day free trial included")
 */
export async function getTrialText() {
  const config = await getSubscriptionConfig();
  return `${config.trialDays}-day free trial included`;
}

/**
 * Get trial duration in days
 * @returns {Promise<number>} Number of trial days
 */
export async function getTrialDays() {
  const config = await getSubscriptionConfig();
  return config.trialDays;
}

export default {
  getSubscriptionConfig,
  getFormattedPrice,
  getTrialText,
  getTrialDays,
};
