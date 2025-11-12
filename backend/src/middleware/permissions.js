// ============================================
// PERMISSIONS MIDDLEWARE - Phase 9
// ============================================
// Granular permission system (module + action level)
// Permission matrix for all roles
// Multi-tenant security enforcement
// ============================================

// PERMISSION MATRIX
// Defines what each role can do in each module
const PERMISSIONS_MATRIX = {
  super_admin: {
    dashboard: ['view', 'create', 'edit', 'delete', 'export'],
    bookings: ['view', 'create', 'edit', 'delete', 'export'],
    services: ['view', 'create', 'edit', 'delete', 'export'],
    clients: ['view', 'create', 'edit', 'delete', 'export'],
    payments: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'create', 'edit', 'delete', 'export'],
    operations: ['view', 'create', 'edit', 'delete', 'export'],
    users: ['view', 'create', 'edit', 'delete', 'export'],
    settings: ['view', 'create', 'edit', 'delete', 'export']
  },
  operator_admin: {
    dashboard: ['view', 'create', 'edit', 'delete', 'export'],
    bookings: ['view', 'create', 'edit', 'delete', 'export'],
    services: ['view', 'create', 'edit', 'delete', 'export'],
    clients: ['view', 'create', 'edit', 'delete', 'export'],
    payments: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'create', 'edit', 'delete', 'export'],
    operations: ['view', 'create', 'edit', 'delete', 'export'],
    users: ['view', 'create', 'edit', 'delete', 'export'],
    settings: ['view', 'create', 'edit', 'delete', 'export']
  },
  operations_manager: {
    dashboard: ['view', 'create', 'export'],
    bookings: ['view', 'create', 'edit', 'delete', 'export'],
    services: ['view', 'create', 'edit', 'delete', 'export'],
    clients: ['view'],
    payments: ['view'],
    reports: ['view', 'export'],
    operations: ['view', 'create', 'edit', 'delete', 'export'],
    users: [],
    settings: []
  },
  sales_manager: {
    dashboard: ['view', 'create', 'export'],
    bookings: ['view', 'create', 'edit', 'export'],
    services: ['view'],
    clients: ['view', 'create', 'edit', 'delete', 'export'],
    payments: ['view'],
    reports: ['view', 'export'],
    operations: ['view'],
    users: [],
    settings: []
  },
  accountant: {
    dashboard: ['view', 'create', 'export'],
    bookings: ['view'],
    services: ['view'],
    clients: ['view'],
    payments: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'export'],
    operations: [],
    users: [],
    settings: []
  },
  staff: {
    dashboard: ['view'],
    bookings: ['view'],
    services: ['view'],
    clients: ['view'],
    payments: [],
    reports: [],
    operations: [],
    users: [],
    settings: []
  }
};

// Valid modules
const VALID_MODULES = [
  'dashboard',
  'bookings',
  'services',
  'clients',
  'payments',
  'reports',
  'operations',
  'users',
  'settings'
];

// Valid actions
const VALID_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'export'
];

// ============================================
// CORE PERMISSION FUNCTIONS
// ============================================

/**
 * Check if a user has a specific permission
 * @param {string} role - User's role
 * @param {string} module - Module name (e.g., 'bookings')
 * @param {string} action - Action name (e.g., 'create')
 * @returns {boolean} - Whether user has permission
 */
const hasPermission = (role, module, action) => {
  // Validate inputs
  if (!role || !module || !action) {
    return false;
  }

  // Check if role exists in matrix
  if (!PERMISSIONS_MATRIX[role]) {
    return false;
  }

  // Check if module exists for role
  if (!PERMISSIONS_MATRIX[role][module]) {
    return false;
  }

  // Check if action is allowed for role+module
  return PERMISSIONS_MATRIX[role][module].includes(action);
};

/**
 * Check if user can view module
 * @param {string} role - User's role
 * @param {string} module - Module name
 * @returns {boolean}
 */
const canViewModule = (role, module) => {
  return hasPermission(role, module, 'view');
};

/**
 * Check if user can create in module
 * @param {string} role - User's role
 * @param {string} module - Module name
 * @returns {boolean}
 */
const canCreateInModule = (role, module) => {
  return hasPermission(role, module, 'create');
};

/**
 * Check if user can edit in module
 * @param {string} role - User's role
 * @param {string} module - Module name
 * @returns {boolean}
 */
const canEditInModule = (role, module) => {
  return hasPermission(role, module, 'edit');
};

/**
 * Check if user can delete in module
 * @param {string} role - User's role
 * @param {string} module - Module name
 * @returns {boolean}
 */
const canDeleteInModule = (role, module) => {
  return hasPermission(role, module, 'delete');
};

/**
 * Check if user can export from module
 * @param {string} role - User's role
 * @param {string} module - Module name
 * @returns {boolean}
 */
const canExportFromModule = (role, module) => {
  return hasPermission(role, module, 'export');
};

/**
 * Get all permissions for a role
 * @param {string} role - User's role
 * @returns {object} - All permissions for role
 */
const getRolePermissions = (role) => {
  return PERMISSIONS_MATRIX[role] || {};
};

/**
 * Get all modules a user has access to
 * @param {string} role - User's role
 * @returns {array} - Array of module names
 */
const getAccessibleModules = (role) => {
  const permissions = PERMISSIONS_MATRIX[role];
  if (!permissions) {
    return [];
  }

  return Object.keys(permissions).filter(module =>
    permissions[module].length > 0
  );
};

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Middleware to require specific permission
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {function} - Express middleware
 */
const requirePermission = (module, action) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role, email } = req.user;

      // Check permission
      if (!hasPermission(role, module, action)) {
        // Log failed permission check
        const pool = require('../config/database');
        pool.query(
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
            'PERMISSION_DENIED',
            'permission',
            null,
            JSON.stringify({
              user_email: email,
              user_role: role,
              required_module: module,
              required_action: action,
              ip_address: req.ip
            })
          ]
        ).catch(err => console.error('Audit log error:', err));

        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} in ${module}`,
          required: {
            module,
            action
          }
        });
      }

      // Permission granted
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user can view module
 * @param {string} module - Module name
 * @returns {function} - Express middleware
 */
const requireViewAccess = (module) => {
  return requirePermission(module, 'view');
};

/**
 * Middleware to check if user can create in module
 * @param {string} module - Module name
 * @returns {function} - Express middleware
 */
const requireCreateAccess = (module) => {
  return requirePermission(module, 'create');
};

/**
 * Middleware to check if user can edit in module
 * @param {string} module - Module name
 * @returns {function} - Express middleware
 */
const requireEditAccess = (module) => {
  return requirePermission(module, 'edit');
};

/**
 * Middleware to check if user can delete in module
 * @param {string} module - Module name
 * @returns {function} - Express middleware
 */
const requireDeleteAccess = (module) => {
  return requirePermission(module, 'delete');
};

/**
 * Middleware to check if user can export from module
 * @param {string} module - Module name
 * @returns {function} - Express middleware
 */
const requireExportAccess = (module) => {
  return requirePermission(module, 'export');
};

/**
 * Middleware to require multiple permissions (OR logic)
 * User needs at least one of the specified permissions
 * @param {array} permissions - Array of {module, action} objects
 * @returns {function} - Express middleware
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role } = req.user;

      // Check if user has any of the specified permissions
      const hasAnyPermission = permissions.some(perm =>
        hasPermission(role, perm.module, perm.action)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: {
            anyOf: permissions
          }
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while checking permissions'
      });
    }
  };
};

/**
 * Middleware to require multiple permissions (AND logic)
 * User needs all of the specified permissions
 * @param {array} permissions - Array of {module, action} objects
 * @returns {function} - Express middleware
 */
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role } = req.user;

      // Check if user has all of the specified permissions
      const missingPermissions = permissions.filter(perm =>
        !hasPermission(role, perm.module, perm.action)
      );

      if (missingPermissions.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: {
            allOf: permissions
          },
          missing: missingPermissions
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while checking permissions'
      });
    }
  };
};

/**
 * Get permissions summary endpoint handler
 * Returns all permissions for current user
 */
const getMyPermissions = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { role } = req.user;
    const permissions = getRolePermissions(role);
    const accessibleModules = getAccessibleModules(role);

    res.json({
      success: true,
      data: {
        role,
        permissions,
        accessibleModules,
        summary: {
          totalModules: accessibleModules.length,
          canManageUsers: hasPermission(role, 'users', 'view'),
          canAccessSettings: hasPermission(role, 'settings', 'view'),
          isAdmin: role === 'super_admin' || role === 'operator_admin'
        }
      }
    });

  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching permissions'
    });
  }
};

module.exports = {
  // Core functions
  hasPermission,
  canViewModule,
  canCreateInModule,
  canEditInModule,
  canDeleteInModule,
  canExportFromModule,
  getRolePermissions,
  getAccessibleModules,

  // Middleware
  requirePermission,
  requireViewAccess,
  requireCreateAccess,
  requireEditAccess,
  requireDeleteAccess,
  requireExportAccess,
  requireAnyPermission,
  requireAllPermissions,

  // Endpoint handler
  getMyPermissions,

  // Constants (for reference)
  PERMISSIONS_MATRIX,
  VALID_MODULES,
  VALID_ACTIONS
};
