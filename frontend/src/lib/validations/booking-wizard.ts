/**
 * Booking Wizard Validation Schemas
 *
 * Comprehensive Zod validation schemas for the 5-step booking wizard.
 * Each step has its own schema with detailed validation rules.
 *
 * @module lib/validations/booking-wizard
 */

import { z } from 'zod';
import { addMonths, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * Step 1: Client Selection Validation
 */

// B2C Client Schema
export const b2cClientSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long'),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.date().optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  medicalConditions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  specialNotes: z.string().optional(),
});

// B2B Client Schema
export const b2bClientSchema = b2cClientSchema.extend({
  partnerOperatorId: z.number().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().optional(),
});

// Client Selection Schema
export const clientSelectionSchema = z.object({
  clientType: z.enum(['B2C', 'B2B']).refine(val => !!val, {
    message: 'Please select client type',
  }),
  selectedClientId: z.number().positive('Please select or create a client'),
});

/**
 * Step 2: Trip Details Validation
 */
export const tripDetailsSchema = z
  .object({
    travelStartDate: z.date({
      message: 'Travel start date is required',
    }),
    travelEndDate: z.date({
      message: 'Travel end date is required',
    }),
    destinationCityId: z
      .number({
        message: 'Destination is required',
      })
      .positive('Please select a destination'),
    numAdults: z
      .number({
        message: 'Number of adults is required',
      })
      .min(1, 'At least 1 adult is required')
      .max(50, 'Too many adults'),
    numChildren: z
      .number()
      .min(0, 'Number of children cannot be negative')
      .max(50, 'Too many children')
      .default(0),
    childrenAges: z
      .array(z.number().min(0, 'Age must be positive').max(17, 'Child age must be under 18'))
      .default([]),
    currency: z.string().min(3, 'Currency is required').max(3, 'Invalid currency code'),
    tripType: z.enum(['Package', 'Custom', 'FIT', 'Group'], {
      message: 'Trip type is required',
    }),
    bookingSource: z.enum(['Website', 'Phone', 'Email', 'Walk-in', 'Referral', 'Agent'], {
      message: 'Booking source is required',
    }),
    isGroupBooking: z.boolean().default(false),
    groupName: z.string().optional(),
    groupLeaderName: z.string().optional(),
    groupLeaderContact: z.string().optional(),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
    emergencyContactRelationship: z.string().min(2, 'Emergency contact relationship is required'),
    specialRequests: z.string().optional(),
  })
  .refine(
    data => {
      // Validate end date is after start date
      return isAfter(data.travelEndDate, data.travelStartDate);
    },
    {
      message: 'Travel end date must be after start date',
      path: ['travelEndDate'],
    }
  )
  .refine(
    data => {
      // Validate start date is not in the past (at least today)
      const today = startOfDay(new Date());
      return !isBefore(startOfDay(data.travelStartDate), today);
    },
    {
      message: 'Travel start date cannot be in the past',
      path: ['travelStartDate'],
    }
  )
  .refine(
    data => {
      // If children exist, ages array must match count
      return data.numChildren === 0 || data.childrenAges.length === data.numChildren;
    },
    {
      message: 'Number of children ages must match number of children',
      path: ['childrenAges'],
    }
  )
  .refine(
    data => {
      // If group booking, group details are required
      if (data.isGroupBooking) {
        return data.groupName && data.groupLeaderName && data.groupLeaderContact;
      }
      return true;
    },
    {
      message: 'Group details are required for group bookings',
      path: ['groupName'],
    }
  );

/**
 * Step 3: Passengers Information Validation
 */
export const passengerSchema = z
  .object({
    passengerType: z.enum(['Adult', 'Child', 'Infant'], {
      message: 'Passenger type is required',
    }),
    title: z.string().min(1, 'Title is required'),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name is too long'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name is too long'),
    dateOfBirth: z.date({
      message: 'Date of birth is required',
    }),
    age: z.number().min(0, 'Age must be positive').max(120, 'Invalid age'),
    gender: z.string().min(1, 'Gender is required'),
    nationality: z.string().min(2, 'Nationality is required'),
    passportNumber: z
      .string()
      .min(5, 'Passport number is required')
      .max(20, 'Passport number is too long'),
    passportExpiryDate: z.date({
      message: 'Passport expiry date is required',
    }),
    passportIssueCountry: z.string().min(2, 'Passport issue country is required'),
    isLeadPassenger: z.boolean(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    dietaryRequirements: z.array(z.string()).optional(),
    medicalConditions: z.string().optional(),
    accessibilityNeeds: z.string().optional(),
    specialNotes: z.string().optional(),
    roomNumber: z.string().optional(),
    bedTypePreference: z.string().optional(),
  })
  .refine(
    data => {
      // Lead passenger must have email
      if (data.isLeadPassenger && !data.email) {
        return false;
      }
      return true;
    },
    {
      message: 'Email is required for lead passenger',
      path: ['email'],
    }
  )
  .refine(
    data => {
      // Lead passenger must have phone
      if (data.isLeadPassenger && !data.phone) {
        return false;
      }
      return true;
    },
    {
      message: 'Phone is required for lead passenger',
      path: ['phone'],
    }
  );

// Passport expiry validation helper
export const validatePassportExpiry = (passportExpiryDate: Date, travelEndDate: Date): boolean => {
  // Passport must be valid for at least 6 months after travel end date
  const sixMonthsAfterTravel = addMonths(travelEndDate, 6);
  return isAfter(passportExpiryDate, sixMonthsAfterTravel);
};

// Age validation helper
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

// Validate passenger type matches age
export const validatePassengerType = (age: number, passengerType: string): boolean => {
  if (passengerType === 'Adult' && age >= 18) return true;
  if (passengerType === 'Child' && age >= 2 && age < 18) return true;
  if (passengerType === 'Infant' && age < 2) return true;
  return false;
};

/**
 * Step 4: Services Selection Validation
 */

// Base service schema
const baseServiceSchema = z.object({
  serviceDate: z.date({
    message: 'Service date is required',
  }),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  costAmount: z.number().min(0, 'Cost must be positive'),
  costCurrency: z.string().min(3, 'Currency is required').max(3, 'Invalid currency code'),
  exchangeRate: z.number().min(0, 'Exchange rate must be positive').default(1),
  costInBaseCurrency: z.number().min(0, 'Cost in base currency must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  sellingCurrency: z.string().min(3, 'Currency is required').max(3, 'Invalid currency code'),
  serviceDescription: z.string().min(1, 'Service description is required'),
  serviceNotes: z.string().optional(),
});

// Hotel service schema
export const hotelServiceSchema = baseServiceSchema
  .extend({
    serviceType: z.literal('hotel'),
    hotelId: z.number().positive('Hotel selection is required'),
    roomTypeId: z.number().optional(),
    numberOfRooms: z.number().min(1, 'At least 1 room is required'),
    checkInDate: z.date({
      message: 'Check-in date is required',
    }),
    checkOutDate: z.date({
      message: 'Check-out date is required',
    }),
    numberOfNights: z.number().min(1, 'At least 1 night is required'),
    mealPlan: z.string().optional(),
    roomNumbers: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      return isAfter(data.checkOutDate, data.checkInDate);
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate'],
    }
  );

// Transfer service schema
export const transferServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('transfer'),
  transferRouteId: z.number().positive('Transfer route selection is required'),
  fromCityId: z.number().positive('From city is required'),
  toCityId: z.number().positive('To city is required'),
  vehicleTypeId: z.number().optional(),
  transferTime: z.string().min(1, 'Transfer time is required'),
  pickupLocationId: z.number().optional(),
  dropoffLocationId: z.number().optional(),
  pickupTime: z.string().optional(),
});

// Vehicle rental schema
export const vehicleRentalServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('vehicle_rental'),
  vehicleRentalId: z.number().positive('Vehicle selection is required'),
  rentalType: z.enum(['Full Day', 'Half Day', 'Night'], {
    message: 'Rental type is required',
  }),
  hours: z.number().min(1, 'Hours must be at least 1').max(24, 'Hours cannot exceed 24'),
  kmEstimate: z.number().optional(),
});

// Tour service schema
export const tourServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('tour'),
  tourCompanyId: z.number().positive('Tour selection is required'),
  tourType: z.enum(['SIC', 'Private'], {
    message: 'Tour type is required',
  }),
  numberOfParticipants: z.number().min(1, 'At least 1 participant is required'),
  tourDate: z.date({
    message: 'Tour date is required',
  }),
});

// Guide service schema
export const guideServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('guide'),
  guideId: z.number().positive('Guide selection is required'),
  serviceTypeDetail: z.enum(['Full Day', 'Half Day', 'Night', 'Transfer'], {
    message: 'Service type is required',
  }),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
});

// Restaurant service schema
export const restaurantServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('restaurant'),
  restaurantId: z.number().positive('Restaurant selection is required'),
  mealType: z.enum(['Lunch', 'Dinner'], {
    message: 'Meal type is required',
  }),
  numberOfGuests: z.number().min(1, 'At least 1 guest is required'),
});

// Entrance fee service schema
export const entranceFeeServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('entrance_fee'),
  entranceFeeId: z.number().positive('Entrance fee selection is required'),
  adultCount: z.number().min(0, 'Adult count must be positive').default(0),
  childCount: z.number().min(0, 'Child count must be positive').default(0),
  studentCount: z.number().min(0, 'Student count must be positive').optional(),
  seniorCount: z.number().min(0, 'Senior count must be positive').optional(),
});

// Extra expense service schema
export const extraServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal('extra'),
  extraExpenseId: z.number().positive('Extra expense selection is required'),
  customDescription: z.string().min(1, 'Description is required'),
});

// Union of all service schemas
export const serviceSchema = z.discriminatedUnion('serviceType', [
  hotelServiceSchema,
  transferServiceSchema,
  vehicleRentalServiceSchema,
  tourServiceSchema,
  guideServiceSchema,
  restaurantServiceSchema,
  entranceFeeServiceSchema,
  extraServiceSchema,
]);

/**
 * Step 5: Pricing & Summary Validation
 */
export const pricingSchema = z.object({
  totalServicesCost: z.number().min(0, 'Total cost must be positive'),
  markupPercentage: z
    .number()
    .min(0, 'Markup percentage must be positive')
    .max(1000, 'Markup is too high')
    .default(20),
  profitAmount: z.number().min(0, 'Profit amount must be positive'),
  totalSellingPrice: z.number().min(0, 'Total selling price must be positive'),
  taxRateId: z.number().optional(),
  taxRate: z
    .number()
    .min(0, 'Tax rate must be positive')
    .max(100, 'Tax rate cannot exceed 100%')
    .optional(),
  taxAmount: z.number().min(0, 'Tax amount must be positive').default(0),
  totalWithTax: z.number().min(0, 'Total with tax must be positive'),
  promoCodeId: z.number().optional(),
  promoCode: z.string().optional(),
  campaignId: z.number().optional(),
  discountAmount: z.number().min(0, 'Discount amount must be positive').default(0),
  finalTotal: z.number().min(0, 'Final total must be positive'),
  baseCurrency: z
    .string()
    .min(3, 'Currency is required')
    .max(3, 'Invalid currency code')
    .default('TRY'),
  sellingCurrency: z
    .string()
    .min(3, 'Currency is required')
    .max(3, 'Invalid currency code')
    .default('TRY'),
  bookingSource: z.enum(['Website', 'Phone', 'Email', 'Walk-in', 'Referral', 'Agent'], {
    message: 'Booking source is required',
  }),
  referralSource: z.string().optional(),
  cancellationPolicyId: z.number().optional(),
  internalNotes: z.string().optional(),
});

/**
 * Complete wizard validation
 */
export const completeWizardSchema = z.object({
  client: z.object({
    id: z.number().positive('Client is required'),
    type: z.enum(['B2C', 'B2B']),
  }),
  tripDetails: tripDetailsSchema,
  passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
  services: z.array(serviceSchema).optional(),
  pricing: pricingSchema,
});

/**
 * Pricing calculation helpers
 */

/**
 * Calculate profit amount from cost and markup percentage
 */
export const calculateProfitAmount = (totalCost: number, markupPercentage: number): number => {
  return (totalCost * markupPercentage) / 100;
};

/**
 * Calculate selling price from cost and markup
 */
export const calculateSellingPrice = (totalCost: number, markupPercentage: number): number => {
  return totalCost + calculateProfitAmount(totalCost, markupPercentage);
};

/**
 * Calculate tax amount from price and tax rate
 */
export const calculateTaxAmount = (price: number, taxRate: number): number => {
  return (price * taxRate) / 100;
};

/**
 * Calculate total with tax
 */
export const calculateTotalWithTax = (price: number, taxAmount: number): number => {
  return price + taxAmount;
};

/**
 * Calculate final total after discount
 */
export const calculateFinalTotal = (totalWithTax: number, discountAmount: number): number => {
  return Math.max(0, totalWithTax - discountAmount);
};

/**
 * Currency conversion helper
 */
export const convertCurrency = (amount: number, exchangeRate: number): number => {
  return amount * exchangeRate;
};
