/**
 * Users List Component
 * Phase 9: User Management & Permissions
 */

'use client';

import { useState } from 'react';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import { useUsers, useDeleteUser, useToggleUserStatus } from '@/lib/hooks/use-users';
import { UserRole, type User, type UsersFilters } from '@/types/users';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX, Search, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

interface UsersListProps {
  onUserClick?: (user: User) => void;
  onEditClick?: (user: User) => void;
}

export function UsersList({ onUserClick, onEditClick }: UsersListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 20,
    sort_order: 'asc',
  });
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [toggleUserId, setToggleUserId] = useState<{ id: number; isActive: boolean } | null>(null);

  const { data, isLoading } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser.mutateAsync(deleteUserId);
      setDeleteUserId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleUserId) return;

    try {
      await toggleStatus.mutateAsync({
        id: toggleUserId.id,
        isActive: !toggleUserId.isActive,
      });
      setToggleUserId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.full_name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '—',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <UserStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: 'last_login',
      header: 'Last Login',
      cell: ({ row }) => {
        const lastLogin = row.original.last_login;
        if (!lastLogin) return <span className="text-muted-foreground">Never</span>;

        try {
          return (
            <span className="text-sm" title={new Date(lastLogin).toLocaleString()}>
              {formatDistanceToNow(new Date(lastLogin), { addSuffix: true })}
            </span>
          );
        } catch {
          return <span className="text-muted-foreground">—</span>;
        }
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (onUserClick) {
                    onUserClick(user);
                  } else {
                    router.push(`/dashboard/users/${user.id}`);
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (onEditClick) {
                    onEditClick(user);
                  } else {
                    router.push(`/dashboard/users/${user.id}/edit`);
                  }
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setToggleUserId({ id: user.id, isActive: user.is_active })}
              >
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
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setDeleteUserId(user.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.role || 'all'}
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              role: value === 'all' ? undefined : (value as UserRole),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.values(UserRole).map(role => (
              <SelectItem key={role} value={role}>
                {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'
          }
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              is_active: value === 'all' ? undefined : value === 'active',
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        manualPagination={true}
        pagination={{
          pageIndex: (filters.page || 1) - 1,
          pageSize: filters.limit || 20,
        }}
        totalRows={data?.pagination?.total || 0}
        onPaginationChange={updater => {
          const newPagination =
            typeof updater === 'function'
              ? updater({ pageIndex: (filters.page || 1) - 1, pageSize: filters.limit || 20 })
              : updater;

          setFilters(prev => ({
            ...prev,
            page: newPagination.pageIndex + 1,
            limit: newPagination.pageSize,
          }));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={!!toggleUserId} onOpenChange={() => setToggleUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleUserId?.isActive ? 'Deactivate' : 'Activate'} User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleUserId?.isActive
                ? 'This user will not be able to log in or access the system.'
                : 'This user will be able to log in and access the system again.'}
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
