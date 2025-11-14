import { z } from 'zod';

export const CURRENCIES = ['EUR', 'USD', 'TRY', 'GBP'];

export const COMMON_LANGUAGES = [
  'English',
  'Turkish',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Russian',
  'Arabic',
  'Chinese',
  'Japanese',
  'Korean',
];

export const guideSchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  guide_name: z
    .string()
    .min(2, 'Guide name must be at least 2 characters')
    .max(255, 'Guide name is too long'),
  phone: z
    .string()
    .max(50, 'Phone number is too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
  languages: z.string().optional(), // JSON string
  daily_rate: z.number().min(0, 'Rate must be positive').optional(),
  half_day_rate: z.number().min(0, 'Rate must be positive').optional(),
  night_rate: z.number().min(0, 'Rate must be positive').optional(),
  transfer_rate: z.number().min(0, 'Rate must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('EUR'),
  specializations: z.string().optional(), // JSON string
  license_number: z.string().max(100, 'License number is too long').optional(),
  profile_picture_url: z
    .string()
    .url('Invalid image URL')
    .max(500, 'Image URL is too long')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type GuideFormData = z.infer<typeof guideSchema>;

export const defaultGuideValues: Partial<GuideFormData> = {
  guide_name: '',
  phone: '',
  email: '',
  languages: '',
  specializations: '',
  license_number: '',
  currency: 'EUR',
  profile_picture_url: '',
  notes: '',
  is_active: true,
};
