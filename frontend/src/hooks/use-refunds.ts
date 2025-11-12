'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundsApi } from '@/lib/api-client';
import {
  Refund,
  CreateRefundDto,
  UpdateRefundDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/payments';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useRefunds(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List refunds
  const {
    data: refunds,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Refund>>({
    queryKey: ['refunds', params],
    queryFn: async () => {
      return await refundsApi.getAll(params);
    },
  });

  // Get single refund
  const useRefund = (id: number) => {
    return useQuery({
      queryKey: ['refunds', id],
      queryFn: async () => {
        const response = await refundsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create refund
  const createMutation = useMutation({
    mutationFn: (data: CreateRefundDto) => refundsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Refund request created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update refund
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRefundDto }) =>
      refundsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      toast.success('Refund updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete refund
  const deleteMutation = useMutation({
    mutationFn: (id: number) => refundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast.success('Refund deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    refunds: refunds?.data || [],
    pagination: refunds?.pagination,
    isLoading,
    error,
    refetch,
    useRefund,
    createRefund: createMutation.mutateAsync,
    updateRefund: updateMutation.mutateAsync,
    deleteRefund: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
