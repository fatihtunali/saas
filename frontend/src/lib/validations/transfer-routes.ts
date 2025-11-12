import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export const transferRouteSchema = z.object({
  vehicle_company_id: z.number().int().positive('Vehicle company is required'),
  vehicle_type_id: z.number().int().positive().optional(),
  from_city_id: z.number().int().positive('From city is required'),
  to_city_id: z.number().int().positive('To city is required'),
  price_per_vehicle: z.number().min(0, 'Price must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('TRY'),
  duration_hours: z.number().min(0, 'Duration must be positive').optional(),
  distance_km: z.number().int().min(0, 'Distance must be positive').optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type TransferRouteFormData = z.infer<typeof transferRouteSchema>;

export const defaultTransferRouteValues: Partial<TransferRouteFormData> = {
  currency: 'TRY',
  notes: '',
  is_active: true,
};
