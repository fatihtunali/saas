'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api-client';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useSuppliers(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List suppliers
  const {
    data: suppliers,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      return await suppliersApi.getAll(params);
    },
  });

  // Get single supplier
  const useSupplier = (id: number) => {
    return useQuery({
      queryKey: ['suppliers', id],
      queryFn: async () => {
        const response = await suppliersApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create supplier
  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierDto) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update supplier
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete supplier
  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    suppliers: suppliers?.data || [],
    pagination: suppliers?.pagination,
    isLoading,
    error,
    refetch,
    useSupplier,
    createSupplier: createMutation.mutateAsync,
    updateSupplier: updateMutation.mutateAsync,
    deleteSupplier: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
