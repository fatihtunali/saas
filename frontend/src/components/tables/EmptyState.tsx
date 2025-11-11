'use client';

import * as React from 'react';
import { FileQuestion } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * EmptyState Component
 *
 * Empty state display for tables with no data.
 *
 * Features:
 * - Icon display
 * - Title and description
 * - Optional action button
 * - Customizable
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Plus className="h-12 w-12" />}
 *   title="No bookings found"
 *   description="Get started by creating your first booking"
 *   action={{
 *     label: "Create Booking",
 *     onClick: () => router.push('/bookings/new')
 *   }}
 * />
 * ```
 */

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom class name */
  className?: string;
}

export function EmptyState({
  icon,
  title = 'No results found',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="text-muted-foreground mb-4">
        {icon || <FileQuestion className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
