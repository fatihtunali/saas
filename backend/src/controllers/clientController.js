const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// CLIENTS (Direct B2C Clients - CRUD)
// ============================================

exports.getClients = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients WHERE deleted_at IS NULL';
    const params = [];
    let paramCount = 0;

    if (operatorId) {
      paramCount++;
      query += ` AND operator_id = $${paramCount}`;
      params.push(operatorId);
    }

    // Count total records
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY full_name ASC';
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        b2c_clients: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = 'SELECT * FROM clients WHERE id = $1 AND deleted_at IS NULL';
    const params = [id];

    if (operatorId) {
      query += ' AND operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      client_type, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO clients (
        operator_id, client_type, full_name, email, phone, birth_date, nationality,
        passport_number, passport_expiry_date, address, city, country,
        emergency_contact_name, emergency_contact_phone, dietary_requirements,
        accessibility_needs, medical_conditions, special_notes, payment_terms,
        credit_limit, credit_used, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, client_type, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used || 0, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      client_type, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE clients
      SET client_type = COALESCE($2, client_type),
          full_name = COALESCE($3, full_name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          birth_date = COALESCE($6, birth_date),
          nationality = COALESCE($7, nationality),
          passport_number = COALESCE($8, passport_number),
          passport_expiry_date = COALESCE($9, passport_expiry_date),
          address = COALESCE($10, address),
          city = COALESCE($11, city),
          country = COALESCE($12, country),
          emergency_contact_name = COALESCE($13, emergency_contact_name),
          emergency_contact_phone = COALESCE($14, emergency_contact_phone),
          dietary_requirements = COALESCE($15, dietary_requirements),
          accessibility_needs = COALESCE($16, accessibility_needs),
          medical_conditions = COALESCE($17, medical_conditions),
          special_notes = COALESCE($18, special_notes),
          payment_terms = COALESCE($19, payment_terms),
          credit_limit = COALESCE($20, credit_limit),
          credit_used = COALESCE($21, credit_used),
          is_active = COALESCE($22, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, client_type, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE clients
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
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

// ============================================
// OPERATORS CLIENTS (B2B Clients - CRUD)
// ============================================

exports.getOperatorsClients = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT oc.*, o.company_name as partner_company_name
      FROM operators_clients oc
      LEFT JOIN operators o ON oc.partner_operator_id = o.id
      WHERE oc.deleted_at IS NULL
    `;
    const params = [];
    let paramCount = 0;

    if (operatorId) {
      paramCount++;
      query += ` AND oc.operator_id = $${paramCount}`;
      params.push(operatorId);
    }

    // Count total records
    const countQuery = query.replace('SELECT oc.*, o.company_name as partner_company_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY oc.full_name ASC';
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        b2b_clients: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching operators clients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operators clients' });
  }
};

exports.getOperatorsClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT oc.*, o.company_name as partner_company_name
      FROM operators_clients oc
      LEFT JOIN operators o ON oc.partner_operator_id = o.id
      WHERE oc.id = $1 AND oc.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND oc.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operators client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching operators client:', error);
    res.status(500).json({ error: 'Failed to fetch operators client' });
  }
};

exports.createOperatorsClient = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      partner_operator_id, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO operators_clients (
        operator_id, partner_operator_id, full_name, email, phone, birth_date, nationality,
        passport_number, passport_expiry_date, address, city, country,
        emergency_contact_name, emergency_contact_phone, dietary_requirements,
        accessibility_needs, medical_conditions, special_notes, payment_terms,
        credit_limit, credit_used, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, partner_operator_id, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used || 0, is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating operators client:', error);
    res.status(500).json({ error: 'Failed to create operators client' });
  }
};

exports.updateOperatorsClient = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    const {
      partner_operator_id, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE operators_clients
      SET partner_operator_id = COALESCE($2, partner_operator_id),
          full_name = COALESCE($3, full_name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          birth_date = COALESCE($6, birth_date),
          nationality = COALESCE($7, nationality),
          passport_number = COALESCE($8, passport_number),
          passport_expiry_date = COALESCE($9, passport_expiry_date),
          address = COALESCE($10, address),
          city = COALESCE($11, city),
          country = COALESCE($12, country),
          emergency_contact_name = COALESCE($13, emergency_contact_name),
          emergency_contact_phone = COALESCE($14, emergency_contact_phone),
          dietary_requirements = COALESCE($15, dietary_requirements),
          accessibility_needs = COALESCE($16, accessibility_needs),
          medical_conditions = COALESCE($17, medical_conditions),
          special_notes = COALESCE($18, special_notes),
          payment_terms = COALESCE($19, payment_terms),
          credit_limit = COALESCE($20, credit_limit),
          credit_used = COALESCE($21, credit_used),
          is_active = COALESCE($22, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, partner_operator_id, full_name, email, phone, birth_date, nationality,
      passport_number, passport_expiry_date, address, city, country,
      emergency_contact_name, emergency_contact_phone, dietary_requirements,
      accessibility_needs, medical_conditions, special_notes, payment_terms,
      credit_limit, credit_used, is_active
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operators client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating operators client:', error);
    res.status(500).json({ error: 'Failed to update operators client' });
  }
};

exports.deleteOperatorsClient = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE operators_clients
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
      return res.status(404).json({ error: 'Operators client not found' });
    }

    res.json({ message: 'Operators client deleted successfully' });
  } catch (error) {
    console.error('Error deleting operators client:', error);
    res.status(500).json({ error: 'Failed to delete operators client' });
  }
};

// ============================================
// OPERATORS (Super Admin Only - CRUD)
// ============================================

exports.getOperators = async (req, res) => {
  try {
    // Super admin sees all operators, operators see only themselves
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM operators WHERE deleted_at IS NULL';
    const params = [];
    let paramCount = 0;

    if (operatorId) {
      paramCount++;
      query += ` AND id = $${paramCount}`;
      params.push(operatorId);
    }

    // Count total records
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY company_name ASC';
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        operators: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operators' });
  }
};

exports.getOperatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;

    let query = 'SELECT * FROM operators WHERE id = $1 AND deleted_at IS NULL';
    const params = [id];

    if (operatorId && operatorId != id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching operator:', error);
    res.status(500).json({ error: 'Failed to fetch operator' });
  }
};

exports.createOperator = async (req, res) => {
  try {
    // Only super admin can create operators
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can create operators' });
    }

    const {
      company_name, contact_email, contact_phone, address,
      city, country, tax_id, base_currency, is_active
    } = req.body;

    // Validation
    if (!company_name || !contact_email) {
      return res.status(400).json({ error: 'Company name and contact email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const query = `
      INSERT INTO operators (
        company_name, contact_email, contact_phone, address,
        city, country, tax_id, base_currency, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      company_name, contact_email, contact_phone, address,
      city, country, tax_id, base_currency || 'TRY', is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating operator:', error);
    res.status(500).json({ error: 'Failed to create operator' });
  }
};

exports.updateOperator = async (req, res) => {
  try {
    const { id } = req.params;

    // Only super admin can update operators
    if (req.user.role !== 'super_admin' && req.user.operator_id != id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      company_name, contact_email, contact_phone, address,
      city, country, tax_id, base_currency, is_active
    } = req.body;

    // Validate email format if provided
    if (contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      UPDATE operators
      SET company_name = COALESCE($2, company_name),
          contact_email = COALESCE($3, contact_email),
          contact_phone = COALESCE($4, contact_phone),
          address = COALESCE($5, address),
          city = COALESCE($6, city),
          country = COALESCE($7, country),
          tax_id = COALESCE($8, tax_id),
          base_currency = COALESCE($9, base_currency),
          is_active = COALESCE($10, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await db.query(query, [
      id, company_name, contact_email, contact_phone, address,
      city, country, tax_id, base_currency, is_active
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating operator:', error);
    res.status(500).json({ error: 'Failed to update operator' });
  }
};

exports.deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;

    // Only super admin can delete operators
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can delete operators' });
    }

    const query = `
      UPDATE operators
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    res.json({ message: 'Operator deleted successfully' });
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).json({ error: 'Failed to delete operator' });
  }
};
