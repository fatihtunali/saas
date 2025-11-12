const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Attach user data to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        operator_id: decoded.operatorId || null
      };

      next();
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during authentication'
    });
  }
};

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is operator (kept for backward compatibility)
const requireOperator = (req, res, next) => {
  if (req.user.role !== 'operator' && req.user.role !== 'operator_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Operator privileges required.'
    });
  }
  next();
};

// Middleware to check if user is operator_admin (Phase 9)
const requireOperatorAdmin = (req, res, next) => {
  if (req.user.role !== 'operator_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Operator admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is either super admin or operator
const requireAuthenticated = (req, res, next) => {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'operator' && req.user.role !== 'operator_admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }
  next();
};

// Middleware to require specific role(s) - Phase 9
// Usage: requireRole(['super_admin', 'operator_admin'])
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient privileges.',
        required: allowedRoles
      });
    }

    next();
  };
};

// Middleware to check if user can only modify their own data - Phase 9
// Usage: checkOwnership('userId') - checks if req.params.userId === req.user.userId
const checkOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    const { userId, role } = req.user;
    const resourceUserId = parseInt(req.params[paramName]);

    // Super admin and operator admin can access any user's data in their scope
    if (role === 'super_admin' || role === 'operator_admin') {
      return next();
    }

    // Regular users can only access their own data
    if (resourceUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.'
      });
    }

    next();
  };
};

// Middleware to require admin (super_admin or operator_admin) - Phase 9
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'operator_admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to require management level (admin or manager roles) - Phase 9
const requireManagement = (req, res, next) => {
  const managementRoles = ['super_admin', 'operator_admin', 'operations_manager', 'sales_manager'];

  if (!req.user || !managementRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Management privileges required.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireOperator,
  requireOperatorAdmin,
  requireAuthenticated,
  requireRole,
  checkOwnership,
  requireAdmin,
  requireManagement
};
