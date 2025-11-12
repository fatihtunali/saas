/**
 * Commissions Validation Schemas
 */

import { z } from 'zod';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export const COMMISSION_TYPES = [
  { value: 'sales_commission', label: 'Sales Commission' },
  { value: 'partner_commission', label: 'Partner Commission' },
  { value: 'agent_commission', label: 'Agent Commission' },
] as const;
export const COMMISSION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
] as const;

export const commissionSchema = z
  .object({
    booking_id: z.number().int().positive('Booking is required'),
    user_id: z.number().int().positive('Invalid user ID').nullable().optional(),
    partner_operator_id: z
      .number()
      .int()
      .positive('Invalid partner operator ID')
      .nullable()
      .optional(),
    commission_type: z.enum(['sales_commission', 'partner_commission', 'agent_commission']),
    commission_base_amount: z.number().positive('Base amount must be greater than 0'),
    commission_percentage: z
      .number()
      .min(0, 'Percentage must be at least 0')
      .max(100, 'Percentage cannot exceed 100'),
    commission_amount: z.number().min(0, 'Commission amount must be positive').optional(),
    currency: z.enum(CURRENCIES),
    status: z.enum(['pending', 'approved', 'paid']),
    due_date: z.string().nullable().optional(),
    paid_date: z.string().nullable().optional(),
    notes: z.string().max(2000, 'Notes are too long').nullable().optional(),
  })
  .refine(data => data.user_id || data.partner_operator_id, {
    message: 'Either user or partner operator must be selected',
    path: ['user_id'],
  });

export type CommissionFormData = z.infer<typeof commissionSchema>;

export const defaultCommissionValues: Partial<CommissionFormData> = {
  booking_id: undefined,
  user_id: null,
  partner_operator_id: null,
  commission_type: 'sales_commission',
  commission_base_amount: 0,
  commission_percentage: 0,
  commission_amount: 0,
  currency: 'TRY',
  status: 'pending',
  due_date: null,
  paid_date: null,
  notes: '',
};
