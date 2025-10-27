'use client';

import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

export default function StepNavigation({
  currentStep,
  onPrev,
  onNext,
  onSave,
  canProceed = true,
  isLastStep = false,
}) {
  return (
    <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 sm:px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Back button */}
        {currentStep > 1 ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Next/Save button */}
        {isLastStep ? (
          <button
            onClick={onSave}
            disabled={!canProceed}
            className={`
              flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all
              ${
                canProceed
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30'
                  : 'bg-slate-300 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-4 h-4" />
            Save & Deploy
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`
              flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all
              ${
                canProceed
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }
            `}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
