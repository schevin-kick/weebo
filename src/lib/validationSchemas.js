import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Time format validation (HH:MM)
const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

// Business validation
export const businessNameSchema = z
  .string()
  .min(3, 'Business name must be at least 3 characters')
  .max(100, 'Business name must be at most 100 characters');

export const businessHoursSchema = z.object({
  mode: z.enum(['24/7', 'same-daily', 'custom']),
  sameDaily: z.object({
    open: timeSchema,
    close: timeSchema,
  }),
  custom: z.object({
    mon: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    tue: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    wed: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    thu: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    fri: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    sat: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
    sun: z.object({ open: timeSchema, close: timeSchema, closed: z.boolean() }),
  }),
});

// Service validation
export const serviceSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must be at most 100 characters'),
  duration: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration must be at most 480 minutes (8 hours)'),
  description: z
    .string()
    .max(100, 'Description must be at most 100 characters')
    .optional()
    .or(z.literal('')),
  price: z.number().positive('Price must be positive').optional(),
});

// Workflow component validation
export const greetingConfigSchema = z.object({
  message: z
    .string()
    .min(1, 'Greeting message is required')
    .max(500, 'Message is too long'),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const userInputConfigSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(200, 'Question is too long'),
  fieldLabel: z
    .string()
    .min(1, 'Field label is required')
    .max(50, 'Label is too long'),
  dataType: z.enum(['text', 'email', 'phone', 'number']),
  required: z.boolean().default(true),
});

export const bookingMenuConfigSchema = z.object({
  // No config needed - pre-defined
});

export const serviceListConfigSchema = z.object({
  displayStyle: z.enum(['carousel', 'list']),
  showPricing: z.boolean().default(true),
});

export const staffSelectorConfigSchema = z.object({
  enabled: z.boolean().default(false),
  staff: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().min(1, 'Staff name is required'),
        photoUrl: z.string().url().optional().or(z.literal('')),
      })
    )
    .optional(),
});

export const availabilityConfigSchema = z.object({
  bufferMinutes: z.enum([0, 5, 10, 15]).default(0),
  advanceBookingDays: z
    .number()
    .min(1, 'Must allow booking at least 1 day ahead')
    .max(30, 'Cannot book more than 30 days ahead')
    .default(7),
});

export const workflowComponentSchema = z.object({
  id: z.union([z.number(), z.string()]),
  type: z.enum([
    'greeting',
    'user-input',
    'booking-menu',
    'service-list',
    'staff-selector',
    'availability',
  ]),
  order: z.number().min(0),
  config: z.union([
    greetingConfigSchema,
    userInputConfigSchema,
    bookingMenuConfigSchema,
    serviceListConfigSchema,
    staffSelectorConfigSchema,
    availabilityConfigSchema,
  ]),
});

// Full wizard validation
export const wizardStep1Schema = z.object({
  businessName: businessNameSchema,
  businessHours: businessHoursSchema,
  appointmentOnly: z.boolean(),
});

export const wizardStep2Schema = z.object({
  services: z.array(serviceSchema),
});

export const wizardStep3Schema = z.object({
  workflowComponents: z
    .array(workflowComponentSchema)
    .min(1, 'At least one workflow component is required')
    .max(20, 'Maximum 20 workflow components allowed'),
});

// Email and phone validation helpers
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number'
  );

// Sanitization function using DOMPurify
export const sanitizeUserInput = (input, type = 'text') => {
  if (!input) return '';

  // Use DOMPurify to remove all HTML and scripts
  // ALLOWED_TAGS: [] means strip all HTML tags
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true, // Keep text content
  });

  // Trim whitespace
  sanitized = sanitized.trim();

  // Type-specific sanitization
  switch (type) {
    case 'email':
      // Convert to lowercase and validate basic email format
      sanitized = sanitized.toLowerCase();
      // Remove any characters that aren't valid in emails
      sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
      break;
    case 'phone':
      // Keep only numbers, +, -, (), and spaces
      sanitized = sanitized.replace(/[^0-9+\-() ]/g, '');
      break;
    case 'number':
      // Keep only numbers, decimal point, and minus sign
      sanitized = sanitized.replace(/[^0-9.-]/g, '');
      break;
    case 'text':
    default:
      // For text, limit length to prevent abuse
      if (sanitized.length > 1000) {
        sanitized = sanitized.substring(0, 1000);
      }
      break;
  }

  return sanitized;
};

// Auto-detect data type from question text
export const detectDataType = (question) => {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes('email') ||
    lowerQuestion.includes('e-mail') ||
    lowerQuestion.includes('@')
  ) {
    return 'email';
  }

  if (
    lowerQuestion.includes('phone') ||
    lowerQuestion.includes('mobile') ||
    lowerQuestion.includes('contact number') ||
    lowerQuestion.includes('tel')
  ) {
    return 'phone';
  }

  if (
    lowerQuestion.includes('age') ||
    lowerQuestion.includes('how many') ||
    lowerQuestion.includes('number of')
  ) {
    return 'number';
  }

  return 'text';
};
