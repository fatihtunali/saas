/**
 * Profile React Query Hooks
 * Phase 9: User Management & Permissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/users';
import { toast } from 'sonner';
import type {
  UserProfile,
  ProfileUpdateData,
  PasswordChangeData,
  ActivityLogFilters,
} from '@/types/users';

// Query keys
export const PROFILE_QUERY_KEYS = {
  all: ['profile'] as const,
  detail: () => [...PROFILE_QUERY_KEYS.all, 'detail'] as const,
  activity: (filters?: ActivityLogFilters) =>
    [...PROFILE_QUERY_KEYS.all, 'activity', filters] as const,
};

/**
 * Get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.detail(),
    queryFn: () => profileApi.getProfile(),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => profileApi.updateProfile(data),
    onMutate: async newProfile => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.detail() });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEYS.detail());

      // Optimistically update
      queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEYS.detail(), old => {
        if (!old) return old;
        return {
          ...old,
          ...newProfile,
        };
      });

      return { previousProfile };
    },
    onSuccess: profile => {
      toast.success('Profile updated successfully', {
        description: 'Your profile information has been saved',
      });
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEYS.detail(), context.previousProfile);
      }

      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error('Failed to update profile', {
        description: message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.detail() });
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PasswordChangeData) => profileApi.changePassword(data),
    onSuccess: () => {
      // Invalidate activity to show password change
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.activity() });

      toast.success('Password changed successfully', {
        description: 'Your password has been updated',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to change password';

      // Provide more specific error messages
      if (message.includes('incorrect') || message.includes('wrong')) {
        toast.error('Current password is incorrect', {
          description: 'Please check your current password and try again',
        });
      } else if (message.includes('same')) {
        toast.error('Password unchanged', {
          description: 'New password must be different from current password',
        });
      } else {
        toast.error('Failed to change password', {
          description: message,
        });
      }
    },
  });
}

/**
 * Get my activity logs
 */
export function useMyActivity(filters?: Omit<ActivityLogFilters, 'user_id'>) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.activity(filters),
    queryFn: () => profileApi.getMyActivity(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Refresh profile data
 */
export function useRefreshProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.detail() });
  };
}

/**
 * Get profile field value
 */
export function useProfileField<K extends keyof UserProfile>(field: K): UserProfile[K] | undefined {
  const { data: profile } = useProfile();
  return profile?.[field];
}

/**
 * Check if profile is loaded
 */
export function useIsProfileLoaded(): boolean {
  const { data, isLoading } = useProfile();
  return !isLoading && !!data;
}

/**
 * Get user full name
 */
export function useUserFullName(): string {
  const { data: profile } = useProfile();
  return profile?.full_name || 'User';
}

/**
 * Get user email
 */
export function useUserEmail(): string | undefined {
  const { data: profile } = useProfile();
  return profile?.email;
}

/**
 * Get user role
 */
export function useUserRole() {
  const { data: profile } = useProfile();
  return profile?.role;
}

/**
 * Get user operator ID
 */
export function useUserOperatorId(): number | null | undefined {
  const { data: profile } = useProfile();
  return profile?.operator_id;
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const role = useUserRole();
  return role === 'super_admin';
}

/**
 * Check if user is operator admin
 */
export function useIsOperatorAdmin(): boolean {
  const role = useUserRole();
  return role === 'operator_admin';
}

/**
 * Check if user is admin (super or operator)
 */
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return role === 'super_admin' || role === 'operator_admin';
}

/**
 * Get last login time
 */
export function useLastLogin(): string | null | undefined {
  const { data: profile } = useProfile();
  return profile?.last_login;
}

/**
 * Profile context (alternative to individual hooks)
 */
export interface ProfileContext {
  profile: UserProfile | undefined;
  isLoading: boolean;
  isError: boolean;
  updateProfile: ReturnType<typeof useUpdateProfile>['mutate'];
  changePassword: ReturnType<typeof useChangePassword>['mutate'];
  refreshProfile: () => void;
}

export function useProfileContext(): ProfileContext {
  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: changePassword } = useChangePassword();
  const refreshProfile = useRefreshProfile();

  return {
    profile,
    isLoading,
    isError,
    updateProfile,
    changePassword,
    refreshProfile,
  };
}
