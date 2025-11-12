/**
 * Booking Wizard React Query Hooks
 *
 * Custom hooks for fetching and mutating wizard-related data using React Query.
 * Includes hooks for clients, cities, hotels, transfers, tours, and complete booking submission.
 *
 * @module lib/hooks/useBookingWizard
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  searchClients,
  searchOperatorsClients,
  createClient,
  createOperatorsClient,
  getCities,
  getCurrencies,
  getHotels,
  getHotelRoomTypes,
  getTransferRoutes,
  getVehicleRentals,
  getTourCompanies,
  getGuides,
  getRestaurants,
  getEntranceFees,
  getExtraExpenses,
  getTaxRates,
  getExchangeRates,
  getExchangeRate,
  getCancellationPolicies,
  validatePromoCode,
  getMarketingCampaigns,
  createCompleteBooking,
} from '@/lib/api/wizard';
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
 * Query keys for wizard data
 */
export const wizardKeys = {
  all: ['wizard'] as const,
  clients: () => [...wizardKeys.all, 'clients'] as const,
  clientSearch: (query: string, type: 'B2C' | 'B2B') =>
    [...wizardKeys.clients(), 'search', query, type] as const,
  operatorsClients: () => [...wizardKeys.all, 'operators-clients'] as const,
  operatorsClientSearch: (query: string) =>
    [...wizardKeys.operatorsClients(), 'search', query] as const,
  cities: () => [...wizardKeys.all, 'cities'] as const,
  currencies: () => [...wizardKeys.all, 'currencies'] as const,
  hotels: (cityId?: number) => [...wizardKeys.all, 'hotels', cityId] as const,
  hotelRoomTypes: (hotelId: number) => [...wizardKeys.all, 'hotel-room-types', hotelId] as const,
  transferRoutes: (fromCityId?: number, toCityId?: number) =>
    [...wizardKeys.all, 'transfer-routes', fromCityId, toCityId] as const,
  vehicleRentals: () => [...wizardKeys.all, 'vehicle-rentals'] as const,
  tourCompanies: () => [...wizardKeys.all, 'tour-companies'] as const,
  guides: () => [...wizardKeys.all, 'guides'] as const,
  restaurants: (cityId?: number) => [...wizardKeys.all, 'restaurants', cityId] as const,
  entranceFees: (cityId?: number) => [...wizardKeys.all, 'entrance-fees', cityId] as const,
  extraExpenses: () => [...wizardKeys.all, 'extra-expenses'] as const,
  taxRates: () => [...wizardKeys.all, 'tax-rates'] as const,
  exchangeRates: () => [...wizardKeys.all, 'exchange-rates'] as const,
  exchangeRate: (from: string, to: string) =>
    [...wizardKeys.all, 'exchange-rate', from, to] as const,
  cancellationPolicies: () => [...wizardKeys.all, 'cancellation-policies'] as const,
  promoCode: (code: string) => [...wizardKeys.all, 'promo-code', code] as const,
  marketingCampaigns: () => [...wizardKeys.all, 'marketing-campaigns'] as const,
};

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Fix: Import useEffect
import { useEffect } from 'react';

/**
 * STEP 1: Client Selection Hooks
 */

/**
 * Search B2C clients with debouncing
 */
export function useSearchClients(
  searchQuery: string,
  clientType: 'B2C' | 'B2B' = 'B2C'
): UseQueryResult<Client[], Error> {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: wizardKeys.clientSearch(debouncedQuery, clientType),
    queryFn: () => searchClients(debouncedQuery, clientType),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Search B2B clients (operators clients) with debouncing
 */
export function useSearchOperatorsClients(
  searchQuery: string
): UseQueryResult<OperatorsClient[], Error> {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: wizardKeys.operatorsClientSearch(debouncedQuery),
    queryFn: () => searchOperatorsClients(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });
}

/**
 * Create B2C client
 */
export function useCreateClient(): UseMutationResult<Client, Error, Partial<Client>> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wizardKeys.clients() });
    },
  });
}

/**
 * Create B2B client
 */
export function useCreateOperatorsClient(): UseMutationResult<
  OperatorsClient,
  Error,
  Partial<OperatorsClient>
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOperatorsClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wizardKeys.operatorsClients() });
    },
  });
}

/**
 * STEP 2: Trip Details Hooks
 */

/**
 * Get all cities
 */
export function useCities(): UseQueryResult<City[], Error> {
  return useQuery({
    queryKey: wizardKeys.cities(),
    queryFn: getCities,
    staleTime: 60 * 60 * 1000, // 1 hour - cities don't change often
  });
}

/**
 * Get all currencies
 */
export function useCurrencies(): UseQueryResult<Currency[], Error> {
  return useQuery({
    queryKey: wizardKeys.currencies(),
    queryFn: getCurrencies,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * STEP 4: Services Selection Hooks
 */

/**
 * Get hotels, optionally filtered by city
 */
export function useHotels(cityId?: number): UseQueryResult<Hotel[], Error> {
  return useQuery({
    queryKey: wizardKeys.hotels(cityId),
    queryFn: () => getHotels(cityId),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get hotel room types for a specific hotel
 */
export function useHotelRoomTypes(
  hotelId: number,
  enabled: boolean = true
): UseQueryResult<HotelRoomType[], Error> {
  return useQuery({
    queryKey: wizardKeys.hotelRoomTypes(hotelId),
    queryFn: () => getHotelRoomTypes(hotelId),
    enabled: enabled && !!hotelId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get transfer routes, optionally filtered by from/to cities
 */
export function useTransferRoutes(
  fromCityId?: number,
  toCityId?: number
): UseQueryResult<TransferRoute[], Error> {
  return useQuery({
    queryKey: wizardKeys.transferRoutes(fromCityId, toCityId),
    queryFn: () => getTransferRoutes(fromCityId, toCityId),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get all vehicle rentals
 */
export function useVehicleRentals(): UseQueryResult<VehicleRental[], Error> {
  return useQuery({
    queryKey: wizardKeys.vehicleRentals(),
    queryFn: getVehicleRentals,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get all tour companies (tours)
 */
export function useTourCompanies(): UseQueryResult<TourCompany[], Error> {
  return useQuery({
    queryKey: wizardKeys.tourCompanies(),
    queryFn: getTourCompanies,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get all guides
 */
export function useGuides(): UseQueryResult<Guide[], Error> {
  return useQuery({
    queryKey: wizardKeys.guides(),
    queryFn: getGuides,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get restaurants, optionally filtered by city
 */
export function useRestaurants(cityId?: number): UseQueryResult<Restaurant[], Error> {
  return useQuery({
    queryKey: wizardKeys.restaurants(cityId),
    queryFn: () => getRestaurants(cityId),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get entrance fees, optionally filtered by city
 */
export function useEntranceFees(cityId?: number): UseQueryResult<EntranceFee[], Error> {
  return useQuery({
    queryKey: wizardKeys.entranceFees(cityId),
    queryFn: () => getEntranceFees(cityId),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get all extra expenses
 */
export function useExtraExpenses(): UseQueryResult<ExtraExpense[], Error> {
  return useQuery({
    queryKey: wizardKeys.extraExpenses(),
    queryFn: getExtraExpenses,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * STEP 5: Pricing & Summary Hooks
 */

/**
 * Get all tax rates
 */
export function useTaxRates(): UseQueryResult<TaxRate[], Error> {
  return useQuery({
    queryKey: wizardKeys.taxRates(),
    queryFn: getTaxRates,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get all exchange rates
 */
export function useExchangeRates(): UseQueryResult<ExchangeRate[], Error> {
  return useQuery({
    queryKey: wizardKeys.exchangeRates(),
    queryFn: getExchangeRates,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get specific exchange rate
 */
export function useExchangeRate(
  fromCurrency: string,
  toCurrency: string
): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: wizardKeys.exchangeRate(fromCurrency, toCurrency),
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get all cancellation policies
 */
export function useCancellationPolicies(): UseQueryResult<CancellationPolicy[], Error> {
  return useQuery({
    queryKey: wizardKeys.cancellationPolicies(),
    queryFn: getCancellationPolicies,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Validate promotional code
 */
export function useValidatePromoCode(code: string): UseQueryResult<PromotionalCode | null, Error> {
  return useQuery({
    queryKey: wizardKeys.promoCode(code),
    queryFn: () => validatePromoCode(code),
    enabled: code.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get active marketing campaigns
 */
export function useMarketingCampaigns(): UseQueryResult<MarketingCampaign[], Error> {
  return useQuery({
    queryKey: wizardKeys.marketingCampaigns(),
    queryFn: getMarketingCampaigns,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Complete Booking Submission Hook
 */
export function useCreateCompleteBooking(): UseMutationResult<
  any,
  Error,
  {
    booking: any;
    passengers: any[];
    services: any[];
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompleteBooking,
    onSuccess: data => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Invalidate booking stats
      queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] });
    },
  });
}

/**
 * Helper hook for currency conversion
 */
export function useCurrencyConversion() {
  const { data: exchangeRates } = useExchangeRates();

  const convert = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (!exchangeRates || fromCurrency === toCurrency) {
        return amount;
      }

      const rate = exchangeRates.find(
        r => r.fromCurrencyCode === fromCurrency && r.toCurrencyCode === toCurrency && r.isActive
      );

      return rate ? amount * rate.rate : amount;
    },
    [exchangeRates]
  );

  return { convert, exchangeRates };
}

/**
 * Helper hook for calculating booking totals
 */
export function useBookingCalculations() {
  const calculateProfitAmount = (totalCost: number, markupPercentage: number): number => {
    return (totalCost * markupPercentage) / 100;
  };

  const calculateSellingPrice = (totalCost: number, markupPercentage: number): number => {
    return totalCost + calculateProfitAmount(totalCost, markupPercentage);
  };

  const calculateTaxAmount = (price: number, taxRate: number): number => {
    return (price * taxRate) / 100;
  };

  const calculateTotalWithTax = (price: number, taxAmount: number): number => {
    return price + taxAmount;
  };

  const calculateFinalTotal = (totalWithTax: number, discountAmount: number): number => {
    return Math.max(0, totalWithTax - discountAmount);
  };

  const calculateServicesCost = (services: any[]): number => {
    return services.reduce((total, service) => total + (service.costInBaseCurrency || 0), 0);
  };

  return {
    calculateProfitAmount,
    calculateSellingPrice,
    calculateTaxAmount,
    calculateTotalWithTax,
    calculateFinalTotal,
    calculateServicesCost,
  };
}
