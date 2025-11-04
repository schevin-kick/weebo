'use client';

import FallingSakura from '@/components/background/FallingSakura';
import { useTranslations } from 'next-intl';

export default function BookingLayout({ businessName, logoUrl, children, stepper, navigation, isPreview = false }) {
  const t = useTranslations('booking.layout');
  return (
    <>
      {!isPreview && <FallingSakura />}

      <div className={`${isPreview ? 'h-full' : 'min-h-screen'} bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 ${!isPreview ? 'pattern-sakura-paws' : ''} ${navigation ? 'pb-24' : ''}`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 z-40 shadow-sm sticky top-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              {logoUrl && (
                <div className="flex items-center justify-center overflow-hidden" style={{ height: '40px', width: 'auto' }}>
                  <img
                    src={logoUrl}
                    alt={businessName || 'Business Logo'}
                    className="h-full w-auto object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {businessName || 'Kitsune'}
                </h1>
                <p className="text-xs text-slate-600">{t('title')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stepper */}
        {stepper && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 w-full">
            {stepper}
          </div>
        )}

        {/* Main Content Area - Natural Scrolling */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 w-full py-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {children}
          </div>
        </main>

        {/* Fixed Navigation - Always at Bottom */}
        {navigation && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-40">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-safe">
              {navigation}
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
