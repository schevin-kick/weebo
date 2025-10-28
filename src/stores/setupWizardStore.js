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

const initialRichMenu = {
  enabled: true,
  items: [
    { id: 1, type: 'view-bookings', label: 'View Bookings', enabled: true, order: 0 },
    { id: 2, type: 'new-booking', label: 'New Booking', enabled: true, order: 1 },
    { id: 3, type: 'business-hours', label: 'Business Hours', enabled: false, order: 2 },
    { id: 4, type: 'contact-us', label: 'Contact Us', enabled: false, order: 3 },
  ],
};

const initialContactInfo = {
  phone: '',
  email: '',
  address: '',
  website: '',
};

const useSetupWizardStore = create(
  persist(
    (set, get) => ({
      // Step 1: Business Info
      businessName: '',
      logoUrl: '',
      businessHours: initialBusinessHours,
      defaultAppointmentDuration: 60,
      appointmentOnly: false,
      richMenu: initialRichMenu,
      contactInfo: initialContactInfo,

      // Step 2: Services
      services: [],

      // Step 3: Staff
      staff: [],

      // Step 4: Page Builder (min 1 page, max 10 custom pages)
      pages: [],
      currentEditingPageId: null,
      presetPagesConfig: {
        services: false,
        staff: false,
        dateTime: false,
      },

      // Wizard navigation
      currentStep: 1,

      // Actions
      setBusinessName: (name) => set({ businessName: name }),

      setLogoUrl: (url) => set({ logoUrl: url }),

      updateContactInfo: (updates) =>
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...updates },
        })),

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

      setDefaultAppointmentDuration: (duration) => set({ defaultAppointmentDuration: duration }),

      // Rich Menu actions
      setRichMenuEnabled: (enabled) =>
        set((state) => ({
          richMenu: { ...state.richMenu, enabled },
        })),

      updateRichMenuItem: (id, updates) =>
        set((state) => ({
          richMenu: {
            ...state.richMenu,
            items: state.richMenu.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),


      moveRichMenuItemUp: (id) =>
        set((state) => {
          const items = [...state.richMenu.items].sort((a, b) => a.order - b.order);
          const index = items.findIndex((item) => item.id === id);
          if (index <= 0) return state;

          [items[index], items[index - 1]] = [items[index - 1], items[index]];

          return {
            richMenu: {
              ...state.richMenu,
              items: items.map((item, i) => ({ ...item, order: i })),
            },
          };
        }),

      moveRichMenuItemDown: (id) =>
        set((state) => {
          const items = [...state.richMenu.items].sort((a, b) => a.order - b.order);
          const index = items.findIndex((item) => item.id === id);
          if (index === -1 || index >= items.length - 1) return state;

          [items[index], items[index + 1]] = [items[index + 1], items[index]];

          return {
            richMenu: {
              ...state.richMenu,
              items: items.map((item, i) => ({ ...item, order: i })),
            },
          };
        }),

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

      // Staff actions
      addStaff: (staffMember) =>
        set((state) => ({
          staff: [...state.staff, { ...staffMember, id: Date.now() }],
        })),

      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),

      // Page builder actions
      addPage: (page) =>
        set((state) => {
          const customPagesCount = state.pages.filter(p => p.type === 'custom').length;
          if (page.type === 'custom' && customPagesCount >= 10) return state;

          const maxOrder = state.pages.reduce((max, p) => Math.max(max, p.order), -1);
          const newPage = {
            ...page,
            order: maxOrder + 1,
          };

          return {
            pages: [...state.pages, newPage],
            currentEditingPageId: newPage.id,
          };
        }),

      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePage: (id) =>
        set((state) => {
          const deletedPage = state.pages.find(p => p.id === id);

          // Cannot delete datetime page - it's required
          if (deletedPage?.type === 'preset-datetime') {
            return state;
          }

          const newPages = state.pages
            .filter((p) => p.id !== id)
            .map((p, index) => ({ ...p, order: index }));

          // Update preset config if deleting a preset page
          const newPresetConfig = { ...state.presetPagesConfig };
          if (deletedPage?.type === 'preset-services') newPresetConfig.services = false;
          if (deletedPage?.type === 'preset-staff') newPresetConfig.staff = false;

          return {
            pages: newPages,
            presetPagesConfig: newPresetConfig,
            currentEditingPageId:
              state.currentEditingPageId === id
                ? newPages[0]?.id || null
                : state.currentEditingPageId,
          };
        }),

      movePageUp: (id) =>
        set((state) => {
          const index = state.pages.findIndex((p) => p.id === id);
          if (index <= 0) return state;

          const newPages = [...state.pages];
          [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];

          return {
            pages: newPages.map((p, i) => ({ ...p, order: i })),
          };
        }),

      movePageDown: (id) =>
        set((state) => {
          const page = state.pages.find((p) => p.id === id);
          const index = state.pages.findIndex((p) => p.id === id);

          // Cannot move datetime page or move a page past the datetime page (which should be last)
          if (index === -1 || index >= state.pages.length - 1) return state;
          if (page?.type === 'preset-datetime') return state;
          if (state.pages[index + 1]?.type === 'preset-datetime') return state;

          const newPages = [...state.pages];
          [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];

          return {
            pages: newPages.map((p, i) => ({ ...p, order: i })),
          };
        }),

      setCurrentEditingPageId: (id) => set({ currentEditingPageId: id }),

      // Component actions (within pages)
      addComponentToPage: (pageId, component) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? { ...page, components: [...page.components, component] }
              : page
          ),
        })),

      updateComponent: (pageId, componentId, updates) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  components: page.components.map((c) =>
                    c.id === componentId ? { ...c, ...updates } : c
                  ),
                }
              : page
          ),
        })),

      deleteComponent: (pageId, componentId) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? { ...page, components: page.components.filter((c) => c.id !== componentId) }
              : page
          ),
        })),

      moveComponentUp: (pageId, componentId) =>
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;

            const index = page.components.findIndex((c) => c.id === componentId);
            if (index <= 0) return page;

            const newComponents = [...page.components];
            [newComponents[index], newComponents[index - 1]] = [
              newComponents[index - 1],
              newComponents[index],
            ];

            return { ...page, components: newComponents };
          }),
        })),

      moveComponentDown: (pageId, componentId) =>
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;

            const index = page.components.findIndex((c) => c.id === componentId);
            if (index === -1 || index >= page.components.length - 1) return page;

            const newComponents = [...page.components];
            [newComponents[index], newComponents[index + 1]] = [
              newComponents[index + 1],
              newComponents[index],
            ];

            return { ...page, components: newComponents };
          }),
        })),

      // Preset page toggling
      togglePresetPage: (presetType) =>
        set((state) => {
          // DateTime page cannot be removed - it's required
          if (presetType === 'dateTime') {
            return state;
          }

          const typeMap = {
            services: 'preset-services',
            staff: 'preset-staff',
            dateTime: 'preset-datetime',
          };

          const pageType = typeMap[presetType];
          const isCurrentlyEnabled = state.presetPagesConfig[presetType];

          if (isCurrentlyEnabled) {
            // Remove the preset page
            const newPages = state.pages
              .filter((p) => p.type !== pageType)
              .map((p, index) => ({ ...p, order: index }));

            return {
              pages: newPages,
              presetPagesConfig: {
                ...state.presetPagesConfig,
                [presetType]: false,
              },
            };
          } else {
            // Add the preset page
            const { generateId } = require('../utils/fieldNameHelper');
            const maxOrder = state.pages.reduce((max, p) => Math.max(max, p.order), -1);

            const titleMap = {
              services: 'Select Service',
              staff: 'Select Staff',
              dateTime: 'Choose Date & Time',
            };

            const newPage = {
              id: generateId(),
              type: pageType,
              title: titleMap[presetType],
              order: maxOrder + 1,
              components: [], // Preset pages don't have configurable components
            };

            return {
              pages: [...state.pages, newPage],
              presetPagesConfig: {
                ...state.presetPagesConfig,
                [presetType]: true,
              },
            };
          }
        }),

      // Ensure datetime page is always present and last
      ensureDateTimePage: () =>
        set((state) => {
          const hasDateTimePage = state.pages.some((p) => p.type === 'preset-datetime');

          if (!hasDateTimePage) {
            const { generateId } = require('../utils/fieldNameHelper');
            const newPage = {
              id: generateId(),
              type: 'preset-datetime',
              title: 'Choose Date & Time',
              order: state.pages.length,
              components: [],
            };

            return {
              pages: [...state.pages, newPage],
              presetPagesConfig: {
                ...state.presetPagesConfig,
                dateTime: true,
              },
            };
          }

          // Ensure datetime page is last
          const dateTimePage = state.pages.find((p) => p.type === 'preset-datetime');
          const otherPages = state.pages.filter((p) => p.type !== 'preset-datetime');
          const reorderedPages = [
            ...otherPages.map((p, index) => ({ ...p, order: index })),
            { ...dateTimePage, order: otherPages.length }
          ];

          return { pages: reorderedPages };
        }),

      // Navigation
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      // Validation helpers
      isStep1Valid: () => {
        const state = get();
        if (!state.businessName || state.businessName.length < 3) return false;

        // Validate default appointment duration
        if (!state.defaultAppointmentDuration || state.defaultAppointmentDuration < 5) return false;

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

        // If "Contact Us" is enabled in rich menu, at least one contact field required
        const contactUsEnabled = state.richMenu.items.some(
          (item) => item.type === 'contact-us' && item.enabled
        );
        if (contactUsEnabled) {
          const hasContactInfo = Object.values(state.contactInfo).some(
            (value) => value && value.trim().length > 0
          );
          if (!hasContactInfo) return false;
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
        // Staff are optional, but if added they must be valid
        return state.staff.every(
          (s) =>
            s.name &&
            s.name.length >= 3 &&
            (!s.description || s.description.length <= 200)
        );
      },

      isStep4Valid: () => {
        const state = get();

        // Must have at least 1 page
        if (state.pages.length < 1) return false;

        // Validate each custom page has required fields
        return state.pages.every((page) => {
          // Preset pages are always valid
          if (page.type.startsWith('preset-')) return true;

          // Custom pages must have a title
          if (!page.title || page.title.trim().length === 0) return false;

          // Validate all components in the page
          return page.components.every((component) => {
            // All components must have label
            if (!component.label || component.label.trim().length === 0) return false;

            // Preset fields are valid with just label
            if (component.type === 'preset-field') return true;

            // Custom fields need inputType
            if (component.type === 'custom-field') {
              if (!component.inputType) return false;

              // Select/radio/checkbox need at least one option
              if (['select', 'radio', 'checkbox'].includes(component.inputType)) {
                return component.options && component.options.length > 0;
              }

              return true;
            }

            return false;
          });
        });
      },

      // Reset store
      reset: () =>
        set({
          businessName: '',
          businessHours: initialBusinessHours,
          defaultAppointmentDuration: 60,
          appointmentOnly: false,
          richMenu: initialRichMenu,
          contactInfo: initialContactInfo,
          services: [],
          staff: [],
          pages: [],
          currentEditingPageId: null,
          presetPagesConfig: {
            services: false,
            staff: false,
            dateTime: false,
          },
          currentStep: 1,
        }),
    }),
    {
      name: 'kitsune-setup-wizard',
      partialize: (state) => ({
        businessName: state.businessName,
        logoUrl: state.logoUrl,
        businessHours: state.businessHours,
        defaultAppointmentDuration: state.defaultAppointmentDuration,
        appointmentOnly: state.appointmentOnly,
        richMenu: state.richMenu,
        contactInfo: state.contactInfo,
        services: state.services,
        staff: state.staff,
        pages: state.pages,
        presetPagesConfig: state.presetPagesConfig,
        currentStep: state.currentStep,
      }),
    }
  )
);

export default useSetupWizardStore;
