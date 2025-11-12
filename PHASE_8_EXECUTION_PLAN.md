# PHASE 8: REPORTS SYSTEM - EXECUTION PLAN

**Created**: 2025-11-12
**Status**: Ready for Execution
**Priority**: HIGH
**Dependencies**: Phase 4 (Bookings), Phase 5 (Services), Phase 6 (Clients), Phase 7 (Payments) ✅ ALL COMPLETE

---

## 📋 OVERVIEW

Phase 8 implements a comprehensive reporting and analytics system that leverages all data from previous phases to provide business intelligence, financial insights, and operational analytics. The system will generate multiple report types with filtering, date ranges, and export capabilities (PDF/Excel).

---

## 🎯 REPORT CATEGORIES

### 1. Financial Reports (5 report types)
1. Revenue Report - Total revenue by date range, service type, client type
2. Profit & Loss Statement - Revenue vs Costs with margins
3. Receivables Aging Report - Outstanding client payments by age
4. Payables Aging Report - Outstanding supplier payments by age
5. Commission Report - Commission breakdown by type and recipient

### 2. Booking Reports (5 report types)
6. Bookings by Date Range - Booking volume and trends
7. Bookings by Status - Status distribution and conversion rates
8. Bookings by Destination - Popular destinations and cities
9. Cancellation Report - Cancellation reasons and rates
10. Booking Source Analysis - B2B vs B2C performance

### 3. Operations Reports (4 report types)
11. Service Utilization Report - Which services are most used
12. Guide Performance Report - Guide bookings and revenue
13. Hotel Occupancy Report - Hotel usage statistics
14. Vehicle Utilization Report - Vehicle rental frequency

### 4. Client Reports (3 report types)
15. Client Revenue Analysis - Top clients by revenue
16. Client Booking History - Detailed client activity
17. Outstanding Balances Report - Clients with pending payments

**Total: 17 Report Types**

---

## 🗄️ DATABASE TABLES FOR REPORTING

### Primary Data Sources ✅ All Verified

#### Booking Data
- **bookings** (37 fields) - Main booking information
  - booking_reference, status, start_date, end_date, total_amount, deposit_amount, payment_status
  - client_id, client_type (B2B/B2C), booking_source
  - created_at, updated_at, cancelled_at

- **booking_services** (30 fields) - Service line items
  - service_type, service_date
  - cost_amount, cost_currency, cost_in_base_currency
  - selling_price, selling_currency
  - hotel_id, guide_id, restaurant_id, etc.

- **booking_passengers** (27 fields) - Passenger details
  - passenger_type (adult, child, infant)
  - nationality, age

#### Financial Data
- **client_payments** (17 fields) - Receivables
  - amount, currency, amount_in_base_currency
  - payment_date, payment_method, status

- **supplier_payments** (20 fields) - Payables
  - amount, currency, amount_in_base_currency
  - payment_date, due_date, status

- **commissions** (17 fields) - Commission tracking
  - commission_type, commission_amount, status
  - user_id, partner_operator_id

- **refunds** (19 fields) - Refund tracking
  - refund_amount, refund_status, refund_reason

#### Client Data
- **clients** (26 fields) - B2C clients
  - full_name, client_type, total_bookings, total_spent

- **operators_clients** (25 fields) - B2B clients
  - full_name, partner_operator_id, credit_limit, credit_used

#### Service Data
- **hotels** (20 fields)
- **guides** (15 fields)
- **restaurants** (14 fields)
- **entrance_fees** (16 fields)
- **vehicle_rentals** (21 fields)
- **tour_companies** (24 fields)

---

## 🔌 BACKEND API REQUIREMENTS

### New API Endpoints to Create

**Location**: `backend/src/controllers/reportsController.js` (NEW FILE)
**Routes**: `backend/src/routes/index.js` (ADD ROUTES)

#### Financial Reports Endpoints (5)
```javascript
GET /api/reports/revenue
GET /api/reports/profit-loss
GET /api/reports/receivables-aging
GET /api/reports/payables-aging
GET /api/reports/commissions
```

#### Booking Reports Endpoints (5)
```javascript
GET /api/reports/bookings-by-date
GET /api/reports/bookings-by-status
GET /api/reports/bookings-by-destination
GET /api/reports/cancellations
GET /api/reports/booking-sources
```

#### Operations Reports Endpoints (4)
```javascript
GET /api/reports/service-utilization
GET /api/reports/guide-performance
GET /api/reports/hotel-occupancy
GET /api/reports/vehicle-utilization
```

#### Client Reports Endpoints (3)
```javascript
GET /api/reports/client-revenue
GET /api/reports/client-history
GET /api/reports/outstanding-balances
```

**Total New Endpoints**: 17

### Query Parameters (Standard across all reports)
```javascript
?start_date=YYYY-MM-DD
&end_date=YYYY-MM-DD
&currency=TRY|USD|EUR|GBP
&client_type=b2b|b2c
&status=pending|confirmed|completed|cancelled
&format=json|csv|pdf (optional, default: json)
```

### Multi-Tenant Security
- All endpoints filter by `operator_id` from JWT token
- Super admin can optionally filter by specific operator_id

---

## 📂 FRONTEND STRUCTURE TO BUILD

### Reports Module Architecture

```
frontend/src/app/(dashboard)/dashboard/reports/
├── page.tsx                                    # Reports Dashboard (overview)
├── layout.tsx                                  # Reports navigation
├── financial/
│   ├── revenue/page.tsx                       # Revenue Report
│   ├── profit-loss/page.tsx                   # P&L Statement
│   ├── receivables-aging/page.tsx             # Receivables Aging
│   ├── payables-aging/page.tsx                # Payables Aging
│   └── commissions/page.tsx                   # Commissions Report
├── bookings/
│   ├── by-date/page.tsx                       # Bookings by Date
│   ├── by-status/page.tsx                     # Bookings by Status
│   ├── by-destination/page.tsx                # Bookings by Destination
│   ├── cancellations/page.tsx                 # Cancellation Report
│   └── sources/page.tsx                       # Booking Sources
├── operations/
│   ├── service-utilization/page.tsx           # Service Utilization
│   ├── guide-performance/page.tsx             # Guide Performance
│   ├── hotel-occupancy/page.tsx               # Hotel Occupancy
│   └── vehicle-utilization/page.tsx           # Vehicle Utilization
└── clients/
    ├── revenue-analysis/page.tsx              # Client Revenue
    ├── booking-history/page.tsx               # Client History
    └── outstanding-balances/page.tsx          # Outstanding Balances
```

**Total Pages**: 18 (1 dashboard + 17 report pages)

---

## 🎨 REPORT PAGE STRUCTURE (STANDARD TEMPLATE)

Each report page should follow this consistent structure:

### 1. Header Section
- Report title and description
- Last updated timestamp
- Help icon with tooltip

### 2. Filters Section (Card)
- **Date Range Picker** (start_date, end_date)
  - Preset ranges: Today, This Week, This Month, This Quarter, This Year, Custom
- **Currency Selector** (for financial reports)
- **Additional Filters** (based on report type):
  - Status filter (for booking reports)
  - Client type filter (B2B/B2C)
  - Service type filter
  - Destination filter
- **Generate Report Button** (primary action)
- **Export Buttons** (Excel, PDF) - secondary actions

### 3. Summary Cards (Metrics)
- 3-4 key metrics displayed as cards
- Color-coded indicators
- Comparison to previous period (optional)
- Icons for each metric

### 4. Main Report Content
**Option A: Data Table** (for list-based reports)
- Sortable columns
- Pagination
- Total/Subtotal rows
- Export functionality

**Option B: Charts** (for analytical reports)
- Bar charts for comparisons
- Line charts for trends
- Pie charts for distributions
- Area charts for cumulative data

**Option C: Hybrid** (table + charts)
- Visual representation at top
- Detailed data table below

### 5. Action Buttons
- Export to Excel (.xlsx)
- Export to PDF
- Print Report
- Schedule Report (future feature)
- Share Report (future feature)

---

## 📊 DETAILED REPORT SPECIFICATIONS

### FINANCIAL REPORTS

#### 1. Revenue Report
**URL**: `/dashboard/reports/financial/revenue`
**Purpose**: Track total revenue by date range, service type, and client type

**Summary Metrics**:
- Total Revenue (in base currency)
- Total Bookings Count
- Average Booking Value
- Revenue Growth % (vs previous period)

**Data Table Columns**:
- Date (or Date Range grouping)
- Booking Reference
- Client Name
- Service Type
- Amount
- Currency
- Amount in Base Currency
- Payment Status

**Charts**:
- Line chart: Revenue over time (daily/weekly/monthly)
- Bar chart: Revenue by service type
- Pie chart: Revenue by client type (B2B vs B2C)

**Filters**:
- Date Range (required)
- Currency
- Client Type (B2B, B2C, All)
- Service Type (All, Hotels, Guides, Tours, etc.)
- Payment Status (All, Paid, Pending, Partial)

---

#### 2. Profit & Loss Statement
**URL**: `/dashboard/reports/financial/profit-loss`
**Purpose**: Calculate profit margins by comparing revenue to costs

**Summary Metrics**:
- Total Revenue
- Total Costs
- Gross Profit
- Profit Margin %

**Data Structure**:
```
Revenue Section:
  - Client Payments (total)
  - By Service Type (breakdown)

Cost Section:
  - Supplier Payments (total)
  - By Service Type (breakdown)

Profit Section:
  - Gross Profit (Revenue - Costs)
  - Profit Margin % ((Profit / Revenue) × 100)
```

**Charts**:
- Stacked bar chart: Revenue vs Costs by month
- Waterfall chart: Profit breakdown
- Line chart: Profit margin trend over time

---

#### 3. Receivables Aging Report
**URL**: `/dashboard/reports/financial/receivables-aging`
**Purpose**: Track outstanding client payments by age

**Summary Metrics**:
- Total Outstanding
- Current (0-30 days)
- 31-60 Days
- 61-90 Days
- Over 90 Days (critical)

**Data Table Columns**:
- Booking Reference
- Client Name
- Invoice Date
- Due Date
- Days Outstanding
- Amount Due
- Aging Bucket (Current, 31-60, 61-90, 90+)

**Charts**:
- Pie chart: Outstanding balance by aging bucket
- Bar chart: Top 10 clients with outstanding balances

**Color Coding**:
- Green: Current (0-30 days)
- Yellow: 31-60 days
- Orange: 61-90 days
- Red: Over 90 days

---

#### 4. Payables Aging Report
**URL**: `/dashboard/reports/financial/payables-aging`
**Purpose**: Track outstanding supplier payments

**Summary Metrics**:
- Total Payables
- Current (0-30 days)
- 31-60 Days
- 61-90 Days
- Overdue (past due date)

**Data Table Columns**:
- Booking Reference
- Supplier Name
- Invoice Date
- Due Date
- Days Until/Past Due
- Amount Owed
- Status (Scheduled, Pending, Overdue)

**Charts**:
- Pie chart: Payables by aging bucket
- Bar chart: Payables by supplier

---

#### 5. Commission Report
**URL**: `/dashboard/reports/financial/commissions`
**Purpose**: Track commission earnings and payments

**Summary Metrics**:
- Total Commissions Earned
- Total Commissions Paid
- Pending Commissions
- Commissions by Type (Sales, Partner, Agent)

**Data Table Columns**:
- Booking Reference
- Commission Type
- Recipient (User/Partner Name)
- Base Amount
- Commission %
- Commission Amount
- Status (Pending, Approved, Paid)
- Due Date

**Charts**:
- Bar chart: Commissions by type
- Pie chart: Commissions by status
- Line chart: Commission trend over time

---

### BOOKING REPORTS

#### 6. Bookings by Date Range
**URL**: `/dashboard/reports/bookings/by-date`
**Purpose**: Analyze booking volume and trends

**Summary Metrics**:
- Total Bookings
- Total Revenue
- Average Booking Value
- Conversion Rate (confirmed/total)

**Data Table Columns**:
- Booking Date
- Booking Reference
- Client Name
- Start Date
- End Date
- Status
- Total Amount
- Payment Status

**Charts**:
- Line chart: Bookings over time
- Bar chart: Bookings by day of week
- Area chart: Cumulative bookings

---

#### 7. Bookings by Status
**URL**: `/dashboard/reports/bookings/by-status`
**Purpose**: Track booking status distribution

**Summary Metrics**:
- Pending Bookings
- Confirmed Bookings
- Completed Bookings
- Cancelled Bookings

**Data Table Columns**:
- Status
- Count
- Percentage of Total
- Total Amount
- Average Booking Value

**Charts**:
- Pie chart: Status distribution
- Funnel chart: Booking conversion funnel (Pending → Confirmed → Completed)
- Bar chart: Status by month

---

#### 8. Bookings by Destination
**URL**: `/dashboard/reports/bookings/by-destination`
**Purpose**: Identify popular destinations

**Summary Metrics**:
- Total Destinations
- Top Destination
- Most Popular Season
- Average Stay Duration

**Data Table Columns**:
- Destination (City/Region)
- Number of Bookings
- Total Revenue
- Average Booking Value
- Percentage of Total Bookings

**Charts**:
- Bar chart: Top 10 destinations
- Map visualization (optional, future)
- Treemap: Destinations sized by revenue

---

#### 9. Cancellation Report
**URL**: `/dashboard/reports/bookings/cancellations`
**Purpose**: Analyze cancellation patterns and reasons

**Summary Metrics**:
- Total Cancellations
- Cancellation Rate %
- Total Refunds Processed
- Average Days Before Trip (cancellation timing)

**Data Table Columns**:
- Booking Reference
- Client Name
- Booking Date
- Cancelled Date
- Days Before Trip
- Cancellation Reason
- Refund Amount
- Refund Status

**Charts**:
- Pie chart: Cancellation reasons
- Line chart: Cancellation rate trend
- Bar chart: Cancellations by month

---

#### 10. Booking Source Analysis
**URL**: `/dashboard/reports/bookings/sources`
**Purpose**: Compare B2B vs B2C performance

**Summary Metrics**:
- B2B Bookings Count & Revenue
- B2C Bookings Count & Revenue
- B2B Average Booking Value
- B2C Average Booking Value

**Data Table Columns**:
- Source (B2B/B2C)
- Client Name
- Number of Bookings
- Total Revenue
- Average Booking Value
- Percentage of Total

**Charts**:
- Pie chart: B2B vs B2C revenue split
- Bar chart: Monthly B2B vs B2C comparison
- Line chart: Trend over time

---

### OPERATIONS REPORTS

#### 11. Service Utilization Report
**URL**: `/dashboard/reports/operations/service-utilization`
**Purpose**: Track which services are most frequently booked

**Summary Metrics**:
- Total Services Booked
- Most Popular Service Type
- Total Service Revenue
- Average Services per Booking

**Data Table Columns**:
- Service Type (Hotel, Guide, Transfer, etc.)
- Number of Bookings
- Total Revenue
- Average Price
- Utilization Rate %

**Charts**:
- Bar chart: Services by booking count
- Pie chart: Revenue by service type
- Stacked bar: Services per month

---

#### 12. Guide Performance Report
**URL**: `/dashboard/reports/operations/guide-performance`
**Purpose**: Track guide bookings and revenue

**Summary Metrics**:
- Active Guides Count
- Total Guide Bookings
- Total Guide Revenue
- Average Revenue per Guide

**Data Table Columns**:
- Guide Name
- Languages
- Number of Bookings
- Total Revenue
- Average Rating (if available)
- Utilization Days

**Charts**:
- Bar chart: Top 10 guides by bookings
- Bar chart: Top 10 guides by revenue

---

#### 13. Hotel Occupancy Report
**URL**: `/dashboard/reports/operations/hotel-occupancy`
**Purpose**: Track hotel usage statistics

**Summary Metrics**:
- Total Hotels Used
- Total Room Nights
- Total Hotel Revenue
- Average Rate per Night

**Data Table Columns**:
- Hotel Name
- City
- Star Rating
- Number of Bookings
- Total Room Nights
- Total Revenue
- Average Rate

**Charts**:
- Bar chart: Top 10 hotels by bookings
- Bar chart: Hotels by city
- Line chart: Occupancy trend

---

#### 14. Vehicle Utilization Report
**URL**: `/dashboard/reports/operations/vehicle-utilization`
**Purpose**: Track vehicle rental frequency

**Summary Metrics**:
- Total Vehicle Rentals
- Total Revenue
- Most Popular Vehicle Type
- Average Rental Duration

**Data Table Columns**:
- Vehicle Type
- Vehicle Company
- Number of Rentals
- Total Days Rented
- Total Revenue
- Average Daily Rate

**Charts**:
- Bar chart: Rentals by vehicle type
- Pie chart: Revenue by vehicle company

---

### CLIENT REPORTS

#### 15. Client Revenue Analysis
**URL**: `/dashboard/reports/clients/revenue-analysis`
**Purpose**: Identify top clients by revenue

**Summary Metrics**:
- Total Active Clients
- Top Client by Revenue
- Average Revenue per Client
- Repeat Customer Rate %

**Data Table Columns**:
- Client Name
- Client Type (B2B/B2C)
- Number of Bookings
- Total Revenue
- Average Booking Value
- Last Booking Date

**Charts**:
- Bar chart: Top 20 clients by revenue
- Pie chart: B2B vs B2C client revenue
- Pareto chart: 80/20 client revenue distribution

---

#### 16. Client Booking History
**URL**: `/dashboard/reports/clients/booking-history`
**Purpose**: Detailed client activity tracking

**Filters**:
- Client Search/Selection (required)
- Date Range

**Summary Metrics**:
- Total Bookings
- Total Spent
- Average Booking Value
- Last Booking Date

**Data Table Columns**:
- Booking Date
- Booking Reference
- Start Date
- Destination
- Services Used
- Total Amount
- Payment Status
- Booking Status

**Charts**:
- Timeline: Booking history over time
- Bar chart: Spending by service type

---

#### 17. Outstanding Balances Report
**URL**: `/dashboard/reports/clients/outstanding-balances`
**Purpose**: Track clients with pending payments

**Summary Metrics**:
- Total Outstanding Amount
- Number of Clients with Balance
- Largest Outstanding Balance
- Average Days Outstanding

**Data Table Columns**:
- Client Name
- Client Type
- Booking Reference
- Invoice Date
- Due Date
- Days Outstanding
- Amount Due
- Aging Bucket

**Charts**:
- Bar chart: Top clients by outstanding balance
- Pie chart: Outstanding by aging bucket

---

## 🛠️ SUPPORTING FILES TO CREATE

### Backend Files (2 files)

#### 1. Reports Controller
**File**: `backend/src/controllers/reportsController.js`
**Lines**: ~1,200-1,500 lines
**Contents**:
- 17 report functions (one per report type)
- Each function:
  - Extracts query parameters (start_date, end_date, filters)
  - Applies multi-tenant filtering (operator_id)
  - Executes complex SQL queries with JOINs
  - Aggregates data
  - Returns JSON response
- Helper functions:
  - `calculateDateRanges(start_date, end_date)`
  - `applyOperatorFilter(req)`
  - `formatCurrency(amount, currency)`
  - `calculateAgingBucket(date)`

#### 2. Routes Update
**File**: `backend/src/routes/index.js`
**Lines**: +20 lines (routes addition)
**Contents**:
- Add 17 new GET routes under `/api/reports/`
- All routes protected with `authenticateToken` middleware

---

### Frontend Files (30+ files)

#### Type Definitions (2 files)
**File**: `frontend/src/types/reports.ts`
**Lines**: ~200 lines
**Contents**:
```typescript
export interface ReportFilters {
  start_date: Date;
  end_date: Date;
  currency?: Currency;
  client_type?: 'b2b' | 'b2c' | 'all';
  status?: string;
  service_type?: string;
}

export interface RevenueReportData {
  total_revenue: number;
  total_bookings: number;
  average_booking_value: number;
  growth_percentage: number;
  data: RevenueDataPoint[];
}

// ... 17 report type interfaces
```

#### React Query Hooks (1 file)
**File**: `frontend/src/hooks/use-reports.ts`
**Lines**: ~400 lines
**Contents**:
- 17 custom hooks (one per report)
- Example:
```typescript
export const useRevenueReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', 'revenue', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/reports/revenue', {
        params: filters
      });
      return data;
    },
    enabled: !!filters.start_date && !!filters.end_date,
  });
};
```

#### Shared Report Components (5 files)
1. **ReportHeader.tsx** (60 lines)
   - Title, description, last updated
   - Help tooltip

2. **ReportFilters.tsx** (180 lines)
   - Date range picker
   - Currency selector
   - Additional filters (dynamic based on props)
   - Generate button
   - Export buttons

3. **ReportSummaryCards.tsx** (80 lines)
   - Metric cards with icons
   - Comparison indicators
   - Color-coded values

4. **ReportTable.tsx** (120 lines)
   - Sortable data table
   - Pagination
   - Subtotal/Total rows
   - Export functionality

5. **ReportChart.tsx** (100 lines)
   - Wrapper for Recharts
   - Line, Bar, Pie, Area chart types
   - Responsive design
   - Tooltips and legends

#### Export Utilities (2 files)
1. **excel-export.ts** (150 lines)
   - Export to Excel using SheetJS (xlsx library)
   - Format data for Excel
   - Auto-width columns
   - Styling for headers

2. **pdf-export.ts** (150 lines)
   - Export to PDF using jsPDF + autoTable
   - Format report layout
   - Add company logo (optional)
   - Page numbers and headers

#### Report Pages (18 files)
- 1 Reports Dashboard (`page.tsx`)
- 17 Individual Report Pages
- Average 200-250 lines per report page

---

## 📦 REQUIRED NPM PACKAGES

### To Install:
```bash
npm install --save recharts          # Charts library
npm install --save xlsx              # Excel export
npm install --save jspdf jspdf-autotable  # PDF export
npm install --save date-fns          # Date utilities
npm install --save react-datepicker  # Date range picker
```

### Already Installed:
- React Query (for data fetching)
- Zod (for validation)
- shadcn/ui components

---

## 🎯 IMPLEMENTATION STRATEGY

### Approach: Single Comprehensive Agent

**Agent 18: Reports System Complete Implementation**

**Rationale**:
- All reports follow similar patterns (filters → query → display → export)
- Consistent UI across all report types
- Shared components maximize code reuse
- Single agent ensures consistency

**Agent Tasks**:
1. **Backend** (40% of work):
   - Create reportsController.js with 17 report functions
   - Add routes to index.js
   - Test SQL queries for each report

2. **Frontend Infrastructure** (30% of work):
   - Create types/reports.ts
   - Create hooks/use-reports.ts
   - Create 5 shared report components
   - Create export utilities (Excel, PDF)

3. **Report Pages** (30% of work):
   - Create Reports Dashboard
   - Create 17 individual report pages
   - Each following standard template
   - Implement filters and charts

---

## 📊 FILE STRUCTURE SUMMARY

```
backend/src/
├── controllers/
│   └── reportsController.js                    # NEW (1,200-1,500 lines)
└── routes/
    └── index.js                                # MODIFIED (+20 lines)

frontend/src/
├── types/
│   └── reports.ts                              # NEW (200 lines)
├── hooks/
│   └── use-reports.ts                          # NEW (400 lines)
├── lib/
│   └── utils/
│       ├── excel-export.ts                     # NEW (150 lines)
│       └── pdf-export.ts                       # NEW (150 lines)
├── components/
│   └── features/
│       └── reports/
│           ├── ReportHeader.tsx                # NEW (60 lines)
│           ├── ReportFilters.tsx               # NEW (180 lines)
│           ├── ReportSummaryCards.tsx          # NEW (80 lines)
│           ├── ReportTable.tsx                 # NEW (120 lines)
│           └── ReportChart.tsx                 # NEW (100 lines)
└── app/(dashboard)/dashboard/reports/
    ├── page.tsx                                # NEW (200 lines) - Dashboard
    ├── layout.tsx                              # NEW (100 lines) - Navigation
    ├── financial/
    │   ├── revenue/page.tsx                    # NEW (250 lines)
    │   ├── profit-loss/page.tsx                # NEW (250 lines)
    │   ├── receivables-aging/page.tsx          # NEW (250 lines)
    │   ├── payables-aging/page.tsx             # NEW (250 lines)
    │   └── commissions/page.tsx                # NEW (250 lines)
    ├── bookings/
    │   ├── by-date/page.tsx                    # NEW (250 lines)
    │   ├── by-status/page.tsx                  # NEW (250 lines)
    │   ├── by-destination/page.tsx             # NEW (250 lines)
    │   ├── cancellations/page.tsx              # NEW (250 lines)
    │   └── sources/page.tsx                    # NEW (250 lines)
    ├── operations/
    │   ├── service-utilization/page.tsx        # NEW (250 lines)
    │   ├── guide-performance/page.tsx          # NEW (250 lines)
    │   ├── hotel-occupancy/page.tsx            # NEW (250 lines)
    │   └── vehicle-utilization/page.tsx        # NEW (250 lines)
    └── clients/
        ├── revenue-analysis/page.tsx           # NEW (250 lines)
        ├── booking-history/page.tsx            # NEW (250 lines)
        └── outstanding-balances/page.tsx       # NEW (250 lines)
```

**Total Files**: ~32 files
- Backend: 2 files (1 new, 1 modified)
- Frontend: 30 new files

**Estimated Lines**: ~6,500-7,500 lines
- Backend: ~1,500 lines
- Frontend: ~5,000-6,000 lines

---

## 🔑 KEY TECHNICAL REQUIREMENTS

### 1. Complex SQL Queries
Each report needs carefully crafted SQL with:
- Multiple table JOINs
- Date range filtering
- Aggregation (SUM, COUNT, AVG)
- GROUP BY clauses
- Multi-tenant WHERE clauses (operator_id)

### 2. Date Range Handling
- Support for preset ranges (Today, This Week, This Month, etc.)
- Custom date range picker
- Timezone considerations
- Date formatting for different locales

### 3. Multi-Currency Calculations
- All financial reports must support multiple currencies
- Use `amount_in_base_currency` for aggregations
- Display original currency alongside converted amount
- Currency selector in filters

### 4. Export Functionality
**Excel Export**:
- Use SheetJS (xlsx) library
- Format numbers as currency
- Auto-width columns
- Header row styling
- Multiple sheets for complex reports

**PDF Export**:
- Use jsPDF + jsPDF-AutoTable
- Company header with logo
- Report title and date range
- Formatted tables
- Page numbers
- Summary section

### 5. Charts and Visualizations
Using Recharts library:
- **Line Charts**: Trends over time
- **Bar Charts**: Comparisons
- **Pie Charts**: Distributions
- **Area Charts**: Cumulative data
- **Stacked Charts**: Multiple data series
- Responsive design
- Interactive tooltips
- Legend display

### 6. Performance Optimization
- Lazy loading for report pages
- Query result caching (React Query)
- Pagination for large datasets
- Loading skeletons
- Error boundaries

### 7. User Experience
- Clear filter labels and descriptions
- Preset date range buttons
- Generate button to execute query
- Loading states during data fetch
- Empty states when no data
- Error handling and messages
- Export progress indicators

---

## ✅ DEFINITION OF DONE

### Phase 8 is complete when:
1. ✅ All 17 report types implemented
2. ✅ Backend API endpoints functional
3. ✅ Frontend pages render without errors
4. ✅ Filters work correctly
5. ✅ Charts display data properly
6. ✅ Excel export functional
7. ✅ PDF export functional
8. ✅ Multi-tenant filtering works
9. ✅ Date range selection works
10. ✅ Zero TypeScript errors
11. ✅ Zero build errors
12. ✅ Reports Dashboard links to all reports
13. ✅ Sidebar navigation updated

---

## 📊 ESTIMATED METRICS

**Development Time**: 3-4 days
**Files to Create**: ~32 files
**Estimated Lines**: ~6,500-7,500 lines
**Backend Endpoints**: 17 new endpoints
**Report Types**: 17 reports
**Charts**: 40+ chart instances
**Database Tables Used**: 15+ tables

---

## 🚀 EXECUTION COMMAND

**Deploy Agent 18 with this exact specification**:
- Read this execution plan
- Install required npm packages (recharts, xlsx, jspdf, etc.)
- Create backend reportsController.js with 17 report functions
- Add API routes
- Create all frontend infrastructure (types, hooks, components, utils)
- Create Reports Dashboard
- Create all 17 report pages with filters, charts, and export
- Update sidebar navigation
- Test build

**Expected Completion**: 1 comprehensive agent run

---

## 📚 REFERENCE PATTERNS

### Template Modules to Follow:
1. **Payments Dashboard** (`dashboard/payments/page.tsx`) - Dashboard layout with cards
2. **Bank Accounts List** (`dashboard/payments/bank-accounts/page.tsx`) - DataTable patterns
3. **Bookings Details** (`dashboard/bookings/[id]/page.tsx`) - Complex data display

### Code Patterns:
- **React Query Hooks**: `frontend/src/hooks/use-client-payments.ts`
- **Date Handling**: Use date-fns for formatting and calculations
- **Export Utilities**: Create similar to existing formatters
- **Chart Components**: Use Recharts with responsive containers

---

## 🎬 NEXT STEPS AFTER COMPLETION

1. Test all 17 reports with real data
2. Verify SQL query performance
3. Test export functionality (Excel, PDF)
4. Verify multi-currency calculations
5. Update PROJECT_ROADMAP.md to 85% complete
6. Create PHASE_8_COMPLETION_REPORT.md
7. Move to Phase 9: User Management & Permissions

---

**PHASE 8 READY FOR AGENT DEPLOYMENT**
