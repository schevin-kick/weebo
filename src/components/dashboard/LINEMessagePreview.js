/**
 * LINEMessagePreview Component
 * Live preview of LINE Flex Message with mobile phone mockup
 */

'use client';

import { useTranslations } from 'next-intl';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';

export default function LINEMessagePreview({
  type = 'confirmation',
  header = 'Your booking is confirmed!',
  body = 'We look forward to seeing you!',
  business = null,
}) {
  const t = useTranslations('dashboard.messaging.preview');
  // Sample booking data for preview
  const sampleBooking = {
    service: { name: 'Haircut & Style' },
    staff: { name: 'Sarah Johnson' },
    dateTime: new Date(Date.now() + 86400000), // Tomorrow
    duration: 60,
  };

  // Determine color based on message type
  const getHeaderColor = () => {
    switch (type) {
      case 'confirmation':
        return '#22c55e'; // Green
      case 'cancellation':
        return '#ef4444'; // Red
      case 'reminder':
        return '#f97316'; // Orange
      default:
        return '#22c55e';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-xl">
      {/* Mobile Phone Mockup */}
      <div className="mx-auto max-w-sm">
        {/* Phone Frame */}
        <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
          {/* Phone Notch */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden">
            <div className="h-6 bg-white flex items-center justify-center">
              <div className="w-24 h-5 bg-black rounded-b-3xl"></div>
            </div>

            {/* Phone Screen */}
            <div className="bg-gradient-to-b from-green-50 to-white min-h-[600px] p-4">
              {/* LINE Chat Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {business?.businessName?.[0] || 'B'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {business?.businessName || t('businessName')}
                  </div>
                  <div className="text-xs text-slate-500">{t('lineOfficialAccount')}</div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="mb-4">
                {/* Flex Message Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[280px]">
                  {/* Hero Image (if business has logo) */}
                  {business?.logoUrl && (
                    <div
                      className="w-full h-32 flex items-center justify-center"
                      style={{ backgroundColor: business?.heroBackgroundColor || '#FFFFFF' }}
                    >
                      <img
                        src={business.logoUrl}
                        alt="Business Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4">
                    {/* Header */}
                    <div
                      className="text-lg font-bold mb-2"
                      style={{ color: getHeaderColor() }}
                    >
                      {header}
                    </div>

                    {/* Body Text */}
                    {body && (
                      <div className="text-sm text-slate-600 mb-3">
                        {body}
                      </div>
                    )}

                    {/* Business Name with Star */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm text-slate-400">
                        {business?.businessName || t('businessName')}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 mb-4 border-t border-slate-100 pt-4">
                      <div className="flex items-start text-xs">
                        <span className="text-slate-400 w-20 flex-shrink-0">{t('service')}</span>
                        <span className="text-slate-600 font-medium flex-1">
                          {sampleBooking.service.name}
                        </span>
                      </div>
                      <div className="flex items-start text-xs">
                        <span className="text-slate-400 w-20 flex-shrink-0">{t('staff')}</span>
                        <span className="text-slate-600 flex-1">
                          {sampleBooking.staff.name}
                        </span>
                      </div>
                      <div className="flex items-start text-xs">
                        <span className="text-slate-400 w-20 flex-shrink-0">{t('dateTime')}</span>
                        <span className="text-slate-600 flex-1">
                          {formatDateTime(sampleBooking.dateTime)}
                        </span>
                      </div>
                      <div className="flex items-start text-xs">
                        <span className="text-slate-400 w-20 flex-shrink-0">{t('duration')}</span>
                        <span className="text-slate-600 flex-1">
                          {formatDuration(sampleBooking.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(business?.phone || business?.address) && (
                      <div className="border-t border-slate-100 pt-3">
                        <div className="space-y-1">
                          {business.phone && (
                            <div className="text-xs text-slate-400">
                              📞 {business.phone}
                            </div>
                          )}
                          {business.address && (
                            <div className="text-xs text-slate-400">
                              📍 {business.address}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Button */}
                  <div className="p-4 pt-0">
                    <button
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium py-2 rounded-lg"
                      disabled
                    >
                      {t('viewMyBookings')}
                    </button>
                  </div>
                </div>

                {/* Message Timestamp */}
                <div className="text-xs text-slate-400 mt-1 ml-2">
                  {t('justNow')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Label */}
        <div className="text-center mt-4 text-sm text-slate-500">
          {t('title')}
        </div>
      </div>
    </div>
  );
}
