'use client';

import {
  Type,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  List,
  AlignLeft,
  Circle,
  CheckSquare,
  Hash,
} from 'lucide-react';

const PRESET_FIELDS = [
  {
    fieldType: 'name',
    name: 'Name',
    icon: Type,
    color: 'bg-blue-500',
  },
  {
    fieldType: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-green-500',
  },
  {
    fieldType: 'phone',
    name: 'Phone',
    icon: Phone,
    color: 'bg-purple-500',
  },
  {
    fieldType: 'notes',
    name: 'Notes',
    icon: FileText,
    color: 'bg-amber-500',
  },
  {
    fieldType: 'address',
    name: 'Address',
    icon: MapPin,
    color: 'bg-red-500',
  },
  {
    fieldType: 'dob',
    name: 'Date of Birth',
    icon: Calendar,
    color: 'bg-indigo-500',
  },
];

const CUSTOM_FIELD_TYPES = [
  {
    inputType: 'text',
    name: 'Text Input',
    description: 'Single line text',
    icon: Type,
    color: 'bg-slate-500',
  },
  {
    inputType: 'select',
    name: 'Select Dropdown',
    description: 'Choose from options',
    icon: List,
    color: 'bg-cyan-500',
  },
  {
    inputType: 'textarea',
    name: 'Text Area',
    description: 'Multi-line text',
    icon: AlignLeft,
    color: 'bg-teal-500',
  },
  {
    inputType: 'radio',
    name: 'Radio Buttons',
    description: 'Select one option',
    icon: Circle,
    color: 'bg-violet-500',
  },
  {
    inputType: 'checkbox',
    name: 'Checkboxes',
    description: 'Select multiple',
    icon: CheckSquare,
    color: 'bg-fuchsia-500',
  },
  {
    inputType: 'number',
    name: 'Number Input',
    description: 'Numeric value',
    icon: Hash,
    color: 'bg-emerald-500',
  },
];

export default function ComponentPalette({ onAddPresetField, onAddCustomField }) {
  return (
    <div className="space-y-6">
      {/* Preset Fields Section */}
      <div>
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">Quick Add Fields</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Common fields with built-in validation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_FIELDS.map((field) => {
            const Icon = field.icon;
            return (
              <button
                key={field.fieldType}
                onClick={() => onAddPresetField(field.fieldType)}
                className="group relative p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all text-left"
              >
                {/* Icon */}
                <div
                  className={`
                    w-8 h-8 rounded-md ${field.color} flex items-center justify-center mb-2
                    group-hover:scale-110 transition-transform
                  `}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Title */}
                <div className="font-medium text-slate-900 text-xs">
                  {field.name}
                </div>

                {/* Hover indicator */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm leading-none">+</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Fields Section */}
      <div>
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">Custom Fields</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Build your own form inputs
          </p>
        </div>

        <div className="space-y-2">
          {CUSTOM_FIELD_TYPES.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <button
                key={fieldType.inputType}
                onClick={() => onAddCustomField(fieldType.inputType)}
                className="group relative w-full p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-orange-300 hover:shadow-md cursor-pointer transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-md ${fieldType.color} flex items-center justify-center
                      group-hover:scale-110 transition-transform
                    `}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm">
                      {fieldType.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {fieldType.description}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm leading-none">+</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
        <p className="font-medium mb-1">How it works</p>
        <ul className="text-blue-700 space-y-1">
          <li>• Quick Add: Instant preset fields</li>
          <li>• Custom: Configure your own</li>
          <li>• Reorder: Drag fields up/down</li>
        </ul>
      </div>
    </div>
  );
}
