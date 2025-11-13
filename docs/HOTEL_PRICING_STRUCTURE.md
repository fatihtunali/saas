# Hotel Pricing Structure - Corrected

## ✅ CORRECT Pricing Model (Per Person)

Hotels use **per-person pricing**, not per-room pricing.

### Pricing Fields Required:

1. **Per Person in Double Room**
   - Base price per person when sharing a double room
   - Example: $50 per person per night

2. **Single Supplement**
   - Additional charge when one person occupies a double room alone
   - Example: $30 supplement (total = $50 + $30 = $80 per night)

3. **Per Person in Triple Room**
   - Price per person when sharing a triple room
   - Usually cheaper than double room
   - Example: $40 per person per night

4. **Child Pricing Slabs** (with 2 adults)

   **Child Age 00-02.99 years old**
   - Infants/toddlers
   - Usually free or minimal charge
   - Example: $0 or $10 per night

   **Child Age 03-05.99 years old**
   - Young children
   - Discounted rate
   - Example: $20 per night

   **Child Age 06-11.99 years old**
   - Older children
   - Moderate discount
   - Example: $30 per night

---

## Example Hotel Entry

**Hotel**: Grand Palace Hotel
**Location**: Istanbul
**Star Rating**: 5

**Pricing (per person, per night)**:
- Per Person Double: $100
- Single Supplement: $50
- Per Person Triple: $85
- Child 00-02.99: $0
- Child 03-05.99: $25
- Child 06-11.99: $50

### Example Calculations:

**Scenario 1**: 2 Adults in Double Room
- Cost = 2 × $100 = $200 per night

**Scenario 2**: 1 Adult in Single Room
- Cost = $100 + $50 (supplement) = $150 per night

**Scenario 3**: 3 Adults in Triple Room
- Cost = 3 × $85 = $255 per night

**Scenario 4**: 2 Adults + 1 Child (age 4) in Triple Room
- Cost = (2 × $100) + $25 = $225 per night

**Scenario 5**: 2 Adults + 2 Children (ages 3 and 7) in 2 Rooms
- Room 1 (Double): 2 × $100 = $200
- Room 2 (Double): $25 + $50 = $75
- Total = $275 per night

---

## Database Structure

```sql
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  operator_id INTEGER REFERENCES operators(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  unique_hotel_id VARCHAR(50) UNIQUE,
  hotel_name VARCHAR(255),
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  location VARCHAR(255),
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Per Person Pricing
  price_per_person_double DECIMAL(10,2),
  single_supplement DECIMAL(10,2),
  price_per_person_triple DECIMAL(10,2),

  -- Child Pricing Slabs (with 2 adults)
  child_price_0_2 DECIMAL(10,2),   -- 00-02.99 years
  child_price_3_5 DECIMAL(10,2),   -- 03-05.99 years
  child_price_6_11 DECIMAL(10,2),  -- 06-11.99 years

  currency VARCHAR(3),
  commission_rate DECIMAL(5,2),
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Important Notes

✅ All prices are **per person, per night**
✅ Child pricing assumes **2 adults** are present
✅ Single supplement is **added** to the per-person double rate
✅ Age ranges use decimal format: 02.99 means "up to but not including 3 years"
✅ Each hotel can have different pricing
✅ Currency is stored per hotel (multi-currency support)

---

**Updated**: 2025-11-10
**Status**: Corrected and Final
