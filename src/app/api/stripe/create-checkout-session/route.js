/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout session for subscription
 */

import { NextResponse } from 'next/server';
import { getSession, getBaseUrl } from '@/lib/auth';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }

    // Get business owner
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        stripeCustomerId: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = owner.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: owner.email || undefined,
        name: owner.displayName,
        metadata: {
          userId: owner.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await prisma.businessOwner.update({
        where: { id: owner.id },
        data: { stripeCustomerId: customerId },
      });

      console.log(`[Stripe] Created customer ${customerId} for user ${owner.id}`);
    }

    // Detect user's language from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    let locale = 'auto'; // Let Stripe auto-detect

    // Override if specific language detected
    if (acceptLanguage.includes('zh-TW')) {
      locale = 'zh-TW';
    } else if (acceptLanguage.includes('zh-HK')) {
      locale = 'zh-HK';
    } else if (acceptLanguage.includes('zh')) {
      locale = 'zh';
    } else if (acceptLanguage.includes('ja')) {
      locale = 'ja';
    } else if (acceptLanguage.includes('en')) {
      locale = 'en';
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      locale: locale,
      success_url: `${getBaseUrl()}/dashboard/billing?success=true`,
      cancel_url: `${getBaseUrl()}/dashboard/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
      automatic_tax: {
        enabled: true,
      },
      subscription_data: {
        metadata: {
          userId: owner.id,
        },
      },
    });

    console.log(`[Stripe] Created checkout session ${checkoutSession.id} for user ${owner.id}`);

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[Stripe] Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
