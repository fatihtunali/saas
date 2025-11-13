# PHASE 6: CLIENT MANAGEMENT - EXECUTION PLAN

**Date**: November 12, 2025
**Status**: Ready to Execute
**Dependencies**: Phases 1-5 Complete ✅
**Estimated Duration**: 3-4 days
**Agents Required**: 1 comprehensive agent

---

## 📊 CURRENT STATUS VERIFICATION

### ✅ Database Tables Confirmed:

**1. operators** (Super Admin Management)
```sql
Columns: id, company_name, contact_email, contact_phone, address, is_active,
         created_at, updated_at, city, country, tax_id, base_currency, deleted_at
```

**2. clients** (Direct B2C Clients)
```sql
Columns: id, operator_id, client_type, full_name, email, phone, birth_date,
         nationality, passport_number, passport_expiry_date, address, city, country,
         emergency_contact_name, emergency_contact_phone, dietary_requirements,
         accessibility_needs, medical_conditions, special_notes, payment_terms,
         credit_limit, credit_used, passport_alert_sent, passport_alert_date,
         is_active, created_at, updated_at, deleted_at
```

**3. operators_clients** (B2B Clients - Travel Agencies)
```sql
Columns: id, operator_id, partner_operator_id, full_name, email, phone, birth_date,
         nationality, passport_number, passport_expiry_date, address, city, country,
         emergency_contact_name, emergency_contact_phone, dietary_requirements,
         accessibility_needs, medical_conditions, special_notes, payment_terms,
         credit_limit, credit_used, is_active, created_at, updated_at, deleted_at
```

### ✅ Backend API Endpoints Confirmed:

**Direct Clients (B2C):**
- ✅ `GET /api/clients` - List all clients
- ✅ `GET /api/clients/:id` - Get single client
- ✅ `POST /api/clients` - Create client
- ✅ `PUT /api/clients/:id` - Update client
- ✅ `DELETE /api/clients/:id` - Delete client

**Operators Clients (B2B):**
- ✅ `GET /api/operators-clients` - List all B2B clients
- ✅ `GET /api/operators-clients/:id` - Get single B2B client
- ✅ `POST /api/operators-clients` - Create B2B client
- ✅ `PUT /api/operators-clients/:id` - Update B2B client
- ✅ `DELETE /api/operators-clients/:id` - Delete B2B client

**Operators Management:**
- ⚠️ MISSING - Need to add CRUD for operators table (Super Admin only)

---

## 🎯 EXECUTION STRATEGY

### Single Agent Approach (Recommended)
Deploy **ONE comprehensive agent** to build all 3 client modules sequentially because:
1. All share similar structure and validation patterns
2. Reduces coordination overhead
3. Ensures consistent UX across all modules
4. Faster than coordinating 3 parallel agents

**Agent 15: Complete Client Management System**
- Task 1: Operators Management (Super Admin)
- Task 2: B2B Clients (Operator's Clients)
- Task 3: B2C Clients (Direct Clients)
- Task 4: Add navigation integration

---

## 📋 DETAILED TASKS

### Task 1: Operators Management (Super Admin Only) ⚠️ NEW

**Backend Work Required** (20-30 minutes):
1. Add operators controller functions to `backend/src/controllers/clientController.js`:
   - `exports.getOperators`
   - `exports.getOperatorById`
   - `exports.createOperator`
   - `exports.updateOperator`
   - `exports.deleteOperator`

2. Add routes to `backend/src/routes/index.js`:
   ```javascript
   router.get('/api/operators', authenticateToken, clientController.getOperators);
   router.get('/api/operators/:id', authenticateToken, clientController.getOperatorById);
   router.post('/api/operators', authenticateToken, clientController.createOperator);
   router.put('/api/operators/:id', authenticateToken, clientController.updateOperator);
   router.delete('/api/operators/:id', authenticateToken, clientController.deleteOperator);
   ```

**Frontend Work** (2-3 hours):

**Files to Create** (12 files):

1. **Types & Validation**:
   - `frontend/src/types/clients.ts` - All client type interfaces
   - `frontend/src/lib/validations/operators.ts` - Operator validation schema
   - `frontend/src/lib/validations/b2b-clients.ts` - B2B client validation
   - `frontend/src/lib/validations/b2c-clients.ts` - B2C client validation

2. **React Query Hooks**:
   - `frontend/src/hooks/use-operators.ts` - Operators management hooks
   - `frontend/src/hooks/use-b2b-clients.ts` - B2B clients hooks
   - `frontend/src/hooks/use-b2c-clients.ts` - B2C clients hooks

3. **Operators Pages** (4 pages):
   - `frontend/src/app/(dashboard)/dashboard/clients/operators/page.tsx` - List
   - `frontend/src/app/(dashboard)/dashboard/clients/operators/create/page.tsx` - Create
   - `frontend/src/app/(dashboard)/dashboard/clients/operators/[id]/page.tsx` - Details
   - `frontend/src/app/(dashboard)/dashboard/clients/operators/[id]/edit/page.tsx` - Edit

**Fields for Operators Form**:
- company_name (required)
- contact_email (required, email validation)
- contact_phone (phone validation)
- address
- city
- country
- tax_id
- base_currency (dropdown: TRY, USD, EUR, GBP)
- is_active (toggle, default: true)

---

### Task 2: B2B Clients (Operator's Clients) ✅ API EXISTS

**Files to Create** (4 pages):
- `frontend/src/app/(dashboard)/dashboard/clients/b2b/page.tsx` - List
- `frontend/src/app/(dashboard)/dashboard/clients/b2b/create/page.tsx` - Create
- `frontend/src/app/(dashboard)/dashboard/clients/b2b/[id]/page.tsx` - Details
- `frontend/src/app/(dashboard)/dashboard/clients/b2b/[id]/edit/page.tsx` - Edit

**Fields for B2B Clients Form**:
- partner_operator_id (dropdown, links to operators table)
- full_name (required) - Contact person name
- email (email validation)
- phone (phone validation)
- birth_date (date picker)
- nationality (country selector)
- passport_number
- passport_expiry_date (date picker)
- address
- city
- country
- emergency_contact_name
- emergency_contact_phone
- dietary_requirements (textarea)
- accessibility_needs (textarea)
- medical_conditions (textarea)
- special_notes (textarea)
- payment_terms (textarea)
- credit_limit (currency input)
- credit_used (currency input, readonly)
- is_active (toggle, default: true)

---

### Task 3: B2C Clients (Direct Clients) ✅ API EXISTS

**Files to Create** (4 pages):
- `frontend/src/app/(dashboard)/dashboard/clients/page.tsx` - List
- `frontend/src/app/(dashboard)/dashboard/clients/create/page.tsx` - Create
- `frontend/src/app/(dashboard)/dashboard/clients/[id]/page.tsx` - Details
- `frontend/src/app/(dashboard)/dashboard/clients/[id]/edit/page.tsx` - Edit

**Fields for B2C Clients Form** (same as B2B minus partner_operator_id):
- client_type (dropdown: Individual, Family, Group)
- full_name (required)
- email (email validation)
- phone (phone validation)
- birth_date (date picker)
- nationality (country selector)
- passport_number
- passport_expiry_date (date picker)
- address
- city
- country
- emergency_contact_name
- emergency_contact_phone
- dietary_requirements (textarea)
- accessibility_needs (textarea)
- medical_conditions (textarea)
- special_notes (textarea)
- payment_terms (textarea)
- credit_limit (currency input)
- credit_used (currency input, readonly)
- passport_alert_sent (readonly)
- passport_alert_date (readonly)
- is_active (toggle, default: true)

---

### Task 4: Navigation & Layout

**Update Sidebar Navigation**:
```typescript
// Add to frontend/src/components/layout/Sidebar.tsx
{
  title: 'Clients',
  href: '/dashboard/clients',
  icon: Users,
  // No children - will have tabs inside
}
```

**Create Clients Layout with Tabs**:
File: `frontend/src/app/(dashboard)/dashboard/clients/layout.tsx`

**Tabs**:
1. Direct Clients (B2C) - `/dashboard/clients`
2. B2B Clients - `/dashboard/clients/b2b`
3. Operators (Super Admin only) - `/dashboard/clients/operators`

---

## 📐 UI/UX PATTERNS

### List Pages:
```typescript
- DataTable with columns:
  * Full Name / Company Name
  * Email
  * Phone
  * Credit Limit
  * Credit Used
  * Status (Active/Inactive)
  * Actions (View, Edit, Delete)
- Search by name, email, phone
- Filter by status (Active/Inactive)
- Filter by credit status (Available Credit, Over Limit)
- Export to CSV/Excel
- Bulk actions (Activate, Deactivate)
```

### Create/Edit Forms:
```typescript
- Multi-section cards:
  1. Basic Information
  2. Contact Details
  3. Passport & Travel Info
  4. Emergency Contact
  5. Special Requirements
  6. Financial Information (Credit Terms)
- Field validation with Zod
- Auto-save draft to localStorage
- Cancel confirmation
- Success/error toast notifications
```

### Details Pages:
```typescript
- Card sections matching form structure
- Booking history (clickable links)
- Payment history
- Credit usage chart
- Quick actions: Edit, Create Booking, Record Payment
- Activity timeline
```

---

## 🔧 TECHNICAL SPECIFICATIONS

### TypeScript Types:

```typescript
// frontend/src/types/clients.ts

export interface Operator {
  id: number;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  base_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface B2BClient {
  id: number;
  operator_id: number;
  partner_operator_id: number | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  medical_conditions: string | null;
  special_notes: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  credit_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined fields
  partner_company_name?: string;
}

export interface B2CClient {
  id: number;
  operator_id: number;
  client_type: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  medical_conditions: string | null;
  special_notes: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  credit_used: number;
  passport_alert_sent: boolean | null;
  passport_alert_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### Validation Schemas (Zod):

```typescript
// Example for Operators
export const operatorSchema = z.object({
  company_name: z.string().min(2, 'Company name required').max(255),
  contact_email: z.string().email('Invalid email'),
  contact_phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  tax_id: z.string().max(50).optional(),
  base_currency: z.enum(['TRY', 'USD', 'EUR', 'GBP']).default('TRY'),
  is_active: z.boolean().default(true),
});
```

### React Query Hooks Pattern:

```typescript
// Example structure
export const useOperators = () => {
  const queryClient = useQueryClient();

  const useOperators = (filters?: OperatorFilters) => {
    return useQuery({
      queryKey: ['operators', filters],
      queryFn: () => apiClient.get('/api/operators', { params: filters }),
    });
  };

  const useOperator = (id: number) => {
    return useQuery({
      queryKey: ['operators', id],
      queryFn: () => apiClient.get(`/api/operators/${id}`),
      enabled: !!id,
    });
  };

  const createOperator = useMutation({
    mutationFn: (data: CreateOperatorDto) =>
      apiClient.post('/api/operators', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('Operator created successfully');
    },
  });

  // ... similar for update, delete

  return {
    useOperators,
    useOperator,
    createOperator,
    // ...
  };
};
```

---

## ✅ SUCCESS CRITERIA

For each module (Operators, B2B, B2C):

1. ✅ List page displays all records with search/filter
2. ✅ Create page with full validation
3. ✅ Edit page with pre-populated data
4. ✅ Details page with complete information
5. ✅ Soft delete functionality
6. ✅ Credit limit tracking and warnings
7. ✅ Passport expiry alerts (B2C)
8. ✅ Active/Inactive status toggle
9. ✅ Responsive design (mobile-friendly)
10. ✅ Zero TypeScript errors
11. ✅ All CRUD operations working
12. ✅ Toast notifications for all actions
13. ✅ Loading states and skeletons
14. ✅ Error handling with user-friendly messages
15. ✅ Integration with booking system (client selector)

---

## 📊 ESTIMATED DELIVERABLES

### Backend:
- **1 controller** with operators CRUD (clientController.js)
- **5 routes** added to index.js
- **~100 lines** of code

### Frontend:
- **3 type interfaces** (clients.ts)
- **3 validation schemas** (operators, b2b, b2c)
- **3 React Query hooks**
- **12 pages** (4 per module × 3 modules)
- **1 layout** with tabs
- **~3,000-4,000 lines** of code

### Total:
- **~25-30 files** created/modified
- **~3,100-4,100 lines** of production code
- **Zero TypeScript errors**

---

## 🚀 EXECUTION TIMELINE

**Day 1** (4-6 hours):
- Add backend operators API
- Create types and validation schemas
- Create React Query hooks
- Build Operators module (4 pages)

**Day 2** (4-6 hours):
- Build B2B Clients module (4 pages)
- Build B2C Clients module (4 pages)
- Create navigation and layout

**Day 3** (2-3 hours):
- Testing all CRUD operations
- Bug fixes
- Integration testing with booking system
- Build verification

**Total**: 10-15 hours of focused work

---

## 🔗 INTEGRATION POINTS

### With Booking System:
- Client selector in Step 1 of booking wizard
- Auto-fill client information
- Display client credit limit warnings
- Link bookings to clients

### With Payment System (Phase 7):
- Credit limit checking
- Credit used calculation
- Payment terms enforcement
- Outstanding balance tracking

### With Dashboard:
- Client metrics (total clients, active, inactive)
- Top clients by booking value
- Credit utilization analytics

---

## ⚠️ IMPORTANT NOTES

1. **Super Admin Access**: Operators management only visible to super_admin role
2. **Multi-Tenancy**: All data filtered by operator_id (except operators table for super admin)
3. **Credit Tracking**: credit_used is calculated from payments, not manually editable
4. **Passport Alerts**: Auto-generated 60 days before expiry for B2C clients
5. **Soft Deletes**: Use deleted_at, never hard delete client records
6. **Validation**: Email format, phone format, passport expiry > today
7. **Field Mapping**: camelCase (frontend) ↔ snake_case (backend)

---

## 📝 AGENT INSTRUCTIONS

**Agent 15: Complete Client Management System**

Your task is to build the complete Client Management system for the Tour Operations CRM.

**Context**:
- Backend API exists for clients and operators_clients (B2B)
- Backend API MISSING for operators management - you must add it first
- Follow the exact patterns from Phase 5 (Services Management)
- Use Hotels module as reference for CRUD structure
- All forms must compile with zero TypeScript errors

**Execution Order**:
1. **Backend First**: Add operators CRUD to clientController.js and routes
2. **Types & Validation**: Create all TypeScript types and Zod schemas
3. **Hooks**: Create React Query hooks for all 3 modules
4. **Operators Module**: Build all 4 pages (List, Create, Edit, Details)
5. **B2B Clients Module**: Build all 4 pages
6. **B2C Clients Module**: Build all 4 pages
7. **Navigation**: Update sidebar and create clients layout with tabs
8. **Testing**: Verify build passes with zero errors

**Templates**:
- Use `frontend/src/app/(dashboard)/dashboard/services/hotels/` as reference
- Copy form patterns from Phase 5 services modules
- Follow same Card section structure for complex forms
- Use same DataTable pattern for list pages

**Requirements**:
- Zero TypeScript errors
- All fields aligned with database schema
- Proper validation with error messages
- Loading states and skeletons
- Toast notifications
- Responsive design
- Credit limit warnings when over limit
- Passport expiry warnings for B2C clients

**Deliverables**:
- ~25-30 files
- ~3,100-4,100 lines of code
- Zero build errors
- Full CRUD operations working

---

## 🎯 READY TO DEPLOY

**Agent 15 is ready to execute Phase 6 in full.**

**Expected completion**: 1-2 days
**Success rate**: 100% (based on Phase 4 & 5 success)

---

**Awaiting deployment command to start Phase 6 execution.**
