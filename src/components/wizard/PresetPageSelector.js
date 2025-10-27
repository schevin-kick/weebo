'use client';

import { useEffect } from 'react';
import { List, Users, Calendar } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';

const PRESET_PAGES = [
  {
    type: 'services',
    name: 'Services Page',
    description: 'Display your services for customers to choose from',
    icon: List,
    color: 'bg-orange-500',
  },
  {
    type: 'staff',
    name: 'Staff Selection',
    description: 'Let customers choose their preferred staff member',
    icon: Users,
    color: 'bg-pink-500',
  },
  {
    type: 'dateTime',
    name: 'Date & Time Picker',
    description: 'Date and time selection for appointments',
    icon: Calendar,
    color: 'bg-indigo-500',
  },
];

export default function PresetPageSelector() {
  const presetPagesConfig = useSetupWizardStore((state) => state.presetPagesConfig);
  const togglePresetPage = useSetupWizardStore((state) => state.togglePresetPage);
  const ensureDateTimePage = useSetupWizardStore((state) => state.ensureDateTimePage);

  // Ensure DateTime page is present on mount
  useEffect(() => {
    ensureDateTimePage();
  }, [ensureDateTimePage]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">Add Preset Pages</h3>
        <p className="text-sm text-slate-600">
          These special pages handle common booking flows
        </p>
      </div>

      {/* Preset page cards */}
      <div className="space-y-3">
        {PRESET_PAGES.map((preset) => {
          const Icon = preset.icon;
          const isEnabled = presetPagesConfig[preset.type];
          const isRequired = preset.type === 'dateTime';
          const isDisabled = isRequired;

          return (
            <button
              key={preset.type}
              onClick={() => !isDisabled && togglePresetPage(preset.type)}
              disabled={isDisabled}
              className={`
                w-full group relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isEnabled
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md'
                }
                ${isDisabled ? 'cursor-not-allowed opacity-90' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-lg ${preset.color} flex items-center justify-center
                    ${isEnabled ? 'scale-110' : 'group-hover:scale-110'} transition-transform
                  `}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {preset.name}
                    </div>
                    {isRequired && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {preset.description}
                  </p>
                </div>

                {/* Toggle indicator */}
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${
                        isEnabled
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-slate-300 bg-white'
                      }
                    `}
                  >
                    {isEnabled && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <p className="font-medium mb-1">About Preset Pages</p>
        <p className="text-blue-700 text-xs">
          Date & Time is required for all bookings and will always appear last. Other preset
          pages can be positioned anywhere in your flow by reordering them in the page list.
        </p>
      </div>
    </div>
  );
}
