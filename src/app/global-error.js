'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-100 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Sad Kitsune Image */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64">
                <img
                  src="/sad-kitsune.jpeg"
                  alt="Sad Kitsune"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h1 className="text-8xl font-bold text-red-500 mb-4">500</h1>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Critical Error
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Our kitsune encountered a critical error. Please refresh the page or try again later.
              </p>

              {/* Error Details (Development) */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-800 break-all">
                    {error.message || 'Unknown error'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => reset()}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
