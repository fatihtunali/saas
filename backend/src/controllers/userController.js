const bcrypt = require('bcrypt');
const pool = require('../config/database');

// ============================================
// USER CONTROLLER - Phase 9
// ============================================
// 11 Functions for complete user management
// Multi-tenant security with operator_id filtering
// Role-based access control
// Password management & security
// Activity logging integration
// ============================================

// Helper function to filter users by operator_id (multi-tenant security)
const applyOperatorFilter = (role, operatorId) => {
  // Super admin can see all users
  if (role === 'super_admin') {
    return { clause: '', params: [] };
  }

  // All other roles can only see users from their operator
  return {
    clause: 'AND u.operator_id = $1',
    params: [operatorId]
  };
};

// Helper function to validate role assignment
const canAssignRole = (assignerRole, targetRole) => {
  const roleHierarchy = {
    'super_admin': 6,
    'operator_admin': 5,
    'operations_manager': 4,
    'sales_manager': 3,
    'accountant': 2,
    'staff': 1
  };

  const assignerLevel = roleHierarchy[assignerRole] || 0;
  const targetLevel = roleHierarchy[targetRole] || 0;

  // Can only assign roles at or below your level (except super_admin can assign anyone)
  return assignerRole === 'super_admin' || assignerLevel > targetLevel;
};

// Helper function to validate password strength
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
};

// 1. GET ALL USERS
// List all users with filtering and multi-tenant security
const getAllUsers = async (req, res) => {
  try {
    const { role, operator_id } = req.user;
    const {
      search,
      role: filterRole,
      is_active,
      page = 1,
      limit = 50
    } = req.query;

    // Apply operator filter for multi-tenant security
    const filter = applyOperatorFilter(role, operator_id);
    let paramIndex = filter.params.length + 1;
    const queryParams = [...filter.params];

    // Build WHERE clause
    let whereConditions = ['u.deleted_at IS NULL'];
    if (filter.clause) {
      whereConditions.push(filter.clause.replace('AND ', ''));
    }

    // Search by name or email
    if (search) {
      whereConditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by role
    if (filterRole) {
      whereConditions.push(`u.role = $${paramIndex}`);
      queryParams.push(filterRole);
      paramIndex++;
    }

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const query = `
      SELECT
        u.id,
        u.email,
        u.role,
        u.operator_id,
        u.is_active,
        u.full_name,
        u.phone,
        u.last_login,
        u.created_at,
        u.updated_at,
        o.company_name as operator_name
      FROM users u
      LEFT JOIN operators o ON u.operator_id = o.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
};

// 2. GET USER BY ID
// Get single user details with multi-tenant check
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, operator_id } = req.user;

    // Apply operator filter
    const filter = applyOperatorFilter(role, operator_id);
    const queryParams = [...filter.params, id];
    const idParamIndex = filter.params.length + 1;

    const query = `
      SELECT
        u.id,
        u.email,
        u.role,
        u.operator_id,
        u.is_active,
        u.full_name,
        u.phone,
        u.last_login,
        u.created_at,
        u.updated_at,
        o.company_name as operator_name,
        o.contact_email as operator_email,
        o.contact_phone as operator_phone
      FROM users u
      LEFT JOIN operators o ON u.operator_id = o.id
      WHERE u.id = $${idParamIndex}
        AND u.deleted_at IS NULL
        ${filter.clause}
    `;

    const result = await pool.query(query, queryParams);

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
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user'
    });
  }
};

// 3. CREATE USER
// Create new user with validation and security checks
const createUser = async (req, res) => {
  try {
    const { role: creatorRole, operator_id: creatorOperatorId } = req.user;
    const {
      email,
      password,
      role,
      full_name,
      phone,
      operator_id
    } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
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

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordErrors
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'operator_admin', 'operations_manager', 'sales_manager', 'accountant', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if creator can assign this role
    if (!canAssignRole(creatorRole, role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to assign this role'
      });
    }

    // Multi-tenant security: Set operator_id based on creator's role
    let finalOperatorId = null;
    if (creatorRole === 'super_admin') {
      // Super admin can specify operator_id or leave null for another super_admin
      finalOperatorId = operator_id || null;
    } else {
      // All other roles must create users in their own operator
      finalOperatorId = creatorOperatorId;
    }

    // Validate operator_id if role requires it
    if (role !== 'super_admin' && !finalOperatorId) {
      return res.status(400).json({
        success: false,
        message: 'Operator ID is required for non-super-admin users'
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (
        email,
        password_hash,
        role,
        operator_id,
        full_name,
        phone,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING id, email, role, operator_id, full_name, phone, is_active, created_at`,
      [email, hashedPassword, role, finalOperatorId, full_name || null, phone || null]
    );

    const newUser = result.rows[0];

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
        req.user.userId,
        'CREATE',
        'user',
        newUser.id,
        JSON.stringify({
          created_user_email: email,
          created_user_role: role,
          created_by: req.user.email
        })
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating user'
    });
  }
};

// 4. UPDATE USER
// Update user details with security checks
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: updaterRole, operator_id: updaterOperatorId, userId: updaterId } = req.user;
    const {
      email,
      role,
      full_name,
      phone,
      is_active
    } = req.body;

    // Check if user exists and belongs to operator
    const filter = applyOperatorFilter(updaterRole, updaterOperatorId);
    const checkParams = [...filter.params, id];
    const checkQuery = `
      SELECT * FROM users
      WHERE id = $${filter.params.length + 1}
        AND deleted_at IS NULL
        ${filter.clause}
    `;
    const userCheck = await pool.query(checkQuery, checkParams);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingUser = userCheck.rows[0];

    // Prevent user from changing their own role
    if (parseInt(id) === updaterId && role && role !== existingUser.role) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Check if updater can assign the new role
    if (role && role !== existingUser.role) {
      if (!canAssignRole(updaterRole, role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to assign this role'
        });
      }
    }

    // Validate email if changing
    if (email && email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if email is already taken
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

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

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, role, operator_id, full_name, phone, is_active, updated_at
    `;

    const result = await pool.query(updateQuery, values);

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
        updaterId,
        'UPDATE',
        'user',
        id,
        JSON.stringify({
          updated_fields: Object.keys(req.body),
          updated_by: req.user.email
        })
      ]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user'
    });
  }
};

// 5. DELETE USER (Soft Delete)
// Soft delete user by setting deleted_at timestamp
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: deleterRole, operator_id: deleterOperatorId, userId: deleterId } = req.user;

    // Cannot delete yourself
    if (parseInt(id) === deleterId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists and belongs to operator
    const filter = applyOperatorFilter(deleterRole, deleterOperatorId);
    const checkParams = [...filter.params, id];
    const checkQuery = `
      SELECT * FROM users
      WHERE id = $${filter.params.length + 1}
        AND deleted_at IS NULL
        ${filter.clause}
    `;
    const userCheck = await pool.query(checkQuery, checkParams);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userToDelete = userCheck.rows[0];

    // Cannot delete super_admin
    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin accounts cannot be deleted'
      });
    }

    // Soft delete
    await pool.query(
      'UPDATE users SET deleted_at = NOW(), is_active = false WHERE id = $1',
      [id]
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
        deleterId,
        'DELETE',
        'user',
        id,
        JSON.stringify({
          deleted_user_email: userToDelete.email,
          deleted_user_role: userToDelete.role,
          deleted_by: req.user.email
        })
      ]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting user'
    });
  }
};

// 6. UPDATE PASSWORD
// User changes their own password (authenticated user)
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, email } = req.user;
    const { current_password, new_password } = req.body;

    // Validate that user can only change their own password
    if (parseInt(id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password'
      });
    }

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordErrors = validatePassword(new_password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordErrors
      });
    }

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
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
      [hashedPassword, id]
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
        'UPDATE_PASSWORD',
        'user',
        id,
        JSON.stringify({
          user_email: email,
          changed_by_user: true
        })
      ]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating password'
    });
  }
};

// 7. RESET PASSWORD (Admin)
// Admin resets another user's password
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: adminRole, operator_id: adminOperatorId, userId: adminId, email: adminEmail } = req.user;
    const { new_password } = req.body;

    // Validate required fields
    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(new_password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordErrors
      });
    }

    // Check if user exists and belongs to operator
    const filter = applyOperatorFilter(adminRole, adminOperatorId);
    const checkParams = [...filter.params, id];
    const checkQuery = `
      SELECT email, role FROM users
      WHERE id = $${filter.params.length + 1}
        AND deleted_at IS NULL
        ${filter.clause}
    `;
    const userCheck = await pool.query(checkQuery, checkParams);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userCheck.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
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
        adminId,
        'RESET_PASSWORD',
        'user',
        id,
        JSON.stringify({
          target_user_email: targetUser.email,
          reset_by_admin: adminEmail
        })
      ]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password'
    });
  }
};

// 8. TOGGLE USER STATUS
// Activate or deactivate user account
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: adminRole, operator_id: adminOperatorId, userId: adminId } = req.user;
    const { is_active } = req.body;

    // Validate required fields
    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_active field is required'
      });
    }

    // Cannot change own status
    if (parseInt(id) === adminId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    // Check if user exists and belongs to operator
    const filter = applyOperatorFilter(adminRole, adminOperatorId);
    const checkParams = [...filter.params, id];
    const checkQuery = `
      SELECT email, role FROM users
      WHERE id = $${filter.params.length + 1}
        AND deleted_at IS NULL
        ${filter.clause}
    `;
    const userCheck = await pool.query(checkQuery, checkParams);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userCheck.rows[0];

    // Cannot deactivate super_admin
    if (targetUser.role === 'super_admin' && !is_active) {
      return res.status(403).json({
        success: false,
        message: 'Super admin accounts cannot be deactivated'
      });
    }

    // Update status
    await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [is_active, id]
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
        adminId,
        'UPDATE_STATUS',
        'user',
        id,
        JSON.stringify({
          target_user_email: targetUser.email,
          new_status: is_active,
          changed_by: req.user.email
        })
      ]
    );

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user status'
    });
  }
};

// 9. UPDATE LAST LOGIN
// Update last_login timestamp (called by auth system)
const updateLastLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Can only update own last_login
    if (parseInt(id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Last login updated'
    });

  } catch (error) {
    console.error('Update last login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating last login'
    });
  }
};

// 10. GET USER ACTIVITY
// Get user's activity log from audit_logs
const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: requesterRole, operator_id: requesterOperatorId, userId: requesterId } = req.user;
    const { page = 1, limit = 50 } = req.query;

    // Check access: Can view own activity or if admin can view users in their operator
    const canViewActivity =
      parseInt(id) === requesterId ||
      requesterRole === 'super_admin' ||
      requesterRole === 'operator_admin';

    if (!canViewActivity) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user\'s activity'
      });
    }

    // If not super_admin, verify user belongs to same operator
    if (requesterRole !== 'super_admin' && parseInt(id) !== requesterId) {
      const userCheck = await pool.query(
        'SELECT operator_id FROM users WHERE id = $1',
        [id]
      );

      if (userCheck.rows.length === 0 || userCheck.rows[0].operator_id !== requesterOperatorId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this user\'s activity'
        });
      }
    }

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = $1',
      [id]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated activity log
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT
        id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({
      success: true,
      data: {
        activities: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user activity'
    });
  }
};

// 11. GET USERS BY ROLE
// Filter users by specific role
const getUsersByRole = async (req, res) => {
  try {
    const { role: filterRole } = req.params;
    const { role: requesterRole, operator_id: requesterOperatorId } = req.user;

    // Validate role
    const validRoles = ['super_admin', 'operator_admin', 'operations_manager', 'sales_manager', 'accountant', 'staff'];
    if (!validRoles.includes(filterRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Apply operator filter
    const filter = applyOperatorFilter(requesterRole, requesterOperatorId);
    const queryParams = [...filter.params, filterRole];
    const roleParamIndex = filter.params.length + 1;

    const query = `
      SELECT
        u.id,
        u.email,
        u.role,
        u.operator_id,
        u.is_active,
        u.full_name,
        u.phone,
        u.last_login,
        u.created_at,
        o.company_name as operator_name
      FROM users u
      LEFT JOIN operators o ON u.operator_id = o.id
      WHERE u.role = $${roleParamIndex}
        AND u.deleted_at IS NULL
        ${filter.clause}
      ORDER BY u.full_name, u.email
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users by role'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  resetPassword,
  toggleUserStatus,
  updateLastLogin,
  getUserActivity,
  getUsersByRole
};
