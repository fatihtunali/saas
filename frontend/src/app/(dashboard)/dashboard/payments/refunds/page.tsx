'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2, DollarSign, RefreshCw } from 'lucide-react';
import { Refund } from '@/types/payments';
import { useRefunds } from '@/hooks/use-refunds';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';
import { REFUND_STATUSES } from '@/lib/validations/refunds';

export default function RefundsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refundToDelete, setRefundToDelete] = useState<number | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { refunds, pagination, isLoading, deleteRefund } = useRefunds(queryParams);

  const handleDelete = async () => {
    if (refundToDelete) {
      await deleteRefund(refundToDelete);
      setDeleteDialogOpen(false);
      setRefundToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = REFUND_STATUSES.find(s => s.value === status);
    const variant =
      status === 'processed'
        ? 'default'
        : status === 'approved'
          ? 'secondary'
          : status === 'rejected'
            ? 'destructive'
            : 'outline';
    return <Badge variant={variant}>{statusConfig?.label || status}</Badge>;
  };

  // Calculate summary statistics
  const totalRefunded = refunds
    .filter(r => r.refund_status === 'processed')
    .reduce((sum, r) => sum + r.refund_amount, 0);
  const pendingApproval = refunds.filter(r => r.refund_status === 'requested').length;
  const processed = refunds.filter(r => r.refund_status === 'processed').length;

  const columns: ColumnDef<Refund>[] = [
    {
      accessorKey: 'booking_id',
      header: 'Booking ID',
      cell: ({ row }) => <span className="font-mono">#{row.original.booking_id}</span>,
    },
    {
      accessorKey: 'client_payment_id',
      header: 'Payment ID',
      cell: ({ row }) => <span className="font-mono">#{row.original.client_payment_id}</span>,
    },
    {
      accessorKey: 'refund_amount',
      header: 'Amount',
      cell: ({ row }) => (
        <CurrencyDisplay amount={row.original.refund_amount} currency={row.original.currency} />
      ),
    },
    {
      accessorKey: 'refund_status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.refund_status),
    },
    {
      accessorKey: 'requested_date',
      header: 'Requested Date',
      cell: ({ row }) => new Date(row.original.requested_date).toLocaleDateString(),
    },
    {
      accessorKey: 'refund_method',
      header: 'Method',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.refund_method.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const refund = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/refunds/${refund.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/refunds/${refund.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setRefundToDelete(refund.id);
                  setDeleteDialogOpen(true);
                }}
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={totalRefunded} currency="TRY" />
            </div>
            <p className="text-xs text-muted-foreground">Processed refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processed}</div>
            <p className="text-xs text-muted-foreground">Completed refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refunds</CardTitle>
              <CardDescription>Manage and track refund requests</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/refunds/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Refund
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search refunds..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {REFUND_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={refunds}
            isLoading={isLoading}
            pagination={{
              pageIndex: page - 1,
              pageSize,
            }}
            onPaginationChange={updater => {
              if (typeof updater === 'function') {
                const newState = updater({ pageIndex: page - 1, pageSize });
                setPage(newState.pageIndex + 1);
                setPageSize(newState.pageSize);
              }
            }}
            totalRows={pagination?.total || 0}
            manualPagination
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Refund"
        description="Are you sure you want to delete this refund record? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
