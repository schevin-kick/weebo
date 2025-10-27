'use client';

import { useState } from 'react';
import { Workflow, Eye, EyeOff } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import ComponentPalette from './ComponentPalette';
import WorkflowCanvas from './WorkflowCanvas';
import LinePreview from './LinePreview';
import ConfigPanel from './ConfigPanel';

export default function WorkflowBuilderStep() {
  const [showPreview, setShowPreview] = useState(false);
  const [configComponentId, setConfigComponentId] = useState(null);

  const workflowComponents = useSetupWizardStore((state) => state.workflowComponents);
  const addWorkflowComponent = useSetupWizardStore((state) => state.addWorkflowComponent);
  const deleteWorkflowComponent = useSetupWizardStore(
    (state) => state.deleteWorkflowComponent
  );
  const moveWorkflowComponentUp = useSetupWizardStore(
    (state) => state.moveWorkflowComponentUp
  );
  const moveWorkflowComponentDown = useSetupWizardStore(
    (state) => state.moveWorkflowComponentDown
  );
  const setSelectedComponentId = useSetupWizardStore(
    (state) => state.setSelectedComponentId
  );

  const businessName = useSetupWizardStore((state) => state.businessName);

  const handleAddComponent = (type) => {
    // Initialize with default config based on type
    let defaultConfig = {};

    switch (type) {
      case 'greeting':
        defaultConfig = {
          message: `Welcome to ${businessName}! How can we help you today?`,
          logoUrl: '',
        };
        break;
      case 'user-input':
        defaultConfig = {
          question: '',
          fieldLabel: '',
          dataType: 'text',
          required: true,
        };
        break;
      case 'booking-menu':
        defaultConfig = {
          options: ['View My Bookings', 'Make New Booking']
        };
        break;
      case 'service-list':
        defaultConfig = {
          displayStyle: 'carousel',
          showPricing: true,
        };
        break;
      case 'staff-selector':
        defaultConfig = {
          enabled: false,
          selectedStaff: [],
        };
        break;
      case 'availability':
        defaultConfig = {
          bufferMinutes: 0,
          advanceBookingDays: 7,
        };
        break;
    }

    addWorkflowComponent({
      type,
      config: defaultConfig,
    });
  };

  const handleConfigure = (componentId) => {
    setSelectedComponentId(componentId);
    setConfigComponentId(componentId);
  };

  return (
    <div>
      {/* Mobile preview toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-orange-300 transition-colors"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-5 h-5" />
              Hide LINE Preview
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              Show LINE Preview
            </>
          )}
        </button>
      </div>

      {/* Mobile: LINE Preview overlay */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">LINE Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LinePreview components={workflowComponents} businessName={businessName} />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Component Palette */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
            <ComponentPalette
              onAdd={handleAddComponent}
              currentCount={workflowComponents.length}
              maxCount={20}
            />
          </div>
        </div>

        {/* Center: Workflow Canvas */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Build Your Workflow
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Customize your LINE bot conversation flow
                  </p>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <WorkflowCanvas
              components={workflowComponents}
              onMoveUp={moveWorkflowComponentUp}
              onMoveDown={moveWorkflowComponentDown}
              onConfigure={handleConfigure}
              onDelete={deleteWorkflowComponent}
            />
          </div>
        </div>

        {/* Right: LINE Preview (Desktop only) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="h-[600px]">
                <LinePreview
                  components={workflowComponents}
                  businessName={businessName}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              Interactive preview - test your conversation flow
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {configComponentId && (
        <ConfigPanel
          componentId={configComponentId}
          onClose={() => setConfigComponentId(null)}
        />
      )}
    </div>
  );
}
