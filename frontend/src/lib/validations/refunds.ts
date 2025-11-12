/**
 * Refunds Validation Schemas
 */

import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export const REFUND_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'original_method', label: 'Original Payment Method' },
] as const;
export const REFUND_STATUSES = [
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processed', label: 'Processed' },
] as const;
export const REFUND_REASONS = [
  { value: 'cancellation', label: 'Booking Cancellation' },
  { value: 'overpayment', label: 'Overpayment' },
  { value: 'service_not_delivered', label: 'Service Not Delivered' },
  { value: 'customer_dissatisfaction', label: 'Customer Dissatisfaction' },
  { value: 'duplicate_payment', label: 'Duplicate Payment' },
  { value: 'other', label: 'Other' },
] as const;

export const refundSchema = z.object({
  booking_id: z.number().int().positive('Booking is required'),
  client_payment_id: z.number().int().positive('Original payment is required'),
  refund_amount: z.number().positive('Refund amount must be greater than 0'),
  currency: z.enum(CURRENCIES),
  refund_reason: z
    .string()
    .min(5, 'Refund reason must be at least 5 characters')
    .max(500, 'Refund reason is too long'),
  refund_method: z.enum(['cash', 'credit_card', 'bank_transfer', 'check', 'original_method']),
  refund_status: z.enum(['requested', 'approved', 'rejected', 'processed']),
  requested_date: z.string().min(1, 'Requested date is required'),
  approved_date: z.string().nullable().optional(),
  processed_date: z.string().nullable().optional(),
  approved_by: z.string().max(255, 'Approved by is too long').nullable().optional(),
  processed_by: z.string().max(255, 'Processed by is too long').nullable().optional(),
  refund_reference: z.string().max(100, 'Refund reference is too long').nullable().optional(),
  notes: z.string().max(2000, 'Notes are too long').nullable().optional(),
});

export type RefundFormData = z.infer<typeof refundSchema>;

export const defaultRefundValues: Partial<RefundFormData> = {
  booking_id: undefined,
  client_payment_id: undefined,
  refund_amount: 0,
  currency: 'TRY',
  refund_reason: '',
  refund_method: 'original_method',
  refund_status: 'requested',
  requested_date: new Date().toISOString().split('T')[0],
  approved_date: null,
  processed_date: null,
  approved_by: '',
  processed_by: '',
  refund_reference: '',
  notes: '',
};
