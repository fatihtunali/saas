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

// Middleware to check if user is operator
const requireOperator = (req, res, next) => {
  if (req.user.role !== 'operator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Operator privileges required.'
    });
  }
  next();
};

// Middleware to check if user is either super admin or operator
const requireAuthenticated = (req, res, next) => {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'operator')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireOperator,
  requireAuthenticated
};
