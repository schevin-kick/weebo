'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookingSuccess({ bookingSummary }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6">
              <span className="text-6xl">🦊</span>
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/setup"
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
            >
              Go to Setup
              <ArrowRight className="w-5 h-5" />
            </Link>
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
