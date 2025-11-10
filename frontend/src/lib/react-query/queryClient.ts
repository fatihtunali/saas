import { QueryClient } from '@tanstack/react-query';

// Create a QueryClient instance with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cached data is kept for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Don't refetch on window focus (can be annoying during development)
      refetchOnWindowFocus: false,

      // Retry failed requests once
      retry: 1,

      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
