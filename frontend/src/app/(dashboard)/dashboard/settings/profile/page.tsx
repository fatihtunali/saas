//ft
/**
 * Profile Settings Page
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
import { UserRoleBadge } from '@/components/features/users';
import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validations/users';
import { ArrowLeft, Loader2, User, Mail, Phone, Shield, Calendar, Building2, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: '',
      phone: '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name,
        phone: profile.phone || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: any) => {
    updateProfile.mutate(data);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </Card>
      </div>
    );
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

        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Profile Info (Read-only) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoItem
            icon={Mail}
            label="Email Address"
            value={profile.email}
            description="Cannot be changed"
          />
          <InfoItem
            icon={Shield}
            label="Role"
            value={<UserRoleBadge role={profile.role} />}
            description="Assigned by administrator"
          />
          <InfoItem
            icon={Calendar}
            label="Member Since"
            value={format(new Date(profile.created_at), 'MMMM d, yyyy')}
          />
          <InfoItem
            icon={Calendar}
            label="Last Login"
            value={
              profile.last_login
                ? format(new Date(profile.last_login), 'MMM d, yyyy HH:mm')
                : 'Never'
            }
          />
        </div>
      </Card>

      {/* Editable Profile Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" disabled={updateProfile.isPending} />
                  </FormControl>
                  <FormDescription>
                    This is your display name shown throughout the system
                  </FormDescription>
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
                      disabled={updateProfile.isPending}
                    />
                  </FormControl>
                  <FormDescription>Your contact phone number</FormDescription>
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
                disabled={updateProfile.isPending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {/* Avatar Section (Future Feature) */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Profile Picture</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upload a profile picture (coming soon)
            </p>
            <Button variant="outline" size="sm" disabled>
              Upload Photo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  description?: string;
}

function InfoItem({ icon: Icon, label, value, description }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-1">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
