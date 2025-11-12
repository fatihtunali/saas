'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleTypesApi } from '@/lib/api-client';
import {
  VehicleType,
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useVehicleTypes(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List vehicle types
  const {
    data: vehicleTypes,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<VehicleType>>({
    queryKey: ['vehicle-types', params],
    queryFn: async () => {
      return await vehicleTypesApi.getAll(params);
    },
  });

  // Get single vehicle type
  const useVehicleType = (id: number) => {
    return useQuery({
      queryKey: ['vehicle-types', id],
      queryFn: async () => {
        const response = await vehicleTypesApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create vehicle type
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleTypeDto) => vehicleTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      toast.success('Vehicle type created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update vehicle type
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleTypeDto }) =>
      vehicleTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      toast.success('Vehicle type updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete vehicle type
  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehicleTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      toast.success('Vehicle type deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    vehicleTypes: vehicleTypes?.data?.vehicle_types || [],
    pagination: vehicleTypes?.data?.pagination,
    isLoading,
    error,
    refetch,
    useVehicleType,
    createVehicleType: createMutation.mutateAsync,
    updateVehicleType: updateMutation.mutateAsync,
    deleteVehicleType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
