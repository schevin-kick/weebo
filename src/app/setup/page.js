'use client';

import { useEffect } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import WizardStepper from '@/components/wizard/WizardStepper';
import StepNavigation from '@/components/wizard/StepNavigation';
import BusinessInfoStep from '@/components/wizard/BusinessInfoStep';
import ServicesStep from '@/components/wizard/ServicesStep';
import StaffStep from '@/components/wizard/StaffStep';
import WorkflowBuilderStep from '@/components/wizard/WorkflowBuilderStep';
import FallingSakura from '@/components/background/FallingSakura';

export default function SetupWizardPage() {
  const currentStep = useSetupWizardStore((state) => state.currentStep);
  const nextStep = useSetupWizardStore((state) => state.nextStep);
  const prevStep = useSetupWizardStore((state) => state.prevStep);

  // Subscribe to the actual state values that affect validation
  const businessName = useSetupWizardStore((state) => state.businessName);
  const welcomeMessage = useSetupWizardStore((state) => state.welcomeMessage);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const contactInfo = useSetupWizardStore((state) => state.contactInfo);
  const richMenu = useSetupWizardStore((state) => state.richMenu);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const workflowComponents = useSetupWizardStore((state) => state.workflowComponents);

  const isStep1Valid = useSetupWizardStore((state) => state.isStep1Valid);
  const isStep2Valid = useSetupWizardStore((state) => state.isStep2Valid);
  const isStep3Valid = useSetupWizardStore((state) => state.isStep3Valid);
  const isStep4Valid = useSetupWizardStore((state) => state.isStep4Valid);

  const handleSave = async () => {
    // TODO: Save to database
    console.log('Saving wizard data...');
    alert('Workflow saved! (Database integration coming soon)');
  };

  // Calculate validation based on current step
  // We call the validation functions directly to ensure they run with latest state
  const canProceed = (() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      default:
        return false;
    }
  })();

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
        {currentStep === 4 && <WorkflowBuilderStep />}
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
