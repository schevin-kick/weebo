/**
 * Booking Status API
 * PATCH /api/bookings/[id]/status
 * Update booking status (confirm/cancel) and send LINE message
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendBookingConfirmation, sendBookingCancellation } from '@/lib/lineMessaging';
import { authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';
import { getCustomerLocale } from '@/lib/localeUtils';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = getIdentifier(request, session);
    const rateLimitResult = await checkRateLimit(authenticatedRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, cancellationReason } = body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch booking with all relations
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: true,
        customer: true,
        service: true,
        staff: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify business ownership
    if (booking.business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update booking status
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = 'owner';
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    if (status === 'confirmed') {
      updateData.confirmationSent = true;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        business: true,
        customer: true,
        service: true,
        staff: true,
      },
    });

    // Send LINE message with customer's preferred locale
    let messageResult = null;
    try {
      const locale = getCustomerLocale(booking.customer);

      if (status === 'confirmed') {
        messageResult = await sendBookingConfirmation(updatedBooking, booking.business, locale);
      } else if (status === 'cancelled') {
        messageResult = await sendBookingCancellation(
          updatedBooking,
          booking.business,
          cancellationReason,
          locale
        );
      }

      // Log message result
      if (messageResult && messageResult.status === 'sent') {
        await prisma.bookingMessage.create({
          data: {
            bookingId: id,
            messageType: status === 'confirmed' ? 'confirmation' : 'cancellation',
            deliveryStatus: 'sent',
            messageContent: { status: 'sent' },
          },
        });
      }
    } catch (messageError) {
      console.error('Error sending LINE message:', messageError);
      // Don't fail the request if message fails
    }

    return NextResponse.json({
      booking: updatedBooking,
      messageSent: messageResult?.status === 'sent',
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
