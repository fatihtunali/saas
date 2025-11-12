# PHASE 7: PAYMENTS MANAGEMENT - EXECUTION PLAN

**Created**: 2025-11-12
**Status**: Ready for Execution
**Priority**: HIGH
**Dependencies**: Phase 4 (Bookings), Phase 5 (Services), Phase 6 (Clients) ✅ ALL COMPLETE

---

## 📋 OVERVIEW

Phase 7 implements comprehensive financial management including:
- Client payment tracking (receivables)
- Supplier payment tracking (payables)
- Bank account management
- Refund processing
- Commission calculations
- Financial dashboard and analytics

---

## 🗄️ DATABASE VERIFICATION

### ✅ All Required Tables Exist in Database

#### 1. bank_accounts (15 fields)
```sql
id, operator_id, account_name, bank_name, account_number, iban, swift_code,
currency, account_type, is_default, is_active, notes, created_at, updated_at, deleted_at
```

#### 2. client_payments (17 fields) - RECEIVABLES
```sql
id, operator_id, booking_id, payment_date, amount, currency, exchange_rate,
amount_in_base_currency, payment_method, payment_reference, bank_account_id,
status, notes, received_by, created_at, updated_at, deleted_at
```

**Payment Statuses**: pending, completed, failed, refunded
**Payment Methods**: cash, credit_card, bank_transfer, check, other

#### 3. supplier_payments (20 fields) - PAYABLES
```sql
id, operator_id, booking_id, booking_service_id, supplier_id, payment_date,
due_date, amount, currency, exchange_rate, amount_in_base_currency,
payment_method, payment_reference, bank_account_id, status, notes, paid_by,
created_at, updated_at, deleted_at
```

**Payment Statuses**: pending, scheduled, paid, overdue, cancelled
**Links to**: booking_services table (which booking service this payment is for)

#### 4. refunds (19 fields)
```sql
id, operator_id, booking_id, client_payment_id, refund_amount, currency,
refund_reason, refund_method, refund_status, requested_date, approved_date,
processed_date, approved_by, processed_by, refund_reference, notes,
created_at, updated_at, deleted_at
```

**Refund Statuses**: requested, approved, rejected, processed
**Links to**: client_payments table

#### 5. commissions (17 fields)
```sql
id, operator_id, booking_id, user_id, partner_operator_id, commission_type,
commission_base_amount, commission_percentage, commission_amount, currency,
status, due_date, paid_date, notes, created_at, updated_at, deleted_at
```

**Commission Types**: sales_commission, partner_commission, agent_commission
**Statuses**: pending, approved, paid

---

## 🔌 BACKEND API STATUS

### ✅ All API Endpoints Already Exist

**File**: `backend/src/routes/index.js` (Lines 287-298)
**Controller**: `backend/src/controllers/allRemainingController.js` (Lines 244-248)

#### Client Payments Endpoints
- `GET /api/client-payments` - List all client payments
- `GET /api/client-payments/:id` - Get single payment
- `POST /api/client-payments` - Create new payment
- `PUT /api/client-payments/:id` - Update payment
- `DELETE /api/client-payments/:id` - Soft delete payment

#### Supplier Payments Endpoints
- `GET /api/supplier-payments` - List all supplier payments
- `GET /api/supplier-payments/:id` - Get single payment
- `POST /api/supplier-payments` - Create new payment
- `PUT /api/supplier-payments/:id` - Update payment
- `DELETE /api/supplier-payments/:id` - Soft delete payment

#### Additional Endpoints (from allRemainingController)
- Bank Accounts: `/api/bank-accounts` (full CRUD)
- Refunds: `/api/refunds` (full CRUD)
- Commissions: `/api/commissions` (full CRUD)

**Multi-Tenant Security**: ✅ All endpoints filter by operator_id automatically

---

## 📂 FRONTEND STRUCTURE TO BUILD

### Module 1: Bank Accounts Management

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/bank-accounts/`

#### Pages to Create (4 pages)
1. **List Page** - `page.tsx`
   - DataTable with columns: account_name, bank_name, account_number, currency, is_default, is_active
   - Quick actions: Edit, Delete, Set as Default
   - Create new account button
   - Filter by currency, account_type, is_active

2. **Details Page** - `[id]/page.tsx`
   - Account information display
   - Recent transactions using this account
   - Related payments (client + supplier)
   - Edit and Delete actions

3. **Create Page** - `create/page.tsx`
   - Form with sections:
     - Basic Info: account_name, bank_name, account_type
     - Account Details: account_number, iban, swift_code
     - Settings: currency, is_default, is_active
     - Notes

4. **Edit Page** - `[id]/edit/page.tsx`
   - Same form as create, pre-populated

**Form Validation Fields** (15 total):
- account_name (required, max 255)
- bank_name (required, max 255)
- account_number (required, max 50)
- iban (optional, max 50)
- swift_code (optional, max 20)
- currency (enum: TRY, USD, EUR, GBP - required)
- account_type (enum: checking, savings, credit_card - required)
- is_default (boolean)
- is_active (boolean)
- notes (optional, text)

---

### Module 2: Client Payments (Receivables)

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/receivables/`

#### Pages to Create (4 pages)
1. **List Page** - `page.tsx`
   - DataTable with columns: booking_id, payment_date, amount, currency, payment_method, status
   - Show booking reference with link
   - Color-coded status badges
   - Filters: date range, payment_method, status, currency
   - Summary cards: total received, pending, this month
   - Export to Excel/PDF

2. **Details Page** - `[id]/page.tsx`
   - Payment information
   - Related booking details (with link)
   - Bank account used
   - Payment timeline
   - Refund history (if any)
   - Actions: Record Refund, Edit, Delete

3. **Create Page** - `create/page.tsx`
   - **Step 1**: Select Booking (dropdown with search)
   - **Step 2**: Payment Details
     - payment_date (date picker)
     - amount (currency input)
     - currency (dropdown)
     - exchange_rate (if currency different from base)
     - amount_in_base_currency (auto-calculated)
   - **Step 3**: Payment Method
     - payment_method (dropdown)
     - payment_reference (e.g., check number, transaction ID)
     - bank_account_id (dropdown)
   - **Step 4**: Additional Info
     - received_by (text - who received payment)
     - status (dropdown: pending, completed, failed)
     - notes

4. **Edit Page** - `[id]/edit/page.tsx`
   - Same form as create, pre-populated
   - Show original values
   - Audit trail of changes

**Form Validation Fields** (17 total):
- booking_id (required, foreign key to bookings)
- payment_date (required, date)
- amount (required, positive number)
- currency (required, enum)
- exchange_rate (optional, positive number, default 1.0)
- amount_in_base_currency (calculated)
- payment_method (required, enum)
- payment_reference (optional, max 100)
- bank_account_id (optional, foreign key)
- status (required, enum)
- notes (optional, text)
- received_by (optional, max 255)

**Special Features**:
- Auto-calculate amount_in_base_currency when exchange_rate or amount changes
- Link to booking details
- Show outstanding balance for booking
- Mark payment as received automatically updates booking status
- Payment receipt generation (PDF)

---

### Module 3: Supplier Payments (Payables)

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/payables/`

#### Pages to Create (4 pages)
1. **List Page** - `page.tsx`
   - DataTable with columns: booking_id, supplier_name, due_date, payment_date, amount, status
   - Color-coded status badges (overdue in red)
   - Filters: date range, supplier, status, currency
   - Summary cards: total paid, outstanding, overdue
   - Bulk actions: Mark as Paid, Schedule Payment
   - Export to Excel/PDF

2. **Details Page** - `[id]/page.tsx`
   - Payment information
   - Related booking and service details
   - Supplier information (with link)
   - Bank account used
   - Payment timeline
   - Actions: Mark as Paid, Reschedule, Edit, Cancel

3. **Create Page** - `create/page.tsx`
   - **Step 1**: Select Booking Service
     - Booking dropdown (search)
     - Service dropdown (filtered by booking)
   - **Step 2**: Supplier & Dates
     - supplier_id (auto-filled from service, editable)
     - due_date (date picker)
     - payment_date (optional, date picker)
   - **Step 3**: Payment Details
     - amount (currency input)
     - currency (dropdown)
     - exchange_rate
     - amount_in_base_currency (auto-calculated)
   - **Step 4**: Payment Method
     - payment_method (dropdown)
     - payment_reference
     - bank_account_id
   - **Step 5**: Status & Notes
     - status (dropdown: pending, scheduled, paid, overdue, cancelled)
     - paid_by (who processed payment)
     - notes

4. **Edit Page** - `[id]/edit/page.tsx`
   - Same form as create, pre-populated

**Form Validation Fields** (20 total):
- booking_id (required, foreign key)
- booking_service_id (required, foreign key)
- supplier_id (required, foreign key)
- payment_date (optional, date)
- due_date (required, date)
- amount (required, positive number)
- currency (required, enum)
- exchange_rate (optional, default 1.0)
- amount_in_base_currency (calculated)
- payment_method (required, enum)
- payment_reference (optional, max 100)
- bank_account_id (optional, foreign key)
- status (required, enum)
- notes (optional, text)
- paid_by (optional, max 255)

**Special Features**:
- Auto-detect overdue payments (due_date < today && status != paid)
- Payment reminders (visual indicators)
- Batch payment processing
- Link to booking service and supplier
- Payment voucher generation

---

### Module 4: Refunds Management

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/refunds/`

#### Pages to Create (4 pages)
1. **List Page** - `page.tsx`
   - DataTable with columns: booking_id, client_name, refund_amount, status, requested_date
   - Status-based filtering
   - Approval workflow indicators
   - Summary: total refunded, pending approval

2. **Details Page** - `[id]/page.tsx`
   - Refund information
   - Original payment details
   - Approval timeline
   - Actions: Approve, Reject, Mark as Processed

3. **Create/Request Page** - `create/page.tsx`
   - Select booking
   - Select original payment
   - Refund amount (max = original payment)
   - Refund reason (dropdown + text)
   - Refund method (same as original or different)

4. **Edit Page** - `[id]/edit/page.tsx`
   - Update refund details
   - Change status (admin only)

**Form Validation Fields** (19 total):
- booking_id (required)
- client_payment_id (required)
- refund_amount (required, positive, <= original amount)
- currency (required)
- refund_reason (required, max 500)
- refund_method (required, enum)
- refund_status (required, enum)
- requested_date (auto-filled, editable)
- approved_date (optional)
- processed_date (optional)
- approved_by (optional)
- processed_by (optional)
- refund_reference (optional)
- notes (optional)

**Workflow**:
1. Request → 2. Approval → 3. Processing → 4. Completed

---

### Module 5: Commissions Management

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/commissions/`

#### Pages to Create (4 pages)
1. **List Page** - `page.tsx`
   - DataTable: booking_id, user/partner, commission_type, amount, status
   - Filters: commission_type, status, date range
   - Summary: total earned, pending, paid

2. **Details Page** - `[id]/page.tsx`
   - Commission calculation details
   - Related booking
   - Payment history

3. **Create Page** - `create/page.tsx`
   - Booking selection
   - Commission type (sales, partner, agent)
   - Recipient (user or partner_operator)
   - Base amount and percentage
   - Auto-calculate commission amount

4. **Edit Page** - `[id]/edit/page.tsx`
   - Update commission details

**Form Validation Fields** (17 total):
- booking_id (required)
- user_id (optional, for staff commissions)
- partner_operator_id (optional, for B2B partner commissions)
- commission_type (required, enum)
- commission_base_amount (required)
- commission_percentage (required, 0-100)
- commission_amount (calculated: base * percentage / 100)
- currency (required)
- status (required, enum)
- due_date (optional)
- paid_date (optional)
- notes (optional)

---

### Module 6: Financial Dashboard

**Location**: `frontend/src/app/(dashboard)/dashboard/payments/`

#### Main Dashboard Page (1 page)
- **Top Metrics (4 cards)**:
  1. Total Receivables (Pending + This Month)
  2. Total Payables (Pending + Overdue)
  3. Net Cash Flow
  4. Bank Balances (All accounts combined)

- **Charts Section**:
  1. Cash Flow Chart (Monthly - Receivables vs Payables)
  2. Payment Methods Breakdown (Pie chart)
  3. Outstanding vs Collected (Bar chart)
  4. Currency Distribution

- **Quick Actions**:
  - Record Client Payment
  - Schedule Supplier Payment
  - Process Refund
  - Add Bank Account

- **Recent Transactions** (Combined table):
  - Latest 10 client payments
  - Latest 10 supplier payments
  - Status and amounts

- **Alerts & Reminders**:
  - Overdue supplier payments (red)
  - Pending refunds requiring approval (yellow)
  - Low bank balance warnings (orange)

---

## 🎯 IMPLEMENTATION STRATEGY

### Approach: Single Comprehensive Agent

**Agent 16: Payments Management Complete Implementation**

**Rationale**:
- All 5 modules share similar CRUD patterns
- Consistent styling and validation needed
- Reduces coordination overhead
- Financial data must be tightly integrated

**Agent Tasks**:
1. Create TypeScript types (payments.ts, bank-accounts.ts)
2. Create Zod validation schemas (5 modules)
3. Create React Query hooks (5 modules × CRUD = 20 hooks)
4. Create all 21 pages (5 modules × 4 pages + 1 dashboard)
5. Create shared payment components (PaymentMethodBadge, StatusBadge, CurrencyDisplay)
6. Update sidebar navigation with Payments menu

---

## 📊 FILE STRUCTURE

```
frontend/src/
├── types/
│   ├── payments.ts (ClientPayment, SupplierPayment, Refund, Commission interfaces)
│   └── bank-accounts.ts (BankAccount interface)
├── lib/
│   └── validations/
│       ├── client-payments.ts (clientPaymentSchema + defaults)
│       ├── supplier-payments.ts (supplierPaymentSchema + defaults)
│       ├── refunds.ts (refundSchema + defaults)
│       ├── commissions.ts (commissionSchema + defaults)
│       └── bank-accounts.ts (bankAccountSchema + defaults)
├── hooks/
│   ├── use-client-payments.ts
│   ├── use-supplier-payments.ts
│   ├── use-refunds.ts
│   ├── use-commissions.ts
│   ├── use-bank-accounts.ts
│   └── use-financial-dashboard.ts
├── components/
│   └── features/
│       └── payments/
│           ├── PaymentMethodBadge.tsx
│           ├── PaymentStatusBadge.tsx
│           ├── CurrencyDisplay.tsx
│           ├── ExchangeRateCalculator.tsx
│           └── PaymentSummaryCard.tsx
└── app/(dashboard)/dashboard/payments/
    ├── page.tsx (Financial Dashboard)
    ├── layout.tsx (Tab navigation for 5 modules)
    ├── bank-accounts/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   ├── [id]/edit/page.tsx
    │   └── create/page.tsx
    ├── receivables/ (client payments)
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   ├── [id]/edit/page.tsx
    │   └── create/page.tsx
    ├── payables/ (supplier payments)
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   ├── [id]/edit/page.tsx
    │   └── create/page.tsx
    ├── refunds/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   ├── [id]/edit/page.tsx
    │   └── create/page.tsx
    └── commissions/
        ├── page.tsx
        ├── [id]/page.tsx
        ├── [id]/edit/page.tsx
        └── create/page.tsx
```

**Total Files**: 47 files
- 6 TypeScript type files
- 5 Zod validation files
- 6 React Query hook files
- 5 shared payment components
- 1 layout file
- 21 page files
- 3 utility files (formatters, calculators, exports)

---

## 🔧 KEY TECHNICAL REQUIREMENTS

### 1. Multi-Currency Support
- Display amounts in original currency AND base currency
- Exchange rate calculator component
- Auto-convert using exchange_rate field
- Support TRY, USD, EUR, GBP

### 2. Auto-Calculations
- `amount_in_base_currency = amount * exchange_rate`
- `commission_amount = commission_base_amount * (commission_percentage / 100)`
- Outstanding balance = booking total - sum of client payments
- Overdue detection = due_date < today AND status != 'paid'

### 3. Status Management
**Client Payment Statuses**:
- pending (yellow)
- completed (green)
- failed (red)
- refunded (gray)

**Supplier Payment Statuses**:
- pending (yellow)
- scheduled (blue)
- paid (green)
- overdue (red)
- cancelled (gray)

**Refund Statuses**:
- requested (blue)
- approved (yellow)
- rejected (red)
- processed (green)

### 4. Permissions & Security
- Multi-tenant: Filter all queries by operator_id
- Role-based actions:
  - Operators can create/view their payments
  - Super admin can see all payments
- Sensitive actions logged in audit_logs

### 5. Integrations
- Link to bookings (booking_id)
- Link to booking services (booking_service_id)
- Link to suppliers (supplier_id)
- Link to bank accounts (bank_account_id)
- Update booking payment status automatically

### 6. Form Validations
- Amount must be positive
- Exchange rate must be positive (default 1.0)
- Payment date cannot be in future (for completed payments)
- Due date validation
- Refund amount cannot exceed original payment
- Commission percentage: 0-100

### 7. Data Display Enhancements
- Format currency: `formatCurrency(amount, currency)` → "$1,234.56"
- Format date: `formatDate(date)` → "Nov 12, 2025"
- Relative dates: "2 days ago", "Overdue by 5 days"
- Color-coded status badges
- Payment method icons

---

## 📈 ESTIMATED METRICS

**Development Time**: 4-5 days
**Files to Create**: 47 files
**Estimated Lines**: 10,000-12,000 lines
**Components**: 15+ components
**Pages**: 21 pages
**API Endpoints**: Already exist (10 endpoints)
**Database Tables**: Already exist (5 tables, 88 total fields)

---

## ✅ DEFINITION OF DONE

### Phase 7 is complete when:
1. ✅ All 21 pages render without errors
2. ✅ All forms submit successfully to backend
3. ✅ Multi-currency calculations work correctly
4. ✅ Status badges and filters functional
5. ✅ Financial dashboard displays real data
6. ✅ Multi-tenant filtering works (operator_id)
7. ✅ All validations pass
8. ✅ Zero TypeScript errors
9. ✅ Zero build errors
10. ✅ Sidebar navigation updated with Payments menu

---

## 🚀 EXECUTION COMMAND

**Deploy Agent 16 with this exact specification**:
- Read this execution plan
- Verify database tables and backend API
- Create all 47 files following structure above
- Use Hotels module as reference for patterns
- Use card-based form layouts
- Implement all validations
- Test all CRUD operations
- Ensure zero errors

**Expected Completion**: 1 agent run (comprehensive)

---

## 📚 REFERENCE PATTERNS

### Template Modules to Follow:
1. **Hotels Module** (`dashboard/services/hotels/`) - Complex forms, pricing structure
2. **Bookings Module** (`dashboard/bookings/`) - Multi-step workflows, status management
3. **Clients Module** (`dashboard/clients/`) - Tab navigation, credit tracking

### Code Patterns:
- **Validation**: `frontend/src/lib/validations/hotels.ts`
- **Hooks**: `frontend/src/hooks/use-hotels.ts`
- **List Page**: `dashboard/services/hotels/page.tsx`
- **Create Form**: `dashboard/services/hotels/create/page.tsx`
- **Edit Form**: `dashboard/services/hotels/[id]/edit/page.tsx`
- **Details Page**: `dashboard/services/hotels/[id]/page.tsx`

---

## 🎬 NEXT STEPS AFTER COMPLETION

1. Test all payment workflows end-to-end
2. Verify financial calculations accuracy
3. Test multi-currency conversion
4. Update PROJECT_ROADMAP.md to 80% complete
5. Create PHASE_7_COMPLETION_REPORT.md
6. Move to Phase 8: Reports System

---

**PHASE 7 READY FOR AGENT DEPLOYMENT**
