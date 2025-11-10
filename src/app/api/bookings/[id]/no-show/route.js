/**
 * Booking No-Show API
 * PATCH /api/bookings/[id]/no-show
 * Mark booking as no-show
 * No authentication required - booking ID acts as access key
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { detectLocaleFromRequest, translate } from '@/lib/localeUtils';

export async function PATCH(request, { params }) {
  try {
    const locale = detectLocaleFromRequest(request);

    const { id } = await params;

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      const errorMessage = await translate(locale, 'api.booking.errors.bookingNotFound');
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Update no-show status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { noShow: true },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error marking booking as no-show:', error);
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.booking.errors.failedToMarkNoShow');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
