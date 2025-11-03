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
import { updateCSRFToken } from '@/hooks/useCSRF';

const ALLOWED_PATHS_WITHOUT_SUBSCRIPTION = [
  '/dashboard/billing',
  '/dashboard/subscription-required',
];

// Pages that should ALWAYS bypass cache (accurate subscription info is critical)
const ALWAYS_BYPASS_CACHE_PATHS = [
  '/dashboard/billing',
  '/dashboard/subscription-required',
];

export default function SubscriptionCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track URL search params to detect query parameter changes
  const [searchParams, setSearchParams] = useState('');

  useEffect(() => {
    // Update search params whenever they change
    const currentSearch = window.location.search;
    if (currentSearch !== searchParams) {
      setSearchParams(currentSearch);
    }
  }, [pathname]);

  useEffect(() => {
    checkSubscription();
  }, [pathname, searchParams]); // Re-run when pathname OR query params change

  async function checkSubscription() {
    try {
      // Check if current page should always bypass cache
      const isAlwaysBypassPath = ALWAYS_BYPASS_CACHE_PATHS.some((path) =>
        pathname.startsWith(path)
      );

      // Detect if user just returned from Stripe or created first business
      const urlParams = new URLSearchParams(window.location.search);
      const fromStripeCheckout = urlParams.get('success') === 'true' || urlParams.get('canceled') === 'true';
      const fromStripePortal = urlParams.get('from') === 'portal';
      const fromSetupFirstBusiness = urlParams.get('from') === 'setup' && urlParams.get('first') === 'true';

      // Bypass cache if on billing page OR returning from Stripe OR created first business
      const shouldBypassCache = isAlwaysBypassPath || fromStripeCheckout || fromStripePortal || fromSetupFirstBusiness;

      // Build API URL with bypass parameter if needed
      const apiUrl = shouldBypassCache
        ? '/api/subscription/status?bypass=true'
        : '/api/subscription/status';

      if (shouldBypassCache) {
        let reason = 'billing page';
        if (fromStripeCheckout || fromStripePortal) reason = 'Stripe redirect';
        if (fromSetupFirstBusiness) reason = 'first business created';
        console.log(`[SubscriptionCheck] Bypassing cache (reason: ${reason})`);
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          window.location.href = '/api/auth/login';
          return;
        }

        // Log detailed error information
        const errorText = await response.text();
        console.error(`[SubscriptionCheck] API error ${response.status}:`, errorText);
        throw new Error(`Failed to check subscription: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update CSRF token if a new one was returned (session regenerated)
      if (data.newCsrfToken) {
        updateCSRFToken(data.newCsrfToken);
      }

      setSubscription(data);

      // Refresh session cookie when returning from Stripe or first business creation
      // This ensures session cache is updated with fresh subscription data
      if (fromStripeCheckout || fromStripePortal || fromSetupFirstBusiness) {
        fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              console.log(`[SubscriptionCheck] Session cookie refreshed with status: ${result.subscription.status}`);
              // Update CSRF token if returned
              if (result.newCsrfToken) {
                updateCSRFToken(result.newCsrfToken);
              }
            }
          })
          .catch(err => console.error('[SubscriptionCheck] Failed to refresh session:', err));
      }

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
