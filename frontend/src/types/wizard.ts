/**
 * Booking Wizard TypeScript Type Definitions
 *
 * Comprehensive type definitions for the 5-step booking wizard.
 * These types ensure type safety throughout the wizard flow.
 *
 * @module types/wizard
 */

import type { ServiceType, PassengerType, BookingSource, BookingStatus } from './bookings';

// Re-export types from bookings that are used in wizard
export type { ServiceType, PassengerType, BookingSource, BookingStatus };

/**
 * Client type for wizard
 */
export type WizardClientType = 'B2C' | 'B2B';

/**
 * Wizard step numbers
 */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Client data from Step 1
 */
export interface WizardClientData {
  id: number;
  type: WizardClientType;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: Date;
  dietaryRequirements?: string[];
  medicalConditions?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
  // B2B specific
  partnerOperatorId?: number;
  paymentTerms?: string;
  creditLimit?: number;
}

/**
 * Trip details from Step 2
 */
export interface WizardTripDetails {
  travelStartDate: Date;
  travelEndDate: Date;
  destinationCityId: number;
  destinationCityName?: string;
  numAdults: number;
  numChildren: number;
  childrenAges: number[];
  currency: string;
  tripType: 'Package' | 'Custom' | 'FIT' | 'Group';
  bookingSource: BookingSource;
  isGroupBooking: boolean;
  groupName?: string;
  groupLeaderName?: string;
  groupLeaderContact?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  specialRequests?: string;
}

/**
 * Passenger data from Step 3
 */
export interface WizardPassengerData {
  id?: string; // Temporary ID for UI
  passengerType: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiryDate: Date;
  passportIssueCountry: string;
  isLeadPassenger: boolean;
  email?: string;
  phone?: string;
  dietaryRequirements?: string[];
  medicalConditions?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
  roomNumber?: string;
  bedTypePreference?: string;
}

/**
 * Service data from Step 4
 */
export interface WizardServiceData {
  id?: string; // Temporary ID for UI
  serviceDate: Date;
  serviceType: ServiceType;
  // Service-specific IDs
  hotelId?: number;
  transferRouteId?: number;
  vehicleRentalId?: number;
  guideId?: number;
  restaurantId?: number;
  entranceFeeId?: number;
  tourCompanyId?: number;
  extraExpenseId?: number;
  // Pricing
  quantity: number;
  costAmount: number;
  costCurrency: string;
  exchangeRate: number;
  costInBaseCurrency: number;
  sellingPrice: number;
  sellingCurrency: string;
  // Additional details
  pickupLocationId?: number;
  dropoffLocationId?: number;
  pickupTime?: string;
  serviceDescription: string;
  serviceNotes?: string;
  // UI display fields
  serviceName?: string;
  supplierName?: string;
}

/**
 * Hotel service specific data
 */
export interface WizardHotelService extends WizardServiceData {
  serviceType: 'hotel';
  hotelId: number;
  roomTypeId?: number;
  numberOfRooms: number;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  mealPlan?: string;
  roomNumbers?: string[];
}

/**
 * Transfer service specific data
 */
export interface WizardTransferService extends WizardServiceData {
  serviceType: 'transfer';
  transferRouteId: number;
  fromCityId: number;
  toCityId: number;
  vehicleTypeId?: number;
  transferTime: string;
}

/**
 * Vehicle rental specific data
 */
export interface WizardVehicleRentalService extends WizardServiceData {
  serviceType: 'vehicle_rental';
  vehicleRentalId: number;
  rentalType: 'Full Day' | 'Half Day' | 'Night';
  hours: number;
  kmEstimate?: number;
}

/**
 * Tour service specific data
 */
export interface WizardTourService extends WizardServiceData {
  serviceType: 'tour';
  tourCompanyId: number;
  tourType: 'SIC' | 'Private';
  numberOfParticipants: number;
  tourDate: Date;
}

/**
 * Guide service specific data
 */
export interface WizardGuideService extends WizardServiceData {
  serviceType: 'guide';
  guideId: number;
  serviceTypeDetail: 'Full Day' | 'Half Day' | 'Night' | 'Transfer';
  languages: string[];
}

/**
 * Restaurant service specific data
 */
export interface WizardRestaurantService extends WizardServiceData {
  serviceType: 'restaurant';
  restaurantId: number;
  mealType: 'Lunch' | 'Dinner';
  numberOfGuests: number;
}

/**
 * Entrance fee specific data
 */
export interface WizardEntranceFeeService extends WizardServiceData {
  serviceType: 'entrance_fee';
  entranceFeeId: number;
  adultCount: number;
  childCount: number;
  studentCount?: number;
  seniorCount?: number;
}

/**
 * Extra expense specific data
 */
export interface WizardExtraService extends WizardServiceData {
  serviceType: 'extra';
  extraExpenseId: number;
  customDescription: string;
}

/**
 * Pricing data from Step 5
 */
export interface WizardPricingData {
  // Cost breakdown
  totalServicesCost: number;
  markupPercentage: number;
  profitAmount: number;
  totalSellingPrice: number;

  // Tax
  taxRateId?: number;
  taxRate?: number;
  taxAmount: number;
  totalWithTax: number;

  // Discounts
  promoCodeId?: number;
  promoCode?: string;
  campaignId?: number;
  discountAmount: number;

  // Final total
  finalTotal: number;

  // Currency
  baseCurrency: string;
  sellingCurrency: string;

  // Booking details
  bookingSource: BookingSource;
  referralSource?: string;
  cancellationPolicyId?: number;
  internalNotes?: string;
}

/**
 * Complete wizard state
 */
export interface BookingWizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  client: WizardClientData | null;
  tripDetails: WizardTripDetails | null;
  passengers: WizardPassengerData[];
  services: WizardServiceData[];
  pricing: WizardPricingData | null;
  // UI state
  isSubmitting: boolean;
  isDraft: boolean;
  lastSaved?: Date;
}

/**
 * Client for display (from API)
 */
export interface Client {
  id: number;
  operatorId: number;
  clientType: 'B2C' | 'B2B';
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dietaryRequirements?: string;
  medicalConditions?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * B2B Client (Operator's Client)
 */
export interface OperatorsClient extends Client {
  partnerOperatorId?: number;
  companyName?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentBalance?: number;
}

/**
 * City
 */
export interface City {
  id: number;
  operatorId: number;
  name: string;
  countryId: number;
  countryName?: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Currency
 */
export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hotel
 */
export interface Hotel {
  id: number;
  operatorId: number;
  name: string;
  starRating: number;
  cityId: number;
  cityName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  pricePerPersonDoubleOccupancy: number;
  singleSupplement?: number;
  triplePrice?: number;
  mealPlan?: string;
  facilities?: string;
  picture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hotel Room Type
 */
export interface HotelRoomType {
  id: number;
  operatorId: number;
  hotelId: number;
  roomTypeName: string;
  capacity: number;
  bedType: string;
  pricePerNight: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transfer Route
 */
export interface TransferRoute {
  id: number;
  operatorId: number;
  fromCityId: number;
  fromCityName?: string;
  toCityId: number;
  toCityName?: string;
  vehicleTypeId?: number;
  vehicleTypeName?: string;
  distance?: number;
  estimatedDuration?: string;
  pricePerPerson?: number;
  pricePerVehicle?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vehicle Rental
 */
export interface VehicleRental {
  id: number;
  operatorId: number;
  vehicleId: number;
  vehicleName?: string;
  vehicleType?: string;
  capacity: number;
  fullDayRate: number;
  halfDayRate: number;
  nightRate?: number;
  perKmRate?: number;
  perHourRate?: number;
  parkingFee?: number;
  roadToll?: number;
  otherExpenses?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tour Company (Tours)
 */
export interface TourCompany {
  id: number;
  operatorId: number;
  tourName: string;
  tourType: string;
  duration: string;
  sicPrice?: number; // Seat in Coach
  privatePriceFor2Pax?: number;
  privatePriceFor4Pax?: number;
  privatePriceFor6Pax?: number;
  privatePriceFor8Pax?: number;
  privatePriceFor10Pax?: number;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Guide
 */
export interface Guide {
  id: number;
  operatorId: number;
  fullName: string;
  languages: string[];
  specializations?: string[];
  dailyRate: number;
  halfDayRate?: number;
  nightRate?: number;
  transferRate?: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Restaurant
 */
export interface Restaurant {
  id: number;
  operatorId: number;
  name: string;
  cityId: number;
  cityName?: string;
  cuisineType?: string;
  capacity?: number;
  lunchPrice?: number;
  dinnerPrice?: number;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Entrance Fee (Museums, Sites, etc.)
 */
export interface EntranceFee {
  id: number;
  operatorId: number;
  siteName: string;
  cityId: number;
  cityName?: string;
  adultPrice: number;
  childPrice?: number;
  studentPrice?: number;
  seniorPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extra Expense
 */
export interface ExtraExpense {
  id: number;
  operatorId: number;
  expenseType: string;
  description: string;
  unitPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tax Rate
 */
export interface TaxRate {
  id: number;
  operatorId: number;
  name: string;
  rate: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Exchange Rate
 */
export interface ExchangeRate {
  id: number;
  operatorId: number;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cancellation Policy
 */
export interface CancellationPolicy {
  id: number;
  operatorId: number;
  name: string;
  description: string;
  rules?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Promotional Code
 */
export interface PromotionalCode {
  id: number;
  operatorId: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Marketing Campaign
 */
export interface MarketingCampaign {
  id: number;
  operatorId: number;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
