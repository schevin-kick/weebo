/**
 * Subscription Required Page
 * Shown when user's trial has expired or subscription is inactive
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function SubscriptionRequiredPage() {
  const { subscription, loading: subscriptionLoading, refetch } = useSubscription();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      // Only fetch config - subscription comes from context
      const configRes = await fetch('/api/subscription/config');

      if (!configRes.ok) throw new Error('Failed to load configuration');

      const configData = await configRes.json();
      setConfig(configData);
    } catch (err) {
      console.error('Load config error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Subscribe error:', err);
      setError(err.message);
      setActionLoading(false);
    }
  }

  async function handleManageSubscription() {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to open portal');
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Portal error:', err);
      setError(err.message);
      setActionLoading(false);
    }
  }

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';
  const isTrialExpired = subscription?.status === 'trial_expired';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
            {isPastDue && 'Payment Required'}
            {isCanceled && 'Subscription Canceled'}
            {isTrialExpired && 'Free Trial Ended'}
            {!isPastDue && !isCanceled && !isTrialExpired &&
              'Subscription Required'}
          </h1>

          {/* Message */}
          <p className="text-slate-600 text-center mb-6">
            {isPastDue &&
              'Your payment is past due. Please update your payment method to continue using Kitsune.'}
            {isCanceled &&
              'Your subscription has been canceled. Resubscribe to continue managing your business.'}
            {isTrialExpired &&
              'Your free trial has ended. Subscribe to Kitsune Pro to continue managing your business.'}
            {!isPastDue && !isCanceled && !isTrialExpired &&
              'An active subscription is required to access this feature.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">
              Kitsune Pro includes:
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">Unlimited bookings</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">
                  Custom services & pricing
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">Staff management</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">
                  LINE messaging integration
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">Analytics dashboard</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {config
                ? `${config.priceAmount} ${config.priceCurrency}`
                : 'Loading...'}
              <span className="text-lg text-slate-600 font-normal"> / month</span>
            </div>
            {!isPastDue && config && (
              <p className="text-sm text-slate-600">
                {config.trialDays}-day free trial included
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isPastDue ? (
              <button
                onClick={handleManageSubscription}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Update Payment Method
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Subscribe Now</>
                )}
              </button>
            )}

            {/* <a
              href="/dashboard/billing"
              className="block text-center text-sm text-slate-600 hover:text-slate-900"
            >
              View billing details
            </a> */}

            <a
              href="/api/auth/logout"
              className="flex items-center justify-center gap-2 text-center text-sm text-slate-500 hover:text-slate-700 transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
