'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { ClientPayment } from '@/types/payments';
import { useClientPayments } from '@/hooks/use-client-payments';
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
import { PaymentStatusBadge } from '@/components/features/payments/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/components/features/payments/PaymentMethodBadge';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';
import {
  CLIENT_PAYMENT_STATUSES,
  PAYMENT_METHODS,
  CURRENCIES,
} from '@/lib/validations/client-payments';

export default function ClientPaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    payment_method: methodFilter !== 'all' ? methodFilter : undefined,
  };

  const { clientPayments, pagination, isLoading, deleteClientPayment } =
    useClientPayments(queryParams);

  const handleDelete = async () => {
    if (paymentToDelete) {
      await deleteClientPayment(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const columns: ColumnDef<ClientPayment>[] = [
    {
      accessorKey: 'booking_id',
      header: 'Booking ID',
      cell: ({ row }) => <span className="font-mono">#{row.original.booking_id}</span>,
    },
    {
      accessorKey: 'payment_date',
      header: 'Payment Date',
      cell: ({ row }) => new Date(row.original.payment_date).toLocaleDateString(),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <CurrencyDisplay amount={row.original.amount} currency={row.original.currency} />
      ),
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ row }) => <PaymentMethodBadge method={row.original.payment_method} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} type="client" />,
    },
    {
      accessorKey: 'received_by',
      header: 'Received By',
      cell: ({ row }) => row.original.received_by || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payment = row.original;
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
                onClick={() => router.push(`/dashboard/payments/receivables/${payment.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/receivables/${payment.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setPaymentToDelete(payment.id);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Payments (Receivables)</CardTitle>
              <CardDescription>Track and manage incoming payments from clients</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/receivables/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search payments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {CLIENT_PAYMENT_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHODS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setMethodFilter('all');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={clientPayments}
            isLoading={isLoading}
            pagination={{ pageIndex: page - 1, pageSize }}
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
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record?"
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
