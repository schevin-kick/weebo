'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useBookingStore from '@/stores/bookingStore';
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
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale || 'zh-tw'; // Will be 'en' or 'zh-tw' from the URL
  const t = useTranslations('booking');

  // Extract business_id from either direct param or liff.state
  let businessId = searchParams.get('business_id');
  if (!businessId) {
    const liffState = searchParams.get('liff.state');
    if (liffState) {
      // Parse business_id from liff.state (e.g., "?business_id=xyz")
      const match = liffState.match(/business_id=([^&]+)/);
      if (match) {
        businessId = match[1];
      }
    }
  }

  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewPage, setIsReviewPage] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Business config from API
  const [businessConfig, setBusinessConfig] = useState(null);

  // LIFF user profile
  const [liffProfile, setLiffProfile] = useState(null);
  const [liffReady, setLiffReady] = useState(false);

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
  const setResponse = useBookingStore((state) => state.setResponse);
  const setSelectedService = useBookingStore((state) => state.setSelectedService);
  const setSelectedStaff = useBookingStore((state) => state.setSelectedStaff);
  const setSelectedDateTime = useBookingStore((state) => state.setSelectedDateTime);
  const completeBooking = useBookingStore((state) => state.completeBooking);
  const getBookingSummary = useBookingStore((state) => state.getBookingSummary);

  useEffect(() => {
    setIsHydrated(true);
    initializeSession();
    initializeLIFF();
  }, []);

  useEffect(() => {
    if (businessId && liffReady) {
      loadBusinessConfig();
    }
  }, [businessId, liffReady]);

  async function initializeLIFF() {
    try {
      // Check if LIFF SDK is available
      if (typeof window !== 'undefined' && window.liff) {
        const liff = window.liff;

        // Initialize LIFF
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' });

        // Check if user is logged in
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // Get user profile
        const profile = await liff.getProfile();
        setLiffProfile({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });

        // Detect language from LINE profile if available
        // Note: LINE profile may include language in some cases
        if (profile.language) {
          console.log('LINE profile language detected:', profile.language);
          detectAndSetLanguage(profile.language);
        } else {
          // Store current locale preference in cookie for future visits
          storeLanguagePreference();
        }

        setLiffReady(true);
      } else {
        // Development mode without LIFF
        console.warn('LIFF SDK not available. Using test mode.');
        setLiffProfile({
          userId: 'test_user_123',
          displayName: 'Test User',
          pictureUrl: null,
        });
        storeLanguagePreference();
        setLiffReady(true);
      }
    } catch (err) {
      console.error('LIFF initialization error:', err);
      setError(t('errors.lineInitFailed'));
      storeLanguagePreference();
      setLiffReady(true); // Continue anyway for testing
    }
  }

  function detectAndSetLanguage(lineLanguage) {
    // Get current locale from pathname
    const currentPath = window.location.pathname;
    const currentLocale = currentPath.startsWith('/en/') ? 'en' :
      currentPath.startsWith('/zh-tw/') ? 'zh-tw' : 'zh-tw';

    // Map LINE language codes to our locales
    let targetLocale = 'zh-tw'; // Default to Chinese

    if (lineLanguage) {
      const langLower = lineLanguage.toLowerCase();
      // English variants
      if (langLower.includes('en')) {
        targetLocale = 'en';
      }
      // Chinese variants (Traditional Chinese, Taiwan, Hong Kong)
      else if (langLower.includes('zh-tw') || langLower.includes('zh-hant') ||
        langLower.includes('zh-hk') || langLower.includes('zh_tw')) {
        targetLocale = 'zh-tw';
      }
      // Simplified Chinese defaults to Traditional (can be changed if needed)
      else if (langLower.includes('zh')) {
        targetLocale = 'zh-tw';
      }
    }

    // Store language preference in cookie
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // If locale doesn't match, redirect to correct locale
    if (currentLocale !== targetLocale) {
      const newPath = currentPath.replace(/^\/(en|zh-tw)/, `/${targetLocale}`);
      window.location.href = newPath + window.location.search;
    }
  }

  function storeLanguagePreference() {
    // Store current locale from pathname
    const currentPath = window.location.pathname;
    const currentLocale = currentPath.startsWith('/en/') ? 'en' :
      currentPath.startsWith('/zh-tw/') ? 'zh-tw' : 'zh-tw';

    document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  async function loadBusinessConfig() {
    try {
      setLoading(true);

      const response = await fetch(`/api/businesses/${businessId}`);
      if (!response.ok) throw new Error('Business not found');

      const data = await response.json();
      setBusinessConfig(data.business);
    } catch (err) {
      console.error('Load business error:', err);
      setError(t('errors.businessNotFound'));
    } finally {
      setLoading(false);
    }
  }

  // Sort pages by order
  const sortedPages = useMemo(() => {
    if (!businessConfig?.pages) return [];
    return [...businessConfig.pages].sort((a, b) => a.order - b.order);
  }, [businessConfig]);

  // Check if config is valid
  const hasValidConfig = useMemo(() => {
    return sortedPages.length > 0 && businessConfig?.businessName;
  }, [sortedPages, businessConfig]);

  // Get current page
  const currentPage = sortedPages[currentPageIndex];

  // Get selected service object
  const selectedService = useMemo(() => {
    return businessConfig?.services?.find((s) => s.id === selectedServiceId);
  }, [businessConfig, selectedServiceId]);

  // Validate current page
  const canProceed = useMemo(() => {
    if (!currentPage) return false;

    // Service page
    if (currentPage.type === 'preset-services') {
      const validation = validateServiceSelection(selectedServiceId, businessConfig?.services || []);
      return validation.valid;
    }

    // Staff page
    if (currentPage.type === 'preset-staff') {
      const validation = validateStaffSelection(selectedStaffId, businessConfig?.staff || []);
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
  }, [currentPage, selectedServiceId, selectedStaffId, selectedDateTime, responses, businessConfig]);

  const handleNext = () => {
    if (isReviewPage) {
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

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);

      // Prepare booking data
      const bookingData = {
        businessId,
        customerLineUserId: liffProfile?.userId,
        customerDisplayName: liffProfile?.displayName,
        customerPictureUrl: liffProfile?.pictureUrl,
        serviceId: selectedServiceId || null,
        staffId: selectedStaffId === 'any' ? null : (selectedStaffId || null),
        dateTime: selectedDateTime,
        duration: selectedService?.duration || businessConfig?.defaultDuration,
        responses: responses || {},
        locale: locale, // Pass locale for fallback locale detection
      };

      // Submit booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const result = await response.json();

      // Save the created booking
      setCreatedBooking(result.booking);

      // Mark as completed
      completeBooking();

      console.log('Booking created:', result.booking);
    } catch (err) {
      console.error('Booking error:', err);
      alert(t('errors.bookingFailed', { message: err.message }));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleEditPage = (pageId) => {
    const pageIndex = sortedPages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setIsReviewPage(false);
    }
  };

  // Show success page if completed
  if (isCompleted) {
    return (
      <BookingSuccess
        bookingSummary={getBookingSummary()}
        botBasicId={businessConfig?.lineBotBasicId}
        businessAddress={businessConfig?.address}
        businessPhone={businessConfig?.phone}
        businessName={businessConfig?.businessName}
        businessMessagingMode={businessConfig?.messagingMode}
        bookingId={createdBooking?.id}
      />
    );
  }

  // Show loading while initializing
  if (loading || !liffReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading.loadingSystem')}</p>
        </div>
      </div>
    );
  }

  // Show error if no valid config
  if (error || !hasValidConfig) {
    return <BookingError message={error} />;
  }

  // Don't render until hydrated
  if (!isHydrated) {
    return null;
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
          services={businessConfig.services}
          staff={businessConfig.staff}
          businessAddress={businessConfig.address}
          businessPhone={businessConfig.phone}
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
          services={businessConfig.services}
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
          staff={businessConfig.staff}
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
          businessHours={businessConfig.businessHours}
          selectedService={selectedService}
          selectedStaff={selectedStaffId}
          staff={businessConfig.staff}
          defaultAppointmentDuration={businessConfig.defaultDuration}
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
      businessName={businessConfig.businessName}
      logoUrl={businessConfig.logoUrl}
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
          isLoading={isConfirming}
        />
      }
    >
      {renderCurrentPage()}
    </BookingLayout>
  );
}
