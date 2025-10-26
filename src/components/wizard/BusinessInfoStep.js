'use client';

import { Store, Info } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import BusinessHoursPicker from '@/components/shared/BusinessHoursPicker';

export default function BusinessInfoStep() {
  const businessName = useSetupWizardStore((state) => state.businessName);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const appointmentOnly = useSetupWizardStore((state) => state.appointmentOnly);
  const isStep1Valid = useSetupWizardStore((state) => state.isStep1Valid);

  const setBusinessName = useSetupWizardStore((state) => state.setBusinessName);
  const setBusinessHoursMode = useSetupWizardStore(
    (state) => state.setBusinessHoursMode
  );
  const setSameDailyHours = useSetupWizardStore((state) => state.setSameDailyHours);
  const setCustomDayHours = useSetupWizardStore((state) => state.setCustomDayHours);
  const setAppointmentOnly = useSetupWizardStore((state) => state.setAppointmentOnly);

  // Debug validation
  console.log('Step 1 Validation:', {
    businessName,
    businessNameLength: businessName?.length,
    businessHours,
    isValid: isStep1Valid(),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Business Information</h2>
              <p className="text-orange-50 text-sm mt-1">
                Tell us about your business
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Business Name */}
          <div>
            <label
              htmlFor="business-name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Business Name <span className="text-orange-500">*</span>
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Sakura Hair Salon"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
            />
            {businessName && businessName.length < 3 && (
              <p className="text-sm text-orange-600 mt-2">
                Business name must be at least 3 characters
              </p>
            )}
          </div>

          {/* Business Hours */}
          <BusinessHoursPicker
            mode={businessHours.mode}
            sameDaily={businessHours.sameDaily}
            custom={businessHours.custom}
            onModeChange={setBusinessHoursMode}
            onSameDailyChange={setSameDailyHours}
            onCustomDayChange={setCustomDayHours}
          />

          {/* Appointment Only Mode */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={appointmentOnly}
                onChange={(e) => setAppointmentOnly(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  Appointment-only mode
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Customers can request a time, and you'll confirm via your dashboard.
                  Perfect for businesses with flexible or irregular schedules.
                </p>
              </div>
            </label>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How business hours work</p>
              <p className="text-blue-700">
                These hours determine when customers can book appointments through your
                LINE bot. In 24/7 or appointment-only mode, customers can request any
                time and you'll confirm availability.
              </p>
            </div>
          </div>

          {/* Validation status (for debugging) */}
          {isStep1Valid() ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-green-700 font-medium">
                ✓ Ready to proceed to next step
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700 font-medium mb-2">
                Complete these to continue:
              </p>
              <ul className="text-sm text-amber-600 space-y-1">
                {(!businessName || businessName.length < 3) && (
                  <li>• Enter a business name (at least 3 characters)</li>
                )}
                {businessHours.mode === 'same-daily' && businessHours.sameDaily.open >= businessHours.sameDaily.close && (
                  <li>• Opening time must be before closing time</li>
                )}
                {businessHours.mode === 'custom' && !Object.values(businessHours.custom).some(day => !day.closed && day.open < day.close) && (
                  <li>• At least one day must be open with valid hours</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
