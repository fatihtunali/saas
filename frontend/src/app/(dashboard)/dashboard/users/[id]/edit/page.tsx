//ft
/**
 * Edit User Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { UserForm } from '@/components/features/users';
import { useUser, useUpdateUser } from '@/lib/hooks/use-users';
import { useUserRole, useIsSuperAdmin } from '@/lib/hooks/use-profile';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserUpdateFormData } from '@/lib/validations/users';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const userId = parseInt(params.id);
  const router = useRouter();
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();
  const currentUserRole = useUserRole();
  const isSuperAdmin = useIsSuperAdmin();

  const handleSubmit = async (data: UserUpdateFormData) => {
    try {
      await updateUser.mutateAsync({ id: userId, data });
      router.push(`/dashboard/users/${userId}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/users/${userId}`);
  };

  if (isLoading) {
    return <EditUserSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">User not found</p>
          <Link href="/dashboard/users">
            <button className="mt-4 text-sm text-primary hover:underline">Back to Users</button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/users/${userId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to User Details
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground mt-1">
          Update {user.full_name}&apos;s information and permissions
        </p>
      </div>

      {/* Form */}
      <UserForm
        mode="edit"
        initialData={user}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateUser.isPending}
        currentUserRole={currentUserRole}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}

function EditUserSkeleton() {
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

      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    </div>
  );
}
