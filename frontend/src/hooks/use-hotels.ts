'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api-client';
import {
  Hotel,
  CreateHotelDto,
  UpdateHotelDto,
  QueryParams,
  PaginatedResponse,
} from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useHotels(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List hotels
  const {
    data: hotels,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Hotel>>({
    queryKey: ['hotels', params],
    queryFn: async () => {
      return await hotelsApi.getAll(params);
    },
  });

  // Get single hotel
  const useHotel = (id: number) => {
    return useQuery({
      queryKey: ['hotels', id],
      queryFn: async () => {
        const response = await hotelsApi.getById(id);
        return response;
      },
      enabled: !!id,
    });
  };

  // Create hotel
  const createMutation = useMutation({
    mutationFn: (data: CreateHotelDto) => hotelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel created successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Update hotel
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHotelDto }) => hotelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel updated successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Delete hotel
  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel deleted successfully');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  // Activate hotel
  const activateMutation = useMutation({
    mutationFn: (id: number) => hotelsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel status updated');
    },
    onError: error => {
      handleApiError(error);
    },
  });

  return {
    hotels: hotels?.data?.hotels || [],
    pagination: hotels?.data?.pagination,
    isLoading,
    error,
    refetch,
    useHotel,
    createHotel: createMutation.mutateAsync,
    updateHotel: updateMutation.mutateAsync,
    deleteHotel: deleteMutation.mutateAsync,
    activateHotel: activateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
