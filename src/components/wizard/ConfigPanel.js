'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import { useToast } from '@/contexts/ToastContext';

const PRESET_FIELD_LABELS = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  notes: 'Notes',
  address: 'Address',
  dob: 'Date of Birth',
};

export default function ConfigPanel({ pageId, componentId, onClose }) {
  const page = useSetupWizardStore((state) => state.pages.find((p) => p.id === pageId));
  const component = page?.components.find((c) => c.id === componentId);
  const updateComponent = useSetupWizardStore((state) => state.updateComponent);
  const toast = useToast();

  const [config, setConfig] = useState({});

  useEffect(() => {
    if (component) {
      setConfig({ ...component });
    }
  }, [component]);

  if (!component || !page) return null;

  const handleSave = () => {
    // Validate required fields before saving
    const isInfoText = component.type === 'info-text';
    const isCustomField = component.type === 'custom-field';

    // Validate info-text content
    if (isInfoText) {
      if (!config.content || config.content.trim() === '') {
        toast.error('Content is required for info text components');
        return;
      }
    }

    // Validate custom field label
    if (isCustomField) {
      if (!config.label || config.label.trim() === '') {
        toast.error('Field Label is required');
        return;
      }

      // Validate options for select/radio/checkbox fields
      const needsOptions = ['select', 'radio', 'checkbox'].includes(config.inputType);
      if (needsOptions) {
        const hasValidOptions = config.options &&
          config.options.length > 0 &&
          config.options.some(opt => opt && opt.trim() !== '');

        if (!hasValidOptions) {
          toast.error('At least one non-empty option is required for this field type');
          return;
        }

        // Filter out empty options before saving
        config.options = config.options.filter(opt => opt && opt.trim() !== '');
      }
    }

    updateComponent(pageId, componentId, config);
    onClose();
  };

  const renderConfigForm = () => {
    const isPreset = component.type === 'preset-field';
    const isInfoText = component.type === 'info-text';

    if (isInfoText) {
      // Info text configuration
      return (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
            <p className="text-sm text-sky-900 font-medium">
              Info Text Component
            </p>
            <p className="text-sm text-sky-700 mt-1">
              Display informational text to customers. No input required.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={config.content || ''}
              onChange={(e) => setConfig({ ...config, content: e.target.value })}
              placeholder="Enter the information you want to display to customers..."
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              This text will be displayed to customers in the booking flow
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Display Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'info', label: 'Info', color: 'bg-blue-50 border-blue-200 text-blue-900' },
                { value: 'warning', label: 'Warning', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { value: 'success', label: 'Success', color: 'bg-green-50 border-green-200 text-green-900' },
                { value: 'plain', label: 'Plain', color: 'bg-slate-50 border-slate-200 text-slate-900' },
              ].map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setConfig({ ...config, style: style.value })}
                  className={`p-3 border-2 rounded-lg font-medium text-sm transition-all ${config.style === style.value
                    ? 'border-orange-500 ring-2 ring-orange-200'
                    : style.color
                    }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Choose how the information should be visually presented
            </p>
          </div>
        </div>
      );
    }

    if (isPreset) {
      // Preset field configuration
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium">
              {PRESET_FIELD_LABELS[config.fieldType]} Field
            </p>
            <p className="text-sm text-blue-700 mt-1">
              This is a preset field with built-in formatting and behavior.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Field Label
            </label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              placeholder={`e.g., "Your ${PRESET_FIELD_LABELS[config.fieldType]}"`}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              The text shown to customers above this field
            </p>
          </div>

          {/* Only show validation toggle for email field */}
          {config.fieldType === 'email' && (
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Enable Validation</div>
                <div className="text-sm text-slate-600">
                  Validate email format
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={config.validation !== false}
                  onChange={(e) => setConfig({ ...config, validation: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[10px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-slate-900">Required Field</div>
              <div className="text-sm text-slate-600">
                Customers must fill this field
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={config.required !== false}
                onChange={(e) => setConfig({ ...config, required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[10px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      );
    } else {
      // Custom field configuration
      const needsOptions = ['select', 'radio', 'checkbox'].includes(config.inputType);
      const options = config.options || [''];

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Field Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              placeholder="e.g., Party Size"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              The text shown to customers above this field
            </p>
          </div>

          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Options <span className="text-red-500">*</span>
              </label>
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

              <button
                onClick={() => {
                  setConfig({ ...config, options: [...options, ''] });
                }}
                className="mt-2 w-full px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors font-medium text-sm"
              >
                + Add Option
              </button>
            </div>
          )}

          {config.inputType === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Min Value (optional)
                </label>
                <input
                  type="number"
                  value={config.min ?? ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      min: e.target.value === '' ? undefined : parseInt(e.target.value),
                    })
                  }
                  placeholder="No minimum"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Value (optional)
                </label>
                <input
                  type="number"
                  value={config.max ?? ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      max: e.target.value === '' ? undefined : parseInt(e.target.value),
                    })
                  }
                  placeholder="No maximum"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-slate-900">Required Field</div>
              <div className="text-sm text-slate-600">
                Customers must fill this field
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={config.required !== false}
                onChange={(e) => setConfig({ ...config, required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[10px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      );
    }
  };

  const getTitle = () => {
    if (component.type === 'preset-field') {
      return `Configure ${PRESET_FIELD_LABELS[component.fieldType]} Field`;
    }
    if (component.type === 'info-text') {
      return 'Configure Info Text';
    }
    return 'Configure Custom Field';
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
