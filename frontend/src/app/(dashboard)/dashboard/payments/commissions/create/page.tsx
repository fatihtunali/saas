'use client';
//ft

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import {
  commissionSchema,
  defaultCommissionValues,
  CURRENCIES,
  COMMISSION_TYPES,
  COMMISSION_STATUSES,
  CommissionFormData,
} from '@/lib/validations/commissions';
import { useCommissions } from '@/hooks/use-commissions';
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
import { useEffect } from 'react';

export default function CreateCommissionPage() {
  const router = useRouter();
  const { createCommission, isCreating } = useCommissions();

  const form = useForm({
    resolver: zodResolver(commissionSchema) as any,
    defaultValues: defaultCommissionValues,
  });

  // Watch base amount and percentage to auto-calculate commission amount
  const baseAmount = form.watch('commission_base_amount');
  const percentage = form.watch('commission_percentage');

  useEffect(() => {
    if (baseAmount && percentage) {
      const calculatedAmount = (baseAmount * percentage) / 100;
      form.setValue('commission_amount', calculatedAmount);
    }
  }, [baseAmount, percentage, form]);

  const onSubmit = async (data: CommissionFormData) => {
    try {
      const processedData = {
        ...data,
        user_id: data.user_id || undefined,
        partner_operator_id: data.partner_operator_id || undefined,
        due_date: data.due_date || undefined,
        paid_date: data.paid_date || undefined,
        notes: data.notes || undefined,
      };

      await createCommission(processedData);
      router.push('/dashboard/payments/commissions');
    } catch (error) {
      console.error('Failed to create commission:', error);
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
          <h1 className="text-3xl font-bold">Create Commission</h1>
          <p className="text-muted-foreground">Add a new commission record</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Booking Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Selection</CardTitle>
              <CardDescription>Select the booking this commission is for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <FormDescription>The booking associated with this commission</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Commission Type & Recipient */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Type & Recipient</CardTitle>
              <CardDescription>Specify commission type and who will receive it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="commission_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMISSION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sales: internal sales team | Partner: external partners | Agent: booking
                      agents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter user ID"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormDescription>For internal users</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partner_operator_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Operator ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter partner ID"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormDescription>For external partners</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: You must specify either a User ID or Partner Operator ID
              </p>
            </CardContent>
          </Card>

          {/* Commission Calculation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Commission Calculation
              </CardTitle>
              <CardDescription>Base amount and commission rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="commission_base_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>The amount commission is calculated from</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commission_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Percentage *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Rate between 0% and 100%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="commission_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Amount (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || 0}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>Calculated: Base × Percentage</FormDescription>
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
              </div>

              {/* Calculation Display */}
              {baseAmount && percentage && baseAmount > 0 && percentage > 0 && (
                <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                  <p className="text-center font-medium">
                    <span className="font-mono">{baseAmount.toFixed(2)}</span>
                    {' × '}
                    <span className="font-mono">{percentage}%</span>
                    {' = '}
                    <span className="font-mono font-bold text-primary text-lg">
                      {((baseAmount * percentage) / 100).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Dates</CardTitle>
              <CardDescription>Commission status and payment timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {COMMISSION_STATUSES.map(status => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>When commission should be paid</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paid_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>When commission was paid</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Optional notes about this commission</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about this commission..."
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
              {isCreating ? 'Creating...' : 'Create Commission'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
