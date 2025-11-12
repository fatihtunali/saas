# Phase 5: Services Management System
## Comprehensive Task-Based Implementation Plan

**Version:** 1.0
**Created:** 2025-11-11
**Total Estimated Hours:** 260.5 hours
**Timeline:** 18-22 working days (with 2-3 agents in parallel)
**Priority:** HIGH (Core Booking Functionality Dependency)

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema Reference](#database-schema-reference)
4. [Foundation Tasks (Week 1)](#foundation-tasks-week-1)
5. [Module 1: Hotels Management](#module-1-hotels-management)
6. [Module 2: Vehicles Management](#module-2-vehicles-management)
7. [Module 3: Guides Management](#module-3-guides-management)
8. [Module 4: Restaurants Management](#module-4-restaurants-management)
9. [Module 5: Entrance Fees Management](#module-5-entrance-fees-management)
10. [Module 6: Extra Expenses Management](#module-6-extra-expenses-management)
11. [Module 7: Suppliers Management](#module-7-suppliers-management)
12. [Integration & Testing](#integration-testing)
13. [Quality Gates](#quality-gates)
14. [Implementation Strategy](#implementation-strategy)
15. [File Structure](#file-structure)

---

## Phase Overview

### Objectives

Phase 5 implements comprehensive service management for the Tour Operations CRM, enabling tour operators to manage all service types used in bookings:

- **Hotels**: Accommodation inventory with per-person pricing
- **Vehicles**: Fleet management for transfers and rentals
- **Guides**: Tour guide profiles with language and expertise
- **Restaurants**: Meal reservations and catering
- **Entrance Fees**: Museum, site, and attraction tickets
- **Extra Expenses**: Miscellaneous costs and add-ons
- **Suppliers**: Third-party service provider management

### Key Features

- Multi-tenant architecture with operator_id isolation
- Soft delete pattern (deleted_at timestamp)
- Full CRUD operations for all service types
- Advanced search, filtering, and pagination
- Bulk operations (import, export, activate/deactivate)
- Service availability tracking
- Pricing management with currency support
- Integration with booking wizard (Phase 4)
- Comprehensive validation and error handling
- Responsive UI with accessibility (WCAG AA)

### Success Criteria

- ✅ All 7 service modules fully functional
- ✅ Backend APIs with >80% test coverage
- ✅ Frontend components with zero accessibility violations
- ✅ Multi-tenant isolation verified
- ✅ Integration with booking wizard working
- ✅ Performance: <200ms API response, <3s page load
- ✅ Mobile responsive (320px+)
- ✅ Production build with zero errors/warnings

---

## Technical Architecture

### Stack

**Frontend:**
- Next.js 14.2 App Router
- TypeScript 5.3 (Strict Mode)
- React Hook Form + Zod validation
- TanStack React Table v8
- shadcn/ui components
- Tailwind CSS (Tourism theme)

**Backend:**
- Express.js 5.1
- PostgreSQL 16
- JWT authentication
- Multer (file uploads)
- Winston (logging)

### Design Patterns

1. **Template Pattern**: Hotels module serves as template for all other modules
2. **Repository Pattern**: Separate data access layer for each service
3. **Factory Pattern**: Service-specific form/table configurations
4. **Observer Pattern**: Real-time status updates
5. **Strategy Pattern**: Different pricing strategies per service type

### API Conventions

**Base URL:** `http://localhost:3001/api`

**Standard Endpoints:**
```
GET    /api/{service}              - List (paginated, filtered)
POST   /api/{service}              - Create
GET    /api/{service}/:id          - Read single
PUT    /api/{service}/:id          - Update
DELETE /api/{service}/:id          - Soft delete
PATCH  /api/{service}/:id/activate - Activate
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (searches name/description)
- `city_id` (filter by city)
- `status` (Active, Inactive)
- `sort_by` (field name)
- `sort_order` (asc, desc)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Error Format:**
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "email": "Invalid email format"
  }
}
```

---

## Database Schema Reference

### Common Fields (All Service Tables)

```sql
id                SERIAL PRIMARY KEY
operator_id       INTEGER NOT NULL (multi-tenant FK)
created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
deleted_at        TIMESTAMP NULL (soft delete)
is_active         BOOLEAN DEFAULT true
```

### Service-Specific Tables

#### 1. hotels
```sql
hotel_name              VARCHAR(255) NOT NULL
city_id                 INTEGER NOT NULL (FK to cities)
address                 TEXT
star_rating             INTEGER (1-5)
contact_person          VARCHAR(255)
contact_phone           VARCHAR(50)
contact_email           VARCHAR(255)
check_in_time           TIME
check_out_time          TIME
facilities              TEXT[] (array of amenities)
currency                VARCHAR(3) DEFAULT 'TRY'
single_room_price       DECIMAL(10,2)
double_room_price       DECIMAL(10,2)
triple_room_price       DECIMAL(10,2)
quad_room_price         DECIMAL(10,2)
extra_bed_price         DECIMAL(10,2)
child_discount_percent  DECIMAL(5,2)
website_url             VARCHAR(255)
booking_notes           TEXT
```

#### 2. vehicles
```sql
vehicle_type           VARCHAR(100) NOT NULL (Car, Van, Bus, Minibus)
brand                  VARCHAR(100)
model                  VARCHAR(100)
year                   INTEGER
license_plate          VARCHAR(50) UNIQUE
capacity               INTEGER NOT NULL
driver_name            VARCHAR(255)
driver_phone           VARCHAR(50)
fuel_type              VARCHAR(50) (Diesel, Petrol, Electric, Hybrid)
color                  VARCHAR(50)
is_available           BOOLEAN DEFAULT true
insurance_expiry       DATE
last_maintenance_date  DATE
next_maintenance_date  DATE
daily_rate             DECIMAL(10,2)
hourly_rate            DECIMAL(10,2)
per_km_rate            DECIMAL(10,2)
currency               VARCHAR(3) DEFAULT 'TRY'
notes                  TEXT
```

#### 3. guides
```sql
guide_name             VARCHAR(255) NOT NULL
languages              TEXT[] (array of language codes)
city_id                INTEGER NOT NULL (FK to cities)
phone                  VARCHAR(50)
email                  VARCHAR(255)
specializations        TEXT[] (Historical, Nature, Food, etc.)
license_number         VARCHAR(100)
license_expiry_date    DATE
years_of_experience    INTEGER
bio                    TEXT
is_available           BOOLEAN DEFAULT true
full_day_rate          DECIMAL(10,2)
half_day_rate          DECIMAL(10,2)
night_rate             DECIMAL(10,2)
transfer_rate          DECIMAL(10,2)
currency               VARCHAR(3) DEFAULT 'TRY'
rating                 DECIMAL(3,2) (0.00-5.00)
total_tours            INTEGER DEFAULT 0
```

#### 4. restaurants
```sql
restaurant_name        VARCHAR(255) NOT NULL
city_id                INTEGER NOT NULL (FK to cities)
address                TEXT
cuisine_type           TEXT[] (Turkish, Italian, Seafood, etc.)
contact_person         VARCHAR(255)
contact_phone          VARCHAR(50)
contact_email          VARCHAR(255)
capacity               INTEGER
opening_hours          TEXT
closing_hours          TEXT
price_range            VARCHAR(50) ($, $$, $$$, $$$$)
menu_url               VARCHAR(255)
lunch_price_per_person DECIMAL(10,2)
dinner_price_per_person DECIMAL(10,2)
currency               VARCHAR(3) DEFAULT 'TRY'
special_notes          TEXT
rating                 DECIMAL(3,2) (0.00-5.00)
```

#### 5. entrance_fees
```sql
site_name              VARCHAR(255) NOT NULL
city_id                INTEGER NOT NULL (FK to cities)
address                TEXT
fee_type               VARCHAR(100) (Museum, Park, Monument, etc.)
description            TEXT
opening_time           TIME
closing_time           TIME
closed_days            TEXT[] (Monday, Tuesday, etc.)
adult_price            DECIMAL(10,2)
child_price            DECIMAL(10,2)
student_price          DECIMAL(10,2)
senior_price           DECIMAL(10,2)
group_discount_percent DECIMAL(5,2)
currency               VARCHAR(3) DEFAULT 'TRY'
website_url            VARCHAR(255)
booking_required       BOOLEAN DEFAULT false
advance_booking_days   INTEGER
```

#### 6. tour_companies
```sql
company_name           VARCHAR(255) NOT NULL
city_id                INTEGER NOT NULL (FK to cities)
contact_person         VARCHAR(255)
contact_phone          VARCHAR(50)
contact_email          VARCHAR(255)
address                TEXT
tour_types             TEXT[] (City Tour, Day Trip, Multi-day, etc.)
languages_offered      TEXT[]
website_url            VARCHAR(255)
license_number         VARCHAR(100)
is_partner             BOOLEAN DEFAULT false
commission_rate        DECIMAL(5,2)
payment_terms          TEXT
sic_tour_price         DECIMAL(10,2) (Seat-in-Coach)
private_tour_price     DECIMAL(10,2)
currency               VARCHAR(3) DEFAULT 'TRY'
rating                 DECIMAL(3,2) (0.00-5.00)
```

#### 7. extra_expenses
```sql
expense_name           VARCHAR(255) NOT NULL
expense_category       VARCHAR(100) (Visa, Insurance, Tips, etc.)
description            TEXT
unit_price             DECIMAL(10,2)
currency               VARCHAR(3) DEFAULT 'TRY'
is_taxable             BOOLEAN DEFAULT true
tax_rate               DECIMAL(5,2)
applies_to             VARCHAR(50) (Per Person, Per Group, Per Day)
```

#### 8. cities (Pre-populated)
```sql
id                     SERIAL PRIMARY KEY
city_name              VARCHAR(255) NOT NULL
country_code           VARCHAR(3) DEFAULT 'TR'
region                 VARCHAR(100)
timezone               VARCHAR(50)
is_active              BOOLEAN DEFAULT true
```

**Pre-populated Turkish Cities:**
Istanbul, Ankara, Izmir, Antalya, Bursa, Adana, Gaziantep, Konya, Mersin, Kayseri, Eskişehir, Diyarbakır, Samsun, Denizli, Trabzon

---

## Foundation Tasks (Week 1)

**Total: 27 hours**
**Dependencies:** None
**Priority:** HIGHEST (Required by all modules)

### Task 5.8.1: Cities API Endpoint

**Agent:** Backend
**Hours:** 2
**Priority:** P0 (Blocking)

**Files to Create:**
```
backend/routes/cities.js
backend/controllers/citiesController.js
```

**Implementation:**

**File: backend/routes/cities.js**
```javascript
const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/citiesController');
const authMiddleware = require('../middleware/auth');

// GET /api/cities - List all cities (no pagination needed)
router.get('/', authMiddleware, citiesController.getCities);

module.exports = router;
```

**File: backend/controllers/citiesController.js**
```javascript
const db = require('../config/database');

exports.getCities = async (req, res) => {
  try {
    const query = `
      SELECT id, city_name, country_code, region, timezone
      FROM cities
      WHERE is_active = true
      ORDER BY city_name ASC
    `;

    const result = await db.query(query);

    res.json({
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};
```

**Register Route in backend/server.js:**
```javascript
const citiesRouter = require('./routes/cities');
app.use('/api/cities', citiesRouter);
```

**Testing:**
```bash
# Test endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/cities
```

**Acceptance Criteria:**
- ✅ Returns all 15 Turkish cities
- ✅ Only active cities returned
- ✅ Sorted alphabetically
- ✅ 401 if not authenticated
- ✅ Responds in <50ms

---

### Task 5.8.2: Shared UI Components

**Agent:** Frontend
**Hours:** 8
**Priority:** P0 (Blocking)

**Files to Create:**
```
frontend/src/components/shared/CitySelector.tsx
frontend/src/components/shared/CurrencyInput.tsx
frontend/src/components/shared/StatusBadge.tsx
frontend/src/components/shared/RatingDisplay.tsx
frontend/src/components/shared/ConfirmDialog.tsx
frontend/src/components/shared/ImageUploader.tsx
```

#### Component 1: CitySelector

**File: frontend/src/components/shared/CitySelector.tsx**
```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { City } from '@/types/services';
import { api } from '@/lib/api-client';

interface CitySelectorProps {
  value?: number;
  onChange: (cityId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function CitySelector({
  value,
  onChange,
  placeholder = 'Select city',
  disabled = false,
  error,
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cities');
        setCities(response.data.data);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="space-y-1">
      <Select
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={disabled || loading}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={loading ? 'Loading cities...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id.toString()}>
              {city.city_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

#### Component 2: CurrencyInput

**File: frontend/src/components/shared/CurrencyInput.tsx**
```typescript
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencyInputProps {
  label: string;
  amount: number | string;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange?: (currency: string) => void;
  currencyOptions?: string[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

const DEFAULT_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export function CurrencyInput({
  label,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  currencyOptions = DEFAULT_CURRENCIES,
  disabled = false,
  error,
  required = false,
}: CurrencyInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    onAmountChange(parseFloat(value) || 0);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          disabled={disabled}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
        />
        {onCurrencyChange ? (
          <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="w-24 flex items-center justify-center border rounded-md bg-muted">
            <span className="text-sm font-medium">{currency}</span>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

#### Component 3: StatusBadge

**File: frontend/src/components/shared/StatusBadge.tsx**
```typescript
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

type Status = 'Active' | 'Inactive' | 'Pending' | 'Warning';

interface StatusBadgeProps {
  status: Status | string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<Status, { icon: React.ReactNode; variant: string; label: string }> = {
  Active: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'default',
    label: 'Active',
  },
  Inactive: {
    icon: <XCircle className="h-3 w-3" />,
    variant: 'secondary',
    label: 'Inactive',
  },
  Pending: {
    icon: <Clock className="h-3 w-3" />,
    variant: 'outline',
    label: 'Pending',
  },
  Warning: {
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: 'destructive',
    label: 'Warning',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || statusConfig.Inactive;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge className={`${sizeClasses[size]} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
```

#### Component 4: RatingDisplay

**File: frontend/src/components/shared/RatingDisplay.tsx**
```typescript
import { Star, StarHalf } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const starSize = sizeClasses[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${starSize} fill-accent text-accent`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${starSize} fill-accent text-accent`} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-muted-foreground`} />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

#### Component 5: ConfirmDialog

**File: frontend/src/components/shared/ConfirmDialog.tsx**
```typescript
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### Component 6: ImageUploader

**File: frontend/src/components/shared/ImageUploader.tsx**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload an image.');
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, acceptedTypes, onChange]
  );

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
          />
        </label>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ All 6 components render without errors
- ✅ CitySelector fetches and displays cities
- ✅ CurrencyInput handles numeric input with formatting
- ✅ StatusBadge shows correct colors and icons
- ✅ RatingDisplay shows accurate star ratings
- ✅ ConfirmDialog handles user confirmation
- ✅ ImageUploader validates and previews images
- ✅ All components are accessible (keyboard navigation, ARIA labels)

---

### Task 5.8.3: Shared Utilities

**Agent:** Frontend
**Hours:** 4
**Priority:** P0 (Blocking)

**Files to Create:**
```
frontend/src/lib/utils/formatters.ts
frontend/src/lib/utils/exports.ts
frontend/src/lib/utils/query-builder.ts
frontend/src/lib/utils/api-error-handler.ts
```

#### Utility 1: Formatters

**File: frontend/src/lib/utils/formatters.ts**
```typescript
/**
 * Format currency with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date with locale
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  }[format];

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string, countryCode: string = '+90'): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `${countryCode} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
```

#### Utility 2: Data Export

**File: frontend/src/lib/utils/exports.ts**
```typescript
/**
 * Export data to CSV
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
): void {
  // Create CSV header
  const header = columns.map((col) => col.label).join(',');

  // Create CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export data to JSON
 */
export function exportToJson<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

#### Utility 3: Query Builder

**File: frontend/src/lib/utils/query-builder.ts**
```typescript
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Build URL query string from params
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}
```

#### Utility 4: API Error Handler

**File: frontend/src/lib/utils/api-error-handler.ts**
```typescript
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ApiError {
  error: string;
  details?: Record<string, string>;
  message?: string;
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    // Handle validation errors
    if (apiError?.details) {
      const errorMessages = Object.values(apiError.details);
      const message = errorMessages.join(', ');
      toast.error('Validation Error', { description: message });
      return message;
    }

    // Handle general API errors
    if (apiError?.error || apiError?.message) {
      const message = apiError.error || apiError.message || 'An error occurred';
      toast.error('Error', { description: message });
      return message;
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      const message = 'Network error. Please check your connection.';
      toast.error('Connection Error', { description: message });
      return message;
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      const message = 'Request timeout. Please try again.';
      toast.error('Timeout', { description: message });
      return message;
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const message = 'Session expired. Please log in again.';
      toast.error('Unauthorized', { description: message });
      // Redirect to login
      window.location.href = '/login';
      return message;
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const message = 'You do not have permission to perform this action.';
      toast.error('Forbidden', { description: message });
      return message;
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const message = 'Resource not found.';
      toast.error('Not Found', { description: message });
      return message;
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      const message = 'Server error. Please try again later.';
      toast.error('Server Error', { description: message });
      return message;
    }
  }

  // Handle unknown errors
  const message = 'An unexpected error occurred.';
  toast.error('Error', { description: message });
  return message;
}

/**
 * Extract error message without showing toast
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    if (apiError?.details) {
      return Object.values(apiError.details).join(', ');
    }

    if (apiError?.error || apiError?.message) {
      return apiError.error || apiError.message || 'An error occurred';
    }

    if (error.response?.status) {
      return `Error: ${error.response.status} ${error.response.statusText}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

**Acceptance Criteria:**
- ✅ Formatters handle all data types correctly
- ✅ Export functions generate valid CSV/JSON files
- ✅ Query builder creates valid URL query strings
- ✅ Error handler shows user-friendly messages
- ✅ All utilities have TypeScript type safety

---

### Task 5.8.4: Services Layout & Navigation

**Agent:** Frontend
**Hours:** 6
**Priority:** P1

**Files to Create:**
```
frontend/src/app/(dashboard)/dashboard/services/layout.tsx
frontend/src/app/(dashboard)/dashboard/services/page.tsx
```

**Implementation:**

**File: frontend/src/app/(dashboard)/dashboard/services/layout.tsx**
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const servicesNav = [
  {
    title: 'Hotels',
    href: '/dashboard/services/hotels',
    icon: Hotel,
    description: 'Manage accommodation inventory',
  },
  {
    title: 'Vehicles',
    href: '/dashboard/services/vehicles',
    icon: Car,
    description: 'Fleet management and rentals',
  },
  {
    title: 'Guides',
    href: '/dashboard/services/guides',
    icon: User,
    description: 'Tour guide profiles',
  },
  {
    title: 'Restaurants',
    href: '/dashboard/services/restaurants',
    icon: UtensilsCrossed,
    description: 'Dining and catering',
  },
  {
    title: 'Entrance Fees',
    href: '/dashboard/services/entrance-fees',
    icon: Ticket,
    description: 'Museums and attractions',
  },
  {
    title: 'Extra Expenses',
    href: '/dashboard/services/extras',
    icon: Package,
    description: 'Additional costs',
  },
  {
    title: 'Suppliers',
    href: '/dashboard/services/suppliers',
    icon: Building2,
    description: 'Service providers',
  },
];

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Services Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all service types for your bookings
          </p>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-1">
            {servicesNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div
                      className={cn(
                        'text-xs',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
```

**File: frontend/src/app/(dashboard)/dashboard/services/page.tsx**
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Building2,
  ArrowRight,
} from 'lucide-react';

const services = [
  {
    title: 'Hotels',
    description: 'Manage hotel inventory, room types, and pricing',
    icon: Hotel,
    href: '/dashboard/services/hotels',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Vehicles',
    description: 'Manage vehicle fleet for transfers and rentals',
    icon: Car,
    href: '/dashboard/services/vehicles',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Guides',
    description: 'Manage tour guide profiles and availability',
    icon: User,
    href: '/dashboard/services/guides',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Restaurants',
    description: 'Manage restaurant reservations and meal plans',
    icon: UtensilsCrossed,
    href: '/dashboard/services/restaurants',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Entrance Fees',
    description: 'Manage entrance fees for museums and attractions',
    icon: Ticket,
    href: '/dashboard/services/entrance-fees',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Extra Expenses',
    description: 'Manage additional costs and miscellaneous items',
    icon: Package,
    href: '/dashboard/services/extras',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Suppliers',
    description: 'Manage third-party service providers',
    icon: Building2,
    href: '/dashboard/services/suppliers',
    stats: { total: 0, active: 0 },
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all service types available for your tour bookings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <Card key={service.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={service.href}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold ml-1">{service.stats.total}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-semibold ml-1">{service.stats.active}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

**Update Dashboard Navigation:**

**File: frontend/src/components/layout/DashboardNav.tsx** (Add Services link)
```typescript
{
  title: 'Services',
  href: '/dashboard/services',
  icon: Package,
},
```

**Acceptance Criteria:**
- ✅ Services dashboard page renders
- ✅ All 7 service modules displayed as cards
- ✅ Sidebar navigation works
- ✅ Active state highlighting correct
- ✅ Responsive layout (mobile/tablet/desktop)
- ✅ Accessible keyboard navigation

---

### Task 5.8.5: API Client Base Setup

**Agent:** Frontend
**Hours:** 3
**Priority:** P1

**Files to Create:**
```
frontend/src/lib/api-client.ts (update)
frontend/src/types/services.ts
```

**File: frontend/src/lib/api-client.ts** (Add services endpoints)
```typescript
// ... existing code ...

// Cities
export const citiesApi = {
  getAll: () => api.get<{ data: City[] }>('/cities'),
};

// Hotels
export const hotelsApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<Hotel>>(`/hotels${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Hotel }>(`/hotels/${id}`),
  create: (data: CreateHotelDto) => api.post<{ data: Hotel }>('/hotels', data),
  update: (id: number, data: UpdateHotelDto) => api.put<{ data: Hotel }>(`/hotels/${id}`, data),
  delete: (id: number) => api.delete(`/hotels/${id}`),
  activate: (id: number) => api.patch(`/hotels/${id}/activate`),
};

// Vehicles
export const vehiclesApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<Vehicle>>(`/vehicles${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Vehicle }>(`/vehicles/${id}`),
  create: (data: CreateVehicleDto) => api.post<{ data: Vehicle }>('/vehicles', data),
  update: (id: number, data: UpdateVehicleDto) => api.put<{ data: Vehicle }>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  activate: (id: number) => api.patch(`/vehicles/${id}/activate`),
};

// Guides
export const guidesApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<Guide>>(`/guides${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Guide }>(`/guides/${id}`),
  create: (data: CreateGuideDto) => api.post<{ data: Guide }>('/guides', data),
  update: (id: number, data: UpdateGuideDto) => api.put<{ data: Guide }>(`/guides/${id}`, data),
  delete: (id: number) => api.delete(`/guides/${id}`),
  activate: (id: number) => api.patch(`/guides/${id}/activate`),
};

// Restaurants
export const restaurantsApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<Restaurant>>(`/restaurants${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Restaurant }>(`/restaurants/${id}`),
  create: (data: CreateRestaurantDto) => api.post<{ data: Restaurant }>('/restaurants', data),
  update: (id: number, data: UpdateRestaurantDto) => api.put<{ data: Restaurant }>(`/restaurants/${id}`, data),
  delete: (id: number) => api.delete(`/restaurants/${id}`),
  activate: (id: number) => api.patch(`/restaurants/${id}/activate`),
};

// Entrance Fees
export const entranceFeesApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<EntranceFee>>(`/entrance-fees${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: EntranceFee }>(`/entrance-fees/${id}`),
  create: (data: CreateEntranceFeeDto) => api.post<{ data: EntranceFee }>('/entrance-fees', data),
  update: (id: number, data: UpdateEntranceFeeDto) => api.put<{ data: EntranceFee }>(`/entrance-fees/${id}`, data),
  delete: (id: number) => api.delete(`/entrance-fees/${id}`),
  activate: (id: number) => api.patch(`/entrance-fees/${id}/activate`),
};

// Extra Expenses
export const extrasApi = {
  getAll: (params?: QueryParams) => api.get<PaginatedResponse<ExtraExpense>>(`/extra-expenses${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: ExtraExpense }>(`/extra-expenses/${id}`),
  create: (data: CreateExtraExpenseDto) => api.post<{ data: ExtraExpense }>('/extra-expenses', data),
  update: (id: number, data: UpdateExtraExpenseDto) => api.put<{ data: ExtraExpense }>(`/extra-expenses/${id}`, data),
  delete: (id: number) => api.delete(`/extra-expenses/${id}`),
  activate: (id: number) => api.patch(`/extra-expenses/${id}/activate`),
};
```

**File: frontend/src/types/services.ts**
```typescript
// Common Types
export interface City {
  id: number;
  city_name: string;
  country_code: string;
  region: string;
  timezone: string;
  is_active: boolean;
}

export interface BaseService {
  id: number;
  operator_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Hotel Types
export interface Hotel extends BaseService {
  hotel_name: string;
  city_id: number;
  city?: City;
  address: string | null;
  star_rating: number | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  facilities: string[];
  currency: string;
  single_room_price: number;
  double_room_price: number;
  triple_room_price: number;
  quad_room_price: number;
  extra_bed_price: number;
  child_discount_percent: number;
  website_url: string | null;
  booking_notes: string | null;
}

export interface CreateHotelDto {
  hotel_name: string;
  city_id: number;
  address?: string;
  star_rating?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  check_in_time?: string;
  check_out_time?: string;
  facilities?: string[];
  currency?: string;
  single_room_price: number;
  double_room_price: number;
  triple_room_price: number;
  quad_room_price: number;
  extra_bed_price: number;
  child_discount_percent?: number;
  website_url?: string;
  booking_notes?: string;
}

export type UpdateHotelDto = Partial<CreateHotelDto>;

// Vehicle Types
export interface Vehicle extends BaseService {
  vehicle_type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  capacity: number;
  driver_name: string | null;
  driver_phone: string | null;
  fuel_type: string | null;
  color: string | null;
  is_available: boolean;
  insurance_expiry: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  daily_rate: number;
  hourly_rate: number;
  per_km_rate: number;
  currency: string;
  notes: string | null;
}

export interface CreateVehicleDto {
  vehicle_type: string;
  brand?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  capacity: number;
  driver_name?: string;
  driver_phone?: string;
  fuel_type?: string;
  color?: string;
  is_available?: boolean;
  insurance_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  daily_rate: number;
  hourly_rate: number;
  per_km_rate: number;
  currency?: string;
  notes?: string;
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>;

// Guide Types
export interface Guide extends BaseService {
  guide_name: string;
  languages: string[];
  city_id: number;
  city?: City;
  phone: string | null;
  email: string | null;
  specializations: string[];
  license_number: string | null;
  license_expiry_date: string | null;
  years_of_experience: number | null;
  bio: string | null;
  is_available: boolean;
  full_day_rate: number;
  half_day_rate: number;
  night_rate: number;
  transfer_rate: number;
  currency: string;
  rating: number;
  total_tours: number;
}

export interface CreateGuideDto {
  guide_name: string;
  languages: string[];
  city_id: number;
  phone?: string;
  email?: string;
  specializations?: string[];
  license_number?: string;
  license_expiry_date?: string;
  years_of_experience?: number;
  bio?: string;
  is_available?: boolean;
  full_day_rate: number;
  half_day_rate: number;
  night_rate: number;
  transfer_rate: number;
  currency?: string;
  rating?: number;
  total_tours?: number;
}

export type UpdateGuideDto = Partial<CreateGuideDto>;

// Restaurant Types
export interface Restaurant extends BaseService {
  restaurant_name: string;
  city_id: number;
  city?: City;
  address: string | null;
  cuisine_type: string[];
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  capacity: number | null;
  opening_hours: string | null;
  closing_hours: string | null;
  price_range: string | null;
  menu_url: string | null;
  lunch_price_per_person: number;
  dinner_price_per_person: number;
  currency: string;
  special_notes: string | null;
  rating: number;
}

export interface CreateRestaurantDto {
  restaurant_name: string;
  city_id: number;
  address?: string;
  cuisine_type?: string[];
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  capacity?: number;
  opening_hours?: string;
  closing_hours?: string;
  price_range?: string;
  menu_url?: string;
  lunch_price_per_person: number;
  dinner_price_per_person: number;
  currency?: string;
  special_notes?: string;
  rating?: number;
}

export type UpdateRestaurantDto = Partial<CreateRestaurantDto>;

// Entrance Fee Types
export interface EntranceFee extends BaseService {
  site_name: string;
  city_id: number;
  city?: City;
  address: string | null;
  fee_type: string | null;
  description: string | null;
  opening_time: string | null;
  closing_time: string | null;
  closed_days: string[];
  adult_price: number;
  child_price: number;
  student_price: number;
  senior_price: number;
  group_discount_percent: number;
  currency: string;
  website_url: string | null;
  booking_required: boolean;
  advance_booking_days: number | null;
}

export interface CreateEntranceFeeDto {
  site_name: string;
  city_id: number;
  address?: string;
  fee_type?: string;
  description?: string;
  opening_time?: string;
  closing_time?: string;
  closed_days?: string[];
  adult_price: number;
  child_price: number;
  student_price?: number;
  senior_price?: number;
  group_discount_percent?: number;
  currency?: string;
  website_url?: string;
  booking_required?: boolean;
  advance_booking_days?: number;
}

export type UpdateEntranceFeeDto = Partial<CreateEntranceFeeDto>;

// Extra Expense Types
export interface ExtraExpense extends BaseService {
  expense_name: string;
  expense_category: string | null;
  description: string | null;
  unit_price: number;
  currency: string;
  is_taxable: boolean;
  tax_rate: number;
  applies_to: string | null;
}

export interface CreateExtraExpenseDto {
  expense_name: string;
  expense_category?: string;
  description?: string;
  unit_price: number;
  currency?: string;
  is_taxable?: boolean;
  tax_rate?: number;
  applies_to?: string;
}

export type UpdateExtraExpenseDto = Partial<CreateExtraExpenseDto>;

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  city_id?: number;
  status?: 'Active' | 'Inactive';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Acceptance Criteria:**
- ✅ All API client methods typed correctly
- ✅ TypeScript interfaces match database schema
- ✅ DTOs for create/update operations defined
- ✅ Query builder integrated
- ✅ Zero TypeScript errors

---

### Task 5.8.6: State Management Setup

**Agent:** Frontend
**Hours:** 4
**Priority:** P1

**Files to Create:**
```
frontend/src/hooks/use-hotels.ts
frontend/src/hooks/use-vehicles.ts
frontend/src/hooks/use-guides.ts
frontend/src/hooks/use-restaurants.ts
frontend/src/hooks/use-entrance-fees.ts
frontend/src/hooks/use-extras.ts
```

**Template Hook (use-hotels.ts):**

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api-client';
import { Hotel, CreateHotelDto, UpdateHotelDto, QueryParams } from '@/types/services';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

export function useHotels(params?: QueryParams) {
  const queryClient = useQueryClient();

  // List hotels
  const {
    data: hotels,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hotels', params],
    queryFn: async () => {
      const response = await hotelsApi.getAll(params);
      return response.data;
    },
  });

  // Get single hotel
  const useHotel = (id: number) => {
    return useQuery({
      queryKey: ['hotels', id],
      queryFn: async () => {
        const response = await hotelsApi.getById(id);
        return response.data.data;
      },
      enabled: !!id,
    });
  };

  // Create hotel
  const createMutation = useMutation({
    mutationFn: (data: CreateHotelDto) => hotelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel created successfully');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Update hotel
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHotelDto }) =>
      hotelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel updated successfully');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Delete hotel
  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel deleted successfully');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Activate hotel
  const activateMutation = useMutation({
    mutationFn: (id: number) => hotelsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel status updated');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  return {
    hotels: hotels?.data || [],
    pagination: hotels?.pagination,
    isLoading,
    error,
    refetch,
    useHotel,
    createHotel: createMutation.mutateAsync,
    updateHotel: updateMutation.mutateAsync,
    deleteHotel: deleteMutation.mutateAsync,
    activateHotel: activateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

**(Repeat similar pattern for use-vehicles.ts, use-guides.ts, use-restaurants.ts, use-entrance-fees.ts, use-extras.ts)**

**Acceptance Criteria:**
- ✅ All hooks follow consistent pattern
- ✅ React Query caching configured
- ✅ Mutations invalidate queries correctly
- ✅ Toast notifications on success/error
- ✅ Loading states tracked
- ✅ TypeScript types enforced

---

## Module 1: Hotels Management

**Total: 33 hours**
**Dependencies:** Foundation Tasks (5.8.1-5.8.6)
**Priority:** HIGHEST (Template Module)

**Note:** This module serves as the template for all other service modules. Complete and test thoroughly before proceeding to other modules.

### Task 5.1.1: Backend API - List & Filters

**Agent:** Backend
**Hours:** 4
**Priority:** P0

**Files to Create:**
```
backend/routes/hotels.js
backend/controllers/hotelsController.js
backend/middleware/validation.js (update)
```

**Implementation:**

**File: backend/routes/hotels.js**
```javascript
const express = require('express');
const router = express.Router();
const hotelsController = require('../controllers/hotelsController');
const authMiddleware = require('../middleware/auth');
const { validateHotel } = require('../middleware/validation');

// List hotels (with pagination, search, filters)
router.get('/', authMiddleware, hotelsController.getHotels);

// Get single hotel
router.get('/:id', authMiddleware, hotelsController.getHotelById);

// Create hotel
router.post('/', authMiddleware, validateHotel, hotelsController.createHotel);

// Update hotel
router.put('/:id', authMiddleware, validateHotel, hotelsController.updateHotel);

// Soft delete hotel
router.delete('/:id', authMiddleware, hotelsController.deleteHotel);

// Activate/deactivate hotel
router.patch('/:id/activate', authMiddleware, hotelsController.toggleHotelStatus);

module.exports = router;
```

**File: backend/controllers/hotelsController.js**
```javascript
const db = require('../config/database');

// GET /api/hotels - List hotels with filters
exports.getHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      city_id,
      status,
      star_rating,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    const operator_id = req.user.operator_id;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = ['operator_id = $1', 'deleted_at IS NULL'];
    let queryParams = [operator_id];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(hotel_name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (city_id) {
      whereConditions.push(`city_id = $${paramIndex}`);
      queryParams.push(city_id);
      paramIndex++;
    }

    if (status) {
      const isActive = status === 'Active';
      whereConditions.push(`is_active = $${paramIndex}`);
      queryParams.push(isActive);
      paramIndex++;
    }

    if (star_rating) {
      whereConditions.push(`star_rating = $${paramIndex}`);
      queryParams.push(star_rating);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total
    const countQuery = `SELECT COUNT(*) FROM hotels WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const dataQuery = `
      SELECT
        h.*,
        c.city_name,
        c.country_code
      FROM hotels h
      LEFT JOIN cities c ON h.city_id = c.id
      WHERE ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const dataResult = await db.query(dataQuery, queryParams);

    res.json({
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

// GET /api/hotels/:id - Get single hotel
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const operator_id = req.user.operator_id;

    const query = `
      SELECT
        h.*,
        c.city_name,
        c.country_code
      FROM hotels h
      LEFT JOIN cities c ON h.city_id = c.id
      WHERE h.id = $1 AND h.operator_id = $2 AND h.deleted_at IS NULL
    `;

    const result = await db.query(query, [id, operator_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

// POST /api/hotels - Create hotel
exports.createHotel = async (req, res) => {
  try {
    const operator_id = req.user.operator_id;
    const hotelData = req.body;

    const query = `
      INSERT INTO hotels (
        operator_id, hotel_name, city_id, address, star_rating,
        contact_person, contact_phone, contact_email,
        check_in_time, check_out_time, facilities, currency,
        single_room_price, double_room_price, triple_room_price,
        quad_room_price, extra_bed_price, child_discount_percent,
        website_url, booking_notes, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *
    `;

    const values = [
      operator_id,
      hotelData.hotel_name,
      hotelData.city_id,
      hotelData.address || null,
      hotelData.star_rating || null,
      hotelData.contact_person || null,
      hotelData.contact_phone || null,
      hotelData.contact_email || null,
      hotelData.check_in_time || null,
      hotelData.check_out_time || null,
      hotelData.facilities || [],
      hotelData.currency || 'TRY',
      hotelData.single_room_price,
      hotelData.double_room_price,
      hotelData.triple_room_price,
      hotelData.quad_room_price,
      hotelData.extra_bed_price,
      hotelData.child_discount_percent || 0,
      hotelData.website_url || null,
      hotelData.booking_notes || null,
      hotelData.is_active !== undefined ? hotelData.is_active : true,
    ];

    const result = await db.query(query, values);

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

// PUT /api/hotels/:id - Update hotel
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const operator_id = req.user.operator_id;
    const hotelData = req.body;

    // Check ownership
    const checkQuery = `
      SELECT id FROM hotels
      WHERE id = $1 AND operator_id = $2 AND deleted_at IS NULL
    `;
    const checkResult = await db.query(checkQuery, [id, operator_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const query = `
      UPDATE hotels SET
        hotel_name = $1,
        city_id = $2,
        address = $3,
        star_rating = $4,
        contact_person = $5,
        contact_phone = $6,
        contact_email = $7,
        check_in_time = $8,
        check_out_time = $9,
        facilities = $10,
        currency = $11,
        single_room_price = $12,
        double_room_price = $13,
        triple_room_price = $14,
        quad_room_price = $15,
        extra_bed_price = $16,
        child_discount_percent = $17,
        website_url = $18,
        booking_notes = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *
    `;

    const values = [
      hotelData.hotel_name,
      hotelData.city_id,
      hotelData.address || null,
      hotelData.star_rating || null,
      hotelData.contact_person || null,
      hotelData.contact_phone || null,
      hotelData.contact_email || null,
      hotelData.check_in_time || null,
      hotelData.check_out_time || null,
      hotelData.facilities || [],
      hotelData.currency || 'TRY',
      hotelData.single_room_price,
      hotelData.double_room_price,
      hotelData.triple_room_price,
      hotelData.quad_room_price,
      hotelData.extra_bed_price,
      hotelData.child_discount_percent || 0,
      hotelData.website_url || null,
      hotelData.booking_notes || null,
      id,
    ];

    const result = await db.query(query, values);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

// DELETE /api/hotels/:id - Soft delete
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const operator_id = req.user.operator_id;

    const query = `
      UPDATE hotels
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND operator_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await db.query(query, [id, operator_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};

// PATCH /api/hotels/:id/activate - Toggle status
exports.toggleHotelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const operator_id = req.user.operator_id;

    const query = `
      UPDATE hotels
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND operator_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await db.query(query, [id, operator_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error toggling hotel status:', error);
    res.status(500).json({ error: 'Failed to update hotel status' });
  }
};
```

**Register Route in backend/server.js:**
```javascript
const hotelsRouter = require('./routes/hotels');
app.use('/api/hotels', hotelsRouter);
```

**Testing:**
```bash
# Test list endpoint
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/hotels?page=1&limit=20"

# Test create
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"hotel_name":"Test Hotel","city_id":1,"single_room_price":100,"double_room_price":150,"triple_room_price":200,"quad_room_price":250,"extra_bed_price":50}' \
  http://localhost:3001/api/hotels
```

**Acceptance Criteria:**
- ✅ List endpoint returns paginated results
- ✅ Search filters hotel_name and address
- ✅ City, status, star rating filters work
- ✅ Sorting works correctly
- ✅ Multi-tenant isolation enforced (operator_id)
- ✅ Soft delete working (deleted_at)
- ✅ 401 if not authenticated
- ✅ 404 if hotel not found
- ✅ Response time <200ms

---

### Task 5.1.2: Backend API - CRUD Operations

**Agent:** Backend
**Hours:** 5
**Status:** ✅ COMPLETED (in Task 5.1.1)

All CRUD operations (Create, Read, Update, Delete, Activate) were implemented in Task 5.1.1.

---

### Task 5.1.3: Types & Validation Schemas

**Agent:** Frontend
**Hours:** 2
**Priority:** P0

**Files to Create:**
```
frontend/src/lib/validations/hotels.ts
```

**File: frontend/src/lib/validations/hotels.ts**
```typescript
import { z } from 'zod';

/**
 * Hotel Validation Schema
 */
export const hotelSchema = z.object({
  hotel_name: z.string().min(2, 'Hotel name must be at least 2 characters').max(255, 'Hotel name is too long'),

  city_id: z.number({
    message: 'City is required',
  }).positive('Please select a city'),

  address: z.string().optional(),

  star_rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').optional().nullable(),

  contact_person: z.string().max(255, 'Contact person name is too long').optional(),

  contact_phone: z.string().max(50, 'Phone number is too long').optional(),

  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),

  check_in_time: z.string().optional(),

  check_out_time: z.string().optional(),

  facilities: z.array(z.string()).optional().default([]),

  currency: z.string().length(3, 'Currency must be 3 characters (e.g., TRY, USD)').default('TRY'),

  single_room_price: z.number({
    message: 'Single room price is required',
  }).min(0, 'Price must be positive'),

  double_room_price: z.number({
    message: 'Double room price is required',
  }).min(0, 'Price must be positive'),

  triple_room_price: z.number({
    message: 'Triple room price is required',
  }).min(0, 'Price must be positive'),

  quad_room_price: z.number({
    message: 'Quad room price is required',
  }).min(0, 'Price must be positive'),

  extra_bed_price: z.number({
    message: 'Extra bed price is required',
  }).min(0, 'Price must be positive'),

  child_discount_percent: z.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%').default(0),

  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),

  booking_notes: z.string().optional(),

  is_active: z.boolean().default(true),
}).refine((data) => {
  // Validate check-out time is after check-in time
  if (data.check_in_time && data.check_out_time) {
    return data.check_out_time > data.check_in_time;
  }
  return true;
}, {
  message: 'Check-out time must be after check-in time',
  path: ['check_out_time'],
});

export type HotelFormData = z.infer<typeof hotelSchema>;

// Default form values
export const defaultHotelValues: Partial<HotelFormData> = {
  currency: 'TRY',
  facilities: [],
  child_discount_percent: 0,
  is_active: true,
  check_in_time: '14:00',
  check_out_time: '12:00',
  single_room_price: 0,
  double_room_price: 0,
  triple_room_price: 0,
  quad_room_price: 0,
  extra_bed_price: 0,
};

// Common hotel facilities
export const HOTEL_FACILITIES = [
  'WiFi',
  'Parking',
  'Swimming Pool',
  'Gym',
  'Spa',
  'Restaurant',
  'Bar',
  'Room Service',
  'Airport Shuttle',
  'Breakfast Included',
  'Pet Friendly',
  'Air Conditioning',
  'Laundry Service',
  'Conference Room',
  'Business Center',
];

// Star ratings
export const STAR_RATINGS = [1, 2, 3, 4, 5];
```

**Acceptance Criteria:**
- ✅ Zod schema validates all hotel fields
- ✅ TypeScript types inferred from schema
- ✅ Default values provided
- ✅ Constants for facilities and ratings exported
- ✅ Cross-field validation (check-in/check-out times)
- ✅ Zero TypeScript errors

---

### Task 5.1.4: Hotels List Page with DataTable

**Agent:** Frontend
**Hours:** 6
**Priority:** P0

**Files to Create:**
```
frontend/src/app/(dashboard)/dashboard/services/hotels/page.tsx
frontend/src/components/services/hotels/HotelsTable.tsx
frontend/src/components/services/hotels/HotelsFilters.tsx
```

**Implementation:**

**File: frontend/src/app/(dashboard)/dashboard/services/hotels/page.tsx**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotelsTable } from '@/components/services/hotels/HotelsTable';
import { HotelsFilters } from '@/components/services/hotels/HotelsFilters';
import { useHotels } from '@/hooks/use-hotels';
import { QueryParams } from '@/types/services';

export default function HotelsPage() {
  const router = useRouter();
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 20,
  });

  const { hotels, pagination, isLoading, refetch } = useHotels(queryParams);

  const handleFilterChange = (filters: Partial<QueryParams>) => {
    setQueryParams((prev) => ({ ...prev, ...filters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="text-muted-foreground mt-2">
            Manage hotel inventory and room pricing
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/services/hotels/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      <HotelsFilters onFilterChange={handleFilterChange} />

      <HotelsTable
        data={hotels}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onRefresh={refetch}
      />
    </div>
  );
}
```

**File: frontend/src/components/services/hotels/HotelsFilters.tsx**
```typescript
'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CitySelector } from '@/components/shared/CitySelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QueryParams } from '@/types/services';

interface HotelsFiltersProps {
  onFilterChange: (filters: Partial<QueryParams>) => void;
}

export function HotelsFilters({ onFilterChange }: HotelsFiltersProps) {
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [starRating, setStarRating] = useState<string>();

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      city_id: cityId,
      status: status as 'Active' | 'Inactive' | undefined,
      star_rating: starRating ? parseInt(starRating) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCityId(undefined);
    setStatus(undefined);
    setStarRating(undefined);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>

        <CitySelector
          value={cityId}
          onChange={setCityId}
          placeholder="All cities"
        />

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={starRating} onValueChange={setStarRating}>
          <SelectTrigger>
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Star</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
```

**File: frontend/src/components/services/hotels/HotelsTable.tsx**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  Star,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useHotels } from '@/hooks/use-hotels';
import { Hotel } from '@/types/services';
import { formatCurrency } from '@/lib/utils/formatters';

interface HotelsTableProps {
  data: Hotel[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function HotelsTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onRefresh,
}: HotelsTableProps) {
  const router = useRouter();
  const { deleteHotel, activateHotel } = useHotels();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleDelete = async () => {
    if (selectedHotel) {
      await deleteHotel(selectedHotel.id);
      setDeleteDialogOpen(false);
      onRefresh();
    }
  };

  const handleToggleStatus = async (hotel: Hotel) => {
    await activateHotel(hotel.id);
    onRefresh();
  };

  const columns: ColumnDef<Hotel>[] = [
    {
      accessorKey: 'hotel_name',
      header: 'Hotel Name',
      cell: ({ row }) => {
        const hotel = row.original;
        return (
          <div>
            <div className="font-medium">{hotel.hotel_name}</div>
            {hotel.star_rating && (
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city?.city_name || 'N/A',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.address || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'pricing',
      header: 'Room Prices',
      cell: ({ row }) => {
        const hotel = row.original;
        return (
          <div className="text-sm">
            <div>SGL: {formatCurrency(hotel.single_room_price, hotel.currency)}</div>
            <div>DBL: {formatCurrency(hotel.double_room_price, hotel.currency)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact',
      cell: ({ row }) => {
        const hotel = row.original;
        return (
          <div className="text-sm">
            {hotel.contact_person && <div>{hotel.contact_person}</div>}
            {hotel.contact_phone && <div className="text-muted-foreground">{hotel.contact_phone}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_active ? 'Active' : 'Inactive'} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const hotel = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/services/hotels/${hotel.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/services/hotels/${hotel.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(hotel)}>
                <Power className="h-4 w-4 mr-2" />
                {hotel.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedHotel(hotel);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading hotels...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hotels found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} hotels
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Hotel"
        description={`Are you sure you want to delete "${selectedHotel?.hotel_name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
```

**Acceptance Criteria:**
- ✅ Hotels list page renders with DataTable
- ✅ Pagination working (previous/next buttons)
- ✅ Filters apply correctly (search, city, status, star rating)
- ✅ Actions dropdown shows all options
- ✅ Delete confirmation dialog works
- ✅ Status toggle updates immediately
- ✅ Loading state displayed
- ✅ Empty state when no hotels
- ✅ Responsive layout
- ✅ Accessible keyboard navigation

---

### Task 5.1.5: Hotel Create Form

**Agent:** Frontend
**Hours:** 8
**Priority:** P0

**Files to Create:**
```
frontend/src/app/(dashboard)/dashboard/services/hotels/create/page.tsx
frontend/src/components/services/hotels/HotelForm.tsx
```

**File: frontend/src/app/(dashboard)/dashboard/services/hotels/create/page.tsx**
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotelForm } from '@/components/services/hotels/HotelForm';
import { useHotels } from '@/hooks/use-hotels';
import { HotelFormData } from '@/lib/validations/hotels';

export default function CreateHotelPage() {
  const router = useRouter();
  const { createHotel, isCreating } = useHotels();

  const handleSubmit = async (data: HotelFormData) => {
    await createHotel(data);
    router.push('/dashboard/services/hotels');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Hotel</h1>
          <p className="text-muted-foreground mt-2">
            Add a new hotel to your inventory
          </p>
        </div>
      </div>

      <HotelForm onSubmit={handleSubmit} isSubmitting={isCreating} />
    </div>
  );
}
```

**File: frontend/src/components/services/hotels/HotelForm.tsx**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CitySelector } from '@/components/shared/CitySelector';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  hotelSchema,
  HotelFormData,
  defaultHotelValues,
  HOTEL_FACILITIES,
  STAR_RATINGS,
} from '@/lib/validations/hotels';
import { Hotel } from '@/types/services';

interface HotelFormProps {
  hotel?: Hotel;
  onSubmit: (data: HotelFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function HotelForm({ hotel, onSubmit, isSubmitting }: HotelFormProps) {
  const form = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: hotel
      ? {
          hotel_name: hotel.hotel_name,
          city_id: hotel.city_id,
          address: hotel.address || '',
          star_rating: hotel.star_rating || undefined,
          contact_person: hotel.contact_person || '',
          contact_phone: hotel.contact_phone || '',
          contact_email: hotel.contact_email || '',
          check_in_time: hotel.check_in_time || '14:00',
          check_out_time: hotel.check_out_time || '12:00',
          facilities: hotel.facilities || [],
          currency: hotel.currency || 'TRY',
          single_room_price: hotel.single_room_price,
          double_room_price: hotel.double_room_price,
          triple_room_price: hotel.triple_room_price,
          quad_room_price: hotel.quad_room_price,
          extra_bed_price: hotel.extra_bed_price,
          child_discount_percent: hotel.child_discount_percent || 0,
          website_url: hotel.website_url || '',
          booking_notes: hotel.booking_notes || '',
          is_active: hotel.is_active,
        }
      : defaultHotelValues,
  });

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hotel_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Grand Hotel Istanbul" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <CitySelector
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.city_id?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main Street, Sultanahmet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="star_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Star Rating</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAR_RATINGS.map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hotel-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+90 212 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@hotel.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Check-in/Check-out */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in & Check-out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="check_in_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_out_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Room Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="single_room_price"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Single Room Price *"
                      amount={field.value}
                      currency={form.watch('currency')}
                      onAmountChange={field.onChange}
                      error={form.formState.errors.single_room_price?.message}
                      required
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="double_room_price"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Double Room Price *"
                      amount={field.value}
                      currency={form.watch('currency')}
                      onAmountChange={field.onChange}
                      error={form.formState.errors.double_room_price?.message}
                      required
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triple_room_price"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Triple Room Price *"
                      amount={field.value}
                      currency={form.watch('currency')}
                      onAmountChange={field.onChange}
                      error={form.formState.errors.triple_room_price?.message}
                      required
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quad_room_price"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Quad Room Price *"
                      amount={field.value}
                      currency={form.watch('currency')}
                      onAmountChange={field.onChange}
                      error={form.formState.errors.quad_room_price?.message}
                      required
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extra_bed_price"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Extra Bed Price *"
                      amount={field.value}
                      currency={form.watch('currency')}
                      onAmountChange={field.onChange}
                      error={form.formState.errors.extra_bed_price?.message}
                      required
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="child_discount_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Percentage discount for children</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="facilities"
              render={() => (
                <FormItem>
                  <div className="grid gap-3 md:grid-cols-3">
                    {HOTEL_FACILITIES.map((facility) => (
                      <FormField
                        key={facility}
                        control={form.control}
                        name="facilities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={facility}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(facility)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), facility])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== facility
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {facility}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="booking_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special booking instructions, requirements, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Make this hotel available for bookings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {hotel ? 'Update Hotel' : 'Create Hotel'}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Acceptance Criteria:**
- ✅ Form renders with all fields
- ✅ Validation working (required fields, formats)
- ✅ CitySelector populates from API
- ✅ Currency selector updates price inputs
- ✅ Facilities checkboxes work
- ✅ Time pickers validate check-out > check-in
- ✅ Form submission creates hotel
- ✅ Success toast shown
- ✅ Redirects to list page after success
- ✅ Loading state during submission
- ✅ Error messages displayed
- ✅ Accessible form (labels, ARIA)

---

### Task 5.1.6: Hotel Edit Form

**Agent:** Frontend
**Hours:** 3
**Priority:** P1

**Files to Create:**
```
frontend/src/app/(dashboard)/dashboard/services/hotels/[id]/edit/page.tsx
```

**File: frontend/src/app/(dashboard)/dashboard/services/hotels/[id]/edit/page.tsx**
```typescript
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotelForm } from '@/components/services/hotels/HotelForm';
import { useHotels } from '@/hooks/use-hotels';
import { HotelFormData } from '@/lib/validations/hotels';

export default function EditHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = parseInt(params.id as string);

  const { useHotel, updateHotel, isUpdating } = useHotels();
  const { data: hotel, isLoading } = useHotel(hotelId);

  const handleSubmit = async (data: HotelFormData) => {
    await updateHotel({ id: hotelId, data });
    router.push('/dashboard/services/hotels');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Hotel not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
          <p className="text-muted-foreground mt-2">
            Update hotel information for {hotel.hotel_name}
          </p>
        </div>
      </div>

      <HotelForm hotel={hotel} onSubmit={handleSubmit} isSubmitting={isUpdating} />
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Form loads with existing hotel data
- ✅ All fields pre-populated
- ✅ Loading state while fetching hotel
- ✅ 404 handling if hotel not found
- ✅ Update mutation works
- ✅ Success toast shown
- ✅ Redirects to list page after update
- ✅ Validation still applies

---

### Task 5.1.7: Hotel Details Page

**Agent:** Frontend
**Hours:** 5
**Priority:** P1

**Files to Create:**
```
frontend/src/app/(dashboard)/dashboard/services/hotels/[id]/page.tsx
```

**File: frontend/src/app/(dashboard)/dashboard/services/hotels/[id]/page.tsx**
```typescript
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Power, Star, MapPin, Phone, Mail, Globe, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useHotels } from '@/hooks/use-hotels';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useState } from 'react';

export default function HotelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = parseInt(params.id as string);

  const { useHotel, deleteHotel, activateHotel } = useHotels();
  const { data: hotel, isLoading, refetch } = useHotel(hotelId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteHotel(hotelId);
    router.push('/dashboard/services/hotels');
  };

  const handleToggleStatus = async () => {
    await activateHotel(hotelId);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Hotel not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{hotel.hotel_name}</h1>
              <StatusBadge status={hotel.is_active ? 'Active' : 'Inactive'} />
            </div>
            {hotel.star_rating && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/dashboard/services/hotels/${hotelId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleToggleStatus}>
            <Power className="h-4 w-4 mr-2" />
            {hotel.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">City</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{hotel.city?.city_name || 'N/A'}</p>
              </div>
            </div>

            {hotel.address && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{hotel.address}</p>
              </div>
            )}

            {hotel.website_url && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={hotel.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {hotel.website_url}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {hotel.contact_person && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{hotel.contact_person}</p>
              </div>
            )}

            {hotel.contact_phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${hotel.contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  {hotel.contact_phone}
                </a>
              </div>
            )}

            {hotel.contact_email && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${hotel.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  {hotel.contact_email}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Check-in & Check-out */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in & Check-out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{hotel.check_in_time || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Check-out Time</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{hotel.check_out_time || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Room Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Single Room</p>
              <p className="text-2xl font-bold">{formatCurrency(hotel.single_room_price, hotel.currency)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Double Room</p>
              <p className="text-2xl font-bold">{formatCurrency(hotel.double_room_price, hotel.currency)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Triple Room</p>
              <p className="text-2xl font-bold">{formatCurrency(hotel.triple_room_price, hotel.currency)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quad Room</p>
              <p className="text-2xl font-bold">{formatCurrency(hotel.quad_room_price, hotel.currency)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Extra Bed</p>
              <p className="text-2xl font-bold">{formatCurrency(hotel.extra_bed_price, hotel.currency)}</p>
            </div>

            {hotel.child_discount_percent > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Child Discount</p>
                <p className="text-2xl font-bold">{hotel.child_discount_percent}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Facilities */}
      {hotel.facilities && hotel.facilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((facility) => (
                <Badge key={facility} variant="secondary">
                  {facility}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Notes */}
      {hotel.booking_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{hotel.booking_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(hotel.created_at, 'long')}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(hotel.updated_at, 'long')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Hotel"
        description={`Are you sure you want to delete "${hotel.hotel_name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Details page renders with all hotel information
- ✅ Loading state while fetching
- ✅ 404 handling if hotel not found
- ✅ Star rating displayed
- ✅ Status badge shown
- ✅ Contact links (phone, email, website) work
- ✅ Room prices formatted with currency
- ✅ Facilities displayed as badges
- ✅ Edit button navigates to edit page
- ✅ Delete confirmation works
- ✅ Status toggle works
- ✅ Responsive layout

---

### Task 5.1.8: Integration Testing

**Agent:** Backend + Frontend
**Hours:** 3
**Priority:** P2

**Test Coverage:**

1. **Backend API Tests** (backend/tests/hotels.test.js)
2. **Frontend Component Tests** (frontend/src/components/services/hotels/__tests__)
3. **E2E Flow Tests** (frontend/e2e/hotels.spec.ts)

**Acceptance Criteria:**
- ✅ Backend API endpoints >80% coverage
- ✅ All CRUD operations tested
- ✅ Multi-tenant isolation verified
- ✅ Validation errors tested
- ✅ Frontend components render correctly
- ✅ Form validation tested
- ✅ E2E flow: create → edit → delete works
- ✅ Zero console errors
- ✅ Accessibility audit passed (WCAG AA)

---

## Module 2: Vehicles Management

**Total: 27 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** HIGH

**(Following Hotels template pattern with vehicle-specific fields)**

### Task 5.2.1: Backend API - List & Filters (4h)
### Task 5.2.2: Backend API - CRUD Operations (5h)
### Task 5.2.3: Types & Validation Schemas (2h)
### Task 5.2.4: Vehicles List Page with DataTable (5h)
### Task 5.2.5: Vehicle Create Form (6h)
### Task 5.2.6: Vehicle Edit Form (2h)
### Task 5.2.7: Vehicle Details Page (4h)
### Task 5.2.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Vehicle-specific fields: `license_plate`, `capacity`, `driver_name`, `fuel_type`
- Maintenance tracking: `insurance_expiry`, `last_maintenance_date`, `next_maintenance_date`
- Availability flag: `is_available`
- Pricing: `daily_rate`, `hourly_rate`, `per_km_rate`
- No city dependency

---

## Module 3: Guides Management

**Total: 29 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** HIGH

### Task 5.3.1: Backend API - List & Filters (4h)
### Task 5.3.2: Backend API - CRUD Operations (5h)
### Task 5.3.3: Types & Validation Schemas (3h)
### Task 5.3.4: Guides List Page with DataTable (5h)
### Task 5.3.5: Guide Create Form (7h)
### Task 5.3.6: Guide Edit Form (2h)
### Task 5.3.7: Guide Details Page (5h)
### Task 5.3.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Array fields: `languages[]`, `specializations[]`
- License tracking: `license_number`, `license_expiry_date`
- Performance metrics: `rating`, `total_tours`
- Multiple rate types: `full_day_rate`, `half_day_rate`, `night_rate`, `transfer_rate`
- Bio field for profile description

---

## Module 4: Restaurants Management

**Total: 25 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** MEDIUM

### Task 5.4.1: Backend API - List & Filters (4h)
### Task 5.4.2: Backend API - CRUD Operations (4h)
### Task 5.4.3: Types & Validation Schemas (2h)
### Task 5.4.4: Restaurants List Page with DataTable (5h)
### Task 5.4.5: Restaurant Create Form (6h)
### Task 5.4.6: Restaurant Edit Form (2h)
### Task 5.4.7: Restaurant Details Page (4h)
### Task 5.4.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Array field: `cuisine_type[]`
- Operating hours: `opening_hours`, `closing_hours`
- Capacity management
- Price range indicator ($, $$, $$$, $$$$)
- Meal pricing: `lunch_price_per_person`, `dinner_price_per_person`
- Menu URL field

---

## Module 5: Entrance Fees Management

**Total: 23 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** MEDIUM

### Task 5.5.1: Backend API - List & Filters (3h)
### Task 5.5.2: Backend API - CRUD Operations (4h)
### Task 5.5.3: Types & Validation Schemas (2h)
### Task 5.5.4: Entrance Fees List Page with DataTable (5h)
### Task 5.5.5: Entrance Fee Create Form (5h)
### Task 5.5.6: Entrance Fee Edit Form (2h)
### Task 5.5.7: Entrance Fee Details Page (4h)
### Task 5.5.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Multiple price tiers: `adult_price`, `child_price`, `student_price`, `senior_price`
- Group discount: `group_discount_percent`
- Operating hours: `opening_time`, `closing_time`
- Closed days array: `closed_days[]`
- Booking requirements: `booking_required`, `advance_booking_days`
- Site type: `fee_type`

---

## Module 6: Extra Expenses Management

**Total: 22.5 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** MEDIUM

### Task 5.6.1: Backend API - List & Filters (3h)
### Task 5.6.2: Backend API - CRUD Operations (3.5h)
### Task 5.6.3: Types & Validation Schemas (2h)
### Task 5.6.4: Extras List Page with DataTable (4h)
### Task 5.6.5: Extra Create Form (5h)
### Task 5.6.6: Extra Edit Form (2h)
### Task 5.6.7: Extra Details Page (3h)
### Task 5.6.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Simpler structure (no city dependency)
- Category field: `expense_category`
- Tax management: `is_taxable`, `tax_rate`
- Application scope: `applies_to` (Per Person, Per Group, Per Day)
- Single unit price

---

## Module 7: Suppliers Management

**Total: 23 hours**
**Dependencies:** Hotels Module (Template)
**Priority:** MEDIUM

### Task 5.7.1: Backend API - List & Filters (4h)
### Task 5.7.2: Backend API - CRUD Operations (4h)
### Task 5.7.3: Types & Validation Schemas (2h)
### Task 5.7.4: Suppliers List Page with DataTable (4h)
### Task 5.7.5: Supplier Create Form (5h)
### Task 5.7.6: Supplier Edit Form (2h)
### Task 5.7.7: Supplier Details Page (4h)
### Task 5.7.8: Integration Testing (3h)

**Key Differences from Hotels:**
- Service type arrays: `tour_types[]`, `languages_offered[]`
- Partnership status: `is_partner`
- Financial terms: `commission_rate`, `payment_terms`
- Multiple pricing: `sic_tour_price`, `private_tour_price`
- License tracking

---

## Integration & Testing

**Total: 18 hours**
**Priority:** HIGHEST (Final Phase)

### Task 5.9.1: Cross-Module Integration (6h)

**Agent:** Full Stack
**Priority:** P0

**Objectives:**
- Verify all 7 modules work together
- Test booking wizard integration (Phase 4 link)
- Ensure consistent UI/UX across modules
- Validate multi-tenant isolation
- Performance benchmarking

**Test Scenarios:**
1. Create one of each service type
2. Use services in booking creation
3. Edit multiple services in sequence
4. Delete services and verify cascade
5. Filter/search across all modules
6. Export data from all modules

**Acceptance Criteria:**
- ✅ All modules accessible from navigation
- ✅ No navigation errors
- ✅ Consistent styling across modules
- ✅ Data isolation verified
- ✅ Performance: <200ms API, <3s page load
- ✅ Zero console errors

---

### Task 5.9.2: E2E Test Suite (6h)

**Agent:** Frontend
**Priority:** P0

**Files to Create:**
```
frontend/e2e/services/hotels.spec.ts
frontend/e2e/services/vehicles.spec.ts
frontend/e2e/services/guides.spec.ts
frontend/e2e/services/restaurants.spec.ts
frontend/e2e/services/entrance-fees.spec.ts
frontend/e2e/services/extras.spec.ts
frontend/e2e/services/suppliers.spec.ts
frontend/e2e/services/integration.spec.ts
```

**Test Coverage:**
- Authentication flow
- Create, edit, delete for each module
- List filtering and pagination
- Form validation errors
- API error handling
- Mobile responsive layouts
- Keyboard navigation
- Screen reader compatibility

**Acceptance Criteria:**
- ✅ 100% E2E test pass rate
- ✅ Tests run in <5 minutes
- ✅ Coverage >90% of user flows
- ✅ Mobile tests passing
- ✅ Accessibility tests passing

---

### Task 5.9.3: Performance Optimization (4h)

**Agent:** Full Stack
**Priority:** P1

**Optimizations:**
1. **Backend:**
   - Database query optimization
   - Index creation for frequently queried fields
   - Query result caching (Redis)
   - Pagination optimization

2. **Frontend:**
   - Code splitting by route
   - Image lazy loading
   - Virtual scrolling for large lists
   - React Query cache configuration
   - Bundle size reduction

**Performance Targets:**
- API response time: <200ms (p95)
- Page load time: <3s (first contentful paint)
- Time to interactive: <5s
- Bundle size: <500KB (gzipped)
- Lighthouse score: >90

**Acceptance Criteria:**
- ✅ All performance targets met
- ✅ Lighthouse audit passed
- ✅ Bundle analysis completed
- ✅ Database indexes created
- ✅ Caching configured

---

### Task 5.9.4: Accessibility Audit (2h)

**Agent:** Frontend
**Priority:** P1

**Audit Checklist:**
- ✅ WCAG AA compliance
- ✅ Keyboard navigation for all actions
- ✅ Screen reader compatibility (NVDA, JAWS)
- ✅ Color contrast ratios >4.5:1
- ✅ Focus indicators visible
- ✅ ARIA labels on interactive elements
- ✅ Form error announcements
- ✅ Skip navigation links
- ✅ Heading hierarchy (h1 → h2 → h3)
- ✅ Alt text on images

**Tools:**
- axe DevTools
- WAVE extension
- Lighthouse accessibility audit
- NVDA screen reader testing

**Acceptance Criteria:**
- ✅ Zero critical accessibility violations
- ✅ Lighthouse accessibility score >95
- ✅ Screen reader test pass
- ✅ Keyboard navigation test pass
- ✅ Color contrast compliant

---

## Quality Gates

**Before Module Completion:**
- ✅ All acceptance criteria met
- ✅ Code review approved
- ✅ TypeScript strict mode passing
- ✅ ESLint zero errors
- ✅ Prettier formatting applied
- ✅ No console.log statements
- ✅ API documentation updated
- ✅ Component stories created (Storybook)

**Before Phase Sign-off:**
- ✅ All 7 modules complete
- ✅ Integration tests passing
- ✅ E2E tests passing (>90% coverage)
- ✅ Performance targets met
- ✅ Accessibility audit passed
- ✅ Security audit passed (no SQL injection, XSS, CSRF)
- ✅ Production build successful
- ✅ Database migrations applied
- ✅ API documentation complete
- ✅ User documentation created

---

## Implementation Strategy

### Team Allocation

**Backend Agent (1 person):**
- Week 1: Foundation + Hotels + Vehicles APIs
- Week 2: Guides + Restaurants + Entrance Fees APIs
- Week 3: Extras + Suppliers APIs + Integration
- Week 4: Testing + Optimization

**Frontend Agent 1 (1 person):**
- Week 1: Foundation + Hotels UI
- Week 2: Vehicles + Guides UI
- Week 3: Restaurants + Entrance Fees UI
- Week 4: Testing + Polish

**Frontend Agent 2 (1 person):**
- Week 1: Shared components + Services layout
- Week 2: Extras + Suppliers UI
- Week 3: Integration + E2E tests
- Week 4: Accessibility + Performance

### Parallel Execution Plan

**Week 1: Foundation & Hotels**
- Day 1-2: Cities API, Shared components (All)
- Day 3-4: Hotels backend (Backend), Hotels UI start (Frontend 1)
- Day 5: Hotels UI complete (Frontend 1), Services layout (Frontend 2)

**Week 2: Vehicles, Guides, Restaurants**
- Day 1-2: Vehicles complete (Backend + Frontend 1)
- Day 3-4: Guides complete (Backend + Frontend 1)
- Day 5: Restaurants backend (Backend), Extras UI (Frontend 2)

**Week 3: Entrance Fees, Extras, Suppliers**
- Day 1-2: Entrance Fees complete (Backend + Frontend 1)
- Day 3: Extras backend (Backend), Suppliers UI start (Frontend 2)
- Day 4-5: Suppliers complete (Backend + Frontend 2), Integration (Frontend 1)

**Week 4: Testing & Optimization**
- Day 1-2: E2E tests (All)
- Day 3: Performance optimization (Backend + Frontend 1)
- Day 4: Accessibility audit (Frontend 2)
- Day 5: Final QA + Documentation (All)

### Daily Standup Structure

**Questions:**
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers or dependencies?

**Focus:**
- Coordinate handoffs between backend/frontend
- Resolve blockers immediately
- Adjust timeline if needed

---

## File Structure

```
backend/
├── routes/
│   ├── cities.js
│   ├── hotels.js
│   ├── vehicles.js
│   ├── guides.js
│   ├── restaurants.js
│   ├── entrance-fees.js
│   ├── extra-expenses.js
│   └── suppliers.js
├── controllers/
│   ├── citiesController.js
│   ├── hotelsController.js
│   ├── vehiclesController.js
│   ├── guidesController.js
│   ├── restaurantsController.js
│   ├── entranceFeesController.js
│   ├── extraExpensesController.js
│   └── suppliersController.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── tests/
│   ├── hotels.test.js
│   ├── vehicles.test.js
│   ├── guides.test.js
│   ├── restaurants.test.js
│   ├── entrance-fees.test.js
│   ├── extras.test.js
│   └── suppliers.test.js
└── migrations/
    └── 005_create_services_tables.sql

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── dashboard/
│   │           └── services/
│   │               ├── layout.tsx
│   │               ├── page.tsx
│   │               ├── hotels/
│   │               │   ├── page.tsx
│   │               │   ├── create/
│   │               │   │   └── page.tsx
│   │               │   └── [id]/
│   │               │       ├── page.tsx
│   │               │       └── edit/
│   │               │           └── page.tsx
│   │               ├── vehicles/
│   │               │   └── [same structure]
│   │               ├── guides/
│   │               │   └── [same structure]
│   │               ├── restaurants/
│   │               │   └── [same structure]
│   │               ├── entrance-fees/
│   │               │   └── [same structure]
│   │               ├── extras/
│   │               │   └── [same structure]
│   │               └── suppliers/
│   │                   └── [same structure]
│   ├── components/
│   │   ├── shared/
│   │   │   ├── CitySelector.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── RatingDisplay.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── ImageUploader.tsx
│   │   └── services/
│   │       ├── hotels/
│   │       │   ├── HotelForm.tsx
│   │       │   ├── HotelsTable.tsx
│   │       │   └── HotelsFilters.tsx
│   │       ├── vehicles/
│   │       │   ├── VehicleForm.tsx
│   │       │   ├── VehiclesTable.tsx
│   │       │   └── VehiclesFilters.tsx
│   │       ├── guides/
│   │       │   ├── GuideForm.tsx
│   │       │   ├── GuidesTable.tsx
│   │       │   └── GuidesFilters.tsx
│   │       ├── restaurants/
│   │       │   ├── RestaurantForm.tsx
│   │       │   ├── RestaurantsTable.tsx
│   │       │   └── RestaurantsFilters.tsx
│   │       ├── entrance-fees/
│   │       │   ├── EntranceFeeForm.tsx
│   │       │   ├── EntranceFeesTable.tsx
│   │       │   └── EntranceFeesFilters.tsx
│   │       ├── extras/
│   │       │   ├── ExtraForm.tsx
│   │       │   ├── ExtrasTable.tsx
│   │       │   └── ExtrasFilters.tsx
│   │       └── suppliers/
│   │           ├── SupplierForm.tsx
│   │           ├── SuppliersTable.tsx
│   │           └── SuppliersFilters.tsx
│   ├── hooks/
│   │   ├── use-hotels.ts
│   │   ├── use-vehicles.ts
│   │   ├── use-guides.ts
│   │   ├── use-restaurants.ts
│   │   ├── use-entrance-fees.ts
│   │   ├── use-extras.ts
│   │   └── use-suppliers.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── validations/
│   │   │   ├── hotels.ts
│   │   │   ├── vehicles.ts
│   │   │   ├── guides.ts
│   │   │   ├── restaurants.ts
│   │   │   ├── entrance-fees.ts
│   │   │   ├── extras.ts
│   │   │   └── suppliers.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── exports.ts
│   │       ├── query-builder.ts
│   │       └── api-error-handler.ts
│   ├── types/
│   │   └── services.ts
│   └── e2e/
│       └── services/
│           ├── hotels.spec.ts
│           ├── vehicles.spec.ts
│           ├── guides.spec.ts
│           ├── restaurants.spec.ts
│           ├── entrance-fees.spec.ts
│           ├── extras.spec.ts
│           ├── suppliers.spec.ts
│           └── integration.spec.ts
```

**Total Files:** 147 files
**Total Lines of Code:** ~35,000 LOC

---

## Risk Mitigation

### Technical Risks

**Risk 1: Database Performance with Large Datasets**
- Mitigation: Create proper indexes, implement pagination, cache queries
- Contingency: Add database read replicas if needed

**Risk 2: Frontend Bundle Size**
- Mitigation: Code splitting, lazy loading, tree shaking
- Contingency: Migrate to micro-frontends if bundle exceeds 1MB

**Risk 3: Multi-tenant Data Leakage**
- Mitigation: Row-level security, operator_id in all queries, integration tests
- Contingency: Security audit by external team

### Timeline Risks

**Risk 1: Backend Delays Blocking Frontend**
- Mitigation: Mock APIs for frontend development
- Contingency: Frontend proceeds with mock data, integration later

**Risk 2: Scope Creep**
- Mitigation: Strict change control, no features outside scope
- Contingency: Move non-critical features to Phase 6

**Risk 3: Testing Takes Longer Than Expected**
- Mitigation: Start testing early, parallel testing with development
- Contingency: Extend timeline by 1 week if needed

---

## Success Metrics

### Quantitative Metrics

- ✅ 100% of planned features implemented
- ✅ >90% test coverage (backend + frontend)
- ✅ Zero critical bugs in production
- ✅ <200ms API response time (p95)
- ✅ <3s page load time
- ✅ >95 Lighthouse score
- ✅ Zero WCAG AA violations
- ✅ 100% E2E test pass rate

### Qualitative Metrics

- ✅ User feedback: "Easy to use"
- ✅ Developer feedback: "Code is maintainable"
- ✅ Stakeholder approval: Sign-off on demo
- ✅ Technical debt: <5% of codebase
- ✅ Documentation completeness: 100%

---

## Phase Completion Checklist

### Development
- ✅ All 7 service modules complete
- ✅ Foundation tasks complete
- ✅ Integration tasks complete
- ✅ No blocking bugs

### Testing
- ✅ Unit tests >80% coverage
- ✅ Integration tests passing
- ✅ E2E tests passing
- ✅ Performance tests passing
- ✅ Accessibility tests passing
- ✅ Security audit passed

### Documentation
- ✅ API documentation complete
- ✅ Component documentation (Storybook)
- ✅ User guide created
- ✅ Developer guide updated
- ✅ Deployment guide ready

### Deployment
- ✅ Production build successful
- ✅ Database migrations tested
- ✅ Environment variables configured
- ✅ Monitoring/logging configured
- ✅ Backup strategy defined

### Handoff
- ✅ Demo to stakeholders
- ✅ Training materials prepared
- ✅ Support documentation ready
- ✅ Known issues documented
- ✅ Phase 6 dependencies identified

---

## Appendix

### Technology Stack Reference

**Backend:**
- Node.js 20.x
- Express.js 5.1
- PostgreSQL 16
- JWT (jsonwebtoken)
- bcryptjs
- Multer
- Winston
- Jest (testing)

**Frontend:**
- Next.js 14.2 (App Router)
- TypeScript 5.3
- React 18
- React Hook Form
- Zod
- TanStack React Table v8
- TanStack React Query v5
- shadcn/ui
- Tailwind CSS 3.4
- Radix UI
- Lucide Icons
- Sonner (toasts)
- Playwright (E2E testing)
- Vitest (unit testing)

**DevOps:**
- Git
- ESLint
- Prettier
- Husky (git hooks)
- Docker (optional)

### Database Connection Strings

```bash
# Development
DATABASE_URL=postgresql://user:password@localhost:5432/tour_crm_dev

# Test
DATABASE_URL=postgresql://user:password@localhost:5432/tour_crm_test

# Production
DATABASE_URL=postgresql://user:password@prod-host:5432/tour_crm_prod
```

### Environment Variables

```bash
# Backend (.env)
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
LOG_LEVEL=info

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Tour Operations CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

**END OF PHASE 5 PLAN**

**Total Tasks:** 64 tasks across 8 modules
**Total Estimated Hours:** 260.5 hours
**Total Files to Create:** 147 files
**Estimated Timeline:** 18-22 working days (with 2-3 agents in parallel)

**Next Phase:** Phase 6 - Booking Management (Integration with Services)
