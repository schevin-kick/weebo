'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';

export default function RichMenuPicker({
  enabled,
  items,
  onEnabledChange,
  onItemUpdate,
  onItemMoveUp,
  onItemMoveDown,
}) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const enabledCount = items.filter((item) => item.enabled).length;

  // Validation messages
  const getValidationMessage = () => {
    if (!enabled) return null;
    if (enabledCount < 2) {
      return { type: 'error', text: 'At least 2 enabled items are required' };
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Rich Menu
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[10px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <p className="text-xs text-slate-500">
          A persistent menu bar at the bottom of the LINE chat that&apos;s always accessible
        </p>
      </div>

      {/* Enabled state content */}
      {enabled && (
        <>
          {/* Validation message */}
          {validationMessage && (
            <div
              className={`rounded-lg p-3 text-sm ${validationMessage.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}
            >
              {validationMessage.text}
            </div>
          )}

          {/* Menu items list */}
          <div className="space-y-2">
            {sortedItems.map((item, index) => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-3 transition-colors ${item.enabled
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-200 bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Enable toggle */}
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) =>
                      onItemUpdate(item.id, { enabled: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />

                  {/* Static label (not editable) */}
                  <div className={`flex-1 font-medium text-sm ${!item.enabled && 'text-slate-500'
                    }`}>
                    {item.label}
                  </div>

                  {/* Move up/down buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onItemMoveUp(item.id)}
                      disabled={index === 0}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onItemMoveDown(item.id)}
                      disabled={index === sortedItems.length - 1}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>LINE Rich Menu:</strong> These are predefined menu actions with built-in handlers.
              {' '}Enable at least 2 items. Use the arrows to reorder menu items.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              {enabledCount} of {items.length} items enabled
            </span>
            <span>Minimum: 2 items</span>
          </div>
        </>
      )}

      {/* Disabled state message */}
      {!enabled && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600">
            Enable Rich Menu to add persistent navigation buttons to your LINE chat
          </p>
        </div>
      )}
    </div>
  );
}
