'use client';

import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  className?: string;
  showCurrency?: boolean;
  decimals?: number;
}

const currencySymbols: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function CurrencyDisplay({
  amount,
  currency,
  className,
  showCurrency = true,
  decimals = 2,
}: CurrencyDisplayProps) {
  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn('font-medium', className)}>
      {showCurrency && <span className="mr-1">{symbol}</span>}
      {formattedAmount}
      {!showCurrency && <span className="ml-1 text-muted-foreground text-sm">{currency}</span>}
    </span>
  );
}

interface MultiCurrencyDisplayProps {
  amount: number;
  currency: string;
  baseAmount?: number;
  baseCurrency?: string;
  exchangeRate?: number;
  className?: string;
}

export function MultiCurrencyDisplay({
  amount,
  currency,
  baseAmount,
  baseCurrency = 'TRY',
  exchangeRate,
  className,
}: MultiCurrencyDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <CurrencyDisplay amount={amount} currency={currency} className="text-base" />
      {baseAmount && currency !== baseCurrency && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CurrencyDisplay amount={baseAmount} currency={baseCurrency} decimals={2} />
          {exchangeRate && <span className="text-xs">(Rate: {exchangeRate.toFixed(4)})</span>}
        </div>
      )}
    </div>
  );
}
