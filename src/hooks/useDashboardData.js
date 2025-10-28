/**
 * Dashboard Data Hooks
 * SWR-based hooks for fetching dashboard data
 */

import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

/**
 * Hook to fetch and manage user session
 */
export function useAuth() {
  const { data, error, mutate, isLoading } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return {
    user: data?.user,
    isLoading,
    isError: error,
    isAuthenticated: !!data?.user,
    mutate,
  };
}

/**
 * Hook to fetch user's businesses
 */
export function useBusinesses() {
  const { data, error, mutate, isLoading } = useSWR('/api/businesses', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    businesses: data?.businesses || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a specific business
 */
export function useBusiness(businessId) {
  const { data, error, mutate, isLoading } = useSWR(
    businessId ? `/api/businesses/${businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    business: data?.business,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(businessId) {
  const { data, error, mutate, isLoading } = useSWR(
    businessId ? `/api/dashboard/${businessId}/metrics` : null,
    fetcher
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch today's schedule
 */
export function useTodaySchedule(businessId) {
  const { data, error, mutate, isLoading } = useSWR(
    businessId ? `/api/dashboard/${businessId}/today` : null,
    fetcher
  );

  return {
    todaySchedule: data?.bookings || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch top customers
 */
export function useTopCustomers(businessId) {
  const { data, error, mutate, isLoading } = useSWR(
    businessId ? `/api/dashboard/${businessId}/top-customers` : null,
    fetcher
  );

  return {
    topCustomers: data?.topCustomers || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch bookings with filters
 */
export function useBookings(businessId, filters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();
  if (businessId) params.append('businessId', businessId);
  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.date) params.append('date', filters.date);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const queryString = params.toString();
  const url = businessId ? `/api/bookings?${queryString}` : null;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    bookings: data?.bookings || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch calendar bookings for a date range
 */
export function useCalendarBookings(businessId, startDate, endDate, filters = {}) {
  const params = new URLSearchParams();
  if (businessId) params.append('businessId', businessId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (filters.staffId && filters.staffId !== 'all') params.append('staffId', filters.staffId);
  if (filters.serviceId && filters.serviceId !== 'all') params.append('serviceId', filters.serviceId);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);

  const queryString = params.toString();
  const url = businessId && startDate && endDate ? `/api/bookings?${queryString}` : null;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    bookings: data?.bookings || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch business settings (services, staff, etc.)
 */
export function useBusinessSettings(businessId) {
  const { data, error, mutate, isLoading } = useSWR(
    businessId ? `/api/businesses/${businessId}` : null,
    fetcher
  );

  return {
    settings: data?.business,
    services: data?.business?.services || [],
    staff: data?.business?.staff || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to manually refresh data
 */
export function useRefresh() {
  return {
    refreshAll: () => {
      // This will revalidate all SWR keys
      // You can use mutate from useSWRConfig for global mutations
    },
  };
}
