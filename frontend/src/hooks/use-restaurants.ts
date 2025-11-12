'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '@/lib/api-client';
import {
  Restaurant,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useRestaurants(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List restaurants
  const {
    data: restaurants,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Restaurant>>({
    queryKey: ['restaurants', params],
    queryFn: async () => {
      return await restaurantsApi.getAll(params);
    },
  });

  // Get single restaurant
  const useRestaurant = (id: number) => {
    return useQuery({
      queryKey: ['restaurants', id],
      queryFn: async () => {
        const response = await restaurantsApi.getById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create restaurant
  const createMutation = useMutation({
    mutationFn: (data: CreateRestaurantDto) => restaurantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Restaurant created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update restaurant
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRestaurantDto }) =>
      restaurantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Restaurant updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete restaurant
  const deleteMutation = useMutation({
    mutationFn: (id: number) => restaurantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Restaurant deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    restaurants: restaurants?.data || [],
    pagination: restaurants?.pagination,
    isLoading,
    error,
    refetch,
    useRestaurant,
    createRestaurant: createMutation.mutateAsync,
    updateRestaurant: updateMutation.mutateAsync,
    deleteRestaurant: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
