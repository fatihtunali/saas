/**
 * User Management Validation Schemas
 * Phase 9: User Management & Permissions
 */

import { z } from 'zod';
import { UserRole } from '@/types/users';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

// Password validation schema
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(passwordRegex.uppercase, 'Password must contain at least one uppercase letter')
  .regex(passwordRegex.lowercase, 'Password must contain at least one lowercase letter')
  .regex(passwordRegex.number, 'Password must contain at least one number');

// User create schema
export const userCreateSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .regex(emailRegex, 'Invalid email format')
      .max(255, 'Email is too long'),

    password: passwordSchema,

    confirm_password: z.string().min(1, 'Please confirm password'),

    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(255, 'Full name is too long')
      .trim(),

    phone: z
      .string()
      .max(20, 'Phone number is too long')
      .optional()
      .nullable()
      .transform(val => (val === '' ? null : val)),

    role: z.nativeEnum(UserRole),

    operator_id: z.number().positive('Invalid operator').optional().nullable(),

    is_active: z.boolean().default(true),
  })
  .refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

// User update schema
export const userUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long')
    .trim(),

  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)),

  role: z.nativeEnum(UserRole).optional(),

  is_active: z.boolean().optional(),
});

// Profile update schema (limited fields)
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long')
    .trim(),

  phone: z
    .string()
    .transform(val => (val === '' ? null : val))
    .nullable()
    .default(''),
});

// Password change schema (for current user)
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),

    new_password: passwordSchema,

    confirm_password: z.string().min(1, 'Please confirm new password'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
  .refine(data => data.current_password !== data.new_password, {
    message: 'New password must be different from current password',
    path: ['new_password'],
  });

// Admin password reset schema
export const passwordResetSchema = z
  .object({
    new_password: passwordSchema,

    confirm_password: z.string().min(1, 'Please confirm new password'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

// Users filters schema
export const usersFiltersSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  operator_id: z.number().positive().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Activity log filters schema
export const activityFiltersSchema = z.object({
  user_id: z.number().positive().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(50),
});

// Type inference
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type UsersFiltersFormData = z.infer<typeof usersFiltersSchema>;
export type ActivityFiltersFormData = z.infer<typeof activityFiltersSchema>;

// Default values
export const defaultUserCreateValues: UserCreateFormData = {
  email: '',
  password: '',
  confirm_password: '',
  full_name: '',
  phone: null,
  role: UserRole.STAFF,
  is_active: true,
};

export const defaultUserUpdateValues: Partial<UserUpdateFormData> = {
  full_name: '',
  phone: null,
  is_active: true,
};

export const defaultProfileUpdateValues: ProfileUpdateFormData = {
  full_name: '',
  phone: null,
};

export const defaultPasswordChangeValues: PasswordChangeFormData = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export const defaultPasswordResetValues: PasswordResetFormData = {
  new_password: '',
  confirm_password: '',
};

export const defaultUsersFiltersValues: UsersFiltersFormData = {
  page: 1,
  limit: 20,
  sort_order: 'asc',
};

// Helper function to check password strength
export interface PasswordStrengthResult {
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

export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  const requirements = {
    min_length: password.length >= PASSWORD_MIN_LENGTH,
    has_uppercase: passwordRegex.uppercase.test(password),
    has_lowercase: passwordRegex.lowercase.test(password),
    has_number: passwordRegex.number.test(password),
    has_special: passwordRegex.special.test(password),
  };

  let score = 0;
  const feedback: string[] = [];

  // Calculate score
  if (requirements.min_length) score++;
  if (requirements.has_uppercase) score++;
  if (requirements.has_lowercase) score++;
  if (requirements.has_number) score++;
  if (requirements.has_special) score++;

  // Generate feedback
  if (!requirements.min_length) {
    feedback.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!requirements.has_uppercase) {
    feedback.push('One uppercase letter');
  }
  if (!requirements.has_lowercase) {
    feedback.push('One lowercase letter');
  }
  if (!requirements.has_number) {
    feedback.push('One number');
  }
  if (!requirements.has_special) {
    feedback.push('One special character (recommended)');
  }

  // Determine strength
  let strength: PasswordStrengthResult['strength'] = 'weak';
  if (score >= 5) strength = 'very_strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'good';
  else if (score >= 2) strength = 'fair';

  return {
    score,
    strength,
    feedback,
    requirements,
  };
};

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!passwordRegex.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!passwordRegex.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!passwordRegex.number.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
