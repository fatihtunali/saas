import { z } from 'zod';

export const VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Van',
  'Minibus',
  'Bus',
  'Luxury Sedan',
  'Luxury SUV',
  'Sprinter',
  'Coach Bus',
];

export const vehicleTypeSchema = z.object({
  vehicle_company_id: z.number().int().positive('Vehicle company is required'),
  vehicle_type: z
    .string()
    .min(2, 'Vehicle type must be at least 2 characters')
    .max(100, 'Vehicle type is too long'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  luggage_capacity: z.number().int().min(0, 'Luggage capacity must be positive').optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type VehicleTypeFormData = z.infer<typeof vehicleTypeSchema>;

export const defaultVehicleTypeValues: Partial<VehicleTypeFormData> = {
  vehicle_type: '',
  notes: '',
  is_active: true,
};
