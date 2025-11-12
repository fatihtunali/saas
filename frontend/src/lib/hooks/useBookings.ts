/**
 * Bookings React Query Hooks
 *
 * Custom hooks for fetching and mutating bookings data using React Query.
 * These hooks provide loading states, error handling, automatic refetching,
 * and cache management.
 *
 * @module lib/hooks/useBookings
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  duplicateBooking,
  cancelBooking,
  bulkDeleteBookings,
  bulkExportBookings,
  getBookingStats,
  getBookingTimeline,
  sendBookingConfirmation,
  generateVouchers,
  getBookingPassengers,
  getBookingServices,
  getBookingFlights,
  getBookingPayments,
  getBookingActivities,
  getBookingDocuments,
} from '@/lib/api/bookings';
import type {
  Booking,
  BookingsQueryParams,
  PaginatedBookings,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  BookingStats,
  BulkOperationResponse,
  ExportFormat,
  BookingPassenger,
  BookingService,
  BookingFlight,
  BookingPayment,
  BookingActivity,
  BookingDocument,
} from '@/types/bookings';

/**
 * Query keys for bookings
 * Used for cache management and invalidation
 */
export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (params: BookingsQueryParams) => [...bookingsKeys.lists(), params] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
  stats: () => [...bookingsKeys.all, 'stats'] as const,
  timeline: (id: string) => [...bookingsKeys.all, 'timeline', id] as const,
  passengers: (id: string) => [...bookingsKeys.all, 'passengers', id] as const,
  services: (id: string) => [...bookingsKeys.all, 'services', id] as const,
  flights: (id: string) => [...bookingsKeys.all, 'flights', id] as const,
  payments: (id: string) => [...bookingsKeys.all, 'payments', id] as const,
  activities: (id: string) => [...bookingsKeys.all, 'activities', id] as const,
  documents: (id: string) => [...bookingsKeys.all, 'documents', id] as const,
};

/**
 * Hook to fetch paginated bookings list with filters
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Query result with bookings data, loading, and error states
 *
 * @example
 * ```typescript
 * function BookingsList() {
 *   const [params, setParams] = useState<BookingsQueryParams>({
 *     page: 1,
 *     limit: 25,
 *     status: ['CONFIRMED'],
 *   });
 *
 *   const { data, isLoading, error, refetch } = useBookings(params);
 *
 *   if (isLoading) return <BookingsSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <DataTable
 *       data={data.data}
 *       totalPages={data.totalPages}
 *       currentPage={data.page}
 *       onPageChange={(page) => setParams({ ...params, page })}
 *     />
 *   );
 * }
 * ```
 */
export function useBookings(params: BookingsQueryParams): UseQueryResult<PaginatedBookings, Error> {
  return useQuery({
    queryKey: bookingsKeys.list(params),
    queryFn: () => getBookings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - bookings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime in React Query v4)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Hook to fetch a single booking by ID with all related data
 *
 * @param id - Booking ID
 * @param enabled - Whether the query should execute (default: true if id exists)
 * @returns Query result with booking data, loading, and error states
 *
 * @example
 * ```typescript
 * function BookingDetails({ bookingId }: { bookingId: string }) {
 *   const { data: booking, isLoading, error } = useBooking(bookingId);
 *
 *   if (isLoading) return <BookingDetailsSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div>
 *       <h1>{booking.bookingCode}</h1>
 *       <p>Client: {booking.clientName}</p>
 *       <p>Destination: {booking.destination}</p>
 *       <p>Status: {booking.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBooking(id: string, enabled = true): UseQueryResult<Booking, Error> {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual bookings don't change as frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to create a new booking
 *
 * Automatically invalidates bookings list and stats cache on success
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function CreateBookingForm() {
 *   const { mutate, isPending, isError, error } = useCreateBooking();
 *
 *   const onSubmit = (data: CreateBookingInput) => {
 *     mutate(data, {
 *       onSuccess: (newBooking) => {
 *         toast.success(`Booking ${newBooking.bookingCode} created successfully`);
 *         router.push(`/bookings/${newBooking.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to create booking: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       {/* form fields *\/}
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Creating...' : 'Create Booking'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateBooking(): UseMutationResult<Booking, Error, CreateBookingInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: data => {
      // Invalidate bookings list to refetch with new booking
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
      // Set the new booking in cache
      queryClient.setQueryData(bookingsKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to update an existing booking
 *
 * Automatically invalidates affected queries on success
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function EditBookingForm({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending, isError, error } = useUpdateBooking();
 *   const { data: booking } = useBooking(bookingId);
 *
 *   const onSubmit = (data: UpdateBookingInput) => {
 *     mutate(
 *       { id: bookingId, data },
 *       {
 *         onSuccess: (updatedBooking) => {
 *           toast.success('Booking updated successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to update booking: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       {/* form fields *\/}
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateBooking(): UseMutationResult<
  Booking,
  Error,
  { id: string; data: UpdateBookingInput }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateBooking(id, data),
    onSuccess: data => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingsKeys.detail(data.id), data);
      // Invalidate bookings list to show updated data
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      // Invalidate stats in case status changed
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
      // Invalidate timeline to show update activity
      queryClient.invalidateQueries({ queryKey: bookingsKeys.timeline(data.id) });
    },
  });
}

/**
 * Hook to delete a booking
 *
 * Automatically invalidates affected queries on success
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function DeleteBookingButton({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending } = useDeleteBooking();
 *   const [showConfirm, setShowConfirm] = useState(false);
 *
 *   const handleDelete = () => {
 *     mutate(bookingId, {
 *       onSuccess: () => {
 *         toast.success('Booking deleted successfully');
 *         router.push('/bookings');
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to delete booking: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <Button onClick={() => setShowConfirm(true)} variant="destructive">
 *         Delete Booking
 *       </Button>
 *       <ConfirmDialog
 *         open={showConfirm}
 *         onConfirm={handleDelete}
 *         onCancel={() => setShowConfirm(false)}
 *         loading={isPending}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useDeleteBooking(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bookingsKeys.detail(deletedId) });
      // Invalidate list to refetch without deleted booking
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
    },
  });
}

/**
 * Hook to duplicate an existing booking
 *
 * Creates a copy of a booking with a new booking code
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function DuplicateBookingButton({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending } = useDuplicateBooking();
 *
 *   const handleDuplicate = () => {
 *     mutate(bookingId, {
 *       onSuccess: (newBooking) => {
 *         toast.success(`Booking duplicated as ${newBooking.bookingCode}`);
 *         router.push(`/bookings/${newBooking.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to duplicate booking: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <Button onClick={handleDuplicate} disabled={isPending}>
 *       {isPending ? 'Duplicating...' : 'Duplicate Booking'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useDuplicateBooking(): UseMutationResult<Booking, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateBooking,
    onSuccess: data => {
      // Add new booking to cache
      queryClient.setQueryData(bookingsKeys.detail(data.id), data);
      // Invalidate list to show new booking
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
    },
  });
}

/**
 * Hook to cancel a booking
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function CancelBookingForm({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending } = useCancelBooking();
 *
 *   const onSubmit = (data: CancelBookingInput) => {
 *     mutate(
 *       { id: bookingId, data },
 *       {
 *         onSuccess: (cancelledBooking) => {
 *           toast.success('Booking cancelled successfully');
 *           // Show refund amount if applicable
 *           if (cancelledBooking.refundAmount) {
 *             toast.info(`Refund amount: ${cancelledBooking.refundAmount}`);
 *           }
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to cancel booking: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <Input
 *         label="Cancellation Reason"
 *         {...register('reason', { required: true })}
 *       />
 *       <Input
 *         label="Cancellation Fee"
 *         type="number"
 *         {...register('cancellationFee')}
 *       />
 *       <Input
 *         label="Refund Amount"
 *         type="number"
 *         {...register('refundAmount')}
 *       />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Cancelling...' : 'Cancel Booking'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCancelBooking(): UseMutationResult<
  Booking,
  Error,
  { id: string; data: CancelBookingInput }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => cancelBooking(id, data),
    onSuccess: data => {
      // Update booking in cache with cancelled status
      queryClient.setQueryData(bookingsKeys.detail(data.id), data);
      // Invalidate list to show updated status
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
      // Invalidate timeline to show cancellation activity
      queryClient.invalidateQueries({ queryKey: bookingsKeys.timeline(data.id) });
    },
  });
}

/**
 * Hook to bulk delete multiple bookings
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function BookingsTable() {
 *   const [selectedIds, setSelectedIds] = useState<string[]>([]);
 *   const { mutate, isPending } = useBulkDeleteBookings();
 *
 *   const handleBulkDelete = () => {
 *     mutate(selectedIds, {
 *       onSuccess: (result) => {
 *         toast.success(`Deleted ${result.successCount} bookings`);
 *         if (result.failedCount > 0) {
 *           toast.warning(`Failed to delete ${result.failedCount} bookings`);
 *         }
 *         setSelectedIds([]);
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to delete bookings: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <DataTable
 *         data={bookings}
 *         selectedRows={selectedIds}
 *         onSelectRows={setSelectedIds}
 *       />
 *       {selectedIds.length > 0 && (
 *         <Button onClick={handleBulkDelete} disabled={isPending}>
 *           Delete {selectedIds.length} bookings
 *         </Button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useBulkDeleteBookings(): UseMutationResult<BulkOperationResponse, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteBookings,
    onSuccess: () => {
      // Invalidate all bookings queries
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingsKeys.stats() });
    },
  });
}

/**
 * Hook to bulk export bookings
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function ExportBookingsButton({ selectedIds }: { selectedIds: string[] }) {
 *   const { mutate, isPending } = useBulkExportBookings();
 *
 *   const handleExport = (format: ExportFormat) => {
 *     mutate(
 *       { ids: selectedIds, format },
 *       {
 *         onSuccess: (blob) => {
 *           // Download file
 *           const url = window.URL.createObjectURL(blob);
 *           const a = document.createElement('a');
 *           a.href = url;
 *           a.download = `bookings-export-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
 *           document.body.appendChild(a);
 *           a.click();
 *           window.URL.revokeObjectURL(url);
 *           document.body.removeChild(a);
 *           toast.success('Export completed successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to export bookings: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild>
 *         <Button disabled={isPending}>
 *           {isPending ? 'Exporting...' : 'Export'}
 *         </Button>
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem onClick={() => handleExport('excel')}>
 *           Export to Excel
 *         </DropdownMenuItem>
 *         <DropdownMenuItem onClick={() => handleExport('pdf')}>
 *           Export to PDF
 *         </DropdownMenuItem>
 *         <DropdownMenuItem onClick={() => handleExport('csv')}>
 *           Export to CSV
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * ```
 */
export function useBulkExportBookings(): UseMutationResult<
  Blob,
  Error,
  { ids: string[]; format: ExportFormat }
> {
  return useMutation({
    mutationFn: ({ ids, format }) => bulkExportBookings(ids, format),
  });
}

/**
 * Hook to fetch booking statistics
 *
 * @returns Query result with booking stats, loading, and error states
 *
 * @example
 * ```typescript
 * function BookingsStatsCard() {
 *   const { data: stats, isLoading, error } = useBookingStats();
 *
 *   if (isLoading) return <StatsSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div className="grid grid-cols-4 gap-4">
 *       <StatCard
 *         title="Total Bookings"
 *         value={stats.totalBookings}
 *         icon={<BookingIcon />}
 *       />
 *       <StatCard
 *         title="Total Revenue"
 *         value={formatCurrency(stats.totalRevenue)}
 *         icon={<RevenueIcon />}
 *       />
 *       <StatCard
 *         title="Confirmed"
 *         value={stats.confirmedBookings}
 *         icon={<CheckIcon />}
 *       />
 *       <StatCard
 *         title="Pending"
 *         value={stats.pendingBookings}
 *         icon={<ClockIcon />}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useBookingStats(): UseQueryResult<BookingStats, Error> {
  return useQuery({
    queryKey: bookingsKeys.stats(),
    queryFn: getBookingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change that frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to fetch booking timeline/activity log
 *
 * @param id - Booking ID
 * @returns Query result with timeline data, loading, and error states
 *
 * @example
 * ```typescript
 * function BookingTimeline({ bookingId }: { bookingId: string }) {
 *   const { data: timeline, isLoading } = useBookingTimeline(bookingId);
 *
 *   if (isLoading) return <TimelineSkeleton />;
 *
 *   return (
 *     <div className="space-y-4">
 *       {timeline?.map((activity) => (
 *         <TimelineItem key={activity.id}>
 *           <span className="text-sm text-muted-foreground">
 *             {formatDate(activity.createdAt)}
 *           </span>
 *           <p>{activity.activityDescription}</p>
 *           {activity.userName && (
 *             <span className="text-sm">by {activity.userName}</span>
 *           )}
 *         </TimelineItem>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBookingTimeline(id: string): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: bookingsKeys.timeline(id),
    queryFn: () => getBookingTimeline(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - timeline should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to send booking confirmation email
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function SendConfirmationButton({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending } = useSendBookingConfirmation();
 *
 *   const handleSend = () => {
 *     mutate(
 *       { id: bookingId },
 *       {
 *         onSuccess: () => {
 *           toast.success('Confirmation email sent successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to send email: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Button onClick={handleSend} disabled={isPending}>
 *       {isPending ? 'Sending...' : 'Send Confirmation'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useSendBookingConfirmation(): UseMutationResult<
  void,
  Error,
  { id: string; recipientEmail?: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recipientEmail }) => sendBookingConfirmation(id, recipientEmail),
    onSuccess: (_, { id }) => {
      // Invalidate timeline to show email sent activity
      queryClient.invalidateQueries({ queryKey: bookingsKeys.timeline(id) });
    },
  });
}

/**
 * Hook to generate vouchers for booking services
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * ```typescript
 * function GenerateVouchersButton({ bookingId }: { bookingId: string }) {
 *   const { mutate, isPending } = useGenerateVouchers();
 *
 *   const handleGenerate = () => {
 *     mutate(
 *       { id: bookingId },
 *       {
 *         onSuccess: () => {
 *           toast.success('Vouchers generated successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to generate vouchers: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Button onClick={handleGenerate} disabled={isPending}>
 *       {isPending ? 'Generating...' : 'Generate Vouchers'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useGenerateVouchers(): UseMutationResult<
  void,
  Error,
  { id: string; serviceIds?: string[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, serviceIds }) => generateVouchers(id, serviceIds),
    onSuccess: (_, { id }) => {
      // Invalidate booking to show updated voucher status
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(id) });
      // Invalidate timeline to show voucher generation activity
      queryClient.invalidateQueries({ queryKey: bookingsKeys.timeline(id) });
    },
  });
}

/**
 * Hook to fetch booking passengers
 *
 * @param bookingId - Booking ID
 * @returns Query result with passengers data
 */
export function useBookingPassengers(bookingId: string): UseQueryResult<BookingPassenger[], Error> {
  return useQuery({
    queryKey: bookingsKeys.passengers(bookingId),
    queryFn: () => getBookingPassengers(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch booking services
 *
 * @param bookingId - Booking ID
 * @returns Query result with services data
 */
export function useBookingServices(bookingId: string): UseQueryResult<BookingService[], Error> {
  return useQuery({
    queryKey: bookingsKeys.services(bookingId),
    queryFn: () => getBookingServices(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch booking flights
 *
 * @param bookingId - Booking ID
 * @returns Query result with flights data
 */
export function useBookingFlights(bookingId: string): UseQueryResult<BookingFlight[], Error> {
  return useQuery({
    queryKey: bookingsKeys.flights(bookingId),
    queryFn: () => getBookingFlights(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch booking payments
 *
 * @param bookingId - Booking ID
 * @returns Query result with payments data
 */
export function useBookingPayments(bookingId: string): UseQueryResult<BookingPayment[], Error> {
  return useQuery({
    queryKey: bookingsKeys.payments(bookingId),
    queryFn: () => getBookingPayments(bookingId),
    enabled: !!bookingId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch booking activities
 *
 * @param bookingId - Booking ID
 * @returns Query result with activities data
 */
export function useBookingActivities(bookingId: string): UseQueryResult<BookingActivity[], Error> {
  return useQuery({
    queryKey: bookingsKeys.activities(bookingId),
    queryFn: () => getBookingActivities(bookingId),
    enabled: !!bookingId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch booking documents
 *
 * @param bookingId - Booking ID
 * @returns Query result with documents data
 */
export function useBookingDocuments(bookingId: string): UseQueryResult<BookingDocument[], Error> {
  return useQuery({
    queryKey: bookingsKeys.documents(bookingId),
    queryFn: () => getBookingDocuments(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}
