/**
 * Closed Dates API
 * GET /api/closed-dates?businessId=...
 * POST /api/closed-dates
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const session = await getSession();

    // If authenticated, verify ownership
    if (session) {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: session.id,
        },
      });

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
    } else {
      // Public access - just verify business exists
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
    }

    // Get closed dates sorted by date (upcoming first)
    const closedDates = await prisma.closedDate.findMany({
      where: {
        businessId,
        endDateTime: {
          gte: new Date(), // Only future/current closed periods
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return NextResponse.json({ closedDates });
  } catch (error) {
    console.error('Error fetching closed dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch closed dates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = getIdentifier(request, session);
    const rateLimitResult = await checkRateLimit(authenticatedRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { businessId, startDateTime, endDateTime } = body;

    if (!businessId || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Create closed date
    const closedDate = await prisma.closedDate.create({
      data: {
        businessId,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
      },
    });

    return NextResponse.json({ closedDate }, { status: 201 });
  } catch (error) {
    console.error('Error creating closed date:', error);
    return NextResponse.json(
      { error: 'Failed to create closed date' },
      { status: 500 }
    );
  }
}
