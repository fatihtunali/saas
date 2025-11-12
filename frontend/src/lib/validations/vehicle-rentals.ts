import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export const vehicleRentalSchema = z.object({
  vehicle_company_id: z.number().int().positive('Vehicle company is required'),
  vehicle_type_id: z.number().int().positive('Vehicle type is required'),
  full_day_price: z.number().min(0, 'Price must be positive').optional(),
  full_day_hours: z.number().int().min(1, 'Hours must be at least 1').optional(),
  full_day_km: z.number().int().min(0, 'KM must be positive').optional(),
  half_day_price: z.number().min(0, 'Price must be positive').optional(),
  half_day_hours: z.number().int().min(1, 'Hours must be at least 1').optional(),
  half_day_km: z.number().int().min(0, 'KM must be positive').optional(),
  night_rental_price: z.number().min(0, 'Price must be positive').optional(),
  night_rental_hours: z.number().int().min(1, 'Hours must be at least 1').optional(),
  night_rental_km: z.number().int().min(0, 'KM must be positive').optional(),
  extra_hour_rate: z.number().min(0, 'Rate must be positive').optional(),
  extra_km_rate: z.number().min(0, 'Rate must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('TRY'),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type VehicleRentalFormData = z.infer<typeof vehicleRentalSchema>;

export const defaultVehicleRentalValues: Partial<VehicleRentalFormData> = {
  currency: 'TRY',
  notes: '',
  is_active: true,
};
