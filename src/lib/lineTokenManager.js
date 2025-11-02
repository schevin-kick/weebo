/**
 * LINE Token Manager
 * Handles LINE Channel Access Token for LINE Messaging API
 * Note: We use long-lived Channel Access Tokens that do not expire
 */

/**
 * Get a valid LINE channel access token for a business
 * Returns the business-specific token if configured
 *
 * @param {object} business - Business object with LINE token fields
 * @returns {Promise<string|null>} Channel access token or null if unavailable
 */
export async function getValidChannelAccessToken(business) {
  // Return business-specific token if configured
  if (business.lineChannelAccessToken) {
    return business.lineChannelAccessToken;
  }

  // No token configured - return null (will fallback to app-level token if available)
  return null;
}

/**
 * Get LINE connection status for a business
 * @param {object} business - Business object
 * @returns {object} Connection status and details
 */
export function getLINEConnectionStatus(business) {
  if (!business.lineChannelAccessToken) {
    return {
      connected: false,
      status: 'disconnected',
      message: 'LINE account not connected',
    };
  }

  return {
    connected: true,
    status: 'active',
    message: 'LINE account connected',
  };
}

export default {
  getValidChannelAccessToken,
  getLINEConnectionStatus,
};
