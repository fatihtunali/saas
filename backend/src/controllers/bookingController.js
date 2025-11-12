const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// BOOKINGS (Main booking table - CRUD)
// ============================================

exports.getBookings = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Filtering parameters
    const search = req.query.search || '';
    const sortByParam = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Map camelCase to snake_case for database columns
    const sortByMap = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'bookingCode': 'booking_code',
      'travelStartDate': 'travel_start_date',
      'totalCost': 'total_cost'
    };
    const sortBy = sortByMap[sortByParam] || 'created_at';

    // Build WHERE clause
    let whereConditions = ['b.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;

    if (operatorId) {
      whereConditions.push(`b.operator_id = $${paramIndex}`);
      params.push(operatorId);
      paramIndex++;
    }

    // Search filter
    if (search) {
      whereConditions.push(`(
        b.booking_code ILIKE $${paramIndex} OR
        c.full_name ILIKE $${paramIndex} OR
        oc.full_name ILIKE $${paramIndex} OR
        ci.name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
      LEFT JOIN cities ci ON b.destination_city_id = ci.id
      WHERE ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Fetch paginated data
    const dataQuery = `
      SELECT b.*,
             c.full_name as client_name,
             oc.full_name as operator_client_name,
             ci.name as destination_city_name,
             u.full_name as created_by_name
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
      LEFT JOIN cities ci ON b.destination_city_id = ci.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(dataQuery, params);

    // Return paginated response
    res.json({
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT b.*,
             c.full_name as client_name, c.email as client_email, c.phone as client_phone,
             oc.full_name as operator_client_name,
             ci.name as destination_city_name,
             u.full_name as created_by_name
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
      LEFT JOIN cities ci ON b.destination_city_id = ci.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = $1 AND b.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND b.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get related data
    const passengersResult = await db.query(
      'SELECT * FROM booking_passengers WHERE booking_id = $1 AND deleted_at IS NULL ORDER BY is_lead_passenger DESC',
      [id]
    );

    const servicesResult = await db.query(
      'SELECT * FROM booking_services WHERE booking_id = $1 AND deleted_at IS NULL ORDER BY service_date',
      [id]
    );

    const flightsResult = await db.query(
      'SELECT * FROM booking_flights WHERE booking_id = $1 AND deleted_at IS NULL ORDER BY flight_date, flight_time',
      [id]
    );

    res.json({
      ...result.rows[0],
      passengers: passengersResult.rows,
      services: servicesResult.rows,
      flights: flightsResult.rows
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

exports.createBooking = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      booking_code, client_id, operators_client_id, travel_start_date, travel_end_date,
      destination_city_id, num_adults, num_children, children_ages, status, total_cost,
      total_selling_price, markup_percentage, profit_amount, tax_rate_id, tax_amount,
      total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source,
      referral_source, emergency_contact_name, emergency_contact_phone,
      emergency_contact_relationship, is_group_booking, group_name, group_leader_name,
      group_leader_contact, cancellation_policy_id, special_requests, internal_notes
    } = req.body;

    const created_by = req.user.userId;

    // Validation
    if (!travel_start_date || !travel_end_date) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Travel dates are required' });
    }

    const query = `
      INSERT INTO bookings (
        operator_id, booking_code, client_id, operators_client_id, travel_start_date,
        travel_end_date, destination_city_id, num_adults, num_children, children_ages,
        status, total_cost, total_selling_price, markup_percentage, profit_amount,
        tax_rate_id, tax_amount, total_with_tax, promo_code_id, discount_amount,
        campaign_id, booking_source, referral_source, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship, is_group_booking,
        group_name, group_leader_name, group_leader_contact, cancellation_policy_id,
        special_requests, internal_notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
      RETURNING *
    `;

    const result = await client.query(query, [
      operatorId, booking_code, client_id, operators_client_id, travel_start_date,
      travel_end_date, destination_city_id, num_adults || 0, num_children || 0, children_ages,
      status || 'quotation', total_cost, total_selling_price, markup_percentage, profit_amount,
      tax_rate_id, tax_amount, total_with_tax, promo_code_id, discount_amount,
      campaign_id, booking_source, referral_source, emergency_contact_name,
      emergency_contact_phone, emergency_contact_relationship, is_group_booking || false,
      group_name, group_leader_name, group_leader_contact, cancellation_policy_id,
      special_requests, internal_notes, created_by
    ]);

    // Create booking activity log
    await client.query(
      `INSERT INTO booking_activities (operator_id, booking_id, activity_type, activity_description, user_id)
       VALUES ($1, $2, 'created', 'Booking created', $3)`,
      [operatorId, result.rows[0].id, created_by]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
};

exports.updateBooking = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      booking_code, client_id, operators_client_id, travel_start_date, travel_end_date,
      destination_city_id, num_adults, num_children, children_ages, status, total_cost,
      total_selling_price, markup_percentage, profit_amount, tax_rate_id, tax_amount,
      total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source,
      referral_source, emergency_contact_name, emergency_contact_phone,
      emergency_contact_relationship, is_group_booking, group_name, group_leader_name,
      group_leader_contact, cancellation_policy_id, special_requests, internal_notes,
      cancelled_at, cancelled_by, cancellation_reason, cancellation_fee, refund_amount
    } = req.body;

    let query = `
      UPDATE bookings
      SET booking_code = COALESCE($2, booking_code),
          client_id = COALESCE($3, client_id),
          operators_client_id = COALESCE($4, operators_client_id),
          travel_start_date = COALESCE($5, travel_start_date),
          travel_end_date = COALESCE($6, travel_end_date),
          destination_city_id = COALESCE($7, destination_city_id),
          num_adults = COALESCE($8, num_adults),
          num_children = COALESCE($9, num_children),
          children_ages = COALESCE($10, children_ages),
          status = COALESCE($11, status),
          total_cost = COALESCE($12, total_cost),
          total_selling_price = COALESCE($13, total_selling_price),
          markup_percentage = COALESCE($14, markup_percentage),
          profit_amount = COALESCE($15, profit_amount),
          tax_rate_id = COALESCE($16, tax_rate_id),
          tax_amount = COALESCE($17, tax_amount),
          total_with_tax = COALESCE($18, total_with_tax),
          promo_code_id = COALESCE($19, promo_code_id),
          discount_amount = COALESCE($20, discount_amount),
          campaign_id = COALESCE($21, campaign_id),
          booking_source = COALESCE($22, booking_source),
          referral_source = COALESCE($23, referral_source),
          emergency_contact_name = COALESCE($24, emergency_contact_name),
          emergency_contact_phone = COALESCE($25, emergency_contact_phone),
          emergency_contact_relationship = COALESCE($26, emergency_contact_relationship),
          is_group_booking = COALESCE($27, is_group_booking),
          group_name = COALESCE($28, group_name),
          group_leader_name = COALESCE($29, group_leader_name),
          group_leader_contact = COALESCE($30, group_leader_contact),
          cancellation_policy_id = COALESCE($31, cancellation_policy_id),
          special_requests = COALESCE($32, special_requests),
          internal_notes = COALESCE($33, internal_notes),
          cancelled_at = COALESCE($34, cancelled_at),
          cancelled_by = COALESCE($35, cancelled_by),
          cancellation_reason = COALESCE($36, cancellation_reason),
          cancellation_fee = COALESCE($37, cancellation_fee),
          refund_amount = COALESCE($38, refund_amount),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, booking_code, client_id, operators_client_id, travel_start_date, travel_end_date,
      destination_city_id, num_adults, num_children, children_ages, status, total_cost,
      total_selling_price, markup_percentage, profit_amount, tax_rate_id, tax_amount,
      total_with_tax, promo_code_id, discount_amount, campaign_id, booking_source,
      referral_source, emergency_contact_name, emergency_contact_phone,
      emergency_contact_relationship, is_group_booking, group_name, group_leader_name,
      group_leader_contact, cancellation_policy_id, special_requests, internal_notes,
      cancelled_at, cancelled_by, cancellation_reason, cancellation_fee, refund_amount
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Log activity
    await client.query(
      `INSERT INTO booking_activities (operator_id, booking_id, activity_type, activity_description, user_id)
       VALUES ($1, $2, 'modified', 'Booking updated', $3)`,
      [operatorId, id, req.user.userId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  } finally {
    client.release();
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE bookings
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
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};

// ============================================
// BOOKING PASSENGERS (CRUD - Critical for vouchers)
// ============================================

exports.getBookingPassengers = async (req, res) => {
  try {
    const { booking_id } = req.query;
    const operatorId = applyOperatorFilter(req);

    let query = 'SELECT * FROM booking_passengers WHERE deleted_at IS NULL';
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

    query += ' ORDER BY is_lead_passenger DESC, id ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching booking passengers:', error);
    res.status(500).json({ error: 'Failed to fetch booking passengers' });
  }
};

exports.getBookingPassengerById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = 'SELECT * FROM booking_passengers WHERE id = $1 AND deleted_at IS NULL';
    const params = [id];

    if (operatorId) {
      query += ' AND operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking passenger not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking passenger:', error);
    res.status(500).json({ error: 'Failed to fetch booking passenger' });
  }
};

exports.createBookingPassenger = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      booking_id, passenger_type, title, first_name, last_name, date_of_birth,
      age, gender, nationality, passport_number, passport_expiry_date,
      passport_issue_country, is_lead_passenger, email, phone, dietary_requirements,
      medical_conditions, accessibility_needs, special_notes, room_number,
      bed_type_preference
    } = req.body;

    // Validation
    if (!booking_id || !first_name || !last_name) {
      return res.status(400).json({ error: 'Booking ID, first name, and last name are required' });
    }

    const query = `
      INSERT INTO booking_passengers (
        operator_id, booking_id, passenger_type, title, first_name, last_name,
        date_of_birth, age, gender, nationality, passport_number, passport_expiry_date,
        passport_issue_country, is_lead_passenger, email, phone, dietary_requirements,
        medical_conditions, accessibility_needs, special_notes, room_number,
        bed_type_preference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, booking_id, passenger_type, title, first_name, last_name,
      date_of_birth, age, gender, nationality, passport_number, passport_expiry_date,
      passport_issue_country, is_lead_passenger || false, email, phone, dietary_requirements,
      medical_conditions, accessibility_needs, special_notes, room_number,
      bed_type_preference
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating booking passenger:', error);
    res.status(500).json({ error: 'Failed to create booking passenger' });
  }
};

exports.updateBookingPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      booking_id, passenger_type, title, first_name, last_name, date_of_birth,
      age, gender, nationality, passport_number, passport_expiry_date,
      passport_issue_country, is_lead_passenger, email, phone, dietary_requirements,
      medical_conditions, accessibility_needs, special_notes, room_number,
      bed_type_preference
    } = req.body;

    let query = `
      UPDATE booking_passengers
      SET booking_id = COALESCE($2, booking_id),
          passenger_type = COALESCE($3, passenger_type),
          title = COALESCE($4, title),
          first_name = COALESCE($5, first_name),
          last_name = COALESCE($6, last_name),
          date_of_birth = COALESCE($7, date_of_birth),
          age = COALESCE($8, age),
          gender = COALESCE($9, gender),
          nationality = COALESCE($10, nationality),
          passport_number = COALESCE($11, passport_number),
          passport_expiry_date = COALESCE($12, passport_expiry_date),
          passport_issue_country = COALESCE($13, passport_issue_country),
          is_lead_passenger = COALESCE($14, is_lead_passenger),
          email = COALESCE($15, email),
          phone = COALESCE($16, phone),
          dietary_requirements = COALESCE($17, dietary_requirements),
          medical_conditions = COALESCE($18, medical_conditions),
          accessibility_needs = COALESCE($19, accessibility_needs),
          special_notes = COALESCE($20, special_notes),
          room_number = COALESCE($21, room_number),
          bed_type_preference = COALESCE($22, bed_type_preference),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, booking_id, passenger_type, title, first_name, last_name, date_of_birth,
      age, gender, nationality, passport_number, passport_expiry_date,
      passport_issue_country, is_lead_passenger, email, phone, dietary_requirements,
      medical_conditions, accessibility_needs, special_notes, room_number,
      bed_type_preference
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking passenger not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking passenger:', error);
    res.status(500).json({ error: 'Failed to update booking passenger' });
  }
};

exports.deleteBookingPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE booking_passengers
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
      return res.status(404).json({ error: 'Booking passenger not found' });
    }

    res.json({ message: 'Booking passenger deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking passenger:', error);
    res.status(500).json({ error: 'Failed to delete booking passenger' });
  }
};
