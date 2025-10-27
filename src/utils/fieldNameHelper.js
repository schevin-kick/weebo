// Utility functions for field name generation and validation

/**
 * Generates a field name from a label by converting to lowercase,
 * replacing spaces/special chars with hyphens, and limiting to alphanumeric + hyphens
 * @param {string} label - The display label
 * @returns {string} - Hyphenated field name
 */
export function generateFieldName(label) {
  if (!label) return '';

  return label
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit to 20 characters
    .slice(0, 20);
}

/**
 * Validates a field name
 * @param {string} name - The field name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function validateFieldName(name) {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Field name is required' };
  }

  if (name.length > 20) {
    return { isValid: false, error: 'Field name must be 20 characters or less' };
  }

  // Only lowercase letters, numbers, and hyphens allowed
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(name)) {
    return {
      isValid: false,
      error: 'Field name can only contain lowercase letters, numbers, and hyphens'
    };
  }

  // Cannot start or end with hyphen
  if (name.startsWith('-') || name.endsWith('-')) {
    return { isValid: false, error: 'Field name cannot start or end with a hyphen' };
  }

  return { isValid: true, error: null };
}

/**
 * Generates a unique ID using crypto API or fallback
 * @returns {string} - Unique identifier
 */
export function generateId() {
  // Use crypto.randomUUID if available (modern browsers/Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate a random ID using timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if a field name is unique within a list of components
 * @param {string} fieldName - The field name to check
 * @param {Array} components - Array of components to check against
 * @param {string} excludeId - Optional component ID to exclude from check (for updates)
 * @returns {boolean} - True if unique, false otherwise
 */
export function isFieldNameUnique(fieldName, components, excludeId = null) {
  return !components.some(
    component =>
      component.id !== excludeId &&
      component.fieldName === fieldName
  );
}
