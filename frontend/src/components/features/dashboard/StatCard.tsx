'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * StatCard Component
 *
 * Dashboard statistics card with metric display and trend indicator.
 *
 * Features:
 * - Metric display (number + label)
 * - Trend indicator (up/down arrow)
 * - Percentage change
 * - Icon support
 * - Color variants
 * - Loading state
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Revenue"
 *   value="$45,231.89"
 *   change={+20.1}
 *   icon={DollarSign}
 *   variant="success"
 * />
 * ```
 */

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value/metric */
  value: string | number;
  /** Description or subtitle */
  description?: string;
  /** Percentage change (positive or negative) */
  change?: number;
  /** Change period label */
  changePeriod?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Loading state */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
}

const variantColors = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
};

export function StatCard({
  title,
  value,
  description,
  change,
  changePeriod = 'from last month',
  icon: Icon,
  variant = 'default',
  isLoading = false,
  className,
}: StatCardProps) {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', variantColors[variant])} />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {change !== undefined && (
              <div className="flex items-center text-xs mt-2">
                {isPositiveChange && (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">+{change}%</span>
                  </>
                )}
                {isNegativeChange && (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                    <span className="text-red-600 font-medium">{change}%</span>
                  </>
                )}
                {change === 0 && <span className="text-muted-foreground font-medium">0%</span>}
                <span className="ml-1 text-muted-foreground">{changePeriod}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
