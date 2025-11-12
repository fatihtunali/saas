'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

import { useStats } from '@/lib/hooks/useDashboard';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { Button } from '@/components/ui/button';

/**
 * MetricsSection Component
 *
 * Displays 4 real-time business metrics using the StatCard component.
 * Shows Total Bookings, Total Revenue, Receivables, and Payables.
 *
 * Features:
 * - Real-time data from useStats() hook
 * - Loading skeleton states
 * - Error handling with retry
 * - Click navigation to detail pages
 * - Currency formatting
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <MetricsSection />
 * ```
 */
export function MetricsSection() {
  const router = useRouter();
  const { data: stats, isLoading, error, refetch } = useStats();

  /**
   * Format number as USD currency
   * @param value - Number to format
   * @returns Formatted currency string (e.g., "$124,503")
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Handle card click navigation
   * @param path - Route path to navigate to
   */
  const handleCardClick = (path: string) => {
    router.push(path);
  };

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value="0"
          icon={Calendar}
          variant="default"
          isLoading={true}
        />
        <StatCard
          title="Total Revenue"
          value="$0"
          icon={DollarSign}
          variant="success"
          isLoading={true}
        />
        <StatCard
          title="Receivables"
          value="$0"
          icon={TrendingUp}
          variant="warning"
          isLoading={true}
        />
        <StatCard
          title="Payables"
          value="$0"
          icon={TrendingDown}
          variant="danger"
          isLoading={true}
        />
      </div>
    );
  }

  // Error state - show error message with retry
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-1">Failed to load metrics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'An error occurred while fetching dashboard statistics.'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="rounded-lg border border-muted bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground text-center">No statistics available</p>
      </div>
    );
  }

  // Success state - show metrics
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Bookings Card */}
      <div
        onClick={() => handleCardClick('/dashboard/bookings')}
        className="cursor-pointer transition-transform hover:scale-105"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick('/dashboard/bookings');
          }
        }}
      >
        <StatCard
          title="Total Bookings"
          value={stats.bookings.current.toLocaleString('en-US')}
          change={stats.bookings.trend.value}
          changePeriod="from last month"
          icon={Calendar}
          variant="default"
        />
      </div>

      {/* Total Revenue Card */}
      <div
        onClick={() => handleCardClick('/dashboard/payments')}
        className="cursor-pointer transition-transform hover:scale-105"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick('/dashboard/payments');
          }
        }}
      >
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue.current)}
          change={stats.revenue.trend.value}
          changePeriod="from last month"
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Receivables Card */}
      <div
        onClick={() => handleCardClick('/dashboard/payments?filter=receivables')}
        className="cursor-pointer transition-transform hover:scale-105"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick('/dashboard/payments?filter=receivables');
          }
        }}
      >
        <StatCard
          title="Receivables"
          value={formatCurrency(stats.receivables.current)}
          change={stats.receivables.trend.value}
          changePeriod="from last month"
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Payables Card */}
      <div
        onClick={() => handleCardClick('/dashboard/payments?filter=payables')}
        className="cursor-pointer transition-transform hover:scale-105"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick('/dashboard/payments?filter=payables');
          }
        }}
      >
        <StatCard
          title="Payables"
          value={formatCurrency(stats.payables.current)}
          change={stats.payables.trend.value}
          changePeriod="from last month"
          icon={TrendingDown}
          variant="danger"
        />
      </div>
    </div>
  );
}
