'use client';

import { X, Smartphone } from 'lucide-react';

/**
 * Modal that displays booking preview in a mobile frame
 */
export default function PreviewModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[95vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Preview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close preview"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Mobile Frame */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-100 min-h-0">
          <div className="h-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {/* iPhone-like notch (optional styling) */}
            <div className="bg-slate-900 h-6 relative flex-shrink-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 rounded-b-2xl px-8 h-5"></div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <p className="text-xs text-slate-600 text-center">
            Interactive preview - use Back/Next buttons to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
