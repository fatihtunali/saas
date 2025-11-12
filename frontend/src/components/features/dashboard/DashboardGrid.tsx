'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * DashboardGrid Component
 *
 * Responsive grid layout system for dashboard pages.
 *
 * Features:
 * - Mobile-first responsive design
 * - Breakpoints:
 *   - Mobile (< 640px): Single column stack
 *   - Tablet (640px - 1023px): 2-column grid
 *   - Desktop (>= 1024px): 3-column grid
 * - Consistent spacing and gaps
 * - Flexible section layouts
 *
 * @example
 * ```tsx
 * <DashboardGrid>
 *   <DashboardGrid.MetricsSection>
 *     {metrics cards}
 *   </DashboardGrid.MetricsSection>
 *   <DashboardGrid.ChartsSection>
 *     {charts}
 *   </DashboardGrid.ChartsSection>
 * </DashboardGrid>
 * ```
 */

export interface DashboardGridProps {
  /** Grid content sections */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Main dashboard grid container
 */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

/**
 * Full-width metrics section for displaying 4 stat cards in a row
 */
export interface MetricsSectionProps {
  /** Metric cards */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

function MetricsSection({ children, className }: MetricsSectionProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}

/**
 * Charts section for displaying charts side by side
 */
export interface ChartsSectionProps {
  /** Chart components */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

function ChartsSection({ children, className }: ChartsSectionProps) {
  return <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2', className)}>{children}</div>;
}

/**
 * Bottom section with activity feed and quick actions
 * Layout: 2/3 width for activity, 1/3 width for quick actions
 */
export interface BottomSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

function BottomSection({ children, className }: BottomSectionProps) {
  return <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3', className)}>{children}</div>;
}

/**
 * Activity section (2/3 width on desktop)
 */
export interface ActivitySectionProps {
  /** Activity content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

function ActivitySection({ children, className }: ActivitySectionProps) {
  return <div className={cn('lg:col-span-2', className)}>{children}</div>;
}

/**
 * Quick actions section (1/3 width on desktop, sticky)
 */
export interface QuickActionsSectionProps {
  /** Quick actions content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Whether to make the section sticky */
  sticky?: boolean;
}

function QuickActionsSection({ children, className, sticky = true }: QuickActionsSectionProps) {
  return (
    <div className={cn('lg:col-span-1', className)}>
      <div className={cn(sticky && 'lg:sticky lg:top-6')}>{children}</div>
    </div>
  );
}

/**
 * Full-width section for any content
 */
export interface FullWidthSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

function FullWidthSection({ children, className }: FullWidthSectionProps) {
  return <div className={cn('w-full', className)}>{children}</div>;
}

// Attach sub-components to main component
DashboardGrid.MetricsSection = MetricsSection;
DashboardGrid.ChartsSection = ChartsSection;
DashboardGrid.BottomSection = BottomSection;
DashboardGrid.ActivitySection = ActivitySection;
DashboardGrid.QuickActionsSection = QuickActionsSection;
DashboardGrid.FullWidthSection = FullWidthSection;
