import { useMemo } from 'react';
import useSetupWizardStore from '@/stores/setupWizardStore';

/**
 * Hook that validates the current step by subscribing to relevant state changes.
 * This ensures validation updates reactively as users make changes.
 */
export default function useStepValidation(currentStep) {
  // Subscribe to the actual state values that affect validation
  const businessName = useSetupWizardStore((state) => state.businessName);
  const defaultAppointmentDuration = useSetupWizardStore((state) => state.defaultAppointmentDuration);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const contactInfo = useSetupWizardStore((state) => state.contactInfo);
  const richMenu = useSetupWizardStore((state) => state.richMenu);
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const pages = useSetupWizardStore((state) => state.pages);

  // Calculate validation based on current step
  const isValid = useMemo(() => {
    switch (currentStep) {
      case 1: {
        // Step 1 validation
        if (!businessName || businessName.length < 3) return false;
        if (!defaultAppointmentDuration || defaultAppointmentDuration < 5) return false;

        if (businessHours.mode === 'same-daily') {
          const { open, close } = businessHours.sameDaily;
          if (open >= close) return false;
        }

        if (businessHours.mode === 'custom') {
          const hasOpenDay = Object.values(businessHours.custom).some(
            (day) => !day.closed && day.open < day.close
          );
          if (!hasOpenDay) return false;
        }

        // Address is always required
        if (!contactInfo.address || contactInfo.address.trim().length === 0) return false;

        // If "Contact Us" is enabled in rich menu, at least one contact field required (besides address)
        const contactUsEnabled = richMenu.items.some(
          (item) => item.type === 'contact-us' && item.enabled
        );
        if (contactUsEnabled) {
          const hasContactInfo = [contactInfo.phone, contactInfo.email, contactInfo.website].some(
            (value) => value && value.trim().length > 0
          );
          if (!hasContactInfo) return false;
        }

        return true;
      }
      case 2: {
        // Step 2 validation - Services are optional, but if added they must be valid
        return services.every(
          (s) =>
            s.name &&
            s.name.length >= 3 &&
            s.duration &&
            s.duration >= 5 &&
            (!s.description || s.description.length <= 100)
        );
      }
      case 3: {
        // Step 3 validation - Staff are optional, but if added they must be valid
        return staff.every(
          (s) =>
            s.name &&
            s.name.length >= 3 &&
            (!s.description || s.description.length <= 200)
        );
      }
      case 4: {
        // Step 4 validation - Must have at least 1 page
        if (pages.length < 1) return false;

        // Validate each custom page has required fields
        return pages.every((page) => {
          // Preset pages are always valid
          if (page.type.startsWith('preset-')) return true;

          // Custom pages must have a title
          if (!page.title || page.title.trim().length === 0) return false;

          // Validate all components in the page
          return page.components.every((component) => {
            // Info text components are always valid (just need content)
            if (component.type === 'info-text') {
              return component.content && component.content.trim().length > 0;
            }

            // All other components must have label
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
      }
      default:
        return false;
    }
  }, [currentStep, businessName, defaultAppointmentDuration, businessHours, contactInfo, richMenu, services, staff, pages]);

  return isValid;
}
