/**
 * DateRangePicker Component
 * Allows users to select predefined or custom date ranges for analytics
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const t = useTranslations('dashboard.analytics.dateRange');
  const [isCustom, setIsCustom] = useState(false);

  const PRESET_RANGES = [
    { label: t('last7Days'), value: 7 },
    { label: t('last30Days'), value: 30 },
    { label: t('last3Months'), value: 90 },
    { label: t('last6Months'), value: 180 },
    { label: t('lastYear'), value: 365 },
  ];

  const handlePresetChange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setIsCustom(false);
    onChange({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleCustomDateChange = (field, value) => {
    onChange({
      startDate: field === 'start' ? new Date(value).toISOString() : startDate,
      endDate: field === 'end' ? new Date(value).toISOString() : endDate,
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getSelectedPreset = () => {
    if (isCustom || !startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

    const preset = PRESET_RANGES.find(r => Math.abs(r.value - diffDays) <= 1);
    return preset?.value || null;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">{t('title')}</h3>
      </div>

      {/* Preset Ranges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {PRESET_RANGES.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value)}
            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
              !isCustom && getSelectedPreset() === preset.value
                ? 'bg-orange-50 border-orange-500 text-orange-700 font-medium'
                : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Toggle */}
      <button
        onClick={() => setIsCustom(!isCustom)}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-all mb-3 ${
          isCustom
            ? 'bg-orange-50 border-orange-500 text-orange-700 font-medium'
            : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
        }`}
      >
        {t('customRange')}
      </button>

      {/* Custom Date Inputs */}
      {isCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('startDate')}
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('endDate')}
            </label>
            <input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
