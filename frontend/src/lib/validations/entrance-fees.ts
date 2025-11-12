import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export const entranceFeeSchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  site_name: z
    .string()
    .min(2, 'Site name must be at least 2 characters')
    .max(255, 'Site name is too long'),
  city_id: z.number().int().positive('City is required'),
  adult_price: z.number().min(0, 'Price must be positive').optional(),
  child_price: z.number().min(0, 'Price must be positive').optional(),
  student_price: z.number().min(0, 'Price must be positive').optional(),
  senior_price: z.number().min(0, 'Price must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('TRY'),
  opening_hours: z.string().max(255, 'Opening hours text is too long').optional(),
  best_visit_time: z.string().max(255, 'Best visit time text is too long').optional(),
  picture_url: z
    .string()
    .url('Invalid image URL')
    .max(500, 'Image URL is too long')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type EntranceFeeFormData = z.infer<typeof entranceFeeSchema>;

export const defaultEntranceFeeValues: Partial<EntranceFeeFormData> = {
  site_name: '',
  opening_hours: '',
  best_visit_time: '',
  currency: 'TRY',
  picture_url: '',
  notes: '',
  is_active: true,
};
