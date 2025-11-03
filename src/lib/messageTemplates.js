/**
 * LINE Message Templates
 * Provides default message templates and template merging logic
 * with localization support
 */

/**
 * Localized default message templates
 */
const LOCALIZED_TEMPLATES = {
  en: {
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
  },
  'zh-tw': {
    confirmation: {
      header: '您的預約已確認！',
      body: '我們期待見到您！',
    },
    cancellation: {
      header: '預約已取消',
      body: '您的預約已被取消。我們希望很快再見到您！',
    },
    reminder: {
      header: '提醒：即將到來的預約',
      body: '別忘了您明天的預約！',
    },
  },
};

/**
 * Default templates (English) - kept for backward compatibility
 */
export const DEFAULT_TEMPLATES = LOCALIZED_TEMPLATES.en;

/**
 * Get localized default templates
 * @param {string} locale - Locale code ('en' or 'zh-tw')
 * @returns {object} Localized templates
 */
export function getLocalizedTemplates(locale = 'en') {
  return LOCALIZED_TEMPLATES[locale] || LOCALIZED_TEMPLATES.en;
}

/**
 * Get message template for a specific type with localization
 * Merges custom templates with localized defaults
 *
 * @param {object} business - Business object with messageTemplates JSON field
 * @param {string} type - Template type: 'confirmation' | 'cancellation' | 'reminder'
 * @param {string} locale - Locale code ('en' or 'zh-tw'), defaults to 'en'
 * @returns {object} Template with header and body { header: string, body: string }
 */
export function getMessageTemplate(business, type, locale = 'en') {
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

  // Get localized default templates
  const localizedDefaults = getLocalizedTemplates(locale);

  // Get template for this type (custom or localized default)
  const template = customTemplates[type] || localizedDefaults[type] || localizedDefaults.confirmation;

  return {
    header: template.header || localizedDefaults[type]?.header || '',
    body: template.body || localizedDefaults[type]?.body || '',
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
  LOCALIZED_TEMPLATES,
  getLocalizedTemplates,
  getMessageTemplate,
  replaceTemplateVariables,
  getAvailableVariables,
  validateTemplates,
};
