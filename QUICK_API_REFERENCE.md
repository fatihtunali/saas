# Quick API Reference - Tour Operations SaaS

**Base URL:** `http://localhost:3000`
**Authentication:** All API endpoints require JWT token in Authorization header
**Format:** `Authorization: Bearer <your-jwt-token>`

---

## Authentication (No token required)

```
POST   /api/auth/register    # Register new operator
POST   /api/auth/login       # Login and get JWT token
GET    /api/auth/me          # Get current user info (requires token)
```

---

## Master Data

```
# Cities (Read-only seed data)
GET    /api/cities
GET    /api/cities/:id

# Currencies (Read-only seed data)
GET    /api/currencies
GET    /api/currencies/:id

# Exchange Rates (CRUD)
GET    /api/exchange-rates
GET    /api/exchange-rates/:id
POST   /api/exchange-rates
PUT    /api/exchange-rates/:id
DELETE /api/exchange-rates/:id

# Seasons (CRUD)
GET    /api/seasons
GET    /api/seasons/:id
POST   /api/seasons
PUT    /api/seasons/:id
DELETE /api/seasons/:id

# Seasonal Pricing (CRUD)
GET    /api/seasonal-pricing
GET    /api/seasonal-pricing/:id
POST   /api/seasonal-pricing
PUT    /api/seasonal-pricing/:id
DELETE /api/seasonal-pricing/:id

# Tax Rates (CRUD)
GET    /api/tax-rates
GET    /api/tax-rates/:id
POST   /api/tax-rates
PUT    /api/tax-rates/:id
DELETE /api/tax-rates/:id
```

---

## Suppliers

```
# Suppliers (CRUD)
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id

# Supplier Contacts (CRUD)
GET    /api/supplier-contacts?supplier_id=1
GET    /api/supplier-contacts/:id
POST   /api/supplier-contacts
PUT    /api/supplier-contacts/:id
DELETE /api/supplier-contacts/:id

# Supplier Ratings (CRUD)
GET    /api/supplier-ratings?supplier_id=1
GET    /api/supplier-ratings/:id
POST   /api/supplier-ratings
PUT    /api/supplier-ratings/:id
DELETE /api/supplier-ratings/:id

# Supplier Contracts (CRUD)
GET    /api/supplier-contracts?supplier_id=1
GET    /api/supplier-contracts/:id
POST   /api/supplier-contracts
PUT    /api/supplier-contracts/:id
DELETE /api/supplier-contracts/:id
```

---

## Hotels

```
# Hotels (CRUD - Per-person pricing)
GET    /api/hotels
GET    /api/hotels/:id
POST   /api/hotels
PUT    /api/hotels/:id
DELETE /api/hotels/:id

# Hotel Room Types (CRUD)
GET    /api/hotel-room-types?hotel_id=1
GET    /api/hotel-room-types/:id
POST   /api/hotel-room-types
PUT    /api/hotel-room-types/:id
DELETE /api/hotel-room-types/:id
```

---

## Vehicles

```
# Vehicle Companies (CRUD)
GET    /api/vehicle-companies
GET    /api/vehicle-companies/:id
POST   /api/vehicle-companies
PUT    /api/vehicle-companies/:id
DELETE /api/vehicle-companies/:id

# Vehicle Types (CRUD)
GET    /api/vehicle-types?vehicle_company_id=1
GET    /api/vehicle-types/:id
POST   /api/vehicle-types
PUT    /api/vehicle-types/:id
DELETE /api/vehicle-types/:id

# Transfer Routes (CRUD - City to city)
GET    /api/transfer-routes
GET    /api/transfer-routes/:id
POST   /api/transfer-routes
PUT    /api/transfer-routes/:id
DELETE /api/transfer-routes/:id

# Vehicle Rentals (CRUD - Full/Half/Night)
GET    /api/vehicle-rentals
GET    /api/vehicle-rentals/:id
POST   /api/vehicle-rentals
PUT    /api/vehicle-rentals/:id
DELETE /api/vehicle-rentals/:id

# Vehicle Maintenance (CRUD)
GET    /api/vehicle-maintenance
GET    /api/vehicle-maintenance/:id
POST   /api/vehicle-maintenance
PUT    /api/vehicle-maintenance/:id
DELETE /api/vehicle-maintenance/:id
```

---

## Other Services

```
# Guides (CRUD - Multiple rates)
GET    /api/guides
GET    /api/guides/:id
POST   /api/guides
PUT    /api/guides/:id
DELETE /api/guides/:id

# Restaurants (CRUD)
GET    /api/restaurants
GET    /api/restaurants/:id
POST   /api/restaurants
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

# Entrance Fees (CRUD)
GET    /api/entrance-fees
GET    /api/entrance-fees/:id
POST   /api/entrance-fees
PUT    /api/entrance-fees/:id
DELETE /api/entrance-fees/:id

# Tour Companies (CRUD - SIC vs PVT pricing)
GET    /api/tour-companies
GET    /api/tour-companies/:id
POST   /api/tour-companies
PUT    /api/tour-companies/:id
DELETE /api/tour-companies/:id

# Extra Expenses (CRUD)
GET    /api/extra-expenses
GET    /api/extra-expenses/:id
POST   /api/extra-expenses
PUT    /api/extra-expenses/:id
DELETE /api/extra-expenses/:id
```

---

## Clients

```
# Clients - B2C (CRUD)
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id

# Operators Clients - B2B (CRUD)
GET    /api/operators-clients
GET    /api/operators-clients/:id
POST   /api/operators-clients
PUT    /api/operators-clients/:id
DELETE /api/operators-clients/:id
```

---

## Quotations

```
# Quotations (CRUD)
GET    /api/quotations
GET    /api/quotations/:id         # Returns quotation with services
POST   /api/quotations
PUT    /api/quotations/:id
DELETE /api/quotations/:id

# Quotation Services (CRUD)
GET    /api/quotation-services?quotation_id=1
GET    /api/quotation-services/:id
POST   /api/quotation-services
PUT    /api/quotation-services/:id
DELETE /api/quotation-services/:id
```

---

## Bookings

```
# Bookings (CRUD)
GET    /api/bookings
GET    /api/bookings/:id            # Returns booking with passengers, services, flights
POST   /api/bookings                # Creates booking + activity log
PUT    /api/bookings/:id            # Updates booking + logs activity
DELETE /api/bookings/:id            # Soft delete

# Booking Passengers (CRUD - Critical for vouchers)
GET    /api/booking-passengers?booking_id=1
GET    /api/booking-passengers/:id
POST   /api/booking-passengers
PUT    /api/booking-passengers/:id
DELETE /api/booking-passengers/:id

# Booking Services (CRUD)
GET    /api/booking-services?booking_id=1
GET    /api/booking-services/:id
POST   /api/booking-services
PUT    /api/booking-services/:id
DELETE /api/booking-services/:id

# Booking Flights (CRUD)
GET    /api/booking-flights?booking_id=1
GET    /api/booking-flights/:id
POST   /api/booking-flights
PUT    /api/booking-flights/:id
DELETE /api/booking-flights/:id

# Booking Itinerary (CRUD)
GET    /api/booking-itinerary?booking_id=1
GET    /api/booking-itinerary/:id
POST   /api/booking-itinerary
PUT    /api/booking-itinerary/:id
DELETE /api/booking-itinerary/:id

# Booking Tasks (CRUD)
GET    /api/booking-tasks?booking_id=1
GET    /api/booking-tasks/:id
POST   /api/booking-tasks
PUT    /api/booking-tasks/:id
DELETE /api/booking-tasks/:id

# Booking Modifications (List + Create only)
GET    /api/booking-modifications?booking_id=1
GET    /api/booking-modifications/:id
POST   /api/booking-modifications

# Booking Activities (Immutable log - List + Create only)
GET    /api/booking-activities?booking_id=1
POST   /api/booking-activities
```

---

## Payments

```
# Bank Accounts (CRUD)
GET    /api/bank-accounts
GET    /api/bank-accounts/:id
POST   /api/bank-accounts
PUT    /api/bank-accounts/:id
DELETE /api/bank-accounts/:id

# Client Payments (CRUD)
GET    /api/client-payments?booking_id=1
GET    /api/client-payments/:id
POST   /api/client-payments
PUT    /api/client-payments/:id
DELETE /api/client-payments/:id

# Supplier Payments (CRUD)
GET    /api/supplier-payments?booking_id=1&supplier_id=1
GET    /api/supplier-payments/:id
POST   /api/supplier-payments
PUT    /api/supplier-payments/:id
DELETE /api/supplier-payments/:id

# Refunds (CRUD)
GET    /api/refunds?booking_id=1
GET    /api/refunds/:id
POST   /api/refunds
PUT    /api/refunds/:id
DELETE /api/refunds/:id

# Commissions (CRUD)
GET    /api/commissions?booking_id=1
GET    /api/commissions/:id
POST   /api/commissions
PUT    /api/commissions/:id
DELETE /api/commissions/:id
```

---

## Operations

```
# Pickup Locations (CRUD)
GET    /api/pickup-locations
GET    /api/pickup-locations/:id
POST   /api/pickup-locations
PUT    /api/pickup-locations/:id
DELETE /api/pickup-locations/:id

# Service Availability (CRUD)
GET    /api/service-availability
GET    /api/service-availability/:id
POST   /api/service-availability
PUT    /api/service-availability/:id
DELETE /api/service-availability/:id

# Cancellation Policies (CRUD)
GET    /api/cancellation-policies
GET    /api/cancellation-policies/:id
POST   /api/cancellation-policies
PUT    /api/cancellation-policies/:id
DELETE /api/cancellation-policies/:id

# Staff Schedule (CRUD)
GET    /api/staff-schedule
GET    /api/staff-schedule/:id
POST   /api/staff-schedule
PUT    /api/staff-schedule/:id
DELETE /api/staff-schedule/:id
```

---

## Passengers & Visas

```
# Visa Requirements - Global (CRUD)
GET    /api/visa-requirements
GET    /api/visa-requirements/:id
POST   /api/visa-requirements
PUT    /api/visa-requirements/:id
DELETE /api/visa-requirements/:id

# Passenger Visas (CRUD)
GET    /api/passenger-visas?booking_id=1
GET    /api/passenger-visas/:id
POST   /api/passenger-visas
PUT    /api/passenger-visas/:id
DELETE /api/passenger-visas/:id

# Travel Insurance (CRUD)
GET    /api/travel-insurance?booking_id=1
GET    /api/travel-insurance/:id
POST   /api/travel-insurance
PUT    /api/travel-insurance/:id
DELETE /api/travel-insurance/:id
```

---

## Documents

```
# Vouchers (CRUD)
GET    /api/vouchers?booking_id=1
GET    /api/vouchers/:id
POST   /api/vouchers
PUT    /api/vouchers/:id
DELETE /api/vouchers/:id

# Documents (CRUD)
GET    /api/documents?entity_type=booking&entity_id=1
GET    /api/documents/:id
POST   /api/documents
PUT    /api/documents/:id
DELETE /api/documents/:id

# Email Templates (CRUD)
GET    /api/email-templates
GET    /api/email-templates/:id
POST   /api/email-templates
PUT    /api/email-templates/:id
DELETE /api/email-templates/:id

# Document Templates (CRUD)
GET    /api/document-templates
GET    /api/document-templates/:id
POST   /api/document-templates
PUT    /api/document-templates/:id
DELETE /api/document-templates/:id

# Email Logs (List only - last 100)
GET    /api/email-logs

# Audit Logs (List only - last 100)
GET    /api/audit-logs

# Notifications (CRUD)
GET    /api/notifications
GET    /api/notifications/:id
POST   /api/notifications
PUT    /api/notifications/:id
PUT    /api/notifications/:id/mark-as-read
DELETE /api/notifications/:id

# Notification Settings (Per user)
GET    /api/notification-settings    # Get current user's settings
PUT    /api/notification-settings    # Update current user's settings
```

---

## Marketing

```
# Promotional Codes (CRUD)
GET    /api/promotional-codes
GET    /api/promotional-codes/:id
POST   /api/promotional-codes
PUT    /api/promotional-codes/:id
DELETE /api/promotional-codes/:id

# Marketing Campaigns (CRUD)
GET    /api/marketing-campaigns
GET    /api/marketing-campaigns/:id
POST   /api/marketing-campaigns
PUT    /api/marketing-campaigns/:id
DELETE /api/marketing-campaigns/:id

# Client Reviews (CRUD)
GET    /api/client-reviews?booking_id=1
GET    /api/client-reviews/:id
POST   /api/client-reviews
PUT    /api/client-reviews/:id
DELETE /api/client-reviews/:id

# Tour Waiting List (CRUD)
GET    /api/tour-waiting-list?tour_company_id=1
GET    /api/tour-waiting-list/:id
POST   /api/tour-waiting-list
PUT    /api/tour-waiting-list/:id
DELETE /api/tour-waiting-list/:id
```

---

## System

```
# API Keys (CRUD)
GET    /api/api-keys
GET    /api/api-keys/:id
POST   /api/api-keys
PUT    /api/api-keys/:id
DELETE /api/api-keys/:id

# Number Sequences (CRUD)
GET    /api/number-sequences
GET    /api/number-sequences/:id
POST   /api/number-sequences
PUT    /api/number-sequences/:id
DELETE /api/number-sequences/:id
```

---

## Common Patterns

### Query Parameters (Where supported)
- `?booking_id=1` - Filter by booking
- `?supplier_id=1` - Filter by supplier
- `?hotel_id=1` - Filter by hotel
- `?quotation_id=1` - Filter by quotation
- `?vehicle_company_id=1` - Filter by vehicle company

### Request Body (POST/PUT)
All create/update requests accept JSON in request body:
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Response Format
**Success (200/201):**
```json
{
  "id": 1,
  "field1": "value1",
  "created_at": "2025-11-10T12:00:00Z",
  "updated_at": "2025-11-10T12:00:00Z"
}
```

**Error (400/404/500):**
```json
{
  "error": "Error message"
}
```

### Soft Delete
DELETE requests don't remove records, they set `deleted_at` timestamp. Deleted records are automatically excluded from all LIST queries.

### Multi-Tenant
All queries automatically filter by `operator_id` based on JWT token. Super admin can see all data across operators.

---

## Example Workflow: Create a Complete Booking

```bash
# 1. Login
POST /api/auth/login
{
  "email": "operator@example.com",
  "password": "password123"
}
# Response: { token: "jwt-token-here" }

# 2. Create or select client
POST /api/clients
Authorization: Bearer <token>
{
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "nationality": "US"
}
# Response: { id: 1, ... }

# 3. Create booking
POST /api/bookings
Authorization: Bearer <token>
{
  "client_id": 1,
  "travel_start_date": "2025-12-01",
  "travel_end_date": "2025-12-10",
  "destination_city_id": 1,
  "num_adults": 2,
  "status": "confirmed",
  "total_selling_price": 2000,
  "currency": "USD"
}
# Response: { id: 1, booking_code: "BK-2025-001", ... }

# 4. Add passengers
POST /api/booking-passengers
Authorization: Bearer <token>
{
  "booking_id": 1,
  "passenger_type": "adult",
  "first_name": "John",
  "last_name": "Smith",
  "passport_number": "A12345678",
  "is_lead_passenger": true
}

POST /api/booking-passengers
Authorization: Bearer <token>
{
  "booking_id": 1,
  "passenger_type": "adult",
  "first_name": "Jane",
  "last_name": "Smith",
  "passport_number": "B87654321"
}

# 5. Add services (hotel)
POST /api/booking-services
Authorization: Bearer <token>
{
  "booking_id": 1,
  "service_date": "2025-12-01",
  "service_type": "hotel",
  "hotel_id": 1,
  "quantity": 5,
  "cost_amount": 500,
  "selling_price": 1000,
  "cost_currency": "USD"
}

# 6. Add flights
POST /api/booking-flights
Authorization: Bearer <token>
{
  "booking_id": 1,
  "flight_type": "arrival",
  "airline": "Turkish Airlines",
  "flight_number": "TK001",
  "flight_date": "2025-12-01",
  "flight_time": "14:30",
  "origin_airport": "JFK",
  "destination_airport": "IST"
}

# 7. Create voucher
POST /api/vouchers
Authorization: Bearer <token>
{
  "booking_id": 1,
  "voucher_type": "hotel",
  "status": "draft"
}

# 8. Get complete booking with all details
GET /api/bookings/1
Authorization: Bearer <token>
# Returns: booking + passengers + services + flights
```

---

## Health Check
```
GET /health
# No authentication required
# Returns: { success: true, message: "Server is running", timestamp: "..." }
```

---

**Total Endpoints:** 300+
**All endpoints require JWT authentication except /health and /api/auth/**
