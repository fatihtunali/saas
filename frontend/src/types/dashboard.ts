/**
 * Dashboard TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the dashboard
 * API integration, including stats, charts, activity, and upcoming tours.
 */

/**
 * Trend indicator for metrics
 */
export interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'neutral';
}

/**
 * Individual metric with trend information
 */
export interface MetricData {
  current: number;
  previous: number;
  trend: TrendData;
}

/**
 * Dashboard statistics overview
 */
export interface DashboardStats {
  bookings: MetricData;
  revenue: MetricData;
  receivables: MetricData;
  payables: MetricData;
  lastUpdated: string;
}

/**
 * Single data point for revenue chart
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

/**
 * Revenue chart data with period information
 */
export interface RevenueChartData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: RevenueDataPoint[];
  total: number;
  average: number;
}

/**
 * Booking status breakdown item
 */
export interface BookingStatusData {
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  count: number;
  percentage: number;
  revenue: number;
}

/**
 * Bookings chart data with status breakdown
 */
export interface BookingsChartData {
  statusBreakdown: BookingStatusData[];
  total: number;
  lastUpdated: string;
}

/**
 * Activity type discriminator
 */
export type ActivityType = 'bookings' | 'payments' | 'modifications';

/**
 * Base activity item interface
 */
interface BaseActivityItem {
  id: number;
  timestamp: string;
  type: ActivityType;
}

/**
 * Booking activity item
 */
export interface BookingActivityItem extends BaseActivityItem {
  type: 'bookings';
  bookingId: number;
  customerName: string;
  tourName: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

/**
 * Payment activity item
 */
export interface PaymentActivityItem extends BaseActivityItem {
  type: 'payments';
  paymentId: number;
  bookingId: number;
  customerName: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Modification activity item
 */
export interface ModificationActivityItem extends BaseActivityItem {
  type: 'modifications';
  bookingId: number;
  customerName: string;
  changeType: string;
  description: string;
}

/**
 * Union type for all activity items
 */
export type ActivityItem = BookingActivityItem | PaymentActivityItem | ModificationActivityItem;

/**
 * Recent activity data response
 */
export interface RecentActivityData {
  type: ActivityType;
  items: ActivityItem[];
  total: number;
  limit: number;
}

/**
 * Upcoming tour information
 */
export interface UpcomingTour {
  id: number;
  tourName: string;
  startDate: string;
  endDate: string;
  destination: string;
  bookingsCount: number;
  capacity: number;
  revenue: number;
  status: 'confirmed' | 'pending' | 'full';
}

/**
 * Upcoming tours response
 */
export interface UpcomingToursData {
  tours: UpcomingTour[];
  total: number;
  limit: number;
}

/**
 * API Response wrapper for dashboard endpoints
 */
export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Global Search Types
 */

/**
 * Search result entity types
 */
export type SearchResultType = 'booking' | 'client' | 'quotation';

/**
 * Base search result interface
 */
interface BaseSearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle: string;
  status: string;
  link: string;
}

/**
 * Booking search result
 */
export interface BookingSearchResult extends BaseSearchResult {
  type: 'booking';
  bookingCode: string;
  clientName: string;
  destination: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

/**
 * Client search result
 */
export interface ClientSearchResult extends BaseSearchResult {
  type: 'client';
  name: string;
  email: string;
  phone: string;
  clientType: 'B2C' | 'B2B';
  status: 'B2C' | 'B2B';
}

/**
 * Quotation search result
 */
export interface QuotationSearchResult extends BaseSearchResult {
  type: 'quotation';
  quotationCode: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

/**
 * Union type for all search results
 */
export type SearchResult = BookingSearchResult | ClientSearchResult | QuotationSearchResult;

/**
 * Grouped search results by type
 */
export interface GroupedSearchResults {
  bookings: BookingSearchResult[];
  clients: ClientSearchResult[];
  quotations: QuotationSearchResult[];
}

/**
 * Global search response data
 */
export interface GlobalSearchData {
  results: GroupedSearchResults;
  total: number;
  query: string;
}

/**
 * Recent search item stored in localStorage
 */
export interface RecentSearch {
  query: string;
  timestamp: number;
}
