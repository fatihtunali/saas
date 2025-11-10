import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Test hook to verify React Query is working
 * Fetches the health check endpoint from the backend
 */
export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      // Call the backend health endpoint (removes /api prefix since client.ts already has it)
      const response = await apiClient.getInstance().get<HealthCheckResponse>('/../health');
      return response.data;
    },
    // Refetch every 30 seconds to verify connection
    refetchInterval: 30000,
  });
}
