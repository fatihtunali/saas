# Bookings API Quick Reference

Quick reference guide for using the Bookings API integration in your components.

---

## Import Statements

```typescript
// Import types
import type {
  Booking,
  BookingsQueryParams,
  CreateBookingInput,
  UpdateBookingInput,
  PaginatedBookings,
} from '@/types/bookings';

// Import hooks
import {
  useBookings,
  useBooking,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
  useCancelBooking,
  useBookingStats,
} from '@/lib/hooks/useBookings';

// Import API functions (only if needed directly)
import { getBookings, createBooking } from '@/lib/api/bookings';
```

---

## Quick Examples

### 1. Display Bookings List

```typescript
function BookingsList() {
  const { data, isLoading, error } = useBookings({
    page: 1,
    limit: 25,
    status: ['CONFIRMED', 'IN_PROGRESS'],
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data.data.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

### 2. View Booking Details

```typescript
function BookingDetails({ id }: { id: string }) {
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h1>{booking.bookingCode}</h1>
      <p>Client: {booking.clientName}</p>
      <p>Destination: {booking.destination}</p>
      <p>Status: {booking.status}</p>
      <p>Total: ${booking.totalSellingPrice}</p>
    </div>
  );
}
```

### 3. Create Booking

```typescript
function CreateBookingForm() {
  const { mutate, isPending } = useCreateBooking();

  const onSubmit = (data: CreateBookingInput) => {
    mutate(data, {
      onSuccess: (newBooking) => {
        toast.success(`Booking ${newBooking.bookingCode} created!`);
        router.push(`/bookings/${newBooking.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}
```

### 4. Update Booking

```typescript
function EditBooking({ id }: { id: string }) {
  const { mutate } = useUpdateBooking();

  const handleUpdate = (data: UpdateBookingInput) => {
    mutate(
      { id, data },
      {
        onSuccess: () => toast.success('Updated!'),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  return <BookingForm onSubmit={handleUpdate} />;
}
```

### 5. Delete Booking

```typescript
function DeleteButton({ id }: { id: string }) {
  const { mutate, isPending } = useDeleteBooking();

  return (
    <Button
      onClick={() => mutate(id)}
      disabled={isPending}
      variant="destructive"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
```

### 6. Cancel Booking

```typescript
function CancelBooking({ id }: { id: string }) {
  const { mutate } = useCancelBooking();

  const handleCancel = () => {
    mutate(
      {
        id,
        data: {
          reason: 'Client requested cancellation',
          cancellationFee: 100,
          refundAmount: 900,
        },
      },
      {
        onSuccess: () => toast.success('Booking cancelled'),
      }
    );
  };

  return <Button onClick={handleCancel}>Cancel Booking</Button>;
}
```

### 7. Search & Filter

```typescript
function BookingsSearch() {
  const [params, setParams] = useState<BookingsQueryParams>({
    page: 1,
    limit: 25,
    search: '',
    status: undefined,
  });

  const { data } = useBookings(params);

  return (
    <>
      <Input
        placeholder="Search..."
        onChange={(e) => setParams({ ...params, search: e.target.value })}
      />
      <Select
        onValueChange={(value) =>
          setParams({ ...params, status: [value] })
        }
      >
        <option value="CONFIRMED">Confirmed</option>
        <option value="PENDING">Pending</option>
      </Select>
      <BookingsList data={data} />
    </>
  );
}
```

### 8. Bulk Operations

```typescript
function BulkActions({ selectedIds }: { selectedIds: string[] }) {
  const { mutate: bulkDelete } = useBulkDeleteBookings();
  const { mutate: bulkExport } = useBulkExportBookings();

  return (
    <>
      <Button
        onClick={() =>
          bulkDelete(selectedIds, {
            onSuccess: () => toast.success('Deleted!'),
          })
        }
      >
        Delete {selectedIds.length} bookings
      </Button>
      <Button
        onClick={() =>
          bulkExport(
            { ids: selectedIds, format: 'excel' },
            {
              onSuccess: (blob) => {
                // Download file
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bookings-${Date.now()}.xlsx`;
                a.click();
              },
            }
          )
        }
      >
        Export to Excel
      </Button>
    </>
  );
}
```

### 9. Statistics Dashboard

```typescript
function BookingsStats() {
  const { data: stats } = useBookingStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total" value={stats.totalBookings} />
      <StatCard title="Revenue" value={`$${stats.totalRevenue}`} />
      <StatCard title="Confirmed" value={stats.confirmedBookings} />
      <StatCard title="Pending" value={stats.pendingBookings} />
    </div>
  );
}
```

### 10. Activity Timeline

```typescript
function BookingTimeline({ id }: { id: string }) {
  const { data: timeline } = useBookingTimeline(id);

  return (
    <div className="space-y-4">
      {timeline?.map((activity) => (
        <TimelineItem key={activity.id}>
          <p>{activity.activityDescription}</p>
          <span className="text-sm text-muted">
            {formatDate(activity.createdAt)}
          </span>
        </TimelineItem>
      ))}
    </div>
  );
}
```

---

## Common Query Parameters

```typescript
// Basic pagination
{ page: 1, limit: 25 }

// Search
{ page: 1, limit: 25, search: 'john' }

// Filter by status
{ page: 1, limit: 25, status: ['CONFIRMED', 'IN_PROGRESS'] }

// Filter by date range
{
  page: 1,
  limit: 25,
  travelStartDate: '2024-06-01',
  travelEndDate: '2024-06-30'
}

// Filter by client type
{ page: 1, limit: 25, clientType: ['B2C'] }

// Filter by payment status
{ page: 1, limit: 25, paymentStatus: ['PENDING', 'OVERDUE'] }

// Sort by field
{ page: 1, limit: 25, sortBy: 'createdAt', sortOrder: 'desc' }

// Combine multiple filters
{
  page: 1,
  limit: 25,
  search: 'istanbul',
  status: ['CONFIRMED'],
  clientType: ['B2C'],
  travelStartDate: '2024-06-01',
  sortBy: 'travelStartDate',
  sortOrder: 'asc'
}
```

---

## Booking Status Values

```typescript
type BookingStatus =
  | 'DRAFT' // Initial creation, incomplete
  | 'CONFIRMED' // Client confirmed, services booked
  | 'IN_PROGRESS' // Tour is happening now
  | 'COMPLETED' // Tour finished
  | 'CANCELLED'; // Booking cancelled
```

---

## Payment Status Values

```typescript
type PaymentStatus =
  | 'PAID' // Fully paid
  | 'PARTIAL' // Partially paid
  | 'PENDING' // No payment received
  | 'OVERDUE'; // Payment overdue
```

---

## Loading States

```typescript
const { data, isLoading, isError, error, refetch } = useBookings(params);

if (isLoading) return <Skeleton />;
if (isError) return <Error message={error.message} />;
if (!data) return null;

// Render data
```

---

## Error Handling

```typescript
const { mutate } = useCreateBooking();

mutate(data, {
  onSuccess: newBooking => {
    console.log('Success:', newBooking);
    toast.success('Booking created!');
  },
  onError: error => {
    console.error('Error:', error);
    toast.error(error.message);
  },
  onSettled: () => {
    console.log('Request completed');
  },
});
```

---

## Optimistic Updates

React Query automatically handles optimistic updates for mutations that invalidate queries:

```typescript
// Update booking
const { mutate } = useUpdateBooking();

mutate(
  { id, data },
  {
    onSuccess: updatedBooking => {
      // Cache is automatically updated
      // List is automatically refetched
      // No manual cache manipulation needed
    },
  }
);
```

---

## Manual Cache Invalidation

If you need to manually invalidate cache:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { bookingsKeys } from '@/lib/hooks/useBookings';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleSomething = () => {
    // Invalidate all bookings queries
    queryClient.invalidateQueries({ queryKey: bookingsKeys.all });

    // Invalidate only lists
    queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });

    // Invalidate specific booking
    queryClient.invalidateQueries({ queryKey: bookingsKeys.detail('123') });
  };
}
```

---

## Conditional Queries

```typescript
// Only fetch when ID is available
const { data } = useBooking(id, !!id);

// Only fetch when user is authenticated
const { data } = useBookings(params, { enabled: isAuthenticated });
```

---

## Pagination

```typescript
function BookingsList() {
  const [page, setPage] = useState(1);
  const { data } = useBookings({ page, limit: 25 });

  return (
    <>
      <BookingsTable data={data.data} />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

---

## TypeScript Type Guards

```typescript
function isConfirmedBooking(booking: Booking): boolean {
  return booking.status === 'CONFIRMED';
}

function hasBalance(booking: Booking): boolean {
  return (booking.balanceAmount ?? 0) > 0;
}

function isOverdue(booking: Booking): boolean {
  return booking.paymentStatus === 'OVERDUE';
}
```

---

## Useful Utility Functions

```typescript
// Calculate days until travel
function daysUntilTravel(booking: Booking): number {
  const now = new Date();
  const travelDate = new Date(booking.travelStartDate);
  const diff = travelDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format currency
function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date range
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
}
```

---

## Common Patterns

### Master-Detail Pattern

```typescript
function BookingsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: bookings } = useBookings({ page: 1, limit: 25 });
  const { data: selectedBooking } = useBooking(selectedId!, !!selectedId);

  return (
    <div className="flex">
      <div className="w-1/3">
        {bookings.data.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onClick={() => setSelectedId(booking.id)}
          />
        ))}
      </div>
      <div className="w-2/3">
        {selectedBooking && <BookingDetails booking={selectedBooking} />}
      </div>
    </div>
  );
}
```

### Filter Sidebar Pattern

```typescript
function BookingsWithFilters() {
  const [params, setParams] = useState<BookingsQueryParams>({
    page: 1,
    limit: 25,
  });

  const { data } = useBookings(params);

  return (
    <div className="flex">
      <aside className="w-64">
        <FilterPanel
          filters={params}
          onChange={(newFilters) => setParams({ ...params, ...newFilters })}
        />
      </aside>
      <main className="flex-1">
        <BookingsList data={data} />
      </main>
    </div>
  );
}
```

---

## Performance Tips

1. **Use pagination:** Don't load all bookings at once
2. **Debounce search:** Wait 300ms after user stops typing
3. **Lazy load details:** Only fetch when needed
4. **Memoize expensive calculations:** Use `useMemo`
5. **Virtualize long lists:** Use react-virtual for 100+ items
6. **Optimize filters:** Send only changed filters to API

---

## Troubleshooting

### Query not updating?

- Check if cache is stale
- Manually invalidate: `queryClient.invalidateQueries()`
- Check stale time configuration

### Mutation not working?

- Check error in onError callback
- Verify API endpoint is correct
- Check request payload

### Cache not clearing?

- Verify invalidation is called
- Check query key matches
- Use React Query DevTools to inspect cache

---

## React Query DevTools

Add to your app:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

Open DevTools to:

- Inspect cache
- See query status
- Manually invalidate queries
- Debug performance issues

---

## Additional Resources

- **Types:** `frontend/src/types/bookings.ts`
- **API:** `frontend/src/lib/api/bookings.ts`
- **Hooks:** `frontend/src/lib/hooks/useBookings.ts`
- **React Query Docs:** https://tanstack.com/query/latest
- **Axios Docs:** https://axios-http.com/docs/intro

---

_Last Updated: 2025-11-11_
