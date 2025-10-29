/**
 * Dashboard Business Selection Page
 * Shows when user has multiple businesses
 * Redirects automatically if user has 0 or 1 business
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus } from 'lucide-react';
import FallingSakura from '@/components/background/FallingSakura';
import { getLastSelectedBusiness, setLastSelectedBusiness } from '@/lib/localStorage';

export default function DashboardSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthAndLoadBusinesses();
  }, []);

  async function checkAuthAndLoadBusinesses() {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/session');
      const authData = await authResponse.json();

      if (!authData.user) {
        window.location.href = '/api/auth/login';
        return;
      }

      setUser(authData.user);

      // Load businesses
      const bizResponse = await fetch('/api/businesses');
      if (!bizResponse.ok) throw new Error('Failed to load businesses');

      const bizData = await bizResponse.json();
      const userBusinesses = bizData.businesses || [];
      setBusinesses(userBusinesses);

      // Handle redirects based on business count
      if (userBusinesses.length === 0) {
        // No businesses - redirect to setup
        router.push('/setup');
        return;
      }

      if (userBusinesses.length === 1) {
        // One business - go directly to dashboard
        const businessId = userBusinesses[0].id;
        setLastSelectedBusiness(authData.user.id, businessId);
        router.push(`/dashboard/${businessId}`);
        return;
      }

      // Multiple businesses - check last selected
      const lastSelected = getLastSelectedBusiness(authData.user.id);
      if (lastSelected && userBusinesses.some((b) => b.id === lastSelected)) {
        router.push(`/dashboard/${lastSelected}`);
        return;
      }

      // Show selection page
      setLoading(false);
    } catch (err) {
      console.error('Error loading businesses:', err);
      setError('Failed to load businesses');
      setLoading(false);
    }
  }

  const handleSelectBusiness = (businessId) => {
    if (user) {
      setLastSelectedBusiness(user.id, businessId);
    }
    router.push(`/dashboard/${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FallingSakura />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Kitsune"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Select a Business
            </h1>
            <p className="text-lg text-slate-600">
              Choose which business you'd like to manage
            </p>
          </div>

          {/* Business Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all cursor-pointer group overflow-hidden text-left"
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
                      <span className="font-medium">
                        {business._count?.services || 0}
                      </span>{' '}
                      services
                    </div>
                    <div>
                      <span className="font-medium">
                        {business._count?.staff || 0}
                      </span>{' '}
                      staff
                    </div>
                  </div>

                  {business._count?.pendingBookings > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-700">
                        <span className="font-semibold">
                          {business._count.pendingBookings}
                        </span>{' '}
                        pending bookings
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Create New Button */}
          <div className="text-center">
            <button
              onClick={() => router.push('/setup/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Business
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
