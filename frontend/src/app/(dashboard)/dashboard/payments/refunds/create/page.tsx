'use client';
//ft

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  refundSchema,
  defaultRefundValues,
  CURRENCIES,
  REFUND_METHODS,
  REFUND_STATUSES,
  REFUND_REASONS,
  RefundFormData,
} from '@/lib/validations/refunds';
import { useRefunds } from '@/hooks/use-refunds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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

export default function CreateRefundPage() {
  const router = useRouter();
  const { createRefund, isCreating } = useRefunds();

  const form = useForm({
    resolver: zodResolver(refundSchema) as any,
    defaultValues: defaultRefundValues,
  });

  const onSubmit = async (data: RefundFormData) => {
    try {
      const processedData = {
        ...data,
        approved_date: data.approved_date || undefined,
        processed_date: data.processed_date || undefined,
        approved_by: data.approved_by || undefined,
        processed_by: data.processed_by || undefined,
        refund_reference: data.refund_reference || undefined,
        notes: data.notes || undefined,
      };

      await createRefund(processedData);
      router.push('/dashboard/payments/refunds');
    } catch (error) {
      console.error('Failed to create refund:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Refund</h1>
          <p className="text-muted-foreground">Request a new refund for a client payment</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Booking & Payment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Booking & Payment Selection</CardTitle>
              <CardDescription>Select the original booking and payment</CardDescription>
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
                      <FormDescription>The booking associated with this refund</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_payment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Payment ID *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter payment ID"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>The payment to be refunded</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Refund Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Amount</CardTitle>
              <CardDescription>Specify the amount to be refunded</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="refund_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Maximum is the original payment amount</FormDescription>
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
                      <FormDescription>Auto-filled from original payment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Refund Reason & Method */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
              <CardDescription>Provide reason and method for the refund</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="refund_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Reason *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        if (value === 'custom') {
                          field.onChange('');
                        } else {
                          const reason = REFUND_REASONS.find(r => r.value === value);
                          field.onChange(reason?.label || value);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REFUND_REASONS.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Reason</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refund_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Reason *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed explanation for the refund..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Minimum 5 characters, maximum 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refund_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Method *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REFUND_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>How the refund will be processed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Status & Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Timeline</CardTitle>
              <CardDescription>Request status and important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="refund_status"
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
                        {REFUND_STATUSES.map(status => (
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="requested_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approved_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="processed_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processed Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="approved_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved By</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name of approver"
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
                  name="processed_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processed By</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name of processor"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional reference and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="refund_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Reference</FormLabel>
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this refund..."
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              <Save className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create Refund'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
