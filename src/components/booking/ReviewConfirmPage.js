'use client';

import { Edit2, Calendar, Clock, User, Package, MapPin, Phone } from 'lucide-react';
import StaffAvatar from '@/components/shared/StaffAvatar';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTimeAvailability';
import { useTranslations } from 'next-intl';

export default function ReviewConfirmPage({
  pages,
  responses,
  selectedService,
  selectedStaff,
  selectedDateTime,
  services,
  staff,
  businessAddress,
  businessPhone,
  onEditPage,
}) {
  const t = useTranslations('booking.review');
  const tStaff = useTranslations('booking.staff');

  // Get service object
  const service = services.find((s) => s.id === selectedService);

  // Get staff object
  const staffMember =
    selectedStaff === 'any'
      ? { id: 'any', name: tStaff('anyStaff'), photo: '' }
      : staff.find((s) => s.id === selectedStaff);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('title')}</h2>

      {/* Service Summary */}
      {service && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Package className="w-4 h-4" />
              <span>{t('service')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-900 text-lg">{service.name}</div>
            {service.description && (
              <p className="text-sm text-slate-600">{service.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              {service.price && (
                <span className="font-semibold text-orange-600">${service.price}</span>
              )}
              {service.duration && (
                <span className="text-slate-500">{t('duration', { duration: service.duration })}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Summary */}
      {staffMember && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="w-4 h-4" />
              <span>{t('staff')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StaffAvatar photo={staffMember.photo} name={staffMember.name} size="lg" />
            <div>
              <div className="font-semibold text-slate-900">{staffMember.name}</div>
              {staffMember.specialty && (
                <p className="text-sm text-slate-600">{staffMember.specialty}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DateTime Summary */}
      {selectedDateTime && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4" />
              <span>{t('dateTime')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-slate-900">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">
                {formatDateForDisplay(selectedDateTime.date)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-900">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">
                {formatTimeForDisplay(selectedDateTime.time)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Location Summary */}
      {(businessAddress || businessPhone) && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4" />
              <span>{t('location')}</span>
            </div>
          </div>

          <div className="space-y-2">
            {businessAddress && (
              <div className="flex items-start gap-3 text-slate-900">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{businessAddress}</span>
              </div>
            )}
            {businessPhone && (
              <div className="flex items-center gap-3 text-slate-900">
                <Phone className="w-5 h-5 text-orange-500" />
                <a
                  href={`tel:${businessPhone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {businessPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Fields Summary */}
      {pages
        .filter((p) => p.type === 'custom' || p.type === 'preset-field')
        .map((page) => {
          // Get responses for this page
          const pageResponses = page.components
            .map((component) => ({
              component,
              value: responses[component.id],
            }))
            .filter((r) => r.value !== undefined && r.value !== null && r.value !== '');

          if (pageResponses.length === 0) return null;

          return (
            <div key={page.id} className="bg-white border-2 border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{page.title}</h3>
                <button
                  onClick={() => onEditPage(page.id)}
                  className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('edit')}
                </button>
              </div>

              <div className="space-y-3">
                {pageResponses.map(({ component, value }) => (
                  <div key={component.id}>
                    <div className="text-sm font-medium text-slate-600 mb-1">
                      {component.label}
                    </div>
                    <div className="text-slate-900">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Important Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="text-sm text-orange-900">
          {t('termsText')}
        </p>
      </div>
    </div>
  );
}
