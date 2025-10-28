/**
 * Bookings List Page
 * Table view with filtering, sorting, and search
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatusBadge from '@/components/dashboard/StatusBadge';
import BookingDetailsModal from '@/components/dashboard/BookingDetailsModal';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';

export default function BookingsListPage() {
  const params = useParams();
  const businessId = params.businessId;
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [sortField, setSortField] = useState('dateTime');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      // Load user session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        window.location.href = '/api/auth/login';
        return;
      }
      setUser(sessionData.user);

      // Load businesses
      const bizRes = await fetch('/api/businesses');
      const bizData = await bizRes.json();
      setBusinesses(bizData.businesses || []);

      // Load business details
      const businessRes = await fetch(`/api/businesses/${businessId}`);
      const businessData = await businessRes.json();
      setServices(businessData.services || []);
      setStaff(businessData.staff || []);

      // Load bookings
      await loadBookings();

      setLoading(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      const response = await fetch(`/api/bookings?businessId=${businessId}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    }
  }

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((booking) =>
        booking.customer?.displayName?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((booking) => booking.status === filterStatus);
    }

    // Filter by service
    if (filterService !== 'all') {
      result = result.filter((booking) => booking.serviceId === filterService);
    }

    // Filter by staff
    if (filterStaff !== 'all') {
      result = result.filter((booking) => booking.staffId === filterStaff);
    }

    // Default: show only upcoming bookings (not cancelled)
    if (filterStatus === 'all') {
      const now = new Date();
      result = result.filter(
        (booking) => new Date(booking.dateTime) >= now || booking.status === 'pending'
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'dateTime':
          aVal = new Date(a.dateTime).getTime();
          bVal = new Date(b.dateTime).getTime();
          break;
        case 'customer':
          aVal = a.customer?.displayName || '';
          bVal = b.customer?.displayName || '';
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, searchQuery, filterStatus, filterService, filterStaff, sortField, sortDirection]);

  // Paginate
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBookings, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Booking actions (same as calendar page)
  const handleConfirm = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      toast.success('Booking confirmed and customer notified!');
      setShowModal(false);
      await loadBookings();
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
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleUpdateNotes = async (bookingId, notes) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Failed to update notes');

      toast.success('Notes saved');
      await loadBookings();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleMarkNoShow = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to mark as no-show');

      toast.success('Marked as no-show');
      setShowModal(false);
      await loadBookings();
    } catch (error) {
      console.error('Error marking no-show:', error);
      toast.error('Failed to mark as no-show');
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) throw new Error('Failed to mark as completed');

      toast.success('Marked as completed');
      setShowModal(false);
      await loadBookings();
    } catch (error) {
      console.error('Error marking completed:', error);
      toast.error('Failed to mark as completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} businesses={businesses} currentBusinessId={businessId}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bookings</h1>
          <p className="text-slate-600">Manage all appointments and reservations</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Service Filter */}
            <div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {paginatedBookings.length} of {filteredAndSortedBookings.length} bookings
          </p>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th
                    onClick={() => handleSort('dateTime')}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      Date/Time
                      {sortField === 'dateTime' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('customer')}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {sortField === 'customer' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatDateTime(booking.dateTime)}
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
                          <span className="text-sm text-slate-900">
                            {booking.customer?.displayName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {booking.service?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {booking.staff?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatDuration(booking.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
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
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {paginatedBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              No bookings found
            </div>
          ) : (
            paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleViewBooking(booking)}
                className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {booking.customer?.pictureUrl && (
                      <img
                        src={booking.customer.pictureUrl}
                        alt={booking.customer.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.customer?.displayName || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(booking.dateTime)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  {booking.service && <p>Service: {booking.service.name}</p>}
                  {booking.staff && <p>Staff: {booking.staff.name}</p>}
                  <p>Duration: {formatDuration(booking.duration)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
    </DashboardLayout>
  );
}
