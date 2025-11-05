/**
 * Webhook Setup API Route
 * POST /api/dashboard/[businessId]/messaging/setup-webhook
 * Programmatically configure LINE webhook for business owner's bot
 */

import { NextResponse } from 'next/server';
import { getSession, getBaseUrl } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { detectLocaleFromRequest, translate } from '@/lib/localeUtils';

export async function POST(request, { params }) {
  try {
    // Detect user's locale from request headers
    const locale = detectLocaleFromRequest(request);

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;
    const { channelAccessToken, lineBotBasicId } = await request.json();

    if (!channelAccessToken || !lineBotBasicId) {
      return NextResponse.json(
        { error: 'Channel access token and bot basic ID are required' },
        { status: 400 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true }
    });

    if (!business || business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('[Webhook Setup] Starting for business:', businessId);

    // Step 1: Validate token by testing it
    console.log('[Webhook Setup] Validating channel access token...');
    const testResponse = await fetch('https://api.line.me/v2/bot/info', {
      headers: { 'Authorization': `Bearer ${channelAccessToken}` }
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      console.error('[Webhook Setup] Invalid token:', errorData);
      return NextResponse.json(
        { error: 'Invalid channel access token: ' + (errorData.message || 'Token validation failed') },
        { status: 400 }
      );
    }

    console.log('[Webhook Setup] Token validated successfully');

    // Step 2: Set webhook URL
    const webhookUrl = `${getBaseUrl()}/api/webhooks/line/${businessId}`;
    console.log('[Webhook Setup] Setting webhook URL:', webhookUrl);

    const webhookResponse = await fetch(
      'https://api.line.me/v2/bot/channel/webhook/endpoint',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({ endpoint: webhookUrl })
      }
    );

    if (!webhookResponse.ok) {
      const error = await webhookResponse.json().catch(() => ({}));
      console.error('[Webhook Setup] Failed to set webhook:', error);
      return NextResponse.json(
        { error: 'Failed to set webhook: ' + (error.message || 'Unknown error') },
        { status: 400 }
      );
    }

    console.log('[Webhook Setup] Webhook URL set successfully');

    // Step 3: Test webhook
    console.log('[Webhook Setup] Testing webhook...');
    const testWebhookResponse = await fetch(
      'https://api.line.me/v2/bot/channel/webhook/test',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${channelAccessToken}` }
      }
    );

    const webhookVerified = testWebhookResponse.ok;
    if (webhookVerified) {
      console.log('[Webhook Setup] Webhook test passed');
    } else {
      console.warn('[Webhook Setup] Webhook test failed, but continuing...');
    }

    // Step 4: Update business in database
    console.log('[Webhook Setup] Updating database...');
    await prisma.business.update({
      where: { id: businessId },
      data: {
        webhookConfigured: true,
        webhookUrl,
        lineWebhookVerified: webhookVerified,
        webhookAcknowledged: true,
        lineBotBasicId: lineBotBasicId,
        lineChannelAccessToken: channelAccessToken,
        messagingMode: 'own_bot'
      }
    });

    console.log('[Webhook Setup] Setup completed successfully');

    const message = webhookVerified
      ? await translate(locale, 'api.webhookSetup.successVerified')
      : await translate(locale, 'api.webhookSetup.successUnverified');

    return NextResponse.json({
      success: true,
      webhookUrl,
      verified: webhookVerified,
      message
    });

  } catch (error) {
    console.error('[Webhook Setup] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
