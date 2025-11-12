// Common Types
export interface City {
  id: number;
  city_name: string;
  country_code: string;
  region: string;
  timezone: string;
  is_active: boolean;
}

export interface BaseService {
  id: number;
  operator_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Hotel Types (matches actual database schema)
export interface Hotel extends BaseService {
  supplier_id: number | null;
  hotel_name: string;
  star_rating: number | null;
  city_id: number;
  city?: City;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_per_person_double: number | null;
  single_supplement: number | null;
  price_per_person_triple: number | null;
  child_price_0_2: number | null;
  child_price_3_5: number | null;
  child_price_6_11: number | null;
  currency: string | null;
  meal_plan: string | null;
  meal_plan_supplement: number | null;
  facilities: string | null;
  picture_url: string | null;
  notes: string | null;
}

export interface CreateHotelDto {
  supplier_id?: number;
  hotel_name: string;
  star_rating?: number;
  city_id: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  price_per_person_double?: number;
  single_supplement?: number;
  price_per_person_triple?: number;
  child_price_0_2?: number;
  child_price_3_5?: number;
  child_price_6_11?: number;
  currency?: string;
  meal_plan?: string;
  meal_plan_supplement?: number;
  facilities?: string;
  picture_url?: string;
  notes?: string;
}

export type UpdateHotelDto = Partial<CreateHotelDto>;

// Vehicle Company Types (matches actual database schema)
export interface VehicleCompany extends BaseService {
  supplier_id: number | null;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
}

export interface CreateVehicleCompanyDto {
  supplier_id?: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

export type UpdateVehicleCompanyDto = Partial<CreateVehicleCompanyDto>;

// Vehicle Type Types (matches actual database schema)
export interface VehicleType extends BaseService {
  vehicle_company_id: number;
  vehicle_type: string;
  capacity: number | null;
  luggage_capacity: number | null;
  notes: string | null;
}

export interface CreateVehicleTypeDto {
  vehicle_company_id: number;
  vehicle_type: string;
  capacity?: number;
  luggage_capacity?: number;
  notes?: string;
}

export type UpdateVehicleTypeDto = Partial<CreateVehicleTypeDto>;

// Vehicle Rental Types (matches actual database schema)
export interface VehicleRental extends BaseService {
  vehicle_company_id: number;
  vehicle_type_id: number;
  full_day_price: number | null;
  full_day_hours: number | null;
  full_day_km: number | null;
  half_day_price: number | null;
  half_day_hours: number | null;
  half_day_km: number | null;
  night_rental_price: number | null;
  night_rental_hours: number | null;
  night_rental_km: number | null;
  extra_hour_rate: number | null;
  extra_km_rate: number | null;
  currency: string | null;
  notes: string | null;
}

export interface CreateVehicleRentalDto {
  vehicle_company_id: number;
  vehicle_type_id: number;
  full_day_price?: number;
  full_day_hours?: number;
  full_day_km?: number;
  half_day_price?: number;
  half_day_hours?: number;
  half_day_km?: number;
  night_rental_price?: number;
  night_rental_hours?: number;
  night_rental_km?: number;
  extra_hour_rate?: number;
  extra_km_rate?: number;
  currency?: string;
  notes?: string;
}

export type UpdateVehicleRentalDto = Partial<CreateVehicleRentalDto>;

// Transfer Route Types (matches actual database schema)
export interface TransferRoute extends BaseService {
  vehicle_company_id: number;
  vehicle_type_id: number | null;
  from_city_id: number;
  to_city_id: number;
  price_per_vehicle: number | null;
  currency: string | null;
  duration_hours: number | null;
  distance_km: number | null;
  notes: string | null;
}

export interface CreateTransferRouteDto {
  vehicle_company_id: number;
  vehicle_type_id?: number;
  from_city_id: number;
  to_city_id: number;
  price_per_vehicle?: number;
  currency?: string;
  duration_hours?: number;
  distance_km?: number;
  notes?: string;
}

export type UpdateTransferRouteDto = Partial<CreateTransferRouteDto>;

// Guide Types (matches actual database schema)
export interface Guide extends BaseService {
  supplier_id: number | null;
  guide_name: string;
  phone: string | null;
  email: string | null;
  languages: string | null; // JSON string in database
  daily_rate: number | null;
  half_day_rate: number | null;
  night_rate: number | null;
  transfer_rate: number | null;
  currency: string | null;
  specializations: string | null; // JSON string in database
  license_number: string | null;
  profile_picture_url: string | null;
  notes: string | null;
}

export interface CreateGuideDto {
  supplier_id?: number;
  guide_name: string;
  phone?: string;
  email?: string;
  languages?: string;
  daily_rate?: number;
  half_day_rate?: number;
  night_rate?: number;
  transfer_rate?: number;
  currency?: string;
  specializations?: string;
  license_number?: string;
  profile_picture_url?: string;
  notes?: string;
}

export type UpdateGuideDto = Partial<CreateGuideDto>;

// Restaurant Types (matches actual database schema)
export interface Restaurant extends BaseService {
  supplier_id: number | null;
  restaurant_name: string;
  city_id: number;
  city?: City;
  address: string | null;
  phone: string | null;
  lunch_price: number | null;
  dinner_price: number | null;
  currency: string | null;
  capacity: number | null;
  cuisine_type: string | null; // JSON string in database
  menu_options: string | null;
  picture_url: string | null;
  notes: string | null;
}

export interface CreateRestaurantDto {
  supplier_id?: number;
  restaurant_name: string;
  city_id: number;
  address?: string;
  phone?: string;
  lunch_price?: number;
  dinner_price?: number;
  currency?: string;
  capacity?: number;
  cuisine_type?: string;
  menu_options?: string;
  picture_url?: string;
  notes?: string;
}

export type UpdateRestaurantDto = Partial<CreateRestaurantDto>;

// Entrance Fee Types (matches actual database schema)
export interface EntranceFee extends BaseService {
  supplier_id: number | null;
  site_name: string;
  city_id: number;
  city?: City;
  adult_price: number | null;
  child_price: number | null;
  student_price: number | null;
  senior_price: number | null;
  currency: string | null;
  opening_hours: string | null;
  best_visit_time: string | null;
  picture_url: string | null;
  notes: string | null;
}

export interface CreateEntranceFeeDto {
  supplier_id?: number;
  site_name: string;
  city_id: number;
  adult_price?: number;
  child_price?: number;
  student_price?: number;
  senior_price?: number;
  currency?: string;
  opening_hours?: string;
  best_visit_time?: string;
  picture_url?: string;
  notes?: string;
}

export type UpdateEntranceFeeDto = Partial<CreateEntranceFeeDto>;

// Extra Expense Types (matches actual database schema)
export interface ExtraExpense extends BaseService {
  supplier_id: number | null;
  expense_name: string;
  expense_category: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
}

export interface CreateExtraExpenseDto {
  supplier_id?: number;
  expense_name: string;
  expense_category?: string;
  price?: number;
  currency?: string;
  description?: string;
  notes?: string;
}

export type UpdateExtraExpenseDto = Partial<CreateExtraExpenseDto>;

// Tour Company Types (matches actual database schema)
export interface TourCompany extends BaseService {
  supplier_id: number | null;
  company_name: string;
  tour_name: string | null;
  tour_type: string | null;
  duration_days: number | null;
  duration_hours: number | null;
  sic_price: number | null;
  pvt_price_2_pax: number | null;
  pvt_price_4_pax: number | null;
  pvt_price_6_pax: number | null;
  pvt_price_8_pax: number | null;
  pvt_price_10_pax: number | null;
  currency: string | null;
  min_passengers: number | null;
  max_passengers: number | null;
  current_bookings: number | null;
  itinerary: string | null;
  inclusions: string | null;
  exclusions: string | null;
  picture_url: string | null;
  notes: string | null;
}

export interface CreateTourCompanyDto {
  supplier_id?: number;
  company_name: string;
  tour_name?: string;
  tour_type?: string;
  duration_days?: number;
  duration_hours?: number;
  sic_price?: number;
  pvt_price_2_pax?: number;
  pvt_price_4_pax?: number;
  pvt_price_6_pax?: number;
  pvt_price_8_pax?: number;
  pvt_price_10_pax?: number;
  currency?: string;
  min_passengers?: number;
  max_passengers?: number;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  picture_url?: string;
  notes?: string;
}

export type UpdateTourCompanyDto = Partial<CreateTourCompanyDto>;

// Supplier Types (matches actual database schema)
export interface Supplier extends BaseService {
  supplier_type: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city_id: number | null;
  city?: City;
  tax_id: string | null;
  payment_terms: string | null;
  bank_account_info: string | null;
  notes: string | null;
}

export interface CreateSupplierDto {
  supplier_type: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city_id?: number;
  tax_id?: string;
  payment_terms?: string;
  bank_account_info?: string;
  notes?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

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
  city_id?: number;
  status?: 'Active' | 'Inactive';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
