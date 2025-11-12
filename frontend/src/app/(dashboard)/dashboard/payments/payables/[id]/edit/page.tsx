'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  supplierPaymentSchema,
  CURRENCIES,
  PAYMENT_METHODS,
  SUPPLIER_PAYMENT_STATUSES,
  SupplierPaymentFormData,
} from '@/lib/validations/supplier-payments';
import { useSupplierPayments } from '@/hooks/use-supplier-payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ExchangeRateCalculator } from '@/components/features/payments/ExchangeRateCalculator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSupplierPaymentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const paymentId = parseInt(resolvedParams.id);
  const { useSupplierPayment, updateSupplierPayment, isUpdating } = useSupplierPayments();
  const { data: payment, isLoading } = useSupplierPayment(paymentId);

  const form = useForm({
    resolver: zodResolver(supplierPaymentSchema) as any,
    values: payment
      ? {
          booking_id: payment.booking_id,
          booking_service_id: payment.booking_service_id,
          supplier_id: payment.supplier_id,
          payment_date: payment.payment_date || '',
          due_date: payment.due_date,
          amount: payment.amount,
          currency: payment.currency,
          exchange_rate: payment.exchange_rate,
          amount_in_base_currency: payment.amount_in_base_currency,
          payment_method: payment.payment_method,
          payment_reference: payment.payment_reference || '',
          bank_account_id: payment.bank_account_id,
          status: payment.status,
          notes: payment.notes || '',
          paid_by: payment.paid_by || '',
        }
      : undefined,
  });

  const onSubmit = async (data: SupplierPaymentFormData) => {
    try {
      const processedData = {
        ...data,
        booking_service_id: data.booking_service_id || undefined,
        payment_date: data.payment_date || undefined,
        payment_reference: data.payment_reference || undefined,
        bank_account_id: data.bank_account_id || undefined,
        notes: data.notes || undefined,
        paid_by: data.paid_by || undefined,
      };

      await updateSupplierPayment({ id: paymentId, data: processedData });
      router.push(`/dashboard/payments/payables/${paymentId}`);
    } catch (error) {
      console.error('Failed to update supplier payment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Supplier payment not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Supplier Payment</h1>
          <p className="text-muted-foreground">Update supplier payment information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Booking and supplier information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="booking_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking ID *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter booking ID"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier ID *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter supplier ID"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="booking_service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Service ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional booking service ID"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map(currency => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHODS.map(method => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPLIER_PAYMENT_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Exchange Rate Calculator */}
          <ExchangeRateCalculator
            form={form}
            amountField="amount"
            currencyField="currency"
            exchangeRateField="exchange_rate"
            baseAmountField="amount_in_base_currency"
          />

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Payment references and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reference</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Transaction reference number"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Select bank account"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paid_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name of person who made the payment"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this payment..."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
