import { z } from 'zod';
import type { QuotationStatus, QuotationServiceType } from '@/types/quotations';

// Quotation status values (matches database constraint)
export const quotationStatuses: QuotationStatus[] = [
  'draft',
  'sent',
  'viewed',
  'accepted',
  'rejected',
  'expired',
];

// Quotation status options for select dropdowns
export const quotationStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
] as const;

// Service types
export const serviceTypes: QuotationServiceType[] = [
  'hotel',
  'guide',
  'restaurant',
  'entrance_fee',
  'extra',
  'vehicle',
  'tour_company',
  'other',
];

// Quotation Form Schema
export const quotationFormSchema = z.object({
  quotation_code: z.string().optional(),
  client_id: z.number().nullable().optional(),
  operators_client_id: z.number().nullable().optional(),
  travel_dates_from: z.string().min(1, 'Start date is required'),
  travel_dates_to: z.string().min(1, 'End date is required'),
  num_passengers: z.number().min(1, 'At least 1 passenger required').optional(),
  total_amount: z.number().min(0).optional(),
  currency: z.string().default('EUR'),
  valid_until: z.string().optional(),
  status: z.enum(quotationStatuses as [QuotationStatus, ...QuotationStatus[]]).default('draft'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
}).refine(
  (data) => !!data.client_id || !!data.operators_client_id,
  {
    message: 'Please select either a B2C or B2B client',
    path: ['client_id'],
  }
);

export type QuotationFormData = z.infer<typeof quotationFormSchema>;

// Quotation Service Form Schema
export const quotationServiceFormSchema = z.object({
  service_type: z.enum(serviceTypes as [QuotationServiceType, ...QuotationServiceType[]]),
  service_description: z.string().optional(),
  quantity: z.number().min(1).optional(),
  unit_price: z.number().min(0).optional(),
  total_price: z.number().min(0).optional(),
  currency: z.string().default('EUR'),
  service_date: z.string().optional(),
});

export type QuotationServiceFormData = z.infer<typeof quotationServiceFormSchema>;

// Default values for forms
export const quotationDefaultValues: Partial<QuotationFormData> = {
  currency: 'EUR',
  status: 'draft',
  num_passengers: 1,
  client_id: null,
  operators_client_id: null,
};

export const quotationServiceDefaultValues: Partial<QuotationServiceFormData> = {
  currency: 'EUR',
  quantity: 1,
};
