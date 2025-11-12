const pool = require('../config/database');

// ============================================
// ACTIVITY LOGGER MIDDLEWARE - Phase 9
// ============================================
// Comprehensive audit logging system
// Logs all sensitive operations to audit_logs table
// Tracks user actions, entity changes, and system events
// ============================================

/**
 * Core function to log activity to audit_logs table
 * @param {number} userId - User ID performing the action
 * @param {string} action - Action type (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')
 * @param {string} entityType - Type of entity (e.g., 'user', 'booking', 'payment')
 * @param {number|null} entityId - ID of the entity affected
 * @param {object} details - Additional details (will be stored as JSON)
 * @returns {Promise} - Database query result
 */
const logActivity = async (userId, action, entityType, entityId = null, details = {}) => {
  try {
    const query = `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const result = await pool.query(query, [
      userId,
      action,
      entityType,
      entityId,
      JSON.stringify(details)
    ]);

    return result.rows[0];

  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('Activity logging error:', error);
    console.error('Failed to log:', { userId, action, entityType, entityId, details });
    return null;
  }
};

/**
 * Middleware to automatically log requests
 * Use this on sensitive routes to automatically track access
 * @param {string} action - Action being performed
 * @param {string} entityType - Type of entity
 * @param {object} options - Additional options
 * @returns {function} - Express middleware
 */
const logRequest = (action, entityType, options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip if no user (shouldn't happen on protected routes)
      if (!req.user || !req.user.userId) {
        return next();
      }

      // Extract entity ID from params if available
      const entityId = options.entityIdParam
        ? req.params[options.entityIdParam]
        : null;

      // Build details object
      const details = {
        method: req.method,
        path: req.path,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        ...(options.includeBody && req.body ? { body: req.body } : {}),
        ...(options.includeQuery && req.query ? { query: req.query } : {}),
        ...(options.customDetails || {})
      };

      // Log the activity
      await logActivity(
        req.user.userId,
        action,
        entityType,
        entityId,
        details
      );

      next();

    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Request logging middleware error:', error);
      next();
    }
  };
};

/**
 * Log user login
 * @param {number} userId - User ID
 * @param {object} req - Express request object
 * @returns {Promise}
 */
const logLogin = async (userId, req) => {
  return await logActivity(
    userId,
    'LOGIN',
    'auth',
    userId,
    {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log user logout
 * @param {number} userId - User ID
 * @param {object} req - Express request object
 * @returns {Promise}
 */
const logLogout = async (userId, req) => {
  return await logActivity(
    userId,
    'LOGOUT',
    'auth',
    userId,
    {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log failed login attempt
 * @param {string} email - Email that was attempted
 * @param {object} req - Express request object
 * @param {string} reason - Reason for failure
 * @returns {Promise}
 */
const logFailedLogin = async (email, req, reason = 'Invalid credentials') => {
  return await logActivity(
    null, // No user ID for failed login
    'LOGIN_FAILED',
    'auth',
    null,
    {
      email,
      reason,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log password change
 * @param {number} userId - User ID
 * @param {boolean} changedBySelf - Whether user changed their own password
 * @param {number} changedById - ID of user who made the change (if different)
 * @returns {Promise}
 */
const logPasswordChange = async (userId, changedBySelf = true, changedById = null) => {
  return await logActivity(
    changedById || userId,
    changedBySelf ? 'CHANGE_PASSWORD' : 'RESET_PASSWORD',
    'user',
    userId,
    {
      changed_by_self: changedBySelf,
      changed_by_user_id: changedById,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log role change
 * @param {number} userId - User ID whose role changed
 * @param {string} oldRole - Previous role
 * @param {string} newRole - New role
 * @param {number} changedById - ID of user who made the change
 * @returns {Promise}
 */
const logRoleChange = async (userId, oldRole, newRole, changedById) => {
  return await logActivity(
    changedById,
    'CHANGE_ROLE',
    'user',
    userId,
    {
      old_role: oldRole,
      new_role: newRole,
      changed_by_user_id: changedById,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log user creation
 * @param {number} newUserId - ID of newly created user
 * @param {object} userData - Data of new user (without password)
 * @param {number} createdById - ID of user who created the new user
 * @returns {Promise}
 */
const logUserCreation = async (newUserId, userData, createdById) => {
  return await logActivity(
    createdById,
    'CREATE',
    'user',
    newUserId,
    {
      created_user_data: userData,
      created_by_user_id: createdById,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log user deletion
 * @param {number} deletedUserId - ID of deleted user
 * @param {object} userData - Data of deleted user
 * @param {number} deletedById - ID of user who performed deletion
 * @returns {Promise}
 */
const logUserDeletion = async (deletedUserId, userData, deletedById) => {
  return await logActivity(
    deletedById,
    'DELETE',
    'user',
    deletedUserId,
    {
      deleted_user_data: userData,
      deleted_by_user_id: deletedById,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log data export
 * @param {number} userId - User ID who exported data
 * @param {string} exportType - Type of export (e.g., 'bookings', 'payments')
 * @param {object} filters - Filters applied to export
 * @returns {Promise}
 */
const logDataExport = async (userId, exportType, filters = {}) => {
  return await logActivity(
    userId,
    'EXPORT',
    exportType,
    null,
    {
      export_type: exportType,
      filters,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log sensitive data access
 * @param {number} userId - User ID who accessed data
 * @param {string} entityType - Type of sensitive data
 * @param {number} entityId - ID of accessed entity
 * @param {string} accessReason - Reason for access (optional)
 * @returns {Promise}
 */
const logSensitiveAccess = async (userId, entityType, entityId, accessReason = null) => {
  return await logActivity(
    userId,
    'ACCESS_SENSITIVE',
    entityType,
    entityId,
    {
      access_reason: accessReason,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log permission denied events
 * @param {number} userId - User ID who was denied
 * @param {string} module - Module they tried to access
 * @param {string} action - Action they tried to perform
 * @param {object} req - Express request object
 * @returns {Promise}
 */
const logPermissionDenied = async (userId, module, action, req) => {
  return await logActivity(
    userId,
    'PERMISSION_DENIED',
    'permission',
    null,
    {
      module,
      action,
      path: req.path,
      method: req.method,
      ip_address: req.ip,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Log system configuration changes
 * @param {number} userId - User ID who made change
 * @param {string} configType - Type of configuration changed
 * @param {object} oldValue - Previous value
 * @param {object} newValue - New value
 * @returns {Promise}
 */
const logConfigChange = async (userId, configType, oldValue, newValue) => {
  return await logActivity(
    userId,
    'CONFIG_CHANGE',
    'system',
    null,
    {
      config_type: configType,
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date().toISOString()
    }
  );
};

/**
 * Middleware to log successful responses
 * Attaches to res.json to capture when response is sent
 */
const logSuccessResponse = (action, entityType) => {
  return (req, res, next) => {
    // Store original json function
    const originalJson = res.json;

    // Override json function
    res.json = function(data) {
      // Only log successful responses
      if (data && data.success && req.user && req.user.userId) {
        const entityId = req.params.id || (data.data && data.data.id) || null;

        logActivity(
          req.user.userId,
          action,
          entityType,
          entityId,
          {
            method: req.method,
            path: req.path,
            status: 'success'
          }
        ).catch(err => console.error('Success response logging error:', err));
      }

      // Call original json function
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Get activity logs for a user (with pagination)
 * @param {number} userId - User ID to get logs for
 * @param {object} options - Pagination and filter options
 * @returns {Promise} - Activity logs
 */
const getUserActivityLogs = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 50,
    action = null,
    entityType = null,
    dateFrom = null,
    dateTo = null
  } = options;

  try {
    // Build WHERE clause
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      conditions.push(`entity_type = $${paramIndex}`);
      params.push(entityType);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const query = `
      SELECT
        id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM audit_logs
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, params);

    return {
      logs: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Get user activity logs error:', error);
    throw error;
  }
};

/**
 * Get recent activity across system (admin only)
 * @param {object} options - Pagination and filter options
 * @returns {Promise} - Recent activity logs
 */
const getSystemActivityLogs = async (options = {}) => {
  const {
    page = 1,
    limit = 100,
    action = null,
    entityType = null,
    dateFrom = null,
    dateTo = null
  } = options;

  try {
    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      conditions.push(`entity_type = $${paramIndex}`);
      params.push(entityType);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const query = `
      SELECT
        al.id,
        al.user_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.created_at,
        u.email as user_email,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, params);

    return {
      logs: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Get system activity logs error:', error);
    throw error;
  }
};

module.exports = {
  // Core function
  logActivity,

  // Middleware
  logRequest,
  logSuccessResponse,

  // Specific logging functions
  logLogin,
  logLogout,
  logFailedLogin,
  logPasswordChange,
  logRoleChange,
  logUserCreation,
  logUserDeletion,
  logDataExport,
  logSensitiveAccess,
  logPermissionDenied,
  logConfigChange,

  // Query functions
  getUserActivityLogs,
  getSystemActivityLogs
};
