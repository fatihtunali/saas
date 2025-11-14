import { z } from 'zod';

export const CURRENCIES = ['EUR', 'USD', 'TRY', 'GBP'];

export const TOUR_TYPES = [
  'City Tour',
  'Historical Tour',
  'Nature Tour',
  'Adventure Tour',
  'Cultural Tour',
  'Food Tour',
  'Photography Tour',
  'Religious Tour',
  'Multi-Day Tour',
  'Private Tour',
  'Group Tour (SIC)',
];

export const tourCompanySchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name is too long'),
  tour_name: z.string().max(255, 'Tour name is too long').optional(),
  tour_type: z.string().max(50, 'Tour type is too long').optional(),
  duration_days: z.number().int().min(0, 'Days must be positive').optional(),
  duration_hours: z.number().int().min(0, 'Hours must be positive').optional(),
  sic_price: z.number().min(0, 'Price must be positive').optional(),
  pvt_price_2_pax: z.number().min(0, 'Price must be positive').optional(),
  pvt_price_4_pax: z.number().min(0, 'Price must be positive').optional(),
  pvt_price_6_pax: z.number().min(0, 'Price must be positive').optional(),
  pvt_price_8_pax: z.number().min(0, 'Price must be positive').optional(),
  pvt_price_10_pax: z.number().min(0, 'Price must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('EUR'),
  min_passengers: z.number().int().min(1, 'Min passengers must be at least 1').optional(),
  max_passengers: z.number().int().min(1, 'Max passengers must be at least 1').optional(),
  itinerary: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  picture_url: z
    .string()
    .url('Invalid image URL')
    .max(500, 'Image URL is too long')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type TourCompanyFormData = z.infer<typeof tourCompanySchema>;

export const defaultTourCompanyValues: Partial<TourCompanyFormData> = {
  supplier_id: undefined,
  company_name: '',
  tour_name: '',
  tour_type: '',
  duration_days: undefined,
  duration_hours: undefined,
  sic_price: undefined,
  pvt_price_2_pax: undefined,
  pvt_price_4_pax: undefined,
  pvt_price_6_pax: undefined,
  pvt_price_8_pax: undefined,
  pvt_price_10_pax: undefined,
  currency: 'EUR',
  min_passengers: undefined,
  max_passengers: undefined,
  itinerary: '',
  inclusions: '',
  exclusions: '',
  picture_url: '',
  notes: '',
  is_active: true,
};
