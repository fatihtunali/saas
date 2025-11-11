# Phase 2: Core Components Library - Execution Plan

**Start Date:** 2025-11-11
**Estimated Duration:** 5 days
**Status:** Ready to Execute
**Agent:** Phase 2 Development Agent

---

## Goal

Build a complete, reusable UI component library that will be used across all modules in the Tour Operations SaaS application. All components must be:
- Type-safe with TypeScript
- Accessible (WCAG 2.1 AA)
- Responsive
- Consistent with shadcn/ui design system
- Well-documented
- Production-ready

---

## Task Breakdown

### Task 1: Enhanced Form Components (Priority: HIGH)
**Duration:** Day 1-2
**Dependencies:** None
**Files to Create:** 10+ component files

#### 1.1 Date & Time Inputs
- [ ] `components/forms/DatePicker.tsx`
  - Single date picker
  - Uses react-day-picker
  - DD/MM/YYYY format
  - Min/max date validation
  - Disabled dates support

- [ ] `components/forms/DateRangePicker.tsx`
  - Start and end date selection
  - Visual range preview
  - Preset ranges (Today, This Week, This Month)
  - Validation (end >= start)

- [ ] `components/forms/TimePicker.tsx`
  - HH:MM format (24-hour)
  - Dropdown or input mode
  - Validation

#### 1.2 Specialized Inputs
- [ ] `components/forms/CurrencyInput.tsx`
  - Amount input with currency symbol
  - Thousand separators
  - Decimal precision (2 digits)
  - Currency selector dropdown
  - Integration with currencies from database

- [ ] `components/forms/PhoneInput.tsx`
  - Country code selector
  - Phone number formatting
  - Validation by country
  - Uses libphonenumber-js

- [ ] `components/forms/FileUpload.tsx`
  - Drag & drop support
  - File type validation
  - Size limit validation
  - Image preview for images
  - Multiple file support
  - Progress indicator

- [ ] `components/forms/ImageUpload.tsx`
  - Specialized for images only
  - Crop/resize preview
  - Aspect ratio options
  - Max dimensions

#### 1.3 Rich Input Components
- [ ] `components/forms/RichTextEditor.tsx`
  - WYSIWYG editor (use TipTap or Quill)
  - Basic formatting (bold, italic, lists)
  - Link insertion
  - For notes, descriptions, policies

- [ ] `components/forms/MultiSelect.tsx`
  - Select multiple items
  - Search/filter within options
  - Chips display for selected items
  - Clear all button
  - Max selections limit

- [ ] `components/forms/AutoComplete.tsx`
  - Search as you type
  - Debounced API calls
  - Keyboard navigation
  - Loading state

#### 1.4 Form Utilities
- [ ] `components/forms/FormField.tsx`
  - Wrapper component for form fields
  - Label, input, error message layout
  - Required indicator
  - Help text support
  - Integrates with React Hook Form

**Deliverables:**
- 10 new form components
- TypeScript types for all props
- Integration with React Hook Form + Zod
- Usage examples in each file

**Dependencies to Install:**
```bash
npm install react-day-picker date-fns libphonenumber-js
npm install @tiptap/react @tiptap/starter-kit  # For rich text editor
```

---

### Task 2: Data Table Component (Priority: CRITICAL)
**Duration:** Day 2-3
**Dependencies:** Task 1 (filters may use form components)
**Files to Create:** 6+ component files

#### 2.1 Core DataTable
- [ ] `components/tables/DataTable.tsx`
  - Generic, reusable data table
  - Uses @tanstack/react-table v8
  - Column definitions via props
  - Row selection (single/multiple)
  - Expandable rows
  - Sticky header
  - Responsive (horizontal scroll on mobile)
  - Empty state
  - Loading state (skeleton)

#### 2.2 Table Features
- [ ] `components/tables/TablePagination.tsx`
  - Page size selector (10, 25, 50, 100)
  - Page number input
  - Previous/Next buttons
  - First/Last page buttons
  - Total items count
  - Current page info

- [ ] `components/tables/TableSort.tsx`
  - Column header with sort indicators
  - Asc/Desc/None states
  - Visual sort direction icons
  - Multi-column sort support

- [ ] `components/tables/TableFilters.tsx`
  - Filter panel (collapsible)
  - Filter by column
  - Multiple filter types:
    - Text search
    - Date range
    - Number range
    - Select from options
    - Boolean (yes/no)
  - Clear all filters button
  - Active filter count badge

- [ ] `components/tables/TableSearch.tsx`
  - Global search across all columns
  - Debounced input
  - Clear button
  - Search icon
  - "Search..." placeholder

- [ ] `components/tables/BulkActions.tsx`
  - Appears when rows selected
  - Action buttons (Delete, Export, etc.)
  - Selected count display
  - Select all toggle
  - Deselect all button

#### 2.3 Table Utilities
- [ ] `components/tables/TableSkeleton.tsx`
  - Loading skeleton for tables
  - Configurable rows/columns
  - Shimmer effect

- [ ] `components/tables/EmptyState.tsx`
  - Empty table state
  - Icon + message
  - Optional action button (e.g., "Create First Item")

**Deliverables:**
- Complete DataTable system
- Can be used for all list pages (bookings, clients, hotels, etc.)
- Fully typed with TypeScript generics
- Server-side pagination support
- Client-side pagination support
- Example usage documentation

**Dependencies to Install:**
```bash
npm install @tanstack/react-table
```

**Usage Example:**
```typescript
<DataTable
  data={bookings}
  columns={bookingColumns}
  pagination={{ pageSize: 25, totalItems: 1000 }}
  onPageChange={handlePageChange}
  onSort={handleSort}
  filters={<BookingFilters />}
  bulkActions={<BookingBulkActions />}
/>
```

---

### Task 3: Feedback Components (Priority: MEDIUM)
**Duration:** Day 3-4
**Dependencies:** None (toast already exists)
**Files to Create:** 8+ component files

#### 3.1 Dialog Components
- [ ] `components/ui/alert-dialog.tsx` (may already exist from shadcn/ui)
  - Verify or create
  - Confirm/Cancel pattern
  - Danger variant (for delete confirmations)

- [ ] `components/ui/confirm-dialog.tsx`
  - Reusable confirm dialog
  - Custom title, message, confirm text, cancel text
  - Async confirm handler
  - Loading state during confirm

#### 3.2 Loading States
- [ ] `components/ui/loading-spinner.tsx`
  - Small, medium, large sizes
  - Primary, secondary colors
  - Inline and block variants

- [ ] `components/ui/progress.tsx` (may already exist)
  - Linear progress bar
  - Percentage display
  - Indeterminate mode

- [ ] `components/ui/skeleton.tsx` (may already exist)
  - Loading placeholder
  - Various shapes (text, circle, rectangle)
  - Shimmer animation

#### 3.3 Status & Messages
- [ ] `components/ui/alert.tsx` (may already exist)
  - Success, Error, Warning, Info variants
  - Dismissible
  - Icon support
  - Action button support

- [ ] `components/ui/badge.tsx` (may already exist)
  - Status badges (Active, Pending, Cancelled, etc.)
  - Color variants
  - Sizes (sm, md, lg)
  - Removable badges

- [ ] `components/ui/empty-state.tsx`
  - Generic empty state component
  - Icon, title, description, action button
  - Used in tables, lists, search results

#### 3.4 Special Pages
- [ ] `app/not-found.tsx`
  - 404 page
  - Friendly message
  - Back to dashboard button
  - Search suggestion

- [ ] `components/ui/error-boundary.tsx`
  - React error boundary component
  - Fallback UI for errors
  - Error reporting (optional)

**Deliverables:**
- Complete feedback component set
- Consistent error handling UX
- Loading states for all async operations
- User-friendly empty states

---

### Task 4: Card Components (Priority: MEDIUM)
**Duration:** Day 4-5
**Dependencies:** None
**Files to Create:** 5+ component files

#### 4.1 Dashboard Cards
- [ ] `components/ui/card.tsx` (base - may exist from shadcn/ui)
  - Verify base card component exists

- [ ] `components/features/dashboard/StatCard.tsx`
  - Metric display (number + label)
  - Trend indicator (up/down arrow)
  - Percentage change
  - Icon support
  - Color variants
  - Loading state

- [ ] `components/features/dashboard/ChartCard.tsx`
  - Card wrapper for charts
  - Title, subtitle
  - Time period selector
  - Export button
  - Responsive

#### 4.2 Content Cards
- [ ] `components/ui/info-card.tsx`
  - Information display card
  - Title, description, metadata
  - Optional image/icon
  - Action buttons

- [ ] `components/ui/list-card.tsx`
  - List of items in card format
  - Avatar/icon for each item
  - Metadata display
  - Click/hover states

- [ ] `components/ui/action-card.tsx`
  - Call-to-action card
  - Icon, title, description
  - Primary action button
  - Used for empty states, onboarding

**Deliverables:**
- Complete card component library
- Dashboard-ready stat cards
- Reusable across all modules

---

### Task 5: Install Required Dependencies
**Duration:** 30 minutes
**Priority:** CRITICAL (do first)

Install all required packages:

```bash
cd frontend

# Form components
npm install react-day-picker date-fns
npm install libphonenumber-js
npm install @tiptap/react @tiptap/starter-kit

# Table components
npm install @tanstack/react-table

# Chart components (for ChartCard)
npm install recharts

# Utilities
npm install react-hot-toast  # If not already installed
```

---

### Task 6: Update Sidebar Navigation
**Duration:** 1 hour
**Priority:** LOW

Update sidebar to include all dashboard routes we created:

- [ ] Add navigation items for all modules in `components/layout/Sidebar.tsx`:
  - Bookings
  - Clients (already exists)
  - Partners (B2B clients)
  - Quotations
  - Hotels
  - Vehicles
  - Tours
  - Suppliers
  - Payments
  - Documents
  - Settings (already exists)

---

## Execution Strategy

### Day 1 (Form Components - Part 1)
1. Install all dependencies
2. Create Date & Time components (DatePicker, DateRangePicker, TimePicker)
3. Create specialized inputs (CurrencyInput, PhoneInput)
4. Test components in isolation

### Day 2 (Form Components - Part 2 + DataTable Start)
1. Create file upload components
2. Create RichTextEditor, MultiSelect, AutoComplete
3. Create FormField wrapper
4. Start DataTable core component

### Day 3 (DataTable - Complete)
1. Complete DataTable component
2. Create TablePagination, TableSort
3. Create TableFilters, TableSearch
4. Create BulkActions
5. Create TableSkeleton, EmptyState
6. Test with mock data

### Day 4 (Feedback Components)
1. Create/verify dialog components
2. Create loading components (Spinner, Progress, Skeleton)
3. Create alert, badge, empty-state components
4. Create 404 page and error boundary

### Day 5 (Card Components + Documentation)
1. Create StatCard, ChartCard
2. Create InfoCard, ListCard, ActionCard
3. Update sidebar navigation
4. Document all components
5. Create usage examples
6. Test all components

---

## Quality Checklist

Each component must have:
- [ ] TypeScript types for all props
- [ ] PropTypes or Zod validation
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states (where applicable)
- [ ] Error states (where applicable)
- [ ] Empty states (where applicable)
- [ ] Consistent styling with Tailwind + shadcn/ui
- [ ] JSDoc comments
- [ ] Usage example in file comments

---

## Testing Strategy

For each component:
1. **Visual Testing**: Verify appearance in browser
2. **Interaction Testing**: Test clicks, hovers, focus states
3. **Responsive Testing**: Test on mobile, tablet, desktop
4. **Accessibility Testing**: Tab navigation, screen reader
5. **Edge Cases**: Empty data, long text, special characters

---

## Documentation Requirements

Create for each major component category:

1. **Component README** (optional for complex components)
   - Purpose
   - Props interface
   - Usage examples
   - Variants

2. **Usage Examples**
   - Code snippets in file comments
   - Real-world usage scenarios

---

## Success Criteria

Phase 2 is complete when:
- ✅ All 30+ components created and working
- ✅ DataTable fully functional with all features
- ✅ All dependencies installed
- ✅ Components are type-safe
- ✅ Components are accessible
- ✅ Components are responsive
- ✅ Sidebar navigation updated
- ✅ All components documented
- ✅ Ready to use in Phase 3 (Dashboard) and beyond

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dependency conflicts | Medium | Test each package after install |
| Browser compatibility | Medium | Test in Chrome, Firefox, Safari |
| Performance issues in DataTable | High | Use virtualization for large datasets |
| Accessibility gaps | Medium | Use shadcn/ui patterns which are accessible |
| Time overrun | Low | Prioritize critical components first |

---

## Next Phase Preview

**Phase 3: Dashboard & Analytics**
- Will use StatCard, ChartCard from Phase 2
- Will use DataTable for recent activities
- Will integrate charts with Recharts
- Will connect to real API endpoints

---

## Agent Instructions

Execute tasks in order:
1. Install dependencies first
2. Create components one by one
3. Test each component after creation
4. Commit after completing each major task
5. Report progress and any issues
6. Ask for clarification if requirements unclear

**IMPORTANT:**
- Follow TypeScript best practices
- Use existing shadcn/ui components where available
- Match the design system (Tailwind + shadcn/ui)
- Ensure all components are accessible
- Test responsiveness on all screen sizes
- Reference the database schema and API docs where needed

---

**Phase 2 Plan Ready for Execution!**
