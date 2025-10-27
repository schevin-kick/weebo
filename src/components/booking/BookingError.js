'use client';

import { AlertCircle } from 'lucide-react';

export default function BookingError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-slate-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Sad Kitsune */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6">
              <span className="text-6xl">😔</span>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              No Configuration Found
            </h1>
            <p className="text-slate-600 leading-relaxed">
              It looks like the booking system hasn't been set up yet. Please contact the business
              owner to configure the booking workflow.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 text-center">
              If you're the owner, please complete the setup wizard to enable bookings for your
              customers.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Powered by <span className="font-semibold text-orange-600">Kitsune Booking</span>
          </p>
        </div>
      </div>
    </div>
  );
}
