import { prisma } from '@/lib/prisma';

/**
 * Extracts contact information (email, phone, name) from booking responses
 * by matching against preset field components in the business's pages.
 *
 * @param {string} businessId - The ID of the business
 * @param {Object} responses - The booking responses object with component IDs as keys
 * @returns {Promise<{email: string|null, phone: string|null, name: string|null}>}
 */
export async function extractContactInfo(businessId, responses) {
  if (!responses || typeof responses !== 'object') {
    return { email: null, phone: null, name: null };
  }

  try {
    // Load business pages configuration
    const pages = await prisma.page.findMany({
      where: { businessId },
      select: { components: true }
    });

    let email = null;
    let phone = null;
    let name = null;

    // Search through all components to find preset contact fields
    for (const page of pages) {
      const components = page.components;

      if (!Array.isArray(components)) continue;

      for (const component of components) {
        // Only process preset-field type components
        if (component.type === 'preset-field') {
          const value = responses[component.id];

          // Skip if no value provided for this component
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            continue;
          }

          // Extract based on field type
          switch (component.fieldType) {
            case 'email':
              if (!email) email = value.trim();
              break;
            case 'phone':
              if (!phone) phone = value.trim();
              break;
            case 'name':
              if (!name) name = value.trim();
              break;
          }
        }
      }
    }

    return { email, phone, name };
  } catch (error) {
    console.error('Error extracting contact info:', error);
    return { email: null, phone: null, name: null };
  }
}

/**
 * Synchronous version that extracts contact info from pre-loaded pages
 * Useful when pages are already loaded to avoid extra database query
 *
 * @param {Array} pages - Array of page objects with components
 * @param {Object} responses - The booking responses object
 * @returns {{email: string|null, phone: string|null, name: string|null}}
 */
export function extractContactInfoFromPages(pages, responses) {
  if (!responses || typeof responses !== 'object' || !Array.isArray(pages)) {
    return { email: null, phone: null, name: null };
  }

  let email = null;
  let phone = null;
  let name = null;

  for (const page of pages) {
    const components = page.components;

    if (!Array.isArray(components)) continue;

    for (const component of components) {
      if (component.type === 'preset-field') {
        const value = responses[component.id];

        if (!value || (typeof value === 'string' && value.trim() === '')) {
          continue;
        }

        switch (component.fieldType) {
          case 'email':
            if (!email) email = value.trim();
            break;
          case 'phone':
            if (!phone) phone = value.trim();
            break;
          case 'name':
            if (!name) name = value.trim();
            break;
        }
      }
    }
  }

  return { email, phone, name };
}
