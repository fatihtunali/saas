//ft
/**
 * Create User Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { UserForm } from '@/components/features/users';
import { useCreateUser } from '@/lib/hooks/use-users';
import { useUserRole, useIsSuperAdmin } from '@/lib/hooks/use-profile';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { UserCreateFormData } from '@/lib/validations/users';

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const currentUserRole = useUserRole();
  const isSuperAdmin = useIsSuperAdmin();

  const handleSubmit = async (data: UserCreateFormData) => {
    try {
      await createUser.mutateAsync(data);
      router.push('/dashboard/users');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/users');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground mt-1">
          Add a new user to the system with specific role and permissions
        </p>
      </div>

      {/* Form */}
      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createUser.isPending}
        currentUserRole={currentUserRole}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
