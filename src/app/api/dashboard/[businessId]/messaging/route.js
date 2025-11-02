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
        lineBotBasicId: true,
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
      lineBotBasicId: business.lineBotBasicId,
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

    if (body.lineBotBasicId !== undefined) {
      // Validate Bot Basic ID format if provided
      if (body.lineBotBasicId) {
        if (!body.lineBotBasicId.startsWith('@')) {
          return NextResponse.json(
            { error: 'Bot Basic ID must start with @' },
            { status: 400 }
          );
        }
        if (!/^@[a-zA-Z0-9]+$/.test(body.lineBotBasicId)) {
          return NextResponse.json(
            { error: 'Bot Basic ID must contain only letters and numbers after @' },
            { status: 400 }
          );
        }
      }
      updateData.lineBotBasicId = body.lineBotBasicId;
    }

    if (body.lineChannelAccessToken !== undefined) {
      // Save manual channel access token (long-lived, does not expire)
      updateData.lineChannelAccessToken = body.lineChannelAccessToken;
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: updateData,
      select: {
        messageTemplates: true,
        enableReminders: true,
        reminderHoursBefore: true,
        lineBotBasicId: true,
      },
    });

    return NextResponse.json({
      success: true,
      messageTemplates: updatedBusiness.messageTemplates,
      enableReminders: updatedBusiness.enableReminders,
      reminderHoursBefore: updatedBusiness.reminderHoursBefore,
      lineBotBasicId: updatedBusiness.lineBotBasicId,
    });
  } catch (error) {
    console.error('Update messaging settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
