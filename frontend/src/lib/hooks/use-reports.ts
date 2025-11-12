import { useQuery } from '@tanstack/react-query';
import { api as apiClient } from '@/lib/api-client';
import type {
  ReportFilters,
  RevenueReportResponse,
  ProfitLossReportResponse,
  ReceivablesAgingReportResponse,
  PayablesAgingReportResponse,
  CommissionReportResponse,
  BookingsByDateReportResponse,
  BookingsByStatusReportResponse,
  BookingsByDestinationReportResponse,
  CancellationReportResponse,
  BookingSourcesReportResponse,
  ServiceUtilizationReportResponse,
  GuidePerformanceReportResponse,
  HotelOccupancyReportResponse,
  VehicleUtilizationReportResponse,
  ClientRevenueReportResponse,
  ClientBookingHistoryReportResponse,
  OutstandingBalancesReportResponse,
} from '@/types/reports';

// ============================================
// FINANCIAL REPORTS HOOKS
// ============================================

export const useRevenueReport = (filters: ReportFilters) => {
  return useQuery<RevenueReportResponse>({
    queryKey: ['reports', 'revenue', filters],
    queryFn: () =>
      apiClient.get<RevenueReportResponse>('/api/reports/revenue', { params: filters }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useProfitLossReport = (filters: ReportFilters) => {
  return useQuery<ProfitLossReportResponse>({
    queryKey: ['reports', 'profit-loss', filters],
    queryFn: () =>
      apiClient.get<ProfitLossReportResponse>('/api/reports/profit-loss', { params: filters }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useReceivablesAgingReport = (filters: Partial<ReportFilters> = {}) => {
  return useQuery<ReceivablesAgingReportResponse>({
    queryKey: ['reports', 'receivables-aging', filters],
    queryFn: () =>
      apiClient.get<ReceivablesAgingReportResponse>('/api/reports/receivables-aging', {
        params: filters,
      }),
  });
};

export const usePayablesAgingReport = (filters: Partial<ReportFilters> = {}) => {
  return useQuery<PayablesAgingReportResponse>({
    queryKey: ['reports', 'payables-aging', filters],
    queryFn: () =>
      apiClient.get<PayablesAgingReportResponse>('/api/reports/payables-aging', {
        params: filters,
      }),
  });
};

export const useCommissionReport = (filters: ReportFilters) => {
  return useQuery<CommissionReportResponse>({
    queryKey: ['reports', 'commissions', filters],
    queryFn: () =>
      apiClient.get<CommissionReportResponse>('/api/reports/commissions', { params: filters }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

// ============================================
// BOOKING REPORTS HOOKS
// ============================================

export const useBookingsByDateReport = (filters: ReportFilters) => {
  return useQuery<BookingsByDateReportResponse>({
    queryKey: ['reports', 'bookings-by-date', filters],
    queryFn: () =>
      apiClient.get<BookingsByDateReportResponse>('/api/reports/bookings-by-date', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useBookingsByStatusReport = (filters: ReportFilters) => {
  return useQuery<BookingsByStatusReportResponse>({
    queryKey: ['reports', 'bookings-by-status', filters],
    queryFn: () =>
      apiClient.get<BookingsByStatusReportResponse>('/api/reports/bookings-by-status', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useBookingsByDestinationReport = (filters: ReportFilters) => {
  return useQuery<BookingsByDestinationReportResponse>({
    queryKey: ['reports', 'bookings-by-destination', filters],
    queryFn: () =>
      apiClient.get<BookingsByDestinationReportResponse>('/api/reports/bookings-by-destination', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useCancellationReport = (filters: ReportFilters) => {
  return useQuery<CancellationReportResponse>({
    queryKey: ['reports', 'cancellations', filters],
    queryFn: () =>
      apiClient.get<CancellationReportResponse>('/api/reports/cancellations', { params: filters }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useBookingSourcesReport = (filters: ReportFilters) => {
  return useQuery<BookingSourcesReportResponse>({
    queryKey: ['reports', 'booking-sources', filters],
    queryFn: () =>
      apiClient.get<BookingSourcesReportResponse>('/api/reports/booking-sources', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

// ============================================
// OPERATIONS REPORTS HOOKS
// ============================================

export const useServiceUtilizationReport = (filters: ReportFilters) => {
  return useQuery<ServiceUtilizationReportResponse>({
    queryKey: ['reports', 'service-utilization', filters],
    queryFn: () =>
      apiClient.get<ServiceUtilizationReportResponse>('/api/reports/service-utilization', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useGuidePerformanceReport = (filters: ReportFilters) => {
  return useQuery<GuidePerformanceReportResponse>({
    queryKey: ['reports', 'guide-performance', filters],
    queryFn: () =>
      apiClient.get<GuidePerformanceReportResponse>('/api/reports/guide-performance', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useHotelOccupancyReport = (filters: ReportFilters) => {
  return useQuery<HotelOccupancyReportResponse>({
    queryKey: ['reports', 'hotel-occupancy', filters],
    queryFn: () =>
      apiClient.get<HotelOccupancyReportResponse>('/api/reports/hotel-occupancy', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useVehicleUtilizationReport = (filters: ReportFilters) => {
  return useQuery<VehicleUtilizationReportResponse>({
    queryKey: ['reports', 'vehicle-utilization', filters],
    queryFn: () =>
      apiClient.get<VehicleUtilizationReportResponse>('/api/reports/vehicle-utilization', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

// ============================================
// CLIENT REPORTS HOOKS
// ============================================

export const useClientRevenueReport = (filters: ReportFilters) => {
  return useQuery<ClientRevenueReportResponse>({
    queryKey: ['reports', 'client-revenue', filters],
    queryFn: () =>
      apiClient.get<ClientRevenueReportResponse>('/api/reports/client-revenue', {
        params: filters,
      }),
    enabled: !!(filters.start_date && filters.end_date),
  });
};

export const useClientBookingHistoryReport = (filters: ReportFilters) => {
  return useQuery<ClientBookingHistoryReportResponse>({
    queryKey: ['reports', 'client-history', filters],
    queryFn: () =>
      apiClient.get<ClientBookingHistoryReportResponse>('/api/reports/client-history', {
        params: filters,
      }),
    enabled: !!(filters.client_id && filters.client_type),
  });
};

export const useOutstandingBalancesReport = (filters: Partial<ReportFilters> = {}) => {
  return useQuery<OutstandingBalancesReportResponse>({
    queryKey: ['reports', 'outstanding-balances', filters],
    queryFn: () =>
      apiClient.get<OutstandingBalancesReportResponse>('/api/reports/outstanding-balances', {
        params: filters,
      }),
  });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getDatePresets = () => {
  const today = new Date();
  return [
    {
      label: 'Today',
      value: 'today',
      start_date: new Date(today),
      end_date: new Date(today),
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
    },
    {
      label: 'This Week',
      value: 'this_week',
      start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()),
      end_date: new Date(today),
    },
    {
      label: 'Last Week',
      value: 'last_week',
      start_date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay() - 7
      ),
      end_date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay() - 1
      ),
    },
    {
      label: 'This Month',
      value: 'this_month',
      start_date: new Date(today.getFullYear(), today.getMonth(), 1),
      end_date: new Date(today),
    },
    {
      label: 'Last Month',
      value: 'last_month',
      start_date: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end_date: new Date(today.getFullYear(), today.getMonth(), 0),
    },
    {
      label: 'This Quarter',
      value: 'this_quarter',
      start_date: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
      end_date: new Date(today),
    },
    {
      label: 'This Year',
      value: 'this_year',
      start_date: new Date(today.getFullYear(), 0, 1),
      end_date: new Date(today),
    },
    {
      label: 'Last Year',
      value: 'last_year',
      start_date: new Date(today.getFullYear() - 1, 0, 1),
      end_date: new Date(today.getFullYear() - 1, 11, 31),
    },
  ];
};

export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};
