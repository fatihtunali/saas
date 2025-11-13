'use client';
//ft

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings, useBulkDeleteBookings, useBulkExportBookings } from '@/lib/hooks/useBookings';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  X,
  ChevronDown,
  AlertCircle,
  SearchX,
  DollarSign,
  CalendarIcon,
  Trash2,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import type {
  Booking,
  BookingsQueryParams,
  BookingStatus,
  PaymentStatus,
  ClientType,
  ExportFormat,
} from '@/types/bookings';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { format } from 'date-fns';

// Destination Cities (from database seed)
const DESTINATIONS = [
  { id: 1, name: 'Istanbul', country: 'Turkey' },
  { id: 2, name: 'Ankara', country: 'Turkey' },
  { id: 3, name: 'Izmir', country: 'Turkey' },
  { id: 4, name: 'Antalya', country: 'Turkey' },
  { id: 5, name: 'Cappadocia', country: 'Turkey' },
  { id: 6, name: 'Pamukkale', country: 'Turkey' },
  { id: 7, name: 'Ephesus', country: 'Turkey' },
  { id: 8, name: 'Bodrum', country: 'Turkey' },
  { id: 9, name: 'Kusadasi', country: 'Turkey' },
  { id: 10, name: 'Fethiye', country: 'Turkey' },
  { id: 11, name: 'Marmaris', country: 'Turkey' },
  { id: 12, name: 'Alanya', country: 'Turkey' },
  { id: 13, name: 'Bursa', country: 'Turkey' },
  { id: 14, name: 'Trabzon', country: 'Turkey' },
  { id: 15, name: 'Konya', country: 'Turkey' },
];

// Utility Functions
function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const year = startDate.getFullYear();
  const startFormatted = formatter.format(startDate);
  const endFormatted = formatter.format(endDate);

  return `${startFormatted} - ${endFormatted}, ${year}`;
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntilTravel(startDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const travelDate = new Date(startDate);
  travelDate.setHours(0, 0, 0, 0);
  const diffTime = travelDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateNights(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getStatusVariant(
  status: BookingStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'secondary',
    CONFIRMED: 'default',
    IN_PROGRESS: 'default',
    COMPLETED: 'outline',
    CANCELLED: 'destructive',
  };
  return variants[status] || 'secondary';
}

function getPaymentVariant(
  status: PaymentStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PAID: 'default',
    PARTIAL: 'secondary',
    PENDING: 'outline',
    OVERDUE: 'destructive',
  };
  return variants[status] || 'secondary';
}

// Date Range Picker Component
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select date range',
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal ${!value?.from && 'text-muted-foreground'}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'MMM dd, yyyy')} - {format(value.to, 'MMM dd, yyyy')}
              </>
            ) : (
              format(value.from, 'MMM dd, yyyy')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="range"
          selected={{ from: value?.from, to: value?.to }}
          onSelect={(range: any) => {
            onChange({ from: range?.from, to: range?.to });
            if (range?.from && range?.to) {
              setIsOpen(false);
            }
          }}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Multi-Select Destination Filter Component
function DestinationFilter({
  value,
  onChange,
}: {
  value: string[];
  onChange: (destinations: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredDestinations = DESTINATIONS.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDestination = (destName: string) => {
    if (value.includes(destName)) {
      onChange(value.filter(d => d !== destName));
    } else {
      onChange([...value, destName]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <MapPin className="mr-2 h-4 w-4" />
          {value.length > 0 ? (
            <span>
              {value.length} destination{value.length > 1 ? 's' : ''} selected
            </span>
          ) : (
            <span className="text-muted-foreground">Select destinations</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredDestinations.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No destinations found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDestinations.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => toggleDestination(dest.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent ${
                    value.includes(dest.name) ? 'bg-accent' : ''
                  }`}
                >
                  <div
                    className={`h-4 w-4 border rounded flex items-center justify-center ${
                      value.includes(dest.name) ? 'bg-primary border-primary' : 'border-input'
                    }`}
                  >
                    {value.includes(dest.name) && (
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span>{dest.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {value.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => onChange([])} className="w-full">
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: BookingStatus }) {
  const colors: Record<BookingStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// Payment Badge Component
function PaymentBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    PAID: 'bg-green-100 text-green-800 border-green-300',
    PARTIAL: 'bg-orange-100 text-orange-800 border-orange-300',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    OVERDUE: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
}

// Booking Actions Menu Component
function BookingActionsMenu({ booking }: { booking: Booking }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}/edit`)}>
          Edit Booking
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}/duplicate`)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Generate Vouchers</DropdownMenuItem>
        <DropdownMenuItem>Send Email</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Bulk Actions Toolbar Component
interface BulkActionsToolbarProps {
  selectedBookings: Booking[];
  onClearSelection: () => void;
  onDelete: () => void;
  onExport: (format: ExportFormat) => void;
  isDeleting: boolean;
  isExporting: boolean;
}

function BulkActionsToolbar({
  selectedBookings,
  onClearSelection,
  onDelete,
  onExport,
  isDeleting,
  isExporting,
}: BulkActionsToolbarProps) {
  const count = selectedBookings.length;

  if (count === 0) return null;

  return (
    <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {count}
            </div>
            <span className="font-medium">
              {count} booking{count !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting || isExporting}
            className="h-9"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('excel')}
            disabled={isDeleting || isExporting}
            className="h-9"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
            disabled={isDeleting || isExporting}
            className="h-9"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        <span className="font-medium">Selected bookings:</span>{' '}
        {selectedBookings
          .slice(0, 5)
          .map(b => b.bookingCode)
          .join(', ')}
        {count > 5 && ` and ${count - 5} more`}
      </div>
    </Card>
  );
}

// Mobile Booking Card Component
function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  return (
    <Card className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-mono font-semibold text-sm text-primary">{booking.bookingCode}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{booking.clientName}</div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{booking.destination || 'N/A'}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{formatDateRange(booking.travelStartDate, booking.travelEndDate)}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Users className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{booking.numAdults + booking.numChildren} passengers</span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <div className="text-lg font-semibold">{formatCurrency(booking.totalSellingPrice)}</div>
        {booking.paymentStatus && <PaymentBadge status={booking.paymentStatus} />}
      </div>
    </Card>
  );
}

// Table Skeleton Component
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// Main Bookings Page Component
export default function BookingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State Management
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus[]>([]);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus[]>([]);
  const [selectedClientType, setSelectedClientType] = useState<ClientType[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [travelDateRange, setTravelDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [bookingDateRange, setBookingDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Row Selection State
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Bulk Delete Confirmation Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);

  // Query Parameters
  const queryParams: BookingsQueryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      paymentStatus: selectedPaymentStatus.length > 0 ? selectedPaymentStatus : undefined,
      clientType: selectedClientType.length > 0 ? selectedClientType : undefined,
      destination: selectedDestinations.length > 0 ? selectedDestinations : undefined,
      travelStartDate: travelDateRange.from ? travelDateRange.from.toISOString() : undefined,
      travelEndDate: travelDateRange.to ? travelDateRange.to.toISOString() : undefined,
      bookingStartDate: bookingDateRange.from ? bookingDateRange.from.toISOString() : undefined,
      bookingEndDate: bookingDateRange.to ? bookingDateRange.to.toISOString() : undefined,
      sortBy: sorting[0]?.id || 'createdAt',
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [
      pagination,
      debouncedSearch,
      selectedStatus,
      selectedPaymentStatus,
      selectedClientType,
      selectedDestinations,
      travelDateRange,
      bookingDateRange,
      sorting,
    ]
  );

  // Fetch Bookings
  const { data, isLoading, error, refetch } = useBookings(queryParams);

  // Bulk Operations Mutations
  const bulkDeleteMutation = useBulkDeleteBookings();
  const bulkExportMutation = useBulkExportBookings();

  // Get Selected Bookings
  const selectedBookings = useMemo(() => {
    const bookingsData = data?.data || [];
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(index => bookingsData[parseInt(index)])
      .filter(Boolean);
  }, [rowSelection, data]);

  const selectedBookingIds = useMemo(() => selectedBookings.map(b => b.id), [selectedBookings]);

  // Clear Selection Handler
  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Bulk Delete Handler
  const handleBulkDelete = useCallback(() => {
    bulkDeleteMutation.mutate(selectedBookingIds, {
      onSuccess: result => {
        if (result.successCount > 0) {
          toast({
            title: 'Bookings deleted',
            description: `Successfully deleted ${result.successCount} booking${
              result.successCount !== 1 ? 's' : ''
            }`,
          });
        }
        if (result.failedCount > 0) {
          toast({
            title: 'Some deletions failed',
            description: `Failed to delete ${result.failedCount} booking${
              result.failedCount !== 1 ? 's' : ''
            }`,
            variant: 'destructive',
          });
        }
        clearSelection();
        setShowDeleteDialog(false);
        refetch();
      },
      onError: error => {
        toast({
          title: 'Delete failed',
          description: error instanceof Error ? error.message : 'Failed to delete bookings',
          variant: 'destructive',
        });
      },
    });
  }, [selectedBookingIds, bulkDeleteMutation, toast, clearSelection, refetch]);

  // Bulk Export Handler
  const handleBulkExport = useCallback(
    (format: ExportFormat) => {
      bulkExportMutation.mutate(
        { ids: selectedBookingIds, format },
        {
          onSuccess: blob => {
            // Download file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp =
              format === 'excel'
                ? new Date().toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
            a.download = `bookings_export_${timestamp}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
              title: 'Export successful',
              description: `Successfully exported ${selectedBookings.length} booking${
                selectedBookings.length !== 1 ? 's' : ''
              } to ${format.toUpperCase()}`,
            });
          },
          onError: error => {
            toast({
              title: 'Export failed',
              description: error instanceof Error ? error.message : 'Failed to export bookings',
              variant: 'destructive',
            });
          },
        }
      );
    },
    [selectedBookingIds, selectedBookings.length, bulkExportMutation, toast]
  );

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue]);

  // Check Mobile View
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Column Definitions
  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: 'bookingCode',
        header: 'Booking Code',
        cell: ({ row }) => (
          <button
            onClick={() => router.push(`/bookings/${row.original.id}`)}
            className="font-mono font-medium text-primary hover:underline text-left"
          >
            {row.original.bookingCode}
          </button>
        ),
      },
      {
        accessorKey: 'clientName',
        header: 'Client',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {row.original.clientName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-medium">{row.original.clientName || 'Unknown'}</div>
              {row.original.clientType && (
                <Badge variant="outline" className="mt-0.5">
                  {row.original.clientType}
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'destination',
        header: 'Destination',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate max-w-[150px]">{row.original.destination || 'N/A'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'travelStartDate',
        header: 'Travel Dates',
        cell: ({ row }) => {
          const nights = calculateNights(row.original.travelStartDate, row.original.travelEndDate);
          const daysUntil = daysUntilTravel(row.original.travelStartDate);

          return (
            <div>
              <div className="font-medium">
                {formatDateRange(row.original.travelStartDate, row.original.travelEndDate)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </div>
              {daysUntil > 0 && daysUntil <= 30 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Starts in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'passengerCount',
        header: 'Passengers',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {row.original.numAdults > 0 &&
                `${row.original.numAdults} adult${row.original.numAdults > 1 ? 's' : ''}`}
              {row.original.numChildren > 0 &&
                `, ${row.original.numChildren} child${row.original.numChildren > 1 ? 'ren' : ''}`}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'totalSellingPrice',
        header: 'Amount',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-lg">
              {formatCurrency(row.original.totalSellingPrice)}
            </div>
            {row.original.paidAmount !== undefined && row.original.paidAmount > 0 && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Paid: {formatCurrency(row.original.paidAmount)}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => {
          if (!row.original.paymentStatus) return <span className="text-muted-foreground">-</span>;

          return (
            <div>
              <PaymentBadge status={row.original.paymentStatus} />
              {row.original.balanceAmount !== undefined && row.original.balanceAmount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Balance: {formatCurrency(row.original.balanceAmount)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className="text-sm" title={new Date(row.original.createdAt).toLocaleString()}>
            {formatRelativeTime(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <BookingActionsMenu booking={row.original} />,
      },
    ],
    [router]
  );

  // Handle Status Filter Toggle
  const toggleStatusFilter = useCallback((status: BookingStatus) => {
    setSelectedStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Clear All Filters
  const clearFilters = useCallback(() => {
    setSearchValue('');
    setDebouncedSearch('');
    setSelectedStatus([]);
    setSelectedPaymentStatus([]);
    setSelectedClientType([]);
    setSelectedDestinations([]);
    setTravelDateRange({ from: undefined, to: undefined });
    setBookingDateRange({ from: undefined, to: undefined });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const hasActiveFilters =
    searchValue ||
    selectedStatus.length > 0 ||
    selectedPaymentStatus.length > 0 ||
    selectedClientType.length > 0 ||
    selectedDestinations.length > 0 ||
    travelDateRange.from ||
    bookingDateRange.from;

  const activeFilterCount =
    (selectedStatus.length > 0 ? 1 : 0) +
    (selectedPaymentStatus.length > 0 ? 1 : 0) +
    (selectedClientType.length > 0 ? 1 : 0) +
    (selectedDestinations.length > 0 ? 1 : 0) +
    (travelDateRange.from ? 1 : 0) +
    (bookingDateRange.from ? 1 : 0);

  // Loading State
  if (isLoading && !data) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <TableSkeleton />
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to load bookings</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const bookings = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Empty State (no bookings at all)
  if (!isLoading && bookings.length === 0 && !hasActiveFilters) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-6">Create your first booking to get started</p>
          <Button size="lg" onClick={() => router.push('/bookings/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Booking
          </Button>
        </div>
      </div>
    );
  }

  // No Search Results
  if (!isLoading && bookings.length === 0 && hasActiveFilters) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground mt-1">{totalCount} total bookings</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking code, client name, or destination..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* No Results */}
        <div className="flex flex-col items-center justify-center py-12">
          <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No bookings found</h2>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          {data && (
            <p className="text-muted-foreground mt-1">
              {totalCount} total booking{totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export All to Excel</DropdownMenuItem>
              <DropdownMenuItem>Export All to PDF</DropdownMenuItem>
              <DropdownMenuItem>Export All to CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => router.push('/bookings/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking code, client name, or destination..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative ${showFilters ? 'bg-accent' : ''}`}
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus.length === 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus([])}
        >
          All
          {selectedStatus.length === 0 && ` (${totalCount})`}
        </Button>
        {(['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map(
          status => (
            <Button
              key={status}
              variant={selectedStatus.includes(status) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleStatusFilter(status)}
            >
              {status.replace('_', ' ')}
            </Button>
          )
        )}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-6">
            {/* Row 1: Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Travel Date Range</label>
                <DateRangePicker
                  value={travelDateRange}
                  onChange={range => {
                    setTravelDateRange(range);
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                  placeholder="Filter by travel dates"
                />
                {travelDateRange.from && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTravelDateRange({ from: undefined, to: undefined });
                      setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                    className="mt-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear travel dates
                  </Button>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Booking Date Range</label>
                <DateRangePicker
                  value={bookingDateRange}
                  onChange={range => {
                    setBookingDateRange(range);
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                  placeholder="Filter by booking dates"
                />
                {bookingDateRange.from && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBookingDateRange({ from: undefined, to: undefined });
                      setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                    className="mt-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear booking dates
                  </Button>
                )}
              </div>
            </div>

            {/* Row 2: Client Type and Destinations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['B2C', 'B2B'] as ClientType[]).map(type => (
                    <Button
                      key={type}
                      variant={selectedClientType.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedClientType(prev =>
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                {selectedClientType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedClientType.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <button
                          onClick={() => {
                            setSelectedClientType(prev => prev.filter(t => t !== type));
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Destinations</label>
                <DestinationFilter
                  value={selectedDestinations}
                  onChange={destinations => {
                    setSelectedDestinations(destinations);
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                />
                {selectedDestinations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDestinations.map(dest => (
                      <Badge key={dest} variant="secondary" className="text-xs">
                        {dest}
                        <button
                          onClick={() => {
                            setSelectedDestinations(prev => prev.filter(d => d !== dest));
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Payment Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <div className="flex flex-wrap gap-2">
                {(['PAID', 'PARTIAL', 'PENDING', 'OVERDUE'] as PaymentStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={selectedPaymentStatus.includes(status) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedPaymentStatus(prev =>
                        prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                      );
                      setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              {selectedPaymentStatus.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedPaymentStatus.map(status => (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {status}
                      <button
                        onClick={() => {
                          setSelectedPaymentStatus(prev => prev.filter(s => s !== status));
                          setPagination(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedBookings={selectedBookings}
        onClearSelection={clearSelection}
        onDelete={() => setShowDeleteDialog(true)}
        onExport={handleBulkExport}
        isDeleting={bulkDeleteMutation.isPending}
        isExporting={bulkExportMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The following bookings will be permanently deleted:
              <div className="mt-3 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedBookings.map(booking => (
                    <li key={booking.id}>
                      <span className="font-mono font-semibold">{booking.bookingCode}</span>
                      {' - '}
                      {booking.clientName}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DataTable or Mobile Cards */}
      {isMobileView ? (
        <div className="space-y-3">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => router.push(`/bookings/${booking.id}`)}
              />
            ))
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={bookings}
          manualPagination
          manualSorting
          enableRowSelection={true}
          enableMultiRowSelection={true}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          totalRows={totalCount}
          isLoading={isLoading}
          getRowId={row => row.id}
        />
      )}

      {/* Pagination Controls */}
      {!isMobileView && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (pagination.pageIndex < 3) {
                  pageNum = i;
                } else if (pagination.pageIndex > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = pagination.pageIndex - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.pageIndex === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: pageNum }))}
                    disabled={isLoading}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex >= totalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Pagination */}
      {isMobileView && totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={pagination.pageIndex === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={pagination.pageIndex >= totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
