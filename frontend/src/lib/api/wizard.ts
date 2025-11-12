/**
 * Booking Wizard API Service
 *
 * API service functions for fetching wizard-related data including
 * clients, cities, hotels, transfers, tours, guides, restaurants, etc.
 *
 * @module lib/api/wizard
 */

import { apiClient } from './client';
import type {
  Client,
  OperatorsClient,
  City,
  Currency,
  Hotel,
  HotelRoomType,
  TransferRoute,
  VehicleRental,
  TourCompany,
  Guide,
  Restaurant,
  EntranceFee,
  ExtraExpense,
  TaxRate,
  ExchangeRate,
  CancellationPolicy,
  PromotionalCode,
  MarketingCampaign,
} from '@/types/wizard';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Clients API
 */

/**
 * Search B2C clients
 */
export async function searchClients(
  search: string,
  clientType: 'B2C' | 'B2B' = 'B2C'
): Promise<Client[]> {
  try {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients', {
      params: { search, client_type: clientType },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
}

/**
 * Get client by ID
 */
export async function getClient(id: number): Promise<Client> {
  try {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    throw error;
  }
}

/**
 * Create B2C client
 */
export async function createClient(data: Partial<Client>): Promise<Client> {
  try {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

/**
 * Search B2B clients (Operators Clients)
 */
export async function searchOperatorsClients(search: string): Promise<OperatorsClient[]> {
  try {
    const response = await apiClient.get<ApiResponse<OperatorsClient[]>>('/operators-clients', {
      params: { search },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching operators clients:', error);
    throw error;
  }
}

/**
 * Get operators client by ID
 */
export async function getOperatorsClient(id: number): Promise<OperatorsClient> {
  try {
    const response = await apiClient.get<ApiResponse<OperatorsClient>>(`/operators-clients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching operators client ${id}:`, error);
    throw error;
  }
}

/**
 * Create B2B client
 */
export async function createOperatorsClient(
  data: Partial<OperatorsClient>
): Promise<OperatorsClient> {
  try {
    const response = await apiClient.post<ApiResponse<OperatorsClient>>('/operators-clients', data);
    return response.data;
  } catch (error) {
    console.error('Error creating operators client:', error);
    throw error;
  }
}

/**
 * Cities API
 */

/**
 * Get all cities
 */
export async function getCities(): Promise<City[]> {
  try {
    const response = await apiClient.get<ApiResponse<City[]>>('/cities');
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
}

/**
 * Get city by ID
 */
export async function getCity(id: number): Promise<City> {
  try {
    const response = await apiClient.get<ApiResponse<City>>(`/cities/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching city ${id}:`, error);
    throw error;
  }
}

/**
 * Currencies API
 */

/**
 * Get all currencies
 */
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await apiClient.get<ApiResponse<Currency[]>>('/currencies');
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
}

/**
 * Hotels API
 */

/**
 * Get hotels, optionally filtered by city
 */
export async function getHotels(cityId?: number): Promise<Hotel[]> {
  try {
    const response = await apiClient.get<ApiResponse<Hotel[]>>('/hotels', {
      params: cityId ? { city_id: cityId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
}

/**
 * Get hotel by ID
 */
export async function getHotel(id: number): Promise<Hotel> {
  try {
    const response = await apiClient.get<ApiResponse<Hotel>>(`/hotels/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hotel ${id}:`, error);
    throw error;
  }
}

/**
 * Get hotel room types for a specific hotel
 */
export async function getHotelRoomTypes(hotelId: number): Promise<HotelRoomType[]> {
  try {
    const response = await apiClient.get<ApiResponse<HotelRoomType[]>>('/hotel-room-types', {
      params: { hotel_id: hotelId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching hotel room types for hotel ${hotelId}:`, error);
    throw error;
  }
}

/**
 * Transfer Routes API
 */

/**
 * Get transfer routes, optionally filtered by from/to cities
 */
export async function getTransferRoutes(
  fromCityId?: number,
  toCityId?: number
): Promise<TransferRoute[]> {
  try {
    const params: any = {};
    if (fromCityId) params.from_city_id = fromCityId;
    if (toCityId) params.to_city_id = toCityId;

    const response = await apiClient.get<ApiResponse<TransferRoute[]>>('/transfer-routes', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transfer routes:', error);
    throw error;
  }
}

/**
 * Vehicle Rentals API
 */

/**
 * Get all vehicle rentals
 */
export async function getVehicleRentals(): Promise<VehicleRental[]> {
  try {
    const response = await apiClient.get<ApiResponse<VehicleRental[]>>('/vehicle-rentals');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle rentals:', error);
    throw error;
  }
}

/**
 * Get vehicle rental by ID
 */
export async function getVehicleRental(id: number): Promise<VehicleRental> {
  try {
    const response = await apiClient.get<ApiResponse<VehicleRental>>(`/vehicle-rentals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle rental ${id}:`, error);
    throw error;
  }
}

/**
 * Tour Companies API
 */

/**
 * Get all tour companies (tours)
 */
export async function getTourCompanies(): Promise<TourCompany[]> {
  try {
    const response = await apiClient.get<ApiResponse<TourCompany[]>>('/tour-companies');
    return response.data;
  } catch (error) {
    console.error('Error fetching tour companies:', error);
    throw error;
  }
}

/**
 * Get tour company by ID
 */
export async function getTourCompany(id: number): Promise<TourCompany> {
  try {
    const response = await apiClient.get<ApiResponse<TourCompany>>(`/tour-companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tour company ${id}:`, error);
    throw error;
  }
}

/**
 * Guides API
 */

/**
 * Get all guides
 */
export async function getGuides(): Promise<Guide[]> {
  try {
    const response = await apiClient.get<ApiResponse<Guide[]>>('/guides');
    return response.data;
  } catch (error) {
    console.error('Error fetching guides:', error);
    throw error;
  }
}

/**
 * Get guide by ID
 */
export async function getGuide(id: number): Promise<Guide> {
  try {
    const response = await apiClient.get<ApiResponse<Guide>>(`/guides/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching guide ${id}:`, error);
    throw error;
  }
}

/**
 * Restaurants API
 */

/**
 * Get restaurants, optionally filtered by city
 */
export async function getRestaurants(cityId?: number): Promise<Restaurant[]> {
  try {
    const response = await apiClient.get<ApiResponse<Restaurant[]>>('/restaurants', {
      params: cityId ? { city_id: cityId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}

/**
 * Get restaurant by ID
 */
export async function getRestaurant(id: number): Promise<Restaurant> {
  try {
    const response = await apiClient.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${id}:`, error);
    throw error;
  }
}

/**
 * Entrance Fees API
 */

/**
 * Get entrance fees, optionally filtered by city
 */
export async function getEntranceFees(cityId?: number): Promise<EntranceFee[]> {
  try {
    const response = await apiClient.get<ApiResponse<EntranceFee[]>>('/entrance-fees', {
      params: cityId ? { city_id: cityId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching entrance fees:', error);
    throw error;
  }
}

/**
 * Get entrance fee by ID
 */
export async function getEntranceFee(id: number): Promise<EntranceFee> {
  try {
    const response = await apiClient.get<ApiResponse<EntranceFee>>(`/entrance-fees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching entrance fee ${id}:`, error);
    throw error;
  }
}

/**
 * Extra Expenses API
 */

/**
 * Get all extra expenses
 */
export async function getExtraExpenses(): Promise<ExtraExpense[]> {
  try {
    const response = await apiClient.get<ApiResponse<ExtraExpense[]>>('/extra-expenses');
    return response.data;
  } catch (error) {
    console.error('Error fetching extra expenses:', error);
    throw error;
  }
}

/**
 * Tax Rates API
 */

/**
 * Get all tax rates
 */
export async function getTaxRates(): Promise<TaxRate[]> {
  try {
    const response = await apiClient.get<ApiResponse<TaxRate[]>>('/tax-rates');
    return response.data;
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    throw error;
  }
}

/**
 * Exchange Rates API
 */

/**
 * Get all exchange rates
 */
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const response = await apiClient.get<ApiResponse<ExchangeRate[]>>('/exchange-rates');
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

/**
 * Get exchange rate for specific currency pair
 */
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  try {
    const rates = await getExchangeRates();
    const rate = rates.find(
      r => r.fromCurrencyCode === fromCurrency && r.toCurrencyCode === toCurrency && r.isActive
    );
    return rate?.rate || 1;
  } catch (error) {
    console.error(`Error fetching exchange rate ${fromCurrency} to ${toCurrency}:`, error);
    return 1; // Default to 1 if not found
  }
}

/**
 * Cancellation Policies API
 */

/**
 * Get all cancellation policies
 */
export async function getCancellationPolicies(): Promise<CancellationPolicy[]> {
  try {
    const response =
      await apiClient.get<ApiResponse<CancellationPolicy[]>>('/cancellation-policies');
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellation policies:', error);
    throw error;
  }
}

/**
 * Promotional Codes API
 */

/**
 * Validate promotional code
 */
export async function validatePromoCode(code: string): Promise<PromotionalCode | null> {
  try {
    const response = await apiClient.get<ApiResponse<PromotionalCode>>(
      '/promotional-codes/validate',
      {
        params: { code },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error validating promo code ${code}:`, error);
    return null;
  }
}

/**
 * Marketing Campaigns API
 */

/**
 * Get active marketing campaigns
 */
export async function getMarketingCampaigns(): Promise<MarketingCampaign[]> {
  try {
    const response = await apiClient.get<ApiResponse<MarketingCampaign[]>>('/marketing-campaigns', {
      params: { is_active: true },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    throw error;
  }
}

/**
 * Booking Submission
 */

/**
 * Create complete booking with passengers and services
 */
export async function createCompleteBooking(data: {
  booking: any;
  passengers: any[];
  services: any[];
}): Promise<any> {
  try {
    // Create booking
    const bookingResponse = await apiClient.post<ApiResponse<any>>('/bookings', data.booking);
    const booking = bookingResponse.data;

    // Create passengers
    const passengerPromises = data.passengers.map(passenger =>
      apiClient.post('/booking-passengers', {
        ...passenger,
        booking_id: booking.id,
      })
    );

    // Create services
    const servicePromises = data.services.map(service =>
      apiClient.post('/booking-services', {
        ...service,
        booking_id: booking.id,
      })
    );

    // Wait for all to complete
    await Promise.all([...passengerPromises, ...servicePromises]);

    return booking;
  } catch (error) {
    console.error('Error creating complete booking:', error);
    throw error;
  }
}

/**
 * Wizard API service object
 */
export const wizardApi = {
  // Clients
  searchClients,
  getClient,
  createClient,
  searchOperatorsClients,
  getOperatorsClient,
  createOperatorsClient,
  // Cities & Currencies
  getCities,
  getCity,
  getCurrencies,
  // Hotels
  getHotels,
  getHotel,
  getHotelRoomTypes,
  // Transfers & Vehicles
  getTransferRoutes,
  getVehicleRentals,
  getVehicleRental,
  // Tours & Guides
  getTourCompanies,
  getTourCompany,
  getGuides,
  getGuide,
  // Restaurants & Fees
  getRestaurants,
  getRestaurant,
  getEntranceFees,
  getEntranceFee,
  getExtraExpenses,
  // Pricing
  getTaxRates,
  getExchangeRates,
  getExchangeRate,
  getCancellationPolicies,
  validatePromoCode,
  getMarketingCampaigns,
  // Submission
  createCompleteBooking,
};
