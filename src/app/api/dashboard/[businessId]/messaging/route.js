/**
 * Messaging Settings API Route
 * GET: Fetch messaging settings
 * PATCH: Update messaging settings
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { validateTemplates } from '@/lib/messageTemplates';
import { detectLocaleFromRequest, translate } from '@/lib/localeUtils';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/[businessId]/messaging
 * Fetch messaging settings for a business
 */
export async function GET(request, { params }) {
  try {
    const locale = detectLocaleFromRequest(request);
    const session = await getSession();

    if (!session) {
      const errorMessage = await translate(locale, 'api.errors.unauthorized');
      return NextResponse.json({ error: errorMessage }, { status: 401 });
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
        messagingMode: true,
        webhookConfigured: true,
        webhookUrl: true,
        webhookAcknowledged: true,
        lineWebhookVerified: true,
        heroBackgroundColor: true,
      },
    });

    if (!business || business.ownerId !== session.id) {
      const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.businessNotFound');
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({
      messageTemplates: business.messageTemplates,
      enableReminders: business.enableReminders,
      reminderHoursBefore: business.reminderHoursBefore,
      lineConnected: !!business.lineChannelAccessToken,
      lineBotBasicId: business.lineBotBasicId,
      messagingMode: business.messagingMode || 'shared',
      webhookConfigured: business.webhookConfigured,
      webhookUrl: business.webhookUrl,
      webhookAcknowledged: business.webhookAcknowledged,
      lineWebhookVerified: business.lineWebhookVerified,
      heroBackgroundColor: business.heroBackgroundColor || '#FFFFFF',
    });
  } catch (error) {
    console.error('Get messaging settings error:', error);
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.internalError');
    return NextResponse.json(
      { error: errorMessage },
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
    // Detect locale from request for error messages
    const locale = detectLocaleFromRequest(request);
    const session = await getSession();

    if (!session) {
      const errorMessage = await translate(locale, 'api.errors.unauthorized');
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    const { businessId } = await params;
    const body = await request.json();

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business || business.ownerId !== session.id) {
      const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.businessNotFound');
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Validate message templates if provided
    if (body.messageTemplates) {
      const validation = validateTemplates(body.messageTemplates, locale);
      if (!validation.valid) {
        const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.invalidTemplates');
        return NextResponse.json(
          { error: errorMessage, details: validation.errors },
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
        const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.reminderHoursRange');
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      updateData.reminderHoursBefore = hours;
    }

    if (body.lineBotBasicId !== undefined) {
      // Validate Bot Basic ID format if provided
      if (body.lineBotBasicId) {
        if (!body.lineBotBasicId.startsWith('@')) {
          const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.botIdMustStartWith');
          return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
          );
        }
        if (!/^@[a-zA-Z0-9]+$/.test(body.lineBotBasicId)) {
          const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.botIdInvalidFormat');
          return NextResponse.json(
            { error: errorMessage },
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

    if (body.messagingMode !== undefined) {
      if (!['shared', 'own_bot'].includes(body.messagingMode)) {
        const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.invalidMessagingMode');
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      updateData.messagingMode = body.messagingMode;
    }

    if (body.webhookAcknowledged !== undefined) {
      updateData.webhookAcknowledged = body.webhookAcknowledged;
    }

    if (body.heroBackgroundColor !== undefined) {
      // Validate hex color format
      if (body.heroBackgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(body.heroBackgroundColor)) {
        const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.invalidColorFormat');
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      updateData.heroBackgroundColor = body.heroBackgroundColor || '#FFFFFF';
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: updateData,
      select: {
        messageTemplates: true,
        enableReminders: true,
        reminderHoursBefore: true,
        lineBotBasicId: true,
        messagingMode: true,
        webhookConfigured: true,
        webhookUrl: true,
        heroBackgroundColor: true,
      },
    });

    return NextResponse.json({
      success: true,
      messageTemplates: updatedBusiness.messageTemplates,
      enableReminders: updatedBusiness.enableReminders,
      reminderHoursBefore: updatedBusiness.reminderHoursBefore,
      lineBotBasicId: updatedBusiness.lineBotBasicId,
      messagingMode: updatedBusiness.messagingMode,
      webhookConfigured: updatedBusiness.webhookConfigured,
      webhookUrl: updatedBusiness.webhookUrl,
      heroBackgroundColor: updatedBusiness.heroBackgroundColor || '#FFFFFF',
    });
  } catch (error) {
    console.error('Update messaging settings error:', error);
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.dashboard.messaging.errors.internalError');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
