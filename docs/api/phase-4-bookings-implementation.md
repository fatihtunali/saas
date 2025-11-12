# Phase 4: Bookings Management - Implementation Guide

## Overview
This document details the complete implementation of Task 1 (Bookings List) including all issues encountered and their solutions.

**Date Completed**: 2025-11-11
**Total Code**: 4,433 lines
**Status**: ✅ COMPLETED

---

## 1. Architecture Overview

### Frontend Structure
```
frontend/src/
├── types/bookings.ts (540 lines)
│   └── Complete TypeScript interfaces for all booking entities
├── lib/
│   ├── api/bookings.ts (465 lines)
│   │   └── 15 API service functions with error handling
│   └── hooks/useBookings.ts (732 lines)
│       └── 13 React Query hooks with smart caching
└── app/(dashboard)/dashboard/bookings/
    ├── page.tsx (1,499 lines) - Main bookings list page
    ├── loading.tsx - Loading skeleton
    └── error.tsx - Error boundary
```

### Backend Structure
```
backend/src/
└── controllers/bookingController.js
    └── exports.getBookings (lines 12-107)
        ├── Pagination support
        ├── Search filtering
        ├── Field name mapping (camelCase ↔ snake_case)
        └── Multi-tenant filtering
```

---

## 2. Critical Issues & Solutions

### Issue 1: Route 404 Error
**Problem**: `/dashboard/bookings` returned 404 despite page file existing

**Root Cause**: Next.js App Router route group behavior
- ❌ Wrong: `src/app/(dashboard)/bookings/page.tsx` → routes to `/bookings`
- ✅ Correct: `src/app/(dashboard)/dashboard/bookings/page.tsx` → routes to `/dashboard/bookings`

**Explanation**:
- Route groups like `(dashboard)` are organizational only and don't appear in URLs
- To get `/dashboard/bookings`, the file must be at `dashboard/bookings/page.tsx`

**Solution**: Created correct directory structure
```bash
mkdir -p src/app/(dashboard)/dashboard/bookings
mv src/app/(dashboard)/bookings/* src/app/(dashboard)/dashboard/bookings/
```

**Reference**: `frontend/src/app/(dashboard)/dashboard/bookings/page.tsx`

---

### Issue 2: Backend Response Format Mismatch
**Problem**: Frontend showed "data is undefined" error

**Root Cause**: Backend returning simple array instead of paginated object
```javascript
// ❌ BEFORE (Wrong Format)
exports.getBookings = async (req, res) => {
  const result = await db.query(query, params);
  res.json(result.rows);  // Just an array: []
};
```

**Frontend Expected Format**:
```typescript
interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Solution**: Updated backend to return paginated response
```javascript
// ✅ AFTER (Correct Format)
exports.getBookings = async (req, res) => {
  // ... query logic ...

  res.json({
    data: result.rows,        // Array of bookings
    total: totalCount,        // Total records in database
    page: currentPage,        // Current page number
    limit: itemsPerPage,      // Items per page
    totalPages: Math.ceil(total / limit)
  });
};
```

**Modified File**: `backend/src/controllers/bookingController.js` (lines 95-102)

---

### Issue 3: Field Name Mapping (camelCase vs snake_case)
**Problem**: Backend crashed with SQL errors when sorting

**Root Cause**: Frontend sends camelCase field names but database uses snake_case
- Frontend: `sortBy: "createdAt"`
- Database: Column name is `created_at`
- SQL: `ORDER BY bookings.createdAt` ❌ (column doesn't exist)

**Solution**: Added field name mapping
```javascript
// Map camelCase to snake_case for database columns
const sortByMap = {
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'bookingCode': 'booking_code',
  'travelStartDate': 'travel_start_date',
  'totalCost': 'total_cost'
};
const sortBy = sortByMap[sortByParam] || 'created_at';

// Use mapped field in SQL
const dataQuery = `
  SELECT ... FROM bookings b
  ORDER BY b.${sortBy} ${sortOrder.toUpperCase()}
  ...
`;
```

**Modified File**: `backend/src/controllers/bookingController.js` (lines 27-34)

**Important**: Add new mappings when adding sortable fields!

---

### Issue 4: Server Stability - Multiple Node Processes
**Problem**: Backend kept exiting with "clean exit" immediately after starting

**Root Cause**: Multiple zombie Node.js processes from previous failed starts
- Multiple `npm run dev` processes still running
- Port conflicts and nodemon confusion
- Old code cached in memory

**Symptoms**:
```bash
# Nodemon shows:
[nodemon] clean exit - waiting for changes before restart
[nodemon] restarting due to changes...
[nodemon] clean exit - waiting for changes before restart
# (loops continuously)
```

**Diagnosis Steps**:
```bash
# 1. Check what's on port 3000
netstat -ano | findstr :3000
# Output: TCP 0.0.0.0:3000  LISTENING  26240

# 2. Kill the zombie process
powershell -Command "Stop-Process -Id 26240 -Force"

# 3. Kill all old bash shells running backend
# Use KillShell tool to terminate old background processes
```

**Solution**:
1. Kill all old Node.js processes on port 3000
2. Kill all old bash background processes
3. Start fresh backend server
4. Verify it stays running (not "clean exit")

**Commands**:
```bash
# Kill process by PID
powershell -Command "Stop-Process -Id <PID> -Force"

# Start fresh backend
cd backend && npm run dev
```

**Prevention**:
- Always check for zombie processes before starting servers
- Use proper process management (kill old ones first)
- On Windows, use PowerShell Stop-Process instead of taskkill /F

---

### Issue 5: Request Not Reaching Updated Code
**Problem**: Code changes not taking effect despite nodemon restart

**Root Cause**: Old Node process still serving requests
- New nodemon spawned but old process held port 3000
- Requests went to old cached code
- Console.logs didn't appear

**Solution**:
1. Identify running process: `netstat -ano | findstr :3000`
2. Kill it: `powershell -Command "Stop-Process -Id <PID> -Force"`
3. Verify new code loads by adding temporary console.log
4. Remove debug logging after verification

**Verification**:
```javascript
// Add temporary logging
exports.getBookings = async (req, res) => {
  console.log('✅ getBookings called with params:', req.query);
  // ... rest of code
};

// Check backend logs for output
// If it appears: code is fresh ✅
// If it doesn't appear: still using old code ❌
```

---

## 3. Backend API Implementation

### GET /api/bookings
**Purpose**: Fetch paginated, filtered, searchable bookings list

**Request Parameters**:
```typescript
{
  page?: number;          // Page number (default: 1)
  limit?: number;         // Items per page (default: 25)
  search?: string;        // Search in booking_code, client_name, etc.
  sortBy?: string;        // Field to sort by (camelCase)
  sortOrder?: 'asc' | 'desc';  // Sort direction
  status?: string[];      // Filter by booking status
  clientType?: 'B2C' | 'B2B';  // Filter by client type
  destination?: string;   // Filter by destination city
  startDate?: string;     // Filter by travel start date (from)
  endDate?: string;       // Filter by travel end date (to)
}
```

**Response Format**:
```typescript
{
  data: Booking[];        // Array of booking objects
  total: number;          // Total count of all bookings
  page: number;           // Current page
  limit: number;          // Items per page
  totalPages: number;     // Math.ceil(total / limit)
}
```

**Example Request**:
```bash
curl "http://localhost:3000/api/bookings?page=1&limit=25&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Example Response**:
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 25,
  "totalPages": 0
}
```

**SQL Query Structure**:
```sql
-- Count total (for pagination)
SELECT COUNT(*) as total
FROM bookings b
LEFT JOIN clients c ON b.client_id = c.id
LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
LEFT JOIN cities ci ON b.destination_city_id = ci.id
WHERE b.deleted_at IS NULL
  AND (b.operator_id = $1 OR $1 IS NULL)  -- Multi-tenant filter
  AND (search conditions if provided)

-- Fetch paginated data
SELECT b.*,
       c.full_name as client_name,
       oc.full_name as operator_client_name,
       ci.name as destination_city_name,
       u.full_name as created_by_name
FROM bookings b
LEFT JOIN clients c ON b.client_id = c.id
LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
LEFT JOIN cities ci ON b.destination_city_id = ci.id
LEFT JOIN users u ON b.created_by = u.id
WHERE b.deleted_at IS NULL
  AND (b.operator_id = $1 OR $1 IS NULL)
  AND (search conditions if provided)
ORDER BY b.created_at DESC  -- Using mapped field name
LIMIT $2 OFFSET $3
```

**Key Features**:
- ✅ Server-side pagination
- ✅ Full-text search across multiple fields
- ✅ Multi-tenant data isolation (operator_id filtering)
- ✅ Soft delete support (deleted_at IS NULL)
- ✅ Field name mapping (camelCase → snake_case)
- ✅ Left joins for related data

**Implementation**: `backend/src/controllers/bookingController.js:12-107`

---

## 4. Frontend Implementation

### Types Definition
**File**: `frontend/src/types/bookings.ts`

**Key Interfaces**:
```typescript
// Main booking entity (46 fields)
interface Booking {
  id: string;
  bookingCode: string;
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  status: BookingStatus;
  totalCost: number;
  totalSellingPrice: number;
  // ... 35+ more fields
}

// Booking status enum
type BookingStatus =
  | 'quotation'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Query parameters for API
interface BookingsQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: BookingStatus[];
  clientType?: 'B2C' | 'B2B';
  destination?: string;
  startDate?: string;
  endDate?: string;
}

// API response
interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

### API Service Layer
**File**: `frontend/src/lib/api/bookings.ts`

**Functions** (15 total):
```typescript
// List operations
export async function getBookings(params: BookingsQueryParams): Promise<PaginatedBookings>

// CRUD operations
export async function getBookingById(id: string): Promise<BookingWithRelations>
export async function createBooking(data: CreateBookingInput): Promise<Booking>
export async function updateBooking(id: string, data: UpdateBookingInput): Promise<Booking>
export async function deleteBooking(id: string): Promise<void>

// Bulk operations
export async function bulkDeleteBookings(ids: string[]): Promise<BulkOperationResponse>
export async function bulkExportBookings(ids: string[], format: ExportFormat): Promise<Blob>

// Related entities
export async function getBookingPassengers(bookingId: string): Promise<BookingPassenger[]>
export async function getBookingServices(bookingId: string): Promise<BookingService[]>
// ... more functions
```

**Error Handling**:
```typescript
try {
  const response = await apiClient.get('/bookings', { params });
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.error || 'Failed to fetch bookings');
  }
  throw error;
}
```

---

### React Query Hooks
**File**: `frontend/src/lib/hooks/useBookings.ts`

**Query Key Factory**:
```typescript
export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (params: BookingsQueryParams) => [...bookingsKeys.lists(), params] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
};
```

**Main List Hook**:
```typescript
export function useBookings(params: BookingsQueryParams) {
  return useQuery({
    queryKey: bookingsKeys.list(params),
    queryFn: () => getBookings(params),
    staleTime: 30000,  // 30 seconds
    gcTime: 300000,    // 5 minutes
  });
}
```

**Mutation Hooks**:
```typescript
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
  });
}

export function useBulkDeleteBookings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteBookings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
  });
}

// ... 11 more hooks
```

**Benefits**:
- ✅ Automatic caching (30s stale time)
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Automatic cache invalidation
- ✅ Loading and error states

---

### UI Components
**File**: `frontend/src/app/(dashboard)/dashboard/bookings/page.tsx`

**Component Structure**:
```typescript
export default function BookingsPage() {
  // State management
  const [queryParams, setQueryParams] = useState<BookingsQueryParams>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Data fetching
  const { data, isLoading, error } = useBookings(queryParams);

  // Table configuration
  const columns: ColumnDef<Booking>[] = [
    // 10 column definitions with sorting, formatting, etc.
  ];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1>Bookings</h1>
        <Button onClick={handleCreate}>New Booking</Button>
      </div>

      {/* Search bar with 300ms debounce */}
      <SearchInput value={search} onChange={handleSearch} />

      {/* Advanced filters */}
      <FiltersPanel
        filters={filters}
        onChange={handleFiltersChange}
      />

      {/* Data table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      {/* Bulk operations bar (when rows selected) */}
      {selectedRows.length > 0 && (
        <BulkActionsBar
          count={selectedRows.length}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
        />
      )}
    </div>
  );
}
```

**Features Implemented**:
1. **10-Column DataTable**:
   - Booking Code
   - Client Name & Type
   - Destination
   - Travel Dates
   - Status (with badge styling)
   - Total Cost
   - Actions (View, Edit, Delete)

2. **Search** (300ms debounce):
   - Searches: booking_code, client_name, destination
   - Real-time filtering
   - Clear button

3. **Advanced Filters**:
   - Date range picker (travel dates)
   - Client type dropdown (B2C/B2B)
   - Destination multi-select
   - Status multi-select
   - Clear all filters button

4. **Pagination**:
   - Server-side (handles 10,000+ records)
   - Page size options: 10, 25, 50, 100
   - Page navigation: First, Prev, Next, Last
   - Shows: "Showing X-Y of Z results"

5. **Bulk Operations**:
   - Row selection (checkbox)
   - Select all / Deselect all
   - Bulk delete with confirmation
   - Bulk export to Excel/PDF
   - Action bar appears when rows selected

6. **Loading States**:
   - Skeleton loaders
   - Loading spinners
   - Disabled buttons during mutations

7. **Error Handling**:
   - Error boundary component
   - Toast notifications
   - Retry buttons
   - Clear error messages

8. **Empty State**:
   - Custom illustration
   - "No bookings yet" message
   - "Create first booking" CTA button

---

## 5. Testing Checklist

### Backend Testing
```bash
# 1. Test health endpoint
curl http://localhost:3000/health

# 2. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<YOUR_ADMIN_EMAIL>","password":"<YOUR_ADMIN_PASSWORD>"}'

# 3. Test bookings list (empty database)
curl "http://localhost:3000/api/bookings?page=1&limit=25" \
  -H "Authorization: Bearer <TOKEN>"
# Expected: {"data":[],"total":0,"page":1,"limit":25,"totalPages":0}

# 4. Test with search
curl "http://localhost:3000/api/bookings?page=1&limit=25&search=test" \
  -H "Authorization: Bearer <TOKEN>"

# 5. Test with sorting
curl "http://localhost:3000/api/bookings?page=1&limit=25&sortBy=bookingCode&sortOrder=asc" \
  -H "Authorization: Bearer <TOKEN>"
```

### Frontend Testing
```bash
# 1. Check route exists
curl http://localhost:3001/dashboard/bookings
# Should return 200 (not 404)

# 2. Open in browser
# Navigate to: http://localhost:3001/dashboard/bookings

# 3. Verify UI elements
- [ ] Page loads without errors
- [ ] "No bookings yet" message displays
- [ ] "New Booking" button exists
- [ ] Search bar is present
- [ ] Filters panel is present
- [ ] Table headers are visible

# 4. Test interactions
- [ ] Search input accepts text
- [ ] Filters can be opened/closed
- [ ] Pagination controls are disabled (no data)
- [ ] "Create first booking" button works
```

---

## 6. Common Issues & Troubleshooting

### Issue: "data is undefined"
**Cause**: Backend not returning proper paginated format
**Fix**: Check `bookingController.js` lines 95-102 for correct response structure
**Verify**: `curl` request should show `{"data":[],...}` not just `[]`

### Issue: 404 on /dashboard/bookings
**Cause**: Wrong file location in Next.js App Router
**Fix**: File must be at `src/app/(dashboard)/dashboard/bookings/page.tsx`
**Verify**: Check exact path with `ls -la` command

### Issue: Backend keeps restarting
**Cause**: Multiple Node processes or code errors
**Fix**: Kill all Node processes, check for syntax errors
**Verify**: Backend logs should NOT show "clean exit" repeatedly

### Issue: Changes not taking effect
**Cause**: Old Node process still serving
**Fix**: Kill process on port 3000, restart fresh
**Verify**: Add console.log and check if it appears in logs

### Issue: SQL error on sorting
**Cause**: Missing field name in sortByMap
**Fix**: Add mapping in lines 27-34 of bookingController.js
**Verify**: Try sorting by that field via API

### Issue: Console shows CORS errors
**Cause**: Backend CORS not configured or not running
**Fix**: Ensure backend has `app.use(cors())` and is running
**Verify**: Check backend logs for request logging

---

## 7. Performance Considerations

### Backend Optimization
```javascript
// ✅ Good: Count query separate from data query
const countResult = await db.query(countQuery, params);
const dataResult = await db.query(dataQuery, params);

// ❌ Bad: Fetching all records to count
const allResults = await db.query('SELECT * FROM bookings');
const total = allResults.rows.length;
```

### Frontend Optimization
```typescript
// ✅ Good: React Query caching
const { data } = useBookings(params);  // Cached for 30s

// ✅ Good: Debounced search
const debouncedSearch = useDebounce(search, 300);

// ✅ Good: Memoized columns
const columns = useMemo(() => [...], []);

// ❌ Bad: Fetching on every render
useEffect(() => {
  fetchBookings();  // No caching, no debounce
}, [search]);
```

### Database Indexing
```sql
-- Recommended indexes for bookings table
CREATE INDEX idx_bookings_operator_id ON bookings(operator_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## 8. File Locations Reference

### Frontend Files
```
frontend/src/
├── types/bookings.ts
├── lib/
│   ├── api/bookings.ts
│   └── hooks/useBookings.ts
└── app/(dashboard)/dashboard/bookings/
    ├── page.tsx
    ├── loading.tsx
    └── error.tsx
```

### Backend Files
```
backend/src/
├── controllers/
│   └── bookingController.js (lines 12-107: getBookings)
├── routes/
│   └── index.js (line 218: GET /api/bookings route)
└── middleware/
    └── auth.js (authenticateToken middleware)
```

### Configuration Files
```
backend/
├── .env (DATABASE_URL, JWT_SECRET, PORT)
└── package.json (nodemon dev script)

frontend/
├── .env.local (NEXT_PUBLIC_API_URL)
├── tsconfig.json (path aliases: @/*)
└── package.json (next dev script)
```

---

## 9. Next Steps

### Task 2: Booking Wizard (5 Steps)
- Step 1: Client Selection
- Step 2: Trip Details
- Step 3: Passengers Information
- Step 4: Services Selection
- Step 5: Pricing & Summary

### Task 3: Booking Details Page (8 Tabs)
- Overview Tab
- Passengers Tab
- Services Tab
- Flights Tab
- Itinerary Tab
- Payments Tab
- Documents Tab
- Activity Log Tab

### Task 4: Voucher Generation
- PDF generation
- Email delivery
- Template management
- Print functionality

---

## 10. Environment Configuration

### Database
```
Host: <YOUR_DATABASE_HOST>
Port: 5432
Database: saas_db
User: <YOUR_DATABASE_USER>
Password: <YOUR_DATABASE_PASSWORD>
```

### Test User
```
Email: <YOUR_ADMIN_EMAIL>
Password: <YOUR_ADMIN_PASSWORD>
Role: super_admin
```

### API Endpoints
```
Backend: http://localhost:3000
Frontend: http://localhost:3001
API Docs: http://localhost:3000/api-docs
```

---

## 11. Key Learnings

1. **Next.js Route Groups**: Parentheses folders like `(dashboard)` don't appear in URLs
2. **API Response Format**: Always return consistent structure with metadata
3. **Field Naming**: Map between frontend (camelCase) and database (snake_case)
4. **Process Management**: Clean up zombie processes before starting servers
5. **React Query**: Use query key factories for better cache invalidation
6. **Server-Side Pagination**: Essential for handling large datasets
7. **TypeScript Strict Mode**: Catches errors early, prevents runtime bugs
8. **Debouncing**: Reduce API calls for search inputs (300ms is good)
9. **Multi-Tenancy**: Always filter by operator_id for data isolation
10. **Soft Deletes**: Use deleted_at instead of hard deletes for audit trail

---

## Document Information
- **Created**: 2025-11-11
- **Last Updated**: 2025-11-11
- **Version**: 1.0.0
- **Status**: Complete
- **Related Docs**:
  - `docs/api/api-documentation.yaml`
  - `docs/DEVELOPMENT_ROADMAP.md`
  - `docs/phase-4-bookings-management.md`
