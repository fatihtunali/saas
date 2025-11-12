const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// HOTELS (CRUD with per-person pricing)
// ============================================

exports.getHotels = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*, s.company_name as supplier_name, c.name as city_name
      FROM hotels h
      LEFT JOIN suppliers s ON h.supplier_id = s.id
      LEFT JOIN cities c ON h.city_id = c.id
      WHERE h.deleted_at IS NULL
    `;
    const params = [];
    let paramCount = 0;

    if (operatorId) {
      paramCount++;
      query += ` AND h.operator_id = $${paramCount}`;
      params.push(operatorId);
    }

    // Count total records
    const countQuery = query.replace('SELECT h.*, s.company_name as supplier_name, c.name as city_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY h.hotel_name ASC';
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        hotels: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hotels' });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT h.*, s.company_name as supplier_name, c.name as city_name
      FROM hotels h
      LEFT JOIN suppliers s ON h.supplier_id = s.id
      LEFT JOIN cities c ON h.city_id = c.id
      WHERE h.id = $1 AND h.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND h.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, hotel_name, star_rating, city_id, address, phone, email, website,
      price_per_person_double, single_supplement, price_per_person_triple,
      child_price_0_2, child_price_3_5, child_price_6_11, currency,
      meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active
    } = req.body;

    // Validation
    if (!hotel_name || !city_id) {
      return res.status(400).json({ error: 'Hotel name and city are required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO hotels (
        operator_id, supplier_id, hotel_name, star_rating, city_id, address, phone, email, website,
        price_per_person_double, single_supplement, price_per_person_triple,
        child_price_0_2, child_price_3_5, child_price_6_11, currency,
        meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, hotel_name, star_rating, city_id, address, phone, email, website,
      price_per_person_double, single_supplement, price_per_person_triple,
      child_price_0_2, child_price_3_5, child_price_6_11, currency,
      meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, hotel_name, star_rating, city_id, address, phone, email, website,
      price_per_person_double, single_supplement, price_per_person_triple,
      child_price_0_2, child_price_3_5, child_price_6_11, currency,
      meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE hotels
      SET supplier_id = COALESCE($2, supplier_id),
          hotel_name = COALESCE($3, hotel_name),
          star_rating = COALESCE($4, star_rating),
          city_id = COALESCE($5, city_id),
          address = COALESCE($6, address),
          phone = COALESCE($7, phone),
          email = COALESCE($8, email),
          website = COALESCE($9, website),
          price_per_person_double = COALESCE($10, price_per_person_double),
          single_supplement = COALESCE($11, single_supplement),
          price_per_person_triple = COALESCE($12, price_per_person_triple),
          child_price_0_2 = COALESCE($13, child_price_0_2),
          child_price_3_5 = COALESCE($14, child_price_3_5),
          child_price_6_11 = COALESCE($15, child_price_6_11),
          currency = COALESCE($16, currency),
          meal_plan = COALESCE($17, meal_plan),
          meal_plan_supplement = COALESCE($18, meal_plan_supplement),
          facilities = COALESCE($19, facilities),
          picture_url = COALESCE($20, picture_url),
          notes = COALESCE($21, notes),
          is_active = COALESCE($22, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, hotel_name, star_rating, city_id, address, phone, email, website,
      price_per_person_double, single_supplement, price_per_person_triple,
      child_price_0_2, child_price_3_5, child_price_6_11, currency,
      meal_plan, meal_plan_supplement, facilities, picture_url, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE hotels
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
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};

// ============================================
// HOTEL ROOM TYPES (CRUD)
// ============================================

exports.getHotelRoomTypes = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const { hotel_id } = req.query;

    let query = `
      SELECT hrt.*, h.hotel_name
      FROM hotel_room_types hrt
      LEFT JOIN hotels h ON hrt.hotel_id = h.id
      WHERE hrt.deleted_at IS NULL
    `;
    const params = [];
    let paramCounter = 1;

    if (operatorId) {
      query += ` AND hrt.operator_id = $${paramCounter}`;
      params.push(operatorId);
      paramCounter++;
    }

    if (hotel_id) {
      query += ` AND hrt.hotel_id = $${paramCounter}`;
      params.push(hotel_id);
    }

    query += ' ORDER BY hrt.hotel_id, hrt.room_type ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hotel room types:', error);
    res.status(500).json({ error: 'Failed to fetch hotel room types' });
  }
};

exports.getHotelRoomTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT hrt.*, h.hotel_name
      FROM hotel_room_types hrt
      LEFT JOIN hotels h ON hrt.hotel_id = h.id
      WHERE hrt.id = $1 AND hrt.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND hrt.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel room type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hotel room type:', error);
    res.status(500).json({ error: 'Failed to fetch hotel room type' });
  }
};

exports.createHotelRoomType = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      hotel_id, room_type, room_view, price_per_person_double, single_supplement,
      price_per_person_triple, currency, max_occupancy, room_size_sqm, amenities
    } = req.body;

    // Validation
    if (!hotel_id || !room_type) {
      return res.status(400).json({ error: 'Hotel ID and room type are required' });
    }

    const query = `
      INSERT INTO hotel_room_types (
        operator_id, hotel_id, room_type, room_view, price_per_person_double,
        single_supplement, price_per_person_triple, currency, max_occupancy,
        room_size_sqm, amenities
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, hotel_id, room_type, room_view, price_per_person_double,
      single_supplement, price_per_person_triple, currency, max_occupancy,
      room_size_sqm, amenities
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hotel room type:', error);
    res.status(500).json({ error: 'Failed to create hotel room type' });
  }
};

exports.updateHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      hotel_id, room_type, room_view, price_per_person_double, single_supplement,
      price_per_person_triple, currency, max_occupancy, room_size_sqm, amenities
    } = req.body;

    let query = `
      UPDATE hotel_room_types
      SET hotel_id = COALESCE($2, hotel_id),
          room_type = COALESCE($3, room_type),
          room_view = COALESCE($4, room_view),
          price_per_person_double = COALESCE($5, price_per_person_double),
          single_supplement = COALESCE($6, single_supplement),
          price_per_person_triple = COALESCE($7, price_per_person_triple),
          currency = COALESCE($8, currency),
          max_occupancy = COALESCE($9, max_occupancy),
          room_size_sqm = COALESCE($10, room_size_sqm),
          amenities = COALESCE($11, amenities),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, hotel_id, room_type, room_view, price_per_person_double,
      single_supplement, price_per_person_triple, currency, max_occupancy,
      room_size_sqm, amenities
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel room type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hotel room type:', error);
    res.status(500).json({ error: 'Failed to update hotel room type' });
  }
};

exports.deleteHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE hotel_room_types
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
      return res.status(404).json({ error: 'Hotel room type not found' });
    }

    res.json({ message: 'Hotel room type deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel room type:', error);
    res.status(500).json({ error: 'Failed to delete hotel room type' });
  }
};
