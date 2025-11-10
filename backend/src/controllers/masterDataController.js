const db = require('../config/database');

// Multi-tenant helper
const applyOperatorFilter = (req) => {
  return req.user.role === 'super_admin' ? null : req.user.operator_id;
};

// ============================================
// CITIES (Read-Only Seed Data)
// ============================================

exports.getCities = async (req, res) => {
  try {
    const query = 'SELECT * FROM cities WHERE deleted_at IS NULL ORDER BY name ASC';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM cities WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ error: 'Failed to fetch city' });
  }
};

// ============================================
// CURRENCIES (Read-Only Seed Data)
// ============================================

exports.getCurrencies = async (req, res) => {
  try {
    const query = 'SELECT * FROM currencies WHERE deleted_at IS NULL AND is_active = true ORDER BY code ASC';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
};

exports.getCurrencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM currencies WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching currency:', error);
    res.status(500).json({ error: 'Failed to fetch currency' });
  }
};

// ============================================
// EXCHANGE RATES (CRUD - Global Data)
// ============================================

exports.getExchangeRates = async (req, res) => {
  try {
    const query = 'SELECT * FROM exchange_rates WHERE deleted_at IS NULL ORDER BY rate_date DESC, from_currency ASC';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
};

exports.getExchangeRateById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM exchange_rates WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exchange rate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
};

exports.createExchangeRate = async (req, res) => {
  try {
    const { from_currency, to_currency, rate, rate_type, rate_date, source } = req.body;

    // Validation
    if (!from_currency || !to_currency || !rate || !rate_type || !rate_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO exchange_rates (from_currency, to_currency, rate, rate_type, rate_date, source)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [from_currency, to_currency, rate, rate_type, rate_date, source]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating exchange rate:', error);
    res.status(500).json({ error: 'Failed to create exchange rate' });
  }
};

exports.updateExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { from_currency, to_currency, rate, rate_type, rate_date, source } = req.body;

    const query = `
      UPDATE exchange_rates
      SET from_currency = COALESCE($2, from_currency),
          to_currency = COALESCE($3, to_currency),
          rate = COALESCE($4, rate),
          rate_type = COALESCE($5, rate_type),
          rate_date = COALESCE($6, rate_date),
          source = COALESCE($7, source),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await db.query(query, [id, from_currency, to_currency, rate, rate_type, rate_date, source]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exchange rate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
};

exports.deleteExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE exchange_rates
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exchange rate not found' });
    }

    res.json({ message: 'Exchange rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting exchange rate:', error);
    res.status(500).json({ error: 'Failed to delete exchange rate' });
  }
};

// ============================================
// SEASONS (CRUD)
// ============================================

exports.getSeasons = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = 'SELECT * FROM seasons WHERE deleted_at IS NULL';
    const params = [];

    if (operatorId) {
      query += ' AND operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY start_date DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
};

exports.getSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = 'SELECT * FROM seasons WHERE id = $1 AND deleted_at IS NULL';
    const params = [id];

    if (operatorId) {
      query += ' AND operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching season:', error);
    res.status(500).json({ error: 'Failed to fetch season' });
  }
};

exports.createSeason = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { season_name, start_date, end_date, price_multiplier, description } = req.body;

    // Validation
    if (!season_name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO seasons (operator_id, season_name, start_date, end_date, price_multiplier, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [operatorId, season_name, start_date, end_date, price_multiplier, description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating season:', error);
    res.status(500).json({ error: 'Failed to create season' });
  }
};

exports.updateSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { season_name, start_date, end_date, price_multiplier, description } = req.body;

    let query = `
      UPDATE seasons
      SET season_name = COALESCE($2, season_name),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          price_multiplier = COALESCE($5, price_multiplier),
          description = COALESCE($6, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, season_name, start_date, end_date, price_multiplier, description];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating season:', error);
    res.status(500).json({ error: 'Failed to update season' });
  }
};

exports.deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE seasons
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
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error('Error deleting season:', error);
    res.status(500).json({ error: 'Failed to delete season' });
  }
};

// ============================================
// SEASONAL PRICING (CRUD)
// ============================================

exports.getSeasonalPricing = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = `
      SELECT sp.*, s.season_name
      FROM seasonal_pricing sp
      LEFT JOIN seasons s ON sp.season_id = s.id
      WHERE sp.deleted_at IS NULL
    `;
    const params = [];

    if (operatorId) {
      query += ' AND sp.operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY sp.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seasonal pricing:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal pricing' });
  }
};

exports.getSeasonalPricingById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      SELECT sp.*, s.season_name
      FROM seasonal_pricing sp
      LEFT JOIN seasons s ON sp.season_id = s.id
      WHERE sp.id = $1 AND sp.deleted_at IS NULL
    `;
    const params = [id];

    if (operatorId) {
      query += ' AND sp.operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seasonal pricing not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching seasonal pricing:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal pricing' });
  }
};

exports.createSeasonalPricing = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { season_id, service_type, service_id, price, currency } = req.body;

    // Validation
    if (!season_id || !service_type || !service_id || !price || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO seasonal_pricing (operator_id, season_id, service_type, service_id, price, currency)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [operatorId, season_id, service_type, service_id, price, currency]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating seasonal pricing:', error);
    res.status(500).json({ error: 'Failed to create seasonal pricing' });
  }
};

exports.updateSeasonalPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { season_id, service_type, service_id, price, currency } = req.body;

    let query = `
      UPDATE seasonal_pricing
      SET season_id = COALESCE($2, season_id),
          service_type = COALESCE($3, service_type),
          service_id = COALESCE($4, service_id),
          price = COALESCE($5, price),
          currency = COALESCE($6, currency),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, season_id, service_type, service_id, price, currency];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seasonal pricing not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating seasonal pricing:', error);
    res.status(500).json({ error: 'Failed to update seasonal pricing' });
  }
};

exports.deleteSeasonalPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE seasonal_pricing
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
      return res.status(404).json({ error: 'Seasonal pricing not found' });
    }

    res.json({ message: 'Seasonal pricing deleted successfully' });
  } catch (error) {
    console.error('Error deleting seasonal pricing:', error);
    res.status(500).json({ error: 'Failed to delete seasonal pricing' });
  }
};

// ============================================
// TAX RATES (CRUD)
// ============================================

exports.getTaxRates = async (req, res) => {
  try {
    const operatorId = applyOperatorFilter(req);
    let query = 'SELECT * FROM tax_rates WHERE deleted_at IS NULL';
    const params = [];

    if (operatorId) {
      query += ' AND operator_id = $1';
      params.push(operatorId);
    }

    query += ' ORDER BY tax_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    res.status(500).json({ error: 'Failed to fetch tax rates' });
  }
};

exports.getTaxRateById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = 'SELECT * FROM tax_rates WHERE id = $1 AND deleted_at IS NULL';
    const params = [id];

    if (operatorId) {
      query += ' AND operator_id = $2';
      params.push(operatorId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tax rate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    res.status(500).json({ error: 'Failed to fetch tax rate' });
  }
};

exports.createTaxRate = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' && !req.body.operator_id
      ? null
      : (req.body.operator_id || req.user.operator_id);

    const { tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active } = req.body;

    // Validation
    if (!tax_name || !tax_type || !tax_rate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO tax_rates (operator_id, tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [operatorId, tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active !== false]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tax rate:', error);
    res.status(500).json({ error: 'Failed to create tax rate' });
  }
};

exports.updateTaxRate = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);
    const { tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active } = req.body;

    let query = `
      UPDATE tax_rates
      SET tax_name = COALESCE($2, tax_name),
          tax_type = COALESCE($3, tax_type),
          country = COALESCE($4, country),
          tax_rate = COALESCE($5, tax_rate),
          applies_to = COALESCE($6, applies_to),
          effective_from = COALESCE($7, effective_from),
          effective_to = COALESCE($8, effective_to),
          is_active = COALESCE($9, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id, tax_name, tax_type, country, tax_rate, applies_to, effective_from, effective_to, is_active];

    if (operatorId) {
      query += ` AND operator_id = $${params.length + 1}`;
      params.push(operatorId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tax rate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tax rate:', error);
    res.status(500).json({ error: 'Failed to update tax rate' });
  }
};

exports.deleteTaxRate = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = applyOperatorFilter(req);

    let query = `
      UPDATE tax_rates
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
      return res.status(404).json({ error: 'Tax rate not found' });
    }

    res.json({ message: 'Tax rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax rate:', error);
    res.status(500).json({ error: 'Failed to delete tax rate' });
  }
};
