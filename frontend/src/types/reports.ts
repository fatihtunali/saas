// ============================================
// REPORT FILTERS & COMMON TYPES
// ============================================

export interface ReportFilters {
  start_date: string;
  end_date: string;
  currency?: string;
  client_type?: 'b2b' | 'b2c' | 'all';
  status?: string;
  service_type?: string;
  payment_status?: string;
  commission_type?: string;
  as_of_date?: string;
  client_id?: number;
}

export interface DatePreset {
  label: string;
  value: string;
  start_date: Date;
  end_date: Date;
}

// ============================================
// FINANCIAL REPORTS
// ============================================

// 1. Revenue Report
export interface RevenueReportData {
  date: string;
  booking_reference: string;
  client_name: string;
  total_amount: number;
  currency_code: string;
  total_in_base_currency: number;
  payment_status: string;
  client_type: string;
}

export interface ServiceBreakdown {
  service_type: string;
  booking_count: number;
  total_revenue: number;
}

export interface ClientTypeBreakdown {
  client_type: string;
  count: number;
  revenue: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface RevenueReportResponse {
  summary: {
    total_revenue: number;
    total_bookings: number;
    average_booking_value: number;
    growth_percentage: number;
  };
  data: RevenueReportData[];
  service_breakdown: ServiceBreakdown[];
  client_type_breakdown: ClientTypeBreakdown[];
  chart_data: RevenueChartData[];
}

// 2. Profit & Loss Statement
export interface ServiceProfitData {
  service_type: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface MonthlyProfitData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProfitLossReportResponse {
  summary: {
    total_revenue: number;
    total_cost: number;
    gross_profit: number;
    profit_margin: number;
  };
  service_breakdown: ServiceProfitData[];
  monthly_data: MonthlyProfitData[];
}

// 3. Receivables Aging Report
export interface ReceivableData {
  booking_reference: string;
  client_name: string;
  client_type: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  amount_due: number;
  days_outstanding: number;
  aging_bucket: 'current' | '31-60' | '61-90' | '90+';
}

export interface AgingBucket {
  count: number;
  amount: number;
}

export interface ReceivablesAgingReportResponse {
  summary: {
    total_outstanding: number;
    current: number;
    days_31_60: number;
    days_61_90: number;
    days_90_plus: number;
  };
  aging_buckets: {
    current: AgingBucket;
    '31-60': AgingBucket;
    '61-90': AgingBucket;
    '90+': AgingBucket;
  };
  data: ReceivableData[];
}

// 4. Payables Aging Report
export interface PayableData {
  booking_reference: string;
  supplier_name: string;
  invoice_date: string;
  due_date: string;
  amount_owed: number;
  status: string;
  days_until_due: number;
  aging_bucket: 'current' | '31-60' | '61-90' | 'overdue';
  payment_status: string;
}

export interface PayablesAgingReportResponse {
  summary: {
    total_payables: number;
    current: number;
    days_31_60: number;
    days_61_90: number;
    overdue: number;
  };
  aging_buckets: {
    current: AgingBucket;
    '31-60': AgingBucket;
    '61-90': AgingBucket;
    overdue: AgingBucket;
  };
  data: PayableData[];
}

// 5. Commission Report
export interface CommissionData {
  booking_reference: string;
  commission_type: string;
  recipient_name: string;
  base_amount: number;
  commission_percentage: number;
  commission_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

export interface CommissionTypeBreakdown {
  commission_type: string;
  count: number;
  total_amount: number;
}

export interface CommissionStatusBreakdown {
  status: string;
  count: number;
  total_amount: number;
}

export interface CommissionReportResponse {
  summary: {
    total_commissions_earned: number;
    total_commissions_paid: number;
    pending_commissions: number;
    commission_count: number;
  };
  data: CommissionData[];
  type_breakdown: CommissionTypeBreakdown[];
  status_breakdown: CommissionStatusBreakdown[];
}

// ============================================
// BOOKING REPORTS
// ============================================

// 6. Bookings by Date Range
export interface BookingByDateData {
  booking_date: string;
  booking_reference: string;
  client_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
}

export interface DailyStats {
  date: string;
  booking_count: number;
  total_revenue: number;
}

export interface DayOfWeekStats {
  day_name: string;
  day_number: number;
  booking_count: number;
  avg_value: number;
}

export interface BookingsByDateReportResponse {
  summary: {
    total_bookings: number;
    total_revenue: number;
    average_booking_value: number;
    conversion_rate: number;
  };
  data: BookingByDateData[];
  daily_stats: DailyStats[];
  day_of_week_stats: DayOfWeekStats[];
}

// 7. Bookings by Status
export interface StatusData {
  status: string;
  count: number;
  percentage: number;
  total_amount: number;
  average_value: number;
}

export interface MonthlyStatusTrend {
  month: string;
  status: string;
  count: number;
}

export interface BookingsByStatusReportResponse {
  summary: {
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
  };
  data: StatusData[];
  monthly_trends: MonthlyStatusTrend[];
}

// 8. Bookings by Destination
export interface DestinationData {
  destination: string;
  booking_count: number;
  total_revenue: number;
  average_value: number;
  percentage: number;
}

export interface BookingsByDestinationReportResponse {
  summary: {
    total_destinations: number;
    top_destination: string;
    total_bookings: number;
    average_stay_duration: number;
  };
  data: DestinationData[];
}

// 9. Cancellation Report
export interface CancellationData {
  booking_reference: string;
  client_name: string;
  booking_date: string;
  cancelled_date: string;
  start_date: string;
  days_before_trip: number;
  cancellation_reason: string | null;
  refund_amount: number;
  refund_status: string;
}

export interface CancellationReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface MonthlyCancellationTrend {
  month: string;
  cancellation_count: number;
}

export interface CancellationReportResponse {
  summary: {
    total_cancellations: number;
    cancellation_rate: number;
    total_refunds_processed: number;
    average_days_before_trip: number;
  };
  data: CancellationData[];
  reasons_breakdown: CancellationReason[];
  monthly_trend: MonthlyCancellationTrend[];
}

// 10. Booking Source Analysis
export interface SourceData {
  source: string;
  booking_count: number;
  total_revenue: number;
  average_value: number;
  percentage_of_total: number;
}

export interface MonthlySourceTrend {
  month: string;
  client_type: string;
  booking_count: number;
  revenue: number;
}

export interface TopB2BClient {
  client_name: string;
  booking_count: number;
  total_revenue: number;
  average_value: number;
}

export interface BookingSourcesReportResponse {
  summary: {
    b2b_bookings: number;
    b2b_revenue: number;
    b2b_average_value: number;
    b2c_bookings: number;
    b2c_revenue: number;
    b2c_average_value: number;
  };
  source_breakdown: SourceData[];
  monthly_trend: MonthlySourceTrend[];
  top_b2b_clients: TopB2BClient[];
}

// ============================================
// OPERATIONS REPORTS
// ============================================

// 11. Service Utilization Report
export interface ServiceUtilizationData {
  service_type: string;
  booking_count: number;
  total_revenue: number;
  average_price: number;
  utilization_rate: number;
}

export interface MonthlyServiceTrend {
  month: string;
  service_type: string;
  booking_count: number;
}

export interface ServiceUtilizationReportResponse {
  summary: {
    total_services_booked: number;
    most_popular_service: string;
    total_service_revenue: number;
    average_services_per_booking: number;
  };
  data: ServiceUtilizationData[];
  monthly_trend: MonthlyServiceTrend[];
}

// 12. Guide Performance Report
export interface GuidePerformanceData {
  guide_id: number;
  guide_name: string;
  languages: string;
  booking_count: number;
  total_revenue: number;
  average_revenue: number;
  utilization_days: number;
}

export interface GuidePerformanceReportResponse {
  summary: {
    active_guides_count: number;
    total_guide_bookings: number;
    total_guide_revenue: number;
    average_revenue_per_guide: number;
  };
  data: GuidePerformanceData[];
}

// 13. Hotel Occupancy Report
export interface HotelOccupancyData {
  hotel_id: number;
  hotel_name: string;
  city: string;
  star_rating: number;
  booking_count: number;
  total_room_nights: number;
  total_revenue: number;
  average_rate: number;
}

export interface HotelCityBreakdown {
  city: string;
  booking_count: number;
  total_revenue: number;
}

export interface HotelOccupancyReportResponse {
  summary: {
    total_hotels_used: number;
    total_room_nights: number;
    total_hotel_revenue: number;
    average_rate_per_night: number;
  };
  data: HotelOccupancyData[];
  city_breakdown: HotelCityBreakdown[];
}

// 14. Vehicle Utilization Report
export interface VehicleUtilizationData {
  vehicle_type: string;
  vehicle_company: string;
  rental_count: number;
  total_days_rented: number;
  total_revenue: number;
  average_daily_rate: number;
}

export interface VehicleTypeBreakdown {
  vehicle_type: string;
  rental_count: number;
  total_revenue: number;
}

export interface VehicleUtilizationReportResponse {
  summary: {
    total_vehicle_rentals: number;
    total_revenue: number;
    most_popular_vehicle_type: string;
    average_rental_duration: number;
  };
  data: VehicleUtilizationData[];
  type_breakdown: VehicleTypeBreakdown[];
}

// ============================================
// CLIENT REPORTS
// ============================================

// 15. Client Revenue Analysis
export interface ClientRevenueData {
  client_id: number;
  client_name: string;
  client_type: string;
  booking_count: number;
  total_revenue: number;
  average_booking_value: number;
  last_booking_date: string;
}

export interface ClientTypeRevenueBreakdown {
  client_type: string;
  revenue: number;
}

export interface ClientRevenueReportResponse {
  summary: {
    total_active_clients: number;
    top_client_by_revenue: string;
    average_revenue_per_client: number;
    repeat_customer_rate: number;
  };
  data: ClientRevenueData[];
  client_type_breakdown: ClientTypeRevenueBreakdown[];
}

// 16. Client Booking History
export interface ClientBookingHistoryData {
  id: number;
  booking_date: string;
  booking_reference: string;
  start_date: string;
  destination: string;
  services_used: string;
  total_amount: number;
  payment_status: string;
  booking_status: string;
}

export interface ClientInfo {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface ClientServiceBreakdown {
  service_type: string;
  count: number;
}

export interface ClientBookingHistoryReportResponse {
  client_info: ClientInfo;
  summary: {
    total_bookings: number;
    total_spent: number;
    average_booking_value: number;
    last_booking_date: string | null;
  };
  data: ClientBookingHistoryData[];
  service_breakdown: ClientServiceBreakdown[];
}

// 17. Outstanding Balances Report
export interface OutstandingBalanceData {
  client_id: number;
  client_name: string;
  client_type: string;
  booking_reference: string;
  invoice_date: string;
  due_date: string;
  days_outstanding: number;
  amount_due: number;
  aging_bucket: 'current' | '31-60' | '61-90' | '90+';
}

export interface OutstandingBalancesReportResponse {
  summary: {
    total_outstanding_amount: number;
    number_of_clients_with_balance: number;
    largest_outstanding_balance: number;
    average_days_outstanding: number;
  };
  aging_buckets: {
    current: AgingBucket;
    '31-60': AgingBucket;
    '61-90': AgingBucket;
    '90+': AgingBucket;
  };
  data: OutstandingBalanceData[];
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  filename: string;
  format: 'excel' | 'pdf';
  data: any[];
  columns: ExportColumn[];
  title?: string;
  summary?: Record<string, any>;
}

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: 'currency' | 'date' | 'number' | 'percentage' | 'text';
}

// ============================================
// REPORT METADATA
// ============================================

export interface ReportMetadata {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'booking' | 'operations' | 'client';
  icon: string;
  path: string;
}

export const REPORT_CATEGORIES = [
  { id: 'financial', label: 'Financial Reports', icon: 'DollarSign' },
  { id: 'booking', label: 'Booking Reports', icon: 'Calendar' },
  { id: 'operations', label: 'Operations Reports', icon: 'Settings' },
  { id: 'client', label: 'Client Reports', icon: 'Users' },
] as const;

export const ALL_REPORTS: ReportMetadata[] = [
  // Financial Reports
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Track total revenue by date range, service type, and client type',
    category: 'financial',
    icon: 'TrendingUp',
    path: '/dashboard/reports/financial/revenue',
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss Statement',
    description: 'Calculate profit margins by comparing revenue to costs',
    category: 'financial',
    icon: 'DollarSign',
    path: '/dashboard/reports/financial/profit-loss',
  },
  {
    id: 'receivables-aging',
    title: 'Receivables Aging Report',
    description: 'Track outstanding client payments by age',
    category: 'financial',
    icon: 'Receipt',
    path: '/dashboard/reports/financial/receivables-aging',
  },
  {
    id: 'payables-aging',
    title: 'Payables Aging Report',
    description: 'Track outstanding supplier payments',
    category: 'financial',
    icon: 'CreditCard',
    path: '/dashboard/reports/financial/payables-aging',
  },
  {
    id: 'commissions',
    title: 'Commission Report',
    description: 'Track commission earnings and payments',
    category: 'financial',
    icon: 'Percent',
    path: '/dashboard/reports/financial/commissions',
  },
  // Booking Reports
  {
    id: 'bookings-by-date',
    title: 'Bookings by Date Range',
    description: 'Analyze booking volume and trends',
    category: 'booking',
    icon: 'Calendar',
    path: '/dashboard/reports/bookings/by-date',
  },
  {
    id: 'bookings-by-status',
    title: 'Bookings by Status',
    description: 'Track booking status distribution',
    category: 'booking',
    icon: 'CheckCircle',
    path: '/dashboard/reports/bookings/by-status',
  },
  {
    id: 'bookings-by-destination',
    title: 'Bookings by Destination',
    description: 'Identify popular destinations',
    category: 'booking',
    icon: 'MapPin',
    path: '/dashboard/reports/bookings/by-destination',
  },
  {
    id: 'cancellations',
    title: 'Cancellation Report',
    description: 'Analyze cancellation patterns and reasons',
    category: 'booking',
    icon: 'XCircle',
    path: '/dashboard/reports/bookings/cancellations',
  },
  {
    id: 'booking-sources',
    title: 'Booking Source Analysis',
    description: 'Compare B2B vs B2C performance',
    category: 'booking',
    icon: 'GitBranch',
    path: '/dashboard/reports/bookings/sources',
  },
  // Operations Reports
  {
    id: 'service-utilization',
    title: 'Service Utilization Report',
    description: 'Track which services are most frequently booked',
    category: 'operations',
    icon: 'Activity',
    path: '/dashboard/reports/operations/service-utilization',
  },
  {
    id: 'guide-performance',
    title: 'Guide Performance Report',
    description: 'Track guide bookings and revenue',
    category: 'operations',
    icon: 'User',
    path: '/dashboard/reports/operations/guide-performance',
  },
  {
    id: 'hotel-occupancy',
    title: 'Hotel Occupancy Report',
    description: 'Track hotel usage statistics',
    category: 'operations',
    icon: 'Building',
    path: '/dashboard/reports/operations/hotel-occupancy',
  },
  {
    id: 'vehicle-utilization',
    title: 'Vehicle Utilization Report',
    description: 'Track vehicle rental frequency',
    category: 'operations',
    icon: 'Car',
    path: '/dashboard/reports/operations/vehicle-utilization',
  },
  // Client Reports
  {
    id: 'client-revenue',
    title: 'Client Revenue Analysis',
    description: 'Identify top clients by revenue',
    category: 'client',
    icon: 'TrendingUp',
    path: '/dashboard/reports/clients/revenue-analysis',
  },
  {
    id: 'client-history',
    title: 'Client Booking History',
    description: 'Detailed client activity tracking',
    category: 'client',
    icon: 'History',
    path: '/dashboard/reports/clients/booking-history',
  },
  {
    id: 'outstanding-balances',
    title: 'Outstanding Balances Report',
    description: 'Track clients with pending payments',
    category: 'client',
    icon: 'AlertTriangle',
    path: '/dashboard/reports/clients/outstanding-balances',
  },
];
