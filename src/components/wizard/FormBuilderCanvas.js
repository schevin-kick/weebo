'use client';

import {
  Type,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  Settings,
  Trash2,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useState } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const PRESET_FIELD_ICONS = {
  name: { icon: Type, color: 'bg-blue-500', label: 'Name' },
  email: { icon: Mail, color: 'bg-green-500', label: 'Email' },
  phone: { icon: Phone, color: 'bg-purple-500', label: 'Phone' },
  notes: { icon: FileText, color: 'bg-amber-500', label: 'Notes' },
  address: { icon: MapPin, color: 'bg-red-500', label: 'Address' },
  dob: { icon: CalendarIcon, color: 'bg-indigo-500', label: 'Date of Birth' },
};

const CUSTOM_FIELD_LABELS = {
  text: 'Text Input',
  select: 'Select Dropdown',
  textarea: 'Text Area',
  radio: 'Radio Buttons',
  checkbox: 'Checkboxes',
  number: 'Number Input',
};

export default function FormBuilderCanvas({ pageId, onConfigureComponent }) {
  const [editingTitlePageId, setEditingTitlePageId] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const page = useSetupWizardStore((state) =>
    state.pages.find((p) => p.id === pageId)
  );
  const updatePage = useSetupWizardStore((state) => state.updatePage);
  const deleteComponent = useSetupWizardStore((state) => state.deleteComponent);
  const moveComponentUp = useSetupWizardStore((state) => state.moveComponentUp);
  const moveComponentDown = useSetupWizardStore((state) => state.moveComponentDown);

  if (!page) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <p className="text-slate-600">Select a page from the sidebar to edit</p>
      </div>
    );
  }

  const isPreset = page.type.startsWith('preset-');

  const handleStartEditTitle = () => {
    setTitleValue(page.title);
    setEditingTitlePageId(page.id);
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      updatePage(page.id, { title: titleValue.trim() });
    }
    setEditingTitlePageId(null);
  };

  const handleCancelEditTitle = () => {
    setEditingTitlePageId(null);
    setTitleValue('');
  };

  return (
    <div className="space-y-4">
      {/* Page title editor */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        {editingTitlePageId === page.id ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Page Title
            </label>
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEditTitle();
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter page title"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveTitle}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEditTitle}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{page.title}</h3>
              <p className="text-sm text-slate-600 mt-0.5">
                {isPreset
                  ? 'This is a preset page with automatic functionality'
                  : `${page.components.length} field${
                      page.components.length !== 1 ? 's' : ''
                    }`}
              </p>
            </div>
            {!isPreset && (
              <button
                onClick={handleStartEditTitle}
                className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Edit page title"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preset page info */}
      {isPreset && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 font-medium mb-1">
            Preset Page
          </p>
          <p className="text-sm text-blue-700">
            This page automatically displays{' '}
            {page.type === 'preset-services' && 'your services'}
            {page.type === 'preset-staff' && 'your staff members'}
            {page.type === 'preset-datetime' && 'a date and time picker'} from your
            configuration. No additional setup needed!
          </p>
        </div>
      )}

      {/* Custom page - component list */}
      {!isPreset && (
        <>
          {page.components.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Add Form Fields
              </h3>
              <p className="text-slate-600 max-w-sm mx-auto">
                Drag preset fields or create custom fields from the palette on the
                right to build your form.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {page.components.map((component, index) => {
                const isPresetField = component.type === 'preset-field';
                const isInfoText = component.type === 'info-text';
                const icon = isPresetField
                  ? PRESET_FIELD_ICONS[component.fieldType]
                  : null;
                const Icon = icon?.icon || FileText;
                const color = isInfoText ? 'bg-sky-500' : (icon?.color || 'bg-slate-500');

                return (
                  <div
                    key={component.id}
                    className="group bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {isInfoText ? (
                          <>
                            <div className="font-semibold text-slate-900">
                              Info Text
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {component.content || 'No content'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-slate-900">
                              {component.label}
                            </div>
                            <div className="text-sm text-slate-600">
                              {isPresetField
                                ? `${icon?.label}${
                                    component.fieldType === 'email'
                                      ? ` • ${component.validation ? 'Validated' : 'No validation'}`
                                      : ''
                                  } • ${component.required ? 'Required' : 'Optional'}`
                                : `${
                                    CUSTOM_FIELD_LABELS[component.inputType]
                                  } • ${
                                    component.required ? 'Required' : 'Optional'
                                  }`}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveComponentUp(pageId, component.id)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                            } transition-colors`}
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveComponentDown(pageId, component.id)}
                            disabled={index === page.components.length - 1}
                            className={`p-1 rounded ${
                              index === page.components.length - 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                            } transition-colors`}
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Configure button */}
                        <button
                          onClick={() => onConfigureComponent(component.id)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Configure"
                        >
                          <Settings className="w-5 h-5" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            const componentName = isInfoText ? 'this info text' : component.label;
                            setDeleteConfirm({ id: component.id, name: componentName });
                          }}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteComponent(pageId, deleteConfirm.id);
          }
        }}
        title="Delete Component"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
