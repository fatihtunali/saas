'use client';
//ft

import { useState } from 'react';
import { useOperators } from '@/hooks/use-operators';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Operator } from '@/types/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OperatorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    operators: data,
    pagination,
    isLoading,
    deleteOperator: deleteItem,
    isDeleting,
  } = useOperators({
    page,
    limit,
    search: search || undefined,
  });

  const columns: ColumnDef<Operator>[] = [
    {
      accessorKey: 'company_name',
      header: 'Company Name',
    },
    {
      accessorKey: 'contact_email',
      header: 'Email',
    },
    {
      accessorKey: 'contact_phone',
      header: 'Phone',
      cell: ({ row }) => row.original.contact_phone || '-',
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city || '-',
    },
    {
      accessorKey: 'base_currency',
      header: 'Currency',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'Active' : 'Inactive'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/clients/operators/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/clients/operators/${row.original.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete this operator? This action cannot be undone.'
                )
              ) {
                deleteItem(row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operators</h1>
          <p className="text-gray-600">Manage tour operator companies</p>
        </div>
        <Link href="/dashboard/clients/operators/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Operator
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search operators..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={data} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
