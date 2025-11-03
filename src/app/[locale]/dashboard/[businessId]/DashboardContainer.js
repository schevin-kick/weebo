/**
 * DashboardContainer Component
 * Main SPA container that manages authentication, business data,
 * and renders the appropriate view based on the current route
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useBusinesses } from '@/hooks/useDashboardData';
import useDashboardStore from '@/stores/dashboardStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Skeleton from '@/components/loading/Skeleton';

// Import view components
import HomeView from '@/components/dashboard/views/HomeView';
import AnalyticsView from '@/components/dashboard/views/AnalyticsView';
import CalendarView from '@/components/dashboard/views/CalendarView';
import BookingsView from '@/components/dashboard/views/BookingsView';
import QRCodeView from '@/components/dashboard/views/QRCodeView';
import SettingsView from '@/components/dashboard/views/SettingsView';
import MessagingView from '@/components/dashboard/views/MessagingView';
import NotificationsView from '@/components/dashboard/views/NotificationsView';
import HolidayHoursView from '@/components/dashboard/views/HolidayHoursView';

export default function DashboardContainer({ businessId, view = 'home' }) {
  const router = useRouter();
  const pathname = usePathname();

  // Fetch auth and business data using SWR
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { businesses, isLoading: businessesLoading } = useBusinesses();

  // Update dashboard store
  const setCurrentView = useDashboardStore((state) => state.setCurrentView);
  const setSelectedBusinessId = useDashboardStore((state) => state.setSelectedBusinessId);

  useEffect(() => {
    setCurrentView(view);
    setSelectedBusinessId(businessId);
  }, [view, businessId, setCurrentView, setSelectedBusinessId]);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/api/auth/login';
    }
  }, [authLoading, isAuthenticated]);

  // Loading state - show layout skeleton
  if (authLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" width="40px" height="40px" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" rounded="lg" />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header skeleton */}
          <header className="bg-white border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" rounded="lg" />
              <div className="flex gap-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <Skeleton variant="circular" width="40px" height="40px" />
              </div>
            </div>
          </header>

          {/* Content skeleton */}
          <main className="flex-1 p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                  <Skeleton variant="circular" width="48px" height="48px" className="mb-4" />
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Render view based on route
  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeView businessId={businessId} />;
      case 'analytics':
        return <AnalyticsView businessId={businessId} />;
      case 'calendar':
        return <CalendarView businessId={businessId} />;
      case 'bookings':
        return <BookingsView businessId={businessId} />;
      case 'qr-code':
        return <QRCodeView businessId={businessId} />;
      case 'settings':
        return <SettingsView businessId={businessId} />;
      case 'messaging':
        return <MessagingView businessId={businessId} />;
      case 'notifications':
        return <NotificationsView businessId={businessId} />;
      case 'holiday-hours':
        return <HolidayHoursView businessId={businessId} />;
      default:
        return <HomeView businessId={businessId} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      businesses={businesses}
      currentBusinessId={businessId}
    >
      {renderView()}
    </DashboardLayout>
  );
}
