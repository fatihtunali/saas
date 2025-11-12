import { z } from 'zod';

export const CLIENT_TYPES = [
  'Individual',
  'Family',
  'Group',
  'Corporate',
  'VIP',
  'Student',
  'Senior',
  'Other',
];

export const b2cClientSchema = z.object({
  client_type: z.string().max(50, 'Client type is too long').optional(),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long'),
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
  birth_date: z.string().optional(),
  nationality: z.string().max(100, 'Nationality is too long').optional(),
  passport_number: z.string().max(100, 'Passport number is too long').optional(),
  passport_expiry_date: z.string().optional(),
  address: z.string().max(500, 'Address is too long').optional(),
  city: z.string().max(100, 'City is too long').optional(),
  country: z.string().max(100, 'Country is too long').optional(),
  emergency_contact_name: z.string().max(255, 'Emergency contact name is too long').optional(),
  emergency_contact_phone: z.string().max(50, 'Emergency contact phone is too long').optional(),
  dietary_requirements: z.string().optional(),
  accessibility_needs: z.string().optional(),
  medical_conditions: z.string().optional(),
  special_notes: z.string().optional(),
  payment_terms: z.string().optional(),
  credit_limit: z.number().min(0, 'Credit limit must be positive').optional(),
  credit_used: z.number().min(0, 'Credit used must be positive').default(0),
  is_active: z.boolean().default(true),
});

export type B2CClientFormData = z.infer<typeof b2cClientSchema>;

export const defaultB2CClientValues: Partial<B2CClientFormData> = {
  client_type: '',
  full_name: '',
  email: '',
  phone: '',
  birth_date: '',
  nationality: '',
  passport_number: '',
  passport_expiry_date: '',
  address: '',
  city: '',
  country: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  dietary_requirements: '',
  accessibility_needs: '',
  medical_conditions: '',
  special_notes: '',
  payment_terms: '',
  credit_limit: undefined,
  credit_used: 0,
  is_active: true,
};
