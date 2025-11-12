'use client';
//ft

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Hotel } from '@/types/services';
import { useHotels } from '@/hooks/use-hotels';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAR_RATINGS } from '@/lib/validations/hotels';

export default function HotelsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<number | null>(null);

  // Build query params
  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    city_id: cityFilter !== 'all' ? parseInt(cityFilter) : undefined,
    star_rating: starFilter !== 'all' ? parseInt(starFilter) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'Active' | 'Inactive') : undefined,
  };

  const { hotels, pagination, isLoading, deleteHotel, isDeleting } = useHotels(queryParams);

  const handleDelete = async () => {
    if (hotelToDelete) {
      await deleteHotel(hotelToDelete);
      setDeleteDialogOpen(false);
      setHotelToDelete(null);
    }
  };

  const columns: ColumnDef<Hotel>[] = [
    {
      accessorKey: 'hotel_name',
      header: 'Hotel Name',
      cell: ({ row }) => {
        const hotel = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{hotel.hotel_name}</span>
            {hotel.star_rating && (
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xs">
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city?.city_name || 'N/A',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || 'N/A',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'price_per_person_double',
      header: 'Price (DBL)',
      cell: ({ row }) => {
        const hotel = row.original;
        if (!hotel.price_per_person_double) return 'N/A';
        return (
          <div className="text-right font-medium">
            {hotel.price_per_person_double.toFixed(2)} {hotel.currency || 'TRY'}
          </div>
        );
      },
    },
    {
      accessorKey: 'meal_plan',
      header: 'Meal Plan',
      cell: ({ row }) => {
        const mealPlan = row.original.meal_plan;
        if (!mealPlan) return 'N/A';
        return <Badge variant="outline">{mealPlan}</Badge>;
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'Active' : 'Inactive'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const hotel = row.original;
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
                onClick={() => router.push(`/dashboard/services/hotels/${hotel.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/services/hotels/${hotel.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setHotelToDelete(hotel.id);
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
              <CardTitle>Hotels Management</CardTitle>
              <CardDescription>Manage your hotel inventory and pricing</CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/services/hotels/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hotel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Input
                placeholder="Search hotels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={starFilter} onValueChange={setStarFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Star Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Star Ratings</SelectItem>
                  {STAR_RATINGS.map(rating => (
                    <SelectItem key={rating.value} value={rating.value.toString()}>
                      {rating.label}
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCityFilter('all');
                  setStarFilter('all');
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
            data={hotels}
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
        title="Delete Hotel"
        description="Are you sure you want to delete this hotel? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
