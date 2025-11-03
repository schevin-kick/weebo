'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Sad Kitsune Image */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-64 h-80 rounded-3xl overflow-hidden">
            <Image
              src="/sad-kitsune.jpeg"
              alt="Sad Kitsune"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-8xl font-bold text-red-500 mb-4">500</h1>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Our kitsune encountered an unexpected error. Don't worry, we're on it!
            Try refreshing the page or come back later.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error && (
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

        {/* Additional Help */}
        <p className="mt-8 text-sm text-slate-600">
          If the problem persists,{' '}
          <a
            href="https://github.com/anthropics/claude-code/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 font-medium underline"
          >
            report this issue
          </a>
        </p>
      </div>
    </div>
  );
}
