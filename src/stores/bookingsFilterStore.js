/**
 * Bookings Filter Store
 * Manages bookings list filtering and pagination state
 */

import { create } from 'zustand';

const useBookingsFilterStore = create((set) => ({
  // Filter State
  searchQuery: '',
  statusFilter: 'all', // all, pending, confirmed, completed, cancelled
  dateFilter: '', // YYYY-MM-DD format, empty = all dates

  // Sort State
  sortBy: 'dateTime', // dateTime, status, customer
  sortOrder: 'desc', // asc, desc

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
  setDateFilter: (date) => set({ dateFilter: date, currentPage: 1 }),

  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSortOrder: () =>
    set((state) => ({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })),

  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (perPage) => set({ itemsPerPage: perPage, currentPage: 1 }),

  // Reset filters
  resetFilters: () =>
    set({
      searchQuery: '',
      statusFilter: 'all',
      dateFilter: '',
      sortBy: 'dateTime',
      sortOrder: 'desc',
      currentPage: 1,
    }),

  // Get filter params for API calls
  getFilterParams: (state) => ({
    search: state.searchQuery || undefined,
    status: state.statusFilter !== 'all' ? state.statusFilter : undefined,
    date: state.dateFilter || undefined,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.currentPage,
    limit: state.itemsPerPage,
  }),
}));

export default useBookingsFilterStore;
