'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionsApi } from '@/lib/api-client';
import {
  Commission,
  CreateCommissionDto,
  UpdateCommissionDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/payments';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useCommissions(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List commissions
  const {
    data: commissions,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Commission>>({
    queryKey: ['commissions', params],
    queryFn: async () => {
      return await commissionsApi.getAll(params);
    },
  });

  // Get single commission
  const useCommission = (id: number) => {
    return useQuery({
      queryKey: ['commissions', id],
      queryFn: async () => {
        const response = await commissionsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create commission
  const createMutation = useMutation({
    mutationFn: (data: CreateCommissionDto) => commissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Commission created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update commission
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommissionDto }) =>
      commissionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      toast.success('Commission updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete commission
  const deleteMutation = useMutation({
    mutationFn: (id: number) => commissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      toast.success('Commission deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    commissions: commissions?.data || [],
    pagination: commissions?.pagination,
    isLoading,
    error,
    refetch,
    useCommission,
    createCommission: createMutation.mutateAsync,
    updateCommission: updateMutation.mutateAsync,
    deleteCommission: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
