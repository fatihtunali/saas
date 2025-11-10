# Cities and Locations - System Reference

## Purpose
All cities and touristic locations must be **predefined in the system** to ensure consistency across:
- Transfer routes
- Hotel locations
- Tour destinations
- Pickup/drop-off points

## Important Rules

✅ **Predefined Only** - No user-entered cities
✅ **Managed by Super Admin** - Only super admin can add/edit cities
✅ **Touristic Areas = Cities** - Treat touristic regions as cities to avoid confusion

---

## Location Types

### 1. Actual Cities
Cities with airports, hotels, and infrastructure:
- Istanbul
- Ankara
- Izmir
- Antalya
- etc.

### 2. Touristic Regions (Treated as Cities)
Tourist destinations that should be in the cities list:
- **Cappadocia** (not a city, but a region - treat as city)
- **Pamukkale** (not a city, but a tourist destination)
- **Ephesus**
- **Gallipoli**
- etc.

---

## Database Structure

```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(100) DEFAULT 'Turkey',
  type VARCHAR(50) CHECK (type IN ('city', 'touristic_region', 'airport')),
  airport_code VARCHAR(10),  -- e.g., 'IST', 'SAW', 'AYT'
  region VARCHAR(100),        -- e.g., 'Marmara', 'Aegean', 'Mediterranean'
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,      -- For dropdown sorting
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Sample Cities Data (Turkey)

### Major Cities
| City Name | Type | Airport Code | Region |
|-----------|------|--------------|--------|
| Istanbul | city | IST / SAW | Marmara |
| Ankara | city | ESB | Central Anatolia |
| Izmir | city | ADB | Aegean |
| Antalya | city | AYT | Mediterranean |
| Bodrum | city | BJV | Aegean |
| Dalaman | city | DLM | Mediterranean |
| Kayseri | city | ASR | Central Anatolia |
| Trabzon | city | TZX | Black Sea |

### Touristic Regions (Treated as Cities)
| Location Name | Type | Nearest Airport | Region |
|--------------|------|-----------------|--------|
| **Cappadocia** | touristic_region | ASR (Kayseri) | Central Anatolia |
| **Pamukkale** | touristic_region | DNZ (Denizli) | Aegean |
| **Ephesus** | touristic_region | ADB (Izmir) | Aegean |
| **Gallipoli** | touristic_region | None | Marmara |
| **Troy** | touristic_region | None | Marmara |
| **Göreme** | touristic_region | ASR (Kayseri) | Central Anatolia |
| **Kusadasi** | touristic_region | ADB (Izmir) | Aegean |
| **Fethiye** | touristic_region | DLM (Dalaman) | Mediterranean |

### Airport Locations
| Airport Name | Type | Code | City |
|--------------|------|------|------|
| Istanbul Airport | airport | IST | Istanbul |
| Sabiha Gökçen Airport | airport | SAW | Istanbul |
| Antalya Airport | airport | AYT | Antalya |
| Kayseri Airport | airport | ASR | Kayseri |

---

## Usage in System

### 1. Transfer Routes
```
From: Istanbul (IST Airport)
To: Cappadocia
Vehicle: Minivan
Price: $150
```

### 2. Hotel Locations
```
Hotel: Cave Hotel
Location: Cappadocia  (selected from predefined list)
```

### 3. Tour Packages
```
Tour: Cappadocia Hot Air Balloon
Destination: Cappadocia  (selected from predefined list)
Pickup: Göreme  (selected from predefined list)
```

### 4. Booking Itinerary
```
Day 1: Istanbul → Cappadocia (transfer)
Day 2: Cappadocia (hotel + tour)
Day 3: Cappadocia → Pamukkale (transfer)
```

---

## Management

### Super Admin Functions
- Add new cities/locations
- Edit existing cities
- Activate/deactivate cities
- Set display order for dropdowns
- Manage airports and codes

### Operator Functions
- **SELECT ONLY** - Choose from predefined list
- Cannot add new cities
- Cannot edit city details

---

## Why This Approach?

✅ **Consistency** - Everyone uses same city names
✅ **No Typos** - "Cappadocia" vs "Kapadokya" vs "Capadocia"
✅ **Easy Routing** - Transfer routes use predefined pairs
✅ **Better Reporting** - Group bookings by location accurately
✅ **Data Integrity** - Foreign key relationships work correctly

---

## Implementation Notes

1. **Seeding Data**: Create initial cities list when system starts
2. **Dropdown UI**: All city selections use searchable dropdown
3. **Validation**: Prevent duplicate city names
4. **Soft Delete**: Use is_active flag instead of deleting
5. **Multi-language**: Store translations if needed (city_name_en, city_name_tr)

---

**Status**: Specification Complete
**Next**: Implement cities table and seed initial data
