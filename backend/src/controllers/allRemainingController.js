const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// Generic CRUD generator for simple tables
const createCRUDHandlers = (tableName, requiresOperatorId = true) => {
  return {
    getAll: async (req, res) => {
      try {
        const operatorId = requiresOperatorId ? applyOperatorFilter(req) : null;
        let query = `SELECT * FROM ${tableName} WHERE deleted_at IS NULL`;
        const params = [];

        if (operatorId && requiresOperatorId) {
          query += ' AND operator_id = $1';
          params.push(operatorId);
        }

        query += ' ORDER BY id DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        res.status(500).json({ error: `Failed to fetch ${tableName}` });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const operatorId = requiresOperatorId ? applyOperatorFilter(req) : null;

        let query = `SELECT * FROM ${tableName} WHERE id = $1 AND deleted_at IS NULL`;
        const params = [id];

        if (operatorId && requiresOperatorId) {
          query += ' AND operator_id = $2';
          params.push(operatorId);
        }

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        res.status(500).json({ error: `Failed to fetch ${tableName}` });
      }
    },

    create: async (req, res) => {
      try {
        const operatorId = requiresOperatorId
          ? (req.user.role === 'super_admin' && !req.body.operator_id
              ? null
              : (req.body.operator_id || req.user.operator_id))
          : null;

        const fields = requiresOperatorId ? ['operator_id'] : [];
        const values = requiresOperatorId ? [operatorId] : [];

        Object.keys(req.body).forEach(key => {
          if (key !== 'operator_id') {
            fields.push(key);
            values.push(req.body[key]);
          }
        });

        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
          INSERT INTO ${tableName} (${fields.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;

        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error);
        res.status(500).json({ error: `Failed to create ${tableName}` });
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        const operatorId = requiresOperatorId ? applyOperatorFilter(req) : null;

        const fields = [];
        const values = [id];
        let paramCounter = 2;

        Object.keys(req.body).forEach(key => {
          if (key !== 'operator_id') {
            fields.push(`${key} = $${paramCounter}`);
            values.push(req.body[key]);
            paramCounter++;
          }
        });

        if (fields.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        let query = `
          UPDATE ${tableName}
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted_at IS NULL
        `;

        if (operatorId && requiresOperatorId) {
          query += ` AND operator_id = $${paramCounter}`;
          values.push(operatorId);
        }

        query += ' RETURNING *';

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error updating ${tableName}:`, error);
        res.status(500).json({ error: `Failed to update ${tableName}` });
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params;
        const operatorId = requiresOperatorId ? applyOperatorFilter(req) : null;

        let query = `
          UPDATE ${tableName}
          SET deleted_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted_at IS NULL
        `;
        const params = [id];

        if (operatorId && requiresOperatorId) {
          query += ` AND operator_id = $2`;
          params.push(operatorId);
        }

        query += ' RETURNING id';

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' });
        }

        res.json({ message: 'Record deleted successfully' });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        res.status(500).json({ error: `Failed to delete ${tableName}` });
      }
    }
  };
};

// Export handlers for all remaining tables

// Booking Services
exports.bookingServices = createCRUDHandlers('booking_services', true);

// Booking Flights
exports.bookingFlights = createCRUDHandlers('booking_flights', true);

// Booking Itinerary
exports.bookingItinerary = createCRUDHandlers('booking_itinerary', true);

// Booking Tasks
exports.bookingTasks = createCRUDHandlers('booking_tasks', true);

// Booking Modifications
exports.bookingModifications = createCRUDHandlers('booking_modifications', true);

// Booking Activities (Immutable log - no update/delete)
exports.bookingActivities = {
  getAll: async (req, res) => {
    try {
      const operatorId = applyOperatorFilter(req);
      const { booking_id } = req.query;

      let query = 'SELECT * FROM booking_activities WHERE 1=1';
      const params = [];
      let paramCounter = 1;

      if (operatorId) {
        query += ` AND operator_id = $${paramCounter}`;
        params.push(operatorId);
        paramCounter++;
      }

      if (booking_id) {
        query += ` AND booking_id = $${paramCounter}`;
        params.push(booking_id);
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching booking activities:', error);
      res.status(500).json({ error: 'Failed to fetch booking activities' });
    }
  },

  create: async (req, res) => {
    try {
      const operatorId = req.user.operator_id;
      const { booking_id, activity_type, activity_description, metadata } = req.body;
      const user_id = req.user.userId;

      const query = `
        INSERT INTO booking_activities (operator_id, booking_id, activity_type, activity_description, user_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await db.query(query, [operatorId, booking_id, activity_type, activity_description, user_id, metadata]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating booking activity:', error);
      res.status(500).json({ error: 'Failed to create booking activity' });
    }
  }
};

// Payment Tables
exports.bankAccounts = createCRUDHandlers('bank_accounts', true);
exports.clientPayments = createCRUDHandlers('client_payments', true);
exports.supplierPayments = createCRUDHandlers('supplier_payments', true);
exports.refunds = createCRUDHandlers('refunds', true);
exports.commissions = createCRUDHandlers('commissions', true);

// Operations Tables
exports.pickupLocations = createCRUDHandlers('pickup_locations', true);
exports.serviceAvailability = createCRUDHandlers('service_availability', true);
exports.cancellationPolicies = createCRUDHandlers('cancellation_policies', true);
exports.staffSchedule = createCRUDHandlers('staff_schedule', true);

// Passenger & Visa Tables
exports.visaRequirements = createCRUDHandlers('visa_requirements', false); // Global table
exports.passengerVisas = createCRUDHandlers('passenger_visas', false);
exports.travelInsurance = createCRUDHandlers('travel_insurance', true);

// Document Tables
exports.vouchers = createCRUDHandlers('vouchers', true);
exports.documents = createCRUDHandlers('documents', true);
exports.emailTemplates = createCRUDHandlers('email_templates', true);
exports.documentTemplates = createCRUDHandlers('document_templates', true);

// Email Logs (List only - no update/delete)
exports.emailLogs = {
  getAll: async (req, res) => {
    try {
      const operatorId = applyOperatorFilter(req);
      let query = 'SELECT * FROM email_logs WHERE 1=1';
      const params = [];

      if (operatorId) {
        query += ' AND operator_id = $1';
        params.push(operatorId);
      }

      query += ' ORDER BY created_at DESC LIMIT 100';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      res.status(500).json({ error: 'Failed to fetch email logs' });
    }
  }
};

// Audit Logs (List only)
exports.auditLogs = {
  getAll: async (req, res) => {
    try {
      const operatorId = applyOperatorFilter(req);
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];

      if (operatorId) {
        query += ' AND operator_id = $1';
        params.push(operatorId);
      }

      query += ' ORDER BY created_at DESC LIMIT 100';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
};

// Notifications
exports.notifications = {
  ...createCRUDHandlers('notifications', true),

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const operatorId = applyOperatorFilter(req);

      let query = `
        UPDATE notifications
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      const params = [id];

      if (operatorId) {
        query += ' AND operator_id = $2';
        params.push(operatorId);
      }

      query += ' RETURNING *';

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
};

// Notification Settings (Per user)
exports.notificationSettings = {
  getByUser: async (req, res) => {
    try {
      const user_id = req.user.userId;
      const query = 'SELECT * FROM notification_settings WHERE user_id = $1';
      const result = await db.query(query, [user_id]);

      if (result.rows.length === 0) {
        // Create default settings
        const createQuery = `
          INSERT INTO notification_settings (user_id, email_enabled, sms_enabled, notify_new_booking, notify_payment_received, notify_payment_due, notify_passport_expiry, notify_voucher_pending)
          VALUES ($1, true, true, true, true, true, true, true)
          RETURNING *
        `;
        const createResult = await db.query(createQuery, [user_id]);
        return res.json(createResult.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  },

  update: async (req, res) => {
    try {
      const user_id = req.user.userId;
      const {
        email_enabled, sms_enabled, notify_new_booking, notify_payment_received,
        notify_payment_due, notify_passport_expiry, notify_voucher_pending
      } = req.body;

      const query = `
        UPDATE notification_settings
        SET email_enabled = COALESCE($2, email_enabled),
            sms_enabled = COALESCE($3, sms_enabled),
            notify_new_booking = COALESCE($4, notify_new_booking),
            notify_payment_received = COALESCE($5, notify_payment_received),
            notify_payment_due = COALESCE($6, notify_payment_due),
            notify_passport_expiry = COALESCE($7, notify_passport_expiry),
            notify_voucher_pending = COALESCE($8, notify_voucher_pending),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await db.query(query, [
        user_id, email_enabled, sms_enabled, notify_new_booking, notify_payment_received,
        notify_payment_due, notify_passport_expiry, notify_voucher_pending
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Notification settings not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  }
};

// Marketing Tables
exports.promotionalCodes = createCRUDHandlers('promotional_codes', true);
exports.marketingCampaigns = createCRUDHandlers('marketing_campaigns', true);
exports.clientReviews = createCRUDHandlers('client_reviews', true);
exports.tourWaitingList = createCRUDHandlers('tour_waiting_list', true);

// System Tables
exports.apiKeys = createCRUDHandlers('api_keys', true);
exports.numberSequences = createCRUDHandlers('number_sequences', true);

// Vehicle Maintenance
exports.vehicleMaintenance = createCRUDHandlers('vehicle_maintenance', true);
