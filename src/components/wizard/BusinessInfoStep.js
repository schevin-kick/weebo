'use client';

import { Store, Info, Clock } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import BusinessHoursPicker from '@/components/shared/BusinessHoursPicker';
import DurationPicker from '@/components/shared/DurationPicker';
import ImageUpload from '@/components/shared/ImageUpload';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';

export default function BusinessInfoStep() {
  const businessName = useSetupWizardStore((state) => state.businessName);
  const logoUrl = useSetupWizardStore((state) => state.logoUrl);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const defaultAppointmentDuration = useSetupWizardStore((state) => state.defaultAppointmentDuration);
  const requiresApproval = useSetupWizardStore((state) => state.requiresApproval);
  const contactInfo = useSetupWizardStore((state) => state.contactInfo);

  // Compute validation locally so it re-renders when state changes
  const isValid = (() => {
    if (!businessName || businessName.length < 3) return false;

    // Validate default appointment duration
    if (!defaultAppointmentDuration || defaultAppointmentDuration < 5) return false;

    if (businessHours.mode === 'same-daily') {
      const { open, close } = businessHours.sameDaily;
      if (open >= close) return false;
    }

    if (businessHours.mode === 'custom') {
      const hasOpenDay = Object.values(businessHours.custom).some(
        (day) => !day.closed && day.open < day.close
      );
      if (!hasOpenDay) return false;
    }

    // Address is always required
    if (!contactInfo.address || contactInfo.address.trim().length === 0) return false;

    return true;
  })();

  const setBusinessName = useSetupWizardStore((state) => state.setBusinessName);
  const setLogoUrl = useSetupWizardStore((state) => state.setLogoUrl);
  const updateContactInfo = useSetupWizardStore((state) => state.updateContactInfo);
  const setBusinessHoursMode = useSetupWizardStore(
    (state) => state.setBusinessHoursMode
  );
  const setSameDailyHours = useSetupWizardStore((state) => state.setSameDailyHours);
  const setCustomDayHours = useSetupWizardStore((state) => state.setCustomDayHours);
  const setDefaultAppointmentDuration = useSetupWizardStore((state) => state.setDefaultAppointmentDuration);
  const setRequiresApproval = useSetupWizardStore((state) => state.setRequiresApproval);

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

          {/* Business Logo */}
          <div>
            <ImageUpload
              imageUrl={logoUrl}
              onChange={setLogoUrl}
              folder="logos"
              label="Business Logo (optional)"
              aspectRatio="square"
              size="sm"
            />
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

          {/* Default Appointment Duration */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Default Appointment Duration <span className="text-orange-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Used when no service is selected or services aren&apos;t configured. Individual services can override this duration.
                  </p>
                  <DurationPicker
                    value={defaultAppointmentDuration}
                    onChange={setDefaultAppointmentDuration}
                  />
                  {defaultAppointmentDuration && defaultAppointmentDuration < 5 && (
                    <p className="text-sm text-orange-600 mt-2">
                      Duration must be at least 5 minutes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requires Approval */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  Require manual approval for bookings
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  When enabled, all new bookings will be marked as "pending" and require your approval before being confirmed.
                  When disabled, bookings are automatically confirmed.
                </p>
              </div>
            </label>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Information
                </label>
                <p className="text-xs text-slate-500 mb-4">
                  Address is required. Other contact fields are optional.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Address - Required with Autocomplete */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                    Physical Address <span className="text-orange-500">*</span>
                  </label>
                  <AddressAutocomplete
                    id="address"
                    value={contactInfo.address}
                    onChange={(value) => updateContactInfo({ address: value })}
                    placeholder="Start typing to search for address..."
                    required
                  />
                  {!contactInfo.address && (
                    <p className="text-xs text-orange-600 mt-1">
                      Address is required
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => updateContactInfo({ phone: e.target.value })}
                      placeholder="+66 12 345 6789"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => updateContactInfo({ email: e.target.value })}
                      placeholder="hello@business.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                      Website or Social Media
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={contactInfo.website}
                      onChange={(e) => updateContactInfo({ website: e.target.value })}
                      placeholder="https://facebook.com/yourbusiness"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
