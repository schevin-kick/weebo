'use client';

import {
  MessageSquare,
  List,
  Users,
  Calendar,
  Menu,
} from 'lucide-react';

const COMPONENT_TYPES = [
  {
    type: 'user-input',
    name: 'User Input',
    description: 'Ask a question and collect response',
    icon: MessageSquare,
    color: 'bg-purple-500',
  },
  {
    type: 'booking-menu',
    name: 'Booking Menu',
    description: 'View or make new booking options',
    icon: Menu,
    color: 'bg-green-500',
  },
  {
    type: 'service-list',
    name: 'Service List',
    description: 'Display your services with details',
    icon: List,
    color: 'bg-orange-500',
  },
  {
    type: 'staff-selector',
    name: 'Staff Selector',
    description: 'Let customers choose staff (optional)',
    icon: Users,
    color: 'bg-pink-500',
  },
  {
    type: 'availability',
    name: 'Availability Picker',
    description: 'Date and time selection',
    icon: Calendar,
    color: 'bg-indigo-500',
  },
];

export default function ComponentPalette({ onAdd, currentCount, maxCount = 20 }) {
  const isDisabled = currentCount >= maxCount;

  const handleAdd = (type) => {
    if (isDisabled) return;
    onAdd(type);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Available Components</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDisabled
              ? 'bg-red-100 text-red-700'
              : currentCount > maxCount * 0.7
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {currentCount}/{maxCount} added
        </div>
      </div>

      {/* Component cards */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        {COMPONENT_TYPES.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.type}
              onClick={() => handleAdd(component.type)}
              disabled={isDisabled}
              className={`
                group relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-lg ${component.color} flex items-center justify-center mb-3
                  ${!isDisabled && 'group-hover:scale-110'} transition-transform
                `}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Title */}
              <div className="font-semibold text-slate-900 text-sm mb-1">
                {component.name}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-snug">
                {component.description}
              </p>

              {/* Hover indicator */}
              {!isDisabled && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg leading-none">+</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Disabled message */}
      {isDisabled && (
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Maximum 20 components reached
          </p>
          <p className="text-xs text-red-600 mt-1">
            Remove a component to add more
          </p>
        </div>
      )}
    </div>
  );
}
