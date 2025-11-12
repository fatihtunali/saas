/**
 * Hotels Validation Schemas
 *
 * Zod validation schemas for hotel management matching the actual database schema.
 *
 * @module lib/validations/hotels
 */

import { z } from 'zod';

/**
 * Meal plan options
 */
export const MEAL_PLANS = [
  { value: 'BB', label: 'BB - Bed & Breakfast' },
  { value: 'HB', label: 'HB - Half Board' },
  { value: 'FB', label: 'FB - Full Board' },
  { value: 'AI', label: 'AI - All Inclusive' },
  { value: 'UAI', label: 'UAI - Ultra All Inclusive' },
  { value: 'RO', label: 'RO - Room Only' },
] as const;

/**
 * Star rating options
 */
export const STAR_RATINGS = [
  { value: 1, label: '1 Star' },
  { value: 2, label: '2 Stars' },
  { value: 3, label: '3 Stars' },
  { value: 4, label: '4 Stars' },
  { value: 5, label: '5 Stars' },
] as const;

/**
 * Default currency options
 */
export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

/**
 * Hotel validation schema matching actual database schema
 */
export const hotelSchema = z.object({
  // Basic Information
  hotel_name: z
    .string()
    .min(2, 'Hotel name must be at least 2 characters')
    .max(255, 'Hotel name is too long'),

  supplier_id: z.number().int().positive('Invalid supplier ID').nullable().optional(),

  star_rating: z
    .number()
    .int()
    .min(1, 'Star rating must be between 1 and 5')
    .max(5, 'Star rating must be between 1 and 5')
    .nullable()
    .optional(),

  // Location
  city_id: z.number().int().positive('City is required'),

  address: z.string().max(500, 'Address is too long').nullable().optional(),

  // Contact Information
  phone: z
    .string()
    .max(50, 'Phone number is too long')
    .nullable()
    .optional()
    .refine(
      val => {
        if (!val) return true;
        // Remove common phone number characters for validation
        const cleaned = val.replace(/[\s\-\(\)\+]/g, '');
        return /^\d{7,15}$/.test(cleaned);
      },
      { message: 'Invalid phone number format' }
    ),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .nullable()
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Invalid website URL')
    .max(255, 'Website URL is too long')
    .nullable()
    .optional()
    .or(z.literal('')),

  // Pricing - Per Person Rates
  price_per_person_double: z.number().min(0, 'Price must be positive').nullable().optional(),

  single_supplement: z.number().min(0, 'Single supplement must be positive').nullable().optional(),

  price_per_person_triple: z.number().min(0, 'Price must be positive').nullable().optional(),

  // Child Pricing by Age Groups
  child_price_0_2: z.number().min(0, 'Child price must be positive').nullable().optional(),

  child_price_3_5: z.number().min(0, 'Child price must be positive').nullable().optional(),

  child_price_6_11: z.number().min(0, 'Child price must be positive').nullable().optional(),

  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .nullable()
    .optional()
    .default('TRY'),

  // Meal Plan
  meal_plan: z.string().max(100, 'Meal plan is too long').nullable().optional(),

  meal_plan_supplement: z
    .number()
    .min(0, 'Meal plan supplement must be positive')
    .nullable()
    .optional(),

  // Additional Information
  facilities: z.string().max(2000, 'Facilities description is too long').nullable().optional(),

  picture_url: z
    .string()
    .url('Invalid image URL')
    .max(500, 'Image URL is too long')
    .nullable()
    .optional()
    .or(z.literal('')),

  notes: z.string().max(2000, 'Notes are too long').nullable().optional(),

  is_active: z.boolean().default(true),
});

/**
 * Type for hotel form data
 */
export type HotelFormData = z.infer<typeof hotelSchema>;

/**
 * Default values for new hotel form
 */
export const defaultHotelValues: Partial<HotelFormData> = {
  hotel_name: '',
  supplier_id: null,
  star_rating: null,
  city_id: undefined,
  address: '',
  phone: '',
  email: '',
  website: '',
  price_per_person_double: null,
  single_supplement: null,
  price_per_person_triple: null,
  child_price_0_2: null,
  child_price_3_5: null,
  child_price_6_11: null,
  currency: 'TRY',
  meal_plan: '',
  meal_plan_supplement: null,
  facilities: '',
  picture_url: '',
  notes: '',
  is_active: true,
};

/**
 * Schema for hotel search/filter
 */
export const hotelFilterSchema = z.object({
  search: z.string().optional(),
  city_id: z.number().int().positive().optional(),
  star_rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  meal_plan: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
});

export type HotelFilterData = z.infer<typeof hotelFilterSchema>;
