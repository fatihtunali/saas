'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Commission } from '@/types/payments';
import { useCommissions } from '@/hooks/use-commissions';
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
import { COMMISSION_TYPES, COMMISSION_STATUSES } from '@/lib/validations/commissions';

export default function CommissionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commissionToDelete, setCommissionToDelete] = useState<number | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { commissions, pagination, isLoading, deleteCommission } = useCommissions(queryParams);

  const handleDelete = async () => {
    if (commissionToDelete) {
      await deleteCommission(commissionToDelete);
      setDeleteDialogOpen(false);
      setCommissionToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'paid' ? 'default' : status === 'approved' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = COMMISSION_TYPES.find(t => t.value === type);
    return <Badge variant="outline">{typeConfig?.label || type}</Badge>;
  };

  // Calculate summary statistics
  const totalEarned = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const pending = commissions.filter(c => c.status === 'pending').length;
  const paid = commissions.filter(c => c.status === 'paid').length;

  const columns: ColumnDef<Commission>[] = [
    {
      accessorKey: 'booking_id',
      header: 'Booking ID',
      cell: ({ row }) => <span className="font-mono">#{row.original.booking_id}</span>,
    },
    {
      accessorKey: 'commission_type',
      header: 'Type',
      cell: ({ row }) => getTypeBadge(row.original.commission_type),
    },
    {
      accessorKey: 'recipient',
      header: 'Recipient',
      cell: ({ row }) => {
        const commission = row.original;
        if (commission.user_id) {
          return <span>User #{commission.user_id}</span>;
        } else if (commission.partner_operator_id) {
          return <span>Partner #{commission.partner_operator_id}</span>;
        }
        return <span className="text-muted-foreground">N/A</span>;
      },
    },
    {
      accessorKey: 'commission_amount',
      header: 'Amount',
      cell: ({ row }) => (
        <CurrencyDisplay amount={row.original.commission_amount} currency={row.original.currency} />
      ),
    },
    {
      accessorKey: 'commission_percentage',
      header: 'Rate',
      cell: ({ row }) => <span className="font-medium">{row.original.commission_percentage}%</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const commission = row.original;
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
                onClick={() => router.push(`/dashboard/payments/commissions/${commission.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/commissions/${commission.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setCommissionToDelete(commission.id);
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
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={totalEarned} currency="TRY" />
            </div>
            <p className="text-xs text-muted-foreground">Total commission amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paid}</div>
            <p className="text-xs text-muted-foreground">Completed commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commissions</CardTitle>
              <CardDescription>Track and manage commission payments</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/commissions/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Commission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search commissions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {COMMISSION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {COMMISSION_STATUSES.map(status => (
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
                setTypeFilter('all');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={commissions}
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
        title="Delete Commission"
        description="Are you sure you want to delete this commission record? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
