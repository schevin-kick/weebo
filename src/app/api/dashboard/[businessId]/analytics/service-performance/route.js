/**
 * Service Performance Analytics API
 * GET /api/dashboard/[businessId]/analytics/service-performance
 * Returns performance metrics for each service
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateMockServicePerformance } from '@/lib/mockAnalyticsData';

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
      return NextResponse.json({
        servicePerformance: generateMockServicePerformance(),
      });
    }

    // Get all services
    const services = await prisma.service.findMany({
      where: {
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
      },
    });

    // Get bookings for each service
    const servicePerformance = await Promise.all(
      services.map(async service => {
        const bookings = await prisma.booking.findMany({
          where: {
            businessId,
            serviceId: service.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
          },
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(
          b => b.status === 'completed'
        ).length;
        const cancelledBookings = bookings.filter(
          b => b.status === 'cancelled'
        ).length;
        const completionRate = totalBookings > 0
          ? (completedBookings / totalBookings) * 100
          : 0;
        const cancellationRate = totalBookings > 0
          ? (cancelledBookings / totalBookings) * 100
          : 0;
        const revenue = service.price ? completedBookings * service.price : 0;

        return {
          serviceId: service.id,
          serviceName: service.name,
          price: service.price || 0,
          duration: service.duration,
          totalBookings,
          completedBookings,
          cancelledBookings,
          completionRate: Math.round(completionRate * 10) / 10,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          revenue,
        };
      })
    );

    // Sort by total bookings
    servicePerformance.sort((a, b) => b.totalBookings - a.totalBookings);

    return NextResponse.json({
      servicePerformance,
    });
  } catch (error) {
    console.error('Error fetching service performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service performance' },
      { status: 500 }
    );
  }
}
