# Frontend Folder Structure - Tour Operations SaaS

**Based on:** 62 database tables, 300+ API endpoints
**Last Updated:** 2025-11-11
**Purpose:** Organized structure aligned with backend data model

---

## Complete Folder Structure

```
frontend/src/
│
├── app/                                    # Next.js 14 App Router
│   ├── (auth)/                            # Authentication routes (no layout)
│   │   ├── login/
│   │   │   └── page.tsx                   # Login page
│   │   ├── register/
│   │   │   └── page.tsx                   # Registration page
│   │   └── forgot-password/
│   │       └── page.tsx                   # Password reset
│   │
│   ├── (dashboard)/                       # Protected dashboard routes
│   │   ├── dashboard/                     # Dashboard home
│   │   │   └── page.tsx                   # Main dashboard page
│   │   │
│   │   ├── bookings/                      # Bookings module
│   │   │   ├── page.tsx                   # Bookings list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create new booking
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx              # Booking details
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx          # Edit booking
│   │   │   │   ├── passengers/
│   │   │   │   │   └── page.tsx          # Manage passengers
│   │   │   │   ├── services/
│   │   │   │   │   └── page.tsx          # Manage services
│   │   │   │   ├── itinerary/
│   │   │   │   │   └── page.tsx          # Manage itinerary
│   │   │   │   ├── payments/
│   │   │   │   │   └── page.tsx          # Booking payments
│   │   │   │   └── vouchers/
│   │   │   │       └── page.tsx          # Generate vouchers
│   │   │   └── calendar/
│   │   │       └── page.tsx              # Bookings calendar view
│   │   │
│   │   ├── clients/                       # Clients module (B2C)
│   │   │   ├── page.tsx                   # Clients list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Add new client
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Client details
│   │   │       ├── edit/
│   │   │       │   └── page.tsx          # Edit client
│   │   │       ├── bookings/
│   │   │       │   └── page.tsx          # Client bookings
│   │   │       └── payments/
│   │   │           └── page.tsx          # Client payments
│   │   │
│   │   ├── partners/                      # B2B Partners (operators_clients)
│   │   │   ├── page.tsx                   # Partners list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Add new partner
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Partner details
│   │   │       └── edit/
│   │   │           └── page.tsx          # Edit partner
│   │   │
│   │   ├── quotations/                    # Quotations module
│   │   │   ├── page.tsx                   # Quotations list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create quotation
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Quotation details
│   │   │       ├── edit/
│   │   │       │   └── page.tsx          # Edit quotation
│   │   │       └── convert/
│   │   │           └── page.tsx          # Convert to booking
│   │   │
│   │   ├── hotels/                        # Hotels module
│   │   │   ├── page.tsx                   # Hotels list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Add new hotel
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Hotel details
│   │   │       ├── edit/
│   │   │       │   └── page.tsx          # Edit hotel
│   │   │       └── room-types/
│   │   │           └── page.tsx          # Manage room types
│   │   │
│   │   ├── vehicles/                      # Vehicles module
│   │   │   ├── page.tsx                   # Vehicles overview
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx              # Vehicle companies list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Company details
│   │   │   ├── types/
│   │   │   │   └── page.tsx              # Vehicle types
│   │   │   ├── routes/
│   │   │   │   └── page.tsx              # Transfer routes
│   │   │   ├── rentals/
│   │   │   │   └── page.tsx              # Vehicle rentals
│   │   │   └── maintenance/
│   │   │       └── page.tsx              # Maintenance log
│   │   │
│   │   ├── tours/                         # Tours & Services
│   │   │   ├── page.tsx                   # Services overview
│   │   │   ├── guides/
│   │   │   │   ├── page.tsx              # Guides list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Guide details
│   │   │   ├── tour-companies/
│   │   │   │   └── page.tsx              # Tour companies
│   │   │   ├── entrance-fees/
│   │   │   │   └── page.tsx              # Entrance fees
│   │   │   ├── restaurants/
│   │   │   │   └── page.tsx              # Restaurants
│   │   │   └── extra-expenses/
│   │   │       └── page.tsx              # Extra expenses
│   │   │
│   │   ├── suppliers/                     # Suppliers module
│   │   │   ├── page.tsx                   # Suppliers list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Add supplier
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Supplier details
│   │   │       ├── contacts/
│   │   │       │   └── page.tsx          # Supplier contacts
│   │   │       ├── contracts/
│   │   │       │   └── page.tsx          # Contracts
│   │   │       ├── payments/
│   │   │       │   └── page.tsx          # Payments to supplier
│   │   │       └── ratings/
│   │   │           └── page.tsx          # Supplier ratings
│   │   │
│   │   ├── payments/                      # Payments module
│   │   │   ├── page.tsx                   # Payments overview
│   │   │   ├── client-payments/
│   │   │   │   └── page.tsx              # Payments from clients
│   │   │   ├── supplier-payments/
│   │   │   │   └── page.tsx              # Payments to suppliers
│   │   │   ├── refunds/
│   │   │   │   └── page.tsx              # Refunds
│   │   │   └── commissions/
│   │   │       └── page.tsx              # Commissions
│   │   │
│   │   ├── documents/                     # Documents module
│   │   │   ├── page.tsx                   # Documents list
│   │   │   ├── vouchers/
│   │   │   │   └── page.tsx              # Vouchers
│   │   │   ├── templates/
│   │   │   │   └── page.tsx              # Document templates
│   │   │   └── upload/
│   │   │       └── page.tsx              # Upload documents
│   │   │
│   │   ├── communications/                # Communications module
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx              # Notifications
│   │   │   ├── emails/
│   │   │   │   ├── page.tsx              # Email logs
│   │   │   │   └── templates/
│   │   │   │       └── page.tsx          # Email templates
│   │   │   └── settings/
│   │   │       └── page.tsx              # Notification settings
│   │   │
│   │   ├── marketing/                     # Marketing module
│   │   │   ├── campaigns/
│   │   │   │   └── page.tsx              # Marketing campaigns
│   │   │   ├── promo-codes/
│   │   │   │   └── page.tsx              # Promotional codes
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx              # Client reviews
│   │   │   └── waiting-list/
│   │   │       └── page.tsx              # Tour waiting list
│   │   │
│   │   ├── operations/                    # Operations module
│   │   │   ├── pickup-locations/
│   │   │   │   └── page.tsx              # Pickup locations
│   │   │   ├── staff-schedule/
│   │   │   │   └── page.tsx              # Staff scheduling
│   │   │   └── service-availability/
│   │   │       └── page.tsx              # Service availability
│   │   │
│   │   ├── reports/                       # Reports & Analytics
│   │   │   ├── page.tsx                   # Reports dashboard
│   │   │   ├── sales/
│   │   │   │   └── page.tsx              # Sales reports
│   │   │   ├── financial/
│   │   │   │   └── page.tsx              # Financial reports
│   │   │   ├── bookings/
│   │   │   │   └── page.tsx              # Booking reports
│   │   │   └── custom/
│   │   │       └── page.tsx              # Custom reports
│   │   │
│   │   ├── settings/                      # Settings module
│   │   │   ├── page.tsx                   # Settings home
│   │   │   ├── company/
│   │   │   │   └── page.tsx              # Company profile
│   │   │   ├── users/
│   │   │   │   ├── page.tsx              # User management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # User details
│   │   │   ├── master-data/
│   │   │   │   ├── seasons/
│   │   │   │   │   └── page.tsx          # Seasons
│   │   │   │   ├── tax-rates/
│   │   │   │   │   └── page.tsx          # Tax rates
│   │   │   │   └── exchange-rates/
│   │   │   │       └── page.tsx          # Exchange rates
│   │   │   ├── bank-accounts/
│   │   │   │   └── page.tsx              # Bank accounts
│   │   │   ├── cancellation-policies/
│   │   │   │   └── page.tsx              # Cancellation policies
│   │   │   ├── api-keys/
│   │   │   │   └── page.tsx              # API keys
│   │   │   └── audit-logs/
│   │   │       └── page.tsx              # Audit logs
│   │   │
│   │   └── layout.tsx                     # Dashboard layout wrapper
│   │
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Landing page
│   └── globals.css                        # Global styles
│
├── components/                            # Reusable components
│   ├── features/                          # Feature-specific components
│   │   ├── bookings/                      # Booking components
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── BookingCalendar.tsx
│   │   │   ├── PassengerForm.tsx
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── ItineraryBuilder.tsx
│   │   │   └── VoucherGenerator.tsx
│   │   │
│   │   ├── clients/                       # Client components
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientSelector.tsx
│   │   │
│   │   ├── quotations/                    # Quotation components
│   │   │   ├── QuotationForm.tsx
│   │   │   ├── QuotationPreview.tsx
│   │   │   └── ServicePricing.tsx
│   │   │
│   │   ├── hotels/                        # Hotel components
│   │   │   ├── HotelCard.tsx
│   │   │   ├── HotelForm.tsx
│   │   │   ├── RoomTypeForm.tsx
│   │   │   └── HotelSelector.tsx
│   │   │
│   │   ├── vehicles/                      # Vehicle components
│   │   │   ├── VehicleCard.tsx
│   │   │   ├── RouteForm.tsx
│   │   │   └── RentalForm.tsx
│   │   │
│   │   ├── payments/                      # Payment components
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── RefundForm.tsx
│   │   │
│   │   └── dashboard/                     # Dashboard widgets
│   │       ├── RevenueChart.tsx
│   │       ├── BookingsChart.tsx
│   │       ├── UpcomingTours.tsx
│   │       └── RecentActivities.tsx
│   │
│   ├── forms/                             # Generic form components
│   │   ├── DateRangePicker.tsx
│   │   ├── CurrencyInput.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── RichTextEditor.tsx
│   │   └── MultiSelect.tsx
│   │
│   ├── layout/                            # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── tables/                            # Data table components
│   │   ├── DataTable.tsx
│   │   ├── TablePagination.tsx
│   │   ├── TableFilters.tsx
│   │   ├── TableSearch.tsx
│   │   └── BulkActions.tsx
│   │
│   └── ui/                                # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── tabs.tsx
│       ├── label.tsx
│       ├── tooltip.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── alert.tsx
│       ├── progress.tsx
│       ├── skeleton.tsx
│       ├── sheet.tsx
│       ├── popover.tsx
│       └── calendar.tsx
│
├── lib/                                   # Library code
│   ├── api/                               # API services
│   │   ├── client.ts                      # Axios client
│   │   ├── auth.ts                        # Auth APIs
│   │   ├── bookings.ts                    # Booking APIs
│   │   ├── clients.ts                     # Client APIs
│   │   ├── quotations.ts                  # Quotation APIs
│   │   ├── hotels.ts                      # Hotel APIs
│   │   ├── vehicles.ts                    # Vehicle APIs
│   │   ├── tours.ts                       # Tour/Service APIs
│   │   ├── suppliers.ts                   # Supplier APIs
│   │   ├── payments.ts                    # Payment APIs
│   │   ├── documents.ts                   # Document APIs
│   │   ├── communications.ts              # Communication APIs
│   │   ├── marketing.ts                   # Marketing APIs
│   │   ├── operations.ts                  # Operations APIs
│   │   ├── masterData.ts                  # Master data APIs
│   │   └── reports.ts                     # Reports APIs
│   │
│   ├── react-query/                       # React Query setup
│   │   ├── queryClient.ts                 # Query client config
│   │   └── QueryProvider.tsx              # Query provider
│   │
│   ├── hooks/                             # Custom React hooks
│   │   ├── use-toast.ts                   # Toast hook
│   │   ├── useAuth.ts                     # Auth hook
│   │   ├── useBookings.ts                 # Bookings hook
│   │   ├── useClients.ts                  # Clients hook
│   │   ├── useQuotations.ts               # Quotations hook
│   │   ├── useHotels.ts                   # Hotels hook
│   │   ├── useVehicles.ts                 # Vehicles hook
│   │   ├── useSuppliers.ts                # Suppliers hook
│   │   ├── usePayments.ts                 # Payments hook
│   │   └── useMasterData.ts               # Master data hook
│   │
│   ├── constants/                         # Constants
│   │   ├── index.ts                       # General constants
│   │   ├── booking-statuses.ts            # Booking status constants
│   │   ├── passenger-types.ts             # Passenger types
│   │   ├── service-types.ts               # Service types
│   │   └── currencies.ts                  # Currency constants
│   │
│   ├── utils/                             # Utility functions
│   │   ├── index.ts                       # General utils
│   │   ├── date.ts                        # Date utilities
│   │   ├── currency.ts                    # Currency formatting
│   │   ├── validation.ts                  # Validation helpers
│   │   └── pdf.ts                         # PDF generation
│   │
│   └── validators/                        # Zod schemas
│       ├── auth.ts                        # Auth schemas
│       ├── booking.ts                     # Booking schemas
│       ├── client.ts                      # Client schemas
│       ├── quotation.ts                   # Quotation schemas
│       ├── hotel.ts                       # Hotel schemas
│       └── payment.ts                     # Payment schemas
│
├── store/                                 # Zustand stores
│   ├── authStore.ts                       # Auth state
│   ├── uiStore.ts                         # UI state (sidebar, theme)
│   └── bookingStore.ts                    # Booking draft state
│
├── types/                                 # TypeScript types
│   ├── index.ts                           # Exported types
│   ├── api.ts                             # API response types
│   ├── booking.ts                         # Booking types
│   ├── client.ts                          # Client types
│   ├── quotation.ts                       # Quotation types
│   ├── hotel.ts                           # Hotel types
│   ├── vehicle.ts                         # Vehicle types
│   ├── supplier.ts                        # Supplier types
│   └── payment.ts                         # Payment types
│
└── middleware.ts                          # Next.js middleware (route protection)
```

---

## Folder Purpose & Guidelines

### `/app` - Next.js App Router

- Route-based organization matching backend modules
- Each major entity gets its own folder
- Nested routes for CRUD operations
- Use route groups `()` for layout variations

### `/components/features` - Feature Components

- Domain-specific components
- Organized by backend module
- Reusable within their domain

### `/components/forms` - Form Components

- Generic, reusable form inputs
- Shared across all features
- Enhanced HTML inputs with validation

### `/components/tables` - Table Components

- Data table components
- Pagination, sorting, filtering
- Bulk operations

### `/lib/api` - API Services

- One file per backend module
- Organized by controller/routes
- Consistent method naming (getAll, getById, create, update, delete)

### `/lib/hooks` - React Query Hooks

- Data fetching hooks using React Query
- One hook file per module
- Handles loading, error, cache states

### `/types` - TypeScript Definitions

- Strong typing for all entities
- Matches database schema
- API request/response types

### `/store` - Global State

- Zustand stores for client-side state
- Auth, UI preferences, draft states
- Persistent storage where needed

---

## Naming Conventions

### Files

- Components: PascalCase (e.g., `BookingCard.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- Types: camelCase with type suffix (e.g., `booking.ts`)
- API services: camelCase (e.g., `bookings.ts`)

### Folders

- Routes: kebab-case (e.g., `/booking-services`)
- Components: camelCase (e.g., `/bookings`)

### Components

- Prefix with domain for clarity (e.g., `BookingCard`, not just `Card`)
- Use descriptive names (e.g., `BookingPassengerForm`)

---

## Module Organization by Backend Tables

### Core Business Modules

1. **Bookings** (7 tables): bookings, booking_passengers, booking_services, booking_flights, booking_itinerary, booking_tasks, booking_modifications, booking_activities
2. **Clients** (2 tables): clients, operators_clients
3. **Quotations** (2 tables): quotations, quotation_services
4. **Hotels** (2 tables): hotels, hotel_room_types
5. **Vehicles** (4 tables): vehicle_companies, vehicle_types, transfer_routes, vehicle_rentals, vehicle_maintenance
6. **Tours & Services** (5 tables): guides, tour_companies, entrance_fees, restaurants, extra_expenses
7. **Suppliers** (4 tables): suppliers, supplier_contacts, supplier_contracts, supplier_ratings, supplier_payments

### Support Modules

8. **Payments** (4 tables): client_payments, refunds, commissions, supplier_payments
9. **Documents** (4 tables): documents, document_templates, vouchers, service_availability
10. **Communications** (4 tables): notifications, notification_settings, email_logs, email_templates
11. **Marketing** (4 tables): marketing_campaigns, promotional_codes, client_reviews, tour_waiting_list

### Settings & Master Data

12. **Master Data** (6 tables): cities, currencies, exchange_rates, seasons, seasonal_pricing, tax_rates
13. **Operations** (3 tables): pickup_locations, staff_schedule, service_availability
14. **System** (5 tables): operators, users, api_keys, number_sequences, audit_logs
15. **Other** (6 tables): bank_accounts, cancellation_policies, visa_requirements, passenger_visas, travel_insurance

---

## API Service Pattern

Each API service file should follow this structure:

```typescript
// lib/api/bookings.ts
import { apiClient } from './client';

export const bookingsApi = {
  // List all (with pagination, filters)
  getAll: async params => {
    return apiClient.get('/bookings', { params });
  },

  // Get single by ID
  getById: async id => {
    return apiClient.get(`/bookings/${id}`);
  },

  // Create new
  create: async data => {
    return apiClient.post('/bookings', data);
  },

  // Update existing
  update: async (id, data) => {
    return apiClient.put(`/bookings/${id}`, data);
  },

  // Delete (soft delete)
  delete: async id => {
    return apiClient.delete(`/bookings/${id}`);
  },

  // Custom endpoints
  getUpcoming: async () => {
    return apiClient.get('/bookings/upcoming');
  },
};
```

---

## React Query Hook Pattern

```typescript
// lib/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';

export const useBookings = params => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsApi.getAll(params),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
```

---

This structure is scalable, maintainable, and aligned with your 62-table backend.
