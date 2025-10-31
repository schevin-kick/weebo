/**
 * LINE Token Manager
 * Handles automatic token refresh and validation for LINE Messaging API
 */

import { refreshLINEToken } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check if LINE token is expired or will expire soon
 * @param {Date|string|null} expiresAt - Token expiration timestamp
 * @param {number} bufferMinutes - Refresh if expiring within this many minutes (default: 60)
 * @returns {boolean} True if token needs refresh
 */
export function isTokenExpired(expiresAt, bufferMinutes = 60) {
  if (!expiresAt) return true;

  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const bufferMs = bufferMinutes * 60 * 1000;

  return expirationDate.getTime() - now.getTime() < bufferMs;
}

/**
 * Get a valid LINE channel access token for a business
 * Automatically refreshes the token if expired or about to expire
 *
 * @param {object} business - Business object with LINE token fields
 * @returns {Promise<string|null>} Valid channel access token or null if unavailable
 */
export async function getValidChannelAccessToken(business) {
  // No token configured - return null (will fallback to app-level token if available)
  if (!business.lineChannelAccessToken) {
    return null;
  }

  // Token is still valid
  if (!isTokenExpired(business.lineTokenExpiresAt)) {
    return business.lineChannelAccessToken;
  }

  // Token expired - attempt to refresh
  if (!business.lineRefreshToken) {
    console.warn(`LINE token expired for business ${business.id} but no refresh token available`);
    return null;
  }

  try {
    console.log(`Refreshing LINE token for business ${business.id}`);

    const tokenData = await refreshLINEToken(business.lineRefreshToken);

    // Calculate new expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Update business with new tokens
    await prisma.business.update({
      where: { id: business.id },
      data: {
        lineChannelAccessToken: tokenData.access_token,
        lineRefreshToken: tokenData.refresh_token, // LINE provides new refresh token
        lineTokenExpiresAt: expiresAt,
      },
    });

    console.log(`Successfully refreshed LINE token for business ${business.id}`);

    return tokenData.access_token;
  } catch (error) {
    console.error(`Failed to refresh LINE token for business ${business.id}:`, error.message);

    // Clear invalid tokens from database
    await prisma.business.update({
      where: { id: business.id },
      data: {
        lineChannelAccessToken: null,
        lineRefreshToken: null,
        lineTokenExpiresAt: null,
      },
    });

    // TODO: Send notification to business owner about disconnected LINE account
    // This could be an email or in-app notification

    return null;
  }
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

  if (isTokenExpired(business.lineTokenExpiresAt, 0)) {
    return {
      connected: false,
      status: 'expired',
      message: 'LINE token expired - reconnection required',
      expiresAt: business.lineTokenExpiresAt,
    };
  }

  if (isTokenExpired(business.lineTokenExpiresAt, 60 * 24 * 7)) { // 7 days
    return {
      connected: true,
      status: 'expiring_soon',
      message: 'LINE token expiring soon - will auto-refresh',
      expiresAt: business.lineTokenExpiresAt,
    };
  }

  return {
    connected: true,
    status: 'active',
    message: 'LINE account connected',
    expiresAt: business.lineTokenExpiresAt,
  };
}

export default {
  isTokenExpired,
  getValidChannelAccessToken,
  getLINEConnectionStatus,
};
