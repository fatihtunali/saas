const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// GUIDES (CRUD - Multiple Rate Types)
// ============================================

exports.getGuides = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT g.*, s.company_name as supplier_name
      FROM guides g
      LEFT JOIN suppliers s ON g.supplier_id = s.id
      WHERE g.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND g.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT g.*, s.company_name as supplier_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY g.guide_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        guides: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT g.*, s.company_name as supplier_name
      FROM guides g
      LEFT JOIN suppliers s ON g.supplier_id = s.id
      WHERE g.id = $1 AND g.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND g.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, guide_name, phone, email, languages, daily_rate, half_day_rate,
      night_rate, transfer_rate, currency, specializations, license_number,
      profile_picture_url, notes, is_active
    } = req.body;

    // Validation
    if (!guide_name) {
      return res.status(400).json({ error: 'Guide name is required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO guides (
        operator_id, supplier_id, guide_name, phone, email, languages, daily_rate,
        half_day_rate, night_rate, transfer_rate, currency, specializations,
        license_number, profile_picture_url, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, guide_name, phone, email, languages, daily_rate,
      half_day_rate, night_rate, transfer_rate, currency, specializations,
      license_number, profile_picture_url, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating guide:', error);
    res.status(500).json({ error: 'Failed to create guide' });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, guide_name, phone, email, languages, daily_rate, half_day_rate,
      night_rate, transfer_rate, currency, specializations, license_number,
      profile_picture_url, notes, is_active
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE guides
      SET supplier_id = COALESCE($2, supplier_id),
          guide_name = COALESCE($3, guide_name),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          languages = COALESCE($6, languages),
          daily_rate = COALESCE($7, daily_rate),
          half_day_rate = COALESCE($8, half_day_rate),
          night_rate = COALESCE($9, night_rate),
          transfer_rate = COALESCE($10, transfer_rate),
          currency = COALESCE($11, currency),
          specializations = COALESCE($12, specializations),
          license_number = COALESCE($13, license_number),
          profile_picture_url = COALESCE($14, profile_picture_url),
          notes = COALESCE($15, notes),
          is_active = COALESCE($16, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, guide_name, phone, email, languages, daily_rate, half_day_rate,
      night_rate, transfer_rate, currency, specializations, license_number,
      profile_picture_url, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating guide:', error);
    res.status(500).json({ error: 'Failed to update guide' });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE guides
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
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Error deleting guide:', error);
    res.status(500).json({ error: 'Failed to delete guide' });
  }
};

// ============================================
// RESTAURANTS (CRUD)
// ============================================

exports.getRestaurants = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, s.company_name as supplier_name, c.name as city_name
      FROM restaurants r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN cities c ON r.city_id = c.id
      WHERE r.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND r.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT r.*, s.company_name as supplier_name, c.name as city_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY r.restaurant_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        restaurants: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT r.*, s.company_name as supplier_name, c.name as city_name
      FROM restaurants r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN cities c ON r.city_id = c.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND r.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, restaurant_name, city_id, address, phone, lunch_price,
      dinner_price, currency, capacity, cuisine_type, menu_options,
      picture_url, notes, is_active
    } = req.body;

    // Validation
    if (!restaurant_name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    const query = `
      INSERT INTO restaurants (
        operator_id, supplier_id, restaurant_name, city_id, address, phone,
        lunch_price, dinner_price, currency, capacity, cuisine_type,
        menu_options, picture_url, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, restaurant_name, city_id, address, phone,
      lunch_price, dinner_price, currency, capacity, cuisine_type,
      menu_options, picture_url, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, restaurant_name, city_id, address, phone, lunch_price,
      dinner_price, currency, capacity, cuisine_type, menu_options,
      picture_url, notes, is_active
    } = req.body;

    let query = `
      UPDATE restaurants
      SET supplier_id = COALESCE($2, supplier_id),
          restaurant_name = COALESCE($3, restaurant_name),
          city_id = COALESCE($4, city_id),
          address = COALESCE($5, address),
          phone = COALESCE($6, phone),
          lunch_price = COALESCE($7, lunch_price),
          dinner_price = COALESCE($8, dinner_price),
          currency = COALESCE($9, currency),
          capacity = COALESCE($10, capacity),
          cuisine_type = COALESCE($11, cuisine_type),
          menu_options = COALESCE($12, menu_options),
          picture_url = COALESCE($13, picture_url),
          notes = COALESCE($14, notes),
          is_active = COALESCE($15, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, restaurant_name, city_id, address, phone, lunch_price,
      dinner_price, currency, capacity, cuisine_type, menu_options,
      picture_url, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE restaurants
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
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};

// ============================================
// ENTRANCE FEES (CRUD)
// ============================================

exports.getEntranceFees = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ef.*, s.company_name as supplier_name, c.name as city_name
      FROM entrance_fees ef
      LEFT JOIN suppliers s ON ef.supplier_id = s.id
      LEFT JOIN cities c ON ef.city_id = c.id
      WHERE ef.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND ef.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT ef.*, s.company_name as supplier_name, c.name as city_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY ef.site_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        entrance_fees: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching entrance fees:', error);
    res.status(500).json({ error: 'Failed to fetch entrance fees' });
  }
};

exports.getEntranceFeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT ef.*, s.company_name as supplier_name, c.name as city_name
      FROM entrance_fees ef
      LEFT JOIN suppliers s ON ef.supplier_id = s.id
      LEFT JOIN cities c ON ef.city_id = c.id
      WHERE ef.id = $1 AND ef.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND ef.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrance fee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching entrance fee:', error);
    res.status(500).json({ error: 'Failed to fetch entrance fee' });
  }
};

exports.createEntranceFee = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, site_name, city_id, adult_price, child_price, student_price,
      senior_price, currency, opening_hours, best_visit_time, picture_url,
      notes, is_active
    } = req.body;

    // Validation
    if (!site_name) {
      return res.status(400).json({ error: 'Site name is required' });
    }

    const query = `
      INSERT INTO entrance_fees (
        operator_id, supplier_id, site_name, city_id, adult_price, child_price,
        student_price, senior_price, currency, opening_hours, best_visit_time,
        picture_url, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, site_name, city_id, adult_price, child_price,
      student_price, senior_price, currency, opening_hours, best_visit_time,
      picture_url, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating entrance fee:', error);
    res.status(500).json({ error: 'Failed to create entrance fee' });
  }
};

exports.updateEntranceFee = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, site_name, city_id, adult_price, child_price, student_price,
      senior_price, currency, opening_hours, best_visit_time, picture_url,
      notes, is_active
    } = req.body;

    let query = `
      UPDATE entrance_fees
      SET supplier_id = COALESCE($2, supplier_id),
          site_name = COALESCE($3, site_name),
          city_id = COALESCE($4, city_id),
          adult_price = COALESCE($5, adult_price),
          child_price = COALESCE($6, child_price),
          student_price = COALESCE($7, student_price),
          senior_price = COALESCE($8, senior_price),
          currency = COALESCE($9, currency),
          opening_hours = COALESCE($10, opening_hours),
          best_visit_time = COALESCE($11, best_visit_time),
          picture_url = COALESCE($12, picture_url),
          notes = COALESCE($13, notes),
          is_active = COALESCE($14, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, site_name, city_id, adult_price, child_price, student_price,
      senior_price, currency, opening_hours, best_visit_time, picture_url,
      notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrance fee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating entrance fee:', error);
    res.status(500).json({ error: 'Failed to update entrance fee' });
  }
};

exports.deleteEntranceFee = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE entrance_fees
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
      return res.status(404).json({ error: 'Entrance fee not found' });
    }

    res.json({ message: 'Entrance fee deleted successfully' });
  } catch (error) {
    console.error('Error deleting entrance fee:', error);
    res.status(500).json({ error: 'Failed to delete entrance fee' });
  }
};

// ============================================
// TOUR COMPANIES (CRUD - SIC vs PVT Pricing)
// ============================================

exports.getTourCompanies = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT tc.*, s.company_name as supplier_name
      FROM tour_companies tc
      LEFT JOIN suppliers s ON tc.supplier_id = s.id
      WHERE tc.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND tc.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT tc.*, s.company_name as supplier_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY tc.company_name, tc.tour_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        tour_companies: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tour companies:', error);
    res.status(500).json({ error: 'Failed to fetch tour companies' });
  }
};

exports.getTourCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT tc.*, s.company_name as supplier_name
      FROM tour_companies tc
      LEFT JOIN suppliers s ON tc.supplier_id = s.id
      WHERE tc.id = $1 AND tc.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND tc.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tour company:', error);
    res.status(500).json({ error: 'Failed to fetch tour company' });
  }
};

exports.createTourCompany = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, company_name, tour_name, tour_type, duration_days, duration_hours,
      sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax,
      pvt_price_10_pax, currency, min_passengers, max_passengers, current_bookings,
      itinerary, inclusions, exclusions, picture_url, notes, is_active
    } = req.body;

    // Validation
    if (!company_name || !tour_name || !tour_type) {
      return res.status(400).json({ error: 'Company name, tour name, and tour type are required' });
    }

    const query = `
      INSERT INTO tour_companies (
        operator_id, supplier_id, company_name, tour_name, tour_type, duration_days,
        duration_hours, sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
        pvt_price_8_pax, pvt_price_10_pax, currency, min_passengers, max_passengers,
        current_bookings, itinerary, inclusions, exclusions, picture_url, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, company_name, tour_name, tour_type, duration_days,
      duration_hours, sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
      pvt_price_8_pax, pvt_price_10_pax, currency, min_passengers, max_passengers,
      current_bookings || 0, itinerary, inclusions, exclusions, picture_url, notes,
      is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tour company:', error);
    res.status(500).json({ error: 'Failed to create tour company' });
  }
};

exports.updateTourCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, company_name, tour_name, tour_type, duration_days, duration_hours,
      sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax,
      pvt_price_10_pax, currency, min_passengers, max_passengers, current_bookings,
      itinerary, inclusions, exclusions, picture_url, notes, is_active
    } = req.body;

    let query = `
      UPDATE tour_companies
      SET supplier_id = COALESCE($2, supplier_id),
          company_name = COALESCE($3, company_name),
          tour_name = COALESCE($4, tour_name),
          tour_type = COALESCE($5, tour_type),
          duration_days = COALESCE($6, duration_days),
          duration_hours = COALESCE($7, duration_hours),
          sic_price = COALESCE($8, sic_price),
          pvt_price_2_pax = COALESCE($9, pvt_price_2_pax),
          pvt_price_4_pax = COALESCE($10, pvt_price_4_pax),
          pvt_price_6_pax = COALESCE($11, pvt_price_6_pax),
          pvt_price_8_pax = COALESCE($12, pvt_price_8_pax),
          pvt_price_10_pax = COALESCE($13, pvt_price_10_pax),
          currency = COALESCE($14, currency),
          min_passengers = COALESCE($15, min_passengers),
          max_passengers = COALESCE($16, max_passengers),
          current_bookings = COALESCE($17, current_bookings),
          itinerary = COALESCE($18, itinerary),
          inclusions = COALESCE($19, inclusions),
          exclusions = COALESCE($20, exclusions),
          picture_url = COALESCE($21, picture_url),
          notes = COALESCE($22, notes),
          is_active = COALESCE($23, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, company_name, tour_name, tour_type, duration_days, duration_hours,
      sic_price, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax,
      pvt_price_10_pax, currency, min_passengers, max_passengers, current_bookings,
      itinerary, inclusions, exclusions, picture_url, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tour company:', error);
    res.status(500).json({ error: 'Failed to update tour company' });
  }
};

exports.deleteTourCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE tour_companies
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
      return res.status(404).json({ error: 'Tour company not found' });
    }

    res.json({ message: 'Tour company deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour company:', error);
    res.status(500).json({ error: 'Failed to delete tour company' });
  }
};

// ============================================
// EXTRA EXPENSES (CRUD)
// ============================================

exports.getExtraExpenses = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ee.*, s.company_name as supplier_name
      FROM extra_expenses ee
      LEFT JOIN suppliers s ON ee.supplier_id = s.id
      WHERE ee.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND ee.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT ee.*, s.company_name as supplier_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY ee.expense_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        extra_expenses: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching extra expenses:', error);
    res.status(500).json({ error: 'Failed to fetch extra expenses' });
  }
};

exports.getExtraExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT ee.*, s.company_name as supplier_name
      FROM extra_expenses ee
      LEFT JOIN suppliers s ON ee.supplier_id = s.id
      WHERE ee.id = $1 AND ee.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND ee.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Extra expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching extra expense:', error);
    res.status(500).json({ error: 'Failed to fetch extra expense' });
  }
};

exports.createExtraExpense = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, expense_name, expense_category, price, currency,
      description, notes, is_active
    } = req.body;

    // Validation
    if (!expense_name) {
      return res.status(400).json({ error: 'Expense name is required' });
    }

    const query = `
      INSERT INTO extra_expenses (
        operator_id, supplier_id, expense_name, expense_category, price,
        currency, description, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, expense_name, expense_category, price,
      currency, description, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating extra expense:', error);
    res.status(500).json({ error: 'Failed to create extra expense' });
  }
};

exports.updateExtraExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      supplier_id, expense_name, expense_category, price, currency,
      description, notes, is_active
    } = req.body;

    let query = `
      UPDATE extra_expenses
      SET supplier_id = COALESCE($2, supplier_id),
          expense_name = COALESCE($3, expense_name),
          expense_category = COALESCE($4, expense_category),
          price = COALESCE($5, price),
          currency = COALESCE($6, currency),
          description = COALESCE($7, description),
          notes = COALESCE($8, notes),
          is_active = COALESCE($9, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, expense_name, expense_category, price, currency,
      description, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Extra expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating extra expense:', error);
    res.status(500).json({ error: 'Failed to update extra expense' });
  }
};

exports.deleteExtraExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE extra_expenses
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
      return res.status(404).json({ error: 'Extra expense not found' });
    }

    res.json({ message: 'Extra expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting extra expense:', error);
    res.status(500).json({ error: 'Failed to delete extra expense' });
  }
};
