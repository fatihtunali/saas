import { z } from 'zod';

export const BASE_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export const operatorSchema = z.object({
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name is too long'),
  contact_email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  contact_phone: z
    .string()
    .max(50, 'Phone number is too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional(),
  city: z.string().max(100, 'City is too long').optional(),
  country: z.string().max(100, 'Country is too long').optional(),
  tax_id: z.string().max(100, 'Tax ID is too long').optional(),
  base_currency: z.string().default('TRY'),
  is_active: z.boolean().default(true),
});

export type OperatorFormData = z.infer<typeof operatorSchema>;

export const defaultOperatorValues: Partial<OperatorFormData> = {
  company_name: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  city: '',
  country: '',
  tax_id: '',
  base_currency: 'TRY',
  is_active: true,
};
