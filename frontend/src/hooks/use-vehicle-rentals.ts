'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleRentalsApi } from '@/lib/api-client';
import {
  VehicleRental,
  CreateVehicleRentalDto,
  UpdateVehicleRentalDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useVehicleRentals(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List vehicle rentals
  const {
    data: vehicleRentals,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<VehicleRental>>({
    queryKey: ['vehicle-rentals', params],
    queryFn: async () => {
      return await vehicleRentalsApi.getAll(params);
    },
  });

  // Get single vehicle rental
  const useVehicleRental = (id: number) => {
    return useQuery({
      queryKey: ['vehicle-rentals', id],
      queryFn: async () => {
        const response = await vehicleRentalsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create vehicle rental
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRentalDto) => vehicleRentalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rentals'] });
      toast.success('Vehicle rental created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update vehicle rental
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleRentalDto }) =>
      vehicleRentalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rentals'] });
      toast.success('Vehicle rental updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete vehicle rental
  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehicleRentalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rentals'] });
      toast.success('Vehicle rental deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    vehicleRentals: vehicleRentals?.data || [],
    pagination: vehicleRentals?.pagination,
    isLoading,
    error,
    refetch,
    useVehicleRental,
    createVehicleRental: createMutation.mutateAsync,
    updateVehicleRental: updateMutation.mutateAsync,
    deleteVehicleRental: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
