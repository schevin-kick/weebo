'use client';

import { useState, useMemo } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import BookingLayout from '@/components/booking/BookingLayout';
import BookingStepper from '@/components/booking/BookingStepper';
import BookingNavigation from '@/components/booking/BookingNavigation';
import PresetServicePage from '@/components/booking/PresetServicePage';
import PresetStaffPage from '@/components/booking/PresetStaffPage';
import CustomFieldsPage from '@/components/booking/CustomFieldsPage';
import PresetDateTimePage from '@/components/booking/PresetDateTimePage';
import ReviewConfirmPage from '@/components/booking/ReviewConfirmPage';
import {
  validatePage,
  validateServiceSelection,
  validateStaffSelection,
  validateDateTimeSelection,
} from '@/utils/bookingValidation';

/**
 * Preview wrapper for booking flow using wizard store data
 */
export default function BookingFlowPreview() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReviewPage, setIsReviewPage] = useState(false);
  const [responses, setResponses] = useState({});
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  // Get data from wizard store
  const businessName = useSetupWizardStore((state) => state.businessName);
  const pages = useSetupWizardStore((state) => state.pages);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const defaultAppointmentDuration = useSetupWizardStore((state) => state.defaultAppointmentDuration);

  // Sort pages by order
  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => a.order - b.order);
  }, [pages]);

  // Get current page
  const currentPage = sortedPages[currentPageIndex];

  // Get selected service object
  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Validate current page
  const canProceed = useMemo(() => {
    if (isReviewPage) return true;
    if (!currentPage) return false;

    // Service page
    if (currentPage.type === 'preset-services') {
      const validation = validateServiceSelection(selectedServiceId, services);
      return validation.valid;
    }

    // Staff page
    if (currentPage.type === 'preset-staff') {
      const validation = validateStaffSelection(selectedStaffId, staff);
      return validation.valid;
    }

    // DateTime page
    if (currentPage.type === 'preset-datetime') {
      const validation = validateDateTimeSelection(selectedDateTime);
      return validation.valid;
    }

    // Custom page
    if (currentPage.type === 'custom') {
      const validation = validatePage(currentPage, responses);
      return validation.isValid;
    }

    return true;
  }, [currentPage, selectedServiceId, selectedStaffId, selectedDateTime, responses, services, staff, isReviewPage]);

  const handleNext = () => {
    if (isReviewPage) {
      // In preview, just show alert
      alert('This is a preview. In the real app, the booking would be submitted here.');
      return;
    }

    if (currentPageIndex < sortedPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setIsReviewPage(false);
    } else {
      // Last page, go to review
      setIsReviewPage(true);
    }
  };

  const handleBack = () => {
    if (isReviewPage) {
      setIsReviewPage(false);
    } else if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleSetResponse = (componentId, value) => {
    setResponses({ ...responses, [componentId]: value });
  };

  const handleEditPage = (pageId) => {
    const pageIndex = sortedPages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setIsReviewPage(false);
    }
  };

  // Show empty state if no pages configured yet
  if (sortedPages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Pages Yet
          </h3>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Add pages in Step 4 to see the preview of your booking flow
          </p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    if (isReviewPage) {
      return (
        <ReviewConfirmPage
          pages={sortedPages}
          responses={responses}
          selectedService={selectedServiceId}
          selectedStaff={selectedStaffId}
          selectedDateTime={selectedDateTime}
          services={services}
          staff={staff}
          onEditPage={handleEditPage}
        />
      );
    }

    if (!currentPage) return null;

    // Preset service page
    if (currentPage.type === 'preset-services') {
      return (
        <PresetServicePage
          page={currentPage}
          services={services}
          selectedServiceId={selectedServiceId}
          onSelect={setSelectedServiceId}
        />
      );
    }

    // Preset staff page
    if (currentPage.type === 'preset-staff') {
      return (
        <PresetStaffPage
          page={currentPage}
          staff={staff}
          selectedStaffId={selectedStaffId}
          onSelect={setSelectedStaffId}
        />
      );
    }

    // Preset datetime page
    if (currentPage.type === 'preset-datetime') {
      return (
        <PresetDateTimePage
          page={currentPage}
          selectedDateTime={selectedDateTime}
          onSelect={setSelectedDateTime}
          businessHours={businessHours}
          selectedService={selectedService}
          selectedStaff={selectedStaffId}
          staff={staff}
          defaultAppointmentDuration={defaultAppointmentDuration}
        />
      );
    }

    // Custom page
    if (currentPage.type === 'custom') {
      return (
        <CustomFieldsPage
          page={currentPage}
          responses={responses}
          onResponseChange={handleSetResponse}
        />
      );
    }

    return null;
  };

  return (
    <BookingLayout
      businessName={businessName || 'Your Business'}
      stepper={
        <BookingStepper
          pages={sortedPages}
          currentPageIndex={currentPageIndex}
          isReviewPage={isReviewPage}
        />
      }
      navigation={
        <BookingNavigation
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={currentPageIndex > 0 || isReviewPage}
          canGoNext={canProceed}
          isLastPage={currentPageIndex === sortedPages.length - 1}
          isReviewPage={isReviewPage}
          onConfirm={handleNext}
        />
      }
    >
      {renderCurrentPage()}
    </BookingLayout>
  );
}
