/**
 * Client Payments Validation Schemas
 *
 * Zod validation schemas for client payment (receivables) management
 */

import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
] as const;

export const CLIENT_PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const;

/**
 * Client Payment validation schema
 */
export const clientPaymentSchema = z.object({
  booking_id: z.number().int().positive('Booking is required'),

  payment_date: z.string().min(1, 'Payment date is required'),

  amount: z.number().positive('Amount must be greater than 0'),

  currency: z.enum(CURRENCIES),

  exchange_rate: z.number().positive('Exchange rate must be positive').default(1.0),

  amount_in_base_currency: z
    .number()
    .positive('Amount in base currency must be positive')
    .optional(),

  payment_method: z.enum(['cash', 'credit_card', 'bank_transfer', 'check', 'other']),

  payment_reference: z.string().max(100, 'Payment reference is too long').nullable().optional(),

  bank_account_id: z.number().int().positive('Invalid bank account').nullable().optional(),

  status: z.enum(['pending', 'completed', 'failed', 'refunded']),

  notes: z.string().max(2000, 'Notes are too long').nullable().optional(),

  received_by: z.string().max(255, 'Received by is too long').nullable().optional(),
});

/**
 * Type for client payment form data
 */
export type ClientPaymentFormData = z.infer<typeof clientPaymentSchema>;

/**
 * Default values for new client payment form
 */
export const defaultClientPaymentValues: Partial<ClientPaymentFormData> = {
  booking_id: undefined,
  payment_date: new Date().toISOString().split('T')[0],
  amount: 0,
  currency: 'TRY',
  exchange_rate: 1.0,
  payment_method: 'cash',
  payment_reference: '',
  bank_account_id: null,
  status: 'completed',
  notes: '',
  received_by: '',
};
