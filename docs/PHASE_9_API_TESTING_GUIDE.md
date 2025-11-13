# PHASE 9: API TESTING GUIDE - User Management & Permissions

**Version**: 1.0
**Date**: 2025-11-12
**Base URL**: `http://localhost:5000`

---

## TABLE OF CONTENTS

1. [Setup Instructions](#setup-instructions)
2. [Authentication](#authentication)
3. [User Management Endpoints](#user-management-endpoints)
4. [Profile & Password Endpoints](#profile--password-endpoints)
5. [Permission Endpoints](#permission-endpoints)
6. [Test Scenarios by Role](#test-scenarios-by-role)
7. [Error Testing](#error-testing)
8. [Security Testing](#security-testing)

---

## SETUP INSTRUCTIONS

### 1. Start Backend Server
```bash
cd C:\Users\fatih\Desktop\CRM\backend
npm start
```

Server should start on `http://localhost:5000`

### 2. Postman Setup
- Create new collection: "Phase 9 - User Management"
- Set base URL variable: `{{baseUrl}}` = `http://localhost:5000`
- Create environment variables:
  - `superAdminToken` - Token for super_admin
  - `operatorToken` - Token for operator_admin
  - `managerToken` - Token for operations_manager
  - `staffToken` - Token for staff

### 3. Test Data Setup
You'll need at least one super_admin user in the database:
```sql
-- Insert super_admin (password: Admin123456)
INSERT INTO users (email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'admin@system.com',
  '$2b$10$YourHashedPasswordHere',
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

---

## AUTHENTICATION

### 1. Login (Super Admin)
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@system.com",
  "password": "Admin123456"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@system.com",
      "role": "super_admin",
      "operator_id": null,
      "company_name": null,
      "phone": null
    }
  }
}
```

**Save Token**: Copy the token and save to Postman environment as `superAdminToken`

### 2. Register (New Operator)
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "operator@testcompany.com",
  "password": "Operator123",
  "company_name": "Test Tour Company",
  "contact_phone": "+1234567890",
  "address": "123 Main Street, City"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "operator@testcompany.com",
      "role": "operator_admin",
      "operator_id": 1,
      "company_name": "Test Tour Company",
      "phone": "+1234567890"
    }
  }
}
```

**Note**: Role is automatically set to `operator_admin`

### 3. Get Current User
**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@system.com",
      "role": "super_admin",
      "operator_id": null,
      "company_name": null,
      "phone": null,
      "created_at": "2025-11-12T10:00:00.000Z"
    }
  }
}
```

---

## USER MANAGEMENT ENDPOINTS

### 1. Get All Users (List)
**Endpoint**: `GET /api/users`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Query Parameters** (optional):
```
?page=1&limit=50&search=john&role=staff&is_active=true
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@system.com",
        "role": "super_admin",
        "operator_id": null,
        "is_active": true,
        "full_name": "System Administrator",
        "phone": null,
        "last_login": "2025-11-12T10:00:00.000Z",
        "created_at": "2025-11-01T00:00:00.000Z",
        "updated_at": "2025-11-12T10:00:00.000Z",
        "operator_name": null
      },
      {
        "id": 2,
        "email": "operator@testcompany.com",
        "role": "operator_admin",
        "operator_id": 1,
        "is_active": true,
        "full_name": "John Operator",
        "phone": "+1234567890",
        "last_login": "2025-11-12T09:30:00.000Z",
        "created_at": "2025-11-10T00:00:00.000Z",
        "updated_at": "2025-11-12T09:30:00.000Z",
        "operator_name": "Test Tour Company"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

**Multi-Tenant Behavior**:
- Super Admin sees ALL users
- Operator Admin sees only their operator's users

### 2. Get User by ID
**Endpoint**: `GET /api/users/:id`

**Example**: `GET /api/users/2`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "operator@testcompany.com",
      "role": "operator_admin",
      "operator_id": 1,
      "is_active": true,
      "full_name": "John Operator",
      "phone": "+1234567890",
      "last_login": "2025-11-12T09:30:00.000Z",
      "created_at": "2025-11-10T00:00:00.000Z",
      "updated_at": "2025-11-12T09:30:00.000Z",
      "operator_name": "Test Tour Company",
      "operator_email": "operator@testcompany.com",
      "operator_phone": "+1234567890"
    }
  }
}
```

**Error Cases**:
- 404 if user not found
- 404 if user belongs to different operator (multi-tenant security)
- 403 if no permission to view users

### 3. Create User
**Endpoint**: `POST /api/users`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Request Body**:
```json
{
  "email": "manager@testcompany.com",
  "password": "Manager123",
  "role": "operations_manager",
  "full_name": "Sarah Manager",
  "phone": "+1234567890",
  "operator_id": 1
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 3,
      "email": "manager@testcompany.com",
      "role": "operations_manager",
      "operator_id": 1,
      "full_name": "Sarah Manager",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2025-11-12T10:15:00.000Z"
    }
  }
}
```

**Validation Rules**:
- Email must be unique
- Password must meet requirements (8 chars, upper, lower, number)
- Role must be valid
- Operator ID required for non-super-admin users
- Cannot assign role >= own role

**Error Cases**:
- 400 if validation fails
- 403 if cannot assign this role
- 409 if email already exists

### 4. Update User
**Endpoint**: `PUT /api/users/:id`

**Example**: `PUT /api/users/3`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Request Body**:
```json
{
  "full_name": "Sarah Updated Manager",
  "phone": "+9876543210",
  "is_active": true
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 3,
      "email": "manager@testcompany.com",
      "role": "operations_manager",
      "operator_id": 1,
      "full_name": "Sarah Updated Manager",
      "phone": "+9876543210",
      "is_active": true,
      "updated_at": "2025-11-12T10:20:00.000Z"
    }
  }
}
```

**Security Rules**:
- Cannot update own role
- Cannot update user from different operator
- Cannot change email to existing email

### 5. Delete User (Soft Delete)
**Endpoint**: `DELETE /api/users/:id`

**Example**: `DELETE /api/users/3`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Security Rules**:
- Cannot delete super_admin accounts
- Cannot delete own account
- Cannot delete users from different operator
- Sets deleted_at timestamp (soft delete)

**Error Cases**:
- 403 if trying to delete super_admin
- 403 if trying to delete own account
- 404 if user not found

### 6. Update Password (Self)
**Endpoint**: `PUT /api/users/:id/password`

**Example**: `PUT /api/users/3/password`

**Headers**:
```
Authorization: Bearer {{managerToken}}
```

**Request Body**:
```json
{
  "current_password": "Manager123",
  "new_password": "NewManager456"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Validation**:
- Current password must be correct
- New password must meet requirements
- New password must be different from current
- Can only change own password

**Error Cases**:
- 401 if current password incorrect
- 400 if new password doesn't meet requirements
- 403 if trying to change someone else's password

### 7. Reset Password (Admin)
**Endpoint**: `POST /api/users/:id/reset-password`

**Example**: `POST /api/users/3/reset-password`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Request Body**:
```json
{
  "new_password": "ResetPass123"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Security Rules**:
- Only admin can reset passwords
- New password must meet requirements
- Activity logged to audit_logs

### 8. Toggle User Status
**Endpoint**: `PUT /api/users/:id/status`

**Example**: `PUT /api/users/3/status`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Request Body**:
```json
{
  "is_active": false
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Security Rules**:
- Cannot deactivate super_admin
- Cannot change own status
- Only admin can change status

### 9. Update Last Login
**Endpoint**: `PUT /api/users/:id/last-login`

**Example**: `PUT /api/users/3/last-login`

**Headers**:
```
Authorization: Bearer {{managerToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Last login updated"
}
```

**Note**: Can only update own last_login

### 10. Get User Activity
**Endpoint**: `GET /api/users/:id/activity`

**Example**: `GET /api/users/3/activity?page=1&limit=50`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 123,
        "action": "UPDATE_PROFILE",
        "entity_type": "user",
        "entity_id": 3,
        "details": {
          "updated_fields": ["full_name", "phone"],
          "user_email": "manager@testcompany.com"
        },
        "created_at": "2025-11-12T10:20:00.000Z"
      },
      {
        "id": 122,
        "action": "LOGIN",
        "entity_type": "auth",
        "entity_id": 3,
        "details": {
          "ip_address": "127.0.0.1",
          "user_agent": "PostmanRuntime/7.32.3"
        },
        "created_at": "2025-11-12T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

**Access Rules**:
- Users can view own activity
- Admins can view any user's activity in their scope

### 11. Get Users by Role
**Endpoint**: `GET /api/users/by-role/:role`

**Example**: `GET /api/users/by-role/staff`

**Headers**:
```
Authorization: Bearer {{superAdminToken}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "email": "staff1@testcompany.com",
        "role": "staff",
        "operator_id": 1,
        "is_active": true,
        "full_name": "Tom Staff",
        "phone": "+1234567890",
        "last_login": "2025-11-12T08:00:00.000Z",
        "created_at": "2025-11-05T00:00:00.000Z",
        "operator_name": "Test Tour Company"
      }
    ],
    "total": 1
  }
}
```

**Valid Roles**:
- super_admin
- operator_admin
- operations_manager
- sales_manager
- accountant
- staff

---

## PROFILE & PASSWORD ENDPOINTS

### 1. Get Profile
**Endpoint**: `GET /api/profile`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "email": "manager@testcompany.com",
      "role": "operations_manager",
      "operator_id": 1,
      "is_active": true,
      "full_name": "Sarah Manager",
      "phone": "+1234567890",
      "last_login": "2025-11-12T10:00:00.000Z",
      "created_at": "2025-11-10T00:00:00.000Z",
      "operator_name": "Test Tour Company",
      "operator_email": "operator@testcompany.com",
      "operator_phone": "+1234567890"
    }
  }
}
```

### 2. Update Profile
**Endpoint**: `PUT /api/profile`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Request Body**:
```json
{
  "full_name": "Sarah Updated",
  "phone": "+9876543210"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 3,
      "email": "manager@testcompany.com",
      "role": "operations_manager",
      "full_name": "Sarah Updated",
      "phone": "+9876543210",
      "updated_at": "2025-11-12T10:25:00.000Z"
    }
  }
}
```

**Note**: Cannot change email or role via profile endpoint

### 3. Change Password
**Endpoint**: `PUT /api/profile/password`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Request Body**:
```json
{
  "current_password": "Manager123",
  "new_password": "NewSecure456"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

## PERMISSION ENDPOINTS

### Get My Permissions
**Endpoint**: `GET /api/permissions/me`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "role": "operations_manager",
    "permissions": {
      "dashboard": ["view", "create", "export"],
      "bookings": ["view", "create", "edit", "delete", "export"],
      "services": ["view", "create", "edit", "delete", "export"],
      "clients": ["view"],
      "payments": ["view"],
      "reports": ["view", "export"],
      "operations": ["view", "create", "edit", "delete", "export"],
      "users": [],
      "settings": []
    },
    "accessibleModules": [
      "dashboard",
      "bookings",
      "services",
      "clients",
      "payments",
      "reports",
      "operations"
    ],
    "summary": {
      "totalModules": 7,
      "canManageUsers": false,
      "canAccessSettings": false,
      "isAdmin": false
    }
  }
}
```

**Different Role Responses**:

**Super Admin**:
- All modules, all actions
- canManageUsers: true
- isAdmin: true

**Operator Admin**:
- All modules except platform settings
- canManageUsers: true
- isAdmin: true

**Sales Manager**:
- Clients (full), bookings (VCE), reports (view/export)
- canManageUsers: false
- isAdmin: false

**Accountant**:
- Payments (full), reports (view/export)
- View-only: bookings, clients
- canManageUsers: false

**Staff**:
- View-only: dashboard, bookings, services, clients
- No access: payments, reports, operations, users

---

## TEST SCENARIOS BY ROLE

### Super Admin Tests
```bash
# Login
POST /api/auth/login
Body: {"email": "admin@system.com", "password": "Admin123456"}

# List all users (should see all operators)
GET /api/users

# Create user in any operator
POST /api/users
Body: {
  "email": "newuser@company.com",
  "password": "Password123",
  "role": "staff",
  "operator_id": 1
}

# Update any user
PUT /api/users/3
Body: {"full_name": "Updated Name"}

# Reset any user's password
POST /api/users/3/reset-password
Body: {"new_password": "NewPass123"}

# View any user's activity
GET /api/users/3/activity

# Check permissions
GET /api/permissions/me
# Should show all modules, all actions
```

### Operator Admin Tests
```bash
# Login as operator
POST /api/auth/login
Body: {"email": "operator@testcompany.com", "password": "Operator123"}

# List users (should only see own operator's users)
GET /api/users

# Create user in own operator
POST /api/users
Body: {
  "email": "staff@testcompany.com",
  "password": "Staff123",
  "role": "staff"
}
# operator_id automatically set to own operator

# Try to update user from another operator (should fail)
PUT /api/users/10
Body: {"full_name": "Test"}
# Should return 404 (user not found)

# Check permissions
GET /api/permissions/me
# Should show all modules except platform settings
```

### Operations Manager Tests
```bash
# Login
POST /api/auth/login
Body: {"email": "manager@testcompany.com", "password": "Manager123"}

# Try to list users (should fail - no permission)
GET /api/users
# Should return 403 Forbidden

# Try to create user (should fail)
POST /api/users
# Should return 403 Forbidden

# Update own profile (should work)
PUT /api/profile
Body: {"full_name": "Updated Manager"}

# Change own password (should work)
PUT /api/profile/password
Body: {
  "current_password": "Manager123",
  "new_password": "NewManager456"
}

# Check permissions
GET /api/permissions/me
# Should show: bookings, services, operations (full)
# Reports (view/export), clients/payments (view only)
# No access to users module
```

### Staff Tests
```bash
# Login
POST /api/auth/login
Body: {"email": "staff@testcompany.com", "password": "Staff123"}

# Try to list users (should fail)
GET /api/users
# Should return 403 Forbidden

# Try to create anything (should fail)
POST /api/users
# Should return 403 Forbidden

# View own profile (should work)
GET /api/profile

# Update own profile (should work)
PUT /api/profile
Body: {"phone": "+1111111111"}

# Check permissions
GET /api/permissions/me
# Should show: view-only access to dashboard, bookings, services, clients
# No access to payments, reports, operations, users, settings
```

---

## ERROR TESTING

### 1. Invalid Credentials
```bash
POST /api/auth/login
Body: {"email": "wrong@email.com", "password": "wrong"}

Expected: 401 Unauthorized
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2. Weak Password
```bash
POST /api/users
Body: {
  "email": "test@test.com",
  "password": "weak",
  "role": "staff"
}

Expected: 400 Bad Request
{
  "success": false,
  "message": "Password does not meet requirements",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

### 3. Duplicate Email
```bash
POST /api/users
Body: {
  "email": "existing@test.com",
  "password": "Password123",
  "role": "staff"
}

Expected: 409 Conflict
{
  "success": false,
  "message": "Email already registered"
}
```

### 4. Invalid Role
```bash
POST /api/users
Body: {
  "email": "test@test.com",
  "password": "Password123",
  "role": "invalid_role"
}

Expected: 400 Bad Request
{
  "success": false,
  "message": "Invalid role specified"
}
```

### 5. Permission Denied
```bash
# Staff trying to create user
GET /api/users
Headers: Authorization: Bearer {staffToken}

Expected: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to view in users",
  "required": {
    "module": "users",
    "action": "view"
  }
}
```

### 6. User Not Found
```bash
GET /api/users/9999

Expected: 404 Not Found
{
  "success": false,
  "message": "User not found"
}
```

### 7. Cannot Delete Super Admin
```bash
DELETE /api/users/1
# Assuming user 1 is super_admin

Expected: 403 Forbidden
{
  "success": false,
  "message": "Super admin accounts cannot be deleted"
}
```

### 8. Cannot Change Own Role
```bash
PUT /api/users/3
Headers: Authorization: Bearer {managerToken}
# User 3 is the manager
Body: {"role": "operator_admin"}

Expected: 403 Forbidden
{
  "success": false,
  "message": "You cannot change your own role"
}
```

---

## SECURITY TESTING

### 1. Test JWT Expiry
```bash
# Login and get token
POST /api/auth/login

# Wait 8+ hours (or manually set token expiry to 1 minute for testing)

# Try to use expired token
GET /api/users
Headers: Authorization: Bearer {expiredToken}

Expected: 403 Forbidden
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 2. Test Multi-Tenant Isolation
```bash
# Login as operator1
POST /api/auth/login
Body: {"email": "operator1@company1.com", "password": "Pass123"}

# Get operator1's users
GET /api/users
# Note: Should only see operator1's users

# Login as operator2
POST /api/auth/login
Body: {"email": "operator2@company2.com", "password": "Pass123"}

# Try to access operator1's user
GET /api/users/{operator1_user_id}

Expected: 404 Not Found
# User not accessible due to multi-tenant security
```

### 3. Test Role Hierarchy
```bash
# Login as operations_manager
POST /api/auth/login

# Try to create operator_admin (higher role)
POST /api/users
Body: {
  "email": "admin@test.com",
  "password": "Password123",
  "role": "operator_admin"
}

Expected: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to assign this role"
}
```

### 4. Test Self-Deletion Prevention
```bash
# Login as manager
POST /api/auth/login
# User ID: 3

# Try to delete own account
DELETE /api/users/3

Expected: 403 Forbidden
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

### 5. Test Activity Logging
```bash
# Perform various actions
POST /api/users
PUT /api/users/3
DELETE /api/users/4

# Check audit logs in database
SELECT * FROM audit_logs
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 10;

# Should see:
# - CREATE action for user creation
# - UPDATE action for user update
# - DELETE action for user deletion
# - LOGIN action on login
# - CHANGE_PASSWORD on password change
```

### 6. Test Failed Login Tracking
```bash
# Try wrong password multiple times
POST /api/auth/login
Body: {"email": "test@test.com", "password": "wrong"}

# Check audit logs
SELECT * FROM audit_logs
WHERE action = 'LOGIN_FAILED'
ORDER BY created_at DESC;

# Should see failed login attempts logged
```

---

## POSTMAN COLLECTION EXPORT

### Collection Structure:
```
Phase 9 - User Management
├── Auth
│   ├── Login (Super Admin)
│   ├── Login (Operator)
│   ├── Login (Manager)
│   ├── Register (New Operator)
│   └── Get Current User
├── User Management
│   ├── List Users
│   ├── Get User by ID
│   ├── Create User
│   ├── Update User
│   ├── Delete User
│   ├── Update Password (Self)
│   ├── Reset Password (Admin)
│   ├── Toggle Status
│   ├── Update Last Login
│   ├── Get User Activity
│   └── Get Users by Role
├── Profile
│   ├── Get Profile
│   ├── Update Profile
│   └── Change Password
├── Permissions
│   └── Get My Permissions
└── Error Tests
    ├── Invalid Login
    ├── Weak Password
    ├── Duplicate Email
    ├── Permission Denied
    └── Multi-Tenant Test
```

---

## SUCCESS CRITERIA CHECKLIST

### Functional Tests:
- [ ] All 18 endpoints return expected responses
- [ ] Pagination works correctly
- [ ] Search and filtering work
- [ ] Multi-tenant filtering works
- [ ] Activity logging works

### Security Tests:
- [ ] JWT authentication required on protected routes
- [ ] Permission checks work correctly
- [ ] Role hierarchy enforced
- [ ] Cannot delete super_admin
- [ ] Cannot delete own account
- [ ] Cannot change own role
- [ ] Multi-tenant isolation works
- [ ] Password strength enforced

### Error Handling:
- [ ] Invalid credentials return 401
- [ ] Missing permissions return 403
- [ ] Not found returns 404
- [ ] Duplicate email returns 409
- [ ] Validation errors return 400
- [ ] Proper error messages returned

### Performance:
- [ ] List endpoints respond < 1 second
- [ ] Create/update respond < 500ms
- [ ] Large result sets paginate correctly

---

## TROUBLESHOOTING

### Server Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check backend logs
cd C:\Users\fatih\Desktop\CRM\backend
npm start
```

### Database Connection Error
```bash
# Check .env file
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

# Test database connection
psql -U user -d crm_db -c "SELECT 1;"
```

### Token Invalid Error
```bash
# Check JWT_SECRET in .env
JWT_SECRET=your-secret-key-here

# Verify token is not expired (8-hour expiry)
# Get fresh token by logging in again
```

### Permission Denied
```bash
# Check user role
GET /api/permissions/me

# Verify required permission exists
# Check permission matrix in permissions.js
```

---

**Testing Guide Complete**
**Ready for Manual Testing**
**Use Postman or Thunder Client**

---

*Generated for Phase 9 Backend Testing*
*Date: 2025-11-12*
