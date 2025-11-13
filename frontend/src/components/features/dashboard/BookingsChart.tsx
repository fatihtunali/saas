'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';
import { useRouter } from 'next/navigation';
import { ChartCard } from '@/components/features/dashboard/ChartCard';
import { useBookingsChart } from '@/lib/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar } from 'lucide-react';
import type { BookingStatusData } from '@/types/dashboard';

/**
 * Color mapping for booking statuses
 */
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#10B981', // green
  pending: '#F59E0B', // yellow/orange
  cancelled: '#EF4444', // red
  completed: '#3B82F6', // blue
};

/**
 * BookingsChart Component
 *
 * Displays bookings breakdown by status using a pie chart.
 *
 * Features:
 * - Pie chart with 4 segments (Confirmed, Pending, Cancelled, Completed)
 * - Click segment to navigate to bookings page with status filter
 * - Percentage and count labels
 * - Color-coded legend
 * - Center label showing total bookings
 * - Tooltip with details
 * - Loading skeleton
 * - Error handling
 * - Empty state
 *
 * @example
 * ```tsx
 * <BookingsChart />
 * ```
 */
export function BookingsChart() {
  const router = useRouter();
  const { data, isLoading, error } = useBookingsChart();

  /**
   * Format currency for display
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Handle segment click - navigate to bookings page with status filter
   */
  const handleSegmentClick = (entry: BookingStatusData) => {
    router.push(`/bookings?status=${entry.status}`);
  };

  /**
   * Custom label for pie chart showing percentage and count
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is greater than 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  /**
   * Custom tooltip component
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as BookingStatusData;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 capitalize">
          {data.status}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Count:{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{data.count || 0}</span>
        </p>
        {data.percentage !== undefined && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage:{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {data.percentage.toFixed(1)}%
            </span>
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revenue:{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.revenue || 0)}
          </span>
        </p>
      </div>
    );
  };

  /**
   * Custom legend component
   */
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {entry.value}: {entry.payload.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Center label showing total bookings
   */
  const CenterLabel = ({ viewBox, total }: any) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-3xl font-bold fill-gray-900 dark:fill-gray-100"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-sm fill-gray-600 dark:fill-gray-400"
        >
          Total Bookings
        </text>
      </g>
    );
  };

  return (
    <ChartCard
      title="Bookings by Status"
      description={
        data ? `Last updated: ${new Date(data.lastUpdated).toLocaleDateString()}` : undefined
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-[300px] w-full" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load bookings data. {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.statusBreakdown || data.statusBreakdown.length === 0) && (
        <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bookings data available</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && data && data.statusBreakdown.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.statusBreakdown as any[]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="count"
              onClick={handleSegmentClick}
              className="cursor-pointer focus:outline-none"
              animationDuration={500}
            >
              {data.statusBreakdown.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status] || '#6B7280'}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
              <Label content={<CenterLabel total={data.totalBookings} />} position="center" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
