'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entranceFeesApi } from '@/lib/api-client';
import {
  EntranceFee,
  CreateEntranceFeeDto,
  UpdateEntranceFeeDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useEntranceFees(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List entrance fees
  const {
    data: entranceFees,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<EntranceFee>>({
    queryKey: ['entrance-fees', params],
    queryFn: async () => {
      return await entranceFeesApi.getAll(params);
    },
  });

  // Get single entrance fee
  const useEntranceFee = (id: number) => {
    return useQuery({
      queryKey: ['entrance-fees', id],
      queryFn: async () => {
        const response = await entranceFeesApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create entrance fee
  const createMutation = useMutation({
    mutationFn: (data: CreateEntranceFeeDto) => entranceFeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrance-fees'] });
      toast.success('Entrance fee created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update entrance fee
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEntranceFeeDto }) =>
      entranceFeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrance-fees'] });
      toast.success('Entrance fee updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete entrance fee
  const deleteMutation = useMutation({
    mutationFn: (id: number) => entranceFeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrance-fees'] });
      toast.success('Entrance fee deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    entranceFees: entranceFees?.data?.entrance_fees || [],
    pagination: entranceFees?.data?.pagination,
    isLoading,
    error,
    refetch,
    useEntranceFee,
    createEntranceFee: createMutation.mutateAsync,
    updateEntranceFee: updateMutation.mutateAsync,
    deleteEntranceFee: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
