'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferRouteSchema, CURRENCIES } from '@/lib/validations/transfer-routes';
import { useTransferRoutes } from '@/hooks/use-transfer-routes';
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
import { CitySelector } from '@/components/shared/CitySelector';

interface AddTransferRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCompanyId: number;
  vehicleTypeId: number;
  onSuccess?: () => void;
}

export function AddTransferRouteModal({
  open,
  onOpenChange,
  vehicleCompanyId,
  vehicleTypeId,
  onSuccess,
}: AddTransferRouteModalProps) {
  const { createTransferRoute, isCreating } = useTransferRoutes();

  const form = useForm({
    resolver: zodResolver(transferRouteSchema) as any,
    defaultValues: {
      vehicle_company_id: vehicleCompanyId,
      vehicle_type_id: vehicleTypeId,
      from_city_id: undefined as number | undefined,
      to_city_id: undefined as number | undefined,
      price_per_vehicle: undefined as number | undefined,
      currency: 'EUR',
      duration_hours: undefined as number | undefined,
      distance_km: undefined as number | undefined,
      notes: '',
      is_active: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const processedData = {
        vehicleCompanyId: vehicleCompanyId,
        vehicleTypeId: vehicleTypeId,
        fromCityId: data.from_city_id,
        toCityId: data.to_city_id,
        pricePerVehicle: data.price_per_vehicle ? Number(data.price_per_vehicle) : null,
        currency: data.currency || 'EUR',
        durationHours: data.duration_hours ? Number(data.duration_hours) : null,
        distanceKm: data.distance_km || null,
        notes: data.notes || null,
        isActive: data.is_active,
      };

      await createTransferRoute(processedData);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transfer route:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transfer Route</DialogTitle>
          <DialogDescription>
            Add a new transfer route for this vehicle type
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Route Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From City *</FormLabel>
                    <FormControl>
                      <CitySelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select departure city"
                      />
                    </FormControl>
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
                    <FormControl>
                      <CitySelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select arrival city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Route Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="distance_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (KM)</FormLabel>
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

              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g., 2.5"
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

            {/* Pricing */}
            <FormField
              control={form.control}
              name="price_per_vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Vehicle</FormLabel>
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
                  <FormDescription>
                    Price charged per vehicle for this route
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this route..."
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription className="text-xs">
                      Make this route available for bookings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add Transfer Route'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
