'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, Settings, LogOut, QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FallingSakura from '@/components/background/FallingSakura';
import KitsuneLogo from '@/components/loading/KitsuneLogo';

export default function BusinessDashboard() {
  const t = useTranslations('setup');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await fetch('/api/subscription/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
      // Use defaults if fetch fails
      setConfig({
        priceAmount: 200,
        priceCurrency: 'TWD',
        trialDays: 14,
      });
    }
  }

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data.user) {
        // Not authenticated, redirect to login
        window.location.href = '/api/auth/login';
        return;
      }

      setUser(data.user);
      await loadBusinesses();
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to verify authentication');
      setLoading(false);
    }
  }

  async function loadBusinesses() {
    try {
      const response = await fetch('/api/businesses');
      if (!response.ok) throw new Error('Failed to load businesses');

      const data = await response.json();
      const userBusinesses = data.businesses || [];

      // Handle redirects based on business count
      if (userBusinesses.length >= 1) {
        // Has businesses - redirect to first business dashboard (keep loading state)
        router.push(`/dashboard/${userBusinesses[0].id}`);
        return;
      }

      // Zero businesses - stay on this page to show "Create Your First Business"
      setBusinesses(userBusinesses);
      setLoading(false);
    } catch (err) {
      console.error('Load businesses error:', err);
      setError('Failed to load businesses');
      setLoading(false);
    }
  }

  async function handleLogout() {
    window.location.href = '/api/auth/logout';
  }

  if (loading) {
    return (
      <>
        <FallingSakura />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
          <KitsuneLogo size="large" />
        </div>
      </>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('error.authFailed')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('error.retryButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FallingSakura />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Kitsune"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {t('logo')}
                  </h1>
                  <p className="text-sm text-slate-600">{t('subtitle')}</p>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.pictureUrl && (
                      <img
                        src={user.pictureUrl}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-slate-700">{user.displayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('logoutButton')}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t('welcomeMessage', { name: user?.displayName })}
            </h2>
            <p className="text-slate-600">
              {t('description')}
            </p>
          </div>

          {/* Create New Business Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/setup/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
            >
              <Plus className="w-5 h-5" />
              {t('createNewBusiness')}
            </button>
          </div>

          {/* Business List */}
          {businesses.length === 0 ? (
            <>
              {/* Trial Notice */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      {t('trialNotice.title', { count: config?.trialDays || 14 })}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {t('trialNotice.description', {
                        count: config?.trialDays || 14,
                        price: config?.priceAmount || 210,
                        currency: config?.priceCurrency || 'TWD'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t('noBusiness.title')}
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {t('noBusiness.description')}
                </p>
                <button
                  onClick={() => router.push('/setup/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('noBusiness.button')}
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onClick={() => router.push(`/setup/${business.id}`)}
                  t={t}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function BusinessCard({ business, onClick, t }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
    >
      {/* Logo/Header */}
      <div className="h-32 bg-gradient-to-br from-orange-500 to-amber-500 relative flex items-center justify-center">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Store className="w-12 h-12 text-white/80" />
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
          {business.businessName}
        </h3>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div>
            {t('businessCard.servicesCount', { count: business._count?.services || 0 })}
          </div>
          <div>
            {t('businessCard.staffCount', { count: business._count?.staff || 0 })}
          </div>
        </div>

        {business._count?.pendingBookings > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-700">
              {t('businessCard.pendingBadge', { count: business._count.pendingBookings })}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t('businessCard.manageButton')}
          </button>
          {business.qrCodeUrl && (
            <a
              href={business.qrCodeUrl}
              download={`${business.businessName}-qr.png`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title={t('businessCard.downloadQR')}
            >
              <QrCode className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
