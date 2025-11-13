'use client';
//ft

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
  vehicleRentalSchema,
  CURRENCIES,
  VehicleRentalFormData,
} from '@/lib/validations/vehicle-rentals';
import { useVehicleRentals } from '@/hooks/use-vehicle-rentals';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { useVehicleTypes } from '@/hooks/use-vehicle-types';
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
import { Separator } from '@/components/ui/separator';

export default function EditVehicleRentalPage() {
  const router = useRouter();
  const params = useParams();
  const rentalId = parseInt(params.id as string);

  const { useVehicleRental, updateVehicleRental, isUpdating } = useVehicleRentals();
  const { data: rental, isLoading: isLoadingRental } = useVehicleRental(rentalId);
  const { vehicleCompanies } = useVehicleCompanies();
  const { vehicleTypes } = useVehicleTypes();

  const form = useForm({
    resolver: zodResolver(vehicleRentalSchema) as any,
    values: rental
      ? {
          vehicle_company_id: rental.vehicleCompanyId,
          vehicle_type_id: rental.vehicleTypeId,
          full_day_price: rental.fullDayPrice ? Number(rental.fullDayPrice) : 0,
          full_day_hours: rental.fullDayHours || 8,
          full_day_km: rental.fullDayKm || 80,
          half_day_price: rental.halfDayPrice ? Number(rental.halfDayPrice) : 0,
          half_day_hours: rental.halfDayHours || 4,
          half_day_km: rental.halfDayKm || 40,
          night_rental_price: rental.nightRentalPrice ? Number(rental.nightRentalPrice) : 0,
          night_rental_hours: rental.nightRentalHours || 10,
          night_rental_km: rental.nightRentalKm || 100,
          extra_hour_rate: rental.extraHourRate ? Number(rental.extraHourRate) : 0,
          extra_km_rate: rental.extraKmRate ? Number(rental.extraKmRate) : 0,
          currency: rental.currency || 'EUR',
          notes: rental.notes || '',
          is_active: rental.isActive ?? true,
        }
      : undefined,
  });

  const onSubmit = async (data: VehicleRentalFormData) => {
    try {
      // Convert form data to API format with camelCase and proper types
      const processedData = {
        vehicleCompanyId: data.vehicle_company_id,
        vehicleTypeId: data.vehicle_type_id,
        fullDayPrice: data.full_day_price ? Number(data.full_day_price) : null,
        fullDayHours: data.full_day_hours || null,
        fullDayKm: data.full_day_km || null,
        halfDayPrice: data.half_day_price ? Number(data.half_day_price) : null,
        halfDayHours: data.half_day_hours || null,
        halfDayKm: data.half_day_km || null,
        nightRentalPrice: data.night_rental_price ? Number(data.night_rental_price) : null,
        nightRentalHours: data.night_rental_hours || null,
        nightRentalKm: data.night_rental_km || null,
        extraHourRate: data.extra_hour_rate ? Number(data.extra_hour_rate) : null,
        extraKmRate: data.extra_km_rate ? Number(data.extra_km_rate) : null,
        currency: data.currency || 'EUR',
        notes: data.notes || null,
        isActive: data.is_active,
      };

      await updateVehicleRental({ id: rentalId, data: processedData });
      router.push('/dashboard/services/vehicle-rentals');
    } catch (error) {
      // Error handled by useVehicleRentals hook
      console.error('Failed to update vehicle rental:', error);
    }
  };

  const currency = form.watch('currency') || 'EUR';

  if (isLoadingRental) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vehicle Rental Not Found</h1>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
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
          <h1 className="text-3xl font-bold">Edit Vehicle Rental</h1>
          <p className="text-muted-foreground">Update vehicle rental service information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Selection</CardTitle>
              <CardDescription>Select vehicle company and type</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Company *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleCompanies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.companyName}
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
                name="vehicle_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleTypes?.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.vehicleType} ({type.capacity} pax)
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

          {/* Full Day Rental */}
          <Card>
            <CardHeader>
              <CardTitle>Full Day Rental</CardTitle>
              <CardDescription>Pricing and limits for full day rentals</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="full_day_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
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
                name="full_day_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_day_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Half Day Rental */}
          <Card>
            <CardHeader>
              <CardTitle>Half Day Rental</CardTitle>
              <CardDescription>Pricing and limits for half day rentals</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="half_day_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
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
                name="half_day_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="half_day_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Night Rental */}
          <Card>
            <CardHeader>
              <CardTitle>Night Rental</CardTitle>
              <CardDescription>Pricing and limits for night rentals</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="night_rental_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
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
                name="night_rental_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="night_rental_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Extra Charges */}
          <Card>
            <CardHeader>
              <CardTitle>Extra Charges</CardTitle>
              <CardDescription>Additional rates for exceeding limits</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="extra_hour_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Hour Rate</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                          }
                        />
                        <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                          <span className="text-sm font-medium">{currency}</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>Cost per additional hour</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extra_km_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra KM Rate</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                          }
                        />
                        <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                          <span className="text-sm font-medium">{currency}</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>Cost per additional kilometer</FormDescription>
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
              <CardDescription>Currency, notes, and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        Make this vehicle rental available for bookings
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
              {isUpdating ? 'Updating...' : 'Update Vehicle Rental'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
