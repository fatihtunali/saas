# Tour Operations SaaS - Authentication System

A complete authentication system with backend APIs and frontend login/registration screens for a tour operations SaaS platform.

## Features

- JWT-based authentication
- Role-based access control (Super Admin & Operator)
- Secure password hashing with bcrypt
- Clean, responsive frontend UI
- PostgreSQL database integration
- RESTful API design

## Tech Stack

**Backend:**
- Node.js & Express
- PostgreSQL with pg driver
- JWT for token-based authentication
- bcrypt for password hashing
- CORS enabled

**Frontend:**
- Pure HTML/CSS/JavaScript (no framework dependencies)
- Modern, responsive design
- Local storage for token management

## Project Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database connection
│   │   ├── controllers/
│   │   │   └── authController.js    # Authentication logic
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT & role-based middleware
│   │   ├── routes/
│   │   │   └── authRoutes.js        # Auth API routes
│   │   └── index.js                 # Express server
│   ├── .env                         # Environment variables
│   └── package.json
└── frontend/
    ├── public/
    │   ├── index.html               # Landing page
    │   ├── login.html               # Login page
    │   └── register.html            # Registration page
    └── server.js                    # Simple HTTP server
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password_hash` - Hashed password
- `role` - User role (super_admin or operator)
- `operator_id` - Foreign key to operators table (nullable)
- `is_active` - Account status
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Operators Table
- `id` - Primary key
- `company_name` - Company name
- `contact_email` - Contact email
- `contact_phone` - Contact phone
- `address` - Company address
- `is_active` - Account status
- `created_at` - Timestamp
- `updated_at` - Timestamp

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "super_admin",
      "operator_id": null,
      "company_name": null,
      "phone": null
    }
  }
}
```

#### POST /api/auth/register
Register a new operator account.

**Request Body:**
```json
{
  "email": "operator@example.com",
  "password": "password123",
  "company_name": "Travel Agency Inc.",
  "contact_phone": "+1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 2,
      "email": "operator@example.com",
      "role": "operator",
      "operator_id": 1,
      "company_name": "Travel Agency Inc.",
      "phone": "+1234567890"
    }
  }
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "super_admin",
      "operator_id": null,
      "company_name": null,
      "phone": null,
      "created_at": "2025-11-10T07:43:39.466Z"
    }
  }
}
```

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (already installed):
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```env
DB_HOST=YOUR_DATABASE_HOST
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD

PORT=3000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_here

SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on **http://localhost:3000**

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the frontend server:
```bash
node server.js
```

The frontend server will run on **http://localhost:8080**

## Usage

### Accessing the Application

1. **Backend API**: http://localhost:3000
2. **Frontend**: http://localhost:8080
3. **Login Page**: http://localhost:8080/login.html
4. **Register Page**: http://localhost:8080/register.html

### Super Admin Login

Use the credentials configured in your `.env` file to login as super admin:
- **Email**: (from SUPER_ADMIN_EMAIL)
- **Password**: (from SUPER_ADMIN_PASSWORD)

### Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

**Get User Info:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Register New Operator:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"operator@example.com",
    "password":"password123",
    "company_name":"Travel Agency",
    "contact_phone":"+1234567890",
    "address":"123 Main St"
  }'
```

## Middleware & Security

### JWT Authentication Middleware
Protects routes by verifying JWT tokens from the Authorization header.

### Role-Based Middleware
- `requireSuperAdmin` - Only super admins can access
- `requireOperator` - Only operators can access
- `requireAuthenticated` - Any authenticated user can access

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Plain text passwords are never stored in the database

## Test Accounts

### Super Admin
- **Email**: (configured in .env SUPER_ADMIN_EMAIL)
- **Password**: (configured in .env SUPER_ADMIN_PASSWORD)
- **Role**: super_admin

### Test Operator (Created during testing)
- **Email**: test@operator.com
- **Password**: Test123456
- **Role**: operator
- **Company**: Test Travel Agency

## Files Created

### Backend Files
1. `C:\Users\fatih\Desktop\CRM\backend\src\index.js` - Express server
2. `C:\Users\fatih\Desktop\CRM\backend\src\controllers\authController.js` - Authentication controller
3. `C:\Users\fatih\Desktop\CRM\backend\src\middleware\auth.js` - JWT and role-based middleware
4. `C:\Users\fatih\Desktop\CRM\backend\src\routes\authRoutes.js` - Authentication routes

### Frontend Files
1. `C:\Users\fatih\Desktop\CRM\frontend\public\index.html` - Landing page
2. `C:\Users\fatih\Desktop\CRM\frontend\public\login.html` - Login page with dashboard
3. `C:\Users\fatih\Desktop\CRM\frontend\public\register.html` - Operator registration page
4. `C:\Users\fatih\Desktop\CRM\frontend\server.js` - Simple HTTP server

## Next Steps

This authentication system provides a solid foundation. Consider adding:

1. Password reset functionality
2. Email verification
3. Session management
4. Rate limiting
5. Account lockout after failed attempts
6. Two-factor authentication
7. Admin dashboard for user management
8. Operator dashboard for tour management

## License

This project is part of a tour operations SaaS platform.
