'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * DatePicker Component
 *
 * A date picker component with calendar popup for selecting single dates.
 *
 * Features:
 * - Calendar popup with date selection
 * - Min/max date restrictions
 * - Disabled dates support
 * - Custom date format
 * - Accessible with keyboard navigation
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Select travel date"
 *   minDate={new Date()}
 * />
 * ```
 */

export interface DatePickerProps {
  /** Selected date value */
  value?: Date;
  /** Callback when date is selected */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text when no date selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of disabled dates */
  disabledDates?: Date[];
  /** Custom date format (default: 'PPP' - e.g., Apr 29, 2023) */
  dateFormat?: string;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  minDate,
  maxDate,
  disabledDates = [],
  dateFormat = 'PPP',
  className,
  error = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDates.some(d => d.toDateString() === date.toDateString())) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          disabled={disabled}
          aria-label={placeholder}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          initialFocus
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
