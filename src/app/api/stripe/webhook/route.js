/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * This endpoint processes subscription lifecycle events from Stripe
 */

import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { invalidateSubscriptionCache } from '@/lib/subscriptionHelpers';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] No stripe-signature header');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * User completed payment flow
 */
async function handleCheckoutCompleted(session) {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);

  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!customerId) {
    console.error('[Stripe Webhook] No customer ID in checkout session');
    return;
  }

  // Update business owner with customer and subscription IDs
  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
    },
  });

  // Invalidate cache
  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Updated subscription ID for user ${owner.id}`);
  }
}

/**
 * Handle customer.subscription.created
 * New subscription activated
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`[Stripe Webhook] Subscription created: ${subscription.id}`);

  const customerId = subscription.customer;

  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      canceledAt: null,
    },
  });

  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Activated subscription for user ${owner.id}`);
  }
}

/**
 * Handle customer.subscription.updated
 * Subscription status changed
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id} - status: ${subscription.status}`);

  const customerId = subscription.customer;

  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });

  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Updated subscription status for user ${owner.id} to ${subscription.status}`);
  }
}

/**
 * Handle customer.subscription.deleted
 * Subscription canceled
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  const customerId = subscription.customer;

  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'canceled',
      canceledAt: new Date(),
    },
  });

  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Canceled subscription for user ${owner.id}`);
  }
}

/**
 * Handle invoice.payment_succeeded
 * Successful payment (including renewals)
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`[Stripe Webhook] Payment succeeded: ${invoice.id}`);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    // Not a subscription invoice
    return;
  }

  // Fetch subscription to get current period
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Payment succeeded for user ${owner.id}`);
  }
}

/**
 * Handle invoice.payment_failed
 * Payment failed (card declined, etc.)
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log(`[Stripe Webhook] Payment failed: ${invoice.id}`);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    return;
  }

  // Fetch subscription to get current status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: subscription.status, // Usually 'past_due'
    },
  });

  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (owner) {
    await invalidateSubscriptionCache(owner.id);
    console.log(`[Stripe Webhook] Payment failed for user ${owner.id} - status: ${subscription.status}`);
  }
}

/**
 * Handle charge.refunded
 * Charge was refunded (full or partial)
 */
async function handleChargeRefunded(charge) {
  console.log(`[Stripe Webhook] Charge refunded: ${charge.id} - amount: ${charge.amount_refunded}`);

  const customerId = charge.customer;

  if (!customerId) {
    console.log('[Stripe Webhook] No customer ID in refunded charge');
    return;
  }

  // Get business owner to find their subscription
  const owner = await prisma.businessOwner.findUnique({
    where: { stripeCustomerId: customerId },
    select: {
      id: true,
      stripeSubscriptionId: true,
    },
  });

  if (!owner) {
    console.log(`[Stripe Webhook] No business owner found for customer ${customerId}`);
    return;
  }

  if (!owner.stripeSubscriptionId) {
    console.log(`[Stripe Webhook] No subscription found for user ${owner.id}`);
    return;
  }

  // Fetch current subscription status from Stripe
  const subscription = await stripe.subscriptions.retrieve(owner.stripeSubscriptionId);

  // Update database with current subscription status
  await prisma.businessOwner.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });

  await invalidateSubscriptionCache(owner.id);
  console.log(`[Stripe Webhook] Updated subscription after refund for user ${owner.id} - status: ${subscription.status}`);
}
