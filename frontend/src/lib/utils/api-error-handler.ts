import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ApiError {
  error: string;
  details?: Record<string, string>;
  message?: string;
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    // Handle validation errors
    if (apiError?.details) {
      const errorMessages = Object.values(apiError.details);
      const message = errorMessages.join(', ');
      toast.error('Validation Error', { description: message });
      return message;
    }

    // Handle general API errors
    if (apiError?.error || apiError?.message) {
      const message = apiError.error || apiError.message || 'An error occurred';
      toast.error('Error', { description: message });
      return message;
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      const message = 'Network error. Please check your connection.';
      toast.error('Connection Error', { description: message });
      return message;
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      const message = 'Request timeout. Please try again.';
      toast.error('Timeout', { description: message });
      return message;
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const message = 'Session expired. Please log in again.';
      toast.error('Unauthorized', { description: message });
      // Redirect to login
      window.location.href = '/login';
      return message;
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const message = 'You do not have permission to perform this action.';
      toast.error('Forbidden', { description: message });
      return message;
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const message = 'Resource not found.';
      toast.error('Not Found', { description: message });
      return message;
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      const message = 'Server error. Please try again later.';
      toast.error('Server Error', { description: message });
      return message;
    }
  }

  // Handle unknown errors
  const message = 'An unexpected error occurred.';
  toast.error('Error', { description: message });
  return message;
}

/**
 * Extract error message without showing toast
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    if (apiError?.details) {
      return Object.values(apiError.details).join(', ');
    }

    if (apiError?.error || apiError?.message) {
      return apiError.error || apiError.message || 'An error occurred';
    }

    if (error.response?.status) {
      return `Error: ${error.response.status} ${error.response.statusText}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
