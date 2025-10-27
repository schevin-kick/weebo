'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';

export default function ConfigPanel({ componentId, onClose }) {
  const component = useSetupWizardStore((state) =>
    state.workflowComponents.find((c) => c.id === componentId)
  );
  const updateWorkflowComponent = useSetupWizardStore(
    (state) => state.updateWorkflowComponent
  );
  const businessName = useSetupWizardStore((state) => state.businessName);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);

  const [config, setConfig] = useState(component?.config || {});

  useEffect(() => {
    if (component) {
      const componentConfig = component.config || {};

      // For staff-selector, if enabled but no staff selected, default to all
      if (component.type === 'staff-selector' &&
          componentConfig.enabled &&
          (!componentConfig.selectedStaff || componentConfig.selectedStaff.length === 0) &&
          staff.length > 0) {
        setConfig({
          ...componentConfig,
          selectedStaff: staff.map(s => s.id)
        });
      } else {
        setConfig(componentConfig);
      }
    }
  }, [component, staff]);

  if (!component) return null;

  const handleSave = () => {
    updateWorkflowComponent(componentId, { config });
    onClose();
  };

  const renderConfigForm = () => {
    switch (component.type) {
      case 'greeting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Greeting Message
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder={`Welcome to ${businessName}! How can we help you today?`}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use {'{business_name}'} to insert your business name
              </p>
            </div>
          </div>
        );

      case 'user-input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Question to Ask
              </label>
              <input
                type="text"
                value={config.question || ''}
                onChange={(e) => setConfig({ ...config, question: e.target.value })}
                placeholder="What is your name?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Field Label
              </label>
              <input
                type="text"
                value={config.fieldLabel || ''}
                onChange={(e) => setConfig({ ...config, fieldLabel: e.target.value })}
                placeholder="customer_name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be used to store the user's response
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Type
              </label>
              <select
                value={config.dataType || 'text'}
                onChange={(e) => setConfig({ ...config, dataType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone Number</option>
                <option value="number">Number</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={config.required !== false}
                onChange={(e) => setConfig({ ...config, required: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="required" className="ml-2 text-sm text-slate-700">
                Required field
              </label>
            </div>
          </div>
        );

      case 'booking-menu':
        const options = config.options || ['View My Bookings', 'Make New Booking'];

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Menu Options
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Customize the quick reply buttons shown to customers
              </p>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setConfig({ ...config, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {options.length > 1 && (
                      <button
                        onClick={() => {
                          const newOptions = options.filter((_, i) => i !== index);
                          setConfig({ ...config, options: newOptions });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove option"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 5 && (
                <button
                  onClick={() => {
                    setConfig({ ...config, options: [...options, ''] });
                  }}
                  className="mt-2 w-full px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors font-medium"
                >
                  + Add Option
                </button>
              )}

              <p className="text-xs text-slate-500 mt-2">
                Maximum 5 options recommended for better user experience
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>Tip:</strong> Common options include "Make New Booking", "View My Bookings", "Contact Us", "Business Hours", etc.
              </p>
            </div>
          </div>
        );

      case 'service-list':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Style
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="displayStyle"
                    value="carousel"
                    checked={config.displayStyle === 'carousel'}
                    onChange={(e) => setConfig({ ...config, displayStyle: e.target.value })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-slate-900">Carousel</div>
                    <div className="text-xs text-slate-600">
                      Show services as swipeable cards (recommended)
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="displayStyle"
                    value="list"
                    checked={config.displayStyle === 'list'}
                    onChange={(e) => setConfig({ ...config, displayStyle: e.target.value })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-slate-900">List</div>
                    <div className="text-xs text-slate-600">
                      Show all services in a vertical list
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPricing"
                checked={config.showPricing !== false}
                onChange={(e) => setConfig({ ...config, showPricing: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="showPricing" className="ml-2 text-sm text-slate-700">
                Show pricing information
              </label>
            </div>

            {services.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900 font-medium">
                  {services.length} service{services.length !== 1 ? 's' : ''} configured
                </p>
                <ul className="text-xs text-green-800 mt-1 space-y-0.5">
                  {services.slice(0, 3).map((service) => (
                    <li key={service.id}>• {service.name}</li>
                  ))}
                  {services.length > 3 && (
                    <li>• ... and {services.length - 3} more</li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  No services configured yet. Go back to Step 2 to add services.
                </p>
              </div>
            )}
          </div>
        );

      case 'staff-selector':
        const selectedStaffIds = config.selectedStaff || [];

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Enable Staff Selection</div>
                <div className="text-sm text-slate-600">
                  Allow customers to choose a specific staff member
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked && staff.length > 0) {
                      // When enabling, default to all staff selected
                      setConfig({
                        ...config,
                        enabled: true,
                        selectedStaff: staff.map(s => s.id)
                      });
                    } else {
                      setConfig({ ...config, enabled: e.target.checked });
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {!config.enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  When disabled, customers will be automatically assigned to any available
                  staff member.
                </p>
              </div>
            )}

            {config.enabled && (
              <div>
                {staff.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-900">
                      No staff members configured yet. Go back to Step 3 to add staff members.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Available Staff Members
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Select which staff members customers can choose from
                    </p>
                    <div className="space-y-2">
                      {staff.map((staffMember) => (
                        <label
                          key={staffMember.id}
                          className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.includes(staffMember.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedStaff: [...selectedStaffIds, staffMember.id],
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedStaff: selectedStaffIds.filter(
                                    (id) => id !== staffMember.id
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-slate-900">
                              {staffMember.name}
                            </div>
                            {staffMember.specialty && (
                              <div className="text-xs text-slate-600">
                                {staffMember.specialty}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-900">
                        {selectedStaffIds.length === 0
                          ? 'Select at least one staff member'
                          : `${selectedStaffIds.length} staff member${selectedStaffIds.length !== 1 ? 's' : ''} selected`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={config.bufferMinutes || 0}
                onChange={(e) =>
                  setConfig({ ...config, bufferMinutes: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Time between appointments (e.g., for cleaning, setup)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Advance Booking (days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={config.advanceBookingDays || 7}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    advanceBookingDays: parseInt(e.target.value) || 7,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                How many days in advance customers can book
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                This picker will use your business hours from Step 1 to determine
                available time slots.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    const titles = {
      greeting: 'Configure Greeting Message',
      'user-input': 'Configure User Input',
      'booking-menu': 'Booking Menu',
      'service-list': 'Configure Service List',
      'staff-selector': 'Configure Staff Selector',
      availability: 'Configure Availability Picker',
    };
    return titles[component.type] || 'Configure Component';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderConfigForm()}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg shadow-orange-500/30"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
