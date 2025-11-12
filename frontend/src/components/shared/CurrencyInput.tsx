'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencyInputProps {
  label: string;
  amount: number | string;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange?: (currency: string) => void;
  currencyOptions?: string[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

const DEFAULT_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export function CurrencyInput({
  label,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  currencyOptions = DEFAULT_CURRENCIES,
  disabled = false,
  error,
  required = false,
}: CurrencyInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    onAmountChange(parseFloat(value) || 0);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          disabled={disabled}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
        />
        {onCurrencyChange ? (
          <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map(curr => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="w-24 flex items-center justify-center border rounded-md bg-muted">
            <span className="text-sm font-medium">{currency}</span>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
