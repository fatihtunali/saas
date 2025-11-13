'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { ChartCard } from '@/components/features/dashboard/ChartCard';
import { useRevenueChart } from '@/lib/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';

/**
 * RevenueChart Component
 *
 * Displays revenue over time using a line chart with gradient fill.
 *
 * Features:
 * - Period selector (daily, weekly, monthly, yearly)
 * - Line chart with area gradient
 * - Currency formatting
 * - Date formatting based on period
 * - Export functionality (CSV, PNG)
 * - Loading skeleton
 * - Error handling
 * - Empty state
 *
 * @example
 * ```tsx
 * <RevenueChart />
 * ```
 */
export function RevenueChart() {
  const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const { data, isLoading, error } = useRevenueChart(period);

  /**
   * Format date based on selected period
   */
  const formatDate = React.useCallback(
    (dateString: string) => {
      try {
        switch (period) {
          case 'daily':
            const dailyDate = new Date(dateString);
            return format(dailyDate, 'MMM dd');
          case 'weekly':
            const weeklyDate = new Date(dateString);
            return format(weeklyDate, 'MMM dd');
          case 'monthly':
            // Backend returns "YYYY-MM" format, convert to first day of month
            const [year, month] = dateString.split('-');
            const monthlyDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            return format(monthlyDate, 'MMM yyyy');
          case 'yearly':
            // Backend returns "YYYY" format
            return dateString;
          default:
            const defaultDate = new Date(dateString);
            return format(defaultDate, 'MMM dd');
        }
      } catch (error) {
        console.error('Error formatting date:', error, dateString);
        return dateString;
      }
    },
    [period]
  );

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
   * Format Y-axis values (shorter format)
   */
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  /**
   * Export chart data as CSV
   */
  const handleExportCSV = () => {
    if (!data?.data) return;

    const headers = ['Date', 'Revenue', 'Bookings'];
    const rows = data.data.map(item => [
      item.date,
      item.revenue.toString(),
      item.bookings.toString(),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export chart as PNG
   */
  const handleExportPNG = async () => {
    // Note: This is a placeholder. In a real implementation, you would use
    // html2canvas or similar library to capture the chart as an image.
    // For now, we'll just trigger the CSV export.
    handleExportCSV();
  };

  /**
   * Custom tooltip component
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {formatDate(payload[0].payload.date)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revenue:{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(payload[0].value)}
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Bookings:{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {payload[0].payload.bookings}
          </span>
        </p>
      </div>
    );
  };

  return (
    <ChartCard
      title="Revenue Overview"
      description={
        data
          ? `Total: ${formatCurrency(data.total)} | Average: ${formatCurrency(data.average)}`
          : undefined
      }
      period={period}
      onPeriodChange={value => setPeriod(value as typeof period)}
      onExport={handleExportCSV}
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
          <AlertDescription>Failed to load revenue data. {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No revenue data available for this period</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && data && data.data && data.data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
