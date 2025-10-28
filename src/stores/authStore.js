/**
 * Auth Store
 * Manages authentication UI state
 */

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // UI State
  showLogoutModal: false,
  isLoggingOut: false,

  // Actions
  setShowLogoutModal: (show) => set({ showLogoutModal: show }),
  setIsLoggingOut: (isLoggingOut) => set({ isLoggingOut }),

  // Reset
  reset: () =>
    set({
      showLogoutModal: false,
      isLoggingOut: false,
    }),
}));

export default useAuthStore;
