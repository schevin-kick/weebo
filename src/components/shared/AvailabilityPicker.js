'use client';

import { Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AvailabilityPicker({
  availability,
  businessHours,
  onChange,
}) {
  const t = useTranslations('modals.staff.availability');
  const tDays = useTranslations('shared.businessHours.days');
  const tCommon = useTranslations('shared.businessHours');

  const DAYS = [
    { key: 'mon', label: tDays('monday') },
    { key: 'tue', label: tDays('tuesday') },
    { key: 'wed', label: tDays('wednesday') },
    { key: 'thu', label: tDays('thursday') },
    { key: 'fri', label: tDays('friday') },
    { key: 'sat', label: tDays('saturday') },
    { key: 'sun', label: tDays('sunday') },
  ];
  const useBusinessHours = availability?.useBusinessHours !== false;

  const handleToggleBusinessHours = (value) => {
    if (value) {
      // Use business hours
      onChange({ useBusinessHours: true });
    } else {
      // Set custom availability based on business hours
      onChange({
        useBusinessHours: false,
        custom: businessHours?.mode === 'custom'
          ? { ...businessHours.custom }
          : {
              mon: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: false },
              tue: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: false },
              wed: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: false },
              thu: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: false },
              fri: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: false },
              sat: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: true },
              sun: { open: businessHours?.sameDaily?.open || '09:00', close: businessHours?.sameDaily?.close || '17:00', closed: true },
            },
      });
    }
  };

  const handleCustomDayChange = (day, hours) => {
    onChange({
      ...availability,
      custom: {
        ...availability.custom,
        [day]: hours,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Toggle between business hours and custom */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          {t('label')}
        </label>

        {/* Use business hours */}
        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
          <input
            type="radio"
            name="availability-mode"
            checked={useBusinessHours}
            onChange={() => handleToggleBusinessHours(true)}
            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-slate-900">{t('businessHours')}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {t('businessHoursDesc')}
            </p>
          </div>
        </label>

        {/* Custom hours */}
        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
          <input
            type="radio"
            name="availability-mode"
            checked={!useBusinessHours}
            onChange={() => handleToggleBusinessHours(false)}
            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-slate-900">{t('custom')}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {t('customDesc')}
            </p>
          </div>
        </label>
      </div>

      {/* Custom hours per day */}
      {!useBusinessHours && availability?.custom && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <p className="text-sm text-slate-600 mb-2">
            Set this staff member's working hours
          </p>
          {DAYS.map((day) => (
            <div key={day.key} className="flex items-center gap-4">
              <div className="w-28">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!availability.custom[day.key].closed}
                    onChange={(e) =>
                      handleCustomDayChange(day.key, {
                        ...availability.custom[day.key],
                        closed: !e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {day.label}
                  </span>
                </label>
              </div>

              {!availability.custom[day.key].closed ? (
                <>
                  <div className="flex-1">
                    <input
                      type="time"
                      value={availability.custom[day.key].open}
                      onChange={(e) =>
                        handleCustomDayChange(day.key, {
                          ...availability.custom[day.key],
                          open: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <span className="text-slate-400">to</span>
                  <div className="flex-1">
                    <input
                      type="time"
                      value={availability.custom[day.key].close}
                      onChange={(e) =>
                        handleCustomDayChange(day.key, {
                          ...availability.custom[day.key],
                          close: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 text-sm text-slate-400 italic">{tCommon('closed')}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
