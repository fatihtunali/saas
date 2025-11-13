# Dashboard System - Detailed Plan

## Dashboard Layout Structure

### Left Side: Navigation Menu
- Collapsible sidebar menu
- All menu items accessible based on user role (super_admin/operator)
- Active menu item highlighted

### Right Side: Main Content Area
- Dashboard overview (daily reports, statistics)
- Dynamic content based on selected menu item

---

## Menu Structure & Modules

### 1. Dashboard (Home)
**Purpose**: Overview and daily reports
**Features**:
- Daily statistics summary
- Recent bookings
- Payment status overview
- Upcoming tours
- Quick actions

---

### 2. Clients Management
**Purpose**: Manage all types of clients

#### 2.1 Operators (B2B Clients)
**Description**: Tour operators we work with
**Data Structure**:
- Company Name
- Contact Person Full Name
- Contact Email
- Contact Phone Number
- Business Registration Number
- Address
- Commission Rate (%)
- Status (Active/Inactive)
- Created Date

#### 2.2 Operator's Clients (End Customers)
**Description**: Clients who belong to our partner operators
**Data Structure**:
- Operator ID (which operator they belong to)
- Full Name
- Email
- Birth Date
- Passport Number
- Passport Expiry Date
- Phone Number
- Nationality
- Emergency Contact
- Notes

#### 2.3 Direct Clients (B2C)
**Description**: Clients we serve directly
**Data Structure**:
- Full Name
- Email
- Birth Date
- Passport Number
- Passport Expiry Date
- Phone Number
- Nationality
- Emergency Contact
- Source (How they found us)
- Notes

**Common Features for All Client Types**:
- Add/Edit/Delete
- Search and filter
- Export to Excel/PDF
- View booking history
- View payment history

---

### 3. Suppliers Management
**Purpose**: Manage all service providers

#### 3.0 Cities (Master Data)
**Purpose**: Predefined list of cities for transfers, hotels, tours

**Data Structure**:
- City Name
- Country
- Airport Code (if applicable)
- Status (Active/Inactive)

**Features**:
- Add/Edit/Delete cities
- Used for:
  - Transfer routes (From/To)
  - Hotel locations
  - Tour destinations
  - Pickup/Drop-off points

---

#### 3.1 Hotels
**Data Structure**:
- Unique Hotel ID (system generated)
- Hotel Name
- Star Rating (1-5)
- Location/City
- Address
- Contact Person
- Phone Number
- Email
- **Pricing Structure (per person, per night)**:
  - Per Person in Double Room
  - Single Supplement (additional charge for single occupancy)
  - Per Person in Triple Room
  - **Child Pricing Slabs** (with 2 adults):
    - 00-02.99 years old
    - 03-05.99 years old
    - 06-11.99 years old
- Currency
- Commission Rate (%)
- Payment Terms
- Status (Active/Inactive)
- Notes

#### 3.2 Vehicle Companies
**Services Types**:
- Transfers (Route-based: From City to City)
- Daily Rentals

**Data Structure**:
- Company Name
- Contact Person
- Phone Number
- Email
- Vehicle Types (Sedan, Van, Minivan, Bus, etc.)
- Capacity per Vehicle Type

**Transfer Pricing** (Route-based):
- From City (predefined list)
- To City (predefined list)
- Vehicle Type
- Price per Vehicle
- Currency
- Notes (e.g., "Includes tolls", "Airport pickup")

**Vehicle Rental Pricing**:
- Vehicle Type
- **Full Day Rental**:
  - Price per Full Day
  - Included Hours (e.g., 10 hours)
  - Included KM
- **Half Day Rental**:
  - Price per Half Day
  - Included Hours (e.g., 5 hours)
  - Included KM
- **Night Rental**:
  - Price per Night
  - Included Hours
  - Included KM
- **Extra Charges**:
  - Extra Hour Rate
  - Extra KM Rate
- Currency

- Payment Terms
- Status (Active/Inactive)

#### 3.3 Guides
**Service Types**:
- Daily Rental
- Half Day Rental
- Night Rental
- Transfer

**Data Structure**:
- Guide Name
- Languages Spoken
- Phone Number
- Email
- Specialization (Historical, Religious, Adventure, etc.)
- Service Types Offered
- Pricing per Service Type:
  - Daily Rental Rate
  - Half Day Rate
  - Night Rate
  - Transfer Rate
- Currency
- Availability Calendar
- Rating
- Status (Active/Inactive)

#### 3.4 Restaurants
**Data Structure**:
- Restaurant Name
- Location/City
- Cuisine Type
- Contact Person
- Phone Number
- Email
- Pricing:
  - Lunch Cost per Person
  - Dinner Cost per Person
- Currency
- Menu Options (Standard, Vegetarian, Halal, etc.)
- Capacity
- Payment Terms
- Status (Active/Inactive)

#### 3.5 Entrance Fees
**Data Structure**:
- Site/Attraction Name
- Location/City
- Category (Museum, Historical Site, Park, etc.)
- Pricing:
  - Adult Price
  - Child Price
  - Student Price
  - Group Discount
- Currency (may differ per site)
- Opening Hours
- Special Requirements
- Status (Active/Inactive)

#### 3.6 Daily Tour Companies
**Tour Types**:
- SIC (Seat In Coach) - Fixed rate regardless of number of passengers
- PVT (Private) - Pricing slabs based on group size

**Data Structure**:
- Company Name
- Contact Person
- Phone Number
- Email
- Tour Name/Package
- Tour Type (SIC/PVT)
- Duration (Full Day, Half Day)
- Pricing Structure:
  - **SIC**: Fixed price per person
  - **PVT Slabs**:
    - 2 pax rate (per person)
    - 4 pax rate (per person)
    - 6 pax rate (per person)
    - 8 pax rate (per person)
    - 10+ pax rate (per person)
- Included Services
- Excluded Services
- Currency
- Available Days
- Payment Terms
- Status (Active/Inactive)

#### 3.7 Extra Expenses
**Data Structure**:
- Expense Name
- Category (Transportation, Tips, Special Services, etc.)
- Description
- Unit Price
- Currency
- Supplier (if applicable)
- Status (Active/Inactive)

---

### 4. Client Payments
**Purpose**: Track payments received from agents/clients

**Data Structure**:
- Payment ID (unique)
- Booking Reference
- Client/Operator Name
- Payment Date
- Amount
- Currency
- Payment Method (Bank Transfer, Credit Card, Cash, PayPal, etc.)
- Payment Status (Pending, Received, Partial, Refunded)
- Invoice Number
- Receipt Number
- Notes
- Attached Documents

**Features**:
- Record new payment
- Mark as paid/partial/refunded
- Generate receipts
- Payment reminders
- Filter by date, client, status
- Export reports

---

### 5. Supplier Payments
**Purpose**: Track payments made to suppliers

**Data Structure**:
- Payment ID (unique)
- Booking Reference
- Supplier Name
- Supplier Type (Hotel, Vehicle, Guide, etc.)
- Service Date
- Payment Date
- Amount
- Currency
- Payment Method
- Payment Status (Pending, Paid, Partial)
- Invoice Number
- Payment Reference
- Due Date
- Notes
- Attached Documents

**Features**:
- Record payment
- Mark as paid
- Payment schedule/reminders
- Filter by date, supplier, status
- Outstanding payments report
- Export reports

---

### 6. Reports
**Purpose**: Generate various reports for business analysis

**Report Types**:
1. **Sales Reports**
   - Daily/Weekly/Monthly sales
   - Sales by operator
   - Sales by destination
   - Revenue trends

2. **Financial Reports**
   - Profit & Loss
   - Outstanding payments (receivables)
   - Outstanding payments (payables)
   - Payment collection summary
   - Supplier payment summary

3. **Booking Reports**
   - Bookings by date range
   - Bookings by tour type
   - Cancellation reports
   - Occupancy rates

4. **Client Reports**
   - New clients
   - Client activity
   - Top clients by revenue

5. **Supplier Reports**
   - Supplier usage
   - Supplier performance
   - Cost analysis

**Features**:
- Date range selection
- Filter options
- Export to PDF/Excel
- Email reports
- Schedule automated reports

---

### 7. Vouchers
**Purpose**: Generate service vouchers for confirmed bookings

**Data Structure**:
- Voucher Number (unique)
- Booking Reference
- Service Type (Hotel, Transfer, Tour, etc.)
- Service Date
- Client Name
- Supplier Name
- Service Details
- Number of Passengers
- Special Requirements
- Confirmation Status
- Generated Date
- Generated By (user)

**Features**:
- Auto-generate from bookings
- Edit before sending
- Send to supplier (email/PDF)
- Track voucher status (Sent, Confirmed, Completed)
- Reprint vouchers
- Voucher templates

---

### 8. Users Management
**Purpose**: Operator can manage their team/staff

**User Roles** (for operators):
- Manager (full access to operator data)
- Reservation Staff (booking, clients)
- Accounts (payments, financial)
- Sales (clients, quotations)
- Operations (vouchers, supplier coordination)

**Data Structure**:
- Full Name
- Email (login)
- Role/Position
- Permissions Level
- Phone Number
- Status (Active/Inactive)
- Last Login
- Created Date

**Features**:
- Add/Edit/Delete users
- Assign roles and permissions
- Reset passwords
- Activity log
- Access control per module

**Note**: Super admin sees all operators and their users

---

### 9. Booking System (MOST IMPORTANT)
**Purpose**: Complete booking management with quotations

**Workflow**:
1. Create Booking
2. Generate Quotation
3. Get Approval
4. Confirm Booking
5. Generate Vouchers
6. Track Services
7. Complete & Invoice

**Data Structure**:

#### Booking Header
- Booking Code (unique, auto-generated)
- Booking Date
- Booking Status (Quote, Confirmed, In Progress, Completed, Cancelled)
- Client Type (Operator's Client / Direct Client)
- Client/Operator ID
- Lead Passenger Name
- Number of Passengers (Adults/Children)
- Travel Start Date
- Travel End Date
- Destination
- Total Amount
- Currency
- Payment Status
- Profit Margin
- Created By (user)
- Notes

#### Booking Services (Multiple)
Each booking can have multiple services:

**Service Types**:
1. Hotel Accommodation
   - Hotel ID
   - Check-in Date
   - Check-out Date
   - Room Type
   - Number of Rooms
   - Number of Nights
   - Cost per Night
   - Total Cost
   - Status

2. Transportation
   - Vehicle Company ID
   - Service Type (Transfer/Rental)
   - Date
   - Pickup Location
   - Drop-off Location
   - Vehicle Type
   - Cost
   - Status

3. Tour
   - Tour Company ID
   - Tour Name
   - Date
   - Tour Type (SIC/PVT)
   - Number of Passengers
   - Price per Person
   - Total Cost
   - Status

4. Guide
   - Guide ID
   - Service Type (Daily/Half Day/Night/Transfer)
   - Date
   - Duration
   - Cost
   - Status

5. Restaurant
   - Restaurant ID
   - Date
   - Meal Type (Lunch/Dinner)
   - Number of Persons
   - Cost per Person
   - Total Cost
   - Status

6. Entrance Fee
   - Site ID
   - Date
   - Number of Adults
   - Number of Children
   - Cost per Person
   - Total Cost
   - Status

7. Extra Expenses
   - Expense ID
   - Description
   - Quantity
   - Unit Cost
   - Total Cost
   - Status

#### Quotation
- Auto-calculate from selected services
- Add markup/commission
- Show breakdown by service
- Total amount
- Currency
- Valid until date
- Terms & Conditions
- Generate PDF
- Send to client/operator

#### Confirmation
- Convert quote to confirmed booking
- Send confirmation email
- Generate booking reference
- Update inventory/availability
- Create payment schedule

#### Vouchers Generation
- Auto-generate vouchers for each service
- Send to respective suppliers
- Track confirmation status

**Features**:
- Quick search bookings
- Calendar view
- Booking timeline
- Document attachments
- Email notifications
- WhatsApp integration (optional)
- Duplicate booking
- Modify booking
- Cancel booking
- Booking history
- Client communication log

---

## Database Schema Planning

### Required Tables (to be created):

0. **cities** (city_name, country, airport_code, is_active, created_at)

1. **clients** (operator_id, full_name, email, birth_date, passport_number, passport_expiry, phone, nationality, emergency_contact, client_type, source, notes)

2. **operators_clients** (operator_id, full_name, email, birth_date, passport_number, passport_expiry, phone, nationality, emergency_contact, notes)

3. **suppliers** (operator_id, supplier_type, name, contact_person, email, phone, address, status)

4. **hotels** (supplier_id, unique_hotel_id, star_rating, location, price_per_person_double, single_supplement, price_per_person_triple, child_price_0_2, child_price_3_5, child_price_6_11, currency, commission_rate)

5. **vehicle_companies** (supplier_id, company_name, contact_person, email, phone, payment_terms, status)

6. **vehicle_types** (vehicle_company_id, vehicle_type_name, capacity, description)

7. **transfer_routes** (vehicle_company_id, vehicle_type_id, from_city_id, to_city_id, price_per_vehicle, currency, notes)

8. **vehicle_rentals** (vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km, half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours, night_rental_km, extra_hour_rate, extra_km_rate, currency)

9. **guides** (supplier_id, name, languages, specialization, service_types, pricing_data, currency, availability)

10. **restaurants** (supplier_id, name, location, cuisine_type, lunch_cost, dinner_cost, currency, menu_options, capacity)

11. **entrance_fees** (supplier_id, site_name, location, category, adult_price, child_price, student_price, currency, opening_hours)

12. **tour_companies** (supplier_id, company_name, tour_name, tour_type, duration, pricing_structure, included_services, currency)

13. **extra_expenses** (supplier_id, expense_name, category, description, unit_price, currency)

14. **bookings** (operator_id, booking_code, client_id, status, travel_dates, total_amount, currency, profit_margin, created_by)

15. **booking_services** (booking_id, service_type, service_id, dates, quantity, cost, status)

16. **client_payments** (operator_id, booking_id, payment_date, amount, currency, payment_method, status)

17. **supplier_payments** (operator_id, booking_id, supplier_id, payment_date, amount, currency, payment_method, status)

18. **vouchers** (booking_id, service_id, voucher_number, generated_date, status)

19. **users_extended** (user_id, operator_id, role, permissions, status)

---

## Technology Stack Recommendations

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI or Ant Design (for admin dashboard)
- **State Management**: Redux or Context API
- **Forms**: React Hook Form
- **Data Tables**: AG Grid or React Table
- **Charts**: Chart.js or Recharts
- **Date Picker**: React Datepicker
- **PDF Generation**: jsPDF or React-PDF

### Backend (Already Setup)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (already implemented)

---

## Development Phases

### Phase 1: Dashboard Layout & Navigation
- Create responsive dashboard layout
- Implement sidebar navigation
- Setup routing for all modules
- Dashboard home page with statistics

### Phase 2: Client Management
- Database tables for clients
- CRUD operations for all client types
- Client list with search/filter
- Client detail page

### Phase 3: Supplier Management
- Database tables for all supplier types
- CRUD operations for each supplier type
- Supplier list with search/filter
- Pricing management

### Phase 4: Booking System (Core)
- Database schema for bookings
- Create booking workflow
- Service selection
- Quotation generation
- Booking confirmation

### Phase 5: Payment Tracking
- Client payment module
- Supplier payment module
- Payment reminders
- Financial reports

### Phase 6: Vouchers & Reports
- Voucher generation
- Report generation
- Email integration

### Phase 7: User Management
- User roles and permissions
- Access control
- Activity logging

---

## Security & Data Isolation

**CRITICAL**: All data must be filtered by `operator_id`
- Every table (except operators, users) includes `operator_id`
- All queries automatically filter by logged-in operator's ID
- Super admin can see all data
- Operators can ONLY see their own data

---

## Next Steps

1. Review this plan with you
2. Prioritize modules (which to build first)
3. Design database schema in detail
4. Create wireframes/mockups for UI
5. Start development phase by phase

---

**Created**: 2025-11-10
**Status**: Planning Phase
