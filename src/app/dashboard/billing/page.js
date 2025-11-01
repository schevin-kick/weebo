/**
 * Billing Page
 * Manage subscription, view billing information
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { getFormattedPrice, getTrialText } from '@/lib/subscriptionConfig';

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for success/canceled query params
  const checkoutSuccess = searchParams.get('success') === 'true';
  const checkoutCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const response = await fetch('/api/subscription/status');
      if (!response.ok) throw new Error('Failed to load subscription');

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error('Load subscription error:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/setup')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </a>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing</h1>
          <p className="text-slate-600">
            Manage your subscription and payment information
          </p>
        </div>

        {/* Success Message */}
        {checkoutSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Subscription Activated!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Thank you for subscribing. Your subscription is now active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Canceled Message */}
        {checkoutCanceled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Checkout Canceled
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You can subscribe anytime by clicking the button below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-600" />
            Subscription Status
          </h2>

          {subscription?.status === 'pre_trial' && (
            <div>
              <p className="text-slate-600 mb-4">
                Create your first business to start your free 14-day trial.
              </p>
              <a
                href="/setup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Business
              </a>
            </div>
          )}

          {subscription?.status === 'trialing' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Free Trial Active
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                You have{' '}
                <span className="font-semibold">
                  {subscription.daysLeft} {subscription.daysLeft === 1 ? 'day' : 'days'}
                </span>{' '}
                remaining in your free trial.
              </p>
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Subscribe Now</>
                )}
              </button>
            </div>
          )}

          {subscription?.status === 'active' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  Subscription Active
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                Your subscription is active and in good standing.
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Manage Subscription
                  </>
                )}
              </button>
            </div>
          )}

          {['trial_expired', 'past_due', 'canceled', 'unpaid'].includes(
            subscription?.status
          ) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">
                  Subscription Inactive
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                {subscription.status === 'trial_expired' &&
                  'Your free trial has ended.'}
                {subscription.status === 'past_due' && 'Your payment is past due.'}
                {subscription.status === 'canceled' &&
                  'Your subscription has been canceled.'}
                {subscription.status === 'unpaid' && 'Your subscription is unpaid.'}
              </p>
              <div className="flex gap-3">
                {subscription.status === 'past_due' ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Update Payment Method</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Subscribe Now</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Kitsune Pro Plan
          </h2>

          <div className="mb-4">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {getFormattedPrice()}
              <span className="text-lg text-slate-600 font-normal"> / month</span>
            </div>
            <p className="text-sm text-slate-600">{getTrialText()}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">
              Everything you need:
            </h3>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Unlimited bookings</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Custom services & pricing</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Staff management</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Availability management</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Customer management</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">LINE messaging integration</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
