'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleRentalSchema, CURRENCIES } from '@/lib/validations/vehicle-rentals';
import { useVehicleRentals } from '@/hooks/use-vehicle-rentals';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AddRentalPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCompanyId: number;
  vehicleTypeId: number;
  onSuccess?: () => void;
}

export function AddRentalPricingModal({
  open,
  onOpenChange,
  vehicleCompanyId,
  vehicleTypeId,
  onSuccess,
}: AddRentalPricingModalProps) {
  const { createVehicleRental, isCreating } = useVehicleRentals();

  const form = useForm({
    resolver: zodResolver(vehicleRentalSchema) as any,
    defaultValues: {
      vehicle_company_id: vehicleCompanyId,
      vehicle_type_id: vehicleTypeId,
      full_day_price: undefined as number | undefined,
      full_day_hours: undefined as number | undefined,
      full_day_km: undefined as number | undefined,
      half_day_price: undefined as number | undefined,
      half_day_hours: undefined as number | undefined,
      half_day_km: undefined as number | undefined,
      night_rental_price: undefined as number | undefined,
      night_rental_hours: undefined as number | undefined,
      night_rental_km: undefined as number | undefined,
      extra_hour_rate: undefined as number | undefined,
      extra_km_rate: undefined as number | undefined,
      currency: 'EUR',
      notes: '',
      is_active: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const processedData = {
        vehicleCompanyId: vehicleCompanyId,
        vehicleTypeId: vehicleTypeId,
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

      await createVehicleRental(processedData);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create vehicle rental:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Rental Pricing</DialogTitle>
          <DialogDescription>
            Configure rental pricing options for this vehicle type
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Day Rental */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full Day Rental</CardTitle>
                <CardDescription>Pricing and limits for full day rentals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="full_day_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                          />
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
                            min="1"
                            placeholder="e.g., 8"
                            {...field}
                            value={field.value || ''}
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
                    name="full_day_km"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KM Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 200"
                            {...field}
                            value={field.value || ''}
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

            {/* Half Day Rental */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Half Day Rental</CardTitle>
                <CardDescription>Pricing and limits for half day rentals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="half_day_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                          />
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
                            min="1"
                            placeholder="e.g., 4"
                            {...field}
                            value={field.value || ''}
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
                    name="half_day_km"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KM Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 100"
                            {...field}
                            value={field.value || ''}
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

            {/* Night Rental */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Night Rental</CardTitle>
                <CardDescription>Pricing and limits for night rentals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="night_rental_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                          />
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
                            min="1"
                            placeholder="e.g., 12"
                            {...field}
                            value={field.value || ''}
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
                    name="night_rental_km"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KM Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 150"
                            {...field}
                            value={field.value || ''}
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

            {/* Extra Rates & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Extra Rates & Settings</CardTitle>
                <CardDescription>Additional charges and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="extra_hour_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Hour Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
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
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
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
                        <FormLabel>Currency</FormLabel>
                        <Select value={field.value || 'EUR'} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information..."
                          rows={3}
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription className="text-xs">
                          Make this pricing available for bookings
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add Rental Pricing'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
