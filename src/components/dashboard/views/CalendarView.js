/**
 * CalendarView Component
 * Calendar view with booking management, filters, and optimistic updates
 */

'use client';

import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Filter, Users, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';
import { useCalendarBookings, useBusinessSettings } from '@/hooks/useDashboardData';
import {
  useUpdateBookingStatus,
  useUpdateBookingNotes,
  useMarkNoShow,
} from '@/hooks/useDashboardMutations';
import { fetchWithCSRF } from '@/hooks/useCSRF';
import useCalendarViewStore from '@/stores/calendarViewStore';
import BookingDetailsModal from '@/components/dashboard/BookingDetailsModal';
import SkeletonCalendar from '@/components/loading/SkeletonCalendar';
import { useToast } from '@/contexts/ToastContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView({ businessId }) {
  const toast = useToast();

  // Calendar view store
  const {
    filterByStaff,
    filterByService,
    filterByStatus,
    setFilterByStaff,
    setFilterByService,
    setFilterByStatus,
  } = useCalendarViewStore();

  // Status checkboxes state
  const [selectedStatuses, setSelectedStatuses] = useState({
    pending: true,
    confirmed: true,
    cancelled: false,
    completed: false,
  });

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch data using SWR
  // For simplicity, load all bookings (you can optimize with date range later)
  const { bookings, isLoading: bookingsLoading, mutate: mutateBookings } = useCalendarBookings(
    businessId,
    null, // startDate - could calculate based on calendar view
    null, // endDate
    {
      staffId: filterByStaff,
      serviceId: filterByService,
      status: filterByStatus,
    }
  );

  const { services, staff, isLoading: settingsLoading } = useBusinessSettings(businessId);

  // Mutation hooks
  const updateStatus = useUpdateBookingStatus();
  const updateNotes = useUpdateBookingNotes();
  const markNoShow = useMarkNoShow();

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by staff
      if (filterByStaff !== 'all' && booking.staffId !== filterByStaff) {
        return false;
      }

      // Filter by service
      if (filterByService !== 'all' && booking.serviceId !== filterByService) {
        return false;
      }

      // Filter by status checkboxes
      if (!selectedStatuses[booking.status]) {
        return false;
      }

      return true;
    });
  }, [bookings, filterByStaff, filterByService, selectedStatuses]);

  // Convert bookings to calendar events
  const events = useMemo(() => {
    return filteredBookings.map((booking) => ({
      id: booking.id,
      title: `${booking.customer?.displayName || 'Unknown'} - ${booking.service?.name || 'Service'}`,
      start: new Date(booking.dateTime),
      end: new Date(new Date(booking.dateTime).getTime() + (booking.duration || 60) * 60000),
      resource: booking,
    }));
  }, [filteredBookings]);

  // Event styling
  const eventStyleGetter = (event) => {
    const booking = event.resource;
    let backgroundColor, borderColor;

    switch (booking.status) {
      case 'pending':
        backgroundColor = '#fef3c7';
        borderColor = '#eab308';
        break;
      case 'confirmed':
        backgroundColor = '#d1fae5';
        borderColor = '#22c55e';
        break;
      case 'cancelled':
        backgroundColor = '#fee2e2';
        borderColor = '#ef4444';
        break;
      case 'completed':
        backgroundColor = '#f1f5f9';
        borderColor = '#94a3b8';
        break;
      default:
        backgroundColor = '#e2e8f0';
        borderColor = '#cbd5e1';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        padding: '2px 5px',
        fontSize: '0.875rem',
        color: '#1e293b',
      },
    };
  };

  // Handle event click
  const handleSelectEvent = (event) => {
    const booking = event.resource;
    setSelectedBooking(booking);
    setShowModal(true);
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
      const response = await fetchWithCSRF(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast.success('Booking cancelled and customer notified');
      setShowModal(false);
      mutateBookings(); // Refresh bookings
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

  const handleRefresh = () => {
    mutateBookings();
  };

  // Loading state
  if (bookingsLoading || settingsLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">Manage your appointments and bookings</p>
        </div>
        <SkeletonCalendar />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">Manage your appointments and bookings</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Refresh calendar"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Staff Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Staff
            </label>
            <select
              value={filterByStaff}
              onChange={(e) => setFilterByStaff(e.target.value)}
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

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Service
            </label>
            <select
              value={filterByService}
              onChange={(e) => setFilterByService(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedStatuses).map(([status, checked]) => (
                <label key={status} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setSelectedStatuses((prev) => ({
                        ...prev,
                        [status]: e.target.checked,
                      }))
                    }
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 calendar-container">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          step={30}
          timeslots={2}
          scrollToTime={new Date()}
        />
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

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .rbc-time-slot {
          min-height: 40px;
        }
        .rbc-event {
          padding: 2px 5px;
          border-radius: 4px;
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.8;
        }
        .rbc-toolbar button {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #334155;
          font-weight: 500;
        }
        .rbc-toolbar button:hover {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }
        .rbc-toolbar button.rbc-active {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }
      `}</style>
    </div>
  );
}
