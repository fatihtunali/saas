'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleCompaniesApi } from '@/lib/api-client';
import {
  VehicleCompany,
  CreateVehicleCompanyDto,
  UpdateVehicleCompanyDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useVehicleCompanies(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List vehicle companies
  const {
    data: vehicleCompanies,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<VehicleCompany>>({
    queryKey: ['vehicle-companies', params],
    queryFn: async () => {
      return await vehicleCompaniesApi.getAll(params);
    },
  });

  // Get single vehicle company
  const useVehicleCompany = (id: number) => {
    return useQuery({
      queryKey: ['vehicle-companies', id],
      queryFn: async () => {
        const response = await vehicleCompaniesApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create vehicle company
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleCompanyDto) => vehicleCompaniesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-companies'] });
      toast.success('Vehicle company created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update vehicle company
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleCompanyDto }) =>
      vehicleCompaniesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-companies'] });
      toast.success('Vehicle company updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete vehicle company
  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehicleCompaniesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-companies'] });
      toast.success('Vehicle company deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    vehicleCompanies: vehicleCompanies?.data?.vehicleCompanies || [],
    pagination: vehicleCompanies?.data?.pagination,
    isLoading,
    error,
    refetch,
    useVehicleCompany,
    createVehicleCompany: createMutation.mutateAsync,
    updateVehicleCompany: updateMutation.mutateAsync,
    deleteVehicleCompany: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
