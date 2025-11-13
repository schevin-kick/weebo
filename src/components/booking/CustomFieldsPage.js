'use client';

import { useState, useEffect } from 'react';
import { validateField } from '@/utils/bookingValidation';
import { useTranslations } from 'next-intl';

export default function CustomFieldsPage({ page, responses, onResponseChange }) {
  const t = useTranslations('booking.customFields');
  const [errors, setErrors] = useState({});

  const handleChange = (componentId, value) => {
    onResponseChange(componentId, value);

    // Clear error when user starts typing
    if (errors[componentId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[componentId];
        return newErrors;
      });
    }
  };

  const handleBlur = (component) => {
    const value = responses[component.id];
    const validation = validateField(component, value);

    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        [component.id]: validation.error,
      }));
    }
  };

  const renderField = (component) => {
    // Handle info-text component (display only, no input)
    if (component.type === 'info-text') {
      const styleClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        plain: 'bg-slate-50 border-slate-200 text-slate-700',
      };

      const style = component.style || 'info';

      return (
        <div key={component.id} className={`p-4 border-2 rounded-xl ${styleClasses[style]}`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {component.content || 'No content'}
          </p>
        </div>
      );
    }

    const value = responses[component.id] || '';
    const error = errors[component.id];
    const isPreset = component.type === 'preset-field';
    const label = component.label;
    const required = component.required !== false;

    const inputClasses = `w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
      error
        ? 'border-red-300 bg-red-50'
        : 'border-slate-200 bg-white focus:border-orange-300'
    }`;

    // Text input
    if (
      isPreset ||
      component.inputType === 'text' ||
      (isPreset && ['name', 'email', 'phone', 'address'].includes(component.fieldType))
    ) {
      const inputType =
        isPreset && component.fieldType === 'email'
          ? 'email'
          : isPreset && component.fieldType === 'phone'
          ? 'tel'
          : 'text';

      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={inputType}
            value={value}
            onChange={(e) => handleChange(component.id, e.target.value)}
            onBlur={() => handleBlur(component)}
            placeholder={label}
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    // Number input
    if (component.inputType === 'number') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(component.id, e.target.value)}
            onBlur={() => handleBlur(component)}
            placeholder={label}
            min={component.min}
            max={component.max}
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    // Textarea
    if (component.inputType === 'textarea' || (isPreset && component.fieldType === 'notes')) {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleChange(component.id, e.target.value)}
            onBlur={() => handleBlur(component)}
            placeholder={label}
            rows={4}
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    // Select dropdown
    if (component.inputType === 'select') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleChange(component.id, e.target.value)}
            onBlur={() => handleBlur(component)}
            className={inputClasses}
          >
            <option value="">{t('chooseOption')}</option>
            {component.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    // Radio buttons
    if (component.inputType === 'radio') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {component.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  value === option
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                <input
                  type="radio"
                  name={component.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(component.id, e.target.value)}
                  className="w-5 h-5 text-orange-600 border-slate-300 focus:ring-orange-500"
                />
                <span className="ml-3 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      );
    }

    // Checkboxes
    if (component.inputType === 'checkbox') {
      const selectedValues = Array.isArray(value) ? value : [];

      const handleCheckboxChange = (option) => {
        const newValues = selectedValues.includes(option)
          ? selectedValues.filter((v) => v !== option)
          : [...selectedValues, option];
        handleChange(component.id, newValues);
      };

      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {component.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedValues.includes(option)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="ml-3 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      );
    }

    // Date of birth (preset field)
    if (isPreset && component.fieldType === 'dob') {
      return (
        <div key={component.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(component.id, e.target.value)}
            onBlur={() => handleBlur(component)}
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{page.title}</h2>

      <div className="space-y-5">
        {page.components.map((component) => renderField(component))}
      </div>
    </div>
  );
}
