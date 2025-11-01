/**
 * Subscription Configuration
 * Centralized configuration for subscription pricing and trial periods
 * Reads from environment variables to support multi-country deployments
 */

export const SUBSCRIPTION_CONFIG = {
  priceAmount: process.env.SUBSCRIPTION_PRICE_AMOUNT || '200',
  priceCurrency: process.env.SUBSCRIPTION_PRICE_CURRENCY || 'TWD',
  trialDays: parseInt(process.env.SUBSCRIPTION_TRIAL_DAYS || '14', 10),
};

/**
 * Format price for display
 * @returns {string} Formatted price (e.g., "200 TWD")
 */
export function getFormattedPrice() {
  return `${SUBSCRIPTION_CONFIG.priceAmount} ${SUBSCRIPTION_CONFIG.priceCurrency}`;
}

/**
 * Get trial duration text
 * @returns {string} Trial text (e.g., "14-day free trial included")
 */
export function getTrialText() {
  return `${SUBSCRIPTION_CONFIG.trialDays}-day free trial included`;
}

/**
 * Get trial duration in days
 * @returns {number} Number of trial days
 */
export function getTrialDays() {
  return SUBSCRIPTION_CONFIG.trialDays;
}

export default {
  SUBSCRIPTION_CONFIG,
  getFormattedPrice,
  getTrialText,
  getTrialDays,
};
