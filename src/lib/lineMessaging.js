/**
 * LINE Messaging API Utilities
 * Handles sending rich message cards to customers via LINE
 */

import { formatDateTime, formatDuration } from './dateUtils';
import { getValidChannelAccessToken } from './lineTokenManager';
import { getMessageTemplate } from './messageTemplates';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message/push';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * Send a push message via LINE Messaging API
 * @param {string} lineUserId - Customer's LINE user ID
 * @param {object[]} messages - Array of LINE message objects
 * @param {object} business - Business object (for token management)
 * @returns {Promise<object>} Response from LINE API
 */
export async function sendLineMessage(lineUserId, messages, business = null) {
  let channelAccessToken = LINE_CHANNEL_ACCESS_TOKEN;
  let targetUserId = lineUserId;
  let tokenSource = 'shared';

  if (business) {
    // Check messaging mode
    if (business.messagingMode === 'own_bot' && business.lineChannelAccessToken) {
      // Business using their own bot - need to map user ID
      channelAccessToken = business.lineChannelAccessToken;
      tokenSource = 'own_bot';

      // Look up mapped user ID
      const mapping = await prisma.customerBotMapping.findFirst({
        where: {
          liffUserId: lineUserId,
          businessId: business.id
        }
      });

      if (!mapping) {
        console.warn('[LINE] User has not added business bot:', {
          liffUserId: lineUserId,
          businessId: business.id,
          messagingMode: business.messagingMode
        });
        return {
          status: 'skipped',
          reason: 'user_not_friend',
          message: 'Customer has not added your LINE bot'
        };
      }

      targetUserId = mapping.businessBotUserId;
      console.log('[LINE] Using mapped user ID:', {
        liffUserId: lineUserId,
        businessBotUserId: targetUserId
      });
    }
    // For shared mode (or no mode set), always use shared bot token
    // No additional logic needed - falls through to LINE_CHANNEL_ACCESS_TOKEN
  }

  if (!channelAccessToken) {
    console.warn('No LINE channel access token available. Skipping message send.');
    return { status: 'skipped', reason: 'no_token' };
  }

  console.log('[LINE] Sending message:', {
    targetUserId,
    messageCount: messages.length,
    tokenSource,
    businessId: business?.id,
    messagingMode: business?.messagingMode || 'shared'
  });

  try {
    const response = await fetch(LINE_MESSAGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: targetUserId,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[LINE] API error:', {
        status: response.status,
        error: errorData,
        targetUserId,
        tokenSource
      });
      throw new Error(`LINE API error: ${errorData.message || response.statusText}`);
    }

    console.log('[LINE] Message sent successfully:', { targetUserId });
    return { status: 'sent' };
  } catch (error) {
    console.error('[LINE] Error sending message:', {
      error: error.message,
      targetUserId,
      tokenSource
    });
    return { status: 'failed', error: error.message };
  }
}

/**
 * Create a rich booking confirmation message
 * @param {object} booking - Booking object with all details
 * @param {object} business - Business object
 * @returns {object} LINE Flex Message
 */
function createBookingConfirmationMessage(booking, business) {
  // Get custom template
  const template = getMessageTemplate(business, 'confirmation');

  const bodyContents = [
    {
      type: 'text',
      text: template.header,
      weight: 'bold',
      size: 'xl',
      color: '#22c55e',
      wrap: true,
    },
  ];

  // Add custom body text if provided
  if (template.body) {
    bodyContents.push({
      type: 'text',
      text: template.body,
      size: 'md',
      color: '#666666',
      wrap: true,
      margin: 'sm',
    });
  }

  // Add business name with icon
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    margin: 'md',
    contents: [
      {
        type: 'icon',
        url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
        size: 'sm',
      },
      {
        type: 'text',
        text: business.businessName,
        size: 'sm',
        color: '#999999',
        margin: 'md',
        flex: 0,
      },
    ],
  });

  // Add service if available
  if (booking.service) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'box',
          layout: 'baseline',
          spacing: 'sm',
          contents: [
            {
              type: 'text',
              text: 'Service',
              color: '#aaaaaa',
              size: 'sm',
              flex: 1,
            },
            {
              type: 'text',
              text: booking.service.name,
              wrap: true,
              color: '#666666',
              size: 'sm',
              flex: 3,
              weight: 'bold',
            },
          ],
        },
      ],
    });
  }

  // Add staff if available
  if (booking.staff) {
    bodyContents.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: 'Staff',
          color: '#aaaaaa',
          size: 'sm',
          flex: 1,
        },
        {
          type: 'text',
          text: booking.staff.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          flex: 3,
        },
      ],
    });
  }

  // Add date/time
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: 'Date & Time',
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime),
        wrap: true,
        color: '#666666',
        size: 'sm',
        flex: 3,
      },
    ],
  });

  // Add duration
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: 'Duration',
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDuration(booking.duration),
        wrap: true,
        color: '#666666',
        size: 'sm',
        flex: 3,
      },
    ],
  });

  // Add contact info if available
  if (business.phone || business.address) {
    bodyContents.push({
      type: 'separator',
      margin: 'lg',
    });

    const contactContents = [];

    // Add clickable phone number
    if (business.phone) {
      contactContents.push({
        type: 'text',
        text: `📞 ${business.phone}`,
        color: '#0066cc',
        size: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `tel:${business.phone.replace(/[^0-9+]/g, '')}`,
        },
      });
    }

    // Add clickable address (opens in maps)
    if (business.address) {
      contactContents.push({
        type: 'text',
        text: `📍 ${business.address}`,
        color: '#0066cc',
        size: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`,
        },
      });
    }

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: contactContents,
    });
  }

  return {
    type: 'flex',
    altText: 'Your booking has been confirmed!',
    contents: {
      type: 'bubble',
      hero: business.logoUrl
        ? {
            type: 'image',
            url: business.logoUrl,
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'fit',
            backgroundColor: business.heroBackgroundColor || '#FFFFFF',
          }
        : undefined,
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'View My Bookings',
              uri: business.lineDeepLink.replace('?business_id=', '/my-bookings?business_id='),
            },
            color: '#f97316',
          },
        ],
      },
    },
  };
}

/**
 * Create a rich booking cancellation message
 * @param {object} booking - Booking object with all details
 * @param {object} business - Business object
 * @param {string} reason - Optional cancellation reason
 * @returns {object} LINE Flex Message
 */
function createBookingCancellationMessage(booking, business, reason = null) {
  // Get custom template
  const template = getMessageTemplate(business, 'cancellation');

  const bodyContents = [
    {
      type: 'text',
      text: template.header,
      weight: 'bold',
      size: 'xl',
      color: '#ef4444',
      wrap: true,
    },
  ];

  // Add custom body text if provided
  if (template.body) {
    bodyContents.push({
      type: 'text',
      text: template.body,
      size: 'md',
      color: '#666666',
      wrap: true,
      margin: 'sm',
    });
  }

  // Add business name
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    margin: 'md',
    contents: [
      {
        type: 'text',
        text: business.businessName,
        size: 'sm',
        color: '#999999',
        flex: 0,
      },
    ],
  });

  // Add reason if provided
  if (reason) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: 'Reason',
          color: '#aaaaaa',
          size: 'sm',
        },
        {
          type: 'text',
          text: reason,
          wrap: true,
          color: '#666666',
          size: 'sm',
          margin: 'xs',
        },
      ],
    });
  }

  // Add booking details
  if (booking.service) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: 'Service: ' + booking.service.name,
          color: '#999999',
          size: 'sm',
          wrap: true,
        },
      ],
    });
  }

  bodyContents.push({
    type: 'text',
    text: 'Date: ' + formatDateTime(booking.dateTime),
    color: '#999999',
    size: 'sm',
    wrap: true,
    margin: 'xs',
  });

  // Add contact info if available
  if (business.phone || business.address) {
    bodyContents.push({
      type: 'separator',
      margin: 'lg',
    });

    const contactContents = [
      {
        type: 'text',
        text: 'Questions? Contact us:',
        color: '#aaaaaa',
        size: 'xs',
      },
    ];

    // Add clickable phone number
    if (business.phone) {
      contactContents.push({
        type: 'text',
        text: `📞 ${business.phone}`,
        color: '#0066cc',
        size: 'xs',
        margin: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `tel:${business.phone.replace(/[^0-9+]/g, '')}`,
        },
      });
    }

    // Add clickable address (opens in maps)
    if (business.address) {
      contactContents.push({
        type: 'text',
        text: `📍 ${business.address}`,
        color: '#0066cc',
        size: 'xs',
        margin: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`,
        },
      });
    }

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: contactContents,
    });
  }

  return {
    type: 'flex',
    altText: 'Your booking has been cancelled',
    contents: {
      type: 'bubble',
      hero: business.logoUrl
        ? {
            type: 'image',
            url: business.logoUrl,
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'fit',
            backgroundColor: business.heroBackgroundColor || '#FFFFFF',
          }
        : undefined,
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'Book Again',
              uri: business.lineDeepLink,
            },
            color: '#f97316',
          },
        ],
      },
    },
  };
}

/**
 * Create a rich booking reminder message
 * @param {object} booking - Booking object with all details
 * @param {object} business - Business object
 * @returns {object} LINE Flex Message
 */
function createBookingReminderMessage(booking, business) {
  // Get custom template
  const template = getMessageTemplate(business, 'reminder');

  const bodyContents = [
    {
      type: 'text',
      text: template.header,
      weight: 'bold',
      size: 'xl',
      color: '#f97316',
      wrap: true,
    },
  ];

  // Add custom body text if provided
  if (template.body) {
    bodyContents.push({
      type: 'text',
      text: template.body,
      size: 'md',
      color: '#666666',
      wrap: true,
      margin: 'sm',
    });
  }

  // Add business name with icon
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    margin: 'md',
    contents: [
      {
        type: 'icon',
        url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
        size: 'sm',
      },
      {
        type: 'text',
        text: business.businessName,
        size: 'sm',
        color: '#999999',
        margin: 'md',
        flex: 0,
      },
    ],
  });

  // Add service if available
  if (booking.service) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'box',
          layout: 'baseline',
          spacing: 'sm',
          contents: [
            {
              type: 'text',
              text: 'Service',
              color: '#aaaaaa',
              size: 'sm',
              flex: 1,
            },
            {
              type: 'text',
              text: booking.service.name,
              wrap: true,
              color: '#666666',
              size: 'sm',
              flex: 3,
              weight: 'bold',
            },
          ],
        },
      ],
    });
  }

  // Add staff if available
  if (booking.staff) {
    bodyContents.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: 'Staff',
          color: '#aaaaaa',
          size: 'sm',
          flex: 1,
        },
        {
          type: 'text',
          text: booking.staff.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          flex: 3,
        },
      ],
    });
  }

  // Add date/time
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: 'Date & Time',
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime),
        wrap: true,
        color: '#666666',
        size: 'sm',
        flex: 3,
      },
    ],
  });

  // Add duration
  bodyContents.push({
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: 'Duration',
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDuration(booking.duration),
        wrap: true,
        color: '#666666',
        size: 'sm',
        flex: 3,
      },
    ],
  });

  // Add contact info if available
  if (business.phone || business.address) {
    bodyContents.push({
      type: 'separator',
      margin: 'lg',
    });

    const contactContents = [];

    // Add clickable phone number
    if (business.phone) {
      contactContents.push({
        type: 'text',
        text: `📞 ${business.phone}`,
        color: '#0066cc',
        size: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `tel:${business.phone.replace(/[^0-9+]/g, '')}`,
        },
      });
    }

    // Add clickable address (opens in maps)
    if (business.address) {
      contactContents.push({
        type: 'text',
        text: `📍 ${business.address}`,
        color: '#0066cc',
        size: 'xs',
        wrap: true,
        action: {
          type: 'uri',
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`,
        },
      });
    }

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: contactContents,
    });
  }

  return {
    type: 'flex',
    altText: 'Reminder: Your appointment is coming up!',
    contents: {
      type: 'bubble',
      hero: business.logoUrl
        ? {
            type: 'image',
            url: business.logoUrl,
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'fit',
            backgroundColor: business.heroBackgroundColor || '#FFFFFF',
          }
        : undefined,
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'View My Bookings',
              uri: business.lineDeepLink.replace('?business_id=', '/my-bookings?business_id='),
            },
            color: '#f97316',
          },
        ],
      },
    },
  };
}

/**
 * Send booking confirmation message to customer
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingConfirmation(booking, business) {
  const message = createBookingConfirmationMessage(booking, business);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}

/**
 * Send booking cancellation message to customer
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingCancellation(booking, business, reason = null) {
  const message = createBookingCancellationMessage(booking, business, reason);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}

/**
 * Send booking reminder message to customer
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingReminder(booking, business) {
  const message = createBookingReminderMessage(booking, business);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}
