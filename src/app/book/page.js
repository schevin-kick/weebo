'use client';

import { useState, useEffect, useMemo } from 'react';
import useBookingStore from '@/stores/bookingStore';
import useSetupWizardStore from '@/stores/setupWizardStore';
import BookingLayout from '@/components/booking/BookingLayout';
import BookingStepper from '@/components/booking/BookingStepper';
import BookingNavigation from '@/components/booking/BookingNavigation';
import PresetServicePage from '@/components/booking/PresetServicePage';
import PresetStaffPage from '@/components/booking/PresetStaffPage';
import CustomFieldsPage from '@/components/booking/CustomFieldsPage';
import PresetDateTimePage from '@/components/booking/PresetDateTimePage';
import ReviewConfirmPage from '@/components/booking/ReviewConfirmPage';
import BookingSuccess from '@/components/booking/BookingSuccess';
import BookingError from '@/components/booking/BookingError';
import {
  validatePage,
  validateServiceSelection,
  validateStaffSelection,
  validateDateTimeSelection,
} from '@/utils/bookingValidation';

export default function BookingPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isReviewPage, setIsReviewPage] = useState(false);
  const [pageErrors, setPageErrors] = useState({});

  // Setup wizard config
  const businessName = useSetupWizardStore((state) => state.businessName);
  const pages = useSetupWizardStore((state) => state.pages);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const businessHours = useSetupWizardStore((state) => state.businessHours);

  // Booking store
  const currentPageIndex = useBookingStore((state) => state.currentPageIndex);
  const responses = useBookingStore((state) => state.responses);
  const selectedServiceId = useBookingStore((state) => state.selectedServiceId);
  const selectedStaffId = useBookingStore((state) => state.selectedStaffId);
  const selectedDateTime = useBookingStore((state) => state.selectedDateTime);
  const isCompleted = useBookingStore((state) => state.isCompleted);

  const initializeSession = useBookingStore((state) => state.initializeSession);
  const setCurrentPageIndex = useBookingStore((state) => state.setCurrentPageIndex);
  const nextPage = useBookingStore((state) => state.nextPage);
  const previousPage = useBookingStore((state) => state.previousPage);
  const goToPage = useBookingStore((state) => state.goToPage);
  const setResponse = useBookingStore((state) => state.setResponse);
  const setResponses = useBookingStore((state) => state.setResponses);
  const setSelectedService = useBookingStore((state) => state.setSelectedService);
  const setSelectedStaff = useBookingStore((state) => state.setSelectedStaff);
  const setSelectedDateTime = useBookingStore((state) => state.setSelectedDateTime);
  const completeBooking = useBookingStore((state) => state.completeBooking);
  const getBookingSummary = useBookingStore((state) => state.getBookingSummary);

  useEffect(() => {
    setIsHydrated(true);
    // Initialize session if not already done
    initializeSession();
  }, [initializeSession]);

  // Sort pages by order
  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => a.order - b.order);
  }, [pages]);

  // Check if config is valid
  const hasValidConfig = useMemo(() => {
    return sortedPages.length > 0 && businessName;
  }, [sortedPages, businessName]);

  // Get current page
  const currentPage = sortedPages[currentPageIndex];

  // Get selected service object
  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Validate current page
  const canProceed = useMemo(() => {
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
  }, [currentPage, selectedServiceId, selectedStaffId, selectedDateTime, responses, services, staff]);

  // Show success page if completed
  if (isCompleted) {
    return <BookingSuccess bookingSummary={getBookingSummary()} />;
  }

  // Show error if no valid config
  if (isHydrated && !hasValidConfig) {
    return <BookingError />;
  }

  // Don't render until hydrated
  if (!isHydrated) {
    return null;
  }

  const handleNext = () => {
    if (isReviewPage) {
      // Should not happen (confirm button handles this)
      return;
    }

    if (currentPageIndex < sortedPages.length - 1) {
      nextPage();
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
      previousPage();
    }
  };

  const handleConfirm = () => {
    const summary = getBookingSummary();
    console.log('Booking Summary:', summary);
    completeBooking();
  };

  const handleEditPage = (pageId) => {
    const pageIndex = sortedPages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setIsReviewPage(false);
    }
  };

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
          onSelect={setSelectedService}
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
          onSelect={setSelectedStaff}
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
        />
      );
    }

    // Custom page
    if (currentPage.type === 'custom') {
      return (
        <CustomFieldsPage
          page={currentPage}
          responses={responses}
          onResponseChange={setResponse}
        />
      );
    }

    return null;
  };

  return (
    <BookingLayout
      businessName={businessName}
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
          onConfirm={handleConfirm}
        />
      }
    >
      {renderCurrentPage()}
    </BookingLayout>
  );
}
