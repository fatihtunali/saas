'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * TableSearch Component
 *
 * Global search input for data tables.
 *
 * Features:
 * - Debounced search input
 * - Clear button
 * - Search icon
 * - Keyboard shortcuts
 *
 * @example
 * ```tsx
 * <TableSearch
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search bookings..."
 * />
 * ```
 */

export interface TableSearchProps {
  /** Search query value */
  value?: string;
  /** Callback when search changes */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Custom class name */
  className?: string;
}

export function TableSearch({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}: TableSearchProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced callback
    debounceRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
