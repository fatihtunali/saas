'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourCompaniesApi } from '@/lib/api-client';
import {
  TourCompany,
  CreateTourCompanyDto,
  UpdateTourCompanyDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useTourCompanies(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List tour companies
  const {
    data: tourCompanies,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<TourCompany>>({
    queryKey: ['tour-companies', params],
    queryFn: async () => {
      const response = await tourCompaniesApi.getAll(params);
      return response;
    },
  });

  // Get single tour company
  const useTourCompany = (id: number) => {
    return useQuery({
      queryKey: ['tour-companies', id],
      queryFn: async () => {
        const response = await tourCompaniesApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create tour company
  const createMutation = useMutation({
    mutationFn: (data: CreateTourCompanyDto) => tourCompaniesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-companies'] });
      toast.success('Tour company created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update tour company
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTourCompanyDto }) =>
      tourCompaniesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-companies'] });
      toast.success('Tour company updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete tour company
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tourCompaniesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-companies'] });
      toast.success('Tour company deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    tourCompanies: tourCompanies?.data?.tourCompanies || [],
    pagination: tourCompanies?.data?.pagination,
    isLoading,
    error,
    refetch,
    useTourCompany,
    createTourCompany: createMutation.mutateAsync,
    updateTourCompany: updateMutation.mutateAsync,
    deleteTourCompany: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
