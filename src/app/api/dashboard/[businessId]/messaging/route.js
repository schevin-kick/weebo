/**
 * Messaging Settings API Route
 * GET: Fetch messaging settings
 * PATCH: Update messaging settings
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { validateTemplates } from '@/lib/messageTemplates';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/[businessId]/messaging
 * Fetch messaging settings for a business
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        ownerId: true,
        messageTemplates: true,
        enableReminders: true,
        reminderHoursBefore: true,
        lineChannelAccessToken: true,
        lineTokenExpiresAt: true,
      },
    });

    if (!business || business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      messageTemplates: business.messageTemplates,
      enableReminders: business.enableReminders,
      reminderHoursBefore: business.reminderHoursBefore,
      lineConnected: !!business.lineChannelAccessToken,
      lineTokenExpiresAt: business.lineTokenExpiresAt,
    });
  } catch (error) {
    console.error('Get messaging settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dashboard/[businessId]/messaging
 * Update messaging settings
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;
    const body = await request.json();

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business || business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Validate message templates if provided
    if (body.messageTemplates) {
      const validation = validateTemplates(body.messageTemplates);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid templates', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Update business
    const updateData = {};

    if (body.messageTemplates !== undefined) {
      updateData.messageTemplates = body.messageTemplates;
    }

    if (body.enableReminders !== undefined) {
      updateData.enableReminders = body.enableReminders;
    }

    if (body.reminderHoursBefore !== undefined) {
      const hours = parseInt(body.reminderHoursBefore);
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return NextResponse.json(
          { error: 'reminderHoursBefore must be between 1 and 168' },
          { status: 400 }
        );
      }
      updateData.reminderHoursBefore = hours;
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: updateData,
      select: {
        messageTemplates: true,
        enableReminders: true,
        reminderHoursBefore: true,
      },
    });

    return NextResponse.json({
      success: true,
      messageTemplates: updatedBusiness.messageTemplates,
      enableReminders: updatedBusiness.enableReminders,
      reminderHoursBefore: updatedBusiness.reminderHoursBefore,
    });
  } catch (error) {
    console.error('Update messaging settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
