/**
 * LINE Webhook Handler
 * POST /api/webhooks/line/[businessId]
 * Receives webhook events from business owner's LINE bot
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLineMessage } from '@/lib/lineMessaging';

export async function POST(request, { params }) {
  try {
    const { businessId } = await params;
    const body = await request.json();

    console.log('[LINE Webhook] Received:', {
      businessId,
      eventCount: body.events?.length
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      console.error('[LINE Webhook] Business not found:', businessId);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Process each event
    for (const event of body.events || []) {
      const businessBotUserId = event.source?.userId;

      if (!businessBotUserId) {
        console.warn('[LINE Webhook] No user ID in event');
        continue;
      }

      console.log('[LINE Webhook] Processing event:', {
        type: event.type,
        businessBotUserId,
        businessId
      });

      if (event.type === 'follow') {
        // User added the bot
        console.log('[LINE Webhook] Follow event:', businessBotUserId);

        // Check if mapping already exists (repeat customer)
        const existingMapping = await prisma.customerBotMapping.findFirst({
          where: {
            businessBotUserId: businessBotUserId,
            businessId: businessId
          }
        });

        // if (existingMapping) {
        //   console.log('[LINE Webhook] Existing mapping found - repeat customer');
        //   // Just send a welcome back message
        //   try {
        //     await sendLineMessage(
        //       businessBotUserId,
        //       [{
        //         type: 'text',
        //         text: `Welcome back! You'll continue to receive booking updates here.`
        //       }],
        //       business
        //     );
        //     console.log('[LINE Webhook] Welcome back message sent');
        //   } catch (error) {
        //     console.error('[LINE Webhook] Failed to send welcome back message:', error);
        //   }
        //   continue;
        // }

        // Add small delay to ensure database consistency
        console.log('[LINE Webhook] Waiting 500ms to ensure DB commit...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find recent booking (last 15 minutes, increased from 10 for better reliability)
        const recentBooking = await prisma.booking.findFirst({
          where: {
            businessId,
            createdAt: {
              gte: new Date(Date.now() - 1 * 60 * 1000)
            },
            status: { in: ['pending', 'confirmed'] } // Match both pending and confirmed bookings
          },
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            service: true,
            staff: true
          }
        });

        console.log('[LINE Webhook] Recent booking search result:', {
          found: !!recentBooking,
          bookingId: recentBooking?.id,
          bookingCreatedAt: recentBooking?.createdAt,
          customerLiffId: recentBooking?.customer?.lineUserId,
          businessBotUserId: businessBotUserId,
          timeSinceBooking: recentBooking ? Date.now() - new Date(recentBooking.createdAt).getTime() : null
        });

        if (recentBooking) {
          console.log('[LINE Webhook] Found recent booking:', recentBooking.id);

          // Create mapping for new customer
          if (!existingMapping) {
            await prisma.customerBotMapping.create({
              data: {
                customerId: recentBooking.customerId,
                businessId: businessId,
                liffUserId: recentBooking.customer.lineUserId,
                businessBotUserId: businessBotUserId,
              }
            });
          }

          console.log('[LINE Webhook] Linked user IDs:', {
            liffUserId: recentBooking.customer.lineUserId,
            businessBotUserId,
            customerId: recentBooking.customerId
          });

          // Send booking confirmation message only for confirmed bookings
          if (recentBooking.status === 'confirmed') {
            try {
              const { sendBookingConfirmation } = await import('@/lib/lineMessaging');
              await sendBookingConfirmation(recentBooking, business);
              console.log('[LINE Webhook] Booking confirmation sent');
            } catch (error) {
              console.error('[LINE Webhook] Failed to send booking confirmation:', error);
            }
          } else {
            console.log('[LINE Webhook] Booking is pending, skipping confirmation message');
          }
        } else {
          console.log('[LINE Webhook] No recent booking found to link');
        }

      } else if (event.type === 'message' && event.message?.type === 'text') {
        // Check for booking ID pattern: "booking:abc123"
        const text = event.message.text;
        const match = text.match(/booking:(\w+)/i);

        if (match) {
          const bookingId = match[1];
          console.log('[LINE Webhook] Booking ID found in message:', bookingId);

          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true }
          });

          if (booking && booking.businessId === businessId) {
            console.log('[LINE Webhook] Valid booking found:', bookingId);

            // Create mapping
            await prisma.customerBotMapping.upsert({
              where: {
                customerId_businessId: {
                  customerId: booking.customerId,
                  businessId: businessId
                }
              },
              create: {
                customerId: booking.customerId,
                businessId: businessId,
                liffUserId: booking.customer.lineUserId,
                businessBotUserId: businessBotUserId,
              },
              update: {
                businessBotUserId: businessBotUserId,
              }
            });

            console.log('[LINE Webhook] Linked user IDs via booking ID:', {
              liffUserId: booking.customer.lineUserId,
              businessBotUserId,
              bookingId
            });

            // Send confirmation
            try {
              await sendLineMessage(
                businessBotUserId,
                [{
                  type: 'text',
                  text: `Booking linked! You'll receive updates for booking #${bookingId}.`
                }],
                business
              );
              console.log('[LINE Webhook] Confirmation message sent');
            } catch (error) {
              console.error('[LINE Webhook] Failed to send confirmation:', error);
            }
          } else {
            console.log('[LINE Webhook] Invalid booking ID or business mismatch');
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('[LINE Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal error', message: error.message },
      { status: 500 }
    );
  }
}
