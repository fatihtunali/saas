'use client';
//ft

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  vehicleTypeSchema,
  VehicleTypeFormData,
  VEHICLE_TYPES,
} from '@/lib/validations/vehicle-types';
import { useVehicleTypes } from '@/hooks/use-vehicle-types';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function EditVehicleTypePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleTypeId = parseInt(params.id as string);
  const { updateVehicleType, isUpdating, useVehicleType } = useVehicleTypes();
  const { data: vehicleType, isLoading } = useVehicleType(vehicleTypeId);
  const { vehicleCompanies, isLoading: isLoadingCompanies } = useVehicleCompanies();

  const form = useForm({
    resolver: zodResolver(vehicleTypeSchema) as any,
    defaultValues: {
      vehicle_company_id: undefined as number | undefined,
      vehicle_type: '',
      capacity: undefined as number | undefined,
      luggage_capacity: undefined as number | undefined,
      notes: '',
      is_active: true,
    },
  });

  // Populate form when vehicle type data is loaded
  useEffect(() => {
    if (vehicleType) {
      const formData = {
        vehicle_company_id: vehicleType.vehicle_company_id,
        vehicle_type: vehicleType.vehicle_type,
        capacity: vehicleType.capacity ?? undefined,
        luggage_capacity: vehicleType.luggage_capacity ?? undefined,
        notes: vehicleType.notes || '',
        is_active: vehicleType.is_active,
      } as any;
      form.reset(formData);
    }
  }, [vehicleType, form]);

  const onSubmit = async (data: VehicleTypeFormData) => {
    try {
      // Convert empty strings to null for optional fields
      const processedData = {
        ...data,
        capacity: data.capacity || null,
        luggage_capacity: data.luggage_capacity || null,
        notes: data.notes || null,
      };

      // @ts-expect-error - Type mismatch between form data and API schema
      await updateVehicleType({ id: vehicleTypeId, data: processedData });
      router.push(`/dashboard/services/vehicle-types/${vehicleTypeId}`);
    } catch (error) {
      // Error handled by useVehicleTypes hook
      console.error('Failed to update vehicle type:', error);
    }
  };

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

  if (!vehicleType) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Vehicle type not found</p>
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
          <h1 className="text-3xl font-bold">Edit Vehicle Type</h1>
          <p className="text-muted-foreground">Update vehicle type information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Vehicle Type Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Type Information</CardTitle>
              <CardDescription>Vehicle details and capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="vehicle_company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Company *</FormLabel>
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={val => field.onChange(val ? parseInt(val) : undefined)}
                      disabled={isLoadingCompanies}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleCompanies?.map((company: any) => (
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
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type: any) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Or type a custom vehicle type</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger Capacity</FormLabel>
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
                      <FormDescription>Maximum number of passengers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="luggage_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luggage Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 6"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>Maximum number of luggage pieces</FormDescription>
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
                        placeholder="Additional information, features, restrictions..."
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
                        Make this vehicle type available for bookings
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
              {isUpdating ? 'Updating...' : 'Update Vehicle Type'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
