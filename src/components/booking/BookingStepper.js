'use client';

import { useTranslations } from 'next-intl';

export default function BookingStepper({ pages, currentPageIndex, isReviewPage = false }) {
  const t = useTranslations('booking.stepper');
  const totalSteps = pages.length + 1; // +1 for review page
  const currentStep = isReviewPage ? totalSteps : currentPageIndex + 1;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Hide stepper if there's only one page (2 steps total including review)
  if (pages.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">
          {t('stepCounter', { currentStep, totalSteps })}
        </span>
        <span className="text-slate-500">{Math.round(progressPercentage)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
