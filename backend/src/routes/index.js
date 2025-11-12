const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import controllers
const masterDataController = require('../controllers/masterDataController');
const supplierController = require('../controllers/supplierController');
const hotelController = require('../controllers/hotelController');
const vehicleController = require('../controllers/vehicleController');
const otherServicesController = require('../controllers/otherServicesController');
const clientController = require('../controllers/clientController');
const quotationController = require('../controllers/quotationController');
const bookingController = require('../controllers/bookingController');
const allRemainingController = require('../controllers/allRemainingController');
const reportsController = require('../controllers/reportsController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const dashboardController = require('../controllers/dashboardController');

// Import permissions middleware - Phase 9
const { requirePermission, getMyPermissions } = require('../middleware/permissions');

// ============================================
// AUTH ROUTES (Phase 9 Updated)
// ============================================

// Public auth routes (no token required)
const authRouter = require('./auth');
router.use('/api/auth', authRouter);

// Profile routes (authenticated users)
router.get('/api/profile', authenticateToken, authController.getProfile);
router.put('/api/profile', authenticateToken, authController.updateProfile);
router.put('/api/profile/password', authenticateToken, authController.changePassword);

// Get my permissions (authenticated users)
router.get('/api/permissions/me', authenticateToken, getMyPermissions);

// ============================================
// USER MANAGEMENT ROUTES (Phase 9)
// ============================================

// List all users (with multi-tenant filtering)
router.get('/api/users', authenticateToken, requirePermission('users', 'view'), userController.getAllUsers);

// Get single user by ID
router.get('/api/users/:id', authenticateToken, requirePermission('users', 'view'), userController.getUserById);

// Create new user
router.post('/api/users', authenticateToken, requirePermission('users', 'create'), userController.createUser);

// Update user details
router.put('/api/users/:id', authenticateToken, requirePermission('users', 'edit'), userController.updateUser);

// Delete user (soft delete)
router.delete('/api/users/:id', authenticateToken, requirePermission('users', 'delete'), userController.deleteUser);

// Update password (user changes their own password)
router.put('/api/users/:id/password', authenticateToken, userController.updatePassword);

// Reset password (admin resets another user's password)
router.post('/api/users/:id/reset-password', authenticateToken, requirePermission('users', 'edit'), userController.resetPassword);

// Toggle user status (activate/deactivate)
router.put('/api/users/:id/status', authenticateToken, requirePermission('users', 'edit'), userController.toggleUserStatus);

// Update last login timestamp
router.put('/api/users/:id/last-login', authenticateToken, userController.updateLastLogin);

// Get user activity log
router.get('/api/users/:id/activity', authenticateToken, userController.getUserActivity);

// Get users by role
router.get('/api/users/by-role/:role', authenticateToken, requirePermission('users', 'view'), userController.getUsersByRole);

// ============================================
// DASHBOARD ROUTES (Phase 3)
// ============================================

// Dashboard statistics (bookings, revenue, receivables, payables)
router.get('/api/dashboard/stats', authenticateToken, requirePermission('dashboard', 'view'), dashboardController.getDashboardStats);

// Revenue chart data
router.get('/api/dashboard/revenue', authenticateToken, requirePermission('dashboard', 'view'), dashboardController.getRevenueChart);

// Bookings chart data (status breakdown)
router.get('/api/dashboard/bookings', authenticateToken, requirePermission('dashboard', 'view'), dashboardController.getBookingsChart);

// Recent activity feed (bookings, payments, modifications)
router.get('/api/dashboard/activity', authenticateToken, requirePermission('dashboard', 'view'), dashboardController.getRecentActivity);

// Upcoming tours
router.get('/api/dashboard/upcoming-tours', authenticateToken, requirePermission('dashboard', 'view'), dashboardController.getUpcomingTours);

// ============================================
// MASTER DATA ROUTES
// ============================================

// Cities (Read-only seed data)
router.get('/api/cities', authenticateToken, masterDataController.getCities);
router.get('/api/cities/:id', authenticateToken, masterDataController.getCityById);

// Currencies (Read-only seed data)
router.get('/api/currencies', authenticateToken, masterDataController.getCurrencies);
router.get('/api/currencies/:id', authenticateToken, masterDataController.getCurrencyById);

// Exchange Rates
router.get('/api/exchange-rates', authenticateToken, masterDataController.getExchangeRates);
router.get('/api/exchange-rates/:id', authenticateToken, masterDataController.getExchangeRateById);
router.post('/api/exchange-rates', authenticateToken, masterDataController.createExchangeRate);
router.put('/api/exchange-rates/:id', authenticateToken, masterDataController.updateExchangeRate);
router.delete('/api/exchange-rates/:id', authenticateToken, masterDataController.deleteExchangeRate);

// Seasons
router.get('/api/seasons', authenticateToken, masterDataController.getSeasons);
router.get('/api/seasons/:id', authenticateToken, masterDataController.getSeasonById);
router.post('/api/seasons', authenticateToken, masterDataController.createSeason);
router.put('/api/seasons/:id', authenticateToken, masterDataController.updateSeason);
router.delete('/api/seasons/:id', authenticateToken, masterDataController.deleteSeason);

// Seasonal Pricing
router.get('/api/seasonal-pricing', authenticateToken, masterDataController.getSeasonalPricing);
router.get('/api/seasonal-pricing/:id', authenticateToken, masterDataController.getSeasonalPricingById);
router.post('/api/seasonal-pricing', authenticateToken, masterDataController.createSeasonalPricing);
router.put('/api/seasonal-pricing/:id', authenticateToken, masterDataController.updateSeasonalPricing);
router.delete('/api/seasonal-pricing/:id', authenticateToken, masterDataController.deleteSeasonalPricing);

// Tax Rates
router.get('/api/tax-rates', authenticateToken, masterDataController.getTaxRates);
router.get('/api/tax-rates/:id', authenticateToken, masterDataController.getTaxRateById);
router.post('/api/tax-rates', authenticateToken, masterDataController.createTaxRate);
router.put('/api/tax-rates/:id', authenticateToken, masterDataController.updateTaxRate);
router.delete('/api/tax-rates/:id', authenticateToken, masterDataController.deleteTaxRate);

// ============================================
// SUPPLIER ROUTES
// ============================================

// Suppliers (Base table)
router.get('/api/suppliers', authenticateToken, supplierController.getSuppliers);
router.get('/api/suppliers/:id', authenticateToken, supplierController.getSupplierById);
router.post('/api/suppliers', authenticateToken, supplierController.createSupplier);
router.put('/api/suppliers/:id', authenticateToken, supplierController.updateSupplier);
router.delete('/api/suppliers/:id', authenticateToken, supplierController.deleteSupplier);

// Supplier Contacts
router.get('/api/supplier-contacts', authenticateToken, supplierController.getSupplierContacts);
router.get('/api/supplier-contacts/:id', authenticateToken, supplierController.getSupplierContactById);
router.post('/api/supplier-contacts', authenticateToken, supplierController.createSupplierContact);
router.put('/api/supplier-contacts/:id', authenticateToken, supplierController.updateSupplierContact);
router.delete('/api/supplier-contacts/:id', authenticateToken, supplierController.deleteSupplierContact);

// Supplier Ratings
router.get('/api/supplier-ratings', authenticateToken, supplierController.getSupplierRatings);
router.get('/api/supplier-ratings/:id', authenticateToken, supplierController.getSupplierRatingById);
router.post('/api/supplier-ratings', authenticateToken, supplierController.createSupplierRating);
router.put('/api/supplier-ratings/:id', authenticateToken, supplierController.updateSupplierRating);
router.delete('/api/supplier-ratings/:id', authenticateToken, supplierController.deleteSupplierRating);

// Supplier Contracts
router.get('/api/supplier-contracts', authenticateToken, supplierController.getSupplierContracts);
router.get('/api/supplier-contracts/:id', authenticateToken, supplierController.getSupplierContractById);
router.post('/api/supplier-contracts', authenticateToken, supplierController.createSupplierContract);
router.put('/api/supplier-contracts/:id', authenticateToken, supplierController.updateSupplierContract);
router.delete('/api/supplier-contracts/:id', authenticateToken, supplierController.deleteSupplierContract);

// ============================================
// HOTEL ROUTES
// ============================================

// Hotels
router.get('/api/hotels', authenticateToken, hotelController.getHotels);
router.get('/api/hotels/:id', authenticateToken, hotelController.getHotelById);
router.post('/api/hotels', authenticateToken, hotelController.createHotel);
router.put('/api/hotels/:id', authenticateToken, hotelController.updateHotel);
router.delete('/api/hotels/:id', authenticateToken, hotelController.deleteHotel);

// Hotel Room Types
router.get('/api/hotel-room-types', authenticateToken, hotelController.getHotelRoomTypes);
router.get('/api/hotel-room-types/:id', authenticateToken, hotelController.getHotelRoomTypeById);
router.post('/api/hotel-room-types', authenticateToken, hotelController.createHotelRoomType);
router.put('/api/hotel-room-types/:id', authenticateToken, hotelController.updateHotelRoomType);
router.delete('/api/hotel-room-types/:id', authenticateToken, hotelController.deleteHotelRoomType);

// ============================================
// VEHICLE ROUTES
// ============================================

// Vehicle Companies
router.get('/api/vehicle-companies', authenticateToken, vehicleController.getVehicleCompanies);
router.get('/api/vehicle-companies/:id', authenticateToken, vehicleController.getVehicleCompanyById);
router.post('/api/vehicle-companies', authenticateToken, vehicleController.createVehicleCompany);
router.put('/api/vehicle-companies/:id', authenticateToken, vehicleController.updateVehicleCompany);
router.delete('/api/vehicle-companies/:id', authenticateToken, vehicleController.deleteVehicleCompany);

// Vehicle Types
router.get('/api/vehicle-types', authenticateToken, vehicleController.getVehicleTypes);
router.get('/api/vehicle-types/:id', authenticateToken, vehicleController.getVehicleTypeById);
router.post('/api/vehicle-types', authenticateToken, vehicleController.createVehicleType);
router.put('/api/vehicle-types/:id', authenticateToken, vehicleController.updateVehicleType);
router.delete('/api/vehicle-types/:id', authenticateToken, vehicleController.deleteVehicleType);

// Transfer Routes
router.get('/api/transfer-routes', authenticateToken, vehicleController.getTransferRoutes);
router.get('/api/transfer-routes/:id', authenticateToken, vehicleController.getTransferRouteById);
router.post('/api/transfer-routes', authenticateToken, vehicleController.createTransferRoute);
router.put('/api/transfer-routes/:id', authenticateToken, vehicleController.updateTransferRoute);
router.delete('/api/transfer-routes/:id', authenticateToken, vehicleController.deleteTransferRoute);

// Vehicle Rentals
router.get('/api/vehicle-rentals', authenticateToken, vehicleController.getVehicleRentals);
router.get('/api/vehicle-rentals/:id', authenticateToken, vehicleController.getVehicleRentalById);
router.post('/api/vehicle-rentals', authenticateToken, vehicleController.createVehicleRental);
router.put('/api/vehicle-rentals/:id', authenticateToken, vehicleController.updateVehicleRental);
router.delete('/api/vehicle-rentals/:id', authenticateToken, vehicleController.deleteVehicleRental);

// ============================================
// OTHER SERVICES ROUTES
// ============================================

// Guides
router.get('/api/guides', authenticateToken, otherServicesController.getGuides);
router.get('/api/guides/:id', authenticateToken, otherServicesController.getGuideById);
router.post('/api/guides', authenticateToken, otherServicesController.createGuide);
router.put('/api/guides/:id', authenticateToken, otherServicesController.updateGuide);
router.delete('/api/guides/:id', authenticateToken, otherServicesController.deleteGuide);

// Restaurants
router.get('/api/restaurants', authenticateToken, otherServicesController.getRestaurants);
router.get('/api/restaurants/:id', authenticateToken, otherServicesController.getRestaurantById);
router.post('/api/restaurants', authenticateToken, otherServicesController.createRestaurant);
router.put('/api/restaurants/:id', authenticateToken, otherServicesController.updateRestaurant);
router.delete('/api/restaurants/:id', authenticateToken, otherServicesController.deleteRestaurant);

// Entrance Fees
router.get('/api/entrance-fees', authenticateToken, otherServicesController.getEntranceFees);
router.get('/api/entrance-fees/:id', authenticateToken, otherServicesController.getEntranceFeeById);
router.post('/api/entrance-fees', authenticateToken, otherServicesController.createEntranceFee);
router.put('/api/entrance-fees/:id', authenticateToken, otherServicesController.updateEntranceFee);
router.delete('/api/entrance-fees/:id', authenticateToken, otherServicesController.deleteEntranceFee);

// Tour Companies
router.get('/api/tour-companies', authenticateToken, otherServicesController.getTourCompanies);
router.get('/api/tour-companies/:id', authenticateToken, otherServicesController.getTourCompanyById);
router.post('/api/tour-companies', authenticateToken, otherServicesController.createTourCompany);
router.put('/api/tour-companies/:id', authenticateToken, otherServicesController.updateTourCompany);
router.delete('/api/tour-companies/:id', authenticateToken, otherServicesController.deleteTourCompany);

// Extra Expenses
router.get('/api/extra-expenses', authenticateToken, otherServicesController.getExtraExpenses);
router.get('/api/extra-expenses/:id', authenticateToken, otherServicesController.getExtraExpenseById);
router.post('/api/extra-expenses', authenticateToken, otherServicesController.createExtraExpense);
router.put('/api/extra-expenses/:id', authenticateToken, otherServicesController.updateExtraExpense);
router.delete('/api/extra-expenses/:id', authenticateToken, otherServicesController.deleteExtraExpense);

// ============================================
// CLIENT ROUTES
// ============================================

// Clients (B2C)
router.get('/api/clients', authenticateToken, clientController.getClients);
router.get('/api/clients/:id', authenticateToken, clientController.getClientById);
router.post('/api/clients', authenticateToken, clientController.createClient);
router.put('/api/clients/:id', authenticateToken, clientController.updateClient);
router.delete('/api/clients/:id', authenticateToken, clientController.deleteClient);

// Operators Clients (B2B)
router.get('/api/operators-clients', authenticateToken, clientController.getOperatorsClients);
router.get('/api/operators-clients/:id', authenticateToken, clientController.getOperatorsClientById);
router.post('/api/operators-clients', authenticateToken, clientController.createOperatorsClient);
router.put('/api/operators-clients/:id', authenticateToken, clientController.updateOperatorsClient);
router.delete('/api/operators-clients/:id', authenticateToken, clientController.deleteOperatorsClient);

// Operators Management (Super Admin)
router.get('/api/operators', authenticateToken, clientController.getOperators);
router.get('/api/operators/:id', authenticateToken, clientController.getOperatorById);
router.post('/api/operators', authenticateToken, clientController.createOperator);
router.put('/api/operators/:id', authenticateToken, clientController.updateOperator);
router.delete('/api/operators/:id', authenticateToken, clientController.deleteOperator);

// ============================================
// QUOTATION ROUTES
// ============================================

// Quotations
router.get('/api/quotations', authenticateToken, quotationController.getQuotations);
router.get('/api/quotations/:id', authenticateToken, quotationController.getQuotationById);
router.post('/api/quotations', authenticateToken, quotationController.createQuotation);
router.put('/api/quotations/:id', authenticateToken, quotationController.updateQuotation);
router.delete('/api/quotations/:id', authenticateToken, quotationController.deleteQuotation);

// Quotation Services
router.get('/api/quotation-services', authenticateToken, quotationController.getQuotationServices);
router.get('/api/quotation-services/:id', authenticateToken, quotationController.getQuotationServiceById);
router.post('/api/quotation-services', authenticateToken, quotationController.createQuotationService);
router.put('/api/quotation-services/:id', authenticateToken, quotationController.updateQuotationService);
router.delete('/api/quotation-services/:id', authenticateToken, quotationController.deleteQuotationService);

// ============================================
// BOOKING ROUTES
// ============================================

// Bookings
router.get('/api/bookings', authenticateToken, bookingController.getBookings);
router.get('/api/bookings/:id', authenticateToken, bookingController.getBookingById);
router.post('/api/bookings', authenticateToken, bookingController.createBooking);
router.put('/api/bookings/:id', authenticateToken, bookingController.updateBooking);
router.delete('/api/bookings/:id', authenticateToken, bookingController.deleteBooking);

// Booking Passengers
router.get('/api/booking-passengers', authenticateToken, bookingController.getBookingPassengers);
router.get('/api/booking-passengers/:id', authenticateToken, bookingController.getBookingPassengerById);
router.post('/api/booking-passengers', authenticateToken, bookingController.createBookingPassenger);
router.put('/api/booking-passengers/:id', authenticateToken, bookingController.updateBookingPassenger);
router.delete('/api/booking-passengers/:id', authenticateToken, bookingController.deleteBookingPassenger);

// Booking Services
router.get('/api/booking-services', authenticateToken, allRemainingController.bookingServices.getAll);
router.get('/api/booking-services/:id', authenticateToken, allRemainingController.bookingServices.getById);
router.post('/api/booking-services', authenticateToken, allRemainingController.bookingServices.create);
router.put('/api/booking-services/:id', authenticateToken, allRemainingController.bookingServices.update);
router.delete('/api/booking-services/:id', authenticateToken, allRemainingController.bookingServices.delete);

// Booking Flights
router.get('/api/booking-flights', authenticateToken, allRemainingController.bookingFlights.getAll);
router.get('/api/booking-flights/:id', authenticateToken, allRemainingController.bookingFlights.getById);
router.post('/api/booking-flights', authenticateToken, allRemainingController.bookingFlights.create);
router.put('/api/booking-flights/:id', authenticateToken, allRemainingController.bookingFlights.update);
router.delete('/api/booking-flights/:id', authenticateToken, allRemainingController.bookingFlights.delete);

// Booking Itinerary
router.get('/api/booking-itinerary', authenticateToken, allRemainingController.bookingItinerary.getAll);
router.get('/api/booking-itinerary/:id', authenticateToken, allRemainingController.bookingItinerary.getById);
router.post('/api/booking-itinerary', authenticateToken, allRemainingController.bookingItinerary.create);
router.put('/api/booking-itinerary/:id', authenticateToken, allRemainingController.bookingItinerary.update);
router.delete('/api/booking-itinerary/:id', authenticateToken, allRemainingController.bookingItinerary.delete);

// Booking Tasks
router.get('/api/booking-tasks', authenticateToken, allRemainingController.bookingTasks.getAll);
router.get('/api/booking-tasks/:id', authenticateToken, allRemainingController.bookingTasks.getById);
router.post('/api/booking-tasks', authenticateToken, allRemainingController.bookingTasks.create);
router.put('/api/booking-tasks/:id', authenticateToken, allRemainingController.bookingTasks.update);
router.delete('/api/booking-tasks/:id', authenticateToken, allRemainingController.bookingTasks.delete);

// Booking Modifications
router.get('/api/booking-modifications', authenticateToken, allRemainingController.bookingModifications.getAll);
router.get('/api/booking-modifications/:id', authenticateToken, allRemainingController.bookingModifications.getById);
router.post('/api/booking-modifications', authenticateToken, allRemainingController.bookingModifications.create);

// Booking Activities (Immutable log)
router.get('/api/booking-activities', authenticateToken, allRemainingController.bookingActivities.getAll);
router.post('/api/booking-activities', authenticateToken, allRemainingController.bookingActivities.create);

// ============================================
// PAYMENT ROUTES
// ============================================

// Bank Accounts
router.get('/api/bank-accounts', authenticateToken, allRemainingController.bankAccounts.getAll);
router.get('/api/bank-accounts/:id', authenticateToken, allRemainingController.bankAccounts.getById);
router.post('/api/bank-accounts', authenticateToken, allRemainingController.bankAccounts.create);
router.put('/api/bank-accounts/:id', authenticateToken, allRemainingController.bankAccounts.update);
router.delete('/api/bank-accounts/:id', authenticateToken, allRemainingController.bankAccounts.delete);

// Client Payments
router.get('/api/client-payments', authenticateToken, allRemainingController.clientPayments.getAll);
router.get('/api/client-payments/:id', authenticateToken, allRemainingController.clientPayments.getById);
router.post('/api/client-payments', authenticateToken, allRemainingController.clientPayments.create);
router.put('/api/client-payments/:id', authenticateToken, allRemainingController.clientPayments.update);
router.delete('/api/client-payments/:id', authenticateToken, allRemainingController.clientPayments.delete);

// Supplier Payments
router.get('/api/supplier-payments', authenticateToken, allRemainingController.supplierPayments.getAll);
router.get('/api/supplier-payments/:id', authenticateToken, allRemainingController.supplierPayments.getById);
router.post('/api/supplier-payments', authenticateToken, allRemainingController.supplierPayments.create);
router.put('/api/supplier-payments/:id', authenticateToken, allRemainingController.supplierPayments.update);
router.delete('/api/supplier-payments/:id', authenticateToken, allRemainingController.supplierPayments.delete);

// Refunds
router.get('/api/refunds', authenticateToken, allRemainingController.refunds.getAll);
router.get('/api/refunds/:id', authenticateToken, allRemainingController.refunds.getById);
router.post('/api/refunds', authenticateToken, allRemainingController.refunds.create);
router.put('/api/refunds/:id', authenticateToken, allRemainingController.refunds.update);
router.delete('/api/refunds/:id', authenticateToken, allRemainingController.refunds.delete);

// Commissions
router.get('/api/commissions', authenticateToken, allRemainingController.commissions.getAll);
router.get('/api/commissions/:id', authenticateToken, allRemainingController.commissions.getById);
router.post('/api/commissions', authenticateToken, allRemainingController.commissions.create);
router.put('/api/commissions/:id', authenticateToken, allRemainingController.commissions.update);
router.delete('/api/commissions/:id', authenticateToken, allRemainingController.commissions.delete);

// ============================================
// OPERATIONS ROUTES
// ============================================

// Pickup Locations
router.get('/api/pickup-locations', authenticateToken, allRemainingController.pickupLocations.getAll);
router.get('/api/pickup-locations/:id', authenticateToken, allRemainingController.pickupLocations.getById);
router.post('/api/pickup-locations', authenticateToken, allRemainingController.pickupLocations.create);
router.put('/api/pickup-locations/:id', authenticateToken, allRemainingController.pickupLocations.update);
router.delete('/api/pickup-locations/:id', authenticateToken, allRemainingController.pickupLocations.delete);

// Service Availability
router.get('/api/service-availability', authenticateToken, allRemainingController.serviceAvailability.getAll);
router.get('/api/service-availability/:id', authenticateToken, allRemainingController.serviceAvailability.getById);
router.post('/api/service-availability', authenticateToken, allRemainingController.serviceAvailability.create);
router.put('/api/service-availability/:id', authenticateToken, allRemainingController.serviceAvailability.update);
router.delete('/api/service-availability/:id', authenticateToken, allRemainingController.serviceAvailability.delete);

// Cancellation Policies
router.get('/api/cancellation-policies', authenticateToken, allRemainingController.cancellationPolicies.getAll);
router.get('/api/cancellation-policies/:id', authenticateToken, allRemainingController.cancellationPolicies.getById);
router.post('/api/cancellation-policies', authenticateToken, allRemainingController.cancellationPolicies.create);
router.put('/api/cancellation-policies/:id', authenticateToken, allRemainingController.cancellationPolicies.update);
router.delete('/api/cancellation-policies/:id', authenticateToken, allRemainingController.cancellationPolicies.delete);

// Staff Schedule
router.get('/api/staff-schedule', authenticateToken, allRemainingController.staffSchedule.getAll);
router.get('/api/staff-schedule/:id', authenticateToken, allRemainingController.staffSchedule.getById);
router.post('/api/staff-schedule', authenticateToken, allRemainingController.staffSchedule.create);
router.put('/api/staff-schedule/:id', authenticateToken, allRemainingController.staffSchedule.update);
router.delete('/api/staff-schedule/:id', authenticateToken, allRemainingController.staffSchedule.delete);

// ============================================
// PASSENGER & VISA ROUTES
// ============================================

// Visa Requirements (Global)
router.get('/api/visa-requirements', authenticateToken, allRemainingController.visaRequirements.getAll);
router.get('/api/visa-requirements/:id', authenticateToken, allRemainingController.visaRequirements.getById);
router.post('/api/visa-requirements', authenticateToken, allRemainingController.visaRequirements.create);
router.put('/api/visa-requirements/:id', authenticateToken, allRemainingController.visaRequirements.update);
router.delete('/api/visa-requirements/:id', authenticateToken, allRemainingController.visaRequirements.delete);

// Passenger Visas
router.get('/api/passenger-visas', authenticateToken, allRemainingController.passengerVisas.getAll);
router.get('/api/passenger-visas/:id', authenticateToken, allRemainingController.passengerVisas.getById);
router.post('/api/passenger-visas', authenticateToken, allRemainingController.passengerVisas.create);
router.put('/api/passenger-visas/:id', authenticateToken, allRemainingController.passengerVisas.update);
router.delete('/api/passenger-visas/:id', authenticateToken, allRemainingController.passengerVisas.delete);

// Travel Insurance
router.get('/api/travel-insurance', authenticateToken, allRemainingController.travelInsurance.getAll);
router.get('/api/travel-insurance/:id', authenticateToken, allRemainingController.travelInsurance.getById);
router.post('/api/travel-insurance', authenticateToken, allRemainingController.travelInsurance.create);
router.put('/api/travel-insurance/:id', authenticateToken, allRemainingController.travelInsurance.update);
router.delete('/api/travel-insurance/:id', authenticateToken, allRemainingController.travelInsurance.delete);

// ============================================
// DOCUMENT ROUTES
// ============================================

// Vouchers
router.get('/api/vouchers', authenticateToken, allRemainingController.vouchers.getAll);
router.get('/api/vouchers/:id', authenticateToken, allRemainingController.vouchers.getById);
router.post('/api/vouchers', authenticateToken, allRemainingController.vouchers.create);
router.put('/api/vouchers/:id', authenticateToken, allRemainingController.vouchers.update);
router.delete('/api/vouchers/:id', authenticateToken, allRemainingController.vouchers.delete);

// Documents
router.get('/api/documents', authenticateToken, allRemainingController.documents.getAll);
router.get('/api/documents/:id', authenticateToken, allRemainingController.documents.getById);
router.post('/api/documents', authenticateToken, allRemainingController.documents.create);
router.put('/api/documents/:id', authenticateToken, allRemainingController.documents.update);
router.delete('/api/documents/:id', authenticateToken, allRemainingController.documents.delete);

// Email Templates
router.get('/api/email-templates', authenticateToken, allRemainingController.emailTemplates.getAll);
router.get('/api/email-templates/:id', authenticateToken, allRemainingController.emailTemplates.getById);
router.post('/api/email-templates', authenticateToken, allRemainingController.emailTemplates.create);
router.put('/api/email-templates/:id', authenticateToken, allRemainingController.emailTemplates.update);
router.delete('/api/email-templates/:id', authenticateToken, allRemainingController.emailTemplates.delete);

// Document Templates
router.get('/api/document-templates', authenticateToken, allRemainingController.documentTemplates.getAll);
router.get('/api/document-templates/:id', authenticateToken, allRemainingController.documentTemplates.getById);
router.post('/api/document-templates', authenticateToken, allRemainingController.documentTemplates.create);
router.put('/api/document-templates/:id', authenticateToken, allRemainingController.documentTemplates.update);
router.delete('/api/document-templates/:id', authenticateToken, allRemainingController.documentTemplates.delete);

// Email Logs (List only)
router.get('/api/email-logs', authenticateToken, allRemainingController.emailLogs.getAll);

// Audit Logs (List only)
router.get('/api/audit-logs', authenticateToken, allRemainingController.auditLogs.getAll);

// Notifications
router.get('/api/notifications', authenticateToken, allRemainingController.notifications.getAll);
router.get('/api/notifications/:id', authenticateToken, allRemainingController.notifications.getById);
router.post('/api/notifications', authenticateToken, allRemainingController.notifications.create);
router.put('/api/notifications/:id', authenticateToken, allRemainingController.notifications.update);
router.put('/api/notifications/:id/mark-as-read', authenticateToken, allRemainingController.notifications.markAsRead);
router.delete('/api/notifications/:id', authenticateToken, allRemainingController.notifications.delete);

// Notification Settings (Per user)
router.get('/api/notification-settings', authenticateToken, allRemainingController.notificationSettings.getByUser);
router.put('/api/notification-settings', authenticateToken, allRemainingController.notificationSettings.update);

// ============================================
// MARKETING ROUTES
// ============================================

// Promotional Codes
router.get('/api/promotional-codes', authenticateToken, allRemainingController.promotionalCodes.getAll);
router.get('/api/promotional-codes/:id', authenticateToken, allRemainingController.promotionalCodes.getById);
router.post('/api/promotional-codes', authenticateToken, allRemainingController.promotionalCodes.create);
router.put('/api/promotional-codes/:id', authenticateToken, allRemainingController.promotionalCodes.update);
router.delete('/api/promotional-codes/:id', authenticateToken, allRemainingController.promotionalCodes.delete);

// Marketing Campaigns
router.get('/api/marketing-campaigns', authenticateToken, allRemainingController.marketingCampaigns.getAll);
router.get('/api/marketing-campaigns/:id', authenticateToken, allRemainingController.marketingCampaigns.getById);
router.post('/api/marketing-campaigns', authenticateToken, allRemainingController.marketingCampaigns.create);
router.put('/api/marketing-campaigns/:id', authenticateToken, allRemainingController.marketingCampaigns.update);
router.delete('/api/marketing-campaigns/:id', authenticateToken, allRemainingController.marketingCampaigns.delete);

// Client Reviews
router.get('/api/client-reviews', authenticateToken, allRemainingController.clientReviews.getAll);
router.get('/api/client-reviews/:id', authenticateToken, allRemainingController.clientReviews.getById);
router.post('/api/client-reviews', authenticateToken, allRemainingController.clientReviews.create);
router.put('/api/client-reviews/:id', authenticateToken, allRemainingController.clientReviews.update);
router.delete('/api/client-reviews/:id', authenticateToken, allRemainingController.clientReviews.delete);

// Tour Waiting List
router.get('/api/tour-waiting-list', authenticateToken, allRemainingController.tourWaitingList.getAll);
router.get('/api/tour-waiting-list/:id', authenticateToken, allRemainingController.tourWaitingList.getById);
router.post('/api/tour-waiting-list', authenticateToken, allRemainingController.tourWaitingList.create);
router.put('/api/tour-waiting-list/:id', authenticateToken, allRemainingController.tourWaitingList.update);
router.delete('/api/tour-waiting-list/:id', authenticateToken, allRemainingController.tourWaitingList.delete);

// ============================================
// SYSTEM ROUTES
// ============================================

// API Keys
router.get('/api/api-keys', authenticateToken, allRemainingController.apiKeys.getAll);
router.get('/api/api-keys/:id', authenticateToken, allRemainingController.apiKeys.getById);
router.post('/api/api-keys', authenticateToken, allRemainingController.apiKeys.create);
router.put('/api/api-keys/:id', authenticateToken, allRemainingController.apiKeys.update);
router.delete('/api/api-keys/:id', authenticateToken, allRemainingController.apiKeys.delete);

// Number Sequences
router.get('/api/number-sequences', authenticateToken, allRemainingController.numberSequences.getAll);
router.get('/api/number-sequences/:id', authenticateToken, allRemainingController.numberSequences.getById);
router.post('/api/number-sequences', authenticateToken, allRemainingController.numberSequences.create);
router.put('/api/number-sequences/:id', authenticateToken, allRemainingController.numberSequences.update);
router.delete('/api/number-sequences/:id', authenticateToken, allRemainingController.numberSequences.delete);

// Vehicle Maintenance
router.get('/api/vehicle-maintenance', authenticateToken, allRemainingController.vehicleMaintenance.getAll);
router.get('/api/vehicle-maintenance/:id', authenticateToken, allRemainingController.vehicleMaintenance.getById);
router.post('/api/vehicle-maintenance', authenticateToken, allRemainingController.vehicleMaintenance.create);
router.put('/api/vehicle-maintenance/:id', authenticateToken, allRemainingController.vehicleMaintenance.update);
router.delete('/api/vehicle-maintenance/:id', authenticateToken, allRemainingController.vehicleMaintenance.delete);

// ============================================
// REPORTS ROUTES
// ============================================

// Financial Reports
router.get('/api/reports/revenue', authenticateToken, reportsController.getRevenueReport);
router.get('/api/reports/profit-loss', authenticateToken, reportsController.getProfitLossReport);
router.get('/api/reports/receivables-aging', authenticateToken, reportsController.getReceivablesAgingReport);
router.get('/api/reports/payables-aging', authenticateToken, reportsController.getPayablesAgingReport);
router.get('/api/reports/commissions', authenticateToken, reportsController.getCommissionReport);

// Booking Reports
router.get('/api/reports/bookings-by-date', authenticateToken, reportsController.getBookingsByDateReport);
router.get('/api/reports/bookings-by-status', authenticateToken, reportsController.getBookingsByStatusReport);
router.get('/api/reports/bookings-by-destination', authenticateToken, reportsController.getBookingsByDestinationReport);
router.get('/api/reports/cancellations', authenticateToken, reportsController.getCancellationReport);
router.get('/api/reports/booking-sources', authenticateToken, reportsController.getBookingSourcesReport);

// Operations Reports
router.get('/api/reports/service-utilization', authenticateToken, reportsController.getServiceUtilizationReport);
router.get('/api/reports/guide-performance', authenticateToken, reportsController.getGuidePerformanceReport);
router.get('/api/reports/hotel-occupancy', authenticateToken, reportsController.getHotelOccupancyReport);
router.get('/api/reports/vehicle-utilization', authenticateToken, reportsController.getVehicleUtilizationReport);

// Client Reports
router.get('/api/reports/client-revenue', authenticateToken, reportsController.getClientRevenueReport);
router.get('/api/reports/client-history', authenticateToken, reportsController.getClientBookingHistoryReport);
router.get('/api/reports/outstanding-balances', authenticateToken, reportsController.getOutstandingBalancesReport);

module.exports = router;
