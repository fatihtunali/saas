/**
 * Permissions React Query Hooks
 * Phase 9: User Management & Permissions
 */

import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/users';
import { useUserRole } from './use-profile';
import type { UserPermissions, PermissionModule, PermissionAction } from '@/types/users';

// Query keys
export const PERMISSIONS_QUERY_KEYS = {
  all: ['permissions'] as const,
  my: () => [...PERMISSIONS_QUERY_KEYS.all, 'my'] as const,
  user: (userId: number) => [...PERMISSIONS_QUERY_KEYS.all, 'user', userId] as const,
  check: (module: string, action: string) =>
    [...PERMISSIONS_QUERY_KEYS.all, 'check', module, action] as const,
};

/**
 * Get current user's permissions
 */
export function useMyPermissions() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.my(),
    queryFn: () => permissionsApi.getMyPermissions(),
    staleTime: 300000, // 5 minutes (permissions don't change often)
    gcTime: 600000, // 10 minutes
  });
}

/**
 * Get specific user's permissions (admin only)
 */
export function useUserPermissions(userId: number | undefined) {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.user(userId!),
    queryFn: () => permissionsApi.getUserPermissions(userId!),
    enabled: !!userId,
    staleTime: 300000,
  });
}

/**
 * Check if user has specific permission
 */
export function useHasPermission(
  module: PermissionModule | string,
  action: PermissionAction | string
): boolean {
  const { data: permissions } = useMyPermissions();

  if (!permissions) return false;

  // Check if module exists in permissions
  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  // Check if action is allowed
  return modulePermissions[action as keyof typeof modulePermissions] === true;
}

/**
 * Check multiple permissions at once
 */
export function useHasAnyPermission(checks: Array<{ module: string; action: string }>): boolean {
  const { data: permissions } = useMyPermissions();

  if (!permissions) return false;

  return checks.some(({ module, action }) => {
    const modulePermissions = permissions[module];
    return modulePermissions?.[action as keyof typeof modulePermissions] === true;
  });
}

/**
 * Check if user has all specified permissions
 */
export function useHasAllPermissions(checks: Array<{ module: string; action: string }>): boolean {
  const { data: permissions } = useMyPermissions();

  if (!permissions) return false;

  return checks.every(({ module, action }) => {
    const modulePermissions = permissions[module];
    return modulePermissions?.[action as keyof typeof modulePermissions] === true;
  });
}

/**
 * Get all permissions for a specific module
 */
export function useModulePermissions(module: PermissionModule | string) {
  const { data: permissions } = useMyPermissions();

  if (!permissions || !permissions[module]) {
    return {
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
    };
  }

  return permissions[module];
}

/**
 * Check if user can view a module
 */
export function useCanView(module: PermissionModule | string): boolean {
  return useHasPermission(module, 'view');
}

/**
 * Check if user can create in a module
 */
export function useCanCreate(module: PermissionModule | string): boolean {
  return useHasPermission(module, 'create');
}

/**
 * Check if user can edit in a module
 */
export function useCanEdit(module: PermissionModule | string): boolean {
  return useHasPermission(module, 'edit');
}

/**
 * Check if user can delete in a module
 */
export function useCanDelete(module: PermissionModule | string): boolean {
  return useHasPermission(module, 'delete');
}

/**
 * Check if user can export from a module
 */
export function useCanExport(module: PermissionModule | string): boolean {
  return useHasPermission(module, 'export');
}

/**
 * Check if user is admin (super_admin or operator_admin)
 */
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return role === 'super_admin' || role === 'operator_admin';
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const role = useUserRole();
  return role === 'super_admin';
}

/**
 * Permission-based component wrapper hook
 */
export function usePermissionGuard(
  module: PermissionModule | string,
  action: PermissionAction | string
): {
  hasPermission: boolean;
  isLoading: boolean;
} {
  const { data: permissions, isLoading } = useMyPermissions();
  const hasPermission = useHasPermission(module, action);

  return {
    hasPermission,
    isLoading,
  };
}

/**
 * Get permission summary for display
 */
export interface PermissionSummary {
  module: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
  allowedActions: string[];
  deniedActions: string[];
}

export function usePermissionsSummary(): PermissionSummary[] {
  const { data: permissions } = useMyPermissions();

  if (!permissions) return [];

  return Object.entries(permissions).map(([module, perms]) => {
    const allowedActions: string[] = [];
    const deniedActions: string[] = [];

    Object.entries(perms).forEach(([action, allowed]) => {
      if (allowed) {
        allowedActions.push(action);
      } else {
        deniedActions.push(action);
      }
    });

    return {
      module,
      permissions: perms,
      allowedActions,
      deniedActions,
    };
  });
}

/**
 * Check if permissions are loaded
 */
export function useArePermissionsLoaded(): boolean {
  const { data, isLoading } = useMyPermissions();
  return !isLoading && !!data;
}

/**
 * Users module permissions shortcuts
 */
export function useUserManagementPermissions() {
  return {
    canViewUsers: useCanView('users'),
    canCreateUsers: useCanCreate('users'),
    canEditUsers: useCanEdit('users'),
    canDeleteUsers: useCanDelete('users'),
    canExportUsers: useCanExport('users'),
  };
}

/**
 * Settings module permissions shortcuts
 */
export function useSettingsPermissions() {
  return {
    canViewSettings: useCanView('settings'),
    canEditSettings: useCanEdit('settings'),
  };
}

/**
 * All module permissions shortcuts
 */
export function useAllModulePermissions() {
  const { data: permissions } = useMyPermissions();

  if (!permissions) {
    return {};
  }

  const result: Record<string, ReturnType<typeof useModulePermissions>> = {};

  Object.keys(permissions).forEach(module => {
    result[module] = permissions[module];
  });

  return result;
}

/**
 * Permission context (all permissions in one hook)
 */
export interface PermissionsContext {
  permissions: UserPermissions | undefined;
  isLoading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  canView: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  canExport: (module: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function usePermissionsContext(): PermissionsContext {
  const { data: permissions, isLoading } = useMyPermissions();
  const role = useUserRole();

  const hasPermission = (module: string, action: string): boolean => {
    if (!permissions) return false;
    const modulePermissions = permissions[module];
    return modulePermissions?.[action as keyof typeof modulePermissions] === true;
  };

  const canView = (module: string) => hasPermission(module, 'view');
  const canCreate = (module: string) => hasPermission(module, 'create');
  const canEdit = (module: string) => hasPermission(module, 'edit');
  const canDelete = (module: string) => hasPermission(module, 'delete');
  const canExport = (module: string) => hasPermission(module, 'export');

  return {
    permissions,
    isLoading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdmin: role === 'super_admin' || role === 'operator_admin',
    isSuperAdmin: role === 'super_admin',
  };
}
