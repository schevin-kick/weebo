'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function BookingNavigation({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  isLastPage = false,
  isReviewPage = false,
  onConfirm,
  nextLabel,
}) {
  const handleNext = () => {
    if (isReviewPage && onConfirm) {
      onConfirm();
    } else {
      onNext();
    }
  };

  const getNextButtonLabel = () => {
    if (nextLabel) return nextLabel;
    if (isReviewPage) return 'Confirm Booking';
    if (isLastPage) return 'Review';
    return 'Next';
  };

  const getNextButtonIcon = () => {
    if (isReviewPage) return <Check className="w-5 h-5" />;
    return <ChevronRight className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Back Button */}
      {canGoBack && (
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all active:scale-95 min-h-[48px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      )}

      {/* Next/Confirm Button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all min-h-[48px] ${
          canGoBack ? 'flex-1' : 'flex-1'
        } ${
          canGoNext
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 active:scale-95'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {getNextButtonLabel()}
        {getNextButtonIcon()}
      </button>
    </div>
  );
}
