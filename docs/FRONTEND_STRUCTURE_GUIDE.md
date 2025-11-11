# Frontend Structure Guide - Tour Operations SaaS

**Last Updated:** 2025-11-11
**Purpose:** Complete guide to frontend organization based on 62-table database

---

## Overview

The frontend is organized to align perfectly with the backend's 62 database tables and 300+ API endpoints. This structure ensures:
- Clear module boundaries matching business domains
- Easy navigation and maintenance
- Scalability for future features
- Type safety and consistency

---

## Database to Frontend Module Mapping

### Core Business (62 tables → 15 frontend modules)

| Backend Tables | Frontend Module | Routes | Purpose |
|----------------|----------------|--------|---------|
| bookings (7 tables) | `/bookings` | `/dashboard/bookings/*` | Booking management |
| clients, operators_clients | `/clients`, `/partners` | `/dashboard/clients/*` | Client management (B2C/B2B) |
| quotations (2 tables) | `/quotations` | `/dashboard/quotations/*` | Quote creation & management |
| hotels (2 tables) | `/hotels` | `/dashboard/hotels/*` | Hotel inventory |
| vehicles (5 tables) | `/vehicles` | `/dashboard/vehicles/*` | Vehicle & transfer management |
| guides, restaurants, etc (5 tables) | `/tours` | `/dashboard/tours/*` | Tour services |
| suppliers (4 tables) | `/suppliers` | `/dashboard/suppliers/*` | Supplier management |
| payments (4 tables) | `/payments` | `/dashboard/payments/*` | Financial transactions |
| documents (4 tables) | `/documents` | `/dashboard/documents/*` | Document management |
| communications (4 tables) | `/communications` | `/dashboard/communications/*` | Emails & notifications |
| marketing (4 tables) | `/marketing` | `/dashboard/marketing/*` | Campaigns & promotions |
| operations (3 tables) | `/operations` | `/dashboard/operations/*` | Operational data |
| master data (6 tables) | `/settings/master-data` | `/dashboard/settings/*` | Settings & configuration |
| system (5 tables) | `/settings` | `/dashboard/settings/*` | System administration |
| others (6 tables) | `/settings` | `/dashboard/settings/*` | Misc configurations |

---

## Current Folder Structure

```
frontend/src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Authentication (no layout)
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/              # Protected routes
│   │   ├── dashboard/            # ✅ Created - Dashboard home
│   │   ├── bookings/             # ✅ Created - Booking module
│   │   ├── clients/              # ✅ Created - Client module
│   │   ├── quotations/           # ✅ Created - Quotation module
│   │   ├── hotels/               # ✅ Created - Hotel module
│   │   ├── vehicles/             # ✅ Created - Vehicle module
│   │   ├── tours/                # ✅ Created - Tours/Services module
│   │   ├── suppliers/            # ✅ Created - Supplier module
│   │   ├── payments/             # ✅ Created - Payments module
│   │   ├── documents/            # ✅ Created - Documents module
│   │   ├── settings/             # ✅ Created - Settings module
│   │   └── layout.tsx            # ✅ Dashboard layout
│   │
│   ├── layout.tsx                # ✅ Root layout
│   ├── page.tsx                  # ✅ Landing page
│   └── globals.css               # ✅ Global styles
│
├── components/
│   ├── features/                 # ✅ Created - Feature components
│   │   ├── bookings/            # ✅ For booking-specific components
│   │   ├── clients/             # ✅ For client-specific components
│   │   ├── quotations/          # ✅ For quotation-specific components
│   │   ├── hotels/              # ✅ For hotel-specific components
│   │   ├── vehicles/            # ✅ For vehicle-specific components
│   │   ├── payments/            # ✅ For payment-specific components
│   │   └── dashboard/           # ✅ For dashboard widgets
│   │
│   ├── forms/                    # ✅ Created - Generic form components
│   ├── tables/                   # ✅ Created - Data table components
│   │
│   ├── layout/                   # ✅ Layout components
│   │   ├── Sidebar.tsx          # ✅ Navigation sidebar
│   │   ├── Header.tsx           # ✅ Top header
│   │   └── Breadcrumbs.tsx      # ✅ Breadcrumbs
│   │
│   └── ui/                       # ✅ shadcn/ui components
│       ├── button.tsx           # ✅
│       ├── input.tsx            # ✅
│       ├── dropdown-menu.tsx    # ✅
│       └── ... (12 total)
│
├── lib/
│   ├── api/                      # ✅ API services
│   │   ├── client.ts            # ✅ Axios client
│   │   └── auth.ts              # ✅ Auth APIs
│   │
│   ├── react-query/              # ✅ React Query
│   │   ├── queryClient.ts       # ✅
│   │   └── QueryProvider.tsx    # ✅
│   │
│   ├── hooks/                    # ✅ Custom hooks
│   │   ├── use-toast.ts         # ✅
│   │   └── useHealthCheck.ts    # ✅
│   │
│   ├── constants/                # ✅ Constants
│   │   └── index.ts             # ✅
│   │
│   ├── utils/                    # ✅ Utilities
│   │   └── index.ts (utils.ts)  # ✅
│   │
│   └── validators/               # ✅ Created - Zod schemas
│
├── store/                        # ✅ Zustand stores
│   └── authStore.ts             # ✅ Auth state
│
├── types/                        # ✅ TypeScript types
│   └── index.ts                 # ✅
│
└── middleware.ts                 # ✅ Route protection
```

---

## Next Steps for Development

### Phase 2: Core Components Library

**Priority Order:**

1. **Form Components** (Week 2, Days 1-2)
   - `components/forms/DateRangePicker.tsx`
   - `components/forms/CurrencyInput.tsx`
   - `components/forms/PhoneInput.tsx`
   - `components/forms/FileUpload.tsx`
   - Install: `@tanstack/react-table`, `react-day-picker`

2. **Data Table** (Week 2, Days 2-3)
   - `components/tables/DataTable.tsx`
   - `components/tables/TablePagination.tsx`
   - `components/tables/TableFilters.tsx`
   - Generic, reusable table for all list views

3. **Booking Module** (Week 3)
   - Create booking types in `types/booking.ts`
   - Create booking API in `lib/api/bookings.ts`
   - Create booking hooks in `lib/hooks/useBookings.ts`
   - Build booking pages in `app/(dashboard)/bookings/`
   - Build booking components in `components/features/bookings/`

4. **Client Module** (Week 4)
   - Similar structure as bookings
   - B2C and B2B client support

5. **Continue** with other modules in priority order

---

## API Service Development Pattern

For each new module, follow this pattern:

### 1. Create Types (`types/[module].ts`)
```typescript
export interface Booking {
  id: number;
  operator_id: number;
  booking_code: string;
  client_id: number;
  // ... all database fields
}

export interface CreateBookingRequest {
  // fields for creation
}
```

### 2. Create API Service (`lib/api/[module].ts`)
```typescript
import { apiClient } from './client';
import { Booking, CreateBookingRequest } from '@/types/booking';

export const bookingsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get<Booking[]>('/bookings', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  create: async (data: CreateBookingRequest) => {
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Booking>) => {
    const response = await apiClient.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/bookings/${id}`);
  },
};
```

### 3. Create React Query Hooks (`lib/hooks/use[Module].ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { useToast } from './use-toast';

export const useBookings = (params?: any) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsApi.getAll(params),
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create booking',
        variant: 'destructive',
      });
    },
  });
};
```

### 4. Create Zod Validators (`lib/validators/[module].ts`)
```typescript
import { z } from 'zod';

export const createBookingSchema = z.object({
  client_id: z.number().positive('Client is required'),
  travel_start_date: z.string().min(1, 'Start date is required'),
  travel_end_date: z.string().min(1, 'End date is required'),
  num_adults: z.number().min(1, 'At least one adult required'),
  // ... more fields
});

export type CreateBookingData = z.infer<typeof createBookingSchema>;
```

### 5. Build UI Components & Pages
- List page with DataTable
- Create/Edit form with validation
- Detail view page
- Feature-specific components

---

## Module Development Priority

Based on business importance and dependencies:

1. ✅ **Authentication** - Completed
2. ✅ **Dashboard Layout** - Completed
3. **Bookings** - Core business function
4. **Clients** - Required for bookings
5. **Quotations** - Sales process
6. **Hotels** - Main inventory
7. **Vehicles** - Transport services
8. **Tours/Services** - Activity inventory
9. **Suppliers** - Supply chain
10. **Payments** - Financial management
11. **Documents** - Vouchers & contracts
12. **Settings** - Configuration
13. **Communications** - Notifications
14. **Marketing** - Promotions
15. **Reports** - Analytics

---

## File Naming Standards

### Components
- PascalCase: `BookingCard.tsx`, `ClientForm.tsx`
- Prefix with domain for clarity: `BookingPassengerForm.tsx`

### API Services
- camelCase: `bookings.ts`, `hotels.ts`
- Export object with `Api` suffix: `export const bookingsApi = {...}`

### Types
- camelCase filename: `booking.ts`
- PascalCase interface: `export interface Booking {...}`

### Hooks
- camelCase with `use` prefix: `useBookings.ts`
- Export multiple hooks: `useBookings`, `useBooking`, `useCreateBooking`

### Validators
- camelCase filename: `booking.ts`
- camelCase schema name: `createBookingSchema`, `updateBookingSchema`

---

## Import Alias Configuration

Use TypeScript path mapping (configured in `tsconfig.json`):

```typescript
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/bookings';
import { useBookings } from '@/lib/hooks/useBookings';
import { Booking } from '@/types/booking';
```

---

## Testing Strategy (Future)

Once core modules are built:

1. **Unit Tests** - Components with Jest + React Testing Library
2. **Integration Tests** - API hooks with MSW (Mock Service Worker)
3. **E2E Tests** - Critical flows with Playwright
4. **Type Tests** - Ensure types match backend schemas

---

## Performance Considerations

1. **Code Splitting**
   - Each route loads independently
   - Feature components lazy-loaded when needed

2. **React Query Caching**
   - 5-minute stale time for most data
   - Infinite queries for large lists
   - Optimistic updates for mutations

3. **Image Optimization**
   - Next.js Image component for all images
   - Proper sizing and lazy loading

4. **Bundle Size**
   - Tree-shaking unused code
   - Dynamic imports for large dependencies
   - Monitor with `next/bundle-analyzer`

---

## Documentation Standards

Each module should have:

1. **README.md** in module folder (for complex modules)
2. **JSDoc comments** on exported functions
3. **TypeScript types** for all data structures
4. **Usage examples** in Storybook (Phase 3)

---

## Git Workflow

1. **Feature branches**: `feature/booking-module`, `feature/client-management`
2. **Commit messages**: Follow conventional commits
3. **Pull requests**: Required for main branch
4. **Code reviews**: At least one approval
5. **CI/CD**: Tests must pass before merge

---

## Resources

- **Backend API**: http://localhost:3000/api
- **Database Schema**: `backend/database/saas_db_backup_2025-11-10T12-35-03.sql`
- **API Documentation**: `API_REFERENCE_SCHEMA.md`
- **API Implementation**: `API_IMPLEMENTATION_REPORT.md`
- **Folder Structure**: `frontend/FOLDER_STRUCTURE.md`
- **Phase 1 Docs**: `docs/PHASE_1_COMPLETION.md`

---

**Structure is ready for Phase 2 development!**
