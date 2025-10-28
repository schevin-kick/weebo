'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [liffProfile, setLiffProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeLIFF();
  }, []);

  useEffect(() => {
    if (liffProfile) {
      loadBookings();
    }
  }, [liffProfile]);

  async function initializeLIFF() {
    try {
      if (typeof window !== 'undefined' && window.liff) {
        const liff = window.liff;

        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setLiffProfile({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });
      } else {
        // Test mode
        setLiffProfile({
          userId: 'test_user_123',
          displayName: 'Test User',
          pictureUrl: null,
        });
      }
    } catch (err) {
      console.error('LIFF error:', err);
      setError('Failed to initialize LINE app');
    }
  }

  async function loadBookings() {
    try {
      setLoading(true);

      const response = await fetch(`/api/bookings?customerLineUserId=${liffProfile.userId}`);
      if (!response.ok) throw new Error('Failed to load bookings');

      const data = await response.json();

      // Filter upcoming and past bookings
      const now = new Date();
      const upcoming = data.bookings.filter(b => new Date(b.dateTime) >= now);
      const past = data.bookings.filter(b => new Date(b.dateTime) < now);

      setBookings({ upcoming, past });
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          customerLineUserId: liffProfile.userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel');
      }

      // Reload bookings
      await loadBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Cancel error:', err);
      alert(`Failed to cancel booking: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🦊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Bookings</h1>
              <p className="text-sm text-slate-600">{liffProfile?.displayName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Upcoming Bookings */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Bookings</h2>

          {!bookings.upcoming || bookings.upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  showCancel={booking.status !== 'cancelled'}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past Bookings */}
        {bookings.past && bookings.past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Past Bookings</h2>
            <div className="space-y-3">
              {bookings.past.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isPast
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function BookingCard({ booking, onCancel, showCancel, isPast }) {
  const date = new Date(booking.dateTime);
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    confirmed: <CheckCircle className="w-4 h-4" />,
    cancelled: <X className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {booking.business.logoUrl ? (
            <img
              src={booking.business.logoUrl}
              alt={booking.business.businessName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white text-xl">
              🦊
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-900">{booking.business.businessName}</h3>
            <p className="text-sm text-slate-600">
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[booking.status]}`}>
          {statusIcons[booking.status]}
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>
            {date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })} ({booking.duration} minutes)
          </span>
        </div>

        {booking.service && (
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{booking.service.name}</span>
          </div>
        )}

        {booking.staff && (
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-slate-400" />
            <span>{booking.staff.name}</span>
          </div>
        )}
      </div>

      {showCancel && !isPast && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => onCancel(booking.id)}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
}
