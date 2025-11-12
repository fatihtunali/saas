/**
 * Users API Client
 * Phase 9: User Management & Permissions
 */

import { api as apiClient } from '@/lib/api-client';
import type {
  User,
  UserWithDetails,
  UserCreateData,
  UserUpdateData,
  UserProfile,
  ProfileUpdateData,
  PasswordChangeData,
  PasswordResetData,
  ActivityLog,
  ActivityLogFilters,
  UsersFilters,
  UsersListResponse,
  UserStatistics,
  UserPermissions,
} from '@/types/users';

/**
 * Users Management API
 */
export const usersApi = {
  /**
   * Get all users with filters
   */
  async getUsers(filters?: UsersFilters): Promise<UsersListResponse> {
    const params = new URLSearchParams();

    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.operator_id) params.append('operator_id', String(filters.operator_id));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response: any = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<UserWithDetails> {
    const response: any = await apiClient.get(`/users/${id}`);
    return response.data.user;
  },

  /**
   * Create new user
   */
  async createUser(data: UserCreateData): Promise<User> {
    const response: any = await apiClient.post('/users', data);
    return response.data.user;
  },

  /**
   * Update user
   */
  async updateUser(id: number, data: UserUpdateData): Promise<User> {
    const response: any = await apiClient.put(`/users/${id}`, data);
    return response.data.user;
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<User> {
    const response: any = await apiClient.patch(`/users/${id}/status`, {
      is_active: isActive,
    });
    return response.data.user;
  },

  /**
   * Admin reset user password
   */
  async resetUserPassword(id: number, data: PasswordResetData): Promise<void> {
    await apiClient.post(`/users/${id}/reset-password`, data);
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    const response: any = await apiClient.get(`/users?role=${role}`);
    return response.data.users;
  },

  /**
   * Get user activity logs
   */
  async getUserActivity(
    userId: number,
    filters?: ActivityLogFilters
  ): Promise<{
    activities: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString
      ? `/users/${userId}/activity?${queryString}`
      : `/users/${userId}/activity`;

    const response: any = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const response: any = await apiClient.get('/users/statistics');
    return response.data;
  },
};

/**
 * Profile API
 */
export const profileApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response: any = await apiClient.get('/profile');
    return response.data.profile;
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    const response: any = await apiClient.put('/profile', data);
    return response.data.profile;
  },

  /**
   * Change current user password
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    await apiClient.post('/profile/change-password', data);
  },

  /**
   * Get current user activity logs
   */
  async getMyActivity(filters?: Omit<ActivityLogFilters, 'user_id'>): Promise<{
    activities: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/profile/activity?${queryString}` : '/profile/activity';

    const response: any = await apiClient.get(url);
    return response.data;
  },
};

/**
 * Permissions API
 */
export const permissionsApi = {
  /**
   * Get current user permissions
   */
  async getMyPermissions(): Promise<UserPermissions> {
    const response: any = await apiClient.get('/permissions');
    return response.data.permissions;
  },

  /**
   * Check specific permission
   */
  async checkPermission(module: string, action: string): Promise<boolean> {
    try {
      const response: any = await apiClient.get(
        `/permissions/check?module=${module}&action=${action}`
      );
      return response.data.hasPermission;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user permissions (admin only)
   */
  async getUserPermissions(userId: number): Promise<UserPermissions> {
    const response: any = await apiClient.get(`/users/${userId}/permissions`);
    return response.data.permissions;
  },
};

/**
 * Export all APIs
 */
export default {
  users: usersApi,
  profile: profileApi,
  permissions: permissionsApi,
};
