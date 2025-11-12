'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierPaymentsApi } from '@/lib/api-client';
import {
  SupplierPayment,
  CreateSupplierPaymentDto,
  UpdateSupplierPaymentDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/payments';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useSupplierPayments(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List supplier payments
  const {
    data: supplierPayments,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<SupplierPayment>>({
    queryKey: ['supplier-payments', params],
    queryFn: async () => {
      return await supplierPaymentsApi.getAll(params);
    },
  });

  // Get single supplier payment
  const useSupplierPayment = (id: number) => {
    return useQuery({
      queryKey: ['supplier-payments', id],
      queryFn: async () => {
        const response = await supplierPaymentsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create supplier payment
  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierPaymentDto) => supplierPaymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Supplier payment created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update supplier payment
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierPaymentDto }) =>
      supplierPaymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Supplier payment updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete supplier payment
  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierPaymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Supplier payment deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    supplierPayments: supplierPayments?.data || [],
    pagination: supplierPayments?.pagination,
    isLoading,
    error,
    refetch,
    useSupplierPayment,
    createSupplierPayment: createMutation.mutateAsync,
    updateSupplierPayment: updateMutation.mutateAsync,
    deleteSupplierPayment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
