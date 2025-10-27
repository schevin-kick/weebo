'use client';

import {
  MessageCircle,
  MessageSquare,
  List,
  Users,
  Calendar,
  Menu,
  ChevronUp,
  ChevronDown,
  Settings,
  Trash2,
  Sparkles,
} from 'lucide-react';

const COMPONENT_ICONS = {
  greeting: { icon: MessageCircle, color: 'bg-blue-500' },
  'user-input': { icon: MessageSquare, color: 'bg-purple-500' },
  'booking-menu': { icon: Menu, color: 'bg-green-500' },
  'service-list': { icon: List, color: 'bg-orange-500' },
  'staff-selector': { icon: Users, color: 'bg-pink-500' },
  availability: { icon: Calendar, color: 'bg-indigo-500' },
};

const COMPONENT_NAMES = {
  greeting: 'Greeting Message',
  'user-input': 'User Input',
  'booking-menu': 'Booking Menu',
  'service-list': 'Service List',
  'staff-selector': 'Staff Selector',
  availability: 'Availability Picker',
};

function ComponentPreview({ component }) {
  const { type, config } = component;

  switch (type) {
    case 'greeting':
      return (
        <p className="text-sm text-slate-600 truncate">
          {config?.message || 'Not configured'}
        </p>
      );
    case 'user-input':
      return (
        <p className="text-sm text-slate-600 truncate">
          {config?.question || 'Not configured'}
        </p>
      );
    case 'booking-menu':
      const optionCount = config?.options?.length || 2;
      return (
        <p className="text-sm text-slate-600">
          {optionCount} option{optionCount !== 1 ? 's' : ''}
        </p>
      );
    case 'service-list':
      return (
        <p className="text-sm text-slate-600">
          {config?.displayStyle === 'carousel' ? 'Carousel' : 'List'} view
        </p>
      );
    case 'staff-selector':
      return (
        <p className="text-sm text-slate-600">
          {config?.enabled
            ? `${config?.staff?.length || 0} staff members`
            : 'Any staff'}
        </p>
      );
    case 'availability':
      return (
        <p className="text-sm text-slate-600">
          {config?.bufferMinutes || 0} min buffer
        </p>
      );
    default:
      return null;
  }
}

export default function WorkflowCanvas({
  components,
  onMoveUp,
  onMoveDown,
  onConfigure,
  onDelete,
}) {
  if (components.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Build Your Workflow
        </h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          Tap components from the palette to add them to your bot's conversation flow.
          You can add up to 20 components in any order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Your Workflow</h3>
        <span className="text-sm text-slate-600">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Component list */}
      <div className="space-y-3">
        {components
          .sort((a, b) => a.order - b.order)
          .map((component, index) => {
            const { icon: Icon, color } = COMPONENT_ICONS[component.type];
            const name = COMPONENT_NAMES[component.type];

            return (
              <div
                key={component.id}
                className="group bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Order number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{name}</div>
                    <ComponentPreview component={component} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => onMoveUp(component.id)}
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
                        onClick={() => onMoveDown(component.id)}
                        disabled={index === components.length - 1}
                        className={`p-1 rounded ${
                          index === components.length - 1
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
                      onClick={() => onConfigure(component.id)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Configure"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(component.id)}
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

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">Building your conversation flow</p>
        <p className="text-blue-700">
          These components will appear in order when customers interact with your LINE
          bot. Use the ↑↓ buttons to reorder, configure each component with the ⚙️
          button.
        </p>
      </div>
    </div>
  );
}
