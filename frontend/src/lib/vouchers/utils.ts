/**
 * Voucher Utility Functions
 *
 * This file contains helper functions for converting booking data to voucher data,
 * generating voucher numbers, and other voucher-related utilities.
 */

import { format } from 'date-fns';
import type { Booking, BookingService, BookingPassenger } from '@/types/bookings';
import type {
  HotelVoucher,
  TransferVoucher,
  TourVoucher,
  GuideVoucher,
  RestaurantVoucher,
  Voucher,
} from './types';

/**
 * Generate a unique voucher number
 */
export function generateVoucherNumber(
  bookingCode: string,
  serviceType: string,
  serviceDate: string
): string {
  const date = new Date(serviceDate);
  const dateStr = format(date, 'yyyyMMdd');
  const servicePrefix = serviceType.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `VCH-${servicePrefix}-${dateStr}-${random}`;
}

/**
 * Get operator information (placeholder - should come from settings/config)
 */
export function getOperatorInfo(): {
  operatorName: string;
  operatorContact: string;
  operatorEmail?: string;
  operatorAddress?: string;
} {
  // TODO: Fetch from user settings or company configuration
  return {
    operatorName: 'Tour Operations Company',
    operatorContact: '+1 (555) 123-4567',
    operatorEmail: 'info@touroperations.com',
    operatorAddress: '123 Travel Street, Tourism City, TC 12345',
  };
}

/**
 * Format passenger names from booking passengers
 */
export function formatPassengerNames(passengers: BookingPassenger[]): string[] {
  return passengers.map(passenger => {
    const title = passenger.title ? `${passenger.title} ` : '';
    return `${title}${passenger.firstName} ${passenger.lastName}`;
  });
}

/**
 * Convert booking service to Hotel Voucher
 */
export function createHotelVoucher(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[]
): HotelVoucher {
  const operator = getOperatorInfo();
  const voucherNumber = generateVoucherNumber(booking.bookingCode, 'hotel', service.serviceDate);

  // Calculate nights (assuming service description contains check-in/check-out or using serviceDate)
  const checkIn = service.serviceDate;
  const checkOut = service.pickupTime || service.serviceDate; // Placeholder logic
  const nights = 1; // Calculate based on actual dates

  return {
    type: 'hotel',
    voucherNumber,
    bookingCode: booking.bookingCode,
    issueDate: new Date().toISOString(),
    clientName: booking.clientName || 'Guest',
    ...operator,

    // Hotel details
    hotelName: service.serviceName || 'Hotel Name',
    hotelAddress: service.pickupLocation || 'Hotel Address',
    hotelPhone: '+1 (555) 000-0000', // Should come from service data
    hotelEmail: 'hotel@example.com',

    // Reservation details
    checkIn,
    checkOut,
    nights,
    roomType: service.serviceDescription || 'Standard Room',
    mealPlan: 'Bed & Breakfast', // Should come from service data
    numberOfRooms: service.quantity || 1,
    guests: formatPassengerNames(passengers),
    adults: booking.numAdults,
    children: booking.numChildren,
    specialRequests: booking.specialRequests || undefined,
    confirmationNumber: service.id,
  };
}

/**
 * Convert booking service to Transfer Voucher
 */
export function createTransferVoucher(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[]
): TransferVoucher {
  const operator = getOperatorInfo();
  const voucherNumber = generateVoucherNumber(booking.bookingCode, 'transfer', service.serviceDate);

  return {
    type: 'transfer',
    voucherNumber,
    bookingCode: booking.bookingCode,
    issueDate: new Date().toISOString(),
    clientName: booking.clientName || 'Guest',
    ...operator,

    // Transfer details
    transferType: service.serviceDescription || 'Point-to-Point Transfer',
    pickupLocation: service.pickupLocation || 'Pickup Location',
    pickupTime: service.pickupTime || '09:00',
    dropoffLocation: service.dropoffLocation || 'Drop-off Location',
    vehicleType: 'Sedan', // Should come from service data
    driverName: undefined,
    driverPhone: undefined,
    passengers: formatPassengerNames(passengers),
    numberOfPassengers: booking.numAdults + booking.numChildren,
    flightNumber: undefined, // Should come from booking.flights
    serviceDate: service.serviceDate,
    specialInstructions: service.serviceNotes || undefined,
    emergencyContact: booking.emergencyContactName || undefined,
    emergencyPhone: booking.emergencyContactPhone || undefined,
  };
}

/**
 * Convert booking service to Tour Voucher
 */
export function createTourVoucher(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[]
): TourVoucher {
  const operator = getOperatorInfo();
  const voucherNumber = generateVoucherNumber(booking.bookingCode, 'tour', service.serviceDate);

  return {
    type: 'tour',
    voucherNumber,
    bookingCode: booking.bookingCode,
    issueDate: new Date().toISOString(),
    clientName: booking.clientName || 'Guest',
    ...operator,

    // Tour details
    tourName: service.serviceName || 'Tour Name',
    tourCompanyName: service.supplierName || 'Tour Company',
    tourCompanyPhone: '+1 (555) 000-0000',
    tourCompanyEmail: 'tours@example.com',
    serviceDate: service.serviceDate,
    serviceTime: service.pickupTime || '09:00',
    meetingPoint: service.pickupLocation || 'Meeting Point',
    duration: '4 hours', // Should come from service data
    participants: formatPassengerNames(passengers),
    numberOfParticipants: booking.numAdults + booking.numChildren,
    adults: booking.numAdults,
    children: booking.numChildren,
    language: 'English', // Should come from service data
    guideName: undefined,
    guidePhone: undefined,
    inclusions: service.serviceDescription ? [service.serviceDescription] : undefined,
    exclusions: undefined,
    whatToBring: ['Comfortable shoes', 'Water', 'Camera', 'Sun protection'],
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour start time.',
    specialRequests: service.serviceNotes || undefined,
  };
}

/**
 * Convert booking service to Guide Voucher
 */
export function createGuideVoucher(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[]
): GuideVoucher {
  const operator = getOperatorInfo();
  const voucherNumber = generateVoucherNumber(booking.bookingCode, 'guide', service.serviceDate);

  return {
    type: 'guide',
    voucherNumber,
    bookingCode: booking.bookingCode,
    issueDate: new Date().toISOString(),
    clientName: booking.clientName || 'Guest',
    ...operator,

    // Guide details
    guideName: service.supplierName || 'Professional Guide',
    guidePhone: '+1 (555) 000-0000',
    guideEmail: 'guide@example.com',
    serviceDate: service.serviceDate,
    serviceTime: service.pickupTime || '09:00',
    serviceType: service.serviceDescription || 'Full Day Guide Service',
    languages: ['English'], // Should come from service data
    meetingPoint: service.pickupLocation || 'Meeting Point',
    itinerary: service.serviceDescription ? [service.serviceDescription] : undefined,
    numberOfGuests: booking.numAdults + booking.numChildren,
    guests: formatPassengerNames(passengers),
    specialRequirements: service.serviceNotes || undefined,
    duration: '8 hours', // Should come from service data
    endTime: '17:00',
  };
}

/**
 * Convert booking service to Restaurant Voucher
 */
export function createRestaurantVoucher(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[]
): RestaurantVoucher {
  const operator = getOperatorInfo();
  const voucherNumber = generateVoucherNumber(
    booking.bookingCode,
    'restaurant',
    service.serviceDate
  );

  return {
    type: 'restaurant',
    voucherNumber,
    bookingCode: booking.bookingCode,
    issueDate: new Date().toISOString(),
    clientName: booking.clientName || 'Guest',
    ...operator,

    // Restaurant details
    restaurantName: service.serviceName || 'Restaurant Name',
    restaurantAddress: service.pickupLocation || 'Restaurant Address',
    restaurantPhone: '+1 (555) 000-0000',
    restaurantEmail: 'restaurant@example.com',
    reservationDate: service.serviceDate,
    reservationTime: service.pickupTime || '19:00',
    numberOfGuests: booking.numAdults + booking.numChildren,
    guests: formatPassengerNames(passengers),
    mealType: 'Dinner', // Should come from service data
    menuType: service.serviceDescription || 'Set Menu',
    dietaryRequirements: passengers
      .filter(p => p.dietaryRequirements)
      .map(p => `${p.firstName}: ${p.dietaryRequirements}`),
    specialRequests: service.serviceNotes || undefined,
    confirmationNumber: service.id,
  };
}

/**
 * Create voucher based on service type
 */
export function createVoucherFromService(
  booking: Booking,
  service: BookingService,
  passengers: BookingPassenger[] = []
): Voucher {
  switch (service.serviceType) {
    case 'hotel':
      return createHotelVoucher(booking, service, passengers);
    case 'transfer':
      return createTransferVoucher(booking, service, passengers);
    case 'tour':
      return createTourVoucher(booking, service, passengers);
    case 'guide':
      return createGuideVoucher(booking, service, passengers);
    case 'restaurant':
      return createRestaurantVoucher(booking, service, passengers);
    default:
      throw new Error(`Unsupported service type: ${service.serviceType}`);
  }
}

/**
 * Create multiple vouchers from booking services
 */
export function createVouchersFromBooking(
  booking: Booking,
  services: BookingService[],
  passengers: BookingPassenger[] = []
): Voucher[] {
  return services
    .filter(service =>
      ['hotel', 'transfer', 'tour', 'guide', 'restaurant'].includes(service.serviceType)
    )
    .map(service => createVoucherFromService(booking, service, passengers));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for vouchers
 */
export function formatVoucherDate(date: string | Date): string {
  return format(new Date(date), 'MMMM d, yyyy');
}

/**
 * Format time for vouchers
 */
export function formatVoucherTime(time: string): string {
  // Handle various time formats
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  return time;
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validate voucher data
 */
export function validateVoucherData(voucher: Voucher): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Common validations
  if (!voucher.voucherNumber) errors.push('Voucher number is required');
  if (!voucher.bookingCode) errors.push('Booking code is required');
  if (!voucher.clientName) errors.push('Client name is required');

  // Type-specific validations
  switch (voucher.type) {
    case 'hotel':
      if (!voucher.hotelName) errors.push('Hotel name is required');
      if (!voucher.checkIn) errors.push('Check-in date is required');
      if (!voucher.checkOut) errors.push('Check-out date is required');
      break;
    case 'transfer':
      if (!voucher.pickupLocation) errors.push('Pickup location is required');
      if (!voucher.dropoffLocation) errors.push('Drop-off location is required');
      if (!voucher.pickupTime) errors.push('Pickup time is required');
      break;
    case 'tour':
      if (!voucher.tourName) errors.push('Tour name is required');
      if (!voucher.serviceDate) errors.push('Service date is required');
      if (!voucher.meetingPoint) errors.push('Meeting point is required');
      break;
    case 'guide':
      if (!voucher.guideName) errors.push('Guide name is required');
      if (!voucher.serviceDate) errors.push('Service date is required');
      break;
    case 'restaurant':
      if (!voucher.restaurantName) errors.push('Restaurant name is required');
      if (!voucher.reservationDate) errors.push('Reservation date is required');
      if (!voucher.reservationTime) errors.push('Reservation time is required');
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
