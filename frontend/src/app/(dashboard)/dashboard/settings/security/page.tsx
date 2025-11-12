//ft
/**
 * Security Settings Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordStrengthIndicator } from '@/components/features/users';
import { useProfile, useChangePassword } from '@/lib/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, type PasswordChangeFormData } from '@/lib/validations/users';
import {
  ArrowLeft,
  Loader2,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

export default function SecurityPage() {
  const { data: profile, isLoading } = useProfile();
  const changePassword = useChangePassword();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const watchNewPassword = form.watch('new_password');

  const onSubmit = async (data: PasswordChangeFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  if (isLoading) {
    return <SecuritySkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your password and security preferences</p>
      </div>

      {/* Password Change Form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Choose a strong password that you don&apos;t use for other accounts. Include uppercase
            and lowercase letters, numbers, and special characters.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        disabled={changePassword.isPending}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
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

            {/* New Password */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        disabled={changePassword.isPending}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
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
            {watchNewPassword && <PasswordStrengthIndicator password={watchNewPassword} />}

            {/* Confirm New Password */}
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        disabled={changePassword.isPending}
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

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={changePassword.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {/* Session Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Session Information</h3>
            <p className="text-sm text-muted-foreground">Your current session details</p>
          </div>
        </div>

        <div className="space-y-3">
          {profile?.last_login && (
            <InfoRow
              icon={CheckCircle2}
              label="Last Login"
              value={`${format(new Date(profile.last_login), 'MMM d, yyyy HH:mm')} (${formatDistanceToNow(new Date(profile.last_login), { addSuffix: true })})`}
            />
          )}
          <InfoRow
            icon={Shield}
            label="Account Status"
            value={
              <span className="text-green-600 font-medium">
                <CheckCircle2 className="inline w-4 h-4 mr-1" />
                Active & Secure
              </span>
            }
          />
        </div>
      </Card>

      {/* Two-Factor Authentication (Future Feature) */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Add an extra layer of security to your account (coming soon)
            </p>
            <Button variant="outline" size="sm" disabled>
              Enable 2FA
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-1">{value}</div>
      </div>
    </div>
  );
}

function SecuritySkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  );
}
