'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BookingNavigation({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  isLastPage = false,
  isReviewPage = false,
  onConfirm,
  nextLabel,
  isLoading = false,
}) {
  const t = useTranslations('booking.navigation');

  const handleNext = () => {
    if (isReviewPage && onConfirm) {
      onConfirm();
    } else {
      onNext();
    }
  };

  const getNextButtonLabel = () => {
    if (isLoading) return t('processing');
    if (nextLabel) return nextLabel;
    if (isReviewPage) return t('confirm');
    if (isLastPage) return t('review');
    return t('next');
  };

  const getNextButtonIcon = () => {
    if (isLoading) {
      return (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      );
    }
    if (isReviewPage) return <Check className="w-5 h-5" />;
    return <ChevronRight className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Back Button */}
      {canGoBack && (
        <button
          onClick={onBack}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all active:scale-95 min-h-[48px] ${isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
          {t('back')}
        </button>
      )}

      {/* Next/Confirm Button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext || isLoading}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all min-h-[48px] ${canGoBack ? 'flex-1' : 'flex-1'
          } ${canGoNext && !isLoading
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
