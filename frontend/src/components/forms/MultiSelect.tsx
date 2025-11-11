'use client';

import * as React from 'react';
import { X, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

/**
 * MultiSelect Component
 *
 * A multi-select dropdown with search and chip display.
 *
 * Features:
 * - Multiple selection
 * - Search/filter options
 * - Selected items displayed as chips
 * - Clear all button
 * - Max selections limit
 * - Keyboard navigation
 *
 * @example
 * ```tsx
 * <MultiSelect
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   value={['1']}
 *   onChange={setSelected}
 *   placeholder="Select options"
 * />
 * ```
 */

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  /** Available options */
  options: MultiSelectOption[];
  /** Selected values */
  value?: string[];
  /** Callback when selection changes */
  onChange?: (values: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Maximum selections allowed */
  maxSelections?: number;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Show search */
  searchable?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select items',
  disabled = false,
  maxSelections,
  className,
  error = false,
  searchable = true,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  const handleToggle = (optionValue: string) => {
    let newValue: string[];

    if (value.includes(optionValue)) {
      newValue = value.filter(v => v !== optionValue);
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max reached
      }
      newValue = [...value, optionValue];
    }

    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange?.(newValue);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal min-h-10 h-auto',
            !selectedOptions.length && 'text-muted-foreground',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          disabled={disabled}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs"
                >
                  {option.label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-primary-foreground/20 rounded"
                    onClick={e => handleRemove(option.value, e)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2 space-y-2">
          {searchable && (
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9"
            />
          )}

          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">
              {value.length} selected
              {maxSelections && ` / ${maxSelections}`}
            </span>
            {value.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearAll}>
                Clear all
              </Button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No options found</p>
            ) : (
              filteredOptions.map(option => {
                const isSelected = value.includes(option.value);
                const isDisabled =
                  option.disabled ||
                  (!isSelected && !!maxSelections && value.length >= maxSelections);

                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-accent',
                      isSelected && 'bg-accent',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
