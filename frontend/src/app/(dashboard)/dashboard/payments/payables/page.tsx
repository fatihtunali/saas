'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { SupplierPayment } from '@/types/payments';
import { useSupplierPayments } from '@/hooks/use-supplier-payments';
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
import { SUPPLIER_PAYMENT_STATUSES, PAYMENT_METHODS } from '@/lib/validations/supplier-payments';

export default function SupplierPaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };
  const { supplierPayments, pagination, isLoading, deleteSupplierPayment } =
    useSupplierPayments(queryParams);

  const handleDelete = async () => {
    if (paymentToDelete) {
      await deleteSupplierPayment(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const columns: ColumnDef<SupplierPayment>[] = [
    {
      accessorKey: 'booking_id',
      header: 'Booking ID',
      cell: ({ row }) => <span className="font-mono">#{row.original.booking_id}</span>,
    },
    {
      accessorKey: 'supplier_id',
      header: 'Supplier ID',
      cell: ({ row }) => <span>#{row.original.supplier_id}</span>,
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
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
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} type="supplier" />,
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
                onClick={() => router.push(`/dashboard/payments/payables/${payment.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/payables/${payment.id}/edit`)}
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
              <CardTitle>Supplier Payments (Payables)</CardTitle>
              <CardDescription>Track and manage outgoing payments to suppliers</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/payables/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                {SUPPLIER_PAYMENT_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
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
          <DataTable
            columns={columns}
            data={supplierPayments}
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
