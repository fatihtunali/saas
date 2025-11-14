const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// QUOTATIONS (CRUD)
// ============================================

exports.getQuotations = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = `
      SELECT q.*,
             c.full_name as client_name,
             oc.full_name as operator_client_name,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN operators_clients oc ON q.operators_client_id = oc.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND q.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY q.created_at DESC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT q.*,
             c.full_name as client_name,
             oc.full_name as operator_client_name,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN operators_clients oc ON q.operators_client_id = oc.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1 AND q.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND q.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Get quotation services
    const servicesResult = await db.query(
      'SELECT * FROM quotation_services WHERE quotation_id = $1 AND deleted_at IS NULL ORDER BY service_date',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        services: servicesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    // Support both camelCase (from frontend) and snake_case (legacy)
    let quotation_code = req.body.quotation_code || req.body.quotationCode;
    const client_id = req.body.client_id || req.body.clientId;
    const operators_client_id = req.body.operators_client_id || req.body.operatorsClientId;
    const travel_dates_from = req.body.travel_dates_from || req.body.travelDatesFrom;
    const travel_dates_to = req.body.travel_dates_to || req.body.travelDatesTo;
    const num_passengers = req.body.num_passengers || req.body.numPassengers;
    const total_amount = req.body.total_amount || req.body.totalAmount;
    const currency = req.body.currency;
    const valid_until = req.body.valid_until || req.body.validUntil;
    const status = req.body.status;
    const notes = req.body.notes;
    const internal_notes = req.body.internal_notes || req.body.internalNotes;

    console.log('Parsed values:', { travel_dates_from, travel_dates_to, client_id, operators_client_id });

    const created_by = req.user.userId;

    // Validation
    if (!travel_dates_from || !travel_dates_to) {
      return res.status(400).json({ error: 'Travel dates are required' });
    }

    // Auto-generate quotation_code if not provided or empty
    if (!quotation_code || quotation_code.trim() === '') {
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      quotation_code = `QU-${year}-${timestamp}`;
    }

    const query = `
      INSERT INTO quotations (
        operator_id, quotation_code, client_id, operators_client_id, travel_dates_from,
        travel_dates_to, num_passengers, total_amount, currency, valid_until,
        status, notes, internal_notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, quotation_code, client_id, operators_client_id, travel_dates_from,
      travel_dates_to, num_passengers, total_amount, currency, valid_until,
      status || 'draft', notes, internal_notes, created_by
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
};

exports.updateQuotation = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      quotation_code, client_id, operators_client_id, travel_dates_from,
      travel_dates_to, num_passengers, total_amount, currency, valid_until,
      status, sent_at, viewed_at, accepted_at, converted_to_booking_id,
      notes, internal_notes
    } = req.body;

    // First, get the current quotation to check if status is changing to 'accepted'
    let checkQuery = 'SELECT * FROM quotations WHERE id = $1 AND deleted_at IS NULL';
    const checkParams = [id];

    if (operatorId) {
      checkQuery += ' AND operator_id = $2';
      checkParams.push(operatorId);
    }

    const currentQuotation = await client.query(checkQuery, checkParams);

    if (currentQuotation.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quotation = currentQuotation.rows[0];

    // Debug logging
    console.log('=== Quotation Update Debug ===');
    console.log('Quotation ID:', id);
    console.log('Status from request:', status);
    console.log('Current quotation status:', quotation.status);
    console.log('Converted to booking ID:', quotation.converted_to_booking_id);
    console.log('Status === accepted?', status === 'accepted');
    console.log('!quotation.converted_to_booking_id?', !quotation.converted_to_booking_id);

    // Trigger conversion if:
    // 1. Status is being set to 'accepted' AND not yet converted
    // 2. This covers both: changing TO accepted, or already accepted but needs conversion
    const shouldConvertToBooking = status === 'accepted' && !quotation.converted_to_booking_id;
    console.log('shouldConvertToBooking:', shouldConvertToBooking);
    console.log('=============================');

    let bookingId = converted_to_booking_id;
    let finalStatus = status;
    let finalAcceptedAt = accepted_at;

    // Auto-create booking if status is 'accepted' and not yet converted
    if (shouldConvertToBooking) {
      console.log(`Quotation ${id} is being accepted - auto-creating booking...`);

      // Validate required fields for booking
      if (!quotation.travel_dates_from || !quotation.travel_dates_to) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot accept quotation: travel dates are required' });
      }

      // Generate booking code
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const booking_code = `BK-${year}-${timestamp}`;

      // Create booking from quotation
      // Note: quotations table doesn't have destination_city_id, so we set it to NULL
      // User can update the booking destination later
      const bookingQuery = `
        INSERT INTO bookings (
          operator_id, booking_code, client_id, operators_client_id,
          travel_start_date, travel_end_date, destination_city_id, num_adults,
          status, total_cost, total_selling_price,
          special_requests, internal_notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const bookingResult = await client.query(bookingQuery, [
        quotation.operator_id,
        booking_code,
        quotation.client_id,
        quotation.operators_client_id,
        quotation.travel_dates_from,
        quotation.travel_dates_to,
        null, // destination_city_id - quotations don't have this field
        quotation.num_passengers || 0,
        'confirmed', // Initial booking status
        quotation.total_amount, // Use quotation's total amount
        quotation.total_amount, // Use quotation's total amount for selling price
        quotation.notes,
        quotation.internal_notes,
        req.user.userId
      ]);

      bookingId = bookingResult.rows[0].id;
      console.log(`Created booking ${bookingId} (${booking_code}) from quotation ${id}`);

      // Copy quotation services to booking services
      const servicesResult = await client.query(
        'SELECT * FROM quotation_services WHERE quotation_id = $1 AND deleted_at IS NULL',
        [id]
      );

      for (const service of servicesResult.rows) {
        // Map quotation_services fields to booking_services schema
        // booking_services uses cost_amount, cost_currency instead of unit_price, total_price, currency
        const costAmount = service.total_price || service.unit_price || 0;
        const costCurrency = service.currency || quotation.currency || 'EUR';
        const serviceDate = service.service_date || quotation.travel_dates_from;

        await client.query(`
          INSERT INTO booking_services (
            operator_id, booking_id, service_type, service_description,
            quantity, cost_amount, cost_currency, selling_price, selling_currency, service_date
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          quotation.operator_id,
          bookingId,
          service.service_type,
          service.service_description,
          service.quantity || 1,
          costAmount,
          costCurrency,
          costAmount, // selling_price same as cost for now
          costCurrency, // selling_currency same as cost for now
          serviceDate
        ]);
      }

      console.log(`Copied ${servicesResult.rows.length} services to booking ${bookingId}`);

      // Create booking activity log
      await client.query(
        `INSERT INTO booking_activities (operator_id, booking_id, activity_type, activity_description, user_id)
         VALUES ($1, $2, 'created', 'Booking created from quotation', $3)`,
        [quotation.operator_id, bookingId, req.user.userId]
      );

      // Keep status as 'accepted', mark as converted via converted_to_booking_id
      // Database constraint only allows: draft, sent, viewed, accepted, rejected, expired
      finalAcceptedAt = finalAcceptedAt || new Date();
    }

    // Update quotation
    let updateQuery = `
      UPDATE quotations
      SET quotation_code = COALESCE($2, quotation_code),
          client_id = COALESCE($3, client_id),
          operators_client_id = COALESCE($4, operators_client_id),
          travel_dates_from = COALESCE($5, travel_dates_from),
          travel_dates_to = COALESCE($6, travel_dates_to),
          num_passengers = COALESCE($7, num_passengers),
          total_amount = COALESCE($8, total_amount),
          currency = COALESCE($9, currency),
          valid_until = COALESCE($10, valid_until),
          status = COALESCE($11, status),
          sent_at = COALESCE($12, sent_at),
          viewed_at = COALESCE($13, viewed_at),
          accepted_at = COALESCE($14, accepted_at),
          converted_to_booking_id = COALESCE($15, converted_to_booking_id),
          notes = COALESCE($16, notes),
          internal_notes = COALESCE($17, internal_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const updateParams = [
      id, quotation_code, client_id, operators_client_id, travel_dates_from,
      travel_dates_to, num_passengers, total_amount, currency, valid_until,
      finalStatus, sent_at, viewed_at, finalAcceptedAt, bookingId,
      notes, internal_notes
    ];

    if (operatorId) {
      updateQuery += ` AND operator_id = $${updateParams.length + 1}`;
      updateParams.push(operatorId);
    }

    updateQuery += ' RETURNING *';

    const result = await client.query(updateQuery, updateParams);

    await client.query('COMMIT');

    // Return quotation with booking ID if created
    const response = {
      ...result.rows[0],
      booking_id: bookingId,
      booking_created: shouldConvertToBooking
    };

    res.json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating quotation:', error);
    res.status(500).json({ error: 'Failed to update quotation' });
  } finally {
    client.release();
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE quotations
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ` AND operator_id = $2`;
      params.push(operatorId);
    }

    query += ' RETURNING id';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
};

// ============================================
// QUOTATION SERVICES (CRUD)
// ============================================

exports.getQuotationServices = async (req, res) => {
  try {
    const { quotation_id } = req.query;
    let query = 'SELECT * FROM quotation_services WHERE deleted_at IS NULL';
    const params = [];

    if (quotation_id) {
      query += ' AND quotation_id = $1';
      params.push(quotation_id);
    }

    query += ' ORDER BY service_date, id ASC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching quotation services:', error);
    res.status(500).json({ error: 'Failed to fetch quotation services' });
  }
};

exports.getQuotationServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM quotation_services WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching quotation service:', error);
    res.status(500).json({ error: 'Failed to fetch quotation service' });
  }
};

exports.createQuotationService = async (req, res) => {
  try {
    const {
      quotation_id, service_type, service_description, quantity,
      unit_price, total_price, currency, service_date
    } = req.body;

    // Validation
    if (!quotation_id || !service_type) {
      return res.status(400).json({ error: 'Quotation ID and service type are required' });
    }

    const query = `
      INSERT INTO quotation_services (
        quotation_id, service_type, service_description, quantity,
        unit_price, total_price, currency, service_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await db.query(query, [
      quotation_id, service_type, service_description, quantity,
      unit_price, total_price, currency, service_date
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating quotation service:', error);
    res.status(500).json({ error: 'Failed to create quotation service' });
  }
};

exports.updateQuotationService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      quotation_id, service_type, service_description, quantity,
      unit_price, total_price, currency, service_date
    } = req.body;

    const query = `
      UPDATE quotation_services
      SET quotation_id = COALESCE($2, quotation_id),
          service_type = COALESCE($3, service_type),
          service_description = COALESCE($4, service_description),
          quantity = COALESCE($5, quantity),
          unit_price = COALESCE($6, unit_price),
          total_price = COALESCE($7, total_price),
          currency = COALESCE($8, currency),
          service_date = COALESCE($9, service_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await db.query(query, [
      id, quotation_id, service_type, service_description, quantity,
      unit_price, total_price, currency, service_date
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quotation service:', error);
    res.status(500).json({ error: 'Failed to update quotation service' });
  }
};

exports.deleteQuotationService = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE quotation_services
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation service not found' });
    }

    res.json({ message: 'Quotation service deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation service:', error);
    res.status(500).json({ error: 'Failed to delete quotation service' });
  }
};
