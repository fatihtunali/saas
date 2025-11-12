'use client';

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyDisplay } from './CurrencyDisplay';

interface ExchangeRateCalculatorProps {
  form: UseFormReturn<any>;
  amountField: string;
  currencyField: string;
  exchangeRateField: string;
  baseAmountField: string;
  baseCurrency?: string;
}

export function ExchangeRateCalculator({
  form,
  amountField,
  currencyField,
  exchangeRateField,
  baseAmountField,
  baseCurrency = 'TRY',
}: ExchangeRateCalculatorProps) {
  const amount = form.watch(amountField) || 0;
  const currency = form.watch(currencyField) || baseCurrency;
  const exchangeRate = form.watch(exchangeRateField) || 1.0;

  // Auto-calculate base amount when amount or exchange rate changes
  useEffect(() => {
    if (amount && exchangeRate) {
      const calculated = amount * exchangeRate;
      form.setValue(baseAmountField, calculated);
    }
  }, [amount, exchangeRate, form, baseAmountField]);

  // Reset exchange rate to 1.0 when currency is same as base
  useEffect(() => {
    if (currency === baseCurrency) {
      form.setValue(exchangeRateField, 1.0);
    }
  }, [currency, baseCurrency, form, exchangeRateField]);

  const baseAmount = form.watch(baseAmountField) || 0;
  const isDifferentCurrency = currency !== baseCurrency;

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-base">Currency Conversion</CardTitle>
        <CardDescription>
          {isDifferentCurrency
            ? 'Exchange rate will be applied to convert to base currency'
            : 'Same as base currency - no conversion needed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount ({currency})</Label>
            <div className="p-3 border rounded-md bg-background">
              <CurrencyDisplay amount={amount || 0} currency={currency} className="text-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Exchange Rate</Label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              value={exchangeRate || 1.0}
              onChange={e => {
                const value = parseFloat(e.target.value) || 1.0;
                form.setValue(exchangeRateField, value);
              }}
              disabled={!isDifferentCurrency}
              className="font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <Label>Amount in Base Currency ({baseCurrency})</Label>
            <div className="p-3 border rounded-md bg-background">
              <CurrencyDisplay
                amount={baseAmount || 0}
                currency={baseCurrency}
                className="text-lg font-semibold text-primary"
              />
            </div>
          </div>
        </div>

        {isDifferentCurrency && amount > 0 && (
          <div className="text-sm text-muted-foreground">
            Calculation: {amount} × {exchangeRate} = {baseAmount.toFixed(2)} {baseCurrency}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
