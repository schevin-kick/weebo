/**
 * AnalyticsView Component
 * Comprehensive analytics dashboard with charts and performance metrics
 */

'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
} from 'lucide-react';
import {
  useAnalyticsOverview,
  useBookingsTrend,
  useRevenueAnalytics,
  useServicePerformance,
  useStaffPerformance,
} from '@/hooks/useDashboardData';
import StatCard from '@/components/dashboard/StatCard';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import BookingsTrendChart from '@/components/dashboard/charts/BookingsTrendChart';
import StatusDistributionChart from '@/components/dashboard/charts/StatusDistributionChart';
import RevenueBarChart from '@/components/dashboard/charts/RevenueBarChart';
import SkeletonCard from '@/components/loading/SkeletonCard';
import Skeleton from '@/components/loading/Skeleton';

export default function AnalyticsView({ businessId }) {
  // Default to last 30 days
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const [groupBy, setGroupBy] = useState('day');

  // Fetch all analytics data
  const { overview, isLoading: overviewLoading } = useAnalyticsOverview(
    businessId,
    dateRange.startDate,
    dateRange.endDate
  );

  const { trendData, isLoading: trendLoading } = useBookingsTrend(
    businessId,
    dateRange.startDate,
    dateRange.endDate,
    groupBy
  );

  const { revenueData, isLoading: revenueLoading } = useRevenueAnalytics(
    businessId,
    dateRange.startDate,
    dateRange.endDate
  );

  const { servicePerformance, isLoading: serviceLoading } = useServicePerformance(
    businessId,
    dateRange.startDate,
    dateRange.endDate
  );

  const { staffPerformance, isLoading: staffLoading } = useStaffPerformance(
    businessId,
    dateRange.startDate,
    dateRange.endDate
  );

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Export to CSV function
  const exportToCSV = () => {
    // Simple CSV export for service performance
    if (!servicePerformance || servicePerformance.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Service',
      'Total Bookings',
      'Completed',
      'Cancelled',
      'Completion Rate %',
      'Revenue',
    ];

    const rows = servicePerformance.map(s => [
      s.serviceName,
      s.totalBookings,
      s.completedBookings,
      s.cancelledBookings,
      s.completionRate,
      s.revenue,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600">
            Track performance and gain insights into your business
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      {/* Overview Metrics */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard count={4} />
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            title="Total Bookings"
            value={overview.totalBookings}
            subtitle={`${overview.conversionRate}% completion rate`}
            color="orange"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={formatCurrency(overview.totalRevenue)}
            subtitle={`Avg: ${formatCurrency(overview.avgBookingValue)}`}
            color="green"
          />
          <StatCard
            icon={Users}
            title="Customers"
            value={overview.uniqueCustomers}
            subtitle="Unique customers"
            color="blue"
          />
          <StatCard
            icon={AlertCircle}
            title="No-Shows"
            value={overview.noShowCount}
            subtitle={`${overview.noShowRate}% rate`}
            color="yellow"
          />
        </div>
      ) : null}

      {/* Charts Row 1: Bookings Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bookings Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-slate-900">Booking Trends</h2>
              </div>
              <div className="flex gap-2">
                {['day', 'week', 'month'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setGroupBy(option)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      groupBy === option
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            {trendLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <BookingsTrendChart data={trendData} groupBy={groupBy} />
            )}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Status Breakdown</h2>
            </div>
          </div>
          <div className="p-6">
            {overviewLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <StatusDistributionChart data={overview?.statusDistribution} />
            )}
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Service */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Revenue by Service</h2>
            </div>
          </div>
          <div className="p-6">
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <RevenueBarChart
                data={revenueData?.revenueByService}
                dataKey="revenue"
                labelKey="serviceName"
                title="Revenue by Service"
              />
            )}
          </div>
        </div>

        {/* Revenue by Staff */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Revenue by Staff</h2>
            </div>
          </div>
          <div className="p-6">
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <RevenueBarChart
                data={revenueData?.revenueByStaff}
                dataKey="revenue"
                labelKey="staffName"
                title="Revenue by Staff"
              />
            )}
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Service Performance</h2>
          </div>
          <div className="overflow-x-auto">
            {serviceLoading ? (
              <div className="p-6">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : servicePerformance && servicePerformance.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Service
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {servicePerformance.map((service) => (
                    <tr key={service.serviceId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {service.serviceName}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600">
                        {service.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            service.completionRate >= 80
                              ? 'bg-green-100 text-green-700'
                              : service.completionRate >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {service.completionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                        {formatCurrency(service.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-slate-500">
                No service data available
              </div>
            )}
          </div>
        </div>

        {/* Staff Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Staff Performance</h2>
          </div>
          <div className="overflow-x-auto">
            {staffLoading ? (
              <div className="p-6">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : staffPerformance && staffPerformance.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      No-Show
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {staffPerformance.map((staff) => (
                    <tr key={staff.staffId} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {staff.photoUrl ? (
                            <img
                              src={staff.photoUrl}
                              alt={staff.staffName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-900">
                            {staff.staffName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600">
                        {staff.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            staff.noShowRate <= 5
                              ? 'bg-green-100 text-green-700'
                              : staff.noShowRate <= 15
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {staff.noShowRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                        {formatCurrency(staff.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-slate-500">
                No staff data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
