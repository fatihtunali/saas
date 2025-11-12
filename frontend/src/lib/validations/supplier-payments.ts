/**
 * Supplier Payments Validation Schemas
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
export const SUPPLIER_PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const supplierPaymentSchema = z.object({
  booking_id: z.number().int().positive('Booking is required'),
  booking_service_id: z
    .number()
    .int()
    .positive('Booking service ID is invalid')
    .nullable()
    .optional(),
  supplier_id: z.number().int().positive('Supplier is required'),
  payment_date: z.string().nullable().optional(),
  due_date: z.string().min(1, 'Due date is required'),
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
  status: z.enum(['pending', 'scheduled', 'paid', 'overdue', 'cancelled']),
  notes: z.string().max(2000, 'Notes are too long').nullable().optional(),
  paid_by: z.string().max(255, 'Paid by is too long').nullable().optional(),
});

export type SupplierPaymentFormData = z.infer<typeof supplierPaymentSchema>;

export const defaultSupplierPaymentValues: Partial<SupplierPaymentFormData> = {
  booking_id: undefined,
  booking_service_id: null,
  supplier_id: undefined,
  payment_date: null,
  due_date: new Date().toISOString().split('T')[0],
  amount: 0,
  currency: 'TRY',
  exchange_rate: 1.0,
  payment_method: 'bank_transfer',
  payment_reference: '',
  bank_account_id: null,
  status: 'pending',
  notes: '',
  paid_by: '',
};
