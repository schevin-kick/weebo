/**
 * Dashboard Store
 * Manages shared dashboard UI state
 */

import { create } from 'zustand';

const useDashboardStore = create((set) => ({
  // UI State
  sidebarOpen: false,
  currentView: 'home', // home, calendar, bookings, qr-code, settings, holiday-hours

  // Business State
  selectedBusinessId: null,

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setCurrentView: (view) => set({ currentView: view }),

  setSelectedBusinessId: (businessId) => set({ selectedBusinessId: businessId }),
}));

export default useDashboardStore;
