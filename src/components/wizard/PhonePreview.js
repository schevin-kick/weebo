'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import StaffAvatar from '@/components/shared/StaffAvatar';

export default function PhonePreview() {
  const t = useTranslations('setup.wizard.navigation');
  const pages = useSetupWizardStore((state) => state.pages);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const businessName = useSetupWizardStore((state) => state.businessName);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentPage = sortedPages[currentPageIndex];

  const canGoBack = currentPageIndex > 0;
  const canGoNext = currentPageIndex < sortedPages.length - 1;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const renderField = (component) => {
    const isPreset = component.type === 'preset-field';
    const label = component.label || (isPreset ? component.fieldType : 'Field');
    const required = component.required !== false;

    // Render based on input type
    if (isPreset || component.inputType === 'text') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled
          />
        </div>
      );
    }

    if (component.inputType === 'number') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            placeholder={`Enter ${label.toLowerCase()}`}
            min={component.min}
            max={component.max}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled
          />
        </div>
      );
    }

    if (component.inputType === 'textarea') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled
          />
        </div>
      );
    }

    if (component.inputType === 'select') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled
          >
            <option>Choose an option...</option>
            {component.options?.map((option, idx) => (
              <option key={idx}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    if (component.inputType === 'radio') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {component.options?.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center p-2 border border-slate-200 rounded-lg cursor-not-allowed"
              >
                <input
                  type="radio"
                  name={component.id}
                  className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  disabled
                />
                <span className="ml-2 text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (component.inputType === 'checkbox') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {component.options?.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center p-2 border border-slate-200 rounded-lg cursor-not-allowed"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                  disabled
                />
                <span className="ml-2 text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPageContent = () => {
    if (!currentPage) {
      return (
        <div className="text-center py-12 px-4">
          <p className="text-slate-500 text-sm">No pages created yet</p>
          <p className="text-slate-400 text-xs mt-1">Add a page to see the preview</p>
        </div>
      );
    }

    // Preset pages
    if (currentPage.type === 'preset-services') {
      return (
        <div className="space-y-3 pb-4">
          <h2 className="text-lg font-bold text-slate-900">{currentPage.title}</h2>
          {services.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No services configured. Add services in Step 2.
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors text-left"
                  disabled
                >
                  <div className="font-semibold text-slate-900 text-sm">{service.name}</div>
                  {service.description && (
                    <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {service.price && (
                      <span className="font-medium text-orange-600">${service.price}</span>
                    )}
                    {service.duration && (
                      <span className="text-slate-500">{service.duration} min</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentPage.type === 'preset-staff') {
      return (
        <div className="space-y-3 pb-4">
          <h2 className="text-lg font-bold text-slate-900">{currentPage.title}</h2>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No staff configured. Add staff in Step 3.
            </div>
          ) : (
            <div className="space-y-2">
              {staff.map((member) => (
                <button
                  key={member.id}
                  className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors text-left flex items-center gap-3"
                  disabled
                >
                  <StaffAvatar
                    photo={member.photo}
                    name={member.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{member.name}</div>
                    {member.specialty && (
                      <p className="text-xs text-slate-600 mt-1">{member.specialty}</p>
                    )}
                  </div>
                </button>
              ))}
              <button
                className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors text-left flex items-center gap-3"
                disabled
              >
                <StaffAvatar
                  photo=""
                  name="Any Staff"
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm">Any Staff</div>
                  <p className="text-xs text-slate-600 mt-1">No preference</p>
                </div>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (currentPage.type === 'preset-datetime') {
      return (
        <div className="space-y-3 pb-4">
          <h2 className="text-lg font-bold text-slate-900">{currentPage.title}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
              <div className="grid grid-cols-3 gap-2">
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map(
                  (time) => (
                    <button
                      key={time}
                      className="px-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm hover:border-orange-300 transition-colors"
                      disabled
                    >
                      {time}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Custom page
    return (
      <div className="space-y-4 pb-4">
        <h2 className="text-lg font-bold text-slate-900">{currentPage.title}</h2>
        {currentPage.components.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No fields added yet. Add fields from the palette.
          </div>
        ) : (
          <div className="space-y-4">
            {currentPage.components.map((component) => renderField(component))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Phone frame mockup */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Phone header */}
          <div className="bg-white rounded-t-3xl pt-8 px-6 pb-4 border-x-4 border-t-4 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-slate-900">{businessName || 'Preview'}</h1>
              <div className="text-xs text-slate-500">
                {currentPageIndex + 1} / {sortedPages.length || 1}
              </div>
            </div>
          </div>

          {/* Phone content area */}
          <div className="bg-white px-6 py-4 border-x-4 border-slate-800 overflow-y-auto" style={{ minHeight: '400px', maxHeight: '600px' }}>
            {renderPageContent()}
          </div>

          {/* Phone navigation footer */}
          <div className="bg-white rounded-b-3xl px-6 py-4 border-x-4 border-b-4 border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={!canGoBack}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  canGoBack
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  canGoNext
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-orange-200 text-orange-400 cursor-not-allowed'
                }`}
              >
                {t('next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview info */}
      <div className="px-4 py-3 bg-slate-200 border-t border-slate-300">
        <p className="text-xs text-slate-600 text-center">
          Interactive preview - use Back/Next buttons to navigate
        </p>
      </div>
    </div>
  );
}
