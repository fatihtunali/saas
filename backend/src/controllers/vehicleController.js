const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// VEHICLE COMPANIES (CRUD)
// ============================================

exports.getVehicleCompanies = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = `
      SELECT vc.*, s.company_name as supplier_name
      FROM vehicle_companies vc
      LEFT JOIN suppliers s ON vc.supplier_id = s.id
      WHERE vc.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND vc.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY vc.company_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle companies:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle companies' });
  }
};

exports.getVehicleCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT vc.*, s.company_name as supplier_name
      FROM vehicle_companies vc
      LEFT JOIN suppliers s ON vc.supplier_id = s.id
      WHERE vc.id = $1 AND vc.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND vc.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle company:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle company' });
  }
};

exports.createVehicleCompany = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { supplier_id, company_name, contact_person, phone, email, is_active } = req.body;

    // Validation
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO vehicle_companies (operator_id, supplier_id, company_name, contact_person, phone, email, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await db.query(query, [operatorId, supplier_id, company_name, contact_person, phone, email, is_active !== false]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vehicle company:', error);
    res.status(500).json({ error: 'Failed to create vehicle company' });
  }
};

exports.updateVehicleCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { supplier_id, company_name, contact_person, phone, email, is_active } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE vehicle_companies
      SET supplier_id = COALESCE($2, supplier_id),
          company_name = COALESCE($3, company_name),
          contact_person = COALESCE($4, contact_person),
          phone = COALESCE($5, phone),
          email = COALESCE($6, email),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, supplier_id, company_name, contact_person, phone, email, is_active];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vehicle company:', error);
    res.status(500).json({ error: 'Failed to update vehicle company' });
  }
};

exports.deleteVehicleCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE vehicle_companies
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
      return res.status(404).json({ error: 'Vehicle company not found' });
    }

    res.json({ message: 'Vehicle company deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle company:', error);
    res.status(500).json({ error: 'Failed to delete vehicle company' });
  }
};

// ============================================
// VEHICLE TYPES (CRUD)
// ============================================

exports.getVehicleTypes = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const { vehicle_company_id } = req.query;

    let query = `
      SELECT vt.*, vc.company_name as company_name
      FROM vehicle_types vt
      LEFT JOIN vehicle_companies vc ON vt.vehicle_company_id = vc.id
      WHERE vt.deleted_at IS NULL
    `;
    const params = [];
    let paramCounter = 1;

    if (operatorId) {
      query += ` AND vt.operator_id = $${paramCounter}`;
      params.push(operatorId);
      paramCounter++;
    }

    if (vehicle_company_id) {
      query += ` AND vt.vehicle_company_id = $${paramCounter}`;
      params.push(vehicle_company_id);
    }

    query += ' ORDER BY vt.vehicle_type ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle types' });
  }
};

exports.getVehicleTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT vt.*, vc.company_name as company_name
      FROM vehicle_types vt
      LEFT JOIN vehicle_companies vc ON vt.vehicle_company_id = vc.id
      WHERE vt.id = $1 AND vt.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND vt.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle type:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle type' });
  }
};

exports.createVehicleType = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active } = req.body;

    // Validation
    if (!vehicle_company_id || !vehicle_type) {
      return res.status(400).json({ error: 'Vehicle company ID and vehicle type are required' });
    }

    const query = `
      INSERT INTO vehicle_types (operator_id, vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await db.query(query, [operatorId, vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active !== false]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    res.status(500).json({ error: 'Failed to create vehicle type' });
  }
};

exports.updateVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active } = req.body;

    let query = `
      UPDATE vehicle_types
      SET vehicle_company_id = COALESCE($2, vehicle_company_id),
          vehicle_type = COALESCE($3, vehicle_type),
          capacity = COALESCE($4, capacity),
          luggage_capacity = COALESCE($5, luggage_capacity),
          notes = COALESCE($6, notes),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, vehicle_company_id, vehicle_type, capacity, luggage_capacity, notes, is_active];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vehicle type:', error);
    res.status(500).json({ error: 'Failed to update vehicle type' });
  }
};

exports.deleteVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE vehicle_types
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
      return res.status(404).json({ error: 'Vehicle type not found' });
    }

    res.json({ message: 'Vehicle type deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle type:', error);
    res.status(500).json({ error: 'Failed to delete vehicle type' });
  }
};

// ============================================
// TRANSFER ROUTES (CRUD - City to City)
// ============================================

exports.getTransferRoutes = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = `
      SELECT tr.*,
             vc.company_name,
             vt.vehicle_type,
             c1.name as from_city_name,
             c2.name as to_city_name
      FROM transfer_routes tr
      LEFT JOIN vehicle_companies vc ON tr.vehicle_company_id = vc.id
      LEFT JOIN vehicle_types vt ON tr.vehicle_type_id = vt.id
      LEFT JOIN cities c1 ON tr.from_city_id = c1.id
      LEFT JOIN cities c2 ON tr.to_city_id = c2.id
      WHERE tr.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND tr.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY c1.name, c2.name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transfer routes:', error);
    res.status(500).json({ error: 'Failed to fetch transfer routes' });
  }
};

exports.getTransferRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT tr.*,
             vc.company_name,
             vt.vehicle_type,
             c1.name as from_city_name,
             c2.name as to_city_name
      FROM transfer_routes tr
      LEFT JOIN vehicle_companies vc ON tr.vehicle_company_id = vc.id
      LEFT JOIN vehicle_types vt ON tr.vehicle_type_id = vt.id
      LEFT JOIN cities c1 ON tr.from_city_id = c1.id
      LEFT JOIN cities c2 ON tr.to_city_id = c2.id
      WHERE tr.id = $1 AND tr.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND tr.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer route not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching transfer route:', error);
    res.status(500).json({ error: 'Failed to fetch transfer route' });
  }
};

exports.createTransferRoute = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      vehicle_company_id, vehicle_type_id, from_city_id, to_city_id,
      price_per_vehicle, currency, duration_hours, distance_km, notes, is_active
    } = req.body;

    // Validation
    if (!vehicle_company_id || !vehicle_type_id || !from_city_id || !to_city_id || !price_per_vehicle) {
      return res.status(400).json({ error: 'Required fields: vehicle_company_id, vehicle_type_id, from_city_id, to_city_id, price_per_vehicle' });
    }

    const query = `
      INSERT INTO transfer_routes (
        operator_id, vehicle_company_id, vehicle_type_id, from_city_id, to_city_id,
        price_per_vehicle, currency, duration_hours, distance_km, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, vehicle_company_id, vehicle_type_id, from_city_id, to_city_id,
      price_per_vehicle, currency, duration_hours, distance_km, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating transfer route:', error);
    res.status(500).json({ error: 'Failed to create transfer route' });
  }
};

exports.updateTransferRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      vehicle_company_id, vehicle_type_id, from_city_id, to_city_id,
      price_per_vehicle, currency, duration_hours, distance_km, notes, is_active
    } = req.body;

    let query = `
      UPDATE transfer_routes
      SET vehicle_company_id = COALESCE($2, vehicle_company_id),
          vehicle_type_id = COALESCE($3, vehicle_type_id),
          from_city_id = COALESCE($4, from_city_id),
          to_city_id = COALESCE($5, to_city_id),
          price_per_vehicle = COALESCE($6, price_per_vehicle),
          currency = COALESCE($7, currency),
          duration_hours = COALESCE($8, duration_hours),
          distance_km = COALESCE($9, distance_km),
          notes = COALESCE($10, notes),
          is_active = COALESCE($11, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, vehicle_company_id, vehicle_type_id, from_city_id, to_city_id,
      price_per_vehicle, currency, duration_hours, distance_km, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer route not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating transfer route:', error);
    res.status(500).json({ error: 'Failed to update transfer route' });
  }
};

exports.deleteTransferRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE transfer_routes
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
      return res.status(404).json({ error: 'Transfer route not found' });
    }

    res.json({ message: 'Transfer route deleted successfully' });
  } catch (error) {
    console.error('Error deleting transfer route:', error);
    res.status(500).json({ error: 'Failed to delete transfer route' });
  }
};

// ============================================
// VEHICLE RENTALS (CRUD - Full/Half/Night)
// ============================================

exports.getVehicleRentals = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = `
      SELECT vr.*,
             vc.company_name,
             vt.vehicle_type
      FROM vehicle_rentals vr
      LEFT JOIN vehicle_companies vc ON vr.vehicle_company_id = vc.id
      LEFT JOIN vehicle_types vt ON vr.vehicle_type_id = vt.id
      WHERE vr.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND vr.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY vc.company_name, vt.vehicle_type ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle rentals:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle rentals' });
  }
};

exports.getVehicleRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT vr.*,
             vc.company_name,
             vt.vehicle_type
      FROM vehicle_rentals vr
      LEFT JOIN vehicle_companies vc ON vr.vehicle_company_id = vc.id
      LEFT JOIN vehicle_types vt ON vr.vehicle_type_id = vt.id
      WHERE vr.id = $1 AND vr.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND vr.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle rental not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle rental:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle rental' });
  }
};

exports.createVehicleRental = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km,
      half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours,
      night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active
    } = req.body;

    // Validation
    if (!vehicle_company_id || !vehicle_type_id) {
      return res.status(400).json({ error: 'Vehicle company ID and vehicle type ID are required' });
    }

    const query = `
      INSERT INTO vehicle_rentals (
        operator_id, vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km,
        half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours,
        night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km,
      half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours,
      night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vehicle rental:', error);
    res.status(500).json({ error: 'Failed to create vehicle rental' });
  }
};

exports.updateVehicleRental = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km,
      half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours,
      night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active
    } = req.body;

    let query = `
      UPDATE vehicle_rentals
      SET vehicle_company_id = COALESCE($2, vehicle_company_id),
          vehicle_type_id = COALESCE($3, vehicle_type_id),
          full_day_price = COALESCE($4, full_day_price),
          full_day_hours = COALESCE($5, full_day_hours),
          full_day_km = COALESCE($6, full_day_km),
          half_day_price = COALESCE($7, half_day_price),
          half_day_hours = COALESCE($8, half_day_hours),
          half_day_km = COALESCE($9, half_day_km),
          night_rental_price = COALESCE($10, night_rental_price),
          night_rental_hours = COALESCE($11, night_rental_hours),
          night_rental_km = COALESCE($12, night_rental_km),
          extra_hour_rate = COALESCE($13, extra_hour_rate),
          extra_km_rate = COALESCE($14, extra_km_rate),
          currency = COALESCE($15, currency),
          notes = COALESCE($16, notes),
          is_active = COALESCE($17, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, vehicle_company_id, vehicle_type_id, full_day_price, full_day_hours, full_day_km,
      half_day_price, half_day_hours, half_day_km, night_rental_price, night_rental_hours,
      night_rental_km, extra_hour_rate, extra_km_rate, currency, notes, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle rental not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vehicle rental:', error);
    res.status(500).json({ error: 'Failed to update vehicle rental' });
  }
};

exports.deleteVehicleRental = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE vehicle_rentals
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
      return res.status(404).json({ error: 'Vehicle rental not found' });
    }

    res.json({ message: 'Vehicle rental deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle rental:', error);
    res.status(500).json({ error: 'Failed to delete vehicle rental' });
  }
};
