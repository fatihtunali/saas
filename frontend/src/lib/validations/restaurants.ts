import { z } from 'zod';

export const CURRENCIES = ['EUR', 'USD', 'TRY', 'GBP'];

export const CUISINE_TYPES = [
  'Turkish',
  'Mediterranean',
  'Italian',
  'Asian',
  'Chinese',
  'Japanese',
  'Indian',
  'French',
  'International',
  'Seafood',
  'Steakhouse',
  'Vegetarian',
  'Vegan',
  'Fast Food',
];

export const restaurantSchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  restaurant_name: z
    .string()
    .min(2, 'Restaurant name must be at least 2 characters')
    .max(255, 'Restaurant name is too long'),
  city_id: z.number().int().positive('City is required'),
  address: z.string().max(500, 'Address is too long').optional(),
  phone: z
    .string()
    .max(50, 'Phone number is too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  lunch_price: z.number().min(0, 'Price must be positive').optional(),
  dinner_price: z.number().min(0, 'Price must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('EUR'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  cuisine_type: z.string().optional(), // JSON string
  menu_options: z.string().optional(),
  picture_url: z
    .string()
    .url('Invalid image URL')
    .max(500, 'Image URL is too long')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

export const defaultRestaurantValues: Partial<RestaurantFormData> = {
  restaurant_name: '',
  address: '',
  phone: '',
  cuisine_type: '',
  menu_options: '',
  currency: 'EUR',
  picture_url: '',
  notes: '',
  is_active: true,
};
