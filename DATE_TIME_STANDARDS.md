# Date and Time Format Standards

## 📅 Date Format: DD/MM/YYYY

**Format**: Day / Month / Year
**Example**: 15/11/2025

### Usage
- All date displays in UI
- Date input fields
- Reports and exports
- Vouchers and documents
- Email notifications

### Examples
```
Birth Date: 25/03/1990
Passport Expiry: 15/12/2030
Check-in Date: 20/11/2025
Check-out Date: 25/11/2025
```

---

## 🕐 Time Format: HH:MM (24-hour)

**Format**: Hours : Minutes (24-hour clock)
**Example**: 14:30 (not 2:30 PM)

### Usage
- All time displays
- Flight times
- Transfer pickup times
- Tour start times
- Restaurant reservations

### Examples
```
Flight Time: 14:30
Pickup Time: 09:00
Tour Start: 08:30
Restaurant: 19:00
Check-in: 15:00
```

---

## 📊 Database Storage

### PostgreSQL Data Types

```sql
-- For dates only
birth_date DATE                    -- Stores: 1990-03-25
passport_expiry DATE               -- Stores: 2030-12-15
travel_date DATE                   -- Stores: 2025-11-20

-- For date + time (timestamps)
created_at TIMESTAMP              -- Stores: 2025-11-10 14:30:00
updated_at TIMESTAMP              -- Stores: 2025-11-10 14:30:00
booking_datetime TIMESTAMP        -- Stores: 2025-11-20 09:00:00
```

### Storage Notes
- Database stores in ISO format (YYYY-MM-DD internally)
- Display format converts to DD/MM/YYYY in UI
- Always use UTC for timestamps
- Convert to local timezone for display if needed

---

## 💻 Frontend Implementation

### JavaScript/React Display

```javascript
// Date formatting function
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Time formatting function (24-hour)
function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// DateTime formatting
function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Examples
formatDate('2025-11-15')        // → "15/11/2025"
formatTime('2025-11-15 14:30')  // → "14:30"
formatDateTime('2025-11-15 14:30') // → "15/11/2025 14:30"
```

### Input Fields

```html
<!-- Date Input -->
<input type="date" id="date" />
<!-- Browser shows DD/MM/YYYY based on locale -->

<!-- Time Input (24-hour) -->
<input type="time" id="time" />
<!-- Shows 24-hour format -->

<!-- Manual Input with Validation -->
<input
  type="text"
  placeholder="DD/MM/YYYY"
  pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
/>
```

---

## 🔧 Backend Implementation

### Node.js Formatting

```javascript
// Parse DD/MM/YYYY to Date object
function parseDDMMYYYY(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}

// Format Date to DD/MM/YYYY
function formatToDDMMYYYY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format Time to HH:MM (24-hour)
function formatToHHMM(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
```

### SQL Queries with Formatting

```sql
-- Format date in query
SELECT
  TO_CHAR(birth_date, 'DD/MM/YYYY') as birth_date_formatted,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created_at_formatted
FROM clients;

-- Parse DD/MM/YYYY input
INSERT INTO bookings (travel_date)
VALUES (TO_DATE('25/11/2025', 'DD/MM/YYYY'));
```

---

## 📋 Examples by Context

### Client Information
```
Full Name: John Doe
Birth Date: 15/03/1985
Passport Expiry: 20/06/2030
```

### Booking Details
```
Booking Code: BK-2025-001
Booking Date: 10/11/2025 14:30
Travel Start: 20/11/2025
Travel End: 25/11/2025
```

### Transfer Details
```
Date: 20/11/2025
Pickup Time: 09:00
From: Istanbul Airport
To: Cappadocia
```

### Hotel Reservation
```
Hotel: Grand Palace
Check-in: 20/11/2025 15:00
Check-out: 25/11/2025 11:00
Nights: 5
```

### Tour Schedule
```
Tour: Cappadocia Hot Air Balloon
Date: 21/11/2025
Start Time: 05:30
Duration: 3 hours
End Time: 08:30
```

### Reports
```
Sales Report
Period: 01/11/2025 - 30/11/2025
Generated: 30/11/2025 16:45
```

---

## ⚠️ Important Rules

### DO ✅
- Always display dates as DD/MM/YYYY
- Always display time in 24-hour format HH:MM
- Store dates in database as DATE or TIMESTAMP
- Validate date inputs on both frontend and backend
- Use consistent formatting across all modules

### DON'T ❌
- Never use MM/DD/YYYY (American format)
- Never use 12-hour format with AM/PM
- Never store dates as strings
- Never mix date formats in the same system
- Never assume user timezone without asking

---

## 🌍 Internationalization Notes

If expanding to multiple countries:
- Store user's locale preference
- Format dates according to locale
- Always store in UTC in database
- Convert to local timezone for display

Current System:
- **Default Locale**: Turkey (tr-TR)
- **Date Format**: DD/MM/YYYY
- **Time Format**: 24-hour (HH:MM)
- **Timezone**: Europe/Istanbul (UTC+3)

---

## 📝 Validation Patterns

### Date Validation (DD/MM/YYYY)
```regex
^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$
```

### Time Validation (HH:MM)
```regex
^([01][0-9]|2[0-3]):[0-5][0-9]$
```

### DateTime Validation (DD/MM/YYYY HH:MM)
```regex
^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4} ([01][0-9]|2[0-3]):[0-5][0-9]$
```

---

**Standard**: REQUIRED for all development
**Status**: Active
**Updated**: 2025-11-10
