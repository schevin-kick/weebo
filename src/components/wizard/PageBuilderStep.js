'use client';

import { useState } from 'react';
import { Smartphone, Eye, EyeOff } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import { useToast } from '@/contexts/ToastContext';
import PageManagerSidebar from './PageManagerSidebar';
import PresetPageSelector from './PresetPageSelector';
import FormBuilderCanvas from './FormBuilderCanvas';
import ComponentPalette from './ComponentPalette';
import PhonePreview from './PhonePreview';
import ConfigPanel from './ConfigPanel';
import { generateId } from '@/utils/fieldNameHelper';

const PRESET_FIELD_LABELS = {
  name: 'Your Name',
  email: 'Email Address',
  phone: 'Phone Number',
  notes: 'Additional Notes',
  address: 'Your Address',
  dob: 'Date of Birth',
};

export default function PageBuilderStep() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [configComponentId, setConfigComponentId] = useState(null);
  const toast = useToast();

  const currentEditingPageId = useSetupWizardStore((state) => state.currentEditingPageId);
  const addComponentToPage = useSetupWizardStore((state) => state.addComponentToPage);

  const currentPage = useSetupWizardStore((state) =>
    state.pages.find((p) => p.id === currentEditingPageId)
  );

  const handleAddPresetField = (fieldType) => {
    if (!currentEditingPageId) {
      toast.warning('Please select a custom page first');
      return;
    }

    if (currentPage?.type.startsWith('preset-')) {
      toast.error('Cannot add fields to preset pages');
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
    toast.success(`Added ${PRESET_FIELD_LABELS[fieldType]} field`);
  };

  const handleAddCustomField = (inputType) => {
    if (!currentEditingPageId) {
      toast.warning('Please select a custom page first');
      return;
    }

    if (currentPage?.type.startsWith('preset-')) {
      toast.error('Cannot add fields to preset pages');
      return;
    }

    const newComponent = {
      id: generateId(),
      type: 'custom-field',
      inputType,
      label: '',
      fieldName: generateId(), // Generate UUID for database storage
      required: true,
      options: inputType === 'select' || inputType === 'radio' || inputType === 'checkbox' ? [''] : undefined,
    };

    addComponentToPage(currentEditingPageId, newComponent);
    // Auto-open config for custom fields
    setConfigComponentId(newComponent.id);
  };

  const handleConfigureComponent = (componentId) => {
    setConfigComponentId(componentId);
  };

  return (
    <div>
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Phone Preview</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Close preview"
              >
                <EyeOff className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Content - Phone Preview */}
            <div className="flex-1 overflow-y-auto">
              <PhonePreview />
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Page Manager */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
            <PageManagerSidebar />
          </div>

          {/* Preset Page Selector */}
          <div className="mt-4 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <PresetPageSelector />
          </div>
        </div>

        {/* Center: Form Builder */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Build Your Pages
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Create the booking flow for your customers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>

            {/* Canvas */}
            <FormBuilderCanvas
              pageId={currentEditingPageId}
              onConfigureComponent={handleConfigureComponent}
            />
          </div>
        </div>

        {/* Right: Component Palette */}
        <div className="lg:col-span-3">
          {/* Component Palette */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
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
          onClose={() => setConfigComponentId(null)}
        />
      )}
    </div>
  );
}
