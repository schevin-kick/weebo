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
  Info,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ComponentPalette({ onAddPresetField, onAddCustomField }) {
  const t = useTranslations('settings.pageBuilder.componentPalette');

  const PRESET_FIELDS = [
    {
      fieldType: 'name',
      name: t('fieldTypes.name'),
      icon: Type,
      color: 'bg-blue-500',
    },
    {
      fieldType: 'email',
      name: t('fieldTypes.email'),
      icon: Mail,
      color: 'bg-green-500',
    },
    {
      fieldType: 'phone',
      name: t('fieldTypes.phone'),
      icon: Phone,
      color: 'bg-purple-500',
    },
    {
      fieldType: 'notes',
      name: t('fieldTypes.notes'),
      icon: FileText,
      color: 'bg-amber-500',
    },
    {
      fieldType: 'address',
      name: t('fieldTypes.address'),
      icon: MapPin,
      color: 'bg-red-500',
    },
    {
      fieldType: 'dob',
      name: t('fieldTypes.dob'),
      icon: Calendar,
      color: 'bg-indigo-500',
    },
  ];

  const CUSTOM_FIELD_TYPES = [
    {
      inputType: 'info-text',
      name: t('fieldTypes.infoText.name'),
      description: t('fieldTypes.infoText.description'),
      icon: Info,
      color: 'bg-sky-500',
    },
    {
      inputType: 'text',
      name: t('fieldTypes.text.name'),
      description: t('fieldTypes.text.description'),
      icon: Type,
      color: 'bg-slate-500',
    },
    {
      inputType: 'select',
      name: t('fieldTypes.select.name'),
      description: t('fieldTypes.select.description'),
      icon: List,
      color: 'bg-cyan-500',
    },
    {
      inputType: 'textarea',
      name: t('fieldTypes.textarea.name'),
      description: t('fieldTypes.textarea.description'),
      icon: AlignLeft,
      color: 'bg-teal-500',
    },
    {
      inputType: 'radio',
      name: t('fieldTypes.radio.name'),
      description: t('fieldTypes.radio.description'),
      icon: Circle,
      color: 'bg-violet-500',
    },
    {
      inputType: 'checkbox',
      name: t('fieldTypes.checkbox.name'),
      description: t('fieldTypes.checkbox.description'),
      icon: CheckSquare,
      color: 'bg-fuchsia-500',
    },
    {
      inputType: 'number',
      name: t('fieldTypes.number.name'),
      description: t('fieldTypes.number.description'),
      icon: Hash,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Preset Fields Section */}
      <div>
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">{t('quickAdd.title')}</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('quickAdd.subtitle')}
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
          <h3 className="font-semibold text-slate-900 text-sm">{t('customFields.title')}</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('customFields.subtitle')}
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
        <p className="font-medium mb-1">{t('howItWorks.title')}</p>
        <ul className="text-blue-700 space-y-1">
          <li>• {t('howItWorks.quickAdd')}</li>
          <li>• {t('howItWorks.custom')}</li>
          <li>• {t('howItWorks.reorder')}</li>
        </ul>
      </div>
    </div>
  );
}
