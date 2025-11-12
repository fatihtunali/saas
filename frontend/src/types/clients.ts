export interface Operator {
  id: number;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  base_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface B2BClient {
  id: number;
  operator_id: number;
  partner_operator_id: number | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  medical_conditions: string | null;
  special_notes: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  credit_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  partner_company_name?: string;
}

export interface B2CClient {
  id: number;
  operator_id: number;
  client_type: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  medical_conditions: string | null;
  special_notes: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  credit_used: number;
  passport_alert_sent: boolean | null;
  passport_alert_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// DTOs for API operations
export interface CreateOperatorDto {
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  base_currency?: string;
  is_active?: boolean;
}

export interface UpdateOperatorDto extends Partial<CreateOperatorDto> {}

export interface CreateB2BClientDto {
  operator_id?: number;
  partner_operator_id?: number;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  address?: string;
  city?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  medical_conditions?: string;
  special_notes?: string;
  payment_terms?: string;
  credit_limit?: number;
  credit_used?: number;
  is_active?: boolean;
}

export interface UpdateB2BClientDto extends Partial<CreateB2BClientDto> {}

export interface CreateB2CClientDto {
  operator_id?: number;
  client_type?: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  address?: string;
  city?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  medical_conditions?: string;
  special_notes?: string;
  payment_terms?: string;
  credit_limit?: number;
  credit_used?: number;
  is_active?: boolean;
}

export interface UpdateB2CClientDto extends Partial<CreateB2CClientDto> {}
