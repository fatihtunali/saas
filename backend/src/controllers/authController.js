const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT token
const generateToken = (userId, email, role, operatorId = null) => {
  return jwt.sign(
    { userId, email, role, operatorId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check in users table
    const user = await pool.query(
      'SELECT id, email, password_hash, role, operator_id, is_active FROM users WHERE email = $1',
      [email]
    );

    // User not found
    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userData = user.rows[0];

    // Check if user is active
    if (!userData.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get operator details if user is an operator
    let operatorData = null;
    if (userData.role === 'operator' && userData.operator_id) {
      const operator = await pool.query(
        'SELECT company_name, contact_phone FROM operators WHERE id = $1',
        [userData.operator_id]
      );
      if (operator.rows.length > 0) {
        operatorData = operator.rows[0];
      }
    }

    // Generate JWT token
    const token = generateToken(userData.id, userData.email, userData.role, userData.operator_id);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          operator_id: userData.operator_id,
          company_name: operatorData ? operatorData.company_name : null,
          phone: operatorData ? operatorData.contact_phone : null
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

// Register controller (operators only)
const register = async (req, res) => {
  try {
    const { email, password, company_name, contact_phone, address } = req.body;

    // Validate input
    if (!email || !password || !company_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and company name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert new operator company
      const operatorResult = await client.query(
        'INSERT INTO operators (company_name, contact_email, contact_phone, address, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, company_name, contact_email, contact_phone',
        [company_name, email, contact_phone || null, address || null]
      );

      const newOperator = operatorResult.rows[0];

      // Insert new user for the operator
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role, operator_id, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, email, role, operator_id',
        [email, hashedPassword, 'operator', newOperator.id]
      );

      const newUser = userResult.rows[0];

      await client.query('COMMIT');

      // Generate JWT token
      const token = generateToken(newUser.id, newUser.email, 'operator', newOperator.id);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: 'operator',
            operator_id: newOperator.id,
            company_name: newOperator.company_name,
            phone: newOperator.contact_phone
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
};

// Get current user (me endpoint)
const me = async (req, res) => {
  try {
    // User data is already attached to req by auth middleware
    const { userId, role } = req.user;

    // Fetch user data
    const result = await pool.query(
      'SELECT id, email, role, operator_id, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = result.rows[0];

    // Get operator details if user is an operator
    let operatorData = null;
    if (userData.role === 'operator' && userData.operator_id) {
      const operator = await pool.query(
        'SELECT company_name, contact_phone, contact_email FROM operators WHERE id = $1',
        [userData.operator_id]
      );
      if (operator.rows.length > 0) {
        operatorData = operator.rows[0];
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          operator_id: userData.operator_id,
          company_name: operatorData ? operatorData.company_name : null,
          phone: operatorData ? operatorData.contact_phone : null,
          created_at: userData.created_at
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data'
    });
  }
};

module.exports = {
  login,
  register,
  me
};
