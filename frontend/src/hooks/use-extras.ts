'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extrasApi } from '@/lib/api-client';
import {
  ExtraExpense,
  CreateExtraExpenseDto,
  UpdateExtraExpenseDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useExtras(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List extra expenses
  const {
    data: extras,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<ExtraExpense>>({
    queryKey: ['extras', params],
    queryFn: async () => {
      return await extrasApi.getAll(params);
    },
  });

  // Get single extra expense
  const useExtra = (id: number) => {
    return useQuery({
      queryKey: ['extras', id],
      queryFn: async () => {
        const response = await extrasApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create extra expense
  const createMutation = useMutation({
    mutationFn: (data: CreateExtraExpenseDto) => extrasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra expense created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update extra expense
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExtraExpenseDto }) =>
      extrasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra expense updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete extra expense
  const deleteMutation = useMutation({
    mutationFn: (id: number) => extrasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra expense deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    extras: extras?.data || [],
    pagination: extras?.pagination,
    isLoading,
    error,
    refetch,
    useExtra,
    createExtra: createMutation.mutateAsync,
    updateExtra: updateMutation.mutateAsync,
    deleteExtra: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
