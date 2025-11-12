/**
 * Bank Accounts Validation Schemas
 *
 * Zod validation schemas for bank account management
 */

import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit_card', label: 'Credit Card' },
] as const;

/**
 * Bank Account validation schema
 */
export const bankAccountSchema = z.object({
  account_name: z
    .string()
    .min(2, 'Account name must be at least 2 characters')
    .max(255, 'Account name is too long'),

  bank_name: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(255, 'Bank name is too long'),

  account_number: z
    .string()
    .min(1, 'Account number is required')
    .max(50, 'Account number is too long'),

  iban: z.string().max(50, 'IBAN is too long').nullable().optional(),

  swift_code: z.string().max(20, 'SWIFT code is too long').nullable().optional(),

  currency: z.enum(CURRENCIES).refine(val => CURRENCIES.includes(val), {
    message: 'Please select a valid currency',
  }),

  account_type: z.enum(['checking', 'savings', 'credit_card']),

  is_default: z.boolean().default(false),

  is_active: z.boolean().default(true),

  notes: z.string().max(2000, 'Notes are too long').nullable().optional(),
});

/**
 * Type for bank account form data
 */
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

/**
 * Default values for new bank account form
 */
export const defaultBankAccountValues: Partial<BankAccountFormData> = {
  account_name: '',
  bank_name: '',
  account_number: '',
  iban: '',
  swift_code: '',
  currency: 'TRY',
  account_type: 'checking',
  is_default: false,
  is_active: true,
  notes: '',
};
