'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, X, CheckCircle, AlertCircle, Phone } from 'lucide-react';

export default function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [liffProfile, setLiffProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [standaloneEmail, setStandaloneEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    initializeLIFF();
  }, []);

  useEffect(() => {
    if (liffProfile) {
      loadBookings();
    }
  }, [liffProfile]);

  // Helper function to check if user is in LINE app
  function isLineApp() {
    if (typeof window === 'undefined') return false;
    return /line\//i.test(window.navigator.userAgent);
  }

  async function initializeLIFF() {
    try {
      // 1. Check if this is the LINE app
      const inLineApp = isLineApp();

      if (!inLineApp) {
        // Not in LINE - use standalone mode
        console.log('Not in LINE app - showing email lookup form');
        setIsStandaloneMode(true);
        setLoading(false);
        return;
      }

      // 2. In LINE app - check if LIFF SDK loaded
      if (!window.liff) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!window.liff || !process.env.NEXT_PUBLIC_LIFF_ID) {
        console.warn('LIFF SDK not available - using standalone mode');
        setIsStandaloneMode(true);
        setLoading(false);
        return;
      }

      // 3. LIFF SDK exists - initialize
      const liff = window.liff;
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

      if (!liff.isLoggedIn()) {
        // User not logged in - use standalone mode
        console.log('LIFF not logged in - showing email lookup form');
        setIsStandaloneMode(true);
        setLoading(false);
        return;
      }

      // Get user profile
      const profile = await liff.getProfile();
      setLiffProfile({
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      });
      setIsStandaloneMode(false);
    } catch (err) {
      console.error('LIFF error:', err);
      // Fallback to standalone mode
      setIsStandaloneMode(true);
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      setLoading(true);

      const response = await fetch(`/api/bookings?customerLineUserId=${liffProfile.userId}`);
      if (!response.ok) throw new Error('Failed to load bookings');

      const data = await response.json();

      // Only show future bookings that are not cancelled
      const now = new Date();
      const upcoming = data.bookings.filter(b =>
        new Date(b.dateTime) >= now &&
        b.status !== 'cancelled'
      );

      setBookings({ upcoming });
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLookup(e) {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!standaloneEmail || !emailRegex.test(standaloneEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/bookings?customerEmail=${encodeURIComponent(standaloneEmail)}`);
      if (!response.ok) throw new Error('Failed to load bookings');

      const data = await response.json();

      // Only show future bookings that are not cancelled
      const now = new Date();
      const upcoming = data.bookings.filter(b =>
        new Date(b.dateTime) >= now &&
        b.status !== 'cancelled'
      );

      setBookings({ upcoming });

      if (upcoming.length === 0) {
        setEmailError('No bookings found for this email address');
      }
    } catch (err) {
      console.error('Load bookings error:', err);
      setEmailError('Failed to load bookings. Please try again.');
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

  // Show email lookup form for standalone mode
  if (isStandaloneMode && !bookings.upcoming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Find My Bookings</h1>
            <p className="text-slate-600">Enter your email to view your bookings</p>
          </div>

          <form onSubmit={handleEmailLookup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={standaloneEmail}
                onChange={(e) => setStandaloneEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Find Bookings'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Only bookings made with this email will be shown</p>
          </div>
        </div>
      </div>
    );
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
            {/* Kitsune Platform Logo */}
            <img
              src="/logo.png"
              alt="Weebo"
              className="w-10 h-10 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Bookings</h1>
              <p className="text-sm text-slate-600">{liffProfile?.displayName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!bookings.upcoming || bookings.upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Upcoming Bookings</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You don't have any scheduled appointments at the moment. Book a service to get started!
            </p>
            <button
              onClick={() => window.liff?.closeWindow()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              Close
            </button>
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Bookings</h2>
            <div className="space-y-3">
              {bookings.upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  showCancel={true}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function BookingCard({ booking, onCancel, showCancel }) {
  const date = new Date(booking.dateTime);
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    confirmed: <CheckCircle className="w-4 h-4" />,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {booking.business.logoUrl ? (
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 flex-shrink-0">
              <img
                src={booking.business.logoUrl}
                alt={booking.business.businessName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
              <img
                src="/logo.png"
                alt={booking.business.businessName}
                className="w-8 h-8 object-contain opacity-60"
              />
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

        {booking.business.address && (
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{booking.business.address}</span>
          </div>
        )}

        {booking.business.phone && (
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-4 h-4 text-slate-400" />
            <a
              href={`tel:${booking.business.phone}`}
              className="text-orange-600 hover:text-orange-700 hover:underline"
            >
              {booking.business.phone}
            </a>
          </div>
        )}
      </div>

      {showCancel && (
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
