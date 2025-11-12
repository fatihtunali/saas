// ============================================
// USER VALIDATOR - Phase 9
// ============================================
// Validation schemas for user management
// Password policy enforcement
// Role validation
// Email validation
// ============================================

// Valid roles in the system
const VALID_ROLES = [
  'super_admin',
  'operator_admin',
  'operations_manager',
  'sales_manager',
  'accountant',
  'staff'
];

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone regex pattern (international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - {valid: boolean, error: string}
 */
const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email is too long (max 255 characters)' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * @param {string} password - Password to validate
 * @returns {object} - {valid: boolean, errors: array}
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
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

  // Optional: Special character requirement (commented out)
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {object} - {valid: boolean, error: string}
 */
const validateRole = (role) => {
  if (!role) {
    return { valid: false, error: 'Role is required' };
  }

  if (typeof role !== 'string') {
    return { valid: false, error: 'Role must be a string' };
  }

  if (!VALID_ROLES.includes(role)) {
    return {
      valid: false,
      error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {boolean} required - Whether phone is required
 * @returns {object} - {valid: boolean, error: string}
 */
const validatePhone = (phone, required = false) => {
  if (!phone) {
    if (required) {
      return { valid: false, error: 'Phone number is required' };
    }
    return { valid: true }; // Optional field
  }

  if (typeof phone !== 'string') {
    return { valid: false, error: 'Phone number must be a string' };
  }

  if (phone.length > 20) {
    return { valid: false, error: 'Phone number is too long (max 20 characters)' };
  }

  // Basic phone validation (can be more strict if needed)
  if (phone.length < 7) {
    return { valid: false, error: 'Phone number is too short' };
  }

  return { valid: true };
};

/**
 * Validate full name
 * @param {string} fullName - Full name to validate
 * @param {boolean} required - Whether full name is required
 * @returns {object} - {valid: boolean, error: string}
 */
const validateFullName = (fullName, required = false) => {
  if (!fullName) {
    if (required) {
      return { valid: false, error: 'Full name is required' };
    }
    return { valid: true }; // Optional field
  }

  if (typeof fullName !== 'string') {
    return { valid: false, error: 'Full name must be a string' };
  }

  if (fullName.length < 2) {
    return { valid: false, error: 'Full name is too short (min 2 characters)' };
  }

  if (fullName.length > 100) {
    return { valid: false, error: 'Full name is too long (max 100 characters)' };
  }

  return { valid: true };
};

/**
 * Validate user creation data
 * @param {object} data - User data to validate
 * @returns {object} - {valid: boolean, errors: object}
 */
const validateUserCreate = (data) => {
  const errors = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors;
  }

  // Validate role
  const roleValidation = validateRole(data.role);
  if (!roleValidation.valid) {
    errors.role = roleValidation.error;
  }

  // Validate full name (optional)
  if (data.full_name !== undefined) {
    const fullNameValidation = validateFullName(data.full_name, false);
    if (!fullNameValidation.valid) {
      errors.full_name = fullNameValidation.error;
    }
  }

  // Validate phone (optional)
  if (data.phone !== undefined) {
    const phoneValidation = validatePhone(data.phone, false);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }

  // Validate operator_id (if provided)
  if (data.operator_id !== undefined && data.operator_id !== null) {
    if (typeof data.operator_id !== 'number' || data.operator_id <= 0) {
      errors.operator_id = 'Operator ID must be a positive number';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user update data
 * @param {object} data - User data to validate
 * @returns {object} - {valid: boolean, errors: object}
 */
const validateUserUpdate = (data) => {
  const errors = {};

  // All fields are optional for update
  if (Object.keys(data).length === 0) {
    return { valid: false, errors: { general: 'No fields to update' } };
  }

  // Validate email (if provided)
  if (data.email !== undefined) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  // Validate role (if provided)
  if (data.role !== undefined) {
    const roleValidation = validateRole(data.role);
    if (!roleValidation.valid) {
      errors.role = roleValidation.error;
    }
  }

  // Validate full name (if provided)
  if (data.full_name !== undefined) {
    const fullNameValidation = validateFullName(data.full_name, false);
    if (!fullNameValidation.valid) {
      errors.full_name = fullNameValidation.error;
    }
  }

  // Validate phone (if provided)
  if (data.phone !== undefined) {
    const phoneValidation = validatePhone(data.phone, false);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }

  // Validate is_active (if provided)
  if (data.is_active !== undefined) {
    if (typeof data.is_active !== 'boolean') {
      errors.is_active = 'is_active must be a boolean';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password change data
 * @param {object} data - Password change data to validate
 * @returns {object} - {valid: boolean, errors: object}
 */
const validatePasswordChange = (data) => {
  const errors = {};

  // Validate current password
  if (!data.current_password) {
    errors.current_password = 'Current password is required';
  }

  // Validate new password
  const passwordValidation = validatePassword(data.new_password);
  if (!passwordValidation.valid) {
    errors.new_password = passwordValidation.errors;
  }

  // Check if new password is different from current
  if (data.current_password && data.new_password && data.current_password === data.new_password) {
    errors.new_password = ['New password must be different from current password'];
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password reset data (admin)
 * @param {object} data - Password reset data to validate
 * @returns {object} - {valid: boolean, errors: object}
 */
const validatePasswordReset = (data) => {
  const errors = {};

  // Validate new password
  const passwordValidation = validatePassword(data.new_password);
  if (!passwordValidation.valid) {
    errors.new_password = passwordValidation.errors;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate role assignment
 * Checks if assigner can assign target role
 * @param {string} assignerRole - Role of user doing the assignment
 * @param {string} targetRole - Role being assigned
 * @returns {object} - {valid: boolean, error: string}
 */
const validateRoleAssignment = (assignerRole, targetRole) => {
  // Validate both roles
  const assignerValidation = validateRole(assignerRole);
  if (!assignerValidation.valid) {
    return { valid: false, error: 'Invalid assigner role' };
  }

  const targetValidation = validateRole(targetRole);
  if (!targetValidation.valid) {
    return { valid: false, error: 'Invalid target role' };
  }

  // Role hierarchy
  const roleHierarchy = {
    'super_admin': 6,
    'operator_admin': 5,
    'operations_manager': 4,
    'sales_manager': 3,
    'accountant': 2,
    'staff': 1
  };

  const assignerLevel = roleHierarchy[assignerRole];
  const targetLevel = roleHierarchy[targetRole];

  // Super admin can assign any role
  if (assignerRole === 'super_admin') {
    return { valid: true };
  }

  // Cannot assign role higher or equal to own role
  if (targetLevel >= assignerLevel) {
    return {
      valid: false,
      error: 'You cannot assign a role equal to or higher than your own'
    };
  }

  return { valid: true };
};

/**
 * Middleware to validate user creation
 */
const validateUserCreateMiddleware = (req, res, next) => {
  const validation = validateUserCreate(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  next();
};

/**
 * Middleware to validate user update
 */
const validateUserUpdateMiddleware = (req, res, next) => {
  const validation = validateUserUpdate(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  next();
};

/**
 * Middleware to validate password change
 */
const validatePasswordChangeMiddleware = (req, res, next) => {
  const validation = validatePasswordChange(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  next();
};

/**
 * Middleware to validate password reset
 */
const validatePasswordResetMiddleware = (req, res, next) => {
  const validation = validatePasswordReset(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  next();
};

module.exports = {
  // Validation functions
  validateEmail,
  validatePassword,
  validateRole,
  validatePhone,
  validateFullName,
  validateUserCreate,
  validateUserUpdate,
  validatePasswordChange,
  validatePasswordReset,
  validateRoleAssignment,

  // Middleware
  validateUserCreateMiddleware,
  validateUserUpdateMiddleware,
  validatePasswordChangeMiddleware,
  validatePasswordResetMiddleware,

  // Constants
  VALID_ROLES,
  EMAIL_REGEX,
  PHONE_REGEX
};
