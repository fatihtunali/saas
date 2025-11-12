'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transferRoutesApi } from '@/lib/api-client';
import {
  TransferRoute,
  CreateTransferRouteDto,
  UpdateTransferRouteDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useTransferRoutes(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List transfer routes
  const {
    data: transferRoutes,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<TransferRoute>>({
    queryKey: ['transfer-routes', params],
    queryFn: async () => {
      return await transferRoutesApi.getAll(params);
    },
  });

  // Get single transfer route
  const useTransferRoute = (id: number) => {
    return useQuery({
      queryKey: ['transfer-routes', id],
      queryFn: async () => {
        const response = await transferRoutesApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create transfer route
  const createMutation = useMutation({
    mutationFn: (data: CreateTransferRouteDto) => transferRoutesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-routes'] });
      toast.success('Transfer route created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update transfer route
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransferRouteDto }) =>
      transferRoutesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-routes'] });
      toast.success('Transfer route updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete transfer route
  const deleteMutation = useMutation({
    mutationFn: (id: number) => transferRoutesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-routes'] });
      toast.success('Transfer route deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    transferRoutes: transferRoutes?.data || [],
    pagination: transferRoutes?.pagination,
    isLoading,
    error,
    refetch,
    useTransferRoute,
    createTransferRoute: createMutation.mutateAsync,
    updateTransferRoute: updateMutation.mutateAsync,
    deleteTransferRoute: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
