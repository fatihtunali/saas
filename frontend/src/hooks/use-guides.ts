'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidesApi } from '@/lib/api-client';
import {
  Guide,
  CreateGuideDto,
  UpdateGuideDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useGuides(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List guides
  const {
    data: guides,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Guide>>({
    queryKey: ['guides', params],
    queryFn: async () => {
      return await guidesApi.getAll(params);
    },
  });

  // Get single guide
  const useGuide = (id: number) => {
    return useQuery({
      queryKey: ['guides', id],
      queryFn: async () => {
        const response = await guidesApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create guide
  const createMutation = useMutation({
    mutationFn: (data: CreateGuideDto) => guidesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      toast.success('Guide created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update guide
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGuideDto }) => guidesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      toast.success('Guide updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete guide
  const deleteMutation = useMutation({
    mutationFn: (id: number) => guidesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      toast.success('Guide deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    guides: guides?.data || [],
    pagination: guides?.pagination,
    isLoading,
    error,
    refetch,
    useGuide,
    createGuide: createMutation.mutateAsync,
    updateGuide: updateMutation.mutateAsync,
    deleteGuide: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
