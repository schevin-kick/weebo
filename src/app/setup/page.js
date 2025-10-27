'use client';

import { useMemo, useState, useEffect } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import useStepValidation from '@/hooks/useStepValidation';
import { useToast } from '@/contexts/ToastContext';
import WizardStepper from '@/components/wizard/WizardStepper';
import StepNavigation from '@/components/wizard/StepNavigation';
import BusinessInfoStep from '@/components/wizard/BusinessInfoStep';
import ServicesStep from '@/components/wizard/ServicesStep';
import StaffStep from '@/components/wizard/StaffStep';
import PageBuilderStep from '@/components/wizard/PageBuilderStep';
import FallingSakura from '@/components/background/FallingSakura';

export default function SetupWizardPage() {
  // Track hydration to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const currentStep = useSetupWizardStore((state) => state.currentStep);
  const nextStep = useSetupWizardStore((state) => state.nextStep);
  const prevStep = useSetupWizardStore((state) => state.prevStep);

  // Use the custom hook to validate the current step reactively
  const isStepValid = useStepValidation(currentStep);

  const handleSave = async () => {
    // TODO: Save to database
    console.log('Saving wizard data...');
    toast.success('Workflow saved! (Database integration coming soon)', 5000);
  };

  // Calculate validation based on current step using useMemo
  // This prevents hydration mismatches by memoizing based on dependencies
  const canProceed = useMemo(() => {
    // During SSR, always return true to prevent hydration mismatch
    // The actual validation will be applied after hydration
    if (!isHydrated) return true;

    return isStepValid;
  }, [isHydrated, isStepValid]);

  return (
    <>
      {/* Falling Sakura Animation */}
      <FallingSakura />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🦊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kitsune Booking
              </h1>
              <p className="text-sm text-slate-600">Setup Wizard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <WizardStepper currentStep={currentStep} />

      {/* Main content */}
      <main className={`mx-auto px-4 sm:px-6 lg:px-8 pb-32 ${currentStep === 4 ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        {currentStep === 1 && <BusinessInfoStep />}
        {currentStep === 2 && <ServicesStep />}
        {currentStep === 3 && <StaffStep />}
        {currentStep === 4 && <PageBuilderStep />}
      </main>

      {/* Navigation */}
      <StepNavigation
        currentStep={currentStep}
        onPrev={prevStep}
        onNext={nextStep}
        onSave={handleSave}
        canProceed={canProceed}
        isLastStep={currentStep === 4}
      />
    </div>
    </>
  );
}
