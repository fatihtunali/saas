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
    let query = 'SELECT * FROM clients WHERE deleted_at IS NULL';
    const params = [];

    if (operatorId) {
      query += ' AND operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY full_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
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
    let query = `
      SELECT oc.*, o.company_name as partner_company_name
      FROM operators_clients oc
      LEFT JOIN operators o ON oc.partner_operator_id = o.id
      WHERE oc.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND oc.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY oc.full_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching operators clients:', error);
    res.status(500).json({ error: 'Failed to fetch operators clients' });
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
