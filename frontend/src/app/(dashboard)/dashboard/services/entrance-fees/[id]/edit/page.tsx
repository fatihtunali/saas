'use client';
//ft

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  entranceFeeSchema,
  CURRENCIES,
  EntranceFeeFormData,
} from '@/lib/validations/entrance-fees';
import { useEntranceFees } from '@/hooks/use-entrance-fees';
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
import { Switch } from '@/components/ui/switch';
import { CitySelector } from '@/components/shared/CitySelector';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEntranceFeePage() {
  const router = useRouter();
  const params = useParams();
  const entranceFeeId = parseInt(params.id as string);
  const { updateEntranceFee, isUpdating, useEntranceFee } = useEntranceFees();
  const { data: entranceFee, isLoading } = useEntranceFee(entranceFeeId);

  const form = useForm({
    resolver: zodResolver(entranceFeeSchema) as any,
    defaultValues: {
      site_name: '',
      supplier_id: null,
      city_id: undefined,
      adult_price: null,
      child_price: null,
      student_price: null,
      senior_price: null,
      currency: 'TRY',
      opening_hours: '',
      best_visit_time: '',
      picture_url: '',
      notes: '',
      is_active: true,
    },
  });

  // Populate form when entrance fee data is loaded
  useEffect(() => {
    if (entranceFee) {
      const formData = {
        site_name: entranceFee.site_name,
        supplier_id: entranceFee.supplier_id ?? null,
        city_id: entranceFee.city_id,
        adult_price: entranceFee.adult_price ?? null,
        child_price: entranceFee.child_price ?? null,
        student_price: entranceFee.student_price ?? null,
        senior_price: entranceFee.senior_price ?? null,
        currency: entranceFee.currency || 'TRY',
        opening_hours: entranceFee.opening_hours || '',
        best_visit_time: entranceFee.best_visit_time || '',
        picture_url: entranceFee.picture_url || '',
        notes: entranceFee.notes || '',
        is_active: entranceFee.is_active,
      } as any;
      form.reset(formData);
    }
  }, [entranceFee, form]);

  const onSubmit = async (data: EntranceFeeFormData) => {
    try {
      // Convert empty strings to null for optional fields
      const processedData = {
        ...data,
        supplier_id: data.supplier_id || null,
        adult_price: data.adult_price || null,
        child_price: data.child_price || null,
        student_price: data.student_price || null,
        senior_price: data.senior_price || null,
        opening_hours: data.opening_hours || null,
        best_visit_time: data.best_visit_time || null,
        picture_url: data.picture_url || null,
        notes: data.notes || null,
      };

      // @ts-expect-error - Type mismatch between form data and API schema
      await updateEntranceFee({ id: entranceFeeId, data: processedData });
      router.push(`/dashboard/services/entrance-fees/${entranceFeeId}`);
    } catch (error) {
      // Error handled by useEntranceFees hook
      console.error('Failed to update entrance fee:', error);
    }
  };

  const currency = form.watch('currency') || 'TRY';

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entranceFee) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Entrance fee not found</p>
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
          <h1 className="text-3xl font-bold">Edit Entrance Fee</h1>
          <p className="text-muted-foreground">Update entrance fee information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Site name and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <CitySelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select city"
                        error={form.formState.errors.city_id?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Entry prices for different visitor categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value || 'TRY'} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map(curr => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Pricing by Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adult_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Price</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="child_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child Price</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="student_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Price</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senior_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senior Price</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Information</CardTitle>
              <CardDescription>Opening hours and best visit times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="opening_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mon-Sun 9:00 AM - 6:00 PM"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Specify the opening hours of the site</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="best_visit_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Visit Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Early morning or late afternoon"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Recommended time to visit for best experience</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Images and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="picture_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Image</FormLabel>
                    <FormControl>
                      <ImageUploader value={field.value} onChange={field.onChange} />
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
                        placeholder="Internal notes, special conditions, etc."
                        rows={4}
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this entrance fee available for bookings
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
              {isUpdating ? 'Updating...' : 'Update Entrance Fee'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
