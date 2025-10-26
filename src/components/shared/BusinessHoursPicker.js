'use client';

import { Clock, Sun, Moon } from 'lucide-react';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function BusinessHoursPicker({
  mode,
  sameDaily,
  custom,
  onModeChange,
  onSameDailyChange,
  onCustomDayChange,
}) {
  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Business Hours
        </label>

        {/* 24/7 Option */}
        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
          <input
            type="radio"
            name="hours-mode"
            value="24/7"
            checked={mode === '24/7'}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-slate-900">24/7</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Available anytime - customers pick time, you confirm
            </p>
          </div>
        </label>

        {/* Same hours every day */}
        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
          <input
            type="radio"
            name="hours-mode"
            value="same-daily"
            checked={mode === 'same-daily'}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-slate-900">Same hours every day</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Set one time range for all days
            </p>
          </div>
        </label>

        {/* Custom hours per day */}
        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
          <input
            type="radio"
            name="hours-mode"
            value="custom"
            checked={mode === 'custom'}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-slate-900">Custom hours per day</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Different hours for each day of the week
            </p>
          </div>
        </label>
      </div>

      {/* Same daily time picker */}
      {mode === 'same-daily' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opening Time
              </label>
              <input
                type="time"
                value={sameDaily.open}
                onChange={(e) => onSameDailyChange(e.target.value, sameDaily.close)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Closing Time
              </label>
              <input
                type="time"
                value={sameDaily.close}
                onChange={(e) => onSameDailyChange(sameDaily.open, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom hours per day */}
      {mode === 'custom' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {DAYS.map((day) => (
            <div key={day.key} className="flex items-center gap-4">
              <div className="w-28">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!custom[day.key].closed}
                    onChange={(e) =>
                      onCustomDayChange(day.key, {
                        ...custom[day.key],
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

              {!custom[day.key].closed ? (
                <>
                  <div className="flex-1">
                    <input
                      type="time"
                      value={custom[day.key].open}
                      onChange={(e) =>
                        onCustomDayChange(day.key, {
                          ...custom[day.key],
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
                      value={custom[day.key].close}
                      onChange={(e) =>
                        onCustomDayChange(day.key, {
                          ...custom[day.key],
                          close: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 text-sm text-slate-400 italic">Closed</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
