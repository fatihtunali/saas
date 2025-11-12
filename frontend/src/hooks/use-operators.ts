'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorsApi } from '@/lib/api-client';
import { Operator, CreateOperatorDto, UpdateOperatorDto } from '@/types/clients';
import { QueryParams, PaginatedResponse } from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useOperators(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List operators
  const {
    data: operators,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Operator>>({
    queryKey: ['operators', params],
    queryFn: async () => {
      return await operatorsApi.getAll(params);
    },
  });

  // Get single operator
  const useOperator = (id: number) => {
    return useQuery({
      queryKey: ['operators', id],
      queryFn: async () => {
        const response = await operatorsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create operator
  const createMutation = useMutation({
    mutationFn: (data: CreateOperatorDto) => operatorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('Operator created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update operator
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOperatorDto }) =>
      operatorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('Operator updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete operator
  const deleteMutation = useMutation({
    mutationFn: (id: number) => operatorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('Operator deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    operators: operators?.data || [],
    pagination: operators?.pagination,
    isLoading,
    error,
    refetch,
    useOperator,
    createOperator: createMutation.mutateAsync,
    updateOperator: updateMutation.mutateAsync,
    deleteOperator: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
