// Quotation Service Types
export type QuotationServiceType =
  | 'hotel'
  | 'guide'
  | 'restaurant'
  | 'entrance_fee'
  | 'extra'
  | 'vehicle'
  | 'tour_company'
  | 'other';

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired';

// Quotation Service Interface
export interface QuotationService {
  id: number;
  quotationId: number;
  serviceType: QuotationServiceType;
  serviceDescription: string | null;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  currency: string | null;
  serviceDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Quotation Interface
export interface Quotation {
  id: number;
  operatorId: number;
  quotationCode: string | null;
  clientId: number | null;
  operatorsClientId: number | null;
  travelDatesFrom: string;
  travelDatesTo: string;
  numPassengers: number | null;
  totalAmount: number | null;
  currency: string | null;
  validUntil: string | null;
  status: QuotationStatus;
  sentAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  convertedToBookingId: number | null;
  notes: string | null;
  internalNotes: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Joined fields from backend
  clientName?: string | null;
  operatorClientName?: string | null;
  createdByName?: string | null;

  // Services array when fetching by ID
  services?: QuotationService[];
}

// Create DTOs
export interface CreateQuotationDto {
  operatorId?: number;
  quotationCode?: string;
  clientId?: number;
  operatorsClientId?: number;
  travelDatesFrom: string;
  travelDatesTo: string;
  numPassengers?: number;
  totalAmount?: number;
  currency?: string;
  validUntil?: string;
  status?: QuotationStatus;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateQuotationDto {
  quotationCode?: string;
  clientId?: number;
  operatorsClientId?: number;
  travelDatesFrom?: string;
  travelDatesTo?: string;
  numPassengers?: number;
  totalAmount?: number;
  currency?: string;
  validUntil?: string;
  status?: QuotationStatus;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  convertedToBookingId?: number;
  notes?: string;
  internalNotes?: string;
}

export interface CreateQuotationServiceDto {
  quotationId: number;
  serviceType: QuotationServiceType;
  serviceDescription?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  serviceDate?: string;
}

export interface UpdateQuotationServiceDto {
  quotationId?: number;
  serviceType?: QuotationServiceType;
  serviceDescription?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  serviceDate?: string;
}
