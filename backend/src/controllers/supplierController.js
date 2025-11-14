const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// SUPPLIERS (Base table for all supplier types)
// ============================================

exports.getSuppliers = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, c.name as city_name
      FROM suppliers s
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE s.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND s.operator_id = $1';
      params.push(operatorId);
    }

    // Count query
    const countQuery = query.replace('SELECT s.*, c.name as city_name', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ' ORDER BY s.company_name ASC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: {
        suppliers: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT s.*, c.name as city_name
      FROM suppliers s
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND s.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active } = req.body;

    // Validation
    if (!supplier_type || !company_name) {
      return res.status(400).json({ error: 'Supplier type and company name are required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO suppliers (operator_id, supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_type, company_name, contact_person, email, phone,
      address, city_id, tax_id, payment_terms, bank_account_info, notes,
      is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE suppliers
      SET supplier_type = COALESCE($2, supplier_type),
          company_name = COALESCE($3, company_name),
          contact_person = COALESCE($4, contact_person),
          email = COALESCE($5, email),
          phone = COALESCE($6, phone),
          address = COALESCE($7, address),
          city_id = COALESCE($8, city_id),
          tax_id = COALESCE($9, tax_id),
          payment_terms = COALESCE($10, payment_terms),
          bank_account_info = COALESCE($11, bank_account_info),
          notes = COALESCE($12, notes),
          is_active = COALESCE($13, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, supplier_type, company_name, contact_person, email, phone, address, city_id, tax_id, payment_terms, bank_account_info, notes, is_active];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE suppliers
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
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};

// ============================================
// SUPPLIER CONTACTS (CRUD)
// ============================================

exports.getSupplierContacts = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const { supplier_id } = req.query;

    let query = `
      SELECT sc.*, s.company_name as supplier_name
      FROM supplier_contacts sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
      WHERE sc.deleted_at IS NULL
    `;
    const params = [];
    let paramCounter = 1;

    if (operatorId) {
      query += ` AND sc.operator_id = $${paramCounter}`;
      params.push(operatorId);
      paramCounter++;
    }

    if (supplier_id) {
      query += ` AND sc.supplier_id = $${paramCounter}`;
      params.push(supplier_id);
    }

    query += ' ORDER BY sc.is_primary DESC, sc.contact_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier contacts:', error);
    res.status(500).json({ error: 'Failed to fetch supplier contacts' });
  }
};

exports.getSupplierContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT sc.*, s.company_name as supplier_name
      FROM supplier_contacts sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
      WHERE sc.id = $1 AND sc.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND sc.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching supplier contact:', error);
    res.status(500).json({ error: 'Failed to fetch supplier contact' });
  }
};

exports.createSupplierContact = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes } = req.body;

    // Validation
    if (!supplier_id || !contact_name) {
      return res.status(400).json({ error: 'Supplier ID and contact name are required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const query = `
      INSERT INTO supplier_contacts (operator_id, supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, contact_type, contact_name, position, email,
      phone, mobile, whatsapp, is_primary || false, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier contact:', error);
    res.status(500).json({ error: 'Failed to create supplier contact' });
  }
};

exports.updateSupplierContact = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    let query = `
      UPDATE supplier_contacts
      SET supplier_id = COALESCE($2, supplier_id),
          contact_type = COALESCE($3, contact_type),
          contact_name = COALESCE($4, contact_name),
          position = COALESCE($5, position),
          email = COALESCE($6, email),
          phone = COALESCE($7, phone),
          mobile = COALESCE($8, mobile),
          whatsapp = COALESCE($9, whatsapp),
          is_primary = COALESCE($10, is_primary),
          notes = COALESCE($11, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, supplier_id, contact_type, contact_name, position, email, phone, mobile, whatsapp, is_primary, notes];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier contact:', error);
    res.status(500).json({ error: 'Failed to update supplier contact' });
  }
};

exports.deleteSupplierContact = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE supplier_contacts
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
      return res.status(404).json({ error: 'Supplier contact not found' });
    }

    res.json({ message: 'Supplier contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier contact:', error);
    res.status(500).json({ error: 'Failed to delete supplier contact' });
  }
};

// ============================================
// SUPPLIER RATINGS (CRUD)
// ============================================

exports.getSupplierRatings = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const { supplier_id } = req.query;

    let query = `
      SELECT sr.*, s.company_name as supplier_name, u.full_name as rated_by_name
      FROM supplier_ratings sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.rated_by = u.id
      WHERE sr.deleted_at IS NULL
    `;
    const params = [];
    let paramCounter = 1;

    if (operatorId) {
      query += ` AND sr.operator_id = $${paramCounter}`;
      params.push(operatorId);
      paramCounter++;
    }

    if (supplier_id) {
      query += ` AND sr.supplier_id = $${paramCounter}`;
      params.push(supplier_id);
    }

    query += ' ORDER BY sr.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier ratings:', error);
    res.status(500).json({ error: 'Failed to fetch supplier ratings' });
  }
};

exports.getSupplierRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT sr.*, s.company_name as supplier_name, u.full_name as rated_by_name
      FROM supplier_ratings sr
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN users u ON sr.rated_by = u.id
      WHERE sr.id = $1 AND sr.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND sr.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier rating not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching supplier rating:', error);
    res.status(500).json({ error: 'Failed to fetch supplier rating' });
  }
};

exports.createSupplierRating = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { supplier_id, booking_id, overall_rating, quality_rating, service_rating, value_rating, review_text } = req.body;
    const rated_by = req.user.userId;

    // Validation
    if (!supplier_id || !overall_rating) {
      return res.status(400).json({ error: 'Supplier ID and overall rating are required' });
    }

    if (overall_rating < 1 || overall_rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const query = `
      INSERT INTO supplier_ratings (operator_id, supplier_id, booking_id, overall_rating, quality_rating, service_rating, value_rating, review_text, rated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, booking_id, overall_rating, quality_rating,
      service_rating, value_rating, review_text, rated_by
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier rating:', error);
    res.status(500).json({ error: 'Failed to create supplier rating' });
  }
};

exports.updateSupplierRating = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { overall_rating, quality_rating, service_rating, value_rating, review_text } = req.body;

    // Validate ratings if provided
    if (overall_rating && (overall_rating < 1 || overall_rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    let query = `
      UPDATE supplier_ratings
      SET overall_rating = COALESCE($2, overall_rating),
          quality_rating = COALESCE($3, quality_rating),
          service_rating = COALESCE($4, service_rating),
          value_rating = COALESCE($5, value_rating),
          review_text = COALESCE($6, review_text),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, overall_rating, quality_rating, service_rating, value_rating, review_text];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier rating not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier rating:', error);
    res.status(500).json({ error: 'Failed to update supplier rating' });
  }
};

exports.deleteSupplierRating = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE supplier_ratings
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
      return res.status(404).json({ error: 'Supplier rating not found' });
    }

    res.json({ message: 'Supplier rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier rating:', error);
    res.status(500).json({ error: 'Failed to delete supplier rating' });
  }
};

// ============================================
// SUPPLIER CONTRACTS (CRUD)
// ============================================

exports.getSupplierContracts = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    const { supplier_id } = req.query;

    let query = `
      SELECT sc.*, s.company_name as supplier_name
      FROM supplier_contracts sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
      WHERE sc.deleted_at IS NULL
    `;
    const params = [];
    let paramCounter = 1;

    if (operatorId) {
      query += ` AND sc.operator_id = $${paramCounter}`;
      params.push(operatorId);
      paramCounter++;
    }

    if (supplier_id) {
      query += ` AND sc.supplier_id = $${paramCounter}`;
      params.push(supplier_id);
    }

    query += ' ORDER BY sc.start_date DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier contracts:', error);
    res.status(500).json({ error: 'Failed to fetch supplier contracts' });
  }
};

exports.getSupplierContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT sc.*, s.company_name as supplier_name
      FROM supplier_contracts sc
      LEFT JOIN suppliers s ON sc.supplier_id = s.id
      WHERE sc.id = $1 AND sc.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND sc.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier contract not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching supplier contract:', error);
    res.status(500).json({ error: 'Failed to fetch supplier contract' });
  }
};

exports.createSupplierContract = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const {
      supplier_id, contract_number, contract_type, start_date, end_date,
      payment_terms, cancellation_terms, special_rates, contract_value,
      currency, auto_renew, renewal_notice_days, contract_document_path,
      status, notes
    } = req.body;

    // Validation
    if (!supplier_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Supplier ID, start date, and end date are required' });
    }

    const query = `
      INSERT INTO supplier_contracts (
        operator_id, supplier_id, contract_number, contract_type, start_date, end_date,
        payment_terms, cancellation_terms, special_rates, contract_value, currency,
        auto_renew, renewal_notice_days, contract_document_path, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const result = await db.query(query, [
      operatorId, supplier_id, contract_number, contract_type, start_date, end_date,
      payment_terms, cancellation_terms, special_rates, contract_value, currency,
      auto_renew || false, renewal_notice_days, contract_document_path, status, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier contract:', error);
    res.status(500).json({ error: 'Failed to create supplier contract' });
  }
};

exports.updateSupplierContract = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const {
      supplier_id, contract_number, contract_type, start_date, end_date,
      payment_terms, cancellation_terms, special_rates, contract_value,
      currency, auto_renew, renewal_notice_days, contract_document_path,
      status, notes
    } = req.body;

    let query = `
      UPDATE supplier_contracts
      SET supplier_id = COALESCE($2, supplier_id),
          contract_number = COALESCE($3, contract_number),
          contract_type = COALESCE($4, contract_type),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          payment_terms = COALESCE($7, payment_terms),
          cancellation_terms = COALESCE($8, cancellation_terms),
          special_rates = COALESCE($9, special_rates),
          contract_value = COALESCE($10, contract_value),
          currency = COALESCE($11, currency),
          auto_renew = COALESCE($12, auto_renew),
          renewal_notice_days = COALESCE($13, renewal_notice_days),
          contract_document_path = COALESCE($14, contract_document_path),
          status = COALESCE($15, status),
          notes = COALESCE($16, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [
      id, supplier_id, contract_number, contract_type, start_date, end_date,
      payment_terms, cancellation_terms, special_rates, contract_value, currency,
      auto_renew, renewal_notice_days, contract_document_path, status, notes
    ];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier contract not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier contract:', error);
    res.status(500).json({ error: 'Failed to update supplier contract' });
  }
};

exports.deleteSupplierContract = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE supplier_contracts
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
      return res.status(404).json({ error: 'Supplier contract not found' });
    }

    res.json({ message: 'Supplier contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier contract:', error);
    res.status(500).json({ error: 'Failed to delete supplier contract' });
  }
};
