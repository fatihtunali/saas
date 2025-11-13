'use client';
//ft

import { useState } from 'react';
import { useB2BClients } from '@/hooks/use-b2b-clients';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { B2BClient } from '@/types/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Eye, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function B2BClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    b2bClients: data,
    pagination,
    isLoading,
    deleteB2BClient: deleteItem,
    isDeleting,
  } = useB2BClients({
    page,
    limit,
    search: search || undefined,
  });

  const columns: ColumnDef<B2BClient>[] = [
    {
      accessorKey: 'fullName',
      header: 'Full Name',
    },
    {
      accessorKey: 'partnerCompanyName',
      header: 'Partner Company',
      cell: ({ row }) => row.original.partnerCompanyName || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'creditLimit',
      header: 'Credit Status',
      cell: ({ row }) => {
        const { creditLimit, creditUsed } = row.original;
        if (!creditLimit) return '-';
        const usage = (creditUsed / creditLimit) * 100;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {creditUsed.toFixed(0)} / {creditLimit.toFixed(0)}
            </span>
            {usage > 90 && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/clients/b2b/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/clients/b2b/${row.original.id}/edit`)}
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
                  'Are you sure you want to delete this B2B client? This action cannot be undone.'
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
          <h1 className="text-3xl font-bold text-gray-900">B2B Clients</h1>
          <p className="text-gray-600">Manage business-to-business client relationships</p>
        </div>
        <Link href="/dashboard/clients/b2b/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add B2B Client
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
                  placeholder="Search B2B clients..."
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
