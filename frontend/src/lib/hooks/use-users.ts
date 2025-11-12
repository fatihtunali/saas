/**
 * Users React Query Hooks
 * Phase 9: User Management & Permissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { toast } from 'sonner';
import type {
  User,
  UserWithDetails,
  UserCreateData,
  UserUpdateData,
  PasswordResetData,
  UsersFilters,
  UsersListResponse,
  UserStatistics,
  ActivityLogFilters,
} from '@/types/users';

// Query keys
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: UsersFilters) => [...USER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USER_QUERY_KEYS.details(), id] as const,
  statistics: () => [...USER_QUERY_KEYS.all, 'statistics'] as const,
  activity: (userId: number, filters?: ActivityLogFilters) =>
    [...USER_QUERY_KEYS.all, 'activity', userId, filters] as const,
  byRole: (role: string) => [...USER_QUERY_KEYS.all, 'by-role', role] as const,
};

/**
 * Get users list with filters
 */
export function useUsers(filters?: UsersFilters) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
}

/**
 * Get single user by ID
 */
export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id!),
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Get users by role
 */
export function useUsersByRole(role: string | undefined) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.byRole(role!),
    queryFn: () => usersApi.getUsersByRole(role!),
    enabled: !!role,
    staleTime: 30000,
  });
}

/**
 * Get user statistics
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.statistics(),
    queryFn: () => usersApi.getUserStatistics(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get user activity logs
 */
export function useUserActivity(userId: number | undefined, filters?: ActivityLogFilters) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.activity(userId!, filters),
    queryFn: () => usersApi.getUserActivity(userId!, filters),
    enabled: !!userId,
    staleTime: 30000,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateData) => usersApi.createUser(data),
    onSuccess: user => {
      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });

      toast.success('User created successfully', {
        description: `${user.full_name} has been added to the system`,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create user';
      toast.error('Failed to create user', {
        description: message,
      });
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateData }) =>
      usersApi.updateUser(id, data),
    onSuccess: (user, variables) => {
      // Invalidate specific user and lists
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });

      toast.success('User updated successfully', {
        description: `${user.full_name}'s information has been updated`,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user';
      toast.error('Failed to update user', {
        description: message,
      });
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove user from cache and invalidate lists
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });

      toast.success('User deleted successfully', {
        description: 'The user has been removed from the system',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete user';
      toast.error('Failed to delete user', {
        description: message,
      });
    },
  });
}

/**
 * Toggle user status mutation
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      usersApi.toggleUserStatus(id, isActive),
    onSuccess: (user, variables) => {
      // Update user in cache
      queryClient.setQueryData<UserWithDetails>(USER_QUERY_KEYS.detail(variables.id), old =>
        old ? { ...old, is_active: user.is_active } : undefined
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });

      const status = user.is_active ? 'activated' : 'deactivated';
      toast.success(`User ${status}`, {
        description: `${user.full_name} has been ${status}`,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user status';
      toast.error('Failed to update status', {
        description: message,
      });
    },
  });
}

/**
 * Reset user password mutation (admin only)
 */
export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PasswordResetData }) =>
      usersApi.resetUserPassword(id, data),
    onSuccess: (_, variables) => {
      // Add activity log entry
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.activity(variables.id),
      });

      toast.success('Password reset successfully', {
        description: 'The user has been notified of the password change',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to reset password';
      toast.error('Failed to reset password', {
        description: message,
      });
    },
  });
}

/**
 * Bulk operations
 */

interface BulkDeleteParams {
  ids: number[];
  onProgress?: (completed: number, total: number) => void;
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, onProgress }: BulkDeleteParams) => {
      const results = [];
      for (let i = 0; i < ids.length; i++) {
        try {
          await usersApi.deleteUser(ids[i]);
          results.push({ id: ids[i], success: true });
        } catch (error) {
          results.push({ id: ids[i], success: false, error });
        }
        onProgress?.(i + 1, ids.length);
      }
      return results;
    },
    onSuccess: results => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        toast.success('Users deleted successfully', {
          description: `${successCount} user(s) have been removed`,
        });
      } else {
        toast.warning('Bulk delete completed with errors', {
          description: `${successCount} succeeded, ${failCount} failed`,
        });
      }
    },
  });
}

interface BulkStatusChangeParams {
  ids: number[];
  isActive: boolean;
  onProgress?: (completed: number, total: number) => void;
}

export function useBulkToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, isActive, onProgress }: BulkStatusChangeParams) => {
      const results = [];
      for (let i = 0; i < ids.length; i++) {
        try {
          await usersApi.toggleUserStatus(ids[i], isActive);
          results.push({ id: ids[i], success: true });
        } catch (error) {
          results.push({ id: ids[i], success: false, error });
        }
        onProgress?.(i + 1, ids.length);
      }
      return results;
    },
    onSuccess: (results, variables) => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });

      const successCount = results.filter(r => r.success).length;
      const status = variables.isActive ? 'activated' : 'deactivated';

      toast.success(`Users ${status}`, {
        description: `${successCount} user(s) have been ${status}`,
      });
    },
  });
}

/**
 * Helper hooks
 */

/**
 * Check if email is available
 */
export function useCheckEmailAvailability(email: string | undefined) {
  return useQuery({
    queryKey: ['users', 'email-check', email],
    queryFn: async () => {
      if (!email) return true;
      try {
        const users = await usersApi.getUsers({ search: email, limit: 1 });
        return users.users.length === 0;
      } catch {
        return true;
      }
    },
    enabled: !!email && email.length > 3,
    staleTime: 5000,
  });
}

/**
 * Get active users count
 */
export function useActiveUsersCount() {
  const { data: stats } = useUserStatistics();
  return stats?.active_users || 0;
}

/**
 * Get inactive users count
 */
export function useInactiveUsersCount() {
  const { data: stats } = useUserStatistics();
  return stats?.inactive_users || 0;
}
