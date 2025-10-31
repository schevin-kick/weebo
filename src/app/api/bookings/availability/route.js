import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/bookings/availability
 * Get bookings for a specific date to check time slot availability
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const staffId = searchParams.get('staffId'); // optional

    // Validate required fields
    if (!businessId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: businessId and date' },
        { status: 400 }
      );
    }

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { id: businessId, isActive: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Parse the date and create start/end of day boundaries
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    // Build query
    const whereClause = {
      businessId,
      status: {
        in: ['confirmed', 'pending'], // Only check confirmed and pending bookings
      },
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // If staffId is provided and not "any", filter by staff
    if (staffId && staffId !== 'any') {
      whereClause.staffId = staffId;
    }

    // Fetch bookings for the date
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        dateTime: true,
        duration: true,
        staffId: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json({
      date,
      bookings,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
