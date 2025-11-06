import { translate } from '../lib/localeUtils';

/**
 * Validates email format
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic validation)
 */
export function validatePhone(phone) {
  if (!phone) return false;
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Should have at least 10 digits
  return digitsOnly.length >= 10;
}

/**
 * Validates a single field based on its configuration
 * @param {object} component - The component configuration
 * @param {*} value - The value to validate
 * @param {string} locale - The locale for error messages (default: 'zh-tw')
 */
export function validateField(component, value, locale = 'zh-tw') {
  // Check required
  if (component.required) {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        error: translate(locale, 'utils.bookingValidation.fieldRequired', { label: component.label })
      };
    }

    // For arrays (checkboxes), check if at least one is selected
    if (Array.isArray(value) && value.length === 0) {
      return {
        valid: false,
        error: translate(locale, 'utils.bookingValidation.checkboxRequired', { label: component.label })
      };
    }
  }

  // If not required and empty, it's valid
  if (!value || value === '') {
    return { valid: true, error: null };
  }

  // Preset field validations
  if (component.type === 'preset-field') {
    if (component.fieldType === 'email' && component.validation) {
      if (!validateEmail(value)) {
        return {
          valid: false,
          error: translate(locale, 'utils.bookingValidation.invalidEmail')
        };
      }
    }

    if (component.fieldType === 'phone') {
      if (!validatePhone(value)) {
        return {
          valid: false,
          error: translate(locale, 'utils.bookingValidation.invalidPhone')
        };
      }
    }
  }

  // Custom field validations
  if (component.type === 'custom-field') {
    if (component.inputType === 'number') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        return {
          valid: false,
          error: translate(locale, 'utils.bookingValidation.invalidNumber')
        };
      }

      if (component.min !== undefined && numValue < component.min) {
        return {
          valid: false,
          error: translate(locale, 'utils.bookingValidation.numberMin', { min: component.min })
        };
      }

      if (component.max !== undefined && numValue > component.max) {
        return {
          valid: false,
          error: translate(locale, 'utils.bookingValidation.numberMax', { max: component.max })
        };
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Validates all fields on a page
 * @param {object} page - The page configuration
 * @param {object} responses - The user responses
 * @param {string} locale - The locale for error messages (default: 'zh-tw')
 */
export function validatePage(page, responses, locale = 'zh-tw') {
  const errors = {};
  let isValid = true;

  // Preset pages don't need validation (handled differently)
  if (page.type.startsWith('preset-')) {
    return { isValid: true, errors: {} };
  }

  // Validate each component
  for (const component of page.components) {
    const value = responses[component.id];
    const validation = validateField(component, value, locale);

    if (!validation.valid) {
      errors[component.id] = validation.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates preset service selection
 * @param {string} selectedServiceId - The selected service ID
 * @param {Array} services - Available services
 * @param {string} locale - The locale for error messages (default: 'zh-tw')
 */
export function validateServiceSelection(selectedServiceId, services, locale = 'zh-tw') {
  if (!selectedServiceId) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.selectService')
    };
  }

  const service = services.find((s) => s.id === selectedServiceId);
  if (!service) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.serviceNotFound')
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates preset staff selection
 * @param {string} selectedStaffId - The selected staff ID
 * @param {Array} staff - Available staff
 * @param {string} locale - The locale for error messages (default: 'zh-tw')
 */
export function validateStaffSelection(selectedStaffId, staff, locale = 'zh-tw') {
  if (!selectedStaffId) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.selectStaff')
    };
  }

  // "any" is always valid
  if (selectedStaffId === 'any') {
    return { valid: true, error: null };
  }

  const staffMember = staff.find((s) => s.id === selectedStaffId);
  if (!staffMember) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.staffNotFound')
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates datetime selection
 * @param {object} selectedDateTime - The selected date and time object
 * @param {string} locale - The locale for error messages (default: 'zh-tw')
 */
export function validateDateTimeSelection(selectedDateTime, locale = 'zh-tw') {
  if (!selectedDateTime) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.selectDateTime')
    };
  }

  if (!selectedDateTime.date || !selectedDateTime.time) {
    return {
      valid: false,
      error: translate(locale, 'utils.bookingValidation.selectDateAndTime')
    };
  }

  return { valid: true, error: null };
}
