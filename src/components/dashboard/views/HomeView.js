/**
 * HomeView Component
 * Dashboard home page with metrics, today's schedule, and top customers
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  QrCode as QrCodeIcon,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  useDashboardMetrics,
  useTodaySchedule,
  useTopCustomers,
} from '@/hooks/useDashboardData';
import { useRefreshDashboard } from '@/hooks/useDashboardMutations';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import SkeletonCard from '@/components/loading/SkeletonCard';
import Skeleton from '@/components/loading/Skeleton';
import { formatTime } from '@/lib/dateUtils';

export default function HomeView({ businessId }) {
  const router = useRouter();

  // Fetch data using SWR hooks
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics(businessId);
  const { todaySchedule, isLoading: scheduleLoading } = useTodaySchedule(businessId);
  const { topCustomers, isLoading: customersLoading } = useTopCustomers(businessId);

  // Refresh function
  const refreshDashboard = useRefreshDashboard(businessId);

  const handleRefresh = async () => {
    await refreshDashboard();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics Grid */}
      {metricsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard count={4} />
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={CheckCircle}
            title="Total Bookings"
            value={metrics.totalBookings}
            subtitle="All time"
            color="orange"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending"
            value={metrics.pendingBookings}
            subtitle="Need approval"
            color="yellow"
          />
          <StatCard
            icon={Clock}
            title="Today"
            value={metrics.todayBookings}
            subtitle="Scheduled appointments"
            color="green"
          />
          <StatCard
            icon={Calendar}
            title="This Week"
            value={metrics.weekBookings}
            subtitle="Total appointments"
            color="blue"
          />
        </div>
      ) : null}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Schedule - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
                <Link
                  href={`/dashboard/${businessId}/calendar`}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  View Calendar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {scheduleLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton variant="circular" width="48px" height="48px" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : todaySchedule.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/${businessId}/bookings`}
                      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">
                            {formatTime(booking.dateTime)}
                          </p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {booking.customer?.displayName || 'Unknown Customer'}
                          {booking.service && ` • ${booking.service.name}`}
                          {booking.staff && ` • ${booking.staff.name}`}
                        </p>
                      </div>

                      {booking.customer?.pictureUrl && (
                        <img
                          src={booking.customer.pictureUrl}
                          alt={booking.customer.displayName}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Customers - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Top Customers
              </h2>
            </div>

            <div className="p-6">
              {customersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((item, index) => (
                    <div
                      key={item.customer?.id || index}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-sm font-bold text-slate-400">
                          {index + 1}
                        </span>
                      </div>

                      {item.customer?.pictureUrl ? (
                        <img
                          src={item.customer.pictureUrl}
                          alt={item.customer.displayName}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.customer?.displayName || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.bookingCount} booking{item.bookingCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/dashboard/${businessId}/qr-code`}
          className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:shadow-lg transition-all p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <QrCodeIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                QR Code
              </h3>
              <p className="text-sm text-slate-500">Generate & share</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/dashboard/${businessId}/calendar`}
          className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:shadow-lg transition-all p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                Calendar
              </h3>
              <p className="text-sm text-slate-500">View all appointments</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/dashboard/${businessId}/bookings`}
          className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:shadow-lg transition-all p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                All Bookings
              </h3>
              <p className="text-sm text-slate-500">Manage bookings</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
