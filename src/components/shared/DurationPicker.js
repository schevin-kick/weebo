'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const PRESET_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function DurationPicker({ value, onChange }) {
  const t = useTranslations('shared.duration');

  const [customMode, setCustomMode] = useState(
    !PRESET_DURATIONS.includes(value) && value > 0
  );

  const handlePresetClick = (duration) => {
    setCustomMode(false);
    onChange(duration);
  };

  const handleCustomChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    onChange(val);
  };

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PRESET_DURATIONS.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => handlePresetClick(duration)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${
                value === duration && !customMode
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
              }
            `}
          >
            {duration} {t('minSuffix')}
          </button>
        ))}
      </div>

      {/* Custom input toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          {customMode ? t('usePresets') : t('enterCustom')}
        </button>
      </div>

      {/* Custom input */}
      {customMode && (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="5"
            max="480"
            value={value || ''}
            onChange={handleCustomChange}
            placeholder={t('enterMinutes')}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <span className="text-sm text-slate-600">{t('minutes')}</span>
        </div>
      )}
    </div>
  );
}
