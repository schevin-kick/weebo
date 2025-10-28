/**
 * BookingsView Component
 * Bookings list with filtering, sorting, search, and optimistic updates
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Eye, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useBookings, useBusinessSettings } from '@/hooks/useDashboardData';
import {
  useUpdateBookingStatus,
  useUpdateBookingNotes,
  useMarkNoShow,
} from '@/hooks/useDashboardMutations';
import useBookingsFilterStore from '@/stores/bookingsFilterStore';
import StatusBadge from '@/components/dashboard/StatusBadge';
import BookingDetailsModal from '@/components/dashboard/BookingDetailsModal';
import SkeletonTable from '@/components/loading/SkeletonTable';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';

export default function BookingsView({ businessId }) {
  const toast = useToast();
  const searchParams = useSearchParams();

  // Bookings filter store
  const {
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    setSearchQuery,
    setStatusFilter,
    setSortBy,
    toggleSortOrder,
    setCurrentPage,
  } = useBookingsFilterStore();

  // Initialize from URL params (deep linking)
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlSearch = searchParams.get('search');
    if (urlStatus) setStatusFilter(urlStatus);
    if (urlSearch) setSearchQuery(urlSearch);
  }, []);

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch data using SWR
  const {
    bookings,
    totalCount,
    isLoading,
    mutate: mutateBookings,
  } = useBookings(businessId, {
    search: searchQuery,
    status: statusFilter,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 20,
  });

  const { services, staff, isLoading: settingsLoading } = useBusinessSettings(businessId);

  // Mutation hooks
  const updateStatus = useUpdateBookingStatus();
  const updateNotes = useUpdateBookingNotes();
  const markNoShow = useMarkNoShow();

  // Filter bookings locally (additional client-side filtering if needed)
  const filteredBookings = useMemo(() => {
    let result = [...bookings];
    
    // Filter out past cancelled bookings by default
    if (statusFilter === 'all') {
      const now = new Date();
      result = result.filter(
        (booking) => new Date(booking.dateTime) >= now || booking.status === 'pending'
      );
    }
    
    return result;
  }, [bookings, statusFilter]);

  const totalPages = Math.ceil(totalCount / 20);

  const handleSort = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleRefresh = () => {
    mutateBookings();
  };

  // Booking actions with optimistic updates
  const handleConfirm = async (bookingId) => {
    try {
      await updateStatus(bookingId, 'confirmed', businessId);
      toast.success('Booking confirmed and customer notified!');
      setShowModal(false);
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancel = async (bookingId, reason) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast.success('Booking cancelled and customer notified');
      setShowModal(false);
      mutateBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleUpdateNotes = async (bookingId, notes) => {
    try {
      await updateNotes(bookingId, notes, businessId);
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleMarkNoShow = async (bookingId) => {
    try {
      await markNoShow(bookingId, businessId);
      toast.success('Marked as no-show');
      setShowModal(false);
    } catch (error) {
      console.error('Error marking no-show:', error);
      toast.error('Failed to mark as no-show');
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    try {
      await updateStatus(bookingId, 'completed', businessId);
      toast.success('Marked as completed');
      setShowModal(false);
    } catch (error) {
      console.error('Error marking completed:', error);
      toast.error('Failed to mark as completed');
    }
  };

  // Loading state
  if (isLoading || settingsLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bookings</h1>
          <p className="text-slate-600">Manage all appointments and reservations</p>
        </div>
        <SkeletonTable rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bookings</h1>
          <p className="text-slate-600">
            {totalCount} total bookings • Showing {filteredBookings.length}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Refresh bookings"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('dateTime')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    Date & Time
                    {sortBy === 'dateTime' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customer')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortBy === 'customer' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Staff
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatDateTime(booking.dateTime)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDuration(booking.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {booking.customer?.pictureUrl && (
                          <img
                            src={booking.customer.pictureUrl}
                            alt={booking.customer.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="text-sm text-slate-900">
                          {booking.customer?.displayName || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {booking.service?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {booking.staff?.name || 'Any'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onUpdateNotes={handleUpdateNotes}
          onMarkNoShow={handleMarkNoShow}
          onMarkCompleted={handleMarkCompleted}
        />
      )}
    </div>
  );
}
