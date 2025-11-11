'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

/**
 * FormField Component
 *
 * A wrapper component for form fields with label, error message, and help text.
 *
 * Features:
 * - Label with optional required indicator
 * - Error message display
 * - Help text support
 * - Consistent spacing and layout
 * - Integrates with React Hook Form
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   required
 *   error={errors.email?.message}
 *   helperText="We'll never share your email"
 * >
 *   <Input {...register('email')} />
 * </FormField>
 * ```
 */

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Field ID (for label htmlFor) */
  id?: string;
  /** Children (form input) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  id,
  children,
  className,
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || generatedId;

  // Clone children to pass id prop
  const childrenWithId = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        id: fieldId,
        'aria-invalid': !!error,
        'aria-describedby': error
          ? `${fieldId}-error`
          : helperText
            ? `${fieldId}-helper`
            : undefined,
      });
    }
    return child;
  });

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-red-500" aria-label="required">
              *
            </span>
          )}
        </Label>
      )}

      {childrenWithId}

      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${fieldId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
