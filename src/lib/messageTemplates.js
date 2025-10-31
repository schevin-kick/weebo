/**
 * LINE Message Templates
 * Provides default message templates and template merging logic
 */

/**
 * Default message templates (English)
 */
export const DEFAULT_TEMPLATES = {
  confirmation: {
    header: 'Your booking is confirmed!',
    body: 'We look forward to seeing you!',
  },
  cancellation: {
    header: 'Booking Cancelled',
    body: 'Your booking has been cancelled. We hope to see you again soon!',
  },
  reminder: {
    header: 'Reminder: Upcoming Appointment',
    body: "Don't forget your appointment tomorrow!",
  },
};

/**
 * Get message template for a specific type
 * Merges custom templates with defaults
 *
 * @param {object} business - Business object with messageTemplates JSON field
 * @param {string} type - Template type: 'confirmation' | 'cancellation' | 'reminder'
 * @returns {object} Template with header and body { header: string, body: string }
 */
export function getMessageTemplate(business, type) {
  // Parse custom templates from business
  let customTemplates = {};
  if (business?.messageTemplates) {
    try {
      customTemplates = typeof business.messageTemplates === 'string'
        ? JSON.parse(business.messageTemplates)
        : business.messageTemplates;
    } catch (error) {
      console.warn('Failed to parse messageTemplates, using defaults:', error);
    }
  }

  // Get template for this type (custom or default)
  const template = customTemplates[type] || DEFAULT_TEMPLATES[type] || DEFAULT_TEMPLATES.confirmation;

  return {
    header: template.header || DEFAULT_TEMPLATES[type]?.header || '',
    body: template.body || DEFAULT_TEMPLATES[type]?.body || '',
  };
}

/**
 * Replace template variables with actual values
 *
 * @param {string} text - Template text with variables like {{businessName}}
 * @param {object} variables - Variable values to substitute
 * @returns {string} Text with variables replaced
 */
export function replaceTemplateVariables(text, variables) {
  if (!text) return '';

  let result = text;

  Object.keys(variables).forEach((key) => {
    const value = variables[key] || '';
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Get available template variables for messages
 * @returns {object} Object describing available variables
 */
export function getAvailableVariables() {
  return {
    businessName: 'Business name',
    serviceName: 'Service name',
    staffName: 'Staff member name',
    dateTime: 'Appointment date and time',
    duration: 'Appointment duration',
    customerName: 'Customer display name',
  };
}

/**
 * Validate message template structure
 * @param {object} templates - Templates object to validate
 * @returns {object} Validation result { valid: boolean, errors: string[] }
 */
export function validateTemplates(templates) {
  const errors = [];
  const requiredTypes = ['confirmation', 'cancellation', 'reminder'];

  requiredTypes.forEach((type) => {
    if (!templates[type]) {
      errors.push(`Missing template type: ${type}`);
      return;
    }

    const template = templates[type];

    if (!template.header || typeof template.header !== 'string') {
      errors.push(`${type}: header is required and must be a string`);
    }

    if (!template.body || typeof template.body !== 'string') {
      errors.push(`${type}: body is required and must be a string`);
    }

    // Check character limits
    if (template.header && template.header.length > 100) {
      errors.push(`${type}: header exceeds 100 characters`);
    }

    if (template.body && template.body.length > 500) {
      errors.push(`${type}: body exceeds 500 characters`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  DEFAULT_TEMPLATES,
  getMessageTemplate,
  replaceTemplateVariables,
  getAvailableVariables,
  validateTemplates,
};
