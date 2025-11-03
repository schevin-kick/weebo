'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import { useToast } from '@/contexts/ToastContext';

export default function ConfigPanel({
  pageId,
  componentId,
  pendingComponent,
  isNewComponent = false,
  onSaveNew,
  onClose
}) {
  const t = useTranslations('settings.pageBuilder.configPanel');
  const tFields = useTranslations('settings.pageBuilder.componentPalette.fieldTypes');
  const page = useSetupWizardStore((state) => state.pages.find((p) => p.id === pageId));
  const updateComponent = useSetupWizardStore((state) => state.updateComponent);
  const toast = useToast();

  // For new components, use pendingComponent; for existing, find in page
  const component = isNewComponent ? pendingComponent : page?.components.find((c) => c.id === componentId);

  const [config, setConfig] = useState({});

  useEffect(() => {
    if (component) {
      setConfig({ ...component });
    }
  }, [component]);

  // For new components, we don't need the page to exist yet
  // For existing components, we need both component and page
  if (!component) return null;
  if (!isNewComponent && !page) return null;

  const handleSave = () => {
    // Validate required fields before saving
    const isInfoText = component.type === 'info-text';
    const isCustomField = component.type === 'custom-field';

    // Validate info-text content
    if (isInfoText) {
      if (!config.content || config.content.trim() === '') {
        toast.error(t('errors.contentRequired'));
        return;
      }
    }

    // Validate custom field label
    if (isCustomField) {
      if (!config.label || config.label.trim() === '') {
        toast.error(t('errors.labelRequired'));
        return;
      }

      // Validate options for select/radio/checkbox fields
      const needsOptions = ['select', 'radio', 'checkbox'].includes(config.inputType);
      if (needsOptions) {
        const hasValidOptions = config.options &&
          config.options.length > 0 &&
          config.options.some(opt => opt && opt.trim() !== '');

        if (!hasValidOptions) {
          toast.error(t('errors.optionsRequired'));
          return;
        }

        // Filter out empty options before saving
        config.options = config.options.filter(opt => opt && opt.trim() !== '');
      }
    }

    // Handle new component vs existing component
    if (isNewComponent) {
      // For new components, call onSaveNew with the complete component data
      onSaveNew(config);
    } else {
      // For existing components, update as before
      updateComponent(pageId, componentId, config);
      onClose();
    }
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
              {t('infoText.title')}
            </p>
            <p className="text-sm text-sky-700 mt-1">
              {t('infoText.description')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('infoText.contentLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={config.content || ''}
              onChange={(e) => setConfig({ ...config, content: e.target.value })}
              placeholder={t('infoText.contentPlaceholder')}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('infoText.contentHelper')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('infoText.styleLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'info', color: 'bg-blue-50 border-blue-200 text-blue-900' },
                { value: 'warning', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { value: 'success', color: 'bg-green-50 border-green-200 text-green-900' },
                { value: 'plain', color: 'bg-slate-50 border-slate-200 text-slate-900' },
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
                  {t(`infoText.styles.${style.value}`)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t('infoText.styleHelper')}
            </p>
          </div>
        </div>
      );
    }

    if (isPreset) {
      // Preset field configuration
      const fieldLabel = config.fieldType ? tFields(config.fieldType) : '';

      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium">
              {t('presetField.title', { field: fieldLabel })}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {t('presetField.description')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('presetField.labelLabel')}
            </label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              placeholder={t('presetField.labelPlaceholder', { field: fieldLabel })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('presetField.labelHelper')}
            </p>
          </div>

          {/* Only show validation toggle for email field */}
          {config.fieldType === 'email' && (
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-slate-900">{t('presetField.validationLabel')}</div>
                <div className="text-sm text-slate-600">
                  {t('presetField.validationHelper')}
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
              <div className="font-medium text-slate-900">{t('presetField.requiredLabel')}</div>
              <div className="text-sm text-slate-600">
                {t('presetField.requiredHelper')}
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
              {t('customField.labelLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              placeholder={t('customField.labelPlaceholder')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('customField.labelHelper')}
            </p>
          </div>

          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('customField.optionsLabel')} <span className="text-red-500">*</span>
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
                      placeholder={t('customField.optionPlaceholder', { index: index + 1 })}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {options.length > 1 && (
                      <button
                        onClick={() => {
                          const newOptions = options.filter((_, i) => i !== index);
                          setConfig({ ...config, options: newOptions });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('customField.removeOption')}
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
                {t('customField.addOption')}
              </button>
            </div>
          )}

          {config.inputType === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('customField.minValueLabel')}
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
                  placeholder={t('customField.minValuePlaceholder')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('customField.maxValueLabel')}
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
                  placeholder={t('customField.maxValuePlaceholder')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-slate-900">{t('customField.requiredLabel')}</div>
              <div className="text-sm text-slate-600">
                {t('customField.requiredHelper')}
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
      const fieldLabel = component.fieldType ? tFields(component.fieldType) : '';
      return t('titles.presetField', { field: fieldLabel });
    }
    if (component.type === 'info-text') {
      return t('titles.infoText');
    }
    return t('titles.customField');
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
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg shadow-orange-500/30"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
