import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard/[businessId]/bookings
 * Get bookings for a specific business and date (authenticated endpoint)
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build where clause
    const whereClause = {
      businessId,
    };

    // Add date filter if provided
    if (date) {
      // Get start and end of the day in local time
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      whereClause.dateTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            lineUserId: true,
            pictureUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
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
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json({
      bookings,
      totalCount: bookings.length,
    });
  } catch (error) {
    console.error('[Dashboard Bookings API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
