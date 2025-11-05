/**
 * Local Storage Utilities for Weebo Dashboard
 * Handles storing user preferences in browser localStorage
 */

const LAST_SELECTED_BUSINESS_KEY = 'weebo_last_selected_business';

/**
 * Get the last selected business ID for a user
 * @param {string} ownerId - Business owner ID
 * @returns {string|null} Business ID or null
 */
export function getLastSelectedBusiness(ownerId) {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(LAST_SELECTED_BUSINESS_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed[ownerId] || null;
  } catch (error) {
    console.error('Error reading last selected business:', error);
    return null;
  }
}

/**
 * Set the last selected business ID for a user
 * @param {string} ownerId - Business owner ID
 * @param {string} businessId - Business ID to remember
 */
export function setLastSelectedBusiness(ownerId, businessId) {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(LAST_SELECTED_BUSINESS_KEY);
    const parsed = data ? JSON.parse(data) : {};

    parsed[ownerId] = businessId;
    localStorage.setItem(LAST_SELECTED_BUSINESS_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Error saving last selected business:', error);
  }
}

/**
 * Clear the last selected business for a user
 * @param {string} ownerId - Business owner ID
 */
export function clearLastSelectedBusiness(ownerId) {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(LAST_SELECTED_BUSINESS_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);
    delete parsed[ownerId];

    if (Object.keys(parsed).length === 0) {
      localStorage.removeItem(LAST_SELECTED_BUSINESS_KEY);
    } else {
      localStorage.setItem(LAST_SELECTED_BUSINESS_KEY, JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error clearing last selected business:', error);
  }
}
