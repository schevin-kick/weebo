/**
 * Revenue Analytics API
 * GET /api/dashboard/[businessId]/analytics/revenue
 * Returns revenue data broken down by service, staff, and time period
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateMockRevenueData } from '@/lib/mockAnalyticsData';

// TODO: Remove this flag when real data is ready
const USE_MOCK_DATA = true;

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

    // Return mock data for demo purposes
    if (USE_MOCK_DATA) {
      return NextResponse.json(generateMockRevenueData());
    }

    // Get completed bookings with service and staff info
    const completedBookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: 'completed',
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + (booking.service?.price || 0),
      0
    );

    // Revenue by service
    const revenueByService = {};
    completedBookings.forEach(booking => {
      if (booking.service) {
        const serviceId = booking.service.id;
        if (!revenueByService[serviceId]) {
          revenueByService[serviceId] = {
            serviceId,
            serviceName: booking.service.name,
            revenue: 0,
            bookingCount: 0,
          };
        }
        revenueByService[serviceId].revenue += booking.service.price || 0;
        revenueByService[serviceId].bookingCount++;
      }
    });

    // Revenue by staff
    const revenueByStaff = {};
    completedBookings.forEach(booking => {
      if (booking.staff && booking.service) {
        const staffId = booking.staff.id;
        if (!revenueByStaff[staffId]) {
          revenueByStaff[staffId] = {
            staffId,
            staffName: booking.staff.name,
            revenue: 0,
            bookingCount: 0,
          };
        }
        revenueByStaff[staffId].revenue += booking.service.price || 0;
        revenueByStaff[staffId].bookingCount++;
      }
    });

    // Get previous period for comparison
    const periodLength = endDate - startDate;
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodEnd = new Date(startDate);

    const previousBookings = await prisma.booking.count({
      where: {
        businessId,
        status: 'completed',
        dateTime: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    });

    const previousRevenue = await prisma.booking.findMany({
      where: {
        businessId,
        status: 'completed',
        dateTime: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
      include: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }).then(bookings =>
      bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0)
    );

    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    return NextResponse.json({
      totalRevenue,
      completedBookings: completedBookings.length,
      revenueChange: Math.round(revenueChange * 10) / 10,
      revenueByService: Object.values(revenueByService).sort(
        (a, b) => b.revenue - a.revenue
      ),
      revenueByStaff: Object.values(revenueByStaff).sort(
        (a, b) => b.revenue - a.revenue
      ),
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
