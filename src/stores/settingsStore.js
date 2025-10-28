/**
 * Settings Store
 * Manages settings page UI state
 */

import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  // Active tab
  activeTab: 'business', // business, services, staff, booking-form

  // Form state
  isDirty: false,
  isSaving: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  // Reset state
  reset: () =>
    set({
      activeTab: 'business',
      isDirty: false,
      isSaving: false,
    }),
}));

export default useSettingsStore;
