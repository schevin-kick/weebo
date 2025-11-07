/**
 * Billing Page
 * Manage subscription, view billing information
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
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
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocale, useTranslations } from 'next-intl';

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('billing');
  const { subscription, loading: subscriptionLoading, refetch } = useSubscription();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for success/canceled query params
  const checkoutSuccess = searchParams.get('success') === 'true';
  const checkoutCanceled = searchParams.get('canceled') === 'true';

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
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToDashboard')}
            </button>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </a>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Success Message */}
        {checkoutSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  {t('messages.subscriptionActivated')}
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {t('messages.thankYouSubscribing')}
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
                  {t('messages.checkoutCanceled')}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('messages.canSubscribeAnytime')}
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
                <h3 className="font-semibold text-red-900">{t('messages.error')}</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-600" />
            {t('subscriptionStatus.title')}
          </h2>

          {subscription?.status === 'pre_trial' && (
            <div>
              <p className="text-slate-600 mb-4">
                {t('subscriptionStatus.preTrial.description', { days: config?.trialDays || 14 })}
              </p>
              <a
                href={`/${locale}/setup`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {t('subscriptionStatus.preTrial.createBusiness')}
              </a>
            </div>
          )}

          {subscription?.status === 'trialing' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {t('subscriptionStatus.trialing.status')}
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                {t.rich('subscriptionStatus.trialing.daysRemaining', {
                  count: subscription.daysLeft,
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>{t('subscriptionStatus.trialing.subscribeNow')}</>
                )}
              </button>
            </div>
          )}

          {subscription?.status === 'active' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  {t('subscriptionStatus.active.status')}
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                {t('subscriptionStatus.active.description')}
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    {t('subscriptionStatus.active.manageSubscription')}
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
                    {t('subscriptionStatus.inactive.status')}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">
                  {subscription.status === 'trial_expired' &&
                    t('subscriptionStatus.inactive.trialExpired')}
                  {subscription.status === 'past_due' && t('subscriptionStatus.inactive.pastDue')}
                  {subscription.status === 'canceled' &&
                    t('subscriptionStatus.inactive.canceled')}
                  {subscription.status === 'unpaid' && t('subscriptionStatus.inactive.unpaid')}
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
                          {t('loading')}
                        </>
                      ) : (
                        <>{t('subscriptionStatus.inactive.updatePaymentMethod')}</>
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
                          {t('loading')}
                        </>
                      ) : (
                        <>{t('subscriptionStatus.inactive.subscribeNow')}</>
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
            {t('plan.title')}
          </h2>

          <div className="mb-4">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {config
                ? `${config.priceAmount} ${config.priceCurrency}`
                : t('plan.loading')}
              <span className="text-lg text-slate-600 font-normal">{t('plan.pricePerMonth')}</span>
            </div>
            <p className="text-sm text-slate-600">
              {config
                ? t('plan.trialIncluded', { days: config.trialDays })
                : t('plan.loading')}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">
              {t('plan.everythingYouNeed')}
            </h3>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.unlimitedBookings')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.customServicesPricing')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.staffManagement')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.availabilityManagement')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.customerManagement')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.lineMessaging')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{t('plan.features.analyticsDashboard')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
