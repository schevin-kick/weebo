'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PresetServicePage({ page, services, selectedServiceId, onSelect }) {
  const t = useTranslations('booking.service');
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('noServices')}</h3>
        <p className="text-slate-600">
          {t('noServicesMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{page.title}</h2>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Selection indicator */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Service details */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-lg mb-1">
                    {service.name}
                  </div>

                  {service.description && (
                    <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    {service.price && (
                      <span className="font-semibold text-orange-600">
                        ${service.price}
                      </span>
                    )}
                    {service.duration && (
                      <span className="text-slate-500">{service.duration} {t('durationUnit')}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
