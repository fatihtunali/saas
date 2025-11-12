'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from './CurrencyDisplay';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentSummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: 'dollar' | 'trending-up' | 'trending-down' | 'exchange';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

const iconMap = {
  dollar: DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  exchange: ArrowUpDown,
};

const variantStyles = {
  default: 'border-border',
  success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
  warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
  danger: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20',
};

const iconStyles = {
  default: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function PaymentSummaryCard({
  title,
  amount,
  currency = 'TRY',
  trend,
  trendValue,
  icon = 'dollar',
  variant = 'default',
  description,
}: PaymentSummaryCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <CurrencyDisplay amount={amount} currency={currency} className="text-2xl font-bold" />

          {description && <p className="text-xs text-muted-foreground">{description}</p>}

          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs">
              {trend === 'up' && (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">{trendValue}</span>
                </>
              )}
              {trend === 'down' && (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{trendValue}</span>
                </>
              )}
              {trend === 'neutral' && <span className="text-muted-foreground">{trendValue}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
