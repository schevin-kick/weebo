import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialBusinessHours = {
  mode: '24/7', // '24/7' | 'same-daily' | 'custom'
  sameDaily: { open: '09:00', close: '17:00' },
  custom: {
    mon: { open: '09:00', close: '17:00', closed: false },
    tue: { open: '09:00', close: '17:00', closed: false },
    wed: { open: '09:00', close: '17:00', closed: false },
    thu: { open: '09:00', close: '17:00', closed: false },
    fri: { open: '09:00', close: '17:00', closed: false },
    sat: { open: '09:00', close: '17:00', closed: true },
    sun: { open: '09:00', close: '17:00', closed: true },
  },
};

const useSetupWizardStore = create(
  persist(
    (set, get) => ({
      // Step 1: Business Info
      businessName: '',
      businessHours: initialBusinessHours,
      appointmentOnly: false,

      // Step 2: Services
      services: [],

      // Step 3: Workflow (min 1, max 20)
      workflowComponents: [],
      selectedComponentId: null, // For configuration panel

      // Wizard navigation
      currentStep: 1,

      // Actions
      setBusinessName: (name) => set({ businessName: name }),

      setBusinessHoursMode: (mode) =>
        set((state) => ({
          businessHours: { ...state.businessHours, mode },
        })),

      setSameDailyHours: (open, close) =>
        set((state) => ({
          businessHours: {
            ...state.businessHours,
            sameDaily: { open, close },
          },
        })),

      setCustomDayHours: (day, hours) =>
        set((state) => ({
          businessHours: {
            ...state.businessHours,
            custom: {
              ...state.businessHours.custom,
              [day]: hours,
            },
          },
        })),

      setAppointmentOnly: (value) => set({ appointmentOnly: value }),

      // Service actions
      addService: (service) =>
        set((state) => ({
          services: [...state.services, { ...service, id: Date.now() }],
        })),

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      // Workflow component actions
      addWorkflowComponent: (component) =>
        set((state) => {
          if (state.workflowComponents.length >= 20) return state;
          const maxOrder = state.workflowComponents.reduce(
            (max, c) => Math.max(max, c.order),
            -1
          );
          return {
            workflowComponents: [
              ...state.workflowComponents,
              {
                ...component,
                id: Date.now() + Math.random(),
                order: maxOrder + 1,
              },
            ],
          };
        }),

      updateWorkflowComponent: (id, updates) =>
        set((state) => ({
          workflowComponents: state.workflowComponents.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteWorkflowComponent: (id) =>
        set((state) => ({
          workflowComponents: state.workflowComponents
            .filter((c) => c.id !== id)
            .map((c, index) => ({ ...c, order: index })),
        })),

      moveWorkflowComponentUp: (id) =>
        set((state) => {
          const index = state.workflowComponents.findIndex((c) => c.id === id);
          if (index <= 0) return state;

          const newComponents = [...state.workflowComponents];
          [newComponents[index], newComponents[index - 1]] = [
            newComponents[index - 1],
            newComponents[index],
          ];

          return {
            workflowComponents: newComponents.map((c, i) => ({
              ...c,
              order: i,
            })),
          };
        }),

      moveWorkflowComponentDown: (id) =>
        set((state) => {
          const index = state.workflowComponents.findIndex((c) => c.id === id);
          if (index === -1 || index >= state.workflowComponents.length - 1)
            return state;

          const newComponents = [...state.workflowComponents];
          [newComponents[index], newComponents[index + 1]] = [
            newComponents[index + 1],
            newComponents[index],
          ];

          return {
            workflowComponents: newComponents.map((c, i) => ({
              ...c,
              order: i,
            })),
          };
        }),

      setSelectedComponentId: (id) => set({ selectedComponentId: id }),

      // Navigation
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      // Validation helpers
      isStep1Valid: () => {
        const state = get();
        if (!state.businessName || state.businessName.length < 3) return false;

        if (state.businessHours.mode === 'same-daily') {
          const { open, close } = state.businessHours.sameDaily;
          if (open >= close) return false;
        }

        if (state.businessHours.mode === 'custom') {
          const hasOpenDay = Object.values(state.businessHours.custom).some(
            (day) => !day.closed && day.open < day.close
          );
          if (!hasOpenDay) return false;
        }

        return true;
      },

      isStep2Valid: () => {
        const state = get();
        // Services are optional, but if added they must be valid
        return state.services.every(
          (s) =>
            s.name &&
            s.name.length >= 3 &&
            s.duration &&
            s.duration >= 5 &&
            (!s.description || s.description.length <= 100)
        );
      },

      isStep3Valid: () => {
        const state = get();
        if (state.workflowComponents.length < 1) return false;
        if (state.workflowComponents.length > 20) return false;

        // Check all components have required config
        return state.workflowComponents.every((component) => {
          switch (component.type) {
            case 'greeting':
              return component.config?.message?.length > 0;
            case 'user-input':
              return (
                component.config?.question?.length > 0 &&
                component.config?.fieldLabel?.length > 0 &&
                component.config?.dataType
              );
            case 'booking-menu':
              return component.config?.options?.some(opt => opt.trim() !== '');
            case 'service-list':
              return component.config?.displayStyle;
            case 'staff-selector':
              return true; // Has toggle, so always valid
            case 'availability':
              return true; // Uses business hours, always valid
            default:
              return false;
          }
        });
      },

      // Reset store
      reset: () =>
        set({
          businessName: '',
          businessHours: initialBusinessHours,
          appointmentOnly: false,
          services: [],
          workflowComponents: [],
          selectedComponentId: null,
          currentStep: 1,
        }),
    }),
    {
      name: 'kitsune-setup-wizard',
      partialize: (state) => ({
        businessName: state.businessName,
        businessHours: state.businessHours,
        appointmentOnly: state.appointmentOnly,
        services: state.services,
        workflowComponents: state.workflowComponents,
        currentStep: state.currentStep,
      }),
    }
  )
);

export default useSetupWizardStore;
