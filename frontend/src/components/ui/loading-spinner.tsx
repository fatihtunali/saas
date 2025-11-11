'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * LoadingSpinner Component
 *
 * A loading spinner with size and color variants.
 *
 * Features:
 * - Small, medium, large sizes
 * - Primary, secondary colors
 * - Inline and block variants
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" variant="primary" />
 * ```
 */

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      primary: 'text-primary',
      secondary: 'text-muted-foreground',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Show with text label */
  label?: string;
}

export function LoadingSpinner({ size, variant, label, className, ...props }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Loader2 className={cn(spinnerVariants({ size, variant }))} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
