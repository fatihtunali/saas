//ft
/**
 * User Details Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserRoleBadge,
  UserStatusBadge,
  ActivityLogTimeline,
  PermissionsDisplay,
} from '@/components/features/users';
import {
  useUser,
  useDeleteUser,
  useToggleUserStatus,
  useUserActivity,
} from '@/lib/hooks/use-users';
import { useUserPermissions } from '@/lib/hooks/use-permissions';
import { useCanEdit, useCanDelete } from '@/lib/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface UserDetailsPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const userId = parseInt(params.id);
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const { data: user, isLoading } = useUser(userId);
  const { data: permissions } = useUserPermissions(userId);
  const { data: activityData } = useUserActivity(userId, { limit: 50 });

  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();

  const canEditUsers = useCanEdit('users');
  const canDeleteUsers = useCanDelete('users');

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      router.push('/dashboard/users');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      await toggleStatus.mutateAsync({
        id: userId,
        isActive: !user.is_active,
      });
      setShowToggleDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">User not found</p>
          <Link href="/dashboard/users">
            <Button variant="outline" className="mt-4">
              Back to Users
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            {canEditUsers && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowToggleDialog(true)}>
                  {user.is_active ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>

                <Link href={`/dashboard/users/${userId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </>
            )}

            {canDeleteUsers && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoItem icon={Mail} label="Email" value={user.email} />
          <InfoItem icon={Phone} label="Phone" value={user.phone || '—'} />
          <InfoItem icon={Shield} label="Role" value={<UserRoleBadge role={user.role} />} />
          <InfoItem
            icon={UserCheck}
            label="Status"
            value={<UserStatusBadge isActive={user.is_active} />}
          />
          <InfoItem
            icon={Calendar}
            label="Created"
            value={format(new Date(user.created_at), 'MMM d, yyyy')}
          />
          <InfoItem
            icon={Calendar}
            label="Last Login"
            value={
              user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy HH:mm') : 'Never'
            }
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          {permissions ? (
            <PermissionsDisplay permissions={permissions} variant="grid" />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading permissions...</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            {activityData?.activities ? (
              <ActivityLogTimeline activities={activityData.activities} showDetails={true} />
            ) : (
              <p className="text-center text-muted-foreground py-8">Loading activity...</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {user.full_name} from the system. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user.is_active ? 'Deactivate' : 'Activate'} User?</AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_active
                ? `${user.full_name} will not be able to log in or access the system.`
                : `${user.full_name} will be able to log in and access the system again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {toggleStatus.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-1">{value}</div>
      </div>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
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
