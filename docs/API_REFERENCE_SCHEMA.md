# API Reference Schema - Complete Database Structure

**Source:** Database backup created 2025-11-10T12:35:03.992Z
**Total Tables:** 62
**Database:** your_database_name @ YOUR_SERVER_IP

---

## Standard Patterns for ALL Tables

### Common Columns (Present in ALL tables)
- `id` - SERIAL PRIMARY KEY (auto-increment)
- `created_at` - TIMESTAMP (auto-generated)
- `updated_at` - TIMESTAMP (auto-generated)
- `deleted_at` - TIMESTAMP NULL (soft delete pattern)

### Multi-Tenant Pattern
- Most tables have `operator_id` INTEGER NOT NULL for data isolation
- Super admin can access all data
- Operators can only access their own data (WHERE operator_id = ?)
- Exceptions: `visa_requirements` (global data)

### API Endpoint Standards
- All endpoints must filter by `operator_id` (except super admin)
- All LIST endpoints must exclude soft-deleted records (WHERE deleted_at IS NULL)
- All DELETE endpoints should soft delete (SET deleted_at = NOW())

---

## 1. SYSTEM & AUTHENTICATION (4 tables)

### 1.1 operators
**Columns:** id, company_name, contact_email, contact_phone, address, city, country, tax_id, base_currency, is_active, created_at, updated_at, deleted_at
**No operator_id** (this IS the operator table)
**Existing Data:** 1 record (Test Travel Agency)

### 1.2 users
**Columns:** id, email, password_hash, role, operator_id, full_name, phone, is_active, last_login, created_at, updated_at, deleted_at
**Role Values:** super_admin, operator, manager, staff, accountant, sales
**Constraint:** super_admin has operator_id = NULL, all others must have operator_id
**Existing Data:** 2 records (super admin + test operator)

### 1.3 api_keys
**Columns:** id, operator_id, key_name, api_key, api_secret, permissions (JSONB), rate_limit, requests_count, last_request_at, expires_at, is_active, created_at, updated_at, deleted_at

### 1.4 number_sequences
**Columns:** id, operator_id, sequence_type, prefix, current_number, year, format_pattern, created_at, updated_at, deleted_at
**Sequence Types:** booking, invoice, receipt, voucher, quotation
**Purpose:** Auto-generate unique codes per operator

---

## 2. MASTER DATA (6 tables)

### 2.1 cities ⭐ SEED DATA
**Columns:** id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at
**City Types:** city, touristic_region, airport
**No operator_id** (shared across all operators)
**Existing Data:** 15 cities including Istanbul, Ankara, Cappadocia, Pamukkale, Ephesus

### 2.2 currencies ⭐ SEED DATA
**Columns:** id, code, name, symbol, is_active, created_at, updated_at, deleted_at
**No operator_id** (shared across all operators)
**Existing Data:** 10 currencies (TRY, USD, EUR, GBP, CHF, CAD, AUD, SAR, AED, JPY)

### 2.3 exchange_rates
**Columns:** id, from_currency, to_currency, rate, rate_type, rate_date, source, created_at, updated_at, deleted_at
**Rate Types:** buying, selling, effective
**Source:** TCMB (Central Bank of Turkey)
**No operator_id** (shared across all operators)

### 2.4 seasons
**Columns:** id, operator_id, season_name, start_date, end_date, price_multiplier, description, created_at, updated_at, deleted_at
**Purpose:** Define seasonal pricing periods (high season, low season, etc.)

### 2.5 seasonal_pricing
**Columns:** id, operator_id, season_id, service_type, service_id, price, currency, created_at, updated_at, deleted_at
**Service Types:** hotel, tour, guide, etc.
**Purpose:** Override default prices during specific seasons

### 2.6 tax_rates
**Columns:** id, operator_id, tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active, created_at, updated_at, deleted_at
**Purpose:** Manage different tax rates by country/service

---

## 3. CLIENTS (2 tables)

### 3.1 clients (Direct B2C clients)
**Columns:** id, operator_id, client_type, full_name, email, phone, birth_date, nationality, passport_number, passport_expiry_date, address, city, country, emergency_contact_name, emergency_contact_phone, dietary_requirements, accessibility_needs, medical_conditions, special_notes, payment_terms, credit_limit, credit_used, passport_alert_sent, passport_alert_date, is_active, created_at, updated_at, deleted_at

### 3.2 operators_clients (B2B clients - other tour operators)
**Columns:** id, operator_id, partner_operator_id, full_name, email, phone, birth_date, nationality, passport_number, passport_expiry_date, address, city, country, emergency_contact_name, emergency_contact_phone, dietary_requirements, accessibility_needs, medical_conditions, special_notes, payment_terms, credit_limit, credit_used, is_active, created_at, updated_at, deleted_at
**Note:** Links operator to partner operators they work with

---

## 4. SUPPLIERS (4 base tables)

### 4.1 suppliers (Base table for all supplier types)
**Columns:** id, operator_id, supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active, created_at, updated_at, deleted_at
**Supplier Types:** hotel, vehicle, guide, restaurant, entrance, tour, other

### 4.2 supplier_contacts
**Columns:** id, operator_id, supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes, created_at, updated_at, deleted_at
**Contact Types:** sales, operations, finance, emergency

### 4.3 supplier_ratings
**Columns:** id, operator_id, supplier_id, booking_id, overall_rating, quality_rating, service_rating, value_rating, review_text, rated_by, created_at, updated_at, deleted_at
**Ratings:** 1-5 stars

### 4.4 supplier_contracts
**Columns:** id, operator_id, supplier_id, contract_number, contract_type, start_date, end_date, payment_terms, cancellation_terms, special_rates, contract_value, currency, auto_renew, renewal_notice_days, contract_document_path, status, notes, created_at, updated_at, deleted_at

---

## 5. HOTELS (2 tables) ⭐ PER-PERSON PRICING

### 5.1 hotels
**Columns:** id, operator_id, supplier_id, hotel_name, star_rating, city_id, address, phone, email, website, **price_per_person_double**, **single_supplement**, **price_per_person_triple**, **child_price_0_2**, **child_price_3_5**, **child_price_6_11**, currency, meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active, created_at, updated_at, deleted_at
**Meal Plans:** room_only, bed_breakfast, half_board, full_board, all_inclusive
**CRITICAL:** Pricing is PER PERSON, not per room!
**Child Age Ranges:** 0-2.99 years, 3-5.99 years, 6-11.99 years (with 2 adults)

### 5.2 hotel_room_types
**Columns:** id, operator_id, hotel_id, room_type, room_view, price_per_person_double, single_supplement, price_per_person_triple, currency, max_occupancy, room_size_sqm, amenities, created_at, updated_at, deleted_at
**Purpose:** Different room categories within same hotel

---

## 6. VEHICLES (5 tables)

### 6.1 vehicle_companies
**Columns:** id, operator_id, supplier_id, company_name, contact_person, phone, email, is_active, created_at, updated_at, deleted_at

### 6.2 vehicle_types
**Columns:** id, operator_id, vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active, created_at, updated_at, deleted_at
**Examples:** Sedan, Van, Minibus, Coach

### 6.3 transfer_routes ⭐ PREDEFINED ROUTES
**Columns:** id, operator_id, vehicle_company_id, vehicle_type_id, from_city_id, to_city_id, price_per_vehicle, currency, duration_hours, distance_km, notes, is_active, created_at, updated_at, deleted_at
**CRITICAL:** Transfers are city-to-city with predefined routes!
**Pricing:** Per vehicle (not per person)

### 6.4 vehicle_rentals ⭐ MULTIPLE RENTAL OPTIONS
**Columns:** id, operator_id, vehicle_company_id, vehicle_type_id, **full_day_price**, full_day_hours, full_day_km, **half_day_price**, half_day_hours, half_day_km, **night_rental_price**, night_rental_hours, night_rental_km, **extra_hour_rate**, **extra_km_rate**, currency, notes, is_active, created_at, updated_at, deleted_at
**CRITICAL:** Three rental types + extra charges!

### 6.5 vehicle_maintenance
**Columns:** id, operator_id, vehicle_company_id, vehicle_type_id, vehicle_plate_number, maintenance_type, maintenance_date, next_maintenance_date, description, cost, currency, performed_by, document_path, created_at, updated_at, deleted_at
**Maintenance Types:** service, repair, inspection, insurance_renewal, registration_renewal

---

## 7. OTHER SUPPLIERS (5 tables)

### 7.1 guides
**Columns:** id, operator_id, supplier_id, guide_name, phone, email, languages, **daily_rate**, **half_day_rate**, **night_rate**, **transfer_rate**, currency, specializations, license_number, profile_picture_url, notes, is_active, created_at, updated_at, deleted_at
**Multiple Rate Types:** daily, half_day, night, transfer

### 7.2 restaurants
**Columns:** id, operator_id, supplier_id, restaurant_name, city_id, address, phone, lunch_price, dinner_price, currency, capacity, cuisine_type, menu_options, picture_url, notes, is_active, created_at, updated_at, deleted_at

### 7.3 entrance_fees
**Columns:** id, operator_id, supplier_id, site_name, city_id, adult_price, child_price, student_price, senior_price, currency, opening_hours, best_visit_time, picture_url, notes, is_active, created_at, updated_at, deleted_at

### 7.4 tour_companies ⭐ SIC vs PVT PRICING
**Columns:** id, operator_id, supplier_id, company_name, tour_name, **tour_type**, duration_days, duration_hours, **sic_price**, **pvt_price_2_pax**, **pvt_price_4_pax**, **pvt_price_6_pax**, **pvt_price_8_pax**, **pvt_price_10_pax**, currency, min_passengers, max_passengers, current_bookings, itinerary, inclusions, exclusions, picture_url, notes, is_active, created_at, updated_at, deleted_at
**Tour Types:** SIC (Seat-in-Coach, fixed rate), PVT (Private, pricing by pax count)
**PVT Pricing Slabs:** 2, 4, 6, 8, 10 passengers

### 7.5 extra_expenses
**Columns:** id, operator_id, supplier_id, expense_name, expense_category, price, currency, description, notes, is_active, created_at, updated_at, deleted_at

---

## 8. QUOTATIONS (2 tables)

### 8.1 quotations
**Columns:** id, operator_id, quotation_code, client_id, operators_client_id, travel_dates_from, travel_dates_to, num_passengers, total_amount, currency, valid_until, status, sent_at, viewed_at, accepted_at, converted_to_booking_id, notes, internal_notes, created_by, created_at, updated_at, deleted_at
**Status Values:** draft, sent, viewed, accepted, rejected, expired
**Note:** Can convert to booking when accepted

### 8.2 quotation_services
**Columns:** id, quotation_id, service_type, service_description, quantity, unit_price, total_price, currency, service_date, created_at, updated_at, deleted_at

---

## 9. BOOKINGS (8 tables) ⭐⭐⭐ MOST IMPORTANT

### 9.1 bookings (Main booking table)
**Columns:** id, operator_id, booking_code, client_id, operators_client_id, travel_start_date, travel_end_date, destination_city_id, num_adults, num_children, children_ages (ARRAY), status, total_cost, total_selling_price, markup_percentage, profit_amount, tax_rate_id, tax_amount, total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source, referral_source, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, is_group_booking, group_name, group_leader_name, group_leader_contact, cancellation_policy_id, special_requests, internal_notes, created_by, cancelled_at, cancelled_by, cancellation_reason, cancellation_fee, refund_amount, created_at, updated_at, deleted_at
**Status Values:** quotation, confirmed, completed, cancelled
**Booking Sources:** website, phone, email, walk_in, agent, referral, social_media, google, other

### 9.2 booking_passengers ⭐⭐⭐ CRITICAL FOR VOUCHERS
**Columns:** id, operator_id, booking_id, passenger_type, title, first_name, last_name, date_of_birth, age, gender, nationality, passport_number, passport_expiry_date, passport_issue_country, is_lead_passenger, email, phone, dietary_requirements, medical_conditions, accessibility_needs, special_notes, room_number, bed_type_preference, created_at, updated_at, deleted_at
**Passenger Types:** adult, child, infant
**CRITICAL:** Individual passenger names required for voucher generation!

### 9.3 booking_services (Multi-service per booking)
**Columns:** id, operator_id, booking_id, service_date, service_type, hotel_id, transfer_route_id, vehicle_rental_id, guide_id, restaurant_id, entrance_fee_id, tour_company_id, extra_expense_id, quantity, cost_amount, cost_currency, exchange_rate, cost_in_base_currency, selling_price, selling_currency, pickup_location_id, dropoff_location_id, pickup_time, service_description, service_notes, voucher_sent, voucher_sent_at, created_at, updated_at, deleted_at
**Service Types:** hotel, transfer, vehicle_rental, guide, restaurant, entrance_fee, tour, extra
**Note:** Links to specific service tables based on type

### 9.4 booking_modifications
**Columns:** id, operator_id, booking_id, modification_type, old_data (JSONB), new_data (JSONB), price_difference, notes, modified_by, created_at, updated_at, deleted_at
**Modification Types:** date_change, service_change, passenger_change, price_adjustment, cancellation

### 9.5 booking_flights
**Columns:** id, operator_id, booking_id, flight_type, airline, flight_number, flight_date, flight_time, origin_airport, destination_airport, terminal, notes, created_at, updated_at, deleted_at
**Flight Types:** arrival, departure

### 9.6 booking_itinerary
**Columns:** id, operator_id, booking_id, day_number, itinerary_date, title, description, morning_activity, afternoon_activity, evening_activity, accommodation_hotel_id, meal_plan, created_at, updated_at, deleted_at

### 9.7 booking_activities (Audit trail)
**Columns:** id, operator_id, booking_id, activity_type, activity_description, user_id, metadata (JSONB), created_at
**Activity Types:** created, modified, confirmed, payment_received, voucher_sent, email_sent, note_added, status_changed, cancelled
**Note:** No updated_at or deleted_at (immutable log)

### 9.8 booking_tasks
**Columns:** id, operator_id, booking_id, task_title, task_description, task_type, assigned_to, due_date, priority, status, completed_at, completed_by, created_at, updated_at, deleted_at
**Task Types:** send_voucher, confirm_supplier, collect_payment, send_documents, follow_up, other
**Priority:** low, normal, high, urgent
**Status:** pending, in_progress, completed, cancelled

---

## 10. PAYMENTS (5 tables)

### 10.1 bank_accounts
**Columns:** id, operator_id, account_name, bank_name, account_number, iban, swift_code, currency, account_type, is_default, is_active, notes, created_at, updated_at, deleted_at
**Account Types:** checking, savings, business

### 10.2 client_payments
**Columns:** id, operator_id, booking_id, payment_date, amount, currency, exchange_rate, amount_in_base_currency, payment_method, payment_reference, bank_account_id, status, notes, received_by, created_at, updated_at, deleted_at
**Payment Methods:** bank_transfer, credit_card, cash, cheque, paypal, other
**Status:** pending, received, partial, refunded

### 10.3 supplier_payments
**Columns:** id, operator_id, booking_id, booking_service_id, supplier_id, payment_date, due_date, amount, currency, exchange_rate, amount_in_base_currency, payment_method, payment_reference, bank_account_id, status, notes, paid_by, created_at, updated_at, deleted_at
**Payment Methods:** bank_transfer, credit_card, cash, cheque, other
**Status:** pending, paid, partial, overdue

### 10.4 refunds
**Columns:** id, operator_id, booking_id, client_payment_id, refund_amount, currency, refund_reason, refund_method, refund_status, requested_date, approved_date, processed_date, approved_by, processed_by, refund_reference, notes, created_at, updated_at, deleted_at
**Refund Methods:** bank_transfer, credit_card, cash, credit_note
**Refund Status:** pending, approved, processed, completed, rejected

### 10.5 commissions
**Columns:** id, operator_id, booking_id, user_id, partner_operator_id, commission_type, commission_base_amount, commission_percentage, commission_amount, currency, status, due_date, paid_date, notes, created_at, updated_at, deleted_at
**Commission Types:** sales_staff, b2b_partner, referral, agent
**Status:** pending, approved, paid, cancelled

---

## 11. OPERATIONS (4 tables)

### 11.1 pickup_locations
**Columns:** id, operator_id, location_type, name, address, city_id, latitude, longitude, contact_phone, instructions, created_at, updated_at, deleted_at
**Location Types:** hotel, airport, port, train_station, address, landmark

### 11.2 service_availability
**Columns:** id, operator_id, service_type, service_id, availability_date, available_quantity, booked_quantity, status, notes, created_at, updated_at, deleted_at
**Service Types:** hotel, vehicle, guide, tour
**Status:** available, limited, sold_out, blocked
**Purpose:** Prevent overbooking

### 11.3 cancellation_policies
**Columns:** id, operator_id, policy_name, service_type, service_id, full_refund_days, partial_refund_days, partial_refund_percentage, no_refund_days, policy_text, is_active, created_at, updated_at, deleted_at
**Service Types:** hotel, tour, transfer, guide, general

### 11.4 staff_schedule
**Columns:** id, operator_id, staff_type, staff_id, schedule_date, time_from, time_to, status, booking_id, booking_service_id, notes, created_at, updated_at, deleted_at
**Staff Types:** guide, driver, coordinator
**Status:** available, booked, unavailable, on_leave

---

## 12. PASSENGERS (3 tables)

### 12.1 visa_requirements (Global table)
**Columns:** id, from_country, to_country, visa_required, visa_type, processing_days, validity_days, required_documents, notes, created_at, updated_at, deleted_at
**No operator_id** (shared global data)

### 12.2 passenger_visas
**Columns:** id, passenger_id, booking_id, visa_type, visa_number, issue_date, expiry_date, application_status, notes, created_at, updated_at, deleted_at
**Application Status:** not_started, pending, approved, rejected, received

### 12.3 travel_insurance
**Columns:** id, operator_id, booking_id, passenger_id, insurance_provider, policy_number, policy_type, coverage_amount, currency, valid_from, valid_to, emergency_contact_number, policy_document_path, created_at, updated_at, deleted_at

---

## 13. DOCUMENTS (8 tables)

### 13.1 vouchers
**Columns:** id, operator_id, booking_id, booking_service_id, voucher_code, voucher_type, pdf_path, pdf_generated_at, status, sent_at, sent_to_email, notes, created_at, updated_at, deleted_at
**Status:** draft, sent, confirmed, used, cancelled

### 13.2 documents
**Columns:** id, operator_id, entity_type, entity_id, document_type, document_name, file_path, file_size, file_type, expiry_date, uploaded_by, notes, created_at, updated_at, deleted_at
**Entity Types:** client, booking, supplier, payment, other

### 13.3 email_templates
**Columns:** id, operator_id, template_name, template_type, subject, body_html, body_text, variables, is_active, is_default, created_at, updated_at, deleted_at
**Template Types:** booking_confirmation, quotation, voucher, payment_receipt, reminder, cancellation, custom

### 13.4 document_templates
**Columns:** id, operator_id, template_name, template_type, template_html, template_css, header_logo_url, footer_text, variables, paper_size, orientation, is_active, created_at, updated_at, deleted_at
**Template Types:** voucher, invoice, quotation, receipt, itinerary, contract
**Paper Sizes:** A4, Letter
**Orientation:** portrait, landscape

### 13.5 email_logs
**Columns:** id, operator_id, recipient_email, recipient_name, subject, body, email_type, related_entity_type, related_entity_id, status, sent_at, error_message, sent_by, created_at, updated_at, deleted_at
**Status:** pending, sent, failed, bounced

### 13.6 audit_logs
**Columns:** id, operator_id, user_id, action, table_name, record_id, old_values (JSONB), new_values (JSONB), ip_address, user_agent, created_at, updated_at, deleted_at
**Actions:** create, update, delete, view, export, login, logout

### 13.7 notifications
**Columns:** id, operator_id, user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, read_at, priority, created_at, updated_at, deleted_at
**Notification Types:** booking, payment, expiry, reminder, system
**Priority:** low, normal, high, urgent

### 13.8 notification_settings
**Columns:** id, user_id, email_enabled, sms_enabled, notify_new_booking, notify_payment_received, notify_payment_due, notify_passport_expiry, notify_voucher_pending, created_at, updated_at, deleted_at

---

## 14. MARKETING (4 tables)

### 14.1 promotional_codes
**Columns:** id, operator_id, code, description, discount_type, discount_value, currency, valid_from, valid_to, max_uses, used_count, min_booking_amount, is_active, created_at, updated_at, deleted_at
**Discount Types:** percentage, fixed_amount

### 14.2 marketing_campaigns
**Columns:** id, operator_id, campaign_name, campaign_type, start_date, end_date, target_audience, budget, currency, discount_code, impressions, clicks, conversions, revenue_generated, status, notes, created_at, updated_at, deleted_at
**Campaign Types:** email, social_media, paid_ads, referral, seasonal_offer
**Status:** draft, active, paused, completed

### 14.3 client_reviews
**Columns:** id, operator_id, booking_id, client_id, overall_rating, accommodation_rating, transportation_rating, guide_rating, value_rating, title, review_text, would_recommend, review_status, published, published_at, created_at, updated_at, deleted_at
**Ratings:** 1-5 stars
**Review Status:** pending, approved, rejected, published

### 14.4 tour_waiting_list
**Columns:** id, operator_id, tour_company_id, tour_date, client_id, num_passengers, contact_email, contact_phone, status, notified_at, created_at, updated_at, deleted_at
**Status:** waiting, confirmed, cancelled, expired

---

## API Development Rules

### 1. Multi-Tenant Isolation
```javascript
// Every query must filter by operator_id (except super admin)
const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;
if (operatorId) {
  query.where('operator_id', operatorId);
}
```

### 2. Soft Delete
```javascript
// LIST: Exclude deleted records
query.whereNull('deleted_at');

// DELETE: Soft delete instead of hard delete
await table.update({ deleted_at: new Date() });
```

### 3. Standard CRUD Endpoints for Each Table
- `GET /api/{resource}` - List all (with pagination)
- `GET /api/{resource}/:id` - Get single record
- `POST /api/{resource}` - Create new
- `PUT /api/{resource}/:id` - Update existing
- `DELETE /api/{resource}/:id` - Soft delete

### 4. Date/Time Format
- **Dates:** DD/MM/YYYY format in API responses
- **Times:** HH:MM (24-hour) format
- Store as ISO in database, format on output

### 5. Currency Handling
- Always include currency code with amounts
- Store exchange_rate when converting
- Store both original and base currency amounts

### 6. Validation Rules
- Email format validation
- Phone number validation
- Passport expiry date alerts
- Credit limit checks
- Availability checks before booking

---

## Priority Order for API Development

1. **Master Data** (Cities, Currencies, Exchange Rates)
2. **Suppliers** (Base suppliers, Hotels, Vehicles, Guides, etc.)
3. **Clients** (Direct & B2B clients)
4. **Quotations** (Quote management)
5. **Bookings** ⭐ (Most complex - main feature)
6. **Payments** (Client & Supplier payments)
7. **Vouchers & Documents**
8. **Reports & Analytics**

---

**This document is the SINGLE SOURCE OF TRUTH for API development.**
**All endpoints must match these exact column names and data types.**
