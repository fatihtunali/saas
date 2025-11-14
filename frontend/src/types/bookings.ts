/**
 * Bookings TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the Bookings module.
 * Types are based on the database schema from: backend/database/saas_db_backup_2025-11-10T12-35-03.sql
 *
 * Database Table: bookings
 * Columns: id, operator_id, booking_code, client_id, operators_client_id, travel_start_date,
 *          travel_end_date, destination_city_id, num_adults, num_children, children_ages, status,
 *          total_cost, total_selling_price, markup_percentage, profit_amount, tax_rate_id,
 *          tax_amount, total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source,
 *          referral_source, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
 *          is_group_booking, group_name, group_leader_name, group_leader_contact, cancellation_policy_id,
 *          special_requests, internal_notes, created_by, cancelled_at, cancelled_by, cancellation_reason,
 *          cancellation_fee, refund_amount, created_at, updated_at, deleted_at
 */

/**
 * Booking status types
 */
export type BookingStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Payment status types
 */
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';

/**
 * Client type (B2C = Business to Consumer, B2B = Business to Business)
 */
export type ClientType = 'B2C' | 'B2B';

/**
 * Trip type classification
 */
export type TripType = 'Package' | 'Custom' | 'FIT' | 'Group';

/**
 * Booking source types
 */
export type BookingSource = 'Website' | 'Phone' | 'Email' | 'Walk-in' | 'Referral' | 'Agent';

/**
 * Service types for booking services
 */
export type ServiceType =
  | 'hotel'
  | 'transfer'
  | 'vehicle_rental'
  | 'tour'
  | 'guide'
  | 'restaurant'
  | 'entrance_fee'
  | 'extra';

/**
 * Passenger type classification
 */
export type PassengerType = 'Adult' | 'Child' | 'Infant';

/**
 * Core Booking Interface
 * Represents a complete booking record from the database
 */
export interface Booking {
  // Primary keys and identifiers
  id: string;
  operatorId: number;
  bookingCode: string;

  // Client information
  clientId: number | null;
  operatorsClientId: number | null;
  clientName?: string; // Derived from client table join (B2C)
  operatorClientName?: string; // Derived from operators_clients table join (B2B)
  clientType?: ClientType; // Derived from client table join
  clientEmail?: string; // Derived from client table join
  clientPhone?: string; // Derived from client table join

  // Travel details
  travelStartDate: string; // ISO date string
  travelEndDate: string; // ISO date string
  destinationCityId: number | null;
  destination?: string; // Derived from cities table join
  country?: string; // Derived from cities table join

  // Passenger details
  numAdults: number;
  numChildren: number;
  childrenAges: number[] | null;
  passengerCount: number; // Calculated: numAdults + numChildren

  // Status tracking
  status: BookingStatus;
  paymentStatus?: PaymentStatus; // Calculated based on payments

  // Financial information
  totalCost: number; // Supplier costs
  totalSellingPrice: number; // Client pays this
  markupPercentage: number;
  profitAmount: number;
  taxRateId: number | null;
  taxAmount: number;
  totalWithTax: number;

  // Discounts and promotions
  promoCodeId: number | null;
  discountAmount: number;
  campaignId: number | null;

  // Payment tracking (calculated from client_payments table)
  paidAmount?: number;
  balanceAmount?: number;

  // Source tracking
  bookingSource: string | null;
  referralSource: string | null;

  // Emergency contact
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;

  // Group booking details
  isGroupBooking: boolean;
  groupName: string | null;
  groupLeaderName: string | null;
  groupLeaderContact: string | null;

  // Policies and notes
  cancellationPolicyId: number | null;
  specialRequests: string | null;
  internalNotes: string | null;

  // Cancellation details
  cancelledAt: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;
  cancellationFee: number | null;
  refundAmount: number | null;

  // Audit fields
  createdBy: number;
  createdByName?: string; // Derived from users table join
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Related data (from joins)
  passengers?: BookingPassenger[];
  services?: BookingService[];
  payments?: BookingPayment[];
  activities?: BookingActivity[];
  flights?: BookingFlight[];
  documents?: BookingDocument[];

  // Calculated fields
  numberOfDays?: number;
  numberOfNights?: number;
  daysUntilTravel?: number;
}

/**
 * Booking Passenger Interface
 * Represents passenger information linked to a booking
 */
export interface BookingPassenger {
  id: string;
  operatorId: number;
  bookingId: string;
  passengerType: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiryDate: string | null;
  passportIssueCountry: string | null;
  isLeadPassenger: boolean;
  email: string | null;
  phone: string | null;
  dietaryRequirements: string | null;
  medicalConditions: string | null;
  accessibilityNeeds: string | null;
  specialNotes: string | null;
  roomNumber: string | null;
  bedTypePreference: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Booking Service Interface
 * Represents a service (hotel, transfer, tour, etc.) linked to a booking
 */
export interface BookingService {
  id: string;
  operatorId: number;
  bookingId: string;
  serviceDate: string;
  serviceType: ServiceType;
  hotelId: number | null;
  transferRouteId: number | null;
  vehicleRentalId: number | null;
  guideId: number | null;
  restaurantId: number | null;
  entranceFeeId: number | null;
  tourCompanyId: number | null;
  extraExpenseId: number | null;
  quantity: number;
  costAmount: number;
  costCurrency: string;
  exchangeRate: number;
  costInBaseCurrency: number;
  sellingPrice: number;
  sellingCurrency: string;
  pickupLocationId: number | null;
  dropoffLocationId: number | null;
  pickupTime: string | null;
  serviceDescription: string | null;
  serviceNotes: string | null;
  voucherSent: boolean;
  voucherSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Derived fields from joins
  serviceName?: string;
  supplierName?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

/**
 * Booking Payment Interface
 * Represents a payment received for a booking
 */
export interface BookingPayment {
  id: string;
  operatorId: number;
  bookingId: string;
  paymentDate: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInBaseCurrency: number;
  paymentMethod: string;
  paymentReference: string | null;
  bankAccountId: number | null;
  status: 'completed' | 'pending' | 'failed';
  notes: string | null;
  receivedBy: number;
  receivedByName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Booking Activity Interface
 * Represents activity/audit log for a booking
 */
export interface BookingActivity {
  id: string;
  operatorId: number;
  bookingId: string;
  activityType: string;
  activityDescription: string;
  userId: number | null;
  userName?: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Booking Flight Interface
 * Represents flight information linked to a booking
 */
export interface BookingFlight {
  id: string;
  operatorId: number;
  bookingId: string;
  flightDate: string;
  flightTime: string | null;
  flightNumber: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureAirport: string | null;
  arrivalAirport: string | null;
  departureTerminal: string | null;
  arrivalTerminal: string | null;
  flightDuration: string | null;
  bookingReference: string | null;
  seatNumbers: string | null;
  baggageAllowance: string | null;
  flightClass: string | null;
  ticketStatus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Booking Document Interface
 * Represents documents (vouchers, invoices, contracts) linked to a booking
 */
export interface BookingDocument {
  id: string;
  operatorId: number;
  bookingId: string;
  documentType: 'voucher' | 'invoice' | 'contract' | 'itinerary' | 'other';
  documentName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  uploadedBy: number;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Query parameters for fetching bookings list
 */
export interface BookingsQueryParams {
  // Pagination
  page: number;
  limit: number;

  // Search
  search?: string; // Search in booking code, client name, destination

  // Filters
  status?: BookingStatus[];
  paymentStatus?: PaymentStatus[];
  clientType?: ClientType[];
  bookingSource?: BookingSource[];
  destination?: string[]; // City IDs or names
  agentId?: string;

  // Date range filters
  travelStartDate?: string; // ISO date
  travelEndDate?: string; // ISO date
  bookingStartDate?: string; // Created date range start
  bookingEndDate?: string; // Created date range end

  // Sorting
  sortBy?: string; // Field name to sort by
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated bookings response
 */
export interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create booking input
 */
export interface CreateBookingInput {
  // Client information
  clientId?: number;
  operatorsClientId?: number;

  // Travel details
  travelStartDate: string;
  travelEndDate: string;
  destinationCityId: number;

  // Passenger details
  numAdults: number;
  numChildren?: number;
  childrenAges?: number[];

  // Financial information
  totalCost: number;
  totalSellingPrice: number;
  markupPercentage?: number;
  profitAmount?: number;
  taxRateId?: number;
  taxAmount?: number;
  totalWithTax?: number;

  // Discounts
  promoCodeId?: number;
  discountAmount?: number;
  campaignId?: number;

  // Source
  bookingSource?: string;
  referralSource?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Group booking
  isGroupBooking?: boolean;
  groupName?: string;
  groupLeaderName?: string;
  groupLeaderContact?: string;

  // Policies and notes
  cancellationPolicyId?: number;
  specialRequests?: string;
  internalNotes?: string;

  // Passengers (optional, can be added separately)
  passengers?: CreatePassengerInput[];

  // Services (optional, can be added separately)
  services?: CreateServiceInput[];
}

/**
 * Update booking input
 */
export interface UpdateBookingInput {
  // Travel details
  travelStartDate?: string;
  travelEndDate?: string;
  destinationCityId?: number;

  // Passenger details
  numAdults?: number;
  numChildren?: number;
  childrenAges?: number[];

  // Status
  status?: BookingStatus;

  // Financial information
  totalCost?: number;
  totalSellingPrice?: number;
  markupPercentage?: number;
  profitAmount?: number;
  taxRateId?: number;
  taxAmount?: number;
  totalWithTax?: number;

  // Discounts
  promoCodeId?: number;
  discountAmount?: number;
  campaignId?: number;

  // Source
  bookingSource?: string;
  referralSource?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Group booking
  isGroupBooking?: boolean;
  groupName?: string;
  groupLeaderName?: string;
  groupLeaderContact?: string;

  // Policies and notes
  cancellationPolicyId?: number;
  specialRequests?: string;
  internalNotes?: string;
}

/**
 * Create passenger input
 */
export interface CreatePassengerInput {
  passengerType: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  passportIssueCountry?: string;
  isLeadPassenger?: boolean;
  email?: string;
  phone?: string;
  dietaryRequirements?: string;
  medicalConditions?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
  roomNumber?: string;
  bedTypePreference?: string;
}

/**
 * Create service input
 */
export interface CreateServiceInput {
  serviceDate: string;
  serviceType: ServiceType;
  hotelId?: number;
  transferRouteId?: number;
  vehicleRentalId?: number;
  guideId?: number;
  restaurantId?: number;
  entranceFeeId?: number;
  tourCompanyId?: number;
  extraExpenseId?: number;
  quantity: number;
  costAmount: number;
  costCurrency: string;
  exchangeRate?: number;
  costInBaseCurrency?: number;
  sellingPrice: number;
  sellingCurrency: string;
  pickupLocationId?: number;
  dropoffLocationId?: number;
  pickupTime?: string;
  serviceDescription?: string;
  serviceNotes?: string;
}

/**
 * Cancel booking input
 */
export interface CancelBookingInput {
  reason: string;
  cancellationFee?: number;
  refundAmount?: number;
}

/**
 * Booking statistics response
 */
export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalReceivables: number;
  totalPayables: number;
  averageBookingValue: number;
  bookingsByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  bookingsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  topDestinations: Array<{
    destination: string;
    count: number;
    revenue: number;
  }>;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Export format options
 */
export type ExportFormat = 'excel' | 'pdf' | 'csv';

/**
 * API Response wrapper for bookings endpoints
 */
export interface BookingsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
