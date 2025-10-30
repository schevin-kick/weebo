/**
 * Analytics Overview API
 * GET /api/dashboard/[businessId]/analytics/overview
 * Returns summary statistics and status distribution
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
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate'))
      : new Date();

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

    // Get all bookings in the date range
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    // Status distribution
    const statusDistribution = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    bookings.forEach(booking => {
      if (statusDistribution.hasOwnProperty(booking.status)) {
        statusDistribution[booking.status]++;
      }
    });

    // Calculate metrics
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0);

    const noShowCount = bookings.filter(b => b.noShow).length;
    const noShowRate = totalBookings > 0
      ? (noShowCount / totalBookings) * 100
      : 0;

    const conversionRate = totalBookings > 0
      ? (statusDistribution.completed / totalBookings) * 100
      : 0;

    const cancellationRate = totalBookings > 0
      ? (statusDistribution.cancelled / totalBookings) * 100
      : 0;

    // Get unique customers
    const uniqueCustomers = new Set(bookings.map(b => b.customerId)).size;

    // Average booking value
    const avgBookingValue = statusDistribution.completed > 0
      ? totalRevenue / statusDistribution.completed
      : 0;

    // Cancellation breakdown
    const cancelledByOwner = bookings.filter(
      b => b.status === 'cancelled' && b.cancelledBy === 'owner'
    ).length;
    const cancelledByCustomer = bookings.filter(
      b => b.status === 'cancelled' && b.cancelledBy === 'customer'
    ).length;

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      uniqueCustomers,
      avgBookingValue: Math.round(avgBookingValue * 100) / 100,
      statusDistribution,
      noShowCount,
      noShowRate: Math.round(noShowRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      cancellationBreakdown: {
        byOwner: cancelledByOwner,
        byCustomer: cancelledByCustomer,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
