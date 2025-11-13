'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import useStepValidation from '@/hooks/useStepValidation';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithCSRF } from '@/hooks/useCSRF';
import WizardStepper from '@/components/wizard/WizardStepper';
import StepNavigation from '@/components/wizard/StepNavigation';
import BusinessInfoStep from '@/components/wizard/BusinessInfoStep';
import ServicesStep from '@/components/wizard/ServicesStep';
import StaffStep from '@/components/wizard/StaffStep';
import PageBuilderStep from '@/components/wizard/PageBuilderStep';
import FallingSakura from '@/components/background/FallingSakura';
import PreviewModal from '@/components/preview/PreviewModal';
import BookingFlowPreview from '@/components/preview/BookingFlowPreview';
import { ArrowLeft, Eye } from 'lucide-react';

export default function BusinessWizardPage() {
  const t = useTranslations('setup.wizard');
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId;

  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();

  const currentStep = useSetupWizardStore((state) => state.currentStep);
  const nextStep = useSetupWizardStore((state) => state.nextStep);
  const prevStep = useSetupWizardStore((state) => state.prevStep);

  // Use the custom hook to validate the current step reactively
  const isStepValid = useStepValidation(currentStep);

  useEffect(() => {
    setIsHydrated(true);
    if (businessId !== 'new') {
      loadBusinessData();
    } else {
      // Reset wizard store for new business
      const store = useSetupWizardStore.getState();
      store.reset();
      store.setCurrentStep(1);
      setLoading(false);
    }
  }, [businessId]);

  async function loadBusinessData() {
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (!response.ok) throw new Error('Failed to load business');

      const data = await response.json();
      setBusinessData(data.business);

      // Populate Zustand store with existing data
      const store = useSetupWizardStore.getState();
      store.setBusinessName(data.business.businessName);
      store.setLogoUrl(data.business.logoUrl || '');
      store.setBusinessHours(data.business.businessHours || {});
      store.setDefaultAppointmentDuration(data.business.defaultDuration || 60);
      store.setAppointmentOnly(data.business.appointmentOnly || false);
      store.setRequiresApproval(data.business.requiresApproval || false);
      store.setContactInfo({
        phone: data.business.phone || '',
        email: data.business.email || '',
        address: data.business.address || '',
        website: data.business.website || '',
      });

      // Load services
      if (data.business.services && data.business.services.length > 0) {
        store.setServices(data.business.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          duration: service.duration,
          price: service.price || 0,
        })));
      }

      // Load staff
      if (data.business.staff && data.business.staff.length > 0) {
        store.setStaff(data.business.staff.map(member => ({
          id: member.id,
          name: member.name,
          specialty: member.specialty || '',
          description: member.description || '',
          photo: member.photoUrl || '',
          availability: member.availability || {},
        })));
      }

      // Load pages
      if (data.business.pages && data.business.pages.length > 0) {
        store.setPages(data.business.pages.map(page => ({
          id: page.id,
          type: page.type,
          title: page.title,
          order: page.order,
          components: page.components || [],
        })));
      }

    } catch (error) {
      console.error('Load business error:', error);
      toast.error('Failed to load business data');
      router.push('/setup');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const store = useSetupWizardStore.getState();

      const businessData = {
        businessName: store.businessName,
        logoUrl: store.logoUrl || null,
        businessHours: store.businessHours,
        defaultDuration: store.defaultAppointmentDuration,
        appointmentOnly: store.appointmentOnly,
        requiresApproval: store.requiresApproval,
        phone: store.contactInfo.phone || null,
        email: store.contactInfo.email || null,
        address: store.contactInfo.address,
        website: store.contactInfo.website || null,
      };

      const servicesData = store.services.map((service, index) => ({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        order: index,
        isActive: true,
      }));

      const staffData = store.staff.map((member, index) => ({
        name: member.name,
        specialty: member.specialty,
        description: member.description,
        photoUrl: member.photo, // TODO: Upload to R2
        availability: member.availability,
        order: index,
        isActive: true,
      }));

      const pagesData = store.pages.map((page) => ({
        type: page.type,
        title: page.title,
        order: page.order,
        components: page.components,
      }));

      const payload = {
        business: businessData,
        services: servicesData,
        staff: staffData,
        pages: pagesData,
      };

      let response;
      if (businessId === 'new') {
        // Create new business
        response = await fetchWithCSRF('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Update existing business
        response = await fetchWithCSRF(`/api/businesses/${businessId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to save business');

      const result = await response.json();
      const savedBusinessId = result.business.id;
      const isFirstBusiness = result.isFirstBusiness;
      toast.success('Business saved successfully!', 5000);

      // Redirect to dashboard with query params if this is the first business
      // This triggers cache bypass in SubscriptionCheck to show trial banner immediately
      setTimeout(() => {
        if (isFirstBusiness) {
          router.push(`/dashboard/${savedBusinessId}?from=setup&first=true`);
        } else {
          router.push(`/dashboard/${savedBusinessId}`);
        }
      }, 1500);

    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save business configuration');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = useMemo(() => {
    if (!isHydrated) return true;
    return isStepValid;
  }, [isHydrated, isStepValid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FallingSakura />

      <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 z-40 shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/setup')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Weebo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Weebo
                  </h1>
                  <p className="text-sm text-slate-600">
                    {businessId === 'new' ? t('header.createNew') : t('header.editBusiness')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">{t('navigation.preview')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <WizardStepper currentStep={currentStep} />

          <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-4 ${currentStep === 4 ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
            {currentStep === 1 && <BusinessInfoStep />}
            {currentStep === 2 && <ServicesStep />}
            {currentStep === 3 && <StaffStep />}
            {currentStep === 4 && <PageBuilderStep />}
          </main>
        </div>

        {/* Fixed Navigation at Bottom */}
        <div className="flex-shrink-0">
          <StepNavigation
            currentStep={currentStep}
            onPrev={prevStep}
            onNext={nextStep}
            onSave={handleSave}
            canProceed={canProceed}
            isLastStep={currentStep === 4}
            isSaving={saving}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)}>
        <BookingFlowPreview />
      </PreviewModal>
    </>
  );
}
