'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * DataTable Component
 *
 * A powerful, reusable data table built with @tanstack/react-table.
 *
 * Features:
 * - Column sorting (single & multi)
 * - Column filtering
 * - Row selection (single/multiple)
 * - Pagination (client & server)
 * - Expandable rows
 * - Sticky header
 * - Loading state
 * - Empty state
 * - Fully typed with TypeScript generics
 * - Mobile responsive
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<Booking>[] = [
 *   { accessorKey: 'booking_code', header: 'Code' },
 *   { accessorKey: 'client_name', header: 'Client' },
 * ];
 *
 * <DataTable
 *   data={bookings}
 *   columns={columns}
 *   pagination={{ pageIndex: 0, pageSize: 25 }}
 *   onPaginationChange={setPagination}
 * />
 * ```
 */

export interface DataTableProps<TData, TValue = any> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Table data */
  data: TData[];
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable multi-row selection */
  enableMultiRowSelection?: boolean;
  /** Sorting state */
  sorting?: SortingState;
  /** Sorting change handler */
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  /** Column filters state */
  columnFilters?: ColumnFiltersState;
  /** Column filters change handler */
  onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  /** Row selection state */
  rowSelection?: RowSelectionState;
  /** Row selection change handler */
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  /** Pagination state */
  pagination?: PaginationState;
  /** Pagination change handler */
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  /** Total row count (for server-side pagination) */
  totalRows?: number;
  /** Manual pagination (server-side) */
  manualPagination?: boolean;
  /** Manual sorting (server-side) */
  manualSorting?: boolean;
  /** Manual filtering (server-side) */
  manualFiltering?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom empty state */
  emptyState?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: TData) => void;
  /** Custom class name */
  className?: string;
  /** Get row ID */
  getRowId?: (row: TData, index: number) => string;
}

export function DataTable<TData, TValue = any>({
  columns,
  data,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledFilters,
  onColumnFiltersChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  pagination: controlledPagination,
  onPaginationChange,
  totalRows,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  isLoading = false,
  emptyState,
  onRowClick,
  className,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // Use controlled state if provided, otherwise use internal state
  const sortingState = controlledSorting ?? sorting;
  const filtersState = controlledFilters ?? columnFilters;
  const selectionState = controlledRowSelection ?? rowSelection;
  const paginationState = controlledPagination ?? pagination;

  // Add selection column if enabled
  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: onSortingChange || setSorting,
    onColumnFiltersChange: onColumnFiltersChange || setColumnFilters,
    onRowSelectionChange: onRowSelectionChange || setRowSelection,
    onPaginationChange: onPaginationChange || setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount:
      manualPagination && totalRows ? Math.ceil(totalRows / paginationState.pageSize) : undefined,
    state: {
      sorting: sortingState,
      columnFilters: filtersState,
      rowSelection: selectionState,
      pagination: paginationState,
      columnVisibility,
    },
    enableRowSelection,
    enableMultiRowSelection,
    getRowId,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {emptyState || 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
