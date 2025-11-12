'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPaymentsApi } from '@/lib/api-client';
import {
  ClientPayment,
  CreateClientPaymentDto,
  UpdateClientPaymentDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/payments';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useClientPayments(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List client payments
  const {
    data: clientPayments,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<ClientPayment>>({
    queryKey: ['client-payments', params],
    queryFn: async () => {
      return await clientPaymentsApi.getAll(params);
    },
  });

  // Get single client payment
  const useClientPayment = (id: number) => {
    return useQuery({
      queryKey: ['client-payments', id],
      queryFn: async () => {
        const response = await clientPaymentsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create client payment
  const createMutation = useMutation({
    mutationFn: (data: CreateClientPaymentDto) => clientPaymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Client payment recorded successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update client payment
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientPaymentDto }) =>
      clientPaymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Client payment updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete client payment
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientPaymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Client payment deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    clientPayments: clientPayments?.data || [],
    pagination: clientPayments?.pagination,
    isLoading,
    error,
    refetch,
    useClientPayment,
    createClientPayment: createMutation.mutateAsync,
    updateClientPayment: updateMutation.mutateAsync,
    deleteClientPayment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
