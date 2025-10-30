import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/bookings/[id]
 * Get booking details
 */
export async function GET(request, { params }) {
  try {
    const bookingId = params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: {
          select: {
            businessName: true,
            logoUrl: true,
            phone: true,
            email: true,
            address: true,
            website: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
            photoUrl: true,
          },
        },
        customer: {
          select: {
            displayName: true,
            pictureUrl: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking (cancel, confirm, etc.)
 */
export async function PATCH(request, { params }) {
  try {
    const bookingId = params.id;
    const data = await request.json();
    const { status, customerLineUserId } = data;

    // Get existing booking
    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If customer is canceling, verify they own the booking
    if (customerLineUserId) {
      if (existing.customer.lineUserId !== customerLineUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status || existing.status,
      },
      include: {
        business: {
          select: {
            businessName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Send LINE notification about status change

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
