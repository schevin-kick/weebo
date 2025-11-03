'use client';

import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import { useToast } from '@/contexts/ToastContext';
import PageManagerSidebar from './PageManagerSidebar';
import PresetPageSelector from './PresetPageSelector';
import FormBuilderCanvas from './FormBuilderCanvas';
import ComponentPalette from './ComponentPalette';
import ConfigPanel from './ConfigPanel';
import { generateId } from '@/utils/fieldNameHelper';

export default function PageBuilderStep() {
  const t = useTranslations('settings.pageBuilder');
  const [configComponentId, setConfigComponentId] = useState(null);
  const [pendingComponent, setPendingComponent] = useState(null);
  const toast = useToast();

  const PRESET_FIELD_LABELS = {
    name: t('presetFields.name'),
    email: t('presetFields.email'),
    phone: t('presetFields.phone'),
    notes: t('presetFields.notes'),
    address: t('presetFields.address'),
    dob: t('presetFields.dob'),
  };

  const currentEditingPageId = useSetupWizardStore((state) => state.currentEditingPageId);
  const addComponentToPage = useSetupWizardStore((state) => state.addComponentToPage);

  const currentPage = useSetupWizardStore((state) =>
    state.pages.find((p) => p.id === currentEditingPageId)
  );

  const handleAddPresetField = (fieldType) => {
    if (!currentEditingPageId) {
      toast.warning(t('selectPageWarning'));
      return;
    }

    if (currentPage?.type.startsWith('preset-')) {
      toast.error(t('presetPageError'));
      return;
    }

    const newComponent = {
      id: generateId(),
      type: 'preset-field',
      fieldType,
      label: PRESET_FIELD_LABELS[fieldType],
      validation: true,
      required: true,
    };

    addComponentToPage(currentEditingPageId, newComponent);
    toast.success(t('fieldAdded', { field: PRESET_FIELD_LABELS[fieldType] }));
  };

  const handleAddCustomField = (inputType) => {
    if (!currentEditingPageId) {
      toast.warning(t('selectPageWarning'));
      return;
    }

    if (currentPage?.type.startsWith('preset-')) {
      toast.error(t('presetPageError'));
      return;
    }

    // Handle info-text component
    if (inputType === 'info-text') {
      const newComponent = {
        id: generateId(),
        type: 'info-text',
        content: t('infoTextPlaceholder'),
        style: 'info', // 'info', 'warning', 'success', 'plain'
      };

      // Store as pending component instead of adding immediately
      setPendingComponent(newComponent);
      setConfigComponentId(newComponent.id);
      return;
    }

    // Create new custom field component
    const newComponent = {
      id: generateId(),
      type: 'custom-field',
      inputType,
      label: '',
      fieldName: generateId(), // Generate UUID for database storage
      required: true,
      options: inputType === 'select' || inputType === 'radio' || inputType === 'checkbox' ? [''] : undefined,
    };

    // Store as pending component instead of adding immediately
    setPendingComponent(newComponent);
    // Auto-open config for custom fields
    setConfigComponentId(newComponent.id);
  };

  const handleConfigureComponent = (componentId) => {
    setConfigComponentId(componentId);
  };

  const handleSaveNewComponent = (componentData) => {
    if (!pendingComponent || !currentEditingPageId) return;

    // Add the configured component to the page
    addComponentToPage(currentEditingPageId, componentData);

    // Show success toast based on component type
    if (componentData.type === 'info-text') {
      toast.success(t('infoTextAdded'));
    } else {
      toast.success(t('fieldAdded', { field: componentData.label || t('componentPalette.fieldTypes.text.name') }));
    }

    // Clear pending state and close modal
    setPendingComponent(null);
    setConfigComponentId(null);
  };

  const handleCloseConfig = () => {
    // Clear both pending component and config modal
    setPendingComponent(null);
    setConfigComponentId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left: Page Manager - Fixed height, internal scrolling */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-shrink-0">
            <PageManagerSidebar />
          </div>

          {/* Preset Page Selector */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-shrink-0">
            <PresetPageSelector />
          </div>
        </div>

        {/* Center: Form Builder - Scrollable */}
        <div className="lg:col-span-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t('title')}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <FormBuilderCanvas
              pageId={currentEditingPageId}
              onConfigureComponent={handleConfigureComponent}
            />
          </div>
        </div>

        {/* Right: Component Palette - Scrollable */}
        <div className="lg:col-span-3 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <ComponentPalette
              onAddPresetField={handleAddPresetField}
              onAddCustomField={handleAddCustomField}
            />
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {configComponentId && currentEditingPageId && (
        <ConfigPanel
          pageId={currentEditingPageId}
          componentId={configComponentId}
          pendingComponent={pendingComponent}
          isNewComponent={!!pendingComponent}
          onSaveNew={handleSaveNewComponent}
          onClose={handleCloseConfig}
        />
      )}
    </div>
  );
}
