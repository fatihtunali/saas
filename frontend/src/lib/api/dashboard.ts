/**
 * Dashboard API Service
 *
 * This module provides API service functions for dashboard data fetching.
 * All functions use the configured Axios client with JWT authentication.
 */

import { apiClient } from './client';
import type {
  DashboardApiResponse,
  DashboardStats,
  RevenueChartData,
  BookingsChartData,
  RecentActivityData,
  UpcomingToursData,
  ActivityType,
  GlobalSearchData,
} from '@/types/dashboard';

/**
 * Fetch dashboard statistics including bookings, revenue, receivables, and payables
 *
 * @returns Promise resolving to dashboard statistics with trends
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const stats = await getDashboardStats();
 * console.log(`Total bookings: ${stats.bookings.current}`);
 * ```
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<DashboardApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}

/**
 * Fetch revenue chart data for a specific time period
 *
 * @param period - Time period for revenue data aggregation
 * @returns Promise resolving to revenue chart data with trend points
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const revenueData = await getRevenueChart('monthly');
 * console.log(`Total revenue: ${revenueData.total}`);
 * ```
 */
export async function getRevenueChart(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Promise<RevenueChartData> {
  try {
    const response = await apiClient.get<DashboardApiResponse<RevenueChartData>>(
      `/dashboard/revenue?period=${period}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch revenue chart for period ${period}:`, error);
    throw error;
  }
}

/**
 * Fetch bookings chart data with status breakdown
 *
 * @returns Promise resolving to bookings breakdown by status
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const bookingsData = await getBookingsChart();
 * const confirmedBookings = bookingsData.statusBreakdown.find(b => b.status === 'confirmed');
 * ```
 */
export async function getBookingsChart(): Promise<BookingsChartData> {
  try {
    const response =
      await apiClient.get<DashboardApiResponse<BookingsChartData>>('/dashboard/bookings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch bookings chart:', error);
    throw error;
  }
}

/**
 * Fetch recent activity feed for a specific activity type
 *
 * @param type - Type of activity to fetch (bookings, payments, or modifications)
 * @param limit - Maximum number of activity items to return
 * @returns Promise resolving to recent activity data
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const recentBookings = await getRecentActivity('bookings', 10);
 * recentBookings.items.forEach(item => {
 *   if (item.type === 'bookings') {
 *     console.log(`Booking: ${item.tourName} - ${item.customerName}`);
 *   }
 * });
 * ```
 */
export async function getRecentActivity(
  type: ActivityType,
  limit: number = 10
): Promise<RecentActivityData> {
  try {
    const response = await apiClient.get<DashboardApiResponse<RecentActivityData>>(
      `/dashboard/activity?type=${type}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch recent activity for type ${type}:`, error);
    throw error;
  }
}

/**
 * Fetch upcoming tours with booking information
 *
 * @param limit - Maximum number of upcoming tours to return
 * @returns Promise resolving to upcoming tours data
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const upcomingTours = await getUpcomingTours(5);
 * upcomingTours.tours.forEach(tour => {
 *   console.log(`${tour.tourName}: ${tour.bookingsCount}/${tour.capacity} bookings`);
 * });
 * ```
 */
export async function getUpcomingTours(limit: number = 5): Promise<UpcomingToursData> {
  try {
    const response = await apiClient.get<DashboardApiResponse<UpcomingToursData>>(
      `/dashboard/upcoming-tours?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch upcoming tours:', error);
    throw error;
  }
}

/**
 * Search globally across bookings, clients, and quotations
 *
 * @param query - Search query string (minimum 2 characters)
 * @returns Promise resolving to grouped search results
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const results = await searchGlobal('John');
 * console.log(`Found ${results.total} results`);
 * results.results.bookings.forEach(booking => {
 *   console.log(`Booking: ${booking.bookingCode}`);
 * });
 * ```
 */
export async function searchGlobal(query: string): Promise<GlobalSearchData> {
  try {
    const response = await apiClient.get<DashboardApiResponse<GlobalSearchData>>(
      `/search?q=${encodeURIComponent(query)}&types=bookings,clients,quotations&limit=5`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to search for "${query}":`, error);
    throw error;
  }
}

/**
 * Dashboard API service object
 * Provides a namespaced API for all dashboard-related operations
 */
export const dashboardApi = {
  getStats: getDashboardStats,
  getRevenueChart,
  getBookingsChart,
  getRecentActivity,
  getUpcomingTours,
  searchGlobal,
};
