'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
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
          <h1 className="text-8xl font-bold text-orange-500 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
            Even our kitsune couldn't find it!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
