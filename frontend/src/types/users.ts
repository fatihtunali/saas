/**
 * User Management Type Definitions
 * Phase 9: User Management & Permissions
 */

// Role types enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATOR_ADMIN = 'operator_admin',
  OPERATIONS_MANAGER = 'operations_manager',
  SALES_MANAGER = 'sales_manager',
  ACCOUNTANT = 'accountant',
  STAFF = 'staff',
}

// Permission action types
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
}

// Permission module types
export enum PermissionModule {
  DASHBOARD = 'dashboard',
  BOOKINGS = 'bookings',
  SERVICES = 'services',
  CLIENTS = 'clients',
  PAYMENTS = 'payments',
  REPORTS = 'reports',
  OPERATIONS = 'operations',
  USERS = 'users',
  SETTINGS = 'settings',
}

// User interface
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  operator_id: number | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// User with additional details
export interface UserWithDetails extends User {
  operator_name?: string;
  created_by?: string;
  total_logins?: number;
  permissions?: UserPermissions;
}

// User form data for create
export interface UserCreateData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  operator_id?: number | null;
  is_active: boolean;
}

// User form data for update
export interface UserUpdateData {
  full_name: string;
  phone?: string | null;
  role?: UserRole;
  is_active?: boolean;
}

// Profile data
export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  operator_id: number | null;
  operator_name?: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

// Profile update data
export interface ProfileUpdateData {
  full_name: string;
  phone?: string;
}

// Password change data
export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Admin password reset data
export interface PasswordResetData {
  new_password: string;
  confirm_password: string;
}

// Activity log entry
export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  module: string;
  entity_type: string | null;
  entity_id: number | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Activity log filters
export interface ActivityLogFilters {
  user_id?: number;
  module?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// Permission check
export interface PermissionCheck {
  module: PermissionModule | string;
  action: PermissionAction | string;
}

// User permissions (all permissions for a user)
export interface UserPermissions {
  [key: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

// Users list filters
export interface UsersFilters {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
  operator_id?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Users list response
export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// User statistics
export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  by_role: {
    [key in UserRole]?: number;
  };
  recent_logins: number;
}

// Password strength
export interface PasswordStrength {
  score: number; // 0-4
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  feedback: string[];
  requirements: {
    min_length: boolean;
    has_uppercase: boolean;
    has_lowercase: boolean;
    has_number: boolean;
    has_special: boolean;
  };
}

// Session information
export interface SessionInfo {
  user_id: number;
  login_time: string;
  last_activity: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
}

// Role display configuration
export interface RoleConfig {
  value: UserRole;
  label: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'yellow' | 'gray';
  description: string;
  level: number; // Hierarchy level
}

// Activity action types
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'password_change'
  | 'password_reset'
  | 'status_change'
  | 'role_change';

// Activity display configuration
export interface ActivityConfig {
  action: ActivityAction;
  icon: string;
  color: string;
  label: string;
}

// Default form values
export const defaultUserCreateValues: Partial<UserCreateData> = {
  email: '',
  password: '',
  confirm_password: '',
  full_name: '',
  phone: '',
  role: UserRole.STAFF,
  is_active: true,
};

export const defaultUserUpdateValues: Partial<UserUpdateData> = {
  full_name: '',
  phone: '',
  is_active: true,
};

export const defaultProfileUpdateValues: Partial<ProfileUpdateData> = {
  full_name: '',
  phone: '',
};

export const defaultPasswordChangeValues: PasswordChangeData = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

// Role configurations
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [UserRole.SUPER_ADMIN]: {
    value: UserRole.SUPER_ADMIN,
    label: 'Super Admin',
    color: 'purple',
    description: 'Platform administrator with full access',
    level: 1,
  },
  [UserRole.OPERATOR_ADMIN]: {
    value: UserRole.OPERATOR_ADMIN,
    label: 'Operator Admin',
    color: 'blue',
    description: 'Company owner with full company access',
    level: 2,
  },
  [UserRole.OPERATIONS_MANAGER]: {
    value: UserRole.OPERATIONS_MANAGER,
    label: 'Operations Manager',
    color: 'green',
    description: 'Manages bookings and operations',
    level: 3,
  },
  [UserRole.SALES_MANAGER]: {
    value: UserRole.SALES_MANAGER,
    label: 'Sales Manager',
    color: 'orange',
    description: 'Manages clients and sales',
    level: 4,
  },
  [UserRole.ACCOUNTANT]: {
    value: UserRole.ACCOUNTANT,
    label: 'Accountant',
    color: 'yellow',
    description: 'Manages finances and payments',
    level: 5,
  },
  [UserRole.STAFF]: {
    value: UserRole.STAFF,
    label: 'Staff',
    color: 'gray',
    description: 'Limited view access',
    level: 6,
  },
};

// Helper function to get role config
export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGS[role];
};

// Helper function to get role label
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_CONFIGS[role]?.label || role;
};

// Helper function to get role color
export const getRoleColor = (role: UserRole): string => {
  return ROLE_CONFIGS[role]?.color || 'gray';
};

// Helper function to check if role can manage other role
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  const managerLevel = ROLE_CONFIGS[managerRole]?.level || 999;
  const targetLevel = ROLE_CONFIGS[targetRole]?.level || 999;
  return managerLevel < targetLevel;
};
