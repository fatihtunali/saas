'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { b2bClientsApi } from '@/lib/api-client';
import { B2BClient, CreateB2BClientDto, UpdateB2BClientDto } from '@/types/clients';
import { QueryParams, PaginatedResponse } from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useB2BClients(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List B2B clients
  const {
    data: b2bClients,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<B2BClient>>({
    queryKey: ['b2b-clients', params],
    queryFn: async () => {
      return await b2bClientsApi.getAll(params);
    },
  });

  // Get single B2B client
  const useB2BClient = (id: number) => {
    return useQuery({
      queryKey: ['b2b-clients', id],
      queryFn: async () => {
        const response = await b2bClientsApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create B2B client
  const createMutation = useMutation({
    mutationFn: (data: CreateB2BClientDto) => b2bClientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('B2B client created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update B2B client
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateB2BClientDto }) =>
      b2bClientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('B2B client updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete B2B client
  const deleteMutation = useMutation({
    mutationFn: (id: number) => b2bClientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('B2B client deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    // FIXED: Access transformed camelCase property
    b2bClients: b2bClients?.data?.b2bClients || [],
    pagination: b2bClients?.data?.pagination,
    isLoading,
    error,
    refetch,
    useB2BClient,
    createB2BClient: createMutation.mutateAsync,
    updateB2BClient: updateMutation.mutateAsync,
    deleteB2BClient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
