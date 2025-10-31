/**
 * Dashboard Mutations Hooks
 * Hooks for optimistic updates and mutations
 */

import { mutate } from 'swr';
import { fetchWithCSRF } from './useCSRF';

/**
 * Hook to update booking status with optimistic updates
 */
export function useUpdateBookingStatus() {
  return async (bookingId, newStatus, businessId) => {
    try {
      // Optimistically update all bookings cache keys that match the pattern
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`),
        async (currentData) => {
          if (!currentData?.bookings) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, status: newStatus }
                : booking
            ),
          };
        },
        { revalidate: false } // Don't revalidate yet
      );

      // Make the API call (with CSRF token)
      const response = await fetchWithCSRF(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Revalidate all bookings queries for this business
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));

      // Also revalidate metrics and today's schedule
      await mutate(`/api/dashboard/${businessId}/metrics`);
      await mutate(`/api/dashboard/${businessId}/today`);

      return { success: true };
    } catch (error) {
      // Rollback on error - revalidate to restore previous state
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));
      throw error;
    }
  };
}

/**
 * Hook to update booking notes with optimistic updates
 */
export function useUpdateBookingNotes() {
  return async (bookingId, notes, businessId) => {
    try {
      // Optimistically update all bookings cache keys that match the pattern
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`),
        async (currentData) => {
          if (!currentData?.bookings) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, notes }
                : booking
            ),
          };
        },
        { revalidate: false }
      );

      // API call (with CSRF token)
      const response = await fetchWithCSRF(`/api/bookings/${bookingId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      // Revalidate all bookings queries for this business
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));

      return { success: true };
    } catch (error) {
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));
      throw error;
    }
  };
}

/**
 * Hook to mark booking as no-show with optimistic updates
 */
export function useMarkNoShow() {
  return async (bookingId, businessId) => {
    try {
      // Optimistically update all bookings cache keys that match the pattern
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`),
        async (currentData) => {
          if (!currentData?.bookings) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, noShow: true, status: 'no_show' }
                : booking
            ),
          };
        },
        { revalidate: false }
      );

      // API call (with CSRF token)
      const response = await fetchWithCSRF(`/api/bookings/${bookingId}/no-show`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noShow: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as no-show');
      }

      // Revalidate all bookings queries for this business
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));
      await mutate(`/api/dashboard/${businessId}/metrics`);

      return { success: true };
    } catch (error) {
      await mutate((key) => typeof key === 'string' && key.startsWith(`/api/bookings?businessId=${businessId}`));
      throw error;
    }
  };
}

/**
 * Hook to update business settings
 */
export function useUpdateBusinessSettings() {
  return async (businessId, settings) => {
    const businessKey = `/api/businesses/${businessId}`;

    try {
      // Optimistically update business cache
      await mutate(
        businessKey,
        async (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            business: {
              ...currentData.business,
              ...settings.business,
            },
          };
        },
        false
      );

      // API call - use PUT method as defined in API route (with CSRF token)
      const response = await fetchWithCSRF(businessKey, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update business settings');
      }

      const result = await response.json();

      // Revalidate both business detail and list
      await mutate(businessKey);
      await mutate('/api/businesses');

      return { success: true, business: result.business };
    } catch (error) {
      // Rollback on error
      await mutate(businessKey);
      throw error;
    }
  };
}

/**
 * Hook to manually trigger a refresh of all dashboard data
 */
export function useRefreshDashboard(businessId) {
  return async () => {
    // Revalidate all relevant endpoints
    await Promise.all([
      mutate(`/api/dashboard/${businessId}/metrics`),
      mutate(`/api/dashboard/${businessId}/today`),
      mutate(`/api/dashboard/${businessId}/top-customers`),
      mutate((key) => typeof key === 'string' && key.startsWith('/api/bookings')),
    ]);
  };
}
