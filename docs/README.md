# API Documentation

## Viewing the Swagger Documentation

The API documentation is available in OpenAPI 3.0 format at:
**`docs/api-documentation.yaml`**

### How to View

#### Option 1: Online Swagger Editor
1. Go to https://editor.swagger.io/
2. Click "File" → "Import File"
3. Upload the `api-documentation.yaml` file
4. View interactive documentation with "Try it out" feature

#### Option 2: VS Code Extension
1. Install the "Swagger Viewer" extension in VS Code
2. Open `api-documentation.yaml`
3. Press `Shift + Alt + P` (or right-click and select "Preview Swagger")

#### Option 3: Swagger UI (Local)
Install and run Swagger UI locally to test APIs directly:
```bash
npm install -g swagger-ui-watcher
swagger-ui-watcher docs/api-documentation.yaml
```

## Current API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
- **Purpose**: User login
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "your_password"
  }
  ```
- **Response**: JWT token and user data

#### POST /api/auth/register
- **Purpose**: Register new tour operator
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "operator@example.com",
    "password": "secure_password",
    "companyName": "Tour Company Name",
    "contactEmail": "contact@company.com",
    "contactPhone": "+1234567890",
    "address": "123 Street, City"
  }
  ```
- **Response**: JWT token and user data

#### GET /api/auth/me
- **Purpose**: Get current user information
- **Auth Required**: Yes (Bearer token)
- **Headers**:
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- **Response**: Current user data with company info (if operator)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get the token from the login or register endpoints.

## User Roles

### super_admin
- Full system access
- Can manage all operators
- No operator_id (null)

### operator
- Linked to specific operator company
- Can only access their own data
- All data filtered by operator_id

## Data Flow

**ALL data comes from PostgreSQL database:**
- Users stored in `users` table
- Operators stored in `operators` table
- No hardcoded credentials or test data
- All queries use parameterized statements (SQL injection safe)

## Testing the APIs

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

**Get Current User:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the Swagger file or create requests manually
2. For login: Send POST to `http://localhost:3000/api/auth/login`
3. Copy the token from response
4. For protected routes: Add header `Authorization: Bearer <token>`

## Next APIs (Coming Soon)

- Operator management (super admin only)
- Tour management
- Booking system
- Customer management
- Payment integration

---

**Note**: This documentation is automatically updated as new endpoints are added to the system.
