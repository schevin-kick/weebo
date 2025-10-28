'use client';

import FallingSakura from '@/components/background/FallingSakura';

export default function BookingLayout({ businessName, children, stepper, navigation, isPreview = false }) {
  return (
    <>
      {!isPreview && <FallingSakura />}

      <div className={`${isPreview ? 'h-full' : 'h-screen'} flex flex-col bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 ${!isPreview ? 'pattern-sakura-paws' : ''} overflow-hidden`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 z-40 shadow-sm flex-shrink-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🦊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {businessName || 'Kitsune Booking'}
                </h1>
                <p className="text-xs text-slate-600">Book Your Appointment</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stepper */}
        {stepper && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex-shrink-0 w-full">
            {stepper}
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto max-w-2xl mx-auto px-4 sm:px-6 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-4">
            {children}
          </div>
        </main>

        {/* Fixed Navigation - Always at Bottom */}
        {navigation && (
          <nav className="bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] flex-shrink-0">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-safe">
              {navigation}
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
