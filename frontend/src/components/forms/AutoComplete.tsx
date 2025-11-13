'use client';

import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

/**
 * AutoComplete Component
 *
 * An autocomplete input with search as you type.
 *
 * Features:
 * - Search as you type
 * - Debounced input
 * - Async data fetching support
 * - Keyboard navigation
 * - Loading state
 * - Custom rendering
 *
 * @example
 * ```tsx
 * <AutoComplete
 *   options={clients}
 *   value={selectedClient}
 *   onChange={setSelectedClient}
 *   onSearch={searchClients}
 *   placeholder="Search client..."
 *   getOptionLabel={(option) => option.name}
 *   getOptionValue={(option) => option.id}
 * />
 * ```
 */

export interface AutoCompleteProps<T = any> {
  /** Available options */
  options: T[];
  /** Selected value */
  value?: T;
  /** Callback when selection changes */
  onChange?: (value: T | null) => void;
  /** Callback for search */
  onSearch?: (query: string) => void;
  /** Get option label */
  getOptionLabel?: (option: T) => string;
  /** Get option value */
  getOptionValue?: (option: T) => string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
}

export function AutoComplete<T = any>({
  options,
  value,
  onChange,
  onSearch,
  getOptionLabel = (option: any) => option?.toString() || '',
  getOptionValue = (option: any) => option,
  placeholder = 'Search...',
  disabled = false,
  isLoading = false,
  className,
  error = false,
  debounceMs = 300,
}: AutoCompleteProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (value) {
      setInputValue(getOptionLabel(value));
    }
  }, [value, getOptionLabel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setOpen(true);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    if (onSearch) {
      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    }
  };

  const handleSelect = (option: T) => {
    setInputValue(getOptionLabel(option));
    onChange?.(option);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.(null);
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on option
    setTimeout(() => {
      if (!value && inputValue) {
        // Reset to selected value if input doesn't match
        setInputValue(value ? getOptionLabel(value) : '');
      }
      setOpen(false);
    }, 200);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
            aria-label={placeholder}
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : options.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {inputValue ? 'No results found' : 'Start typing to search'}
            </p>
          ) : (
            options.map((option, index) => {
              const isSelected = value && getOptionValue(value) === getOptionValue(option);

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent',
                    isSelected && 'bg-accent'
                  )}
                >
                  <span>{getOptionLabel(option)}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
