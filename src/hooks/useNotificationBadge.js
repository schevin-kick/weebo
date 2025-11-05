/**
 * useNotificationBadge Hook
 * Manages notification badges for menu items using localStorage
 */

'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'weebo_notification_badge_';

/**
 * Hook to manage notification badge visibility
 * @param {string} badgeKey - Unique identifier for the badge (e.g., 'messaging')
 * @param {string} businessId - Business ID to scope the badge to a specific business
 * @returns {object} { showBadge: boolean, markAsVisited: function, resetBadge: function }
 */
export function useNotificationBadge(badgeKey, businessId = null) {
  const [showBadge, setShowBadge] = useState(false);

  // Create storage key scoped to business if provided
  const storageKey = businessId
    ? `${STORAGE_KEY_PREFIX}${businessId}_${badgeKey}`
    : `${STORAGE_KEY_PREFIX}${badgeKey}`;

  useEffect(() => {
    // Check if badge has been dismissed
    const hasVisited = localStorage.getItem(storageKey);
    setShowBadge(!hasVisited);
  }, [storageKey]);

  const markAsVisited = () => {
    localStorage.setItem(storageKey, 'true');
    setShowBadge(false);
  };

  const resetBadge = () => {
    localStorage.removeItem(storageKey);
    setShowBadge(true);
  };

  return {
    showBadge,
    markAsVisited,
    resetBadge,
  };
}

export default useNotificationBadge;
