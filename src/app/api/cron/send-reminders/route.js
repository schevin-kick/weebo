/**
 * Automated Reminder Cron Job
 * Sends booking reminder messages to customers
 * Protected by cron secret
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendBookingReminder } from '@/lib/lineMessaging';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    // Find all businesses with reminders enabled
    const businesses = await prisma.business.findMany({
      where: {
        enableReminders: true,
        isActive: true,
      },
      select: {
        id: true,
        businessName: true,
        reminderHoursBefore: true,
        logoUrl: true,
        lineDeepLink: true,
        lineChannelAccessToken: true,
        lineRefreshToken: true,
        lineTokenExpiresAt: true,
        messageTemplates: true,
      },
    });

    console.log(`Found ${businesses.length} businesses with reminders enabled`);

    // Process each business
    for (const business of businesses) {
      // Calculate reminder window
      const reminderWindow = business.reminderHoursBefore || 24;
      const startTime = new Date(now.getTime() + (reminderWindow - 0.5) * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() + (reminderWindow + 0.5) * 60 * 60 * 1000);

      // Find confirmed bookings in the reminder window that haven't been sent yet
      const bookingsToRemind = await prisma.booking.findMany({
        where: {
          businessId: business.id,
          status: 'confirmed',
          reminderSent: false,
          dateTime: {
            gte: startTime,
            lte: endTime,
          },
        },
        include: {
          customer: true,
          service: true,
          staff: true,
        },
        take: 100, // Process max 100 per business per run
      });

      console.log(
        `Business ${business.businessName}: ${bookingsToRemind.length} reminders to send`
      );

      // Send reminders
      for (const booking of bookingsToRemind) {
        results.processed++;

        try {
          // Send reminder message
          const messageResult = await sendBookingReminder(booking, business);

          if (messageResult.status === 'sent') {
            // Mark reminder as sent
            await prisma.booking.update({
              where: { id: booking.id },
              data: { reminderSent: true },
            });

            // Log message
            await prisma.bookingMessage.create({
              data: {
                bookingId: booking.id,
                messageType: 'reminder',
                deliveryStatus: 'sent',
                messageContent: { status: 'sent' },
              },
            });

            results.sent++;
            console.log(`Sent reminder for booking ${booking.id}`);
          } else if (messageResult.status === 'skipped') {
            results.skipped++;
            console.log(`Skipped reminder for booking ${booking.id}: ${messageResult.reason}`);
          } else {
            results.failed++;
            console.error(`Failed to send reminder for booking ${booking.id}:`, messageResult.error);
          }
        } catch (error) {
          results.failed++;
          console.error(`Error sending reminder for booking ${booking.id}:`, error);
        }

        // Small delay to avoid rate limiting (50ms between messages)
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    console.log('Reminder cron job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Reminder cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
