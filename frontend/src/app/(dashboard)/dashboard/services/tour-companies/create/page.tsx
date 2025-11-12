'use client';
//ft

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  tourCompanySchema,
  defaultTourCompanyValues,
  TOUR_TYPES,
  CURRENCIES,
  TourCompanyFormData,
} from '@/lib/validations/tour-companies';
import { useTourCompanies } from '@/hooks/use-tour-companies';
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
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Separator } from '@/components/ui/separator';

export default function CreateTourCompanyPage() {
  const router = useRouter();
  const { createTourCompany, isCreating } = useTourCompanies();

  const form = useForm({
    resolver: zodResolver(tourCompanySchema) as any,
    defaultValues: defaultTourCompanyValues,
  });

  const onSubmit = async (data: TourCompanyFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const processedData = {
        ...data,
        supplier_id: data.supplier_id || undefined,
        tour_name: data.tour_name || undefined,
        tour_type: data.tour_type || undefined,
        duration_days: data.duration_days || undefined,
        duration_hours: data.duration_hours || undefined,
        sic_price: data.sic_price || undefined,
        pvt_price_2_pax: data.pvt_price_2_pax || undefined,
        pvt_price_4_pax: data.pvt_price_4_pax || undefined,
        pvt_price_6_pax: data.pvt_price_6_pax || undefined,
        pvt_price_8_pax: data.pvt_price_8_pax || undefined,
        pvt_price_10_pax: data.pvt_price_10_pax || undefined,
        currency: data.currency || 'TRY',
        min_passengers: data.min_passengers || undefined,
        max_passengers: data.max_passengers || undefined,
        itinerary: data.itinerary || undefined,
        inclusions: data.inclusions || undefined,
        exclusions: data.exclusions || undefined,
        picture_url: data.picture_url || undefined,
        notes: data.notes || undefined,
      };

      await createTourCompany(processedData);
      router.push('/dashboard/services/tour-companies');
    } catch (error) {
      // Error handled by useTourCompanies hook
      console.error('Failed to create tour company:', error);
    }
  };

  const currency = form.watch('currency') || 'TRY';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Tour Company</h1>
          <p className="text-muted-foreground">Create a new tour company in your inventory</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Company details and tour information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tour_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Specific tour name"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tour_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Type</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tour type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOUR_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* SIC Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>SIC Pricing (Series in Coach)</CardTitle>
              <CardDescription>Per person pricing for group tours</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="sic_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIC Price per Person</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
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
            </CardContent>
          </Card>

          {/* Private Tour Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Private Tour Pricing</CardTitle>
              <CardDescription>Total price based on number of passengers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pvt_price_2_pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2 Passengers</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
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
                  name="pvt_price_4_pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4 Passengers</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
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
                  name="pvt_price_6_pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6 Passengers</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
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
                  name="pvt_price_8_pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8 Passengers</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
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
                  name="pvt_price_10_pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>10 Passengers</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
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

          {/* Capacity & Booking */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity & Booking</CardTitle>
              <CardDescription>Currency, passenger limits, and booking information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select value={field.value || 'TRY'} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
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

                <FormField
                  control={form.control}
                  name="min_passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Passengers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Passengers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="50"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
              <CardDescription>Itinerary, inclusions, and exclusions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="itinerary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itinerary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed tour itinerary..."
                        rows={6}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Day-by-day tour schedule and activities</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inclusions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inclusions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's included in the tour..."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Services and items included in the tour price</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exclusions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exclusions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's not included..."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Services and items NOT included in the tour price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media & Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Additional Information</CardTitle>
              <CardDescription>Tour picture and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="picture_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour Picture</FormLabel>
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
                        Make this tour company available for bookings
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              <Save className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create Tour Company'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
