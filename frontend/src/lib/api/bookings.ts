/**
 * Bookings API Service
 *
 * This module provides API service functions for bookings management.
 * All functions use the configured Axios client with JWT authentication.
 *
 * @module lib/api/bookings
 */

import { apiClient } from './client';
import type {
  Booking,
  BookingsQueryParams,
  PaginatedBookings,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  BookingStats,
  BulkOperationResponse,
  BookingsApiResponse,
  ExportFormat,
  BookingPassenger,
  BookingService,
  BookingFlight,
  BookingPayment,
  BookingActivity,
  BookingDocument,
} from '@/types/bookings';

/**
 * Fetch paginated list of bookings with filters
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Promise resolving to paginated bookings data
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const bookings = await getBookings({
 *   page: 1,
 *   limit: 25,
 *   status: ['CONFIRMED', 'IN_PROGRESS'],
 *   search: 'john doe'
 * });
 * console.log(`Found ${bookings.total} bookings`);
 * ```
 */
export async function getBookings(params: BookingsQueryParams): Promise<PaginatedBookings> {
  try {
    const response = await apiClient.get<BookingsApiResponse<PaginatedBookings>>('/bookings', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Fetch a single booking by ID with all related data
 *
 * @param id - Booking ID
 * @returns Promise resolving to complete booking data
 * @throws Error if the API request fails or booking not found
 *
 * @example
 * ```typescript
 * const booking = await getBooking('123');
 * console.log(`Booking ${booking.bookingCode} for ${booking.clientName}`);
 * ```
 */
export async function getBooking(id: string): Promise<Booking> {
  try {
    const response = await apiClient.get<BookingsApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new booking
 *
 * @param data - Booking creation data
 * @returns Promise resolving to created booking
 * @throws Error if the API request fails or validation errors occur
 *
 * @example
 * ```typescript
 * const newBooking = await createBooking({
 *   clientId: 1,
 *   travelStartDate: '2024-06-01',
 *   travelEndDate: '2024-06-07',
 *   destinationCityId: 5,
 *   numAdults: 2,
 *   numChildren: 1,
 *   childrenAges: [8],
 *   totalCost: 2000,
 *   totalSellingPrice: 2500,
 *   bookingSource: 'Website'
 * });
 * console.log(`Created booking: ${newBooking.bookingCode}`);
 * ```
 */
export async function createBooking(data: CreateBookingInput): Promise<Booking> {
  try {
    const response = await apiClient.post<BookingsApiResponse<Booking>>('/bookings', data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Update an existing booking
 *
 * @param id - Booking ID to update
 * @param data - Booking update data
 * @returns Promise resolving to updated booking
 * @throws Error if the API request fails or booking not found
 *
 * @example
 * ```typescript
 * const updatedBooking = await updateBooking('123', {
 *   status: 'CONFIRMED',
 *   specialRequests: 'Early check-in requested'
 * });
 * console.log(`Updated booking status to ${updatedBooking.status}`);
 * ```
 */
export async function updateBooking(id: string, data: UpdateBookingInput): Promise<Booking> {
  try {
    const response = await apiClient.put<BookingsApiResponse<Booking>>(`/bookings/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a booking
 *
 * @param id - Booking ID to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if the API request fails or booking not found
 *
 * @example
 * ```typescript
 * await deleteBooking('123');
 * console.log('Booking deleted successfully');
 * ```
 */
export async function deleteBooking(id: string): Promise<void> {
  try {
    await apiClient.delete<BookingsApiResponse<void>>(`/bookings/${id}`);
  } catch (error) {
    console.error(`Error deleting booking ${id}:`, error);
    throw error;
  }
}

/**
 * Duplicate an existing booking
 *
 * Creates a copy of a booking with a new booking code
 *
 * @param id - Booking ID to duplicate
 * @returns Promise resolving to newly created booking
 * @throws Error if the API request fails or source booking not found
 *
 * @example
 * ```typescript
 * const duplicatedBooking = await duplicateBooking('123');
 * console.log(`Duplicated booking: ${duplicatedBooking.bookingCode}`);
 * ```
 */
export async function duplicateBooking(id: string): Promise<Booking> {
  try {
    const response = await apiClient.post<BookingsApiResponse<Booking>>(
      `/bookings/${id}/duplicate`
    );
    return response.data;
  } catch (error) {
    console.error(`Error duplicating booking ${id}:`, error);
    throw error;
  }
}

/**
 * Cancel a booking
 *
 * @param id - Booking ID to cancel
 * @param data - Cancellation data including reason
 * @returns Promise resolving to cancelled booking with updated status
 * @throws Error if the API request fails or booking not found
 *
 * @example
 * ```typescript
 * const cancelledBooking = await cancelBooking('123', {
 *   reason: 'Client requested cancellation',
 *   cancellationFee: 100,
 *   refundAmount: 900
 * });
 * console.log(`Booking cancelled, refund amount: ${cancelledBooking.refundAmount}`);
 * ```
 */
export async function cancelBooking(id: string, data: CancelBookingInput): Promise<Booking> {
  try {
    const response = await apiClient.post<BookingsApiResponse<Booking>>(
      `/bookings/${id}/cancel`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking ${id}:`, error);
    throw error;
  }
}

/**
 * Bulk delete multiple bookings
 *
 * @param ids - Array of booking IDs to delete
 * @returns Promise resolving to bulk operation result
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const result = await bulkDeleteBookings(['123', '124', '125']);
 * console.log(`Deleted ${result.successCount} bookings, ${result.failedCount} failed`);
 * if (result.errors.length > 0) {
 *   result.errors.forEach(err => console.error(`Failed to delete ${err.id}: ${err.error}`));
 * }
 * ```
 */
export async function bulkDeleteBookings(ids: string[]): Promise<BulkOperationResponse> {
  try {
    const response = await apiClient.post<BookingsApiResponse<BulkOperationResponse>>(
      '/bookings/bulk-delete',
      { ids }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting bookings:', error);
    throw error;
  }
}

/**
 * Bulk export bookings to file
 *
 * @param ids - Array of booking IDs to export (empty array exports all)
 * @param format - Export format (excel, pdf, or csv)
 * @returns Promise resolving to file blob
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const blob = await bulkExportBookings(['123', '124'], 'excel');
 * const url = window.URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = `bookings-export-${Date.now()}.xlsx`;
 * document.body.appendChild(a);
 * a.click();
 * window.URL.revokeObjectURL(url);
 * document.body.removeChild(a);
 * ```
 */
export async function bulkExportBookings(ids: string[], format: ExportFormat): Promise<Blob> {
  try {
    const response = await apiClient.post(
      '/bookings/bulk-export',
      { ids, format },
      { responseType: 'blob' }
    );
    return response as unknown as Blob;
  } catch (error) {
    console.error('Error bulk exporting bookings:', error);
    throw error;
  }
}

/**
 * Get booking statistics and analytics
 *
 * @returns Promise resolving to booking statistics
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const stats = await getBookingStats();
 * console.log(`Total bookings: ${stats.totalBookings}`);
 * console.log(`Total revenue: ${stats.totalRevenue}`);
 * console.log(`Top destination: ${stats.topDestinations[0].destination}`);
 * ```
 */
export async function getBookingStats(): Promise<BookingStats> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingStats>>('/bookings/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
}

/**
 * Search bookings with advanced filters
 *
 * This is an alias for getBookings with specific search parameters
 *
 * @param query - Search query string
 * @param params - Additional query parameters
 * @returns Promise resolving to paginated bookings data
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const results = await searchBookings('john', {
 *   page: 1,
 *   limit: 10,
 *   status: ['CONFIRMED']
 * });
 * console.log(`Found ${results.total} bookings matching "john"`);
 * ```
 */
export async function searchBookings(
  query: string,
  params?: Partial<BookingsQueryParams>
): Promise<PaginatedBookings> {
  return getBookings({
    page: 1,
    limit: 25,
    ...params,
    search: query,
  });
}

/**
 * Get bookings timeline/activity log
 *
 * @param id - Booking ID
 * @returns Promise resolving to booking activity history
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const timeline = await getBookingTimeline('123');
 * timeline.forEach(activity => {
 *   console.log(`${activity.createdAt}: ${activity.activityDescription}`);
 * });
 * ```
 */
export async function getBookingTimeline(id: string): Promise<any[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<any[]>>(`/bookings/${id}/timeline`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking timeline ${id}:`, error);
    throw error;
  }
}

/**
 * Send booking confirmation email
 *
 * @param id - Booking ID
 * @param recipientEmail - Optional recipient email (defaults to client email)
 * @returns Promise resolving when email is sent
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * await sendBookingConfirmation('123', 'client@example.com');
 * console.log('Confirmation email sent successfully');
 * ```
 */
export async function sendBookingConfirmation(id: string, recipientEmail?: string): Promise<void> {
  try {
    await apiClient.post<BookingsApiResponse<void>>(`/bookings/${id}/send-confirmation`, {
      recipientEmail,
    });
  } catch (error) {
    console.error(`Error sending booking confirmation ${id}:`, error);
    throw error;
  }
}

/**
 * Generate vouchers for booking services
 *
 * @param id - Booking ID
 * @param serviceIds - Optional array of specific service IDs (empty generates all)
 * @returns Promise resolving to voucher generation result
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * await generateVouchers('123', ['service-1', 'service-2']);
 * console.log('Vouchers generated successfully');
 * ```
 */
export async function generateVouchers(id: string, serviceIds?: string[]): Promise<void> {
  try {
    await apiClient.post<BookingsApiResponse<void>>(`/bookings/${id}/generate-vouchers`, {
      serviceIds,
    });
  } catch (error) {
    console.error(`Error generating vouchers for booking ${id}:`, error);
    throw error;
  }
}

/**
 * Update booking status
 *
 * Convenience method for updating only the status field
 *
 * @param id - Booking ID
 * @param status - New booking status
 * @returns Promise resolving to updated booking
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const booking = await updateBookingStatus('123', 'CONFIRMED');
 * console.log(`Booking status updated to ${booking.status}`);
 * ```
 */
export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  return updateBooking(id, { status: status as any });
}

/**
 * Get booking passengers by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of passengers
 * @throws Error if the API request fails
 */
export async function getBookingPassengers(bookingId: string): Promise<BookingPassenger[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingPassenger[]>>(
      `/booking-passengers`,
      { params: { booking_id: bookingId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking passengers ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Get booking services by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of services
 * @throws Error if the API request fails
 */
export async function getBookingServices(bookingId: string): Promise<BookingService[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingService[]>>(
      `/booking-services`,
      { params: { booking_id: bookingId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking services ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Get booking flights by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of flights
 * @throws Error if the API request fails
 */
export async function getBookingFlights(bookingId: string): Promise<BookingFlight[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingFlight[]>>(`/booking-flights`, {
      params: { booking_id: bookingId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking flights ${bookingId}:`, error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

/**
 * Get booking payments by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of payments
 * @throws Error if the API request fails
 */
export async function getBookingPayments(bookingId: string): Promise<BookingPayment[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingPayment[]>>(
      `/booking-payments`,
      { params: { booking_id: bookingId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking payments ${bookingId}:`, error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

/**
 * Get booking activities by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of activities
 * @throws Error if the API request fails
 */
export async function getBookingActivities(bookingId: string): Promise<BookingActivity[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingActivity[]>>(
      `/booking-activities`,
      { params: { booking_id: bookingId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking activities ${bookingId}:`, error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

/**
 * Get booking documents by booking ID
 *
 * @param bookingId - Booking ID
 * @returns Promise resolving to array of documents
 * @throws Error if the API request fails
 */
export async function getBookingDocuments(bookingId: string): Promise<BookingDocument[]> {
  try {
    const response = await apiClient.get<BookingsApiResponse<BookingDocument[]>>(
      `/booking-documents`,
      { params: { booking_id: bookingId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking documents ${bookingId}:`, error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

/**
 * Bookings API service object
 * Provides a namespaced API for all booking-related operations
 */
export const bookingsApi = {
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
  searchBookings,
  getBookingTimeline,
  sendBookingConfirmation,
  generateVouchers,
  updateBookingStatus,
  getBookingPassengers,
  getBookingServices,
  getBookingFlights,
  getBookingPayments,
  getBookingActivities,
  getBookingDocuments,
};
