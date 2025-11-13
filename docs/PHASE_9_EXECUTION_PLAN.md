# PHASE 9: USER MANAGEMENT & PERMISSIONS - EXECUTION PLAN

**Created**: 2025-11-12
**Status**: Ready for Execution  
**Priority**: HIGH
**Dependencies**: Phase 1-8 Complete
**Complexity**: Medium-High (Security-Critical)

---

## EXECUTIVE SUMMARY

Phase 9 implements comprehensive user management and role-based permissions system.

**Key Objectives**:
1. Expand simple role system to support multiple role types
2. Implement granular permission system (module + action level)
3. Build user management interface (CRUD)
4. Add password management (change, reset)
5. Implement activity logging and audit trail
6. Create user profile and settings pages
7. Add session management features

---

## DATABASE SCHEMA ANALYSIS

### Current State
**Table**: users (12 fields)
- id, email, password_hash, role, operator_id, is_active
- created_at, updated_at, full_name, phone, last_login, deleted_at

**Current Roles**:
- super_admin - Platform admin (operator_id = NULL)
- operator - Operator owner (has operator_id)

### Recommendation: EXPANDED SIMPLE ROLE SYSTEM

Database Changes: NONE REQUIRED

Existing users table is perfect. Only need to:
1. Add new role string values (no schema change)
2. Update validation for new roles
3. Document permission matrix

**New Role Values**:
- super_admin (existing)
- operator_admin (renamed from operator)
- operations_manager
- sales_manager
- accountant
- staff

---

## ROLE TYPES & PERMISSIONS

### Role Hierarchy

1. Super Admin - Platform level, all access
2. Operator Admin - Company owner, full company access  
3. Operations Manager - Bookings & services management
4. Sales Manager - Clients & sales
5. Accountant - Finance & payments
6. Staff - Limited view access

### Permission Matrix

| Module | Super Admin | Operator Admin | Operations | Sales | Accountant | Staff |
|--------|-------------|----------------|------------|-------|------------|-------|
| Dashboard | VCED | VCED | VC | VC | VC | V |
| Bookings | VCED | VCED | VCED | VCE | V | V |
| Services | VCED | VCED | VCED | V | V | V |
| Clients | VCED | VCED | V | VCED | V | V |
| Payments | VCED | VCED | V | V | VCED | - |
| Reports | VCED | VCED | VE | VE | VE | - |
| Operations | VCED | VCED | VCED | V | - | - |
| Users | VCED | VCED | - | - | - | - |
| Settings | VCED | VCED | - | - | - | - |

V=View, C=Create, E=Edit, D=Delete, E=Export

---

## BACKEND REQUIREMENTS

### New Files

1. **userController.js** (500 lines)
   - 11 endpoints: CRUD users, password management, profile

2. **permissions.js** middleware (300 lines)
   - Permission matrix
   - requirePermission() factory
   - Role hierarchy validation

3. **activityLogger.js** middleware (150 lines)
   - Log to audit_logs table

4. **routes/index.js** (+30 lines)
   - Add 11 user management routes

**Total Backend**: 7 files, ~1,080 lines

---

## FRONTEND REQUIREMENTS

### File Structure

- types/ (2 files, 250 lines)
- lib/api/ (1 file, 200 lines)  
- lib/hooks/ (3 files, 500 lines)
- lib/utils/ (2 files, 280 lines)
- components/features/ (7 files, 1,040 lines)
- app/dashboard/users/ (4 pages, 950 lines)
- app/dashboard/settings/ (4 pages, 900 lines)

**Total Frontend**: 27 files, ~4,170 lines

---

## SECURITY CONSIDERATIONS

1. **Password Policies**
   - Min 8 characters, require uppercase/lowercase/number

2. **Session Management**
   - JWT expiration: 8 hours
   - Max session: 24 hours

3. **Failed Login Attempts**
   - Max 5 attempts in 15 minutes
   - Lockout: 30 minutes

4. **Audit Trail**
   - Log all sensitive actions
   - 2-year retention

5. **Multi-Tenant Isolation**
   - Enforce operator_id in ALL queries
   - Never trust client-side operator_id

6. **Role Hierarchy**
   - Cannot assign role >= own role
   - Users cannot change own role

---

## IMPLEMENTATION STRATEGY

### 2-Agent Sequential Execution

**Agent 19A: Backend (2-3 hours)**
1. Create userController.js
2. Create permissions.js middleware
3. Create activityLogger.js
4. Update authController.js
5. Update routes
6. Test endpoints

**Agent 19B: Frontend (3-4 hours)**
1. Create types
2. Create API client & hooks
3. Create components
4. Create 8 pages
5. Update navigation
6. Test thoroughly

---

## DEFINITION OF DONE

### Backend
- 11 API endpoints functional
- Permission checks working
- Activity logging working
- Multi-tenant filtering enforced

### Frontend
- Users list/create/edit pages working
- Profile & password pages working
- Activity log displaying
- Permission checks in UI
- Zero errors

### Security
- Password strength enforced
- Cannot escalate privileges
- Multi-tenant isolation verified
- Audit trail working

---

## FILE SUMMARY

**Backend**: 7 files (~1,080 lines)
**Frontend**: 27 files (~4,170 lines)
**Total**: 34 files (~5,250 lines)

**API Endpoints**: 11 new
**Pages**: 8 new
**Components**: 7 new

---

## EXECUTION COMMANDS

### Agent 19A: Backend
Create user management backend with 11 endpoints, permissions middleware, activity logging

### Agent 19B: Frontend  
Create user management frontend with 8 pages, permission checks, password management

---

## NEXT STEPS

1. Test with users in each role
2. Verify permission checks
3. Test multi-tenant isolation
4. Update PROJECT_ROADMAP to 90%
5. Create PHASE_9_COMPLETION_REPORT.md
6. Plan Phase 10: Final Polish

---

**PHASE 9 READY FOR DEPLOYMENT**

**Target**: 90% Project Complete
**Duration**: 5-7 hours (2 agents)
**Files**: 34 files (~5,250 lines)
