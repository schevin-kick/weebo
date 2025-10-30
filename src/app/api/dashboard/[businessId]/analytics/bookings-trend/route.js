/**
 * Bookings Trend Analytics API
 * GET /api/dashboard/[businessId]/analytics/bookings-trend
 * Returns booking trends over time with date range filtering
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse date range
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate'))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate'))
      : new Date();
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

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

    // Get bookings grouped by date
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        service: {
          select: {
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group bookings by date
    const groupedData = {};

    bookings.forEach(booking => {
      let dateKey;
      const date = new Date(booking.createdAt);

      if (groupBy === 'day') {
        dateKey = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        };
      }

      groupedData[dateKey].total++;
      groupedData[dateKey][booking.status]++;

      if (booking.service?.price && booking.status === 'completed') {
        groupedData[dateKey].revenue += booking.service.price;
      }
    });

    // Convert to array and sort
    const trendData = Object.values(groupedData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      trendData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching bookings trend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings trend' },
      { status: 500 }
    );
  }
}
