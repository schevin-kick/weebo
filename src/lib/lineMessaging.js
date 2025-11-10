/**
 * LINE Messaging API Utilities
 * Handles sending rich message cards to customers via LINE
 */

import { formatDateTime as formatDateTimeNonLocalized, formatDuration as formatDurationNonLocalized } from './dateUtils';
import { formatDateTime, formatDuration } from './localizedDateUtils';
import { getValidChannelAccessToken } from './lineTokenManager';
import { getMessageTemplate, getFieldLabels } from './messageTemplates';
import { getBaseUrl } from './auth';
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
  // Check if LINE user ID is provided
  if (!lineUserId) {
    console.warn('[LINE] No LINE user ID provided - skipping message send');
    return {
      status: 'skipped',
      reason: 'no_line_id',
      message: 'Customer does not have a LINE account'
    };
  }

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
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} LINE Flex Message
 */
function createBookingConfirmationMessage(booking, business, locale = 'en') {
  // Get custom template and field labels
  const template = getMessageTemplate(business, 'confirmation', locale);
  const labels = getFieldLabels(locale);

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
              text: labels.service,
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
          text: labels.staff,
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
        text: labels.dateTime,
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime, locale),
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
        text: labels.duration,
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDuration(booking.duration, locale),
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
    altText: template.header,
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
              label: labels.viewMyBookings,
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
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} LINE Flex Message
 */
function createBookingCancellationMessage(booking, business, reason = null, locale = 'en') {
  // Get custom template and field labels
  const template = getMessageTemplate(business, 'cancellation', locale);
  const labels = getFieldLabels(locale);

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
          text: labels.reason,
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
          text: labels.service + ': ' + booking.service.name,
          color: '#999999',
          size: 'sm',
          wrap: true,
        },
      ],
    });
  }

  bodyContents.push({
    type: 'text',
    text: labels.dateTime + ': ' + formatDateTime(booking.dateTime, locale),
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
        text: labels.questionsContact,
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
    altText: template.header,
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
              label: labels.bookAgain,
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
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} LINE Flex Message
 */
function createBookingReminderMessage(booking, business, locale = 'en') {
  // Get custom template and field labels
  const template = getMessageTemplate(business, 'reminder', locale);
  const labels = getFieldLabels(locale);

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
              text: labels.service,
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
          text: labels.staff,
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
        text: labels.dateTime,
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime, locale),
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
        text: labels.duration,
        color: '#aaaaaa',
        size: 'sm',
        flex: 1,
      },
      {
        type: 'text',
        text: formatDuration(booking.duration, locale),
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
    altText: template.header,
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
              label: labels.viewMyBookings,
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
 * @param {string|null} locale - Optional locale override (from request); if null, uses customer.language from DB
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingConfirmation(booking, business, locale = null) {
  if (!booking.customer?.lineUserId) {
    console.warn('[LINE] Cannot send confirmation - customer has no LINE ID');
    return {
      status: 'skipped',
      reason: 'no_line_id',
      message: 'Customer does not have a LINE account'
    };
  }
  const effectiveLocale = locale || booking.customer?.language || 'en';
  const message = createBookingConfirmationMessage(booking, business, effectiveLocale);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}

/**
 * Send booking cancellation message to customer
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object
 * @param {string} reason - Optional cancellation reason
 * @param {string|null} locale - Optional locale override (from request); if null, uses customer.language from DB
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingCancellation(booking, business, reason = null, locale = null) {
  if (!booking.customer?.lineUserId) {
    console.warn('[LINE] Cannot send cancellation - customer has no LINE ID');
    return {
      status: 'skipped',
      reason: 'no_line_id',
      message: 'Customer does not have a LINE account'
    };
  }
  const effectiveLocale = locale || booking.customer?.language || 'en';
  const message = createBookingCancellationMessage(booking, business, reason, effectiveLocale);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}

/**
 * Send booking reminder message to customer
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBookingReminder(booking, business) {
  if (!booking.customer?.lineUserId) {
    console.warn('[LINE] Cannot send reminder - customer has no LINE ID');
    return {
      status: 'skipped',
      reason: 'no_line_id',
      message: 'Customer does not have a LINE account'
    };
  }
  const locale = booking.customer?.language || 'en';
  const message = createBookingReminderMessage(booking, business, locale);
  return await sendLineMessage(booking.customer.lineUserId, [message], business);
}

/**
 * Create a notification message for business owner about new booking
 * @param {object} booking - Booking object with all details
 * @param {object} business - Business object with owner info
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} LINE Flex Message
 */
function createBusinessOwnerNotificationMessage(booking, business, locale = 'en') {
  const labels = getFieldLabels(locale);
  const appUrl = getBaseUrl();
  const viewBookingUrl = `${appUrl}/${locale}/booking/${booking.id}`;

  const bodyContents = [
    {
      type: 'text',
      text: labels.newAppointmentBooked,
      weight: 'bold',
      size: 'xl',
      color: '#f97316',
      wrap: true,
    },
    {
      type: 'text',
      text: `${labels.newAppointmentScheduled} ${business.businessName}`,
      size: 'sm',
      color: '#666666',
      wrap: true,
      margin: 'sm',
    },
  ];

  // Customer info
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    margin: 'lg',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.customer,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: booking.customer?.displayName || 'Unknown',
        wrap: true,
        color: '#666666',
        size: 'sm',
        weight: 'bold',
        align: 'end',
      },
    ],
  });

  // Service info
  if (booking.service) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: labels.service,
          color: '#aaaaaa',
          size: 'sm',
          flex: 0,
        },
        {
          type: 'text',
          text: booking.service.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          align: 'end',
        },
      ],
    });
  }

  // Staff info
  if (booking.staff) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: labels.staff,
          color: '#aaaaaa',
          size: 'sm',
          flex: 0,
        },
        {
          type: 'text',
          text: booking.staff.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          align: 'end',
        },
      ],
    });
  }

  // Date & Time
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.dateTime,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime, locale),
        wrap: true,
        color: '#666666',
        size: 'sm',
        weight: 'bold',
        align: 'end',
      },
    ],
  });

  // Duration
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.duration,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: formatDuration(booking.duration, locale),
        wrap: true,
        color: '#666666',
        size: 'sm',
        align: 'end',
      },
    ],
  });

  // Status
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.status,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: booking.status === 'confirmed' ? labels.confirmed : labels.pendingApproval,
        wrap: true,
        color: booking.status === 'confirmed' ? '#22c55e' : '#f59e0b',
        size: 'sm',
        weight: 'bold',
        align: 'end',
      },
    ],
  });

  return {
    type: 'flex',
    altText: labels.newAppointmentBooked,
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
              label: labels.viewAppointment,
              uri: viewBookingUrl,
            },
            color: '#f97316',
          },
        ],
      },
    },
  };
}

/**
 * Send notification to business owner about new booking
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object with owner info
 * @param {string|null} locale - Optional locale override; if null, uses owner's language preference from DB
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBusinessOwnerNotification(booking, business, locale = null) {
  if (!business.owner?.lineUserId) {
    console.warn('[LINE] No business owner LINE user ID available');
    return { status: 'skipped', reason: 'no_owner_line_id' };
  }

  if (business.notificationsEnabled === false) {
    console.log('[LINE] Business owner notifications disabled');
    return { status: 'skipped', reason: 'notifications_disabled' };
  }

  console.log('[LINE] Sending business owner notification:', {
    bookingId: booking.id,
    businessId: business.id,
    ownerLineUserId: business.owner.lineUserId,
  });

  // Use owner's language preference, fallback to locale param, then customer language, finally default to 'zh-tw'
  const effectiveLocale = business.owner?.language || locale || booking.customer?.language || 'zh-tw';
  const message = createBusinessOwnerNotificationMessage(booking, business, effectiveLocale);

  // Always use shared bot token for owner notifications (null = use shared bot)
  return await sendLineMessage(business.owner.lineUserId, [message], null);
}

/**
 * Create a notification message for business owner about booking cancellation
 * @param {object} booking - Booking object with all details
 * @param {object} business - Business object with owner info
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} LINE Flex Message
 */
function createBusinessOwnerCancellationNotificationMessage(booking, business, locale = 'en') {
  const labels = getFieldLabels(locale);
  const appUrl = getBaseUrl();
  const viewBookingUrl = `${appUrl}/${locale}/booking/${booking.id}`;

  const bodyContents = [
    {
      type: 'text',
      text: labels.appointmentCancelled,
      weight: 'bold',
      size: 'xl',
      color: '#ef4444',
      wrap: true,
    },
    {
      type: 'text',
      text: `${labels.customerCancelledAppointment} ${business.businessName}`,
      size: 'sm',
      color: '#666666',
      wrap: true,
      margin: 'sm',
    },
  ];

  // Customer info
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    margin: 'lg',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.customer,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: booking.customer?.displayName || 'Unknown',
        wrap: true,
        color: '#666666',
        size: 'sm',
        weight: 'bold',
        align: 'end',
      },
    ],
  });

  // Service info
  if (booking.service) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: labels.service,
          color: '#aaaaaa',
          size: 'sm',
          flex: 0,
        },
        {
          type: 'text',
          text: booking.service.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          align: 'end',
        },
      ],
    });
  }

  // Staff info
  if (booking.staff) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: labels.staff,
          color: '#aaaaaa',
          size: 'sm',
          flex: 0,
        },
        {
          type: 'text',
          text: booking.staff.name,
          wrap: true,
          color: '#666666',
          size: 'sm',
          align: 'end',
        },
      ],
    });
  }

  // Date & Time
  bodyContents.push({
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: labels.dateTime,
        color: '#aaaaaa',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: formatDateTime(booking.dateTime, locale),
        wrap: true,
        color: '#666666',
        size: 'sm',
        align: 'end',
      },
    ],
  });

  // Cancellation reason (if provided)
  if (booking.cancellationReason) {
    bodyContents.push({
      type: 'separator',
      margin: 'lg',
    });
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: labels.reason,
          color: '#aaaaaa',
          size: 'sm',
        },
        {
          type: 'text',
          text: booking.cancellationReason,
          wrap: true,
          color: '#666666',
          size: 'sm',
          margin: 'xs',
        },
      ],
    });
  }

  return {
    type: 'flex',
    altText: labels.appointmentCancelled,
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
              label: labels.viewDetails,
              uri: viewBookingUrl,
            },
            color: '#ef4444',
          },
        ],
      },
    },
  };
}

/**
 * Send notification to business owner about booking cancellation
 * @param {object} booking - Full booking object with relations
 * @param {object} business - Full business object with owner info
 * @param {string|null} locale - Optional locale override; if null, uses owner's language preference from DB
 * @returns {Promise<object>} Result of send operation
 */
export async function sendBusinessOwnerCancellationNotification(booking, business, locale = null) {
  if (!business.owner?.lineUserId) {
    console.warn('[LINE] No business owner LINE user ID available');
    return { status: 'skipped', reason: 'no_owner_line_id' };
  }

  if (business.notificationsEnabled === false) {
    console.log('[LINE] Business owner notifications disabled');
    return { status: 'skipped', reason: 'notifications_disabled' };
  }

  // Only notify if customer cancelled (not owner)
  if (booking.cancelledBy !== 'customer') {
    console.log('[LINE] Skipping owner notification - cancelled by owner');
    return { status: 'skipped', reason: 'owner_cancelled' };
  }

  console.log('[LINE] Sending business owner cancellation notification:', {
    bookingId: booking.id,
    businessId: business.id,
    ownerLineUserId: business.owner.lineUserId,
  });

  // Use owner's language preference, fallback to locale param, then customer language, finally default to 'zh-tw'
  const effectiveLocale = business.owner?.language || locale || booking.customer?.language || 'zh-tw';
  const message = createBusinessOwnerCancellationNotificationMessage(booking, business, effectiveLocale);

  // Always use shared bot token for owner notifications (null = use shared bot)
  return await sendLineMessage(business.owner.lineUserId, [message], null);
}
