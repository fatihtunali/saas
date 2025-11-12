'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountsApi } from '@/lib/api-client';
import {
  BankAccount,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/payments';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useBankAccounts(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List bank accounts
  const {
    data: bankAccounts,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<BankAccount>>({
    queryKey: ['bank-accounts', params],
    queryFn: async () => {
      return await bankAccountsApi.getAll(params);
    },
  });

  // Get single bank account
  const useBankAccount = (id: number) => {
    return useQuery({
      queryKey: ['bank-accounts', id],
      queryFn: async () => {
        const response = await bankAccountsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create bank account
  const createMutation = useMutation({
    mutationFn: (data: CreateBankAccountDto) => bankAccountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update bank account
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBankAccountDto }) =>
      bankAccountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete bank account
  const deleteMutation = useMutation({
    mutationFn: (id: number) => bankAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    bankAccounts: bankAccounts?.data || [],
    pagination: bankAccounts?.pagination,
    isLoading,
    error,
    refetch,
    useBankAccount,
    createBankAccount: createMutation.mutateAsync,
    updateBankAccount: updateMutation.mutateAsync,
    deleteBankAccount: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
