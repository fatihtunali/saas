'use client';

import * as React from 'react';
import { DollarSign } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * CurrencyInput Component
 *
 * An input component for monetary values with currency selection.
 *
 * Features:
 * - Currency amount input with decimal support
 * - Currency selector dropdown
 * - Thousand separators (optional)
 * - 2 decimal precision
 * - Prevents invalid input
 * - Displays currency symbol
 *
 * @example
 * ```tsx
 * <CurrencyInput
 *   value={1500.50}
 *   currency="USD"
 *   onValueChange={setAmount}
 *   onCurrencyChange={setCurrency}
 * />
 * ```
 */

export interface CurrencyInputProps {
  /** Numeric value */
  value?: number;
  /** Selected currency code */
  currency?: string;
  /** Callback when value changes */
  onValueChange?: (value: number) => void;
  /** Callback when currency changes */
  onCurrencyChange?: (currency: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Show thousand separators */
  showThousandSeparator?: boolean;
  /** Available currencies */
  currencies?: Currency[];
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Allow negative values */
  allowNegative?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export function CurrencyInput({
  value,
  currency = 'USD',
  onValueChange,
  onCurrencyChange,
  placeholder = '0.00',
  disabled = false,
  showThousandSeparator = true,
  currencies = DEFAULT_CURRENCIES,
  className,
  error = false,
  allowNegative = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>('');

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatNumber = (num: number): string => {
    if (showThousandSeparator) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return num.toFixed(2);
  };

  const parseNumber = (str: string): number => {
    // Remove thousand separators and parse
    const cleaned = str.replace(/,/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Allow empty input
    if (inputValue === '') {
      setDisplayValue('');
      onValueChange?.(0);
      return;
    }

    // Remove non-numeric characters except decimal point and minus
    const pattern = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
    inputValue = inputValue.replace(pattern, '');

    // Ensure only one decimal point
    const parts = inputValue.split('.');
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      inputValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setDisplayValue(inputValue);

    // Parse and call onChange
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      onValueChange?.(numericValue);
    }
  };

  const handleBlur = () => {
    // Format the value on blur
    if (displayValue && !isNaN(parseFloat(displayValue))) {
      const numericValue = parseFloat(displayValue);
      setDisplayValue(formatNumber(numericValue));
    }
  };

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    if (displayValue) {
      const numericValue = parseNumber(displayValue);
      setDisplayValue(numericValue.toString());
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pl-9', error && 'border-red-500 focus-visible:ring-red-500')}
          aria-label="Amount"
        />
      </div>
      <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
        <SelectTrigger className="w-[100px]" aria-label="Currency">
          <SelectValue>
            {selectedCurrency.symbol} {selectedCurrency.code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map(curr => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
