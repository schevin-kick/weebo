/**
 * Dashboard Mutations Hooks
 * Hooks for optimistic updates and mutations
 */

import { mutate } from 'swr';

/**
 * Hook to update booking status with optimistic updates
 */
export function useUpdateBookingStatus() {
  return async (bookingId, newStatus, businessId) => {
    // Get the current bookings cache key
    const bookingsKey = `/api/bookings?businessId=${businessId}`;

    try {
      // Optimistically update the cache
      await mutate(
        bookingsKey,
        async (currentData) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, status: newStatus }
                : booking
            ),
          };
        },
        false // Don't revalidate yet
      );

      // Make the API call
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Revalidate to get fresh data from server
      await mutate(bookingsKey);

      // Also revalidate metrics and today's schedule
      await mutate(`/api/dashboard/${businessId}/metrics`);
      await mutate(`/api/dashboard/${businessId}/today`);

      return { success: true };
    } catch (error) {
      // Rollback on error - SWR will revalidate and restore previous state
      await mutate(bookingsKey);
      throw error;
    }
  };
}

/**
 * Hook to update booking notes with optimistic updates
 */
export function useUpdateBookingNotes() {
  return async (bookingId, notes, businessId) => {
    const bookingsKey = `/api/bookings?businessId=${businessId}`;

    try {
      // Optimistically update
      await mutate(
        bookingsKey,
        async (currentData) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, notes }
                : booking
            ),
          };
        },
        false
      );

      // API call
      const response = await fetch(`/api/bookings/${bookingId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      // Revalidate
      await mutate(bookingsKey);

      return { success: true };
    } catch (error) {
      await mutate(bookingsKey);
      throw error;
    }
  };
}

/**
 * Hook to mark booking as no-show with optimistic updates
 */
export function useMarkNoShow() {
  return async (bookingId, businessId) => {
    const bookingsKey = `/api/bookings?businessId=${businessId}`;

    try {
      // Optimistically update
      await mutate(
        bookingsKey,
        async (currentData) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            bookings: currentData.bookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, noShow: true, status: 'no_show' }
                : booking
            ),
          };
        },
        false
      );

      // API call
      const response = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noShow: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as no-show');
      }

      // Revalidate
      await mutate(bookingsKey);
      await mutate(`/api/dashboard/${businessId}/metrics`);

      return { success: true };
    } catch (error) {
      await mutate(bookingsKey);
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

      // API call - use PUT method as defined in API route
      const response = await fetch(businessKey, {
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
