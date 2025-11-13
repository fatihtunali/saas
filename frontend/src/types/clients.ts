export interface Operator {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  baseCurrency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface B2BClient {
  id: number;
  operatorId: number;
  partnerOperatorId: number | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiryDate: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  dietaryRequirements: string | null;
  accessibilityNeeds: string | null;
  medicalConditions: string | null;
  specialNotes: string | null;
  paymentTerms: string | null;
  creditLimit: number | null;
  creditUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  partnerCompanyName?: string;
}

export interface B2CClient {
  id: number;
  operatorId: number;
  clientType: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiryDate: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  dietaryRequirements: string | null;
  accessibilityNeeds: string | null;
  medicalConditions: string | null;
  specialNotes: string | null;
  paymentTerms: string | null;
  creditLimit: number | null;
  creditUsed: number;
  passportAlertSent: boolean | null;
  passportAlertDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// DTOs for API operations - these will be transformed to snake_case by the interceptor
export interface CreateOperatorDto {
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  baseCurrency?: string;
  isActive?: boolean;
}

export interface UpdateOperatorDto extends Partial<CreateOperatorDto> {}

export interface CreateB2BClientDto {
  operatorId?: number;
  partnerOperatorId?: number;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  medicalConditions?: string;
  specialNotes?: string;
  paymentTerms?: string;
  creditLimit?: number;
  creditUsed?: number;
  isActive?: boolean;
}

export interface UpdateB2BClientDto extends Partial<CreateB2BClientDto> {}

export interface CreateB2CClientDto {
  operatorId?: number;
  clientType?: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  medicalConditions?: string;
  specialNotes?: string;
  paymentTerms?: string;
  creditLimit?: number;
  creditUsed?: number;
  isActive?: boolean;
}

export interface UpdateB2CClientDto extends Partial<CreateB2CClientDto> {}
