/**
 * Today's Schedule API
 * GET /api/dashboard/[businessId]/today
 * Returns today's appointments for the business
 */

import { NextResponse } from 'next/server';
import { getSession, canAccessBusiness } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTodayRange } from '@/lib/dateUtils';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify business access (owner or has permission)
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!canAccessBusiness(session, businessId, business.ownerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's range
    const todayRange = getTodayRange();

    // Fetch today's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        dateTime: {
          gte: todayRange.start,
          lte: todayRange.end,
        },
        status: {
          not: 'cancelled',
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            lineUserId: true,
            pictureUrl: true,
            customerType: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s schedule' },
      { status: 500 }
    );
  }
}
