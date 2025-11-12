import { z } from 'zod';

export const SUPPLIER_TYPES = [
  'Hotel',
  'Restaurant',
  'Guide',
  'Vehicle Company',
  'Tour Company',
  'Activity Provider',
  'Equipment Rental',
  'Insurance Provider',
  'Other',
];

export const supplierSchema = z.object({
  supplier_type: z
    .string()
    .min(2, 'Supplier type is required')
    .max(100, 'Supplier type is too long'),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name is too long'),
  contact_person: z.string().max(255, 'Contact person name is too long').optional(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(50, 'Phone number is too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional(),
  city_id: z.number().int().positive().optional(),
  tax_id: z.string().max(100, 'Tax ID is too long').optional(),
  payment_terms: z.string().optional(),
  bank_account_info: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

export const defaultSupplierValues: Partial<SupplierFormData> = {
  supplier_type: '',
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city_id: undefined,
  tax_id: '',
  payment_terms: '',
  bank_account_info: '',
  notes: '',
  is_active: true,
};
