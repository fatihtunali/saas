'use client';

import { useState } from 'react';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { VehicleCompany } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VehiclesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    vehicleCompanies: data,
    pagination,
    isLoading,
    deleteVehicleCompany: deleteItem,
    isDeleting,
  } = useVehicleCompanies({
    page,
    limit,
    search: search || undefined,
  });

  const columns: ColumnDef<VehicleCompany>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.companyName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => row.original.contactPerson || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
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
            onClick={() => router.push(`/dashboard/services/vehicles/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete this company? This will also delete all associated vehicle types, rentals, and transfer routes.'
                )
              )
                deleteItem(row.original.id);
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600">
            Manage vehicle companies, their fleet, pricing, and transfer routes
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/services/vehicles/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find vehicle companies by name or contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vehicle companies..."
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
