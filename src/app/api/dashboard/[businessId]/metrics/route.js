/**
 * Dashboard Metrics API
 * GET /api/dashboard/[businessId]/metrics
 * Returns aggregate statistics for the dashboard
 */

import { NextResponse } from 'next/server';
import { getSession, canAccessBusiness } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTodayRange, getWeekRange } from '@/lib/dateUtils';

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

    // Get date ranges
    const todayRange = getTodayRange();
    const weekRange = getWeekRange();

    // Aggregate metrics
    const [
      totalBookings,
      pendingBookings,
      todayBookings,
      weekBookings,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: { businessId },
      }),

      // Pending bookings
      prisma.booking.count({
        where: {
          businessId,
          status: 'pending',
        },
      }),

      // Today's bookings
      prisma.booking.count({
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
      }),

      // This week's bookings
      prisma.booking.count({
        where: {
          businessId,
          dateTime: {
            gte: weekRange.start,
            lte: weekRange.end,
          },
          status: {
            not: 'cancelled',
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      todayBookings,
      weekBookings,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
