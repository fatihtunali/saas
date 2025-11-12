//ft
/**
 * Users List Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsersList } from '@/components/features/users';
import { useUserStatistics } from '@/lib/hooks/use-users';
import { useCanCreate } from '@/lib/hooks/use-permissions';
import { Users, UserPlus, UserCheck, UserX, Shield } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const { data: stats, isLoading: statsLoading } = useUserStatistics();
  const canCreateUsers = useCanCreate('users');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>

        {canCreateUsers && (
          <Link href="/dashboard/users/create">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users}
          icon={UserCheck}
          loading={statsLoading}
          className="text-green-600"
        />
        <StatCard
          title="Inactive Users"
          value={stats?.inactive_users}
          icon={UserX}
          loading={statsLoading}
          className="text-gray-600"
        />
        <StatCard
          title="Recent Logins"
          value={stats?.recent_logins}
          icon={Shield}
          loading={statsLoading}
          description="Last 24 hours"
        />
      </div>

      {/* Users by Role */}
      {stats?.by_role && Object.keys(stats.by_role).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium capitalize">{role.replace(/_/g, ' ')}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <UsersList />
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
  description?: string;
}

function StatCard({ title, value, icon: Icon, loading, className, description }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{value || 0}</p>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={className}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </Card>
  );
}
