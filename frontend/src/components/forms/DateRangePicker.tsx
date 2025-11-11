'use client';

import * as React from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * DateRangePicker Component
 *
 * A date range picker with preset options for common ranges.
 *
 * Features:
 * - Select start and end dates
 * - Preset ranges (Today, This Week, This Month, etc.)
 * - Visual range preview in calendar
 * - Min/max date validation
 * - Ensures end date >= start date
 *
 * @example
 * ```tsx
 * <DateRangePicker
 *   value={{ from: startDate, to: endDate }}
 *   onChange={setDateRange}
 *   placeholder="Select date range"
 * />
 * ```
 */

export interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Show preset buttons */
  showPresets?: boolean;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
}

interface DateRangePreset {
  label: string;
  range: DateRange;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  minDate,
  maxDate,
  showPresets = true,
  className,
  error = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setRange(value);
  }, [value]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    onChange?.(selectedRange);

    // Close popup if both dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      setOpen(false);
    }
  };

  const handlePresetClick = (preset: DateRange) => {
    setRange(preset);
    onChange?.(preset);
    setOpen(false);
  };

  const presets: DateRangePreset[] = [
    {
      label: 'Today',
      range: { from: new Date(), to: new Date() },
    },
    {
      label: 'Yesterday',
      range: { from: addDays(new Date(), -1), to: addDays(new Date(), -1) },
    },
    {
      label: 'This Week',
      range: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
    },
    {
      label: 'Last 7 Days',
      range: { from: addDays(new Date(), -7), to: new Date() },
    },
    {
      label: 'This Month',
      range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    },
    {
      label: 'Last 30 Days',
      range: { from: addDays(new Date(), -30), to: new Date() },
    },
  ];

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDateRange = () => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, 'PPP');
    return `${format(range.from, 'PPP')} - ${format(range.to, 'PPP')}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !range && 'text-muted-foreground',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          disabled={disabled}
          aria-label={placeholder}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {showPresets && (
            <div className="flex flex-col gap-1 border-r p-3">
              <div className="text-xs font-semibold mb-2">Presets</div>
              {presets.map(preset => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  onClick={() => handlePresetClick(preset.range)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <div className="p-3">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              disabled={isDateDisabled}
              numberOfMonths={2}
              initialFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
