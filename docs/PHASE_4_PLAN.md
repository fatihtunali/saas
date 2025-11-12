# Phase 4: Bookings Management - Implementation Plan

**Project:** Tour Operations SaaS CRM
**Phase:** 4 of 7+
**Status:** 📋 PLANNING
**Priority:** 🔴 CRITICAL - CORE BUSINESS MODULE
**Estimated Duration:** 10-14 days
**Dependencies:** Phase 1 (Infrastructure), Phase 2 (Components), Phase 3 (Dashboard)

---

## Executive Summary

**Phase 4 is the MOST CRITICAL module of the entire Tour Operations SaaS CRM.**

Bookings Management is the **heart of the tour operations business**. This module handles the complete lifecycle of tour bookings from creation to completion, including:
- Client booking creation and management
- Service selection and allocation (hotels, vehicles, tours, guides, restaurants)
- Complex pricing calculations with markups and commissions
- Voucher generation for suppliers
- Payment tracking and reconciliation
- Document management (invoices, confirmations, vouchers)
- Complete booking lifecycle management

**Without this module, the CRM cannot function as a tour operations system.**

---

## Why Phase 4 is Critical

### Business Impact
1. **Revenue Generation:** All tour bookings and revenue flow through this module
2. **Service Coordination:** Manages relationships between clients, suppliers, and services
3. **Financial Tracking:** Handles all pricing, payments, receivables, and payables
4. **Operational Efficiency:** Streamlines booking creation from hours to minutes
5. **Document Automation:** Generates vouchers, invoices, and confirmations automatically

### Technical Complexity
- Most complex data model (7 related tables)
- Multi-step workflow with state management
- Complex business logic for pricing calculations
- Integration with multiple modules (clients, services, payments, documents)
- Real-time validation and availability checks

### User Impact
- **Tour Operators:** Primary daily workflow
- **Booking Managers:** Most frequently used feature
- **Finance Team:** Critical for payment tracking
- **Operations Team:** Essential for service coordination

---

## Goals & Success Criteria

### Primary Goals
1. Enable complete booking lifecycle management (create, view, edit, cancel)
2. Streamline service selection and allocation process
3. Automate pricing calculations with markups and commissions
4. Generate professional vouchers and documents
5. Track payment schedules and outstanding balances
6. Provide comprehensive booking search and filtering
7. Support bulk operations for efficiency

### Success Criteria
✅ Booking creation time reduced from 60+ minutes to under 10 minutes
✅ Zero calculation errors in pricing and commissions
✅ Voucher generation time reduced from 30 minutes to under 1 minute
✅ All booking states properly tracked and transitioned
✅ Payment reconciliation accurate to the penny
✅ Search and filter return results in under 2 seconds
✅ Mobile-responsive for field operations
✅ WCAG 2.1 AA accessibility compliance
✅ Zero data loss during multi-step workflows
✅ Audit trail for all booking modifications

---

## Phase 4 Architecture Overview

### Data Flow
```
Client Selection → Trip Details → Services Selection → Pricing → Payments → Vouchers → Completion
       ↓              ↓                ↓                 ↓          ↓          ↓
   Validation    Date Checks    Availability Check   Calculate  Schedule   Generate
                                                      Totals     Payments   Documents
```

### Module Dependencies
```
Bookings Module
├── Clients Module (Select/Create client)
├── Services Module
│   ├── Hotels (Room allocation, pricing)
│   ├── Vehicles (Transfer booking, pricing)
│   ├── Tours (SIC/PVT selection, pricing)
│   ├── Guides (Assignment, pricing)
│   ├── Restaurants (Reservation, pricing)
│   └── Extras (Entrance fees, activities)
├── Payments Module (Payment tracking)
├── Documents Module (Voucher generation)
└── Suppliers Module (Supplier coordination)
```

### State Management
```typescript
BookingState:
  - DRAFT: Initial creation, incomplete
  - QUOTATION: Converted to quotation
  - CONFIRMED: Client confirmed, services booked
  - IN_PROGRESS: Tour is happening
  - COMPLETED: Tour finished
  - CANCELLED: Booking cancelled
  - ARCHIVED: Historical record
```

---

## Task Breakdown

### Task 1: Bookings List Page (3 days)
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated Hours:** 18-24 hours

#### Overview
Create a comprehensive bookings list page with advanced filtering, search, sorting, and bulk operations using the DataTable component from Phase 2.

#### Deliverables

**1. Bookings List Component** (`frontend/src/app/(dashboard)/bookings/page.tsx`)

**Features:**
- DataTable integration with server-side pagination
- Real-time search across booking code, client name, destination
- Advanced filters:
  - Status (Draft, Confirmed, In Progress, Completed, Cancelled)
  - Date range (Travel dates, Booking dates, Creation dates)
  - Client type (B2C, B2B)
  - Destination (Multi-select dropdown)
  - Payment status (Paid, Partial, Pending, Overdue)
  - Booking source (Website, Phone, Email, Walk-in)
  - Agent/Staff member
- Column sorting (All columns sortable)
- Column visibility toggle
- Bulk operations:
  - Export to Excel (Selected or All)
  - Export to PDF (Selected or All)
  - Send confirmation emails (Selected)
  - Generate vouchers (Selected)
  - Change status (Selected)
  - Delete (Selected, with confirmation)
- Quick actions per row:
  - View details
  - Edit booking
  - Duplicate booking
  - Cancel booking
  - Generate voucher
  - Send email
  - View timeline
- Compact/Comfortable view toggle
- Bookmarks/Saved filters
- Recent searches

**Columns Display:**
1. Booking Code (e.g., BK-2024-001) - Clickable link
2. Client Name - With avatar/icon
3. Destination - With flag icon
4. Travel Dates - Formatted range
5. Passengers - Count with icon
6. Total Amount - Formatted currency with tooltip (breakdown)
7. Payment Status - Badge (Paid/Partial/Pending/Overdue)
8. Booking Status - Badge with color coding
9. Created Date - Relative time with tooltip
10. Actions - Dropdown menu

**UI/UX Features:**
- Loading skeleton during data fetch
- Empty state with "Create First Booking" CTA
- Error state with retry button
- Pagination controls (10/25/50/100 per page)
- Total count display
- Keyboard shortcuts (N for new, / for search)
- Responsive design (Card view on mobile)
- Sticky header
- Row hover effects
- Zebra striping (optional)

**2. Bookings API Integration** (`frontend/src/lib/api/bookings.ts`)

```typescript
// API Functions
getBookings(params: BookingsQueryParams): Promise<PaginatedBookings>
getBooking(id: string): Promise<Booking>
createBooking(data: CreateBookingInput): Promise<Booking>
updateBooking(id: string, data: UpdateBookingInput): Promise<Booking>
deleteBooking(id: string): Promise<void>
duplicateBooking(id: string): Promise<Booking>
cancelBooking(id: string, reason: string): Promise<Booking>
bulkDelete(ids: string[]): Promise<void>
bulkExport(ids: string[], format: 'excel' | 'pdf'): Promise<Blob>
```

**3. React Query Hooks** (`frontend/src/lib/hooks/useBookings.ts`)

```typescript
useBookings(params): UseQueryResult<PaginatedBookings>
useBooking(id): UseQueryResult<Booking>
useCreateBooking(): UseMutationResult
useUpdateBooking(): UseMutationResult
useDeleteBooking(): UseMutationResult
useCancelBooking(): UseMutationResult
useDuplicateBooking(): UseMutationResult
```

**4. TypeScript Types** (`frontend/src/types/bookings.ts`)

```typescript
interface Booking {
  id: string;
  bookingCode: string;
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  destination: string;
  startDate: string;
  endDate: string;
  passengerCount: number;
  adults: number;
  children: number;
  infants: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingSource: string;
  agentId?: string;
  agentName?: string;
  services: BookingService[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
}

type BookingStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';

interface BookingsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: BookingStatus[];
  paymentStatus?: PaymentStatus[];
  startDate?: string;
  endDate?: string;
  clientType?: 'B2C' | 'B2B';
  destination?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**5. Backend API Endpoints Required**

```
GET    /api/bookings                    # List bookings with filters
GET    /api/bookings/:id                # Get single booking
POST   /api/bookings                    # Create booking
PUT    /api/bookings/:id                # Update booking
DELETE /api/bookings/:id                # Delete booking
POST   /api/bookings/:id/duplicate      # Duplicate booking
POST   /api/bookings/:id/cancel         # Cancel booking
POST   /api/bookings/bulk-delete        # Bulk delete
POST   /api/bookings/bulk-export        # Bulk export
GET    /api/bookings/stats              # Booking statistics
GET    /api/bookings/search             # Advanced search
```

#### Technical Requirements
- Use DataTable component from Phase 2
- Server-side pagination for performance
- Debounced search (300ms)
- URL-based filter persistence (query params)
- Optimistic updates for mutations
- Error boundaries for graceful failures
- Loading states for all async operations
- Accessibility (ARIA labels, keyboard navigation)
- Responsive design (mobile, tablet, desktop)
- Export to Excel using xlsx library
- Export to PDF using jsPDF or react-pdf

#### Success Criteria
- ✅ List loads in under 2 seconds with 1000+ bookings
- ✅ Search returns results in under 500ms
- ✅ Filters work correctly with multiple selections
- ✅ Bulk operations complete without errors
- ✅ Exports generate correct data format
- ✅ Mobile view displays cards instead of table
- ✅ Zero TypeScript errors
- ✅ Accessibility score 95+

---

### Task 2: Create Booking Wizard (5 days)
**Priority:** CRITICAL
**Complexity:** VERY HIGH
**Estimated Hours:** 30-40 hours

#### Overview
Create a multi-step booking creation wizard that guides users through the complete booking process from client selection to final confirmation.

#### Wizard Architecture

```
Step 1: Client Selection     (Who is booking?)
   ↓
Step 2: Trip Details         (Where and when?)
   ↓
Step 3: Passengers Info      (Who is traveling?)
   ↓
Step 4: Services Selection   (What services to book?)
   ├── Hotels
   ├── Vehicles/Transfers
   ├── Tours (SIC/PVT)
   ├── Guides
   ├── Restaurants
   └── Extras
   ↓
Step 5: Pricing & Summary    (Review and confirm)
```

#### Step 1: Client Selection

**Component:** `frontend/src/components/features/bookings/wizard/ClientSelectionStep.tsx`

**Features:**
- Search existing clients (debounced)
- Client type filter (B2C / B2B)
- Quick create new client (inline form)
- Display client details:
  - Name, email, phone
  - Type (B2C/B2B)
  - Outstanding balance (if any)
  - Previous bookings count
  - Credit limit (for B2B)
  - Payment terms
- Client verification:
  - Check credit limit for B2B
  - Check outstanding payments
  - Warn if payment overdue
- Recently selected clients (quick access)

**UI Components:**
- ComboBox (searchable dropdown) for client search
- Card display for selected client
- Inline form for new client creation
- Alert for credit/payment warnings

**Validation:**
- Client must be selected
- For B2B: Check credit limit not exceeded
- Warn if outstanding payments exist

**Data Collected:**
```typescript
interface Step1Data {
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  email: string;
  phone: string;
  creditLimit?: number;
  outstandingBalance?: number;
}
```

---

#### Step 2: Trip Details

**Component:** `frontend/src/components/features/bookings/wizard/TripDetailsStep.tsx`

**Features:**
- Destination selection (searchable dropdown with countries/cities)
- Travel date range picker (start date, end date)
- Number of days calculation (auto-calculated)
- Passenger count:
  - Adults (required, minimum 1)
  - Children (optional, with age ranges)
  - Infants (optional, under 2 years)
- Room configuration:
  - Number of rooms
  - Room types (Single, Double, Twin, Triple, Suite)
  - Room occupancy (adults + children per room)
- Trip type:
  - Package Tour
  - Custom Itinerary
  - FIT (Free Independent Traveler)
  - Group Tour
- Booking source:
  - Website
  - Phone
  - Email
  - Walk-in
  - Referral
  - Agent
- Special requirements (textarea)
- Dietary requirements (checkboxes)
- Accessibility needs (checkboxes)

**UI Components:**
- DateRangePicker (from Phase 2)
- ComboBox for destination search
- Number inputs for passenger counts
- Dynamic room configuration builder
- Select for trip type and source
- Textarea for notes
- Checkbox groups for requirements

**Validation:**
- Start date must be in the future
- End date must be after start date
- At least 1 adult passenger required
- Room count must match passenger occupancy
- Destination is required
- Date range validation (minimum 1 day, maximum 90 days)

**Business Logic:**
- Calculate number of nights
- Auto-suggest room count based on passengers
- Validate room occupancy (max 4 per room for standard)
- Calculate child age categories
- Suggest similar destinations based on selection

**Data Collected:**
```typescript
interface Step2Data {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  numberOfNights: number;
  adults: number;
  children: number;
  infants: number;
  childAges?: number[];
  rooms: RoomConfiguration[];
  tripType: TripType;
  bookingSource: BookingSource;
  specialRequirements?: string;
  dietaryRequirements?: string[];
  accessibilityNeeds?: string[];
}

interface RoomConfiguration {
  roomType: 'Single' | 'Double' | 'Twin' | 'Triple' | 'Suite';
  adults: number;
  children: number;
}
```

---

#### Step 3: Passengers Information

**Component:** `frontend/src/components/features/bookings/wizard/PassengersStep.tsx`

**Features:**
- Dynamic passenger list (based on count from Step 2)
- Lead passenger designation
- For each passenger:
  - Title (Mr, Mrs, Ms, Dr, etc.)
  - First name (required)
  - Last name (required)
  - Date of birth (required)
  - Nationality (required)
  - Passport number (optional)
  - Passport expiry date (optional)
  - Email (optional, for booking confirmations)
  - Phone (optional)
  - Emergency contact (optional)
  - Special needs (optional)
  - Meal preference (optional)
  - Seat preference (optional)
- Age category auto-detection (Adult/Child/Infant based on DOB)
- Passport expiry warnings (if within 6 months of travel)
- Duplicate passenger check
- Import from previous bookings
- Copy details from lead passenger

**UI Components:**
- Accordion for each passenger
- Form fields for passenger details
- DatePicker for DOB and passport expiry
- ComboBox for nationality
- Copy/Import buttons
- Validation indicators

**Validation:**
- All required fields filled
- Valid date of birth (not in future, reasonable age)
- Passport expiry after travel end date (if provided)
- Valid email format
- Valid phone format
- Age matches passenger type (adult/child/infant)

**Business Logic:**
- Auto-calculate age from DOB
- Warn if passport expires within 6 months
- Validate nationality against visa requirements
- Check for duplicate names
- Auto-fill from client data (if available)

**Data Collected:**
```typescript
interface PassengerInfo {
  id: string;
  isLeadPassenger: boolean;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  ageCategory: 'Adult' | 'Child' | 'Infant';
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  specialNeeds?: string;
  mealPreference?: string;
  seatPreference?: string;
}

interface Step3Data {
  passengers: PassengerInfo[];
  leadPassenger: PassengerInfo;
}
```

---

#### Step 4: Services Selection (MOST COMPLEX STEP)

**Component:** `frontend/src/components/features/bookings/wizard/ServicesStep.tsx`

This step is broken down into sub-tabs:

##### Sub-Tab 4.1: Hotels

**Component:** `frontend/src/components/features/bookings/wizard/services/HotelSelection.tsx`

**Features:**
- Day-by-day hotel allocation interface
- For each night:
  - City/Location selection
  - Hotel search and selection
  - Room type selection
  - Meal plan (Room Only, BB, HB, FB, AI)
  - Number of rooms
  - Check-in date
  - Check-out date
  - Special requests
- Hotel details display:
  - Star rating
  - Address
  - Amenities
  - Photos
  - Map location
- Pricing calculation:
  - Per person per night pricing
  - Child pricing (age-based discounts)
  - Extra bed charges
  - Meal plan supplements
  - Total hotel cost
- Multi-hotel support (for multi-city tours)
- Same hotel for multiple nights
- Quick actions:
  - Copy hotel to next night
  - Apply to all nights
  - Clear selection

**Pricing Logic:**
```typescript
// Hotel Pricing Calculation
Total Hotel Cost =
  (Adult Price × Adults × Nights) +
  (Child Price × Children × Nights) +
  (Extra Bed × Extra Beds × Nights) +
  (Meal Supplement × Persons × Nights)
```

**UI Components:**
- Timeline view for multi-night stays
- Hotel search with autocomplete
- Image gallery for hotel photos
- Room configuration builder
- Pricing preview panel

**Data Collected:**
```typescript
interface HotelService {
  id: string;
  hotelId: string;
  hotelName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  rooms: HotelRoom[];
  totalCost: number;
  supplierCost: number;
  markup: number;
  specialRequests?: string;
}

interface HotelRoom {
  roomType: string;
  mealPlan: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';
  adults: number;
  children: number;
  pricePerNight: number;
  totalPrice: number;
}
```

##### Sub-Tab 4.2: Vehicles/Transfers

**Component:** `frontend/src/components/features/bookings/wizard/services/VehicleSelection.tsx`

**Features:**
- Transfer type selection:
  - Point-to-point (Airport to Hotel)
  - Hourly rental (4 hours, 8 hours, 12 hours)
  - Full day rental
  - Multi-day rental
- For each transfer:
  - Route (From → To)
  - Date and time
  - Vehicle type (Sedan, SUV, Van, Bus)
  - Passenger capacity
  - Luggage capacity
  - Driver language
  - Special requirements
- Vehicle details:
  - Photo
  - Capacity
  - Features (AC, WiFi, etc.)
  - Pricing
- Multi-transfer support
- Return trip option (auto-create reverse transfer)
- Meet & Greet service option

**Pricing Logic:**
```typescript
// Transfer Pricing
Point-to-Point = Fixed route price
Hourly Rental = Hourly rate × Hours
Full Day = Daily rate × Days

Total = Base Price + Extra Hours + Tolls + Parking + Driver Allowance
```

**Data Collected:**
```typescript
interface VehicleService {
  id: string;
  vehicleId: string;
  vehicleType: string;
  transferType: 'Point-to-Point' | 'Hourly' | 'Full Day';
  route: {
    from: string;
    to: string;
  };
  date: string;
  time: string;
  duration?: number; // for hourly/full day
  passengerCapacity: number;
  driverLanguage: string;
  meetAndGreet: boolean;
  totalCost: number;
  supplierCost: number;
  markup: number;
  specialRequests?: string;
}
```

##### Sub-Tab 4.3: Tours & Activities

**Component:** `frontend/src/components/features/bookings/wizard/services/TourSelection.tsx`

**Features:**
- Tour search and filter:
  - By city/destination
  - By category (Cultural, Adventure, Nature, etc.)
  - By duration (Half day, Full day, Multi-day)
  - By language
- Tour type selection:
  - SIC (Seat in Coach / Join-in)
  - PVT (Private tour)
- For each tour:
  - Tour name and description
  - Date and time
  - Duration
  - Meeting point
  - Language
  - Number of participants
  - Special requirements
- Tour details:
  - Itinerary
  - Inclusions
  - Exclusions
  - Photos
  - Reviews/ratings
- Pricing:
  - SIC: Per person pricing (fixed)
  - PVT: Slab pricing based on group size (2-4-6-8-10+ pax)
- Multi-tour support (different tours on different days)

**Pricing Logic:**
```typescript
// SIC Tour Pricing
SIC Total = Per Person Price × Number of Persons

// PVT Tour Pricing (Slab-based)
if (persons >= 1 && persons <= 2) price = slab_2_pax;
if (persons >= 3 && persons <= 4) price = slab_4_pax;
if (persons >= 5 && persons <= 6) price = slab_6_pax;
if (persons >= 7 && persons <= 8) price = slab_8_pax;
if (persons >= 9) price = slab_10plus_pax;

PVT Total = Slab Price (not per person, total for group)
```

**Data Collected:**
```typescript
interface TourService {
  id: string;
  tourId: string;
  tourName: string;
  tourType: 'SIC' | 'PVT';
  date: string;
  time: string;
  duration: string;
  language: string;
  participants: number;
  meetingPoint: string;
  totalCost: number;
  supplierCost: number;
  markup: number;
  specialRequests?: string;
}
```

##### Sub-Tab 4.4: Guides

**Component:** `frontend/src/components/features/bookings/wizard/services/GuideSelection.tsx`

**Features:**
- Guide search and assignment
- For each guide:
  - Guide name
  - Language(s)
  - Specialization
  - Date and time
  - Duration (hours/days)
  - Service type (City tour, Airport transfer, Full day, etc.)
- Guide details:
  - Photo
  - Bio
  - Languages spoken
  - Specializations
  - Ratings
- Pricing:
  - Hourly rate
  - Half-day rate
  - Full-day rate
  - Additional languages surcharge

**Data Collected:**
```typescript
interface GuideService {
  id: string;
  guideId: string;
  guideName: string;
  languages: string[];
  date: string;
  startTime: string;
  duration: number;
  serviceType: string;
  totalCost: number;
  supplierCost: number;
  markup: number;
}
```

##### Sub-Tab 4.5: Restaurants

**Component:** `frontend/src/components/features/bookings/wizard/services/RestaurantSelection.tsx`

**Features:**
- Restaurant search and booking
- For each reservation:
  - Restaurant name
  - Date and time
  - Number of guests
  - Cuisine type
  - Meal type (Lunch, Dinner)
  - Special requests (dietary, seating preference)
- Restaurant details:
  - Photos
  - Menu preview
  - Cuisine type
  - Price range
  - Location
- Pricing:
  - Per person pricing
  - Set menu pricing
  - À la carte budget

**Data Collected:**
```typescript
interface RestaurantService {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  mealType: 'Lunch' | 'Dinner';
  totalCost: number;
  supplierCost: number;
  markup: number;
  specialRequests?: string;
}
```

##### Sub-Tab 4.6: Extras

**Component:** `frontend/src/components/features/bookings/wizard/services/ExtrasSelection.tsx`

**Features:**
- Additional services:
  - Entrance fees (museums, attractions)
  - Travel insurance
  - Visa assistance
  - SIM cards
  - Airport lounge access
  - Photography services
  - Special event tickets
  - Other miscellaneous items
- For each extra:
  - Service name
  - Quantity
  - Unit price
  - Total price

**Data Collected:**
```typescript
interface ExtraService {
  id: string;
  serviceName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplierCost: number;
  markup: number;
  description?: string;
}
```

**Services Step Summary Component:**
- Selected services summary panel (sticky sidebar)
- Real-time total cost calculation
- Service count by type
- Edit/Remove service actions
- Cost breakdown preview

---

#### Step 5: Pricing & Summary

**Component:** `frontend/src/components/features/bookings/wizard/PricingSummaryStep.tsx`

**Features:**
- Complete booking summary
- Client information review
- Trip details review
- Passengers list review
- Services breakdown:
  - Hotels summary with costs
  - Transfers summary with costs
  - Tours summary with costs
  - Guides summary with costs
  - Restaurants summary with costs
  - Extras summary with costs

**Pricing Calculation Section:**

1. **Base Costs:**
   ```
   Hotel Costs:        $X,XXX
   Transfer Costs:     $X,XXX
   Tour Costs:         $X,XXX
   Guide Costs:        $XXX
   Restaurant Costs:   $XXX
   Extra Costs:        $XXX
   ─────────────────────────
   Subtotal:           $X,XXX
   ```

2. **Markup & Commission:**
   ```
   Subtotal:                           $X,XXX
   + Markup (XX%):                    +$XXX
   ─────────────────────────────────────────
   Total Before Commission:            $X,XXX
   - Agent Commission (XX%):          -$XXX
   ─────────────────────────────────────────
   Client Payable Amount:              $X,XXX
   ```

3. **Payment Terms:**
   - Payment schedule setup:
     - Deposit amount (default 30%)
     - Deposit due date
     - Balance amount (auto-calculated)
     - Balance due date (before travel start)
   - Payment method preferences
   - Currency selection
   - Payment instructions

4. **Profit Margin Display:**
   ```
   Client Pays:        $X,XXX
   Supplier Costs:     $X,XXX
   Agent Commission:   $XXX
   ─────────────────────────
   Gross Profit:       $XXX
   Profit Margin:      XX%
   ```

**Additional Options:**
- Internal notes (for staff only)
- Client-visible notes
- Terms and conditions acceptance
- Cancellation policy display
- Booking confirmation method (Email/SMS/Both)
- Assign to staff member
- Set booking priority (Normal/High/Urgent)

**Final Actions:**
- Save as Draft (can edit later)
- Create Quotation (send to client for approval)
- Confirm Booking (final confirmation)
- Cancel and discard

**Validation:**
- All steps completed
- At least one service selected
- Payment schedule totals match booking total
- Deposit + Balance = Total Amount
- Terms accepted (if creating confirmed booking)

**Data Collected:**
```typescript
interface Step5Data {
  subtotal: number;
  markup: number;
  markupPercentage: number;
  totalBeforeCommission: number;
  commission: number;
  commissionPercentage: number;
  totalAmount: number;
  currency: string;
  supplierCosts: number;
  grossProfit: number;
  profitMarginPercentage: number;
  paymentSchedule: {
    depositAmount: number;
    depositDueDate: string;
    balanceAmount: number;
    balanceDueDate: string;
  };
  paymentMethod: string;
  internalNotes?: string;
  clientNotes?: string;
  assignedTo?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  termsAccepted: boolean;
}
```

#### Wizard State Management

**Component:** `frontend/src/components/features/bookings/wizard/BookingWizard.tsx`

**State Management Strategy:**
- Use React Context for wizard state
- Zustand store for complex state (optional)
- Form state persistence in localStorage (auto-save every 30 seconds)
- Step validation before navigation
- Unsaved changes warning on exit

**Wizard Navigation:**
- Progress indicator (show current step / total steps)
- Previous/Next buttons
- Jump to step (if previous steps completed)
- Save and continue later
- Cancel with confirmation

**Error Handling:**
- Field-level validation
- Step-level validation
- API error handling
- Network error handling
- Retry mechanism for failed API calls

**Performance Optimization:**
- Lazy load service data
- Debounced search inputs
- Optimistic UI updates
- Request cancellation on step change
- Memoize expensive calculations

#### Technical Requirements
- Multi-step form with React Hook Form
- Zod validation schemas for each step
- Context API for wizard state
- localStorage for persistence
- Responsive design (mobile-first)
- Progress save indicators
- Auto-save functionality
- Accessibility (ARIA labels, keyboard navigation)
- Error boundaries
- Loading states for all async operations

#### Success Criteria
- ✅ Wizard completes in under 10 minutes (user testing)
- ✅ Zero data loss during navigation
- ✅ All calculations accurate to 2 decimal places
- ✅ Auto-save works reliably
- ✅ Validation prevents invalid data
- ✅ Mobile-responsive and usable
- ✅ Zero TypeScript errors
- ✅ Accessibility score 95+

---

### Task 3: Booking Details Page (3 days)
**Priority:** HIGH
**Complexity:** HIGH
**Estimated Hours:** 18-24 hours

#### Overview
Create a comprehensive booking details page that displays all information about a booking and allows editing, status management, and document generation.

#### Page Structure

**Layout:** Tabbed interface with sidebar

**Sidebar (Sticky):**
- Booking code (large, prominent)
- Status badge
- Client name and avatar
- Destination and dates
- Quick stats:
  - Total amount
  - Paid amount
  - Balance due
  - Days until travel
- Quick actions:
  - Edit booking
  - Cancel booking
  - Duplicate booking
  - Print
  - Export PDF
  - Send email
  - Generate vouchers
  - View timeline

**Main Content Area (Tabs):**

##### Tab 1: Overview

**Component:** `frontend/src/components/features/bookings/details/OverviewTab.tsx`

**Sections:**
1. **Client Information**
   - Name, type (B2C/B2B)
   - Email, phone
   - Address
   - Emergency contact
   - Link to client profile

2. **Trip Details**
   - Destination
   - Travel dates (start, end, duration)
   - Passenger breakdown (adults, children, infants)
   - Trip type
   - Booking source

3. **Status Information**
   - Current status with badge
   - Status history timeline
   - Payment status
   - Confirmation status
   - Voucher generation status

4. **Financial Summary**
   - Total amount
   - Paid amount
   - Balance due
   - Payment due date
   - Payment method
   - Currency

5. **Assigned Staff**
   - Booking created by
   - Assigned to
   - Last modified by

6. **Important Dates**
   - Booking created date
   - Last modified date
   - Deposit due date
   - Balance due date
   - Travel start date
   - Confirmation sent date

7. **Notes**
   - Internal notes (staff only)
   - Client notes (visible to client)

**Features:**
- Edit inline (for specific fields)
- Copy information (click to copy)
- Status change dropdown
- Assign to staff dropdown
- Notes editor

##### Tab 2: Itinerary

**Component:** `frontend/src/components/features/bookings/details/ItineraryTab.tsx`

**Layout:** Day-by-day timeline view

**For Each Day:**
- Day number and date
- All services scheduled for that day:
  - Hotels (check-in/out)
  - Transfers (pickup time, route)
  - Tours (time, duration, meeting point)
  - Meals (restaurant, time)
  - Activities
- Timeline visualization (morning, afternoon, evening)
- Map integration showing locations
- Weather forecast (for upcoming dates)
- Notes for the day

**Features:**
- Print itinerary
- Export to PDF (formatted for client)
- Send itinerary email
- Add service to day
- Reorder services (drag and drop)
- Add notes to specific day
- View day in calendar

**UI:**
- Timeline component with icons
- Collapsible day sections
- Photo gallery for destinations
- Map view toggle
- Compact/Detailed view toggle

##### Tab 3: Services

**Component:** `frontend/src/components/features/bookings/details/ServicesTab.tsx`

**Sub-tabs:**
1. All Services (combined view)
2. Hotels
3. Transfers
4. Tours
5. Extras

**For Each Service Type:**
- DataTable with service list
- Columns:
  - Service name/description
  - Date/Time
  - Quantity/Pax
  - Supplier
  - Cost
  - Status (Booked/Confirmed/Completed)
  - Actions
- Total cost per service type
- Actions:
  - Add new service
  - Edit service
  - Remove service
  - Change supplier
  - Mark as confirmed
  - Generate voucher

**Service Details Modal:**
- Full service information
- Supplier details
- Contact information
- Confirmation status
- Voucher status
- Notes

**Features:**
- Real-time pricing updates
- Service availability check
- Supplier communication log
- Confirmation tracking
- Voucher generation

##### Tab 4: Passengers

**Component:** `frontend/src/components/features/bookings/details/PassengersTab.tsx`

**Display:**
- DataTable with passenger list
- Columns:
  - Name
  - Type (Adult/Child/Infant)
  - Age
  - Nationality
  - Passport number
  - Passport expiry
  - Special needs
  - Actions

**Passenger Details:**
- Full personal information
- Passport details
- Emergency contact
- Dietary requirements
- Accessibility needs
- Medical information
- Seat preferences

**Features:**
- Add passenger
- Edit passenger
- Remove passenger
- Export passenger list
- Passport expiry alerts
- Visa requirement check

##### Tab 5: Payments

**Component:** `frontend/src/components/features/bookings/details/PaymentsTab.tsx`

**Sections:**

1. **Payment Summary**
   - Total booking amount
   - Total paid
   - Balance outstanding
   - Payment progress bar
   - Payment schedule chart

2. **Payment Schedule**
   - Table with scheduled payments:
     - Description (Deposit/Balance/Installment)
     - Amount
     - Due date
     - Status (Paid/Pending/Overdue)
     - Actions

3. **Payment History**
   - Table with all payments received:
     - Date
     - Amount
     - Payment method
     - Reference number
     - Received by
     - Receipt

4. **Record New Payment**
   - Payment amount
   - Payment date
   - Payment method
   - Reference number
   - Notes
   - Upload receipt/proof

**Features:**
- Payment reminder emails
- Generate payment receipt
- Refund processing
- Payment method tracking
- Payment reconciliation
- Export payment history

##### Tab 6: Documents

**Component:** `frontend/src/components/features/bookings/details/DocumentsTab.tsx`

**Document Types:**

1. **Vouchers**
   - Hotel vouchers
   - Transfer vouchers
   - Tour vouchers
   - Restaurant vouchers
   - Status: Draft/Sent/Confirmed

2. **Invoices**
   - Booking invoice
   - Payment receipts
   - Credit notes
   - Status: Draft/Sent/Paid

3. **Confirmations**
   - Booking confirmation
   - Service confirmations
   - Supplier confirmations

4. **Other Documents**
   - Itinerary
   - Terms & Conditions
   - Passport copies
   - Visa documents
   - Travel insurance

**Features:**
- Generate document (from template)
- Preview document
- Download PDF
- Send via email
- Track send status
- Upload custom documents
- Document version history

**Document Management:**
- Organize by type
- Search documents
- Filter by status
- Bulk download
- Document templates

##### Tab 7: Timeline/Activity Log

**Component:** `frontend/src/components/features/bookings/details/TimelineTab.tsx`

**Display:**
- Chronological activity log
- For each activity:
  - Icon (based on activity type)
  - Description
  - User who performed action
  - Timestamp
  - Details/Changes

**Activity Types:**
- Booking created
- Booking updated
- Status changed
- Service added/removed
- Payment received
- Document generated
- Email sent
- Notes added
- Assignment changed

**Features:**
- Filter by activity type
- Filter by date range
- Filter by user
- Search activities
- Export timeline
- Real-time updates

##### Tab 8: Communication

**Component:** `frontend/src/components/features/bookings/details/CommunicationTab.tsx`

**Sections:**

1. **Email History**
   - All emails sent/received
   - Subject, date, recipient
   - Email content preview
   - Attachments
   - Open/Click tracking

2. **SMS History**
   - All SMS sent
   - Message content
   - Date, status

3. **Internal Messages**
   - Staff communication about booking
   - Threaded conversations
   - @mentions

4. **Compose New**
   - Send email to client
   - Send SMS
   - Add internal note

**Features:**
- Email templates
- SMS templates
- Attachment management
- Send tracking
- Response tracking

#### Booking Actions

**Edit Booking:**
- Open wizard in edit mode
- Pre-fill all existing data
- Track changes
- Audit trail
- Validation before save

**Cancel Booking:**
- Cancellation reason (required)
- Cancellation date
- Refund calculation (based on policy)
- Notify suppliers
- Update status
- Generate credit note
- Confirmation dialog

**Duplicate Booking:**
- Copy all data except dates
- Allow date modification
- Allow service modification
- Create new booking code
- Confirmation dialog

**Export PDF:**
- Full booking details
- Itinerary
- Services breakdown
- Payment information
- Formatted for printing

**Send Email:**
- Select template
- Customize content
- Attach documents
- Preview before send
- Track delivery

**Generate Vouchers:**
- Select services
- Generate individual or bulk
- Preview vouchers
- Download/Send
- Track generation

#### Technical Requirements
- Tabbed interface with URL routing (`/bookings/:id/overview`, `/bookings/:id/services`, etc.)
- Real-time data updates
- Optimistic UI updates
- Error boundaries
- Loading states
- Permission-based actions
- Audit logging
- Accessibility
- Responsive design
- Print-friendly layouts

#### Success Criteria
- ✅ Page loads in under 2 seconds
- ✅ All tabs load data on demand
- ✅ Edit operations complete without errors
- ✅ Real-time updates work reliably
- ✅ Documents generate correctly
- ✅ Email sending works 100%
- ✅ Mobile-responsive
- ✅ Zero TypeScript errors
- ✅ Accessibility score 95+

---

### Task 4: Voucher Generation System (2 days)
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated Hours:** 12-16 hours

#### Overview
Create a professional voucher generation system that produces PDF vouchers for all service types.

#### Voucher Types

##### 1. Hotel Voucher

**Template:** `frontend/src/templates/vouchers/HotelVoucher.tsx`

**Content:**
- Company logo and header
- Voucher number (unique)
- Issue date
- Guest information:
  - Lead passenger name
  - Number of guests
  - Nationality
- Hotel information:
  - Hotel name, address
  - Phone, email
  - Star rating
- Reservation details:
  - Check-in date and time
  - Check-out date and time
  - Number of nights
  - Room type and count
  - Meal plan
  - Special requests
- Important notes:
  - Confirmation number
  - Payment status
  - Cancellation policy
  - Hotel amenities
- Company footer with contacts

##### 2. Transfer Voucher

**Template:** `frontend/src/templates/vouchers/TransferVoucher.tsx`

**Content:**
- Company logo and header
- Voucher number
- Issue date
- Passenger information:
  - Lead passenger name
  - Number of passengers
  - Contact number
- Transfer details:
  - Date and time
  - Pickup location (address)
  - Drop-off location (address)
  - Vehicle type
  - Driver name (if available)
  - Driver contact
- Service details:
  - Flight number (if airport transfer)
  - Meeting point instructions
  - Special requirements
- Important notes:
  - Waiting time policy
  - Luggage information
  - Cancellation policy
- Company footer

##### 3. Tour Voucher

**Template:** `frontend/src/templates/vouchers/TourVoucher.tsx`

**Content:**
- Company logo and header
- Voucher number
- Issue date
- Guest information
- Tour details:
  - Tour name
  - Date and time
  - Duration
  - Meeting point (address, map)
  - Tour type (SIC/PVT)
  - Language
  - Number of participants
- Tour inclusions
- Tour exclusions
- What to bring
- Important notes
- Company footer

##### 4. Restaurant Voucher

**Template:** `frontend/src/templates/vouchers/RestaurantVoucher.tsx`

**Content:**
- Company logo and header
- Voucher number
- Issue date
- Guest information
- Restaurant details:
  - Restaurant name, address
  - Phone
  - Reservation date and time
  - Number of guests
  - Meal type
  - Menu (if set menu)
  - Dietary requirements
- Important notes
- Company footer

##### 5. Generic Service Voucher

**Template:** `frontend/src/templates/vouchers/GenericVoucher.tsx`

**Content:**
- Company logo and header
- Voucher number
- Issue date
- Guest information
- Service details (flexible fields)
- Important notes
- Company footer

#### Voucher Generation Features

**Generation Options:**
1. Single voucher (one service)
2. Bulk vouchers (multiple services)
3. All vouchers for booking
4. Vouchers by type (all hotels, all transfers, etc.)

**Output Options:**
1. Preview in browser
2. Download individual PDF
3. Download ZIP of all PDFs
4. Send via email (to client/supplier)
5. Print directly

**Voucher Management:**
- Track generation status
- Version control
- Regenerate if changes made
- Cancel/Void vouchers
- Resend vouchers

**PDF Generation:**
- Use `react-pdf` or `jsPDF`
- Professional templates
- Company branding
- QR code with booking reference
- Barcode for verification
- Watermark (if needed)

#### Technical Implementation

**Components:**
```typescript
// Voucher Generator Component
<VoucherGenerator
  bookingId={bookingId}
  serviceId={serviceId}
  serviceType="hotel"
  onGenerate={(pdf) => handleGenerate(pdf)}
  onError={(error) => handleError(error)}
/>

// Voucher Preview Component
<VoucherPreview
  voucher={voucherData}
  template="hotel"
  onDownload={() => {}}
  onEmail={() => {}}
  onPrint={() => {}}
/>

// Bulk Voucher Generator
<BulkVoucherGenerator
  bookingId={bookingId}
  services={selectedServices}
  onComplete={(vouchers) => {}}
/>
```

**API Integration:**
```typescript
// API Functions
generateVoucher(serviceId, serviceType): Promise<VoucherPDF>
generateBulkVouchers(bookingId, serviceIds): Promise<VoucherPDF[]>
getVoucherHistory(bookingId): Promise<VoucherHistory[]>
sendVoucherEmail(voucherId, recipient): Promise<void>
voidVoucher(voucherId, reason): Promise<void>
```

#### Success Criteria
- ✅ Vouchers generate in under 3 seconds
- ✅ PDF quality is print-ready (300 DPI)
- ✅ All voucher types supported
- ✅ Bulk generation works reliably
- ✅ Email delivery 100% success rate
- ✅ Templates are customizable
- ✅ QR codes work correctly
- ✅ Mobile-responsive preview

---

## Backend API Requirements

### Database Tables (Already Defined in Project)

**Core Booking Tables:**
1. `bookings` - Main booking records
2. `booking_passengers` - Passenger information
3. `booking_services` - All services linked to booking
4. `booking_hotels` - Hotel service details
5. `booking_transfers` - Transfer service details
6. `booking_tours` - Tour service details
7. `booking_extras` - Extra service details

**Related Tables:**
- `clients` - Client information
- `hotels` - Hotel inventory
- `vehicles` - Vehicle inventory
- `tours` - Tour packages
- `guides` - Guide information
- `restaurants` - Restaurant information
- `suppliers` - Supplier information
- `payments` - Payment records
- `documents` - Document records

### API Endpoints Summary

**Bookings:**
```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id
POST   /api/bookings/:id/duplicate
POST   /api/bookings/:id/cancel
GET    /api/bookings/:id/timeline
GET    /api/bookings/:id/documents
POST   /api/bookings/:id/documents
GET    /api/bookings/stats
```

**Booking Services:**
```
GET    /api/bookings/:id/services
POST   /api/bookings/:id/services
PUT    /api/bookings/:id/services/:serviceId
DELETE /api/bookings/:id/services/:serviceId
POST   /api/bookings/:id/services/bulk
```

**Booking Passengers:**
```
GET    /api/bookings/:id/passengers
POST   /api/bookings/:id/passengers
PUT    /api/bookings/:id/passengers/:passengerId
DELETE /api/bookings/:id/passengers/:passengerId
```

**Booking Payments:**
```
GET    /api/bookings/:id/payments
POST   /api/bookings/:id/payments
PUT    /api/bookings/:id/payments/:paymentId
DELETE /api/bookings/:id/payments/:paymentId
GET    /api/bookings/:id/payment-schedule
PUT    /api/bookings/:id/payment-schedule
```

**Vouchers:**
```
POST   /api/bookings/:id/vouchers/generate
GET    /api/bookings/:id/vouchers
POST   /api/vouchers/:id/send
POST   /api/vouchers/:id/void
GET    /api/vouchers/:id/download
```

**Services Inventory:**
```
GET    /api/hotels
GET    /api/hotels/:id
GET    /api/hotels/search
GET    /api/vehicles
GET    /api/vehicles/:id
GET    /api/tours
GET    /api/tours/:id
GET    /api/guides
GET    /api/restaurants
```

---

## Technology Stack

### Frontend (Already Established)
- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.3 (strict mode)
- **UI Library:** React 18
- **Forms:** React Hook Form + Zod validation
- **State:** React Query (server state) + Context/Zustand (client state)
- **Components:** shadcn/ui + Radix UI (from Phase 2)
- **Tables:** @tanstack/react-table (from Phase 2)
- **Styling:** Tailwind CSS 3.4
- **PDF Generation:** react-pdf or jsPDF
- **Excel Export:** xlsx library
- **Date Handling:** date-fns

### Backend (Already Established)
- **Runtime:** Node.js
- **Framework:** Express.js 5.1
- **Database:** PostgreSQL (62 tables)
- **Authentication:** JWT
- **Validation:** express-validator
- **File Upload:** multer
- **Email:** nodemailer
- **PDF Generation:** puppeteer or pdfkit

---

## Development Workflow

### Phase 4 Execution Plan

**Week 1 (Days 1-5):**
- Days 1-3: Task 1 - Bookings List Page
- Days 4-5: Task 2 - Wizard Steps 1-2

**Week 2 (Days 6-10):**
- Days 6-9: Task 2 - Wizard Steps 3-5
- Day 10: Task 3 - Booking Details (Overview, Itinerary tabs)

**Week 3 (Days 11-14):**
- Days 11-12: Task 3 - Booking Details (remaining tabs)
- Days 13-14: Task 4 - Voucher Generation

### Agent Assignment Strategy

**Approach:** Assign specialized agents to work in parallel where possible

**Recommended Agent Distribution:**

**Agent Group 1 (Bookings List):**
- Agent 1A: API Integration + Types
- Agent 1B: List UI + Filters
- Agent 1C: Bulk Operations + Export

**Agent Group 2 (Wizard):**
- Agent 2A: Wizard Shell + Step 1-2
- Agent 2B: Step 3 (Passengers)
- Agent 2C: Step 4.1-4.2 (Hotels + Vehicles)
- Agent 2D: Step 4.3-4.6 (Tours + Extras)
- Agent 2E: Step 5 (Pricing + Summary)

**Agent Group 3 (Details Page):**
- Agent 3A: Page Shell + Overview + Itinerary
- Agent 3B: Services + Passengers + Payments
- Agent 3C: Documents + Timeline + Communication

**Agent Group 4 (Vouchers):**
- Agent 4A: Voucher Templates (Hotel + Transfer)
- Agent 4B: Voucher Templates (Tour + Restaurant)
- Agent 4C: Generation + Management System

### Parallel Execution Matrix

| Week | Days | Agents Working in Parallel | Tasks |
|------|------|---------------------------|-------|
| 1 | 1-3 | 1A, 1B, 1C | Bookings List (all sub-tasks) |
| 1 | 4-5 | 2A | Wizard Steps 1-2 |
| 2 | 6-7 | 2B, 2C | Wizard Steps 3, 4.1-4.2 |
| 2 | 8-9 | 2D, 2E | Wizard Steps 4.3-4.6, Step 5 |
| 2 | 10 | 3A | Details Page (Shell + 2 tabs) |
| 3 | 11-12 | 3B, 3C | Details Page (remaining tabs) |
| 3 | 13-14 | 4A, 4B, 4C | Vouchers (all sub-tasks) |

**Total Agents Needed:** 13 specialized agents
**Total Duration:** 14 days (with parallel execution)

---

## Quality Standards

### Code Quality
- ✅ TypeScript strict mode
- ✅ Zero `any` types
- ✅ ESLint rules passing
- ✅ Prettier formatting
- ✅ Component documentation (JSDoc)
- ✅ Unit tests for calculations
- ✅ Integration tests for workflows
- ✅ E2E tests for critical paths

### Performance Standards
- ✅ Page load time < 2 seconds
- ✅ Search response time < 500ms
- ✅ Form submission time < 1 second
- ✅ PDF generation time < 3 seconds
- ✅ Bulk operations scalable to 100+ items
- ✅ No memory leaks
- ✅ Optimized bundle size

### UX Standards
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA accessibility
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Touch-friendly on mobile/tablet
- ✅ Loading states for all async operations
- ✅ Error messages user-friendly
- ✅ Confirmation dialogs for destructive actions

### Security Standards
- ✅ Input validation (client + server)
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ Authentication required
- ✅ Authorization checks
- ✅ Audit trail for all changes
- ✅ Sensitive data encryption

---

## Testing Strategy

### Manual Testing Checklist

**Bookings List:**
- [ ] List displays correctly with data
- [ ] Pagination works
- [ ] Search returns accurate results
- [ ] Filters work individually and combined
- [ ] Sorting works on all columns
- [ ] Bulk delete works
- [ ] Export to Excel works
- [ ] Export to PDF works
- [ ] Mobile view renders cards
- [ ] Responsive on all screen sizes

**Booking Wizard:**
- [ ] Step navigation works
- [ ] Data persists between steps
- [ ] Validation works on all fields
- [ ] Auto-save works
- [ ] Client selection works
- [ ] Date picker works correctly
- [ ] Passenger form validates ages
- [ ] Service selection adds to cart
- [ ] Pricing calculates correctly
- [ ] Final submission creates booking
- [ ] Draft save works
- [ ] Cancel discards data

**Booking Details:**
- [ ] All tabs load correctly
- [ ] Edit functions work
- [ ] Status changes work
- [ ] Payment recording works
- [ ] Document generation works
- [ ] Email sending works
- [ ] Timeline updates in real-time
- [ ] Responsive on all devices

**Vouchers:**
- [ ] All voucher types generate correctly
- [ ] PDF quality is print-ready
- [ ] Bulk generation works
- [ ] Email delivery works
- [ ] QR codes scan correctly
- [ ] Templates are customizable

### Automated Testing

**Unit Tests:**
- Pricing calculation functions
- Date calculation functions
- Validation functions
- Formatting functions
- State management logic

**Integration Tests:**
- API integration
- Form submission flows
- Multi-step wizard completion
- Payment processing
- Document generation

**E2E Tests (Critical Paths):**
1. Complete booking creation workflow
2. Edit existing booking
3. Cancel booking with refund
4. Generate and send vouchers
5. Record payment and update status
6. Search and filter bookings
7. Export bookings to Excel/PDF

---

## Risk Management

### Identified Risks

**1. Complexity Risk**
- **Risk:** Booking wizard is very complex, prone to bugs
- **Mitigation:** Break into smaller components, extensive testing, user feedback

**2. Performance Risk**
- **Risk:** Large datasets slow down list page
- **Mitigation:** Server-side pagination, debounced search, optimized queries

**3. Data Integrity Risk**
- **Risk:** Calculation errors in pricing
- **Mitigation:** Unit tests for all calculations, validation on client and server

**4. User Error Risk**
- **Risk:** Users make mistakes in data entry
- **Mitigation:** Clear validation messages, confirmation dialogs, undo functionality

**5. Integration Risk**
- **Risk:** Services module not ready
- **Mitigation:** Mock data for development, parallel development

**6. Timeline Risk**
- **Risk:** Scope too large for 14 days
- **Mitigation:** Parallel agent execution, MVP approach, prioritize core features

### Contingency Plans

**If Timeline Slips:**
- Reduce scope to MVP (core features only)
- Extend timeline by 3-5 days
- Reallocate agents from completed tasks

**If Technical Blockers:**
- Escalate to senior developer
- Use alternative approach
- Simplify feature if necessary

**If Agent Failures:**
- Reassign task to backup agent
- Senior developer intervention
- Reduce task scope

---

## Success Metrics

### Quantitative Metrics
- **Booking Creation Time:** < 10 minutes (target: 8 minutes)
- **List Page Load Time:** < 2 seconds (target: 1.5 seconds)
- **Search Response Time:** < 500ms (target: 300ms)
- **PDF Generation Time:** < 3 seconds (target: 2 seconds)
- **Mobile Usability Score:** > 90/100
- **Accessibility Score:** > 95/100
- **TypeScript Error Count:** 0
- **Unit Test Coverage:** > 80%
- **E2E Test Coverage:** 100% of critical paths

### Qualitative Metrics
- User satisfaction with wizard UX (feedback from testing)
- Staff efficiency improvement (measured in time saved)
- Reduction in data entry errors (before/after comparison)
- Ease of finding bookings (user testing)
- Document quality (client feedback)

### Business Metrics
- **Revenue Impact:** Enable $X revenue per month through bookings
- **Operational Efficiency:** Reduce booking time by 80%
- **Customer Satisfaction:** Improve by X% (faster confirmations)
- **Staff Productivity:** Handle 3x more bookings with same staff
- **Error Reduction:** 90% reduction in pricing errors

---

## Documentation Deliverables

### Technical Documentation
1. **API Documentation** - All endpoints with examples
2. **Component Documentation** - JSDoc for all components
3. **Type Definitions** - Complete TypeScript types
4. **Database Schema** - Booking tables relationships
5. **Calculation Logic** - Detailed pricing formulas

### User Documentation
1. **User Guide** - How to create bookings
2. **Admin Guide** - How to manage bookings
3. **FAQ** - Common questions and answers
4. **Video Tutorials** - Screen recordings of workflows
5. **Quick Reference** - Cheat sheet for staff

### Development Documentation
1. **Setup Guide** - How to run locally
2. **Testing Guide** - How to run tests
3. **Deployment Guide** - How to deploy
4. **Troubleshooting Guide** - Common issues
5. **Architecture Diagram** - System design

---

## Post-Phase 4 Roadmap

### Immediate Next Steps (Phase 5)
After Phase 4 completion, the next priorities are:

**Phase 5: Services Management (Hotels, Vehicles, Tours)**
- Hotels inventory and pricing management
- Vehicles/transfers management
- Tours and activities management
- Suppliers management

**Phase 6: Quotations System**
- Quotation creation (similar to booking wizard)
- Quotation to booking conversion
- Quotation templates
- Quotation tracking

**Phase 7: Payments & Financial Management**
- Payment tracking and reconciliation
- Invoicing system
- Expense management
- Financial reports and analytics

---

## Conclusion

**Phase 4: Bookings Management is the foundation of the Tour Operations SaaS CRM.**

This phase transforms the CRM from a shell into a fully functional tour operations system. Upon completion, tour operators will be able to:

✅ Create complex bookings in minutes (not hours)
✅ Manage complete booking lifecycle
✅ Coordinate services across multiple suppliers
✅ Track payments and financials accurately
✅ Generate professional documents automatically
✅ Provide excellent customer service

**The success of Phase 4 determines the success of the entire CRM system.**

With proper planning, parallel agent execution, and rigorous testing, Phase 4 can be completed in 10-14 days and will deliver immense value to tour operators.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Project Manager
**Status:** 📋 READY FOR IMPLEMENTATION
**Next Step:** Assign agents and begin execution
