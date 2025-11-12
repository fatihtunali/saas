const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { logLogin, logFailedLogin } = require('../middleware/activityLogger');
const { validatePassword } = require('../validators/userValidator');

// Generate JWT token
const generateToken = (userId, email, role, operatorId = null) => {
  return jwt.sign(
    { userId, email, role, operatorId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' } // Changed from 24h to 8h for Phase 9 security requirements
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
      // Log failed login attempt
      await logFailedLogin(email, req, 'Invalid password');

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

    // Update last_login timestamp
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userData.id]
    );

    // Log successful login
    await logLogin(userData.id, req);

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

    // Validate password strength (Phase 9 requirements)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
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

      // Insert new user for the operator (role changed to operator_admin for Phase 9)
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role, operator_id, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, email, role, operator_id',
        [email, hashedPassword, 'operator_admin', newOperator.id]
      );

      const newUser = userResult.rows[0];

      await client.query('COMMIT');

      // Log successful registration (new user logs their own registration)
      await logLogin(newUser.id, req);

      // Generate JWT token
      const token = generateToken(newUser.id, newUser.email, 'operator_admin', newOperator.id);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: 'operator_admin',
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

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch user data with operator info
    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.role,
        u.operator_id,
        u.is_active,
        u.full_name,
        u.phone,
        u.last_login,
        u.created_at,
        o.company_name as operator_name,
        o.contact_email as operator_email,
        o.contact_phone as operator_phone
      FROM users u
      LEFT JOIN operators o ON u.operator_id = o.id
      WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile'
    });
  }
};

// Update user profile (authenticated user updates their own profile)
const updateProfile = async (req, res) => {
  try {
    const { userId, email: currentEmail } = req.user;
    const { full_name, phone } = req.body;

    // Validate at least one field to update
    if (!full_name && !phone) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(full_name);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, role, full_name, phone, updated_at
    `;

    const result = await pool.query(query, values);

    // Log activity
    await pool.query(
      `INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        'UPDATE_PROFILE',
        'user',
        userId,
        JSON.stringify({
          updated_fields: Object.keys(req.body),
          user_email: currentEmail
        })
      ]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating profile'
    });
  }
};

// Change password (authenticated user changes their own password)
const changePassword = async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { current_password, new_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if new password is same as current
    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, result.rows[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    // Log activity
    await pool.query(
      `INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        'CHANGE_PASSWORD',
        'user',
        userId,
        JSON.stringify({
          user_email: email,
          changed_by_self: true
        })
      ]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
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
  me,
  getProfile,
  updateProfile,
  changePassword
};
