'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2, Star } from 'lucide-react';
import { BankAccount } from '@/types/payments';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
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
import { CURRENCIES, ACCOUNT_TYPES } from '@/lib/validations/bank-accounts';

export default function BankAccountsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    currency: currencyFilter !== 'all' ? currencyFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { bankAccounts, pagination, isLoading, deleteBankAccount, isDeleting } =
    useBankAccounts(queryParams);

  const handleDelete = async () => {
    if (accountToDelete) {
      await deleteBankAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: 'account_name',
      header: 'Account Name',
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{account.account_name}</span>
            {account.is_default && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'bank_name',
      header: 'Bank Name',
    },
    {
      accessorKey: 'account_number',
      header: 'Account Number',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.account_number}</span>,
    },
    {
      accessorKey: 'account_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = ACCOUNT_TYPES.find(t => t.value === row.original.account_type);
        return <Badge variant="outline">{type?.label || row.original.account_type}</Badge>;
      },
    },
    {
      accessorKey: 'currency',
      header: 'Currency',
      cell: ({ row }) => <Badge>{row.original.currency}</Badge>,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const account = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/bank-accounts/${account.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/payments/bank-accounts/${account.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setAccountToDelete(account.id);
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
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>
                Manage your company bank accounts and payment methods
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/bank-accounts/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCurrencyFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={bankAccounts}
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
        title="Delete Bank Account"
        description="Are you sure you want to delete this bank account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
