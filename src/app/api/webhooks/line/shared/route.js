/**
 * LINE Webhook Handler for Shared Kitsune Bot
 * POST /api/webhooks/line/shared
 * Receives webhook events from the shared Kitsune LINE bot
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('[Shared Bot Webhook] Received:', {
      eventCount: body.events?.length
    });

    // Process each event
    for (const event of body.events || []) {
      const userId = event.source?.userId;

      if (!userId) {
        console.warn('[Shared Bot Webhook] No user ID in event');
        continue;
      }

      console.log('[Shared Bot Webhook] Processing event:', {
        type: event.type,
        userId
      });

      if (event.type === 'follow') {
        // User added the shared Kitsune bot
        console.log('[Shared Bot Webhook] Follow event:', userId);

        // Find recent booking (last 10 minutes) for this user across all shared-mode businesses
        const recentBooking = await prisma.booking.findFirst({
          where: {
            customer: {
              lineUserId: userId
            },
            business: {
              OR: [
                { messagingMode: 'shared' },
                { messagingMode: null }
              ]
            },
            createdAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            service: true,
            staff: true,
            business: true
          }
        });

        if (recentBooking) {
          console.log('[Shared Bot Webhook] Found recent booking:', {
            bookingId: recentBooking.id,
            businessId: recentBooking.businessId,
            businessName: recentBooking.business.businessName
          });

          // Send booking confirmation message
          try {
            const { sendBookingConfirmation } = await import('@/lib/lineMessaging');
            await sendBookingConfirmation(recentBooking, recentBooking.business);
            console.log('[Shared Bot Webhook] Booking confirmation sent');
          } catch (error) {
            console.error('[Shared Bot Webhook] Failed to send booking confirmation:', error);
          }
        } else {
          console.log('[Shared Bot Webhook] No recent booking found');

          // Send generic welcome message with default locale (EN)
          try {
            const { sendLineMessage } = await import('@/lib/lineMessaging');
            const { translate } = await import('@/lib/localeUtils');

            const welcomeMessage = await translate('en', 'api.lineWebhook.welcomeSharedBot');

            await sendLineMessage(
              userId,
              [{
                type: 'text',
                text: welcomeMessage
              }],
              null // No specific business - use shared bot token
            );
            console.log('[Shared Bot Webhook] Welcome message sent');
          } catch (error) {
            console.error('[Shared Bot Webhook] Failed to send welcome message:', error);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('[Shared Bot Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal error', message: error.message },
      { status: 500 }
    );
  }
}
