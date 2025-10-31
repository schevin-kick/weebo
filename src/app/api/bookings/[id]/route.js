import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendBookingCancellation } from '@/lib/lineMessaging';

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
        business: true,
        service: true,
        staff: true,
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

    // Prepare update data
    const updateData = {
      status: status || existing.status,
    };

    // If canceling, add cancellation metadata
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = customerLineUserId ? 'customer' : 'owner';
      if (data.cancellationReason) {
        updateData.cancellationReason = data.cancellationReason;
      }
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        business: true,
        customer: true,
        service: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send LINE notification about cancellation
    let messageResult = null;
    if (status === 'cancelled') {
      try {
        messageResult = await sendBookingCancellation(
          booking,
          existing.business,
          data.cancellationReason || null
        );

        // Log message result
        if (messageResult && messageResult.status === 'sent') {
          await prisma.bookingMessage.create({
            data: {
              bookingId: booking.id,
              messageType: 'cancellation',
              deliveryStatus: 'sent',
              messageContent: { status: 'sent' },
            },
          });

          console.log('[Booking API] Cancellation message sent successfully');
        } else {
          console.warn('[Booking API] Cancellation message not sent:', messageResult);
        }
      } catch (messageError) {
        console.error('[Booking API] Error sending cancellation message:', messageError);
        // Don't fail the request if message fails
      }
    }

    return NextResponse.json({
      booking,
      messageSent: messageResult?.status === 'sent',
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
