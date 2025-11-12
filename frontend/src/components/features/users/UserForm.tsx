/**
 * User Form Component
 * Phase 9: User Management & Permissions
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { UserRoleBadge } from './UserRoleBadge';
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormData,
  type UserUpdateFormData,
} from '@/lib/validations/users';
import { UserRole, ROLE_CONFIGS } from '@/types/users';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { User } from '@/types/users';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: User;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  currentUserRole?: UserRole;
  isSuperAdmin?: boolean;
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  currentUserRole,
  isSuperAdmin = false,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine which schema and default values to use
  const schema = mode === 'create' ? userCreateSchema : userUpdateSchema;

  const form = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues:
      mode === 'create'
        ? {
            email: '',
            password: '',
            confirm_password: '',
            full_name: '',
            phone: '',
            role: UserRole.STAFF,
            is_active: true,
          }
        : {
            full_name: initialData?.full_name || '',
            phone: initialData?.phone || '',
            role: initialData?.role,
            is_active: initialData?.is_active ?? true,
          },
  });

  const watchPassword = form.watch('password' as any);
  const watchRole = form.watch('role' as any);

  // Filter available roles based on current user's role
  const availableRoles = Object.values(UserRole).filter(role => {
    if (isSuperAdmin) return true; // Super admin can assign any role

    const roleConfig = ROLE_CONFIGS[role];
    const currentRoleConfig = currentUserRole ? ROLE_CONFIGS[currentUserRole] : null;

    if (!currentRoleConfig) return false;

    // Can only assign roles with level greater than or equal to own level
    return roleConfig.level >= currentRoleConfig.level;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <div className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="user@example.com"
                      disabled={mode === 'edit' || isSubmitting}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === 'edit'
                      ? 'Email cannot be changed'
                      : 'Used for login and notifications'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting}
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Password (Create Only) */}
        {mode === 'create' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Password</h3>

            <div className="space-y-4">
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Strength Indicator */}
              {watchPassword && <PasswordStrengthIndicator password={watchPassword} />}

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {/* Role & Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Role & Permissions</h3>

          <div className="space-y-4">
            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map(role => {
                        const config = ROLE_CONFIGS[role];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <span>{config.label}</span>
                              <UserRoleBadge role={role} />
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {watchRole && (
                    <FormDescription className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{ROLE_CONFIGS[watchRole as UserRole]?.description}</span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      {field.value
                        ? 'User can log in and access the system'
                        : 'User is deactivated and cannot log in'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
