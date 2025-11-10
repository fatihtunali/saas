-- =====================================================
-- DATABASE BACKUP: saas_db
-- Created: 2025-11-10T12:35:03.992Z
-- Host: 134.209.137.11
-- =====================================================

-- Total Tables: 62


-- =====================================================
-- Table: api_keys
-- =====================================================

-- Columns: id, operator_id, key_name, api_key, api_secret, permissions, rate_limit, requests_count, last_request_at, expires_at, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: audit_logs
-- =====================================================

-- Columns: id, operator_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: bank_accounts
-- =====================================================

-- Columns: id, operator_id, account_name, bank_name, account_number, iban, swift_code, currency, account_type, is_default, is_active, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_activities
-- =====================================================

-- Columns: id, operator_id, booking_id, activity_type, activity_description, user_id, metadata, created_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_flights
-- =====================================================

-- Columns: id, operator_id, booking_id, flight_type, airline, flight_number, flight_date, flight_time, origin_airport, destination_airport, terminal, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_itinerary
-- =====================================================

-- Columns: id, operator_id, booking_id, day_number, itinerary_date, title, description, morning_activity, afternoon_activity, evening_activity, accommodation_hotel_id, meal_plan, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_modifications
-- =====================================================

-- Columns: id, operator_id, booking_id, modification_type, old_data, new_data, price_difference, notes, modified_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_passengers
-- =====================================================

-- Columns: id, operator_id, booking_id, passenger_type, title, first_name, last_name, date_of_birth, age, gender, nationality, passport_number, passport_expiry_date, passport_issue_country, is_lead_passenger, email, phone, dietary_requirements, medical_conditions, accessibility_needs, special_notes, room_number, bed_type_preference, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_services
-- =====================================================

-- Columns: id, operator_id, booking_id, service_date, service_type, hotel_id, transfer_route_id, vehicle_rental_id, guide_id, restaurant_id, entrance_fee_id, tour_company_id, extra_expense_id, quantity, cost_amount, cost_currency, exchange_rate, cost_in_base_currency, selling_price, selling_currency, pickup_location_id, dropoff_location_id, pickup_time, service_description, service_notes, voucher_sent, voucher_sent_at, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: booking_tasks
-- =====================================================

-- Columns: id, operator_id, booking_id, task_title, task_description, task_type, assigned_to, due_date, priority, status, completed_at, completed_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: bookings
-- =====================================================

-- Columns: id, operator_id, booking_code, client_id, operators_client_id, travel_start_date, travel_end_date, destination_city_id, num_adults, num_children, children_ages, status, total_cost, total_selling_price, markup_percentage, profit_amount, tax_rate_id, tax_amount, total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source, referral_source, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, is_group_booking, group_name, group_leader_name, group_leader_contact, cancellation_policy_id, special_requests, internal_notes, created_by, cancelled_at, cancelled_by, cancellation_reason, cancellation_fee, refund_amount, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: cancellation_policies
-- =====================================================

-- Columns: id, operator_id, policy_name, service_type, service_id, full_refund_days, partial_refund_days, partial_refund_percentage, no_refund_days, policy_text, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: cities
-- =====================================================

-- Columns: id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at

-- Total rows: 15

INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (1, 'Istanbul', 'Turkey', 'city', 'IST', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (2, 'Ankara', 'Turkey', 'city', 'ANK', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (3, 'Izmir', 'Turkey', 'city', 'IZM', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (4, 'Antalya', 'Turkey', 'city', 'AYT', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (5, 'Cappadocia', 'Turkey', 'touristic_region', 'CAP', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (6, 'Pamukkale', 'Turkey', 'touristic_region', 'PAM', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (7, 'Ephesus', 'Turkey', 'touristic_region', 'EPH', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (8, 'Bodrum', 'Turkey', 'city', 'BJV', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (9, 'Kusadasi', 'Turkey', 'city', 'KUS', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (10, 'Fethiye', 'Turkey', 'city', 'FTH', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (11, 'Marmaris', 'Turkey', 'city', 'MRM', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (12, 'Alanya', 'Turkey', 'city', 'ALY', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (13, 'Bursa', 'Turkey', 'city', 'BTZ', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (14, 'Trabzon', 'Turkey', 'city', 'TZX', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO cities (id, name, country, city_type, code, latitude, longitude, picture_url, is_active, created_at, updated_at, deleted_at) VALUES (15, 'Konya', 'Turkey', 'city', 'KYA', NULL, NULL, NULL, true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);


-- =====================================================
-- Table: client_payments
-- =====================================================

-- Columns: id, operator_id, booking_id, payment_date, amount, currency, exchange_rate, amount_in_base_currency, payment_method, payment_reference, bank_account_id, status, notes, received_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: client_reviews
-- =====================================================

-- Columns: id, operator_id, booking_id, client_id, overall_rating, accommodation_rating, transportation_rating, guide_rating, value_rating, title, review_text, would_recommend, review_status, published, published_at, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: clients
-- =====================================================

-- Columns: id, operator_id, client_type, full_name, email, phone, birth_date, nationality, passport_number, passport_expiry_date, address, city, country, emergency_contact_name, emergency_contact_phone, dietary_requirements, accessibility_needs, medical_conditions, special_notes, payment_terms, credit_limit, credit_used, passport_alert_sent, passport_alert_date, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: commissions
-- =====================================================

-- Columns: id, operator_id, booking_id, user_id, partner_operator_id, commission_type, commission_base_amount, commission_percentage, commission_amount, currency, status, due_date, paid_date, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: currencies
-- =====================================================

-- Columns: id, code, name, symbol, is_active, created_at, updated_at, deleted_at

-- Total rows: 10

INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (1, 'TRY', 'Turkish Lira', '₺', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (2, 'USD', 'US Dollar', '$', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (3, 'EUR', 'Euro', '€', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (4, 'GBP', 'British Pound', '£', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (5, 'CHF', 'Swiss Franc', 'CHF', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (6, 'CAD', 'Canadian Dollar', 'C$', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (7, 'AUD', 'Australian Dollar', 'A$', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (8, 'SAR', 'Saudi Riyal', 'SAR', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (9, 'AED', 'UAE Dirham', 'AED', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);
INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at, deleted_at) VALUES (10, 'JPY', 'Japanese Yen', '¥', true, '2025-11-10T09:29:15.533Z', '2025-11-10T09:29:15.533Z', NULL);


-- =====================================================
-- Table: document_templates
-- =====================================================

-- Columns: id, operator_id, template_name, template_type, template_html, template_css, header_logo_url, footer_text, variables, paper_size, orientation, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: documents
-- =====================================================

-- Columns: id, operator_id, entity_type, entity_id, document_type, document_name, file_path, file_size, file_type, expiry_date, uploaded_by, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: email_logs
-- =====================================================

-- Columns: id, operator_id, recipient_email, recipient_name, subject, body, email_type, related_entity_type, related_entity_id, status, sent_at, error_message, sent_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: email_templates
-- =====================================================

-- Columns: id, operator_id, template_name, template_type, subject, body_html, body_text, variables, is_active, is_default, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: entrance_fees
-- =====================================================

-- Columns: id, operator_id, supplier_id, site_name, city_id, adult_price, child_price, student_price, senior_price, currency, opening_hours, best_visit_time, picture_url, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: exchange_rates
-- =====================================================

-- Columns: id, from_currency, to_currency, rate, rate_type, rate_date, source, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: extra_expenses
-- =====================================================

-- Columns: id, operator_id, supplier_id, expense_name, expense_category, price, currency, description, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: guides
-- =====================================================

-- Columns: id, operator_id, supplier_id, guide_name, phone, email, languages, daily_rate, half_day_rate, night_rate, transfer_rate, currency, specializations, license_number, profile_picture_url, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: hotel_room_types
-- =====================================================

-- Columns: id, operator_id, hotel_id, room_type, room_view, price_per_person_double, single_supplement, price_per_person_triple, currency, max_occupancy, room_size_sqm, amenities, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: hotels
-- =====================================================

-- Columns: id, operator_id, supplier_id, hotel_name, star_rating, city_id, address, phone, email, website, price_per_person_double, single_supplement, price_per_person_triple, child_price_0_2, child_price_3_5, child_price_6_11, currency, meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: marketing_campaigns
-- =====================================================

-- Columns: id, operator_id, campaign_name, campaign_type, start_date, end_date, target_audience, budget, currency, discount_code, impressions, clicks, conversions, revenue_generated, status, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: notification_settings
-- =====================================================

-- Columns: id, user_id, email_enabled, sms_enabled, notify_new_booking, notify_payment_received, notify_payment_due, notify_passport_expiry, notify_voucher_pending, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: notifications
-- =====================================================

-- Columns: id, operator_id, user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, read_at, priority, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: number_sequences
-- =====================================================

-- Columns: id, operator_id, sequence_type, prefix, current_number, year, format_pattern, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: operators
-- =====================================================

-- Columns: id, company_name, contact_email, contact_phone, address, is_active, created_at, updated_at, city, country, tax_id, base_currency, deleted_at

-- Total rows: 1

INSERT INTO operators (id, company_name, contact_email, contact_phone, address, is_active, created_at, updated_at, city, country, tax_id, base_currency, deleted_at) VALUES (1, 'Test Travel Agency', 'test@operator.com', '+1234567890', '123 Test Street', true, '2025-11-10T07:53:22.281Z', '2025-11-10T07:53:22.281Z', NULL, 'Turkey', NULL, 'TRY', NULL);


-- =====================================================
-- Table: operators_clients
-- =====================================================

-- Columns: id, operator_id, partner_operator_id, full_name, email, phone, birth_date, nationality, passport_number, passport_expiry_date, address, city, country, emergency_contact_name, emergency_contact_phone, dietary_requirements, accessibility_needs, medical_conditions, special_notes, payment_terms, credit_limit, credit_used, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: passenger_visas
-- =====================================================

-- Columns: id, passenger_id, booking_id, visa_type, visa_number, issue_date, expiry_date, application_status, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: pickup_locations
-- =====================================================

-- Columns: id, operator_id, location_type, name, address, city_id, latitude, longitude, contact_phone, instructions, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: promotional_codes
-- =====================================================

-- Columns: id, operator_id, code, description, discount_type, discount_value, currency, valid_from, valid_to, max_uses, used_count, min_booking_amount, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: quotation_services
-- =====================================================

-- Columns: id, quotation_id, service_type, service_description, quantity, unit_price, total_price, currency, service_date, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: quotations
-- =====================================================

-- Columns: id, operator_id, quotation_code, client_id, operators_client_id, travel_dates_from, travel_dates_to, num_passengers, total_amount, currency, valid_until, status, sent_at, viewed_at, accepted_at, converted_to_booking_id, notes, internal_notes, created_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: refunds
-- =====================================================

-- Columns: id, operator_id, booking_id, client_payment_id, refund_amount, currency, refund_reason, refund_method, refund_status, requested_date, approved_date, processed_date, approved_by, processed_by, refund_reference, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: restaurants
-- =====================================================

-- Columns: id, operator_id, supplier_id, restaurant_name, city_id, address, phone, lunch_price, dinner_price, currency, capacity, cuisine_type, menu_options, picture_url, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: seasonal_pricing
-- =====================================================

-- Columns: id, operator_id, season_id, service_type, service_id, price, currency, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: seasons
-- =====================================================

-- Columns: id, operator_id, season_name, start_date, end_date, price_multiplier, description, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: service_availability
-- =====================================================

-- Columns: id, operator_id, service_type, service_id, availability_date, available_quantity, booked_quantity, status, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: staff_schedule
-- =====================================================

-- Columns: id, operator_id, staff_type, staff_id, schedule_date, time_from, time_to, status, booking_id, booking_service_id, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: supplier_contacts
-- =====================================================

-- Columns: id, operator_id, supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: supplier_contracts
-- =====================================================

-- Columns: id, operator_id, supplier_id, contract_number, contract_type, start_date, end_date, payment_terms, cancellation_terms, special_rates, contract_value, currency, auto_renew, renewal_notice_days, contract_document_path, status, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: supplier_payments
-- =====================================================

-- Columns: id, operator_id, booking_id, booking_service_id, supplier_id, payment_date, due_date, amount, currency, exchange_rate, amount_in_base_currency, payment_method, payment_reference, bank_account_id, status, notes, paid_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: supplier_ratings
-- =====================================================

-- Columns: id, operator_id, supplier_id, booking_id, overall_rating, quality_rating, service_rating, value_rating, review_text, rated_by, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: suppliers
-- =====================================================

-- Columns: id, operator_id, supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: tax_rates
-- =====================================================

-- Columns: id, operator_id, tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: tour_companies
-- =====================================================

-- Columns: id, operator_id, supplier_id, company_name, tour_name, tour_type, duration_days, duration_hours, sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, currency, min_passengers, max_passengers, current_bookings, itinerary, inclusions, exclusions, picture_url, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: tour_waiting_list
-- =====================================================

-- Columns: id, operator_id, tour_company_id, tour_date, client_id, num_passengers, contact_email, contact_phone, status, notified_at, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: transfer_routes
-- =====================================================

-- Columns: id, operator_id, vehicle_company_id, vehicle_type_id, from_city_id, to_city_id, price_per_vehicle, currency, duration_hours, distance_km, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: travel_insurance
-- =====================================================

-- Columns: id, operator_id, booking_id, passenger_id, insurance_provider, policy_number, policy_type, coverage_amount, currency, valid_from, valid_to, emergency_contact_number, policy_document_path, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: users
-- =====================================================

-- Columns: id, email, password_hash, role, operator_id, is_active, created_at, updated_at, full_name, phone, last_login, deleted_at

-- Total rows: 2

INSERT INTO users (id, email, password_hash, role, operator_id, is_active, created_at, updated_at, full_name, phone, last_login, deleted_at) VALUES (1, 'fatihtunali@gmail.com', '$2b$10$wcWCWsNcm4PWrO1fHq8f6eADR.s2t9gtabQHFx7ne7no8JopV4r52', 'super_admin', NULL, true, '2025-11-10T07:43:39.466Z', '2025-11-10T07:43:39.466Z', NULL, NULL, NULL, NULL);
INSERT INTO users (id, email, password_hash, role, operator_id, is_active, created_at, updated_at, full_name, phone, last_login, deleted_at) VALUES (2, 'test@operator.com', '$2b$10$12gsfXzF..8CxdA53vWYhuVIbBQgOfQvcV9lwgzYIeYufer3woMA2', 'operator', 1, true, '2025-11-10T07:53:22.281Z', '2025-11-10T07:53:22.281Z', NULL, NULL, NULL, NULL);


-- =====================================================
-- Table: vehicle_companies
-- =====================================================

-- Columns: id, operator_id, supplier_id, company_name, contact_person, phone, email, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: vehicle_maintenance
-- =====================================================

-- Columns: id, operator_id, vehicle_company_id, vehicle_type_id, vehicle_plate_number, maintenance_type, maintenance_date, next_maintenance_date, description, cost, currency, performed_by, document_path, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: vehicle_rentals
-- =====================================================

-- Columns: id, operator_id, vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km, half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours, night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: vehicle_types
-- =====================================================

-- Columns: id, operator_id, vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: visa_requirements
-- =====================================================

-- Columns: id, from_country, to_country, visa_required, visa_type, processing_days, validity_days, required_documents, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Table: vouchers
-- =====================================================

-- Columns: id, operator_id, booking_id, booking_service_id, voucher_code, voucher_type, pdf_path, pdf_generated_at, status, sent_at, sent_to_email, notes, created_at, updated_at, deleted_at

-- Total rows: 0

-- No data in this table


-- =====================================================
-- Backup completed successfully
-- =====================================================
