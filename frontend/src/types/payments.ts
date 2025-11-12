/**
 * Payments Type Definitions
 *
 * TypeScript interfaces for all payment-related entities matching database schema
 */

// Base Payment Interface
export interface BasePayment {
  id: number;
  operator_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Bank Account Types
export interface BankAccount extends BasePayment {
  account_name: string;
  bank_name: string;
  account_number: string;
  iban: string | null;
  swift_code: string | null;
  currency: string;
  account_type: string;
  is_default: boolean;
  is_active: boolean;
  notes: string | null;
}

export interface CreateBankAccountDto {
  account_name: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency: string;
  account_type: string;
  is_default?: boolean;
  is_active?: boolean;
  notes?: string;
}

export type UpdateBankAccountDto = Partial<CreateBankAccountDto>;

// Client Payment (Receivables) Types
export interface ClientPayment extends BasePayment {
  booking_id: number;
  payment_date: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_in_base_currency: number;
  payment_method: string;
  payment_reference: string | null;
  bank_account_id: number | null;
  status: string;
  notes: string | null;
  received_by: string | null;
  // Relations
  booking?: any;
  bank_account?: BankAccount;
}

export interface CreateClientPaymentDto {
  booking_id: number;
  payment_date: string;
  amount: number;
  currency: string;
  exchange_rate?: number;
  amount_in_base_currency?: number;
  payment_method: string;
  payment_reference?: string;
  bank_account_id?: number;
  status: string;
  notes?: string;
  received_by?: string;
}

export type UpdateClientPaymentDto = Partial<CreateClientPaymentDto>;

// Supplier Payment (Payables) Types
export interface SupplierPayment extends BasePayment {
  booking_id: number;
  booking_service_id: number | null;
  supplier_id: number;
  payment_date: string | null;
  due_date: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_in_base_currency: number;
  payment_method: string;
  payment_reference: string | null;
  bank_account_id: number | null;
  status: string;
  notes: string | null;
  paid_by: string | null;
  // Relations
  booking?: any;
  supplier?: any;
  bank_account?: BankAccount;
}

export interface CreateSupplierPaymentDto {
  booking_id: number;
  booking_service_id?: number;
  supplier_id: number;
  payment_date?: string;
  due_date: string;
  amount: number;
  currency: string;
  exchange_rate?: number;
  amount_in_base_currency?: number;
  payment_method: string;
  payment_reference?: string;
  bank_account_id?: number;
  status: string;
  notes?: string;
  paid_by?: string;
}

export type UpdateSupplierPaymentDto = Partial<CreateSupplierPaymentDto>;

// Refund Types
export interface Refund extends BasePayment {
  booking_id: number;
  client_payment_id: number;
  refund_amount: number;
  currency: string;
  refund_reason: string;
  refund_method: string;
  refund_status: string;
  requested_date: string;
  approved_date: string | null;
  processed_date: string | null;
  approved_by: string | null;
  processed_by: string | null;
  refund_reference: string | null;
  notes: string | null;
  // Relations
  booking?: any;
  client_payment?: ClientPayment;
}

export interface CreateRefundDto {
  booking_id: number;
  client_payment_id: number;
  refund_amount: number;
  currency: string;
  refund_reason: string;
  refund_method: string;
  refund_status: string;
  requested_date: string;
  approved_date?: string;
  processed_date?: string;
  approved_by?: string;
  processed_by?: string;
  refund_reference?: string;
  notes?: string;
}

export type UpdateRefundDto = Partial<CreateRefundDto>;

// Commission Types
export interface Commission extends BasePayment {
  booking_id: number;
  user_id: number | null;
  partner_operator_id: number | null;
  commission_type: string;
  commission_base_amount: number;
  commission_percentage: number;
  commission_amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  // Relations
  booking?: any;
}

export interface CreateCommissionDto {
  booking_id: number;
  user_id?: number;
  partner_operator_id?: number;
  commission_type: string;
  commission_base_amount: number;
  commission_percentage: number;
  commission_amount?: number;
  currency: string;
  status: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
}

export type UpdateCommissionDto = Partial<CreateCommissionDto>;

// Enums and Constants
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
] as const;

export const CLIENT_PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
] as const;

export const SUPPLIER_PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
] as const;

export const REFUND_STATUSES = [
  { value: 'requested', label: 'Requested', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'yellow' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'processed', label: 'Processed', color: 'green' },
] as const;

export const COMMISSION_TYPES = [
  { value: 'sales_commission', label: 'Sales Commission' },
  { value: 'partner_commission', label: 'Partner Commission' },
  { value: 'agent_commission', label: 'Agent Commission' },
] as const;

export const COMMISSION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
] as const;

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit_card', label: 'Credit Card' },
] as const;

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_method?: string;
  currency?: string;
  booking_id?: number;
  supplier_id?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
