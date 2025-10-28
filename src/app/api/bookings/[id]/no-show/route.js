/**
 * Booking No-Show API
 * PATCH /api/bookings/[id]/no-show
 * Mark booking as no-show
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify business ownership
    if (booking.business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update no-show status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { noShow: true },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error marking booking as no-show:', error);
    return NextResponse.json(
      { error: 'Failed to mark as no-show' },
      { status: 500 }
    );
  }
}
