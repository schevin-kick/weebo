/**
 * Calendar View Store
 * Manages calendar view state and filters
 */

import { create } from 'zustand';

const useCalendarViewStore = create((set) => ({
  // View State
  viewMode: 'week', // week, day, agenda
  selectedDate: new Date(),

  // Filter State
  filterByStaff: 'all', // 'all' or staff ID
  filterByService: 'all', // 'all' or service ID
  filterByStatus: 'all', // all, pending, confirmed, completed, cancelled

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  setFilterByStaff: (staffId) => set({ filterByStaff: staffId }),
  setFilterByService: (serviceId) => set({ filterByService: serviceId }),
  setFilterByStatus: (status) => set({ filterByStatus: status }),

  // Navigate dates
  goToToday: () => set({ selectedDate: new Date() }),
  goToPreviousPeriod: (viewMode) =>
    set((state) => {
      const date = new Date(state.selectedDate);
      if (viewMode === 'day') {
        date.setDate(date.getDate() - 1);
      } else if (viewMode === 'week') {
        date.setDate(date.getDate() - 7);
      } else if (viewMode === 'agenda') {
        date.setDate(date.getDate() - 7);
      }
      return { selectedDate: date };
    }),
  goToNextPeriod: (viewMode) =>
    set((state) => {
      const date = new Date(state.selectedDate);
      if (viewMode === 'day') {
        date.setDate(date.getDate() + 1);
      } else if (viewMode === 'week') {
        date.setDate(date.getDate() + 7);
      } else if (viewMode === 'agenda') {
        date.setDate(date.getDate() + 7);
      }
      return { selectedDate: date };
    }),

  // Reset filters
  resetFilters: () =>
    set({
      filterByStaff: 'all',
      filterByService: 'all',
      filterByStatus: 'all',
    }),
}));

export default useCalendarViewStore;
