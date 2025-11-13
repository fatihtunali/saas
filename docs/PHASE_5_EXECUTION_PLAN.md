# PHASE 5: SERVICES MANAGEMENT - EXECUTION PLAN

**Date**: November 12, 2025
**Current Status**: 95% Complete
**Remaining Work**: 5% (Create/Edit forms for 8 modules)
**Estimated Time**: 2-4 hours with parallel agent execution

---

## 📊 CURRENT STATUS

### ✅ COMPLETED (95%)
- All 11 modules fully scaffolded
- All React Query hooks created and working
- All Zod validation schemas implemented
- All TypeScript types aligned with database
- All list pages functional
- **3 modules FULLY working**: Hotels, Entrance Fees, Extra Expenses

### ⚠️ REMAINING (5%)
**8 modules need Create/Edit forms**:
1. Guides
2. Restaurants
3. Vehicle Companies
4. Vehicle Types
5. Vehicle Rentals
6. Transfer Routes
7. Tour Companies
8. Suppliers

**Pattern**: Copy Hotels module form implementation to the remaining 8 modules

---

## 🎯 EXECUTION STRATEGY

### Approach: Parallel Agent Execution

Deploy **4 agents in parallel**, each handling 2 modules:
- Each agent creates both Create and Edit pages for their assigned modules
- Follow Hotels module as the template/reference
- Ensure database field mapping is correct
- Maintain consistent UX/UI patterns

---

## 👥 AGENT ASSIGNMENTS

### **Agent 11: Guides & Restaurants**
**Modules**: 2
**Estimated Time**: 30-40 minutes

#### Files to Create:
1. `frontend/src/app/(dashboard)/dashboard/services/guides/create/page.tsx`
2. `frontend/src/app/(dashboard)/dashboard/services/guides/[id]/edit/page.tsx`
3. `frontend/src/app/(dashboard)/dashboard/services/restaurants/create/page.tsx`
4. `frontend/src/app/(dashboard)/dashboard/services/restaurants/[id]/edit/page.tsx`

#### Reference:
- Template: `hotels/create/page.tsx` and `hotels/[id]/edit/page.tsx`
- Hooks: `use-guides.ts`, `use-restaurants.ts`
- Validation: `guides.ts`, `restaurants.ts`

#### Database Fields:

**Guides**:
- guide_name (required)
- phone
- email
- languages (JSON array as text)
- daily_rate, half_day_rate, night_rate, transfer_rate
- currency
- specializations (JSON array as text)
- license_number
- profile_picture_url
- notes

**Restaurants**:
- restaurant_name (required)
- city_id (required, FK)
- address
- phone
- lunch_price, dinner_price
- currency
- capacity
- cuisine_type (JSON array as text)
- menu_options (text)
- picture_url
- notes

---

### **Agent 12: Vehicle Companies & Vehicle Types**
**Modules**: 2
**Estimated Time**: 30-40 minutes

#### Files to Create:
1. `frontend/src/app/(dashboard)/dashboard/services/vehicle-companies/create/page.tsx`
2. `frontend/src/app/(dashboard)/dashboard/services/vehicle-companies/[id]/edit/page.tsx`
3. `frontend/src/app/(dashboard)/dashboard/services/vehicle-types/create/page.tsx`
4. `frontend/src/app/(dashboard)/dashboard/services/vehicle-types/[id]/edit/page.tsx`

#### Database Fields:

**Vehicle Companies**:
- company_name (required)
- contact_person
- phone
- email
- supplier_id (FK, optional)

**Vehicle Types**:
- vehicle_company_id (required, FK - dropdown)
- vehicle_type (required, e.g., "Sedan", "SUV", "Van", "Bus")
- capacity (integer)
- luggage_capacity (integer)
- notes

---

### **Agent 13: Vehicle Rentals & Transfer Routes**
**Modules**: 2
**Estimated Time**: 40-50 minutes

#### Files to Create:
1. `frontend/src/app/(dashboard)/dashboard/services/vehicle-rentals/create/page.tsx`
2. `frontend/src/app/(dashboard)/dashboard/services/vehicle-rentals/[id]/edit/page.tsx`
3. `frontend/src/app/(dashboard)/dashboard/services/transfer-routes/create/page.tsx`
4. `frontend/src/app/(dashboard)/dashboard/services/transfer-routes/[id]/edit/page.tsx`

#### Database Fields:

**Vehicle Rentals** (Most Complex):
- vehicle_company_id (required, FK)
- vehicle_type_id (required, FK)
- full_day_price, full_day_hours, full_day_km
- half_day_price, half_day_hours, half_day_km
- night_rental_price, night_rental_hours, night_rental_km
- extra_hour_rate
- extra_km_rate
- currency
- notes

**Transfer Routes**:
- vehicle_company_id (required, FK)
- vehicle_type_id (FK, optional)
- from_city_id (required, FK)
- to_city_id (required, FK)
- price_per_vehicle
- currency
- duration_hours
- distance_km
- notes

---

### **Agent 14: Tour Companies & Suppliers**
**Modules**: 2
**Estimated Time**: 40-50 minutes

#### Files to Create:
1. `frontend/src/app/(dashboard)/dashboard/services/tour-companies/create/page.tsx`
2. `frontend/src/app/(dashboard)/dashboard/services/tour-companies/[id]/edit/page.tsx`
3. `frontend/src/app/(dashboard)/dashboard/services/suppliers/create/page.tsx`
4. `frontend/src/app/(dashboard)/dashboard/services/suppliers/[id]/edit/page.tsx`

#### Database Fields:

**Tour Companies** (Most Complex):
- company_name (required)
- tour_name
- tour_type (dropdown: City Tour, Full Day, Half Day, Multi-Day, etc.)
- duration_days, duration_hours
- sic_price (Series in Coach pricing)
- pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax
- currency
- min_passengers, max_passengers
- current_bookings
- itinerary (textarea)
- inclusions (textarea)
- exclusions (textarea)
- picture_url
- supplier_id (FK, optional)
- notes

**Suppliers**:
- supplier_type (required, dropdown: Hotel, Transport, Tour Operator, Restaurant, Guide, Other)
- company_name (required)
- contact_person
- email
- phone
- address
- city_id (FK, optional)
- tax_id
- payment_terms (textarea)
- bank_account_info (textarea)
- notes

---

## 📋 IMPLEMENTATION CHECKLIST

### For Each Module (8 modules × 2 pages = 16 files)

#### Create Page Template:
```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCreate[Module]() } from '@/hooks/use-[module]';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { [module]Schema } from '@/lib/validations/[module]';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Create[Module]Page() {
  const router = useRouter();
  const create = useCreate[Module]();

  const form = useForm({
    resolver: zodResolver([module]Schema),
    defaultValues: {
      // Set defaults based on schema
    },
  });

  const onSubmit = async (data) => {
    try {
      await create.mutateAsync(data);
      toast.success('[Module] created successfully');
      router.push('/dashboard/services/[module-slug]');
    } catch (error) {
      toast.error('Failed to create [module]');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New [Module]</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form fields based on database schema */}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? 'Creating...' : 'Create [Module]'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Edit Page Template:
```tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { use[Module]ById, useUpdate[Module] } from '@/hooks/use-[module]';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { [module]Schema } from '@/lib/validations/[module]';
// ... (same imports as create page)

export default function Edit[Module]Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: [module], isLoading } = use[Module]ById(id);
  const update = useUpdate[Module](id);

  const form = useForm({
    resolver: zodResolver([module]Schema),
    values: [module] || {},
  });

  const onSubmit = async (data) => {
    try {
      await update.mutateAsync(data);
      toast.success('[Module] updated successfully');
      router.push('/dashboard/services/[module-slug]');
    } catch (error) {
      toast.error('Failed to update [module]');
    }
  };

  if (isLoading) return <Skeleton />;

  return (
    // Same structure as create page
  );
}
```

### Field Types to Use:
- **Text Input**: `<Input type="text" />`
- **Number Input**: `<Input type="number" />`
- **Email Input**: `<Input type="email" />`
- **Phone Input**: `<PhoneInput />` (custom component)
- **Textarea**: `<Textarea />`
- **Dropdown**: `<Select>` with `<SelectItem>`
- **Currency Input**: `<CurrencyInput />` (custom component)
- **Image Upload**: `<ImageUpload />` (for picture_url fields)
- **Foreign Key Dropdowns**: Use appropriate hooks (useCities, useVehicleCompanies, etc.)

---

## ✅ SUCCESS CRITERIA

For each module's Create/Edit pages:
1. ✅ Form compiles with zero TypeScript errors
2. ✅ All database fields represented
3. ✅ Validation works correctly
4. ✅ Create submits and saves to database
5. ✅ Edit loads existing data
6. ✅ Update submits and saves changes
7. ✅ Success/error toast notifications display
8. ✅ Navigation works (redirect after save, cancel button)
9. ✅ Loading states implemented
10. ✅ Responsive design (mobile-friendly)

---

## 🔧 COMMON PATTERNS

### Foreign Key Dropdowns
```tsx
const { data: companies } = useVehicleCompanies();

<FormField
  control={form.control}
  name="vehicle_company_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Vehicle Company</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {companies?.map(company => (
            <SelectItem key={company.id} value={company.id}>
              {company.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### JSON Array Fields (languages, specializations, cuisine_type)
```tsx
// Store as comma-separated string in UI, convert to JSON array for API
<FormField
  control={form.control}
  name="languages"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Languages (comma-separated)</FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder="English, Turkish, German"
          value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
          onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Currency Fields
```tsx
<FormField
  control={form.control}
  name="daily_rate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Daily Rate</FormLabel>
      <FormControl>
        <CurrencyInput
          {...field}
          currency={form.watch('currency')}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 📊 ESTIMATED TIMELINE

| Agent | Modules | Files | Est. Time |
|-------|---------|-------|-----------|
| Agent 11 | Guides, Restaurants | 4 | 30-40 min |
| Agent 12 | Vehicle Companies, Vehicle Types | 4 | 30-40 min |
| Agent 13 | Vehicle Rentals, Transfer Routes | 4 | 40-50 min |
| Agent 14 | Tour Companies, Suppliers | 4 | 40-50 min |

**Total Parallel Execution**: 40-50 minutes
**Total Files**: 16 files
**Total Lines of Code**: ~4,000-5,000 lines

---

## 🚀 DEPLOYMENT SEQUENCE

### Step 1: Deploy Agents (Parallel)
Launch all 4 agents simultaneously with clear module assignments

### Step 2: Agent Execution
Each agent:
1. Creates Create page for Module A
2. Creates Edit page for Module A
3. Creates Create page for Module B
4. Creates Edit page for Module B
5. Reports completion status

### Step 3: Build Verification
```bash
cd frontend
npm run build
```
Expected: Zero TypeScript errors

### Step 4: Testing
For each module:
1. Navigate to list page
2. Click "Create New [Module]"
3. Fill form and submit
4. Verify creation in database
5. Navigate to edit page
6. Update fields and save
7. Verify update in database

### Step 5: Final Verification
- All 11 modules have working CRUD operations
- All forms validate correctly
- All database interactions work
- Zero errors in browser console

---

## 📁 FILES TO CREATE (16 Total)

### Guides (2)
- `frontend/src/app/(dashboard)/dashboard/services/guides/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/guides/[id]/edit/page.tsx`

### Restaurants (2)
- `frontend/src/app/(dashboard)/dashboard/services/restaurants/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/restaurants/[id]/edit/page.tsx`

### Vehicle Companies (2)
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-companies/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-companies/[id]/edit/page.tsx`

### Vehicle Types (2)
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-types/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-types/[id]/edit/page.tsx`

### Vehicle Rentals (2)
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-rentals/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/vehicle-rentals/[id]/edit/page.tsx`

### Transfer Routes (2)
- `frontend/src/app/(dashboard)/dashboard/services/transfer-routes/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/transfer-routes/[id]/edit/page.tsx`

### Tour Companies (2)
- `frontend/src/app/(dashboard)/dashboard/services/tour-companies/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/tour-companies/[id]/edit/page.tsx`

### Suppliers (2)
- `frontend/src/app/(dashboard)/dashboard/services/suppliers/create/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/services/suppliers/[id]/edit/page.tsx`

---

## 🎯 FINAL DELIVERABLE

After Phase 5 completion:
- ✅ **11 fully functional service modules**
- ✅ **44 total pages** (list, create, edit, details × 11)
- ✅ **Complete CRUD** for all service types
- ✅ **100% database integration**
- ✅ **Zero TypeScript errors**
- ✅ **Production-ready**

---

**Ready to deploy agents?**
Awaiting confirmation to launch Agent 11-14 in parallel.
