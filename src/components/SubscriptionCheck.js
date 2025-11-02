/**
 * Subscription Check Component
 * Wraps dashboard pages to check subscription status
 * Shows trial banner if trialing, redirects if no access
 * Provides subscription data via context to avoid duplicate API calls
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TrialBanner from './TrialBanner';
import SubscriptionContext from '@/contexts/SubscriptionContext';

const ALLOWED_PATHS_WITHOUT_SUBSCRIPTION = [
  '/dashboard/billing',
  '/dashboard/subscription-required',
];

export default function SubscriptionCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const response = await fetch('/api/subscription/status');

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          window.location.href = '/api/auth/login';
          return;
        }

        throw new Error('Failed to check subscription');
      }

      const data = await response.json();
      setSubscription(data);

      // Check if user has access
      if (!data.hasAccess) {
        // Check if current path is allowed without subscription
        const isAllowedPath = ALLOWED_PATHS_WITHOUT_SUBSCRIPTION.some((path) =>
          pathname.startsWith(path)
        );

        if (!isAllowedPath) {
          // Redirect to subscription required page using full page navigation
          // (client-side routing was causing the page to get stuck in loading state)
          window.location.href = '/dashboard/subscription-required';
          return;
        }
        // If on allowed path without access, continue to render
      }

      setLoading(false);
    } catch (err) {
      console.error('Subscription check error:', err);
      setError(err.message);
      setLoading(false);

      // Fail open - allow access if check fails
      // This prevents locking users out due to technical issues
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Subscription check failed, allowing access');
  }

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error, refetch: checkSubscription }}>
      {/* Show trial banner if in trial */}
      <TrialBanner subscription={subscription} />

      {/* Render children */}
      {children}
    </SubscriptionContext.Provider>
  );
}
