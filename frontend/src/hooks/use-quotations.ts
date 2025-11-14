import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationsApi, quotationServicesApi } from '@/lib/api-client';
import type {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationService,
  CreateQuotationServiceDto,
  UpdateQuotationServiceDto,
} from '@/types/quotations';
import { toast } from 'sonner';

const QUOTATIONS_QUERY_KEY = 'quotations';
const QUOTATION_SERVICES_QUERY_KEY = 'quotation-services';

export function useQuotations() {
  const queryClient = useQueryClient();

  // Fetch all quotations
  const { data: quotations, isLoading, error } = useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY],
    queryFn: () => quotationsApi.getAll(),
  });

  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: (data: CreateQuotationDto) => quotationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to create quotation');
    },
  });

  // Update quotation mutation
  const updateQuotationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuotationDto }) =>
      quotationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update quotation');
    },
  });

  // Delete quotation mutation
  const deleteQuotationMutation = useMutation({
    mutationFn: (id: number) => quotationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete quotation');
    },
  });

  return {
    quotations: quotations?.data || [],
    isLoading,
    error,
    createQuotation: createQuotationMutation.mutateAsync,
    updateQuotation: updateQuotationMutation.mutateAsync,
    deleteQuotation: deleteQuotationMutation.mutateAsync,
    isCreating: createQuotationMutation.isPending,
    isUpdating: updateQuotationMutation.isPending,
    isDeleting: deleteQuotationMutation.isPending,
  };
}

export function useQuotation(id: number) {
  const queryClient = useQueryClient();

  // Fetch single quotation by ID
  const { data, isLoading, error } = useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, id],
    queryFn: () => quotationsApi.getById(id),
    enabled: !!id,
  });

  return {
    quotation: data?.data,
    isLoading,
    error,
  };
}

export function useQuotationServices(quotationId?: number) {
  const queryClient = useQueryClient();

  // Fetch quotation services
  const { data, isLoading, error } = useQuery({
    queryKey: [QUOTATION_SERVICES_QUERY_KEY, quotationId],
    queryFn: () => quotationServicesApi.getAll(quotationId),
    enabled: quotationId !== undefined,
  });

  // Create quotation service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: CreateQuotationServiceDto) => quotationServicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Service added to quotation');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to add service');
    },
  });

  // Update quotation service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuotationServiceDto }) =>
      quotationServicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Service updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update service');
    },
  });

  // Delete quotation service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => quotationServicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Service removed from quotation');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to remove service');
    },
  });

  return {
    services: data?.data || [],
    isLoading,
    error,
    createService: createServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,
    isUpdating: updateServiceMutation.isPending,
    isDeleting: deleteServiceMutation.isPending,
  };
}
