// Common Types
export interface City {
  id: number;
  cityName: string;
  countryCode: string;
  region: string;
  timezone: string;
  isActive: boolean;
}

export interface BaseService {
  id: number;
  operatorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Hotel Types (matches actual database schema)
export interface Hotel extends BaseService {
  supplierId: number | null;
  hotelName: string;
  starRating: number | null;
  cityId: number;
  city?: City;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  pricePerPersonDouble: number | null;
  singleSupplement: number | null;
  pricePerPersonTriple: number | null;
  childPrice02: number | null;
  childPrice35: number | null;
  childPrice611: number | null;
  currency: string | null;
  mealPlan: string | null;
  mealPlanSupplement: number | null;
  facilities: string | null;
  pictureUrl: string | null;
  notes: string | null;
}

export interface CreateHotelDto {
  supplierId?: number;
  hotelName: string;
  starRating?: number;
  cityId: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  pricePerPersonDouble?: number;
  singleSupplement?: number;
  pricePerPersonTriple?: number;
  childPrice02?: number;
  childPrice35?: number;
  childPrice611?: number;
  currency?: string;
  mealPlan?: string;
  mealPlanSupplement?: number;
  facilities?: string;
  pictureUrl?: string;
  notes?: string;
}

export type UpdateHotelDto = Partial<CreateHotelDto>;

// Vehicle Company Types (matches actual database schema)
export interface VehicleCompany extends BaseService {
  supplierId: number | null;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
}

export interface CreateVehicleCompanyDto {
  supplierId?: number;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export type UpdateVehicleCompanyDto = Partial<CreateVehicleCompanyDto>;

// Vehicle Type Types (matches actual database schema)
export interface VehicleType extends BaseService {
  vehicleCompanyId: number;
  vehicleCompany?: VehicleCompany;
  vehicleType: string;
  capacity: number | null;
  luggageCapacity: number | null;
  notes: string | null;
}

export interface CreateVehicleTypeDto {
  vehicleCompanyId: number;
  vehicleType: string;
  capacity?: number;
  luggageCapacity?: number;
  notes?: string;
}

export type UpdateVehicleTypeDto = Partial<CreateVehicleTypeDto>;

// Vehicle Rental Types (matches actual database schema)
export interface VehicleRental extends BaseService {
  vehicleCompanyId: number;
  vehicleCompany?: VehicleCompany;
  vehicleTypeId: number;
  vehicleType?: VehicleType;
  fullDayPrice: number | null;
  fullDayHours: number | null;
  fullDayKm: number | null;
  halfDayPrice: number | null;
  halfDayHours: number | null;
  halfDayKm: number | null;
  nightRentalPrice: number | null;
  nightRentalHours: number | null;
  nightRentalKm: number | null;
  extraHourRate: number | null;
  extraKmRate: number | null;
  currency: string | null;
  notes: string | null;
}

export interface CreateVehicleRentalDto {
  vehicleCompanyId: number;
  vehicleTypeId: number;
  fullDayPrice?: number;
  fullDayHours?: number;
  fullDayKm?: number;
  halfDayPrice?: number;
  halfDayHours?: number;
  halfDayKm?: number;
  nightRentalPrice?: number;
  nightRentalHours?: number;
  nightRentalKm?: number;
  extraHourRate?: number;
  extraKmRate?: number;
  currency?: string;
  notes?: string;
}

export type UpdateVehicleRentalDto = Partial<CreateVehicleRentalDto>;

// Transfer Route Types (matches actual database schema)
export interface TransferRoute extends BaseService {
  vehicleCompanyId: number;
  vehicleCompany?: VehicleCompany;
  vehicleTypeId: number | null;
  vehicleType?: VehicleType;
  fromCityId: number;
  fromCity?: City;
  toCityId: number;
  toCity?: City;
  pricePerVehicle: number | null;
  currency: string | null;
  durationHours: number | null;
  distanceKm: number | null;
  notes: string | null;
}

export interface CreateTransferRouteDto {
  vehicleCompanyId: number;
  vehicleTypeId?: number;
  fromCityId: number;
  toCityId: number;
  pricePerVehicle?: number;
  currency?: string;
  durationHours?: number;
  distanceKm?: number;
  notes?: string;
}

export type UpdateTransferRouteDto = Partial<CreateTransferRouteDto>;

// Guide Types (matches actual database schema)
export interface Guide extends BaseService {
  supplierId: number | null;
  guideName: string;
  phone: string | null;
  email: string | null;
  languages: string | null; // JSON string in database
  dailyRate: number | null;
  halfDayRate: number | null;
  nightRate: number | null;
  transferRate: number | null;
  currency: string | null;
  specializations: string | null; // JSON string in database
  licenseNumber: string | null;
  profilePictureUrl: string | null;
  notes: string | null;
}

export interface CreateGuideDto {
  supplierId?: number;
  guideName: string;
  phone?: string;
  email?: string;
  languages?: string;
  dailyRate?: number;
  halfDayRate?: number;
  nightRate?: number;
  transferRate?: number;
  currency?: string;
  specializations?: string;
  licenseNumber?: string;
  profilePictureUrl?: string;
  notes?: string;
}

export type UpdateGuideDto = Partial<CreateGuideDto>;

// Restaurant Types (matches actual database schema)
export interface Restaurant extends BaseService {
  supplierId: number | null;
  restaurantName: string;
  cityId: number;
  city?: City;
  address: string | null;
  phone: string | null;
  lunchPrice: number | null;
  dinnerPrice: number | null;
  currency: string | null;
  capacity: number | null;
  cuisineType: string | null; // JSON string in database
  menuOptions: string | null;
  pictureUrl: string | null;
  notes: string | null;
}

export interface CreateRestaurantDto {
  supplierId?: number;
  restaurantName: string;
  cityId: number;
  address?: string;
  phone?: string;
  lunchPrice?: number;
  dinnerPrice?: number;
  currency?: string;
  capacity?: number;
  cuisineType?: string;
  menuOptions?: string;
  pictureUrl?: string;
  notes?: string;
}

export type UpdateRestaurantDto = Partial<CreateRestaurantDto>;

// Entrance Fee Types (matches actual database schema)
export interface EntranceFee extends BaseService {
  supplierId: number | null;
  siteName: string;
  cityId: number;
  city?: City;
  adultPrice: number | null;
  childPrice: number | null;
  studentPrice: number | null;
  seniorPrice: number | null;
  currency: string | null;
  openingHours: string | null;
  bestVisitTime: string | null;
  pictureUrl: string | null;
  notes: string | null;
}

export interface CreateEntranceFeeDto {
  supplierId?: number;
  siteName: string;
  cityId: number;
  adultPrice?: number;
  childPrice?: number;
  studentPrice?: number;
  seniorPrice?: number;
  currency?: string;
  openingHours?: string;
  bestVisitTime?: string;
  pictureUrl?: string;
  notes?: string;
}

export type UpdateEntranceFeeDto = Partial<CreateEntranceFeeDto>;

// Extra Expense Types (matches actual database schema)
export interface ExtraExpense extends BaseService {
  supplierId: number | null;
  expenseName: string;
  expenseCategory: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
}

export interface CreateExtraExpenseDto {
  supplierId?: number;
  expenseName: string;
  expenseCategory?: string;
  price?: number;
  currency?: string;
  description?: string;
  notes?: string;
}

export type UpdateExtraExpenseDto = Partial<CreateExtraExpenseDto>;

// Tour Company Types (matches actual database schema)
export interface TourCompany extends BaseService {
  supplierId: number | null;
  companyName: string;
  tourName: string | null;
  tourType: string | null;
  durationDays: number | null;
  durationHours: number | null;
  sicPrice: number | null;
  pvtPrice2Pax: number | null;
  pvtPrice4Pax: number | null;
  pvtPrice6Pax: number | null;
  pvtPrice8Pax: number | null;
  pvtPrice10Pax: number | null;
  currency: string | null;
  minPassengers: number | null;
  maxPassengers: number | null;
  currentBookings: number | null;
  itinerary: string | null;
  inclusions: string | null;
  exclusions: string | null;
  pictureUrl: string | null;
  notes: string | null;
}

export interface CreateTourCompanyDto {
  supplierId?: number;
  companyName: string;
  tourName?: string;
  tourType?: string;
  durationDays?: number;
  durationHours?: number;
  sicPrice?: number;
  pvtPrice2Pax?: number;
  pvtPrice4Pax?: number;
  pvtPrice6Pax?: number;
  pvtPrice8Pax?: number;
  pvtPrice10Pax?: number;
  currency?: string;
  minPassengers?: number;
  maxPassengers?: number;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  pictureUrl?: string;
  notes?: string;
}

export type UpdateTourCompanyDto = Partial<CreateTourCompanyDto>;

// Supplier Types (matches actual database schema)
export interface Supplier extends BaseService {
  supplierType: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cityId: number | null;
  city?: City;
  taxId: string | null;
  paymentTerms: string | null;
  bankAccountInfo: string | null;
  notes: string | null;
}

export interface CreateSupplierDto {
  supplierType: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityId?: number;
  taxId?: string;
  paymentTerms?: string;
  bankAccountInfo?: string;
  notes?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

// API Response Types
export interface PaginatedResponse<T> {
  data: {
    [key: string]: T[] | any; // Dynamic key for different endpoints (hotels, entrance_fees, etc.)
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: number;
  status?: 'Active' | 'Inactive';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
