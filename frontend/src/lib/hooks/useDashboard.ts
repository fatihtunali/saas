/**
 * Dashboard React Query Hooks
 *
 * Custom hooks for fetching dashboard data using React Query.
 * These hooks provide loading states, error handling, and automatic refetching.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRevenueChart,
  getBookingsChart,
  getRecentActivity,
  getUpcomingTours,
} from '@/lib/api/dashboard';
import type {
  DashboardStats,
  RevenueChartData,
  BookingsChartData,
  RecentActivityData,
  UpcomingToursData,
  ActivityType,
} from '@/types/dashboard';

/**
 * Query keys for dashboard data
 * Used for cache management and invalidation
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  revenueChart: (period: string) => [...dashboardKeys.all, 'revenue', period] as const,
  bookingsChart: () => [...dashboardKeys.all, 'bookings'] as const,
  activity: (type: ActivityType, limit: number) =>
    [...dashboardKeys.all, 'activity', type, limit] as const,
  upcomingTours: (limit: number) => [...dashboardKeys.all, 'upcoming-tours', limit] as const,
};

/**
 * Fetch dashboard statistics with automatic refetching
 *
 * @returns Query result with dashboard stats data, loading, and error states
 *
 * @example
 * ```typescript
 * function DashboardStats() {
 *   const { data, isLoading, error } = useStats();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <StatsCards data={data} />;
 * }
 * ```
 */
export function useStats(): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Fetch revenue chart data for a specific period
 *
 * @param period - Time period for revenue data (daily, weekly, monthly, yearly)
 * @returns Query result with revenue chart data, loading, and error states
 *
 * @example
 * ```typescript
 * function RevenueChart() {
 *   const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
 *   const { data, isLoading, error } = useRevenueChart(period);
 *
 *   if (isLoading) return <ChartSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <LineChart data={data.data} />;
 * }
 * ```
 */
export function useRevenueChart(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): UseQueryResult<RevenueChartData, Error> {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(period),
    queryFn: () => getRevenueChart(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes - cache longer for charts
  });
}

/**
 * Fetch bookings chart data with status breakdown
 *
 * @returns Query result with bookings chart data, loading, and error states
 *
 * @example
 * ```typescript
 * function BookingsChart() {
 *   const { data, isLoading, error } = useBookingsChart();
 *
 *   if (isLoading) return <ChartSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <PieChart data={data.statusBreakdown} />;
 * }
 * ```
 */
export function useBookingsChart(): UseQueryResult<BookingsChartData, Error> {
  return useQuery({
    queryKey: dashboardKeys.bookingsChart(),
    queryFn: getBookingsChart,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes - cache longer for charts
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Fetch recent activity feed for a specific type
 *
 * @param type - Type of activity to fetch (bookings, payments, or modifications)
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Query result with recent activity data, loading, and error states
 *
 * @example
 * ```typescript
 * function ActivityFeed() {
 *   const [activityType, setActivityType] = useState<ActivityType>('bookings');
 *   const { data, isLoading, error } = useRecentActivity(activityType, 15);
 *
 *   if (isLoading) return <ActivitySkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ActivityList>
 *       {data.items.map(item => (
 *         <ActivityItem key={item.id} item={item} />
 *       ))}
 *     </ActivityList>
 *   );
 * }
 * ```
 */
export function useRecentActivity(
  type: ActivityType,
  limit: number = 10
): UseQueryResult<RecentActivityData, Error> {
  return useQuery({
    queryKey: dashboardKeys.activity(type, limit),
    queryFn: () => getRecentActivity(type, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - activity needs fresher data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Fetch upcoming tours with booking information
 *
 * @param limit - Maximum number of tours to return (default: 5)
 * @returns Query result with upcoming tours data, loading, and error states
 *
 * @example
 * ```typescript
 * function UpcomingToursList() {
 *   const { data, isLoading, error } = useUpcomingTours(10);
 *
 *   if (isLoading) return <ToursSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ToursList>
 *       {data.tours.map(tour => (
 *         <TourCard
 *           key={tour.id}
 *           tour={tour}
 *           occupancy={`${tour.bookingsCount}/${tour.capacity}`}
 *         />
 *       ))}
 *     </ToursList>
 *   );
 * }
 * ```
 */
export function useUpcomingTours(limit: number = 5): UseQueryResult<UpcomingToursData, Error> {
  return useQuery({
    queryKey: dashboardKeys.upcomingTours(limit),
    queryFn: () => getUpcomingTours(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - tours don't change as frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - can cache longer
  });
}
