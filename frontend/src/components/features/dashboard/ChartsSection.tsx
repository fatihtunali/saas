'use client';

import * as React from 'react';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { BookingsChart } from '@/components/features/dashboard/BookingsChart';

/**
 * ChartsSection Component
 *
 * Wrapper component that displays both RevenueChart and BookingsChart
 * in a responsive grid layout.
 *
 * Features:
 * - 2-column grid on desktop (lg breakpoint and above)
 * - 1-column layout on mobile/tablet
 * - Proper spacing and gap between charts
 * - Responsive design
 *
 * @example
 * ```tsx
 * <ChartsSection />
 * ```
 */
export function ChartsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <RevenueChart />
      <BookingsChart />
    </div>
  );
}
