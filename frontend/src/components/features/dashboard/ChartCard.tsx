'use client';

import * as React from 'react';
import { Download } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * ChartCard Component
 *
 * Card wrapper for charts with title, period selector, and export.
 *
 * Features:
 * - Title and subtitle
 * - Time period selector
 * - Export button
 * - Responsive
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Revenue Overview"
 *   description="Monthly revenue for the year"
 *   period="monthly"
 *   onPeriodChange={setPeriod}
 *   onExport={handleExport}
 * >
 *   <LineChart data={data} />
 * </ChartCard>
 * ```
 */

export interface ChartCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Selected time period */
  period?: string;
  /** Period options */
  periodOptions?: Array<{ value: string; label: string }>;
  /** Period change handler */
  onPeriodChange?: (period: string) => void;
  /** Export handler */
  onExport?: () => void;
  /** Chart content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

const DEFAULT_PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function ChartCard({
  title,
  description,
  period,
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  onPeriodChange,
  onExport,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('min-h-[400px] flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {onPeriodChange && period && (
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
