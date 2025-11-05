/**
 * GET /api/stripe/portal
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription, update payment methods, view invoices, etc.
 */

import { NextResponse } from 'next/server';
import { getSession, getBaseUrl } from '@/lib/auth';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function GET(request) {
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

    // Get business owner
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!owner.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Create Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: owner.stripeCustomerId,
      return_url: `${getBaseUrl()}/dashboard/billing`,
    });

    console.log(`[Stripe] Created portal session for user ${owner.id}`);

    return NextResponse.json({
      portalUrl: portalSession.url,
    });
  } catch (error) {
    console.error('[Stripe] Portal session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session', details: error.message },
      { status: 500 }
    );
  }
}
