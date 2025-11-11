# Component API Reference - Tour Operations SaaS

**Version:** 1.0.0
**Last Updated:** 2025-11-11
**Total Components:** 47

---

## Table of Contents

1. [Form Components](#form-components)
2. [DataTable System](#datatable-system)
3. [Dashboard Components](#dashboard-components)
4. [UI Components](#ui-components)
5. [Usage Patterns](#usage-patterns)

---

## Form Components

Location: `frontend/src/components/forms/`

### DatePicker

Single date selection component using react-day-picker.

**Props:**
```typescript
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}
```

**Usage:**
```typescript
import { DatePicker } from '@/components/forms/DatePicker';

<DatePicker
  value={startDate}
  onChange={setStartDate}
  minDate={new Date()}
  placeholder="Select start date"
/>
```

---

### DateRangePicker

Date range selection with preset options.

**Props:**
```typescript
interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  presets?: boolean;
  disabled?: boolean;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};
```

**Usage:**
```typescript
import { DateRangePicker } from '@/components/forms/DateRangePicker';

<DateRangePicker
  value={{ from: startDate, to: endDate }}
  onChange={({ from, to }) => {
    setStartDate(from);
    setEndDate(to);
  }}
  presets={true}
/>
```

**Preset Options:**
- Today
- This Week
- This Month
- Last 7 Days
- Last 30 Days
- Custom Range

---

### TimePicker

Time selection in HH:MM format.

**Props:**
```typescript
interface TimePickerProps {
  value?: string; // "HH:MM" format
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Usage:**
```typescript
import { TimePicker } from '@/components/forms/TimePicker';

<TimePicker
  value={departureTime}
  onChange={setDepartureTime}
  placeholder="Select time"
/>
```

---

### CurrencyInput

Amount input with currency selector.

**Props:**
```typescript
interface CurrencyInputProps {
  value?: number;
  onChange?: (amount: number) => void;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  currencies?: Currency[];
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

type Currency = {
  code: string; // "USD", "EUR", "TRY"
  symbol: string; // "$", "€", "₺"
  name: string; // "US Dollar"
};
```

**Usage:**
```typescript
import { CurrencyInput } from '@/components/forms/CurrencyInput';

<CurrencyInput
  value={totalCost}
  onChange={setTotalCost}
  currency={selectedCurrency}
  onCurrencyChange={setSelectedCurrency}
  currencies={availableCurrencies}
  min={0}
/>
```

---

### PhoneInput

International phone number input with country code selector.

**Props:**
```typescript
interface PhoneInputProps {
  value?: string;
  onChange?: (phone: string) => void;
  defaultCountry?: string; // ISO 3166-1 alpha-2 code
  placeholder?: string;
  disabled?: boolean;
}
```

**Usage:**
```typescript
import { PhoneInput } from '@/components/forms/PhoneInput';

<PhoneInput
  value={contactPhone}
  onChange={setContactPhone}
  defaultCountry="TR"
  placeholder="Enter phone number"
/>
```

**Features:**
- Auto-formatting by country
- Validation using libphonenumber-js
- Country flag display
- Search countries

---

### FileUpload

File upload with drag & drop support.

**Props:**
```typescript
interface FileUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string; // ".pdf,.docx,.xlsx"
  maxSize?: number; // bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
}
```

**Usage:**
```typescript
import { FileUpload } from '@/components/forms/FileUpload';

<FileUpload
  value={documents}
  onChange={setDocuments}
  accept=".pdf,.docx,.xlsx"
  maxSize={10 * 1024 * 1024} // 10MB
  multiple
/>
```

**Features:**
- Drag & drop zone
- File type validation
- Size validation
- File preview/list
- Remove file capability
- Upload progress (if integrated with API)

---

### ImageUpload

Image upload with preview and aspect ratio support.

**Props:**
```typescript
interface ImageUploadProps {
  value?: File | string; // File or URL
  onChange?: (file: File | null) => void;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'free';
  maxWidth?: number;
  maxHeight?: number;
  disabled?: boolean;
}
```

**Usage:**
```typescript
import { ImageUpload } from '@/components/forms/ImageUpload';

<ImageUpload
  value={hotelImage}
  onChange={setHotelImage}
  aspectRatio="16:9"
  maxWidth={1920}
  maxHeight={1080}
/>
```

---

### RichTextEditor

WYSIWYG rich text editor using TipTap.

**Props:**
```typescript
interface RichTextEditorProps {
  value?: string; // HTML string
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
}
```

**Usage:**
```typescript
import { RichTextEditor } from '@/components/forms/RichTextEditor';

<RichTextEditor
  value={bookingNotes}
  onChange={setBookingNotes}
  placeholder="Enter booking notes..."
  minHeight={200}
/>
```

**Features:**
- Bold, Italic, Underline, Strikethrough
- Headings (H1-H6)
- Bullet lists, Numbered lists
- Blockquotes
- Code blocks
- Links
- Undo/Redo

---

### MultiSelect

Multi-selection dropdown with search.

**Props:**
```typescript
interface MultiSelectProps<T> {
  value?: T[];
  onChange?: (selected: T[]) => void;
  options: Option<T>[];
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
  searchable?: boolean;
}

type Option<T> = {
  value: T;
  label: string;
  disabled?: boolean;
};
```

**Usage:**
```typescript
import { MultiSelect } from '@/components/forms/MultiSelect';

<MultiSelect
  value={selectedServices}
  onChange={setSelectedServices}
  options={serviceOptions}
  placeholder="Select services..."
  maxSelections={10}
  searchable
/>
```

---

### AutoComplete

Search dropdown with async data fetching.

**Props:**
```typescript
interface AutoCompleteProps<T> {
  value?: T;
  onChange?: (selected: T | null) => void;
  onSearch: (query: string) => Promise<T[]>;
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (value: T) => string;
  placeholder?: string;
  disabled?: boolean;
  debounce?: number; // ms
}
```

**Usage:**
```typescript
import { AutoComplete } from '@/components/forms/AutoComplete';

<AutoComplete
  value={selectedClient}
  onChange={setSelectedClient}
  onSearch={searchClients}
  renderOption={(client) => (
    <div>{client.full_name} - {client.email}</div>
  )}
  renderValue={(client) => client.full_name}
  placeholder="Search clients..."
  debounce={300}
/>
```

---

### FormField

Form field wrapper with label and error display.

**Props:**
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}
```

**Usage:**
```typescript
import { FormField } from '@/components/forms/FormField';

<FormField
  label="Email Address"
  required
  error={errors.email?.message}
  helpText="We'll never share your email"
>
  <Input type="email" {...register('email')} />
</FormField>
```

---

## DataTable System

Location: `frontend/src/components/tables/`

### DataTable

Advanced data table with sorting, filtering, pagination, and row selection.

**Props:**
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];

  // Pagination
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  manualPagination?: boolean;

  // Sorting
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;

  // Filtering
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;

  // Row Selection
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  enableRowSelection?: boolean;

  // Events
  onRowClick?: (row: T) => void;

  // States
  loading?: boolean;
  error?: Error;
}

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

type SortingState = {
  id: string;
  desc: boolean;
}[];
```

**Usage:**
```typescript
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'booking_code',
    header: 'Booking Code',
  },
  {
    accessorKey: 'client_name',
    header: 'Client',
    enableSorting: true,
  },
  {
    accessorKey: 'total_cost',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('total_cost')),
  },
];

<DataTable
  columns={columns}
  data={bookings}
  pagination={{ pageIndex: 0, pageSize: 25 }}
  onPaginationChange={setPagination}
  totalItems={1000}
  enableRowSelection
  onRowClick={(booking) => router.push(`/bookings/${booking.id}`)}
  loading={isLoading}
/>
```

---

### TablePagination

Pagination controls component.

**Props:**
```typescript
interface TablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}
```

**Usage:**
```typescript
<TablePagination
  pageIndex={0}
  pageSize={25}
  totalItems={1000}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

---

### TableSearch

Global search input for tables.

**Props:**
```typescript
interface TableSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}
```

**Usage:**
```typescript
<TableSearch
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search bookings..."
  debounce={300}
/>
```

---

### BulkActions

Bulk action toolbar for selected table rows.

**Props:**
```typescript
interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onClearSelection?: () => void;
  customActions?: Action[];
}

type Action = {
  label: string;
  icon?: React.ComponentType;
  onClick: () => void;
  variant?: 'default' | 'danger';
};
```

**Usage:**
```typescript
<BulkActions
  selectedCount={5}
  onDelete={handleBulkDelete}
  onExport={handleBulkExport}
  onClearSelection={clearSelection}
  customActions={[
    { label: 'Send Email', icon: Mail, onClick: sendEmail },
  ]}
/>
```

---

### TableSkeleton

Loading skeleton for tables.

**Props:**
```typescript
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}
```

**Usage:**
```typescript
{isLoading ? (
  <TableSkeleton rows={10} columns={5} />
) : (
  <DataTable data={data} columns={columns} />
)}
```

---

### EmptyState

Empty state component for tables and lists.

**Props:**
```typescript
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'no-data' | 'no-results' | 'error';
}
```

**Usage:**
```typescript
<EmptyState
  icon={FolderOpen}
  title="No bookings found"
  description="Get started by creating your first booking"
  action={{
    label: "Create Booking",
    onClick: () => router.push('/bookings/new')
  }}
/>
```

---

## Dashboard Components

Location: `frontend/src/components/features/dashboard/`

### StatCard

Metric display card with trend indicator.

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  onClick?: () => void;
}
```

**Usage:**
```typescript
import { StatCard } from '@/components/features/dashboard/StatCard';
import { DollarSign } from 'lucide-react';

<StatCard
  title="Total Revenue"
  value="$45,231.89"
  change={20.1}
  icon={DollarSign}
  variant="success"
  onClick={() => router.push('/reports/revenue')}
/>
```

**Change Display:**
- `change > 0`: Green up arrow ↑
- `change < 0`: Red down arrow ↓
- `change === 0`: No arrow, gray text

---

### ChartCard

Card wrapper for charts with controls.

**Props:**
```typescript
interface ChartCardProps {
  title: string;
  description?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periods?: Period[];
  onExport?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

type Period = {
  value: string;
  label: string;
};
```

**Usage:**
```typescript
import { ChartCard } from '@/components/features/dashboard/ChartCard';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<ChartCard
  title="Revenue Overview"
  description="Monthly revenue for 2025"
  period={period}
  onPeriodChange={setPeriod}
  periods={[
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
  ]}
  onExport={handleExport}
>
  <LineChart data={revenueData} width={600} height={300}>
    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
  </LineChart>
</ChartCard>
```

---

## UI Components

Location: `frontend/src/components/ui/`

### LoadingSpinner

Loading spinner component.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary';
  className?: string;
}
```

**Usage:**
```typescript
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="lg" />
```

---

### ConfirmDialog

Async confirmation dialog.

**Props:**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}
```

**Usage:**
```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

<ConfirmDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  title="Delete Booking"
  description="Are you sure? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
  onConfirm={handleDelete}
  isLoading={isDeleting}
/>
```

---

### Card Components

**InfoCard:**
```typescript
<InfoCard
  icon={Hotel}
  title="Hotel Information"
  description="5-star luxury hotel"
  image="/hotel.jpg"
  actions={[
    { label: 'View Details', onClick: viewDetails }
  ]}
/>
```

**ListCard:**
```typescript
<ListCard
  items={[
    { avatar: '/user1.jpg', title: 'John Doe', subtitle: 'Premium Member' },
    { avatar: '/user2.jpg', title: 'Jane Smith', subtitle: 'Regular Member' },
  ]}
  onItemClick={handleClick}
/>
```

**ActionCard:**
```typescript
<ActionCard
  icon={Plus}
  title="Create Booking"
  description="Start a new booking for your client"
  action={{ label: 'Get Started', onClick: createBooking }}
/>
```

---

## Usage Patterns

### Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  travelDate: z.date(),
  phone: z.string().min(10),
  budget: z.number().positive(),
});

export function BookingForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Travel Date" required error={errors.travelDate?.message}>
        <DatePicker
          value={watch('travelDate')}
          onChange={(date) => setValue('travelDate', date)}
        />
      </FormField>

      <FormField label="Phone" required error={errors.phone?.message}>
        <PhoneInput
          value={watch('phone')}
          onChange={(phone) => setValue('phone', phone)}
        />
      </FormField>

      <FormField label="Budget" required error={errors.budget?.message}>
        <CurrencyInput
          value={watch('budget')}
          onChange={(amount) => setValue('budget', amount)}
        />
      </FormField>

      <Button type="submit">Create Booking</Button>
    </form>
  );
}
```

### DataTable with API

```typescript
import { useQuery } from '@tanstack/react-query';

export function BookingsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', pagination, sorting],
    queryFn: () => fetchBookings({ pagination, sorting }),
  });

  return (
    <DataTable
      columns={columns}
      data={data?.bookings || []}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      totalItems={data?.total || 0}
      loading={isLoading}
      manualPagination
      manualSorting
    />
  );
}
```

### Dashboard with Stats

```typescript
export function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data?.revenue)}
          change={data?.revenueChange}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Active Bookings"
          value={data?.activeBookings}
          change={data?.bookingsChange}
          icon={Calendar}
        />
        {/* More stats */}
      </div>

      <ChartCard
        title="Revenue Trend"
        period={period}
        onPeriodChange={setPeriod}
      >
        <LineChart data={data?.revenueData} />
      </ChartCard>
    </div>
  );
}
```

---

## TypeScript Support

All components are fully typed. Import types as needed:

```typescript
import type { ColumnDef } from '@tanstack/react-table';
import type { DateRange } from '@/components/forms/DateRangePicker';
import type { Currency } from '@/components/forms/CurrencyInput';
```

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly
- Color contrast compliant

---

## Browser Support

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

---

**Last Updated:** 2025-11-11
**Component Count:** 47
**API Version:** 1.0.0
