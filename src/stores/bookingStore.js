import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookingStore = create(
  persist(
    (set, get) => ({
      // Session data
      sessionId: null,
      currentPageIndex: 0,
      responses: {}, // { componentId: value }

      // Selections
      selectedServiceId: null,
      selectedStaffId: null, // or 'any'
      selectedDateTime: null, // { date: 'YYYY-MM-DD', time: 'HH:MM' }

      // State
      isCompleted: false,
      completedAt: null,

      // Actions
      initializeSession: () => {
        const sessionId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set({ sessionId, currentPageIndex: 0, responses: {}, isCompleted: false });
      },

      setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

      nextPage: () =>
        set((state) => ({ currentPageIndex: state.currentPageIndex + 1 })),

      previousPage: () =>
        set((state) => ({
          currentPageIndex: Math.max(0, state.currentPageIndex - 1),
        })),

      goToPage: (index) => set({ currentPageIndex: index }),

      // Set response for a component
      setResponse: (componentId, value) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [componentId]: value,
          },
        })),

      // Set multiple responses at once
      setResponses: (responsesObj) =>
        set((state) => ({
          responses: {
            ...state.responses,
            ...responsesObj,
          },
        })),

      // Clear a response
      clearResponse: (componentId) =>
        set((state) => {
          const newResponses = { ...state.responses };
          delete newResponses[componentId];
          return { responses: newResponses };
        }),

      // Preset selections
      setSelectedService: (serviceId) => set({ selectedServiceId: serviceId }),

      setSelectedStaff: (staffId) => set({ selectedStaffId: staffId }),

      setSelectedDateTime: (dateTime) => set({ selectedDateTime: dateTime }),

      // Complete booking
      completeBooking: () =>
        set({
          isCompleted: true,
          completedAt: new Date().toISOString(),
        }),

      // Get booking summary
      getBookingSummary: () => {
        const state = get();
        return {
          sessionId: state.sessionId,
          selectedServiceId: state.selectedServiceId,
          selectedStaffId: state.selectedStaffId,
          selectedDateTime: state.selectedDateTime,
          responses: state.responses,
          completedAt: state.completedAt,
        };
      },

      // Reset booking
      resetBooking: () =>
        set({
          sessionId: null,
          currentPageIndex: 0,
          responses: {},
          selectedServiceId: null,
          selectedStaffId: null,
          selectedDateTime: null,
          isCompleted: false,
          completedAt: null,
        }),
    }),
    {
      name: 'kitsune-booking-session',
    }
  )
);

export default useBookingStore;
