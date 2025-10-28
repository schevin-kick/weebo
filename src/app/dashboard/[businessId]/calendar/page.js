/**
 * Calendar Page
 * Week view calendar with booking management
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Filter, Users, Briefcase, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BookingDetailsModal from '@/components/dashboard/BookingDetailsModal';
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

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId;
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatuses, setSelectedStatuses] = useState({
    pending: true,
    confirmed: true,
    cancelled: false,
    completed: false,
  });

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

      // Load business details (services, staff)
      const businessRes = await fetch(`/api/businesses/${businessId}`);
      const businessData = await businessRes.json();
      setServices(businessData.services || []);
      setStaff(businessData.staff || []);

      // Load bookings
      await loadBookings();

      setLoading(false);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar');
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

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by staff
      if (selectedStaff !== 'all' && booking.staffId !== selectedStaff) {
        return false;
      }

      // Filter by service
      if (selectedService !== 'all' && booking.serviceId !== selectedService) {
        return false;
      }

      // Filter by status
      if (!selectedStatuses[booking.status]) {
        return false;
      }

      return true;
    });
  }, [bookings, selectedStaff, selectedService, selectedStatuses]);

  // Convert bookings to calendar events
  const events = useMemo(() => {
    return filteredBookings.map((booking) => ({
      id: booking.id,
      title: `${booking.customer?.displayName || 'Unknown'} - ${booking.service?.name || 'Service'}`,
      start: new Date(booking.dateTime),
      end: new Date(new Date(booking.dateTime).getTime() + booking.duration * 60000),
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

  // Booking actions
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
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} businesses={businesses} currentBusinessId={businessId}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">Manage your appointments and bookings</p>
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
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
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
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
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
            views={['week', 'day', 'agenda']}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            step={30}
            timeslots={2}
          />
        </div>
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
    </DashboardLayout>
  );
}
