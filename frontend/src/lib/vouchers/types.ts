/**
 * Voucher Type Definitions
 *
 * This file contains all TypeScript interfaces for voucher generation.
 * Each service type has its own voucher interface with specific fields.
 */

/**
 * Base voucher interface - common fields for all voucher types
 */
export interface BaseVoucher {
  voucherNumber: string;
  bookingCode: string;
  issueDate: string;
  clientName: string;
  operatorName: string;
  operatorContact: string;
  operatorEmail?: string;
  operatorAddress?: string;
  operatorLogo?: string;
}

/**
 * Hotel Voucher
 */
export interface HotelVoucher extends BaseVoucher {
  type: 'hotel';
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  hotelEmail?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  mealPlan: string;
  numberOfRooms: number;
  guests: string[];
  adults: number;
  children: number;
  specialRequests?: string;
  confirmationNumber?: string;
  supplierReference?: string;
}

/**
 * Transfer Voucher
 */
export interface TransferVoucher extends BaseVoucher {
  type: 'transfer';
  transferType: string; // Airport pickup, Point-to-Point, etc.
  pickupLocation: string;
  pickupTime: string;
  dropoffLocation: string;
  vehicleType: string;
  driverName?: string;
  driverPhone?: string;
  passengers: string[];
  numberOfPassengers: number;
  flightNumber?: string;
  flightArrivalTime?: string;
  flightDepartureTime?: string;
  specialInstructions?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  serviceDate: string;
}

/**
 * Tour Voucher
 */
export interface TourVoucher extends BaseVoucher {
  type: 'tour';
  tourName: string;
  tourCompanyName: string;
  tourCompanyPhone: string;
  tourCompanyEmail?: string;
  serviceDate: string;
  serviceTime: string;
  meetingPoint: string;
  duration: string;
  participants: string[];
  numberOfParticipants: number;
  adults: number;
  children: number;
  language: string;
  guideName?: string;
  guidePhone?: string;
  inclusions?: string[];
  exclusions?: string[];
  whatToBring?: string[];
  cancellationPolicy?: string;
  specialRequests?: string;
}

/**
 * Guide Voucher
 */
export interface GuideVoucher extends BaseVoucher {
  type: 'guide';
  guideName: string;
  guidePhone: string;
  guideEmail?: string;
  serviceDate: string;
  serviceTime: string;
  serviceType: string; // Full day, Half day, Multi-day, etc.
  languages: string[];
  meetingPoint: string;
  itinerary?: string[];
  numberOfGuests: number;
  guests: string[];
  specialRequirements?: string;
  duration: string;
  endTime?: string;
}

/**
 * Restaurant Voucher
 */
export interface RestaurantVoucher extends BaseVoucher {
  type: 'restaurant';
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  guests: string[];
  mealType: string; // Lunch, Dinner, Breakfast
  menuType?: string; // Set menu, A la carte, etc.
  dietaryRequirements?: string[];
  specialRequests?: string;
  confirmationNumber?: string;
}

/**
 * Union type for all voucher types
 */
export type Voucher =
  | HotelVoucher
  | TransferVoucher
  | TourVoucher
  | GuideVoucher
  | RestaurantVoucher;

/**
 * Voucher generation options
 */
export interface VoucherGenerationOptions {
  format?: 'pdf' | 'html';
  includeTermsAndConditions?: boolean;
  includeCancellationPolicy?: boolean;
  customFooter?: string;
  customHeader?: string;
}

/**
 * Voucher template configuration
 */
export interface VoucherTemplateConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  headerText?: string;
  footerText?: string;
}
