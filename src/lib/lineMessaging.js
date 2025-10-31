/**
 * LINE Messaging API Utilities
 * Handles sending rich message cards to customers via LINE
 */

import { formatDateTime, formatDuration } from './dateUtils';
import { getValidChannelAccessToken } from './lineTokenManager';
import { getMessageTemplate } from './messageTemplates';

const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message/push';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * Send a push message via LINE Messaging API
 * @param {string} lineUserId - Customer's LINE user ID
 * @param {object[]} messages - Array of LINE message objects
 * @param {object} business - Business object (for token management)
 * @returns {Promise<object>} Response from LINE API
 */
async function sendLineMessage(lineUserId, messages, business = null) {
  // Get business-specific token or fallback to app-level token
  let channelAccessToken = LINE_CHANNEL_ACCESS_TOKEN;

  if (business) {
    const businessToken = await getValidChannelAccessToken(business);
    if (businessToken) {
      channelAccessToken = businessToken;
    }
  }

  if (!channelAccessToken) {
    console.warn('No LINE channel access token available. Skipping message send.');
    return { status: 'skipped', reason: 'no_token' };
  }

  try {
    const response = await fetch(LINE_MESSAGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LINE API error: ${errorData.message || response.statusText}`);
    }

    return { status: 'sent' };
  } catch (error) {
    console.error('Error sending LINE message:', error);
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
  const contactParts = [];
  if (business.contactInfo?.phone) contactParts.push(business.contactInfo.phone);
  if (business.contactInfo?.address) contactParts.push(business.contactInfo.address);

  if (contactParts.length > 0) {
    bodyContents.push({
      type: 'separator',
      margin: 'lg',
    });
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: contactParts.map((text) => ({
        type: 'text',
        text,
        color: '#999999',
        size: 'xs',
        wrap: true,
      })),
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
            aspectMode: 'cover',
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
      text: booking.cancelledBy === 'owner' ? 'Booking Not Approved' : template.header,
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
  if (business.contactInfo?.phone) {
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
          text: 'Questions? Contact us:',
          color: '#aaaaaa',
          size: 'xs',
        },
        {
          type: 'text',
          text: business.contactInfo.phone,
          color: '#999999',
          size: 'xs',
          margin: 'xs',
        },
      ],
    });
  }

  return {
    type: 'flex',
    altText: 'Your booking has been cancelled',
    contents: {
      type: 'bubble',
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
            aspectMode: 'cover',
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
