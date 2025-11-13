'use client';
//ft

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  hotelSchema,
  defaultHotelValues,
  MEAL_PLANS,
  STAR_RATINGS,
  CURRENCIES,
  HotelFormData,
} from '@/lib/validations/hotels';
import { useHotels } from '@/hooks/use-hotels';
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
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Separator } from '@/components/ui/separator';

export default function CreateHotelPage() {
  const router = useRouter();
  const { createHotel, isCreating } = useHotels();

  const form = useForm({
    resolver: zodResolver(hotelSchema) as any,
    defaultValues: defaultHotelValues,
  });

  const onSubmit = async (data: HotelFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const processedData = {
        address: data.address || undefined,
        cityId: data.city_id,
        currency: data.currency || undefined,
        email: data.email || undefined,
        hotelName: data.hotel_name,
        isActive: data.is_active,
        notes: data.notes || undefined,
        phone: data.phone || undefined,
        pictureUrl: data.picture_url || undefined,
        starRating: data.star_rating || undefined,
        website: data.website || undefined,
      };

      await createHotel(processedData);
      router.push('/dashboard/services/hotels');
    } catch (error) {
      // Error handled by useHotels hook
      console.error('Failed to create hotel:', error);
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
          <h1 className="text-3xl font-bold">Add New Hotel</h1>
          <p className="text-muted-foreground">Create a new hotel in your inventory</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Hotel name, rating, and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hotel_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hotel name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="star_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Star Rating</FormLabel>
                      <Select
                        value={field.value?.toString() || ''}
                        onValueChange={val => field.onChange(val ? parseInt(val) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select star rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAR_RATINGS.map(rating => (
                            <SelectItem key={rating.value} value={rating.value.toString()}>
                              {rating.label}
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
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter hotel address"
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Phone, email, and website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+90 555 123 4567"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="info@hotel.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.hotel.com"
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

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Per-person pricing and child rates</CardDescription>
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

              {/* Adult Pricing */}
              <div className="space-y-4">
                <h4 className="font-medium">Adult Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price_per_person_double"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Person (Double)</FormLabel>
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
                    name="single_supplement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Single Supplement</FormLabel>
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
                    name="price_per_person_triple"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Person (Triple)</FormLabel>
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
              </div>

              <Separator />

              {/* Child Pricing */}
              <div className="space-y-4">
                <h4 className="font-medium">Child Pricing (by Age)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="child_price_0_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child Price (0-2 years)</FormLabel>
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
                    name="child_price_3_5"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child Price (3-5 years)</FormLabel>
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
                    name="child_price_6_11"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child Price (6-11 years)</FormLabel>
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
              </div>
            </CardContent>
          </Card>

          {/* Meal Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan</CardTitle>
              <CardDescription>Meal plan options and supplements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meal_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Plan</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEAL_PLANS.map(plan => (
                            <SelectItem key={plan.value} value={plan.value}>
                              {plan.label}
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
                  name="meal_plan_supplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Plan Supplement</FormLabel>
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
                      <FormDescription>
                        Additional cost per person for meal plan upgrade
                      </FormDescription>
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
              <CardDescription>Facilities, images, and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="facilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facilities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Pool, Spa, Gym, Restaurant, Bar, WiFi, etc."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>List hotel facilities and amenities</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="picture_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Image</FormLabel>
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
                      <FormDescription>Make this hotel available for bookings</FormDescription>
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
              {isCreating ? 'Creating...' : 'Create Hotel'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
