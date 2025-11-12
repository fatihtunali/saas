import { z } from 'zod';

export const vehicleCompanySchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name is too long'),
  contact_person: z.string().max(255, 'Contact person name is too long').optional(),
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
  is_active: z.boolean().default(true),
});

export type VehicleCompanyFormData = z.infer<typeof vehicleCompanySchema>;

export const defaultVehicleCompanyValues: Partial<VehicleCompanyFormData> = {
  company_name: '',
  contact_person: '',
  phone: '',
  email: '',
  is_active: true,
};
