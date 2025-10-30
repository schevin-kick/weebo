'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, X, UserPlus, Bell } from 'lucide-react';

export default function BookingSuccess({ bookingSummary }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null); // null | 'friend' | 'not_friend'
  const [checkingFriendship, setCheckingFriendship] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkFriendship();
  }, []);

  async function checkFriendship() {
    try {
      if (typeof window !== 'undefined' && window.liff) {
        const liff = window.liff;

        // Check if LIFF is initialized
        if (!liff.isLoggedIn()) {
          setCheckingFriendship(false);
          return;
        }

        // Get friendship status
        const friendship = await liff.getFriendship();
        setFriendshipStatus(friendship.friendFlag ? 'friend' : 'not_friend');
      }
    } catch (error) {
      console.error('Failed to check friendship:', error);
      // Fail silently - don't block the success page
    } finally {
      setCheckingFriendship(false);
    }
  }

  function handleAddFriend() {
    if (typeof window !== 'undefined' && window.liff) {
      const liff = window.liff;
      // Open bot profile in LINE app
      // Note: Replace YOUR_BOT_ID with your actual Messaging API channel's Basic ID
      liff.openWindow({
        url: 'https://line.me/R/ti/p/@YOUR_BOT_ID', // TODO: Replace with actual bot ID from LINE console
        external: false,
      });
    }
  }

  function handleClose() {
    if (typeof window !== 'undefined' && window.liff) {
      const liff = window.liff;
      // Close the LIFF window
      liff.closeWindow();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles
                className="text-orange-400"
                size={16 + Math.random() * 16}
                style={{ opacity: 0.6 + Math.random() * 0.4 }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-2 -right-2 animate-pulse">
                <span className="text-4xl">🎉</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-slate-600 text-lg">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Kitsune Character */}
          <div className="flex justify-center mb-6">
            <div className="w-40 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/kitsune-animated.webm" type="video/webm" />
                <source src="/kitsune-animated.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 mb-6">
            <p className="text-center text-slate-700 leading-relaxed">
              Thank you for booking with us! We're excited to see you. You will receive a
              confirmation message shortly.
            </p>
          </div>

          {/* Session ID (for reference) */}
          {bookingSummary?.sessionId && (
            <div className="text-center mb-6">
              <p className="text-xs text-slate-500">
                Reference ID: {bookingSummary.sessionId.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Add Friend Prompt - Only show if not already a friend */}
          {!checkingFriendship && friendshipStatus === 'not_friend' && (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Get Booking Reminders</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Add us as a friend to receive booking confirmations and reminders!
                    </p>
                    <button
                      onClick={handleAddFriend}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/30"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thank You Message - Show if already a friend */}
          {!checkingFriendship && friendshipStatus === 'friend' && (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Thanks for following us! You'll receive booking updates via LINE.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
            >
              Close
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Powered by <span className="font-semibold text-orange-600">Kitsune Booking</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float linear forwards;
        }
      `}</style>
    </div>
  );
}
