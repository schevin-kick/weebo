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
 */
export function validateField(component, value) {
  // Check required
  if (component.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${component.label} is required` };
    }

    // For arrays (checkboxes), check if at least one is selected
    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, error: `Please select at least one ${component.label}` };
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
        return { valid: false, error: 'Please enter a valid email address' };
      }
    }

    if (component.fieldType === 'phone') {
      if (!validatePhone(value)) {
        return { valid: false, error: 'Please enter a valid phone number' };
      }
    }
  }

  // Custom field validations
  if (component.type === 'custom-field') {
    if (component.inputType === 'number') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        return { valid: false, error: 'Please enter a valid number' };
      }

      if (component.min !== undefined && numValue < component.min) {
        return { valid: false, error: `Value must be at least ${component.min}` };
      }

      if (component.max !== undefined && numValue > component.max) {
        return { valid: false, error: `Value must be at most ${component.max}` };
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Validates all fields on a page
 */
export function validatePage(page, responses) {
  const errors = {};
  let isValid = true;

  // Preset pages don't need validation (handled differently)
  if (page.type.startsWith('preset-')) {
    return { isValid: true, errors: {} };
  }

  // Validate each component
  for (const component of page.components) {
    const value = responses[component.id];
    const validation = validateField(component, value);

    if (!validation.valid) {
      errors[component.id] = validation.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates preset service selection
 */
export function validateServiceSelection(selectedServiceId, services) {
  if (!selectedServiceId) {
    return { valid: false, error: 'Please select a service' };
  }

  const service = services.find((s) => s.id === selectedServiceId);
  if (!service) {
    return { valid: false, error: 'Selected service not found' };
  }

  return { valid: true, error: null };
}

/**
 * Validates preset staff selection
 */
export function validateStaffSelection(selectedStaffId, staff) {
  if (!selectedStaffId) {
    return { valid: false, error: 'Please select a staff member' };
  }

  // "any" is always valid
  if (selectedStaffId === 'any') {
    return { valid: true, error: null };
  }

  const staffMember = staff.find((s) => s.id === selectedStaffId);
  if (!staffMember) {
    return { valid: false, error: 'Selected staff member not found' };
  }

  return { valid: true, error: null };
}

/**
 * Validates datetime selection
 */
export function validateDateTimeSelection(selectedDateTime) {
  if (!selectedDateTime) {
    return { valid: false, error: 'Please select a date and time' };
  }

  if (!selectedDateTime.date || !selectedDateTime.time) {
    return { valid: false, error: 'Please select both date and time' };
  }

  return { valid: true, error: null };
}
