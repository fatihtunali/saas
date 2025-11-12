'use client';
//ft

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
  transferRouteSchema,
  CURRENCIES,
  TransferRouteFormData,
} from '@/lib/validations/transfer-routes';
import { useTransferRoutes } from '@/hooks/use-transfer-routes';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { useVehicleTypes } from '@/hooks/use-vehicle-types';
import { useCities } from '@/lib/hooks/useBookingWizard';
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

export default function EditTransferRoutePage() {
  const router = useRouter();
  const params = useParams();
  const routeId = parseInt(params.id as string);

  const { useTransferRoute, updateTransferRoute, isUpdating } = useTransferRoutes();
  const { data: route, isLoading: isLoadingRoute } = useTransferRoute(routeId);
  const { vehicleCompanies } = useVehicleCompanies();
  const { vehicleTypes } = useVehicleTypes();
  const { data: cities } = useCities();

  const form = useForm({
    resolver: zodResolver(transferRouteSchema) as any,
    values: route
      ? {
          vehicle_company_id: route.vehicle_company_id,
          vehicle_type_id: route.vehicle_type_id || undefined,
          from_city_id: route.from_city_id,
          to_city_id: route.to_city_id,
          price_per_vehicle: route.price_per_vehicle || 0,
          currency: route.currency || 'TRY',
          duration_hours: route.duration_hours || 0,
          distance_km: route.distance_km || 0,
          notes: route.notes || '',
          is_active: route.is_active ?? true,
        }
      : undefined,
  });

  const onSubmit = async (data: TransferRouteFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const processedData = {
        ...data,
        vehicle_type_id: data.vehicle_type_id || undefined,
        price_per_vehicle: data.price_per_vehicle || undefined,
        duration_hours: data.duration_hours || undefined,
        distance_km: data.distance_km || undefined,
        notes: data.notes || undefined,
      };

      await updateTransferRoute({ id: routeId, data: processedData });
      router.push('/dashboard/services/transfer-routes');
    } catch (error) {
      // Error handled by useTransferRoutes hook
      console.error('Failed to update transfer route:', error);
    }
  };

  const currency = form.watch('currency') || 'TRY';
  const fromCityId = form.watch('from_city_id');

  if (isLoadingRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Transfer Route Not Found</h1>
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
          <h1 className="text-3xl font-bold">Edit Transfer Route</h1>
          <p className="text-muted-foreground">Update transfer route information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Select vehicle company and optional vehicle type</CardDescription>
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
                        {vehicleCompanies?.map(company => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.company_name}
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
                    <FormLabel>Vehicle Type (Optional)</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {vehicleTypes?.map(type => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.vehicle_type} ({type.capacity} pax)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Leave empty to apply to all vehicle types</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Define the transfer route</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From City *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities?.map(city => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
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
                name="to_city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To City *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities
                          ?.filter(city => city.id !== fromCityId)
                          .map(city => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Cannot be the same as departure city</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Details</CardTitle>
              <CardDescription>Route pricing and travel information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price_per_vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Vehicle</FormLabel>
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
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0.0"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>Estimated travel time in hours</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distance_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>Distance in kilometers</FormDescription>
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
              <CardDescription>Notes and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Internal notes, special conditions, route details, etc."
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
                        Make this transfer route available for bookings
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
              {isUpdating ? 'Updating...' : 'Update Transfer Route'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
