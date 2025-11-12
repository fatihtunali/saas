'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { b2cClientsApi } from '@/lib/api-client';
import { B2CClient, CreateB2CClientDto, UpdateB2CClientDto } from '@/types/clients';
import { QueryParams, PaginatedResponse } from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useB2CClients(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List B2C clients
  const {
    data: b2cClients,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<B2CClient>>({
    queryKey: ['b2c-clients', params],
    queryFn: async () => {
      return await b2cClientsApi.getAll(params);
    },
  });

  // Get single B2C client
  const useB2CClient = (id: number) => {
    return useQuery({
      queryKey: ['b2c-clients', id],
      queryFn: async () => {
        const response = await b2cClientsApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create B2C client
  const createMutation = useMutation({
    mutationFn: (data: CreateB2CClientDto) => b2cClientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2c-clients'] });
      toast.success('Client created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update B2C client
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateB2CClientDto }) =>
      b2cClientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2c-clients'] });
      toast.success('Client updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete B2C client
  const deleteMutation = useMutation({
    mutationFn: (id: number) => b2cClientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2c-clients'] });
      toast.success('Client deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    b2cClients: b2cClients?.data?.b2c_clients || [],
    pagination: b2cClients?.data?.pagination,
    isLoading,
    error,
    refetch,
    useB2CClient,
    createB2CClient: createMutation.mutateAsync,
    updateB2CClient: updateMutation.mutateAsync,
    deleteB2CClient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
