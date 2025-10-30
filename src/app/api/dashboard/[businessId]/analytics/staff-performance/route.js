/**
 * Staff Performance Analytics API
 * GET /api/dashboard/[businessId]/analytics/staff-performance
 * Returns performance metrics for each staff member
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

    // Get all staff
    const staff = await prisma.staff.findMany({
      where: {
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
      },
    });

    // Get bookings for each staff member
    const staffPerformance = await Promise.all(
      staff.map(async staffMember => {
        const bookings = await prisma.booking.findMany({
          where: {
            businessId,
            staffId: staffMember.id,
            dateTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
            noShow: true,
            service: {
              select: {
                price: true,
              },
            },
          },
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(
          b => b.status === 'completed'
        ).length;
        const cancelledBookings = bookings.filter(
          b => b.status === 'cancelled'
        ).length;
        const noShowBookings = bookings.filter(b => b.noShow).length;

        const completionRate = totalBookings > 0
          ? (completedBookings / totalBookings) * 100
          : 0;
        const cancellationRate = totalBookings > 0
          ? (cancelledBookings / totalBookings) * 100
          : 0;
        const noShowRate = totalBookings > 0
          ? (noShowBookings / totalBookings) * 100
          : 0;

        // Calculate revenue from completed bookings
        const revenue = bookings.reduce((sum, booking) => {
          if (booking.status === 'completed' && booking.service?.price) {
            return sum + booking.service.price;
          }
          return sum;
        }, 0);

        return {
          staffId: staffMember.id,
          staffName: staffMember.name,
          photoUrl: staffMember.photoUrl,
          totalBookings,
          completedBookings,
          cancelledBookings,
          noShowBookings,
          completionRate: Math.round(completionRate * 10) / 10,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          noShowRate: Math.round(noShowRate * 10) / 10,
          revenue,
        };
      })
    );

    // Sort by total bookings
    staffPerformance.sort((a, b) => b.totalBookings - a.totalBookings);

    return NextResponse.json({
      staffPerformance,
    });
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff performance' },
      { status: 500 }
    );
  }
}
