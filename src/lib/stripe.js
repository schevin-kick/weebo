/**
 * Stripe SDK Client
 * Singleton instance for Stripe API
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    '[Stripe] STRIPE_SECRET_KEY not set. Stripe functionality will be disabled.'
  );
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
    appInfo: {
      name: 'Kitsune',
      version: '1.0.0',
    },
  })
  : null;

export default stripe;
