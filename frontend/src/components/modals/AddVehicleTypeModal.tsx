'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleTypeSchema, VEHICLE_TYPES } from '@/lib/validations/vehicle-types';
import { useVehicleTypes } from '@/hooks/use-vehicle-types';
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

interface AddVehicleTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCompanyId: number;
  onSuccess?: () => void;
}

export function AddVehicleTypeModal({
  open,
  onOpenChange,
  vehicleCompanyId,
  onSuccess,
}: AddVehicleTypeModalProps) {
  const { createVehicleType, isCreating } = useVehicleTypes();

  const form = useForm({
    resolver: zodResolver(vehicleTypeSchema) as any,
    defaultValues: {
      vehicle_company_id: vehicleCompanyId,
      vehicle_type: '',
      capacity: undefined as number | undefined,
      luggage_capacity: undefined as number | undefined,
      notes: '',
      is_active: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const processedData = {
        vehicleCompanyId: vehicleCompanyId,
        vehicleType: data.vehicle_type,
        capacity: data.capacity || null,
        luggageCapacity: data.luggage_capacity || null,
        notes: data.notes || null,
        isActive: data.is_active,
      };

      await createVehicleType(processedData);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create vehicle type:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vehicle Type</DialogTitle>
          <DialogDescription>
            Add a new vehicle type to this company's fleet
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                      Make this vehicle type available
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
                {isCreating ? 'Adding...' : 'Add Vehicle Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
