'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

/**
 * TimePicker Component
 *
 * A time picker component for selecting hours and minutes in 24-hour format.
 *
 * Features:
 * - HH:MM format (24-hour)
 * - Hour and minute selection via dropdowns or input
 * - Validation for valid time ranges
 * - Keyboard input support
 * - Accessible
 *
 * @example
 * ```tsx
 * <TimePicker
 *   value="14:30"
 *   onChange={setTime}
 *   placeholder="Select time"
 * />
 * ```
 */

export interface TimePickerProps {
  /** Time value in HH:MM format */
  value?: string;
  /** Callback when time changes */
  onChange?: (time: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  error = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState<string>('');
  const [minutes, setMinutes] = React.useState<string>('');

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '');
      setMinutes(m || '');
    }
  }, [value]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (/^\d{1,2}$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 23)) {
      setHours(val);
      updateTime(val, minutes);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (/^\d{1,2}$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 59)) {
      setMinutes(val);
      updateTime(hours, val);
    }
  };

  const updateTime = (h: string, m: string) => {
    if (h && m) {
      const formattedHours = h.padStart(2, '0');
      const formattedMinutes = m.padStart(2, '0');
      onChange?.(formattedHours + ':' + formattedMinutes);
    }
  };

  const handleQuickSelect = (h: number, m: number) => {
    const formattedHours = h.toString().padStart(2, '0');
    const formattedMinutes = m.toString().padStart(2, '0');
    setHours(formattedHours);
    setMinutes(formattedMinutes);
    onChange?.(formattedHours + ':' + formattedMinutes);
    setOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    return value;
  };

  const quickTimes = [
    { label: '09:00', hours: 9, minutes: 0 },
    { label: '12:00', hours: 12, minutes: 0 },
    { label: '14:00', hours: 14, minutes: 0 },
    { label: '18:00', hours: 18, minutes: 0 },
  ];

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
          <Clock className="mr-2 h-4 w-4" />
          <span>{formatDisplayTime()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="hours" className="text-xs">
                Hours
              </Label>
              <Input
                id="hours"
                type="text"
                placeholder="HH"
                value={hours}
                onChange={handleHoursChange}
                className="text-center"
                maxLength={2}
              />
            </div>
            <div className="pt-5">:</div>
            <div className="flex-1">
              <Label htmlFor="minutes" className="text-xs">
                Minutes
              </Label>
              <Input
                id="minutes"
                type="text"
                placeholder="MM"
                value={minutes}
                onChange={handleMinutesChange}
                className="text-center"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Quick select</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickTimes.map(time => (
                <Button
                  key={time.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(time.hours, time.minutes)}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
