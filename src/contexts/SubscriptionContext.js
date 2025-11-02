/**
 * Subscription Context
 * Provides subscription status to all dashboard pages
 * Prevents duplicate API calls
 */

'use client';

import { createContext, useContext } from 'react';

const SubscriptionContext = createContext(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
