# Currency Exchange Rates - TCMB Integration

## Overview
Use **TCMB** (Türkiye Cumhuriyet Merkez Bankası / Central Bank of Turkey) daily exchange rates for currency conversions in the system.

## TCMB Exchange Rate API

### Official API Endpoint
```
https://www.tcmb.gov.tr/kurlar/today.xml
```

### Available Currencies
TCMB provides daily rates for major currencies against Turkish Lira (TRY):
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CHF (Swiss Franc)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- JPY (Japanese Yen)
- SAR (Saudi Riyal)
- and more...

### Rate Types
- **Forex Buying** (Döviz Alış)
- **Forex Selling** (Döviz Satış)
- **Banknote Buying** (Efektif Alış)
- **Banknote Selling** (Efektif Satış)

---

## Database Schema

### Tables Required

```sql
-- Supported currencies
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,  -- 'USD', 'EUR', 'TRY', etc.
  name VARCHAR(100) NOT NULL,       -- 'US Dollar', 'Euro', etc.
  symbol VARCHAR(10),               -- '$', '€', '₺', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily exchange rates from TCMB
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,  -- Always 'TRY' for TCMB rates
  to_currency VARCHAR(3) NOT NULL,    -- 'USD', 'EUR', etc.
  rate DECIMAL(12, 6) NOT NULL,       -- Exchange rate
  rate_type VARCHAR(20) NOT NULL,     -- 'forex_buying', 'forex_selling'
  rate_date DATE NOT NULL,            -- Date of rate
  source VARCHAR(50) DEFAULT 'TCMB',  -- Rate source
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency, rate_date, rate_type)
);

-- Create index for fast lookups
CREATE INDEX idx_exchange_rates_lookup
ON exchange_rates(from_currency, to_currency, rate_date, rate_type);

-- Operator's preferred base currency
ALTER TABLE operators ADD COLUMN base_currency VARCHAR(3) DEFAULT 'TRY';
```

---

## Implementation

### Backend Service: `backend/src/services/exchangeRateService.js`

```javascript
const axios = require('axios');
const xml2js = require('xml2js');
const pool = require('../config/database');

class ExchangeRateService {

  // Fetch today's rates from TCMB
  async fetchTCMBRates() {
    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const url = `https://www.tcmb.gov.tr/kurlar/${today.substring(0, 6)}/${today}.xml`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'Accept': 'application/xml' }
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      return result.Tarih_Date.Currency;
    } catch (error) {
      console.error('Error fetching TCMB rates:', error);
      throw error;
    }
  }

  // Save rates to database
  async saveRates(rates, rateDate) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const currency of rates) {
        const currencyCode = currency.$.CurrencyCode;
        const forexBuying = parseFloat(currency.ForexBuying?.[0] || 0);
        const forexSelling = parseFloat(currency.ForexSelling?.[0] || 0);

        if (forexBuying > 0) {
          // Save buying rate
          await client.query(
            `INSERT INTO exchange_rates
             (from_currency, to_currency, rate, rate_type, rate_date, source)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (from_currency, to_currency, rate_date, rate_type)
             DO UPDATE SET rate = $3`,
            ['TRY', currencyCode, forexBuying, 'forex_buying', rateDate, 'TCMB']
          );
        }

        if (forexSelling > 0) {
          // Save selling rate
          await client.query(
            `INSERT INTO exchange_rates
             (from_currency, to_currency, rate, rate_type, rate_date, source)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (from_currency, to_currency, rate_date, rate_type)
             DO UPDATE SET rate = $3`,
            ['TRY', currencyCode, forexSelling, 'forex_selling', rateDate, 'TCMB']
          );
        }
      }

      await client.query('COMMIT');
      console.log(`✓ Exchange rates updated for ${rateDate}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update today's rates (called by cron job or manually)
  async updateDailyRates() {
    try {
      const rates = await this.fetchTCMBRates();
      const today = new Date().toISOString().split('T')[0];

      await this.saveRates(rates, today);

      return {
        success: true,
        date: today,
        count: rates.length
      };
    } catch (error) {
      console.error('Failed to update daily rates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get exchange rate for specific date and currencies
  async getRate(fromCurrency, toCurrency, date = null, rateType = 'forex_selling') {
    const rateDate = date || new Date().toISOString().split('T')[0];

    // If same currency, return 1
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Direct rate (TRY to other)
    if (fromCurrency === 'TRY') {
      const result = await pool.query(
        `SELECT rate FROM exchange_rates
         WHERE from_currency = $1 AND to_currency = $2
         AND rate_date = $3 AND rate_type = $4
         ORDER BY created_at DESC LIMIT 1`,
        [fromCurrency, toCurrency, rateDate, rateType]
      );

      if (result.rows.length > 0) {
        return parseFloat(result.rows[0].rate);
      }
    }

    // Reverse rate (other to TRY)
    if (toCurrency === 'TRY') {
      const result = await pool.query(
        `SELECT rate FROM exchange_rates
         WHERE from_currency = 'TRY' AND to_currency = $1
         AND rate_date = $2 AND rate_type = $3
         ORDER BY created_at DESC LIMIT 1`,
        [fromCurrency, rateDate, rateType]
      );

      if (result.rows.length > 0) {
        return 1 / parseFloat(result.rows[0].rate);
      }
    }

    // Cross rate (USD to EUR, etc.)
    const rate1 = await this.getRate('TRY', fromCurrency, rateDate, rateType);
    const rate2 = await this.getRate('TRY', toCurrency, rateDate, rateType);

    return rate2 / rate1;
  }

  // Convert amount between currencies
  async convert(amount, fromCurrency, toCurrency, date = null) {
    const rate = await this.getRate(fromCurrency, toCurrency, date);
    return amount * rate;
  }
}

module.exports = new ExchangeRateService();
```

---

## Automatic Daily Update

### Cron Job Setup: `backend/src/jobs/exchangeRateJob.js`

```javascript
const cron = require('node-cron');
const exchangeRateService = require('../services/exchangeRateService');

// Run every day at 3:30 PM (TCMB publishes around 3:30 PM Turkey time)
const scheduleExchangeRateUpdate = () => {
  cron.schedule('30 15 * * *', async () => {
    console.log('Running daily exchange rate update...');
    const result = await exchangeRateService.updateDailyRates();

    if (result.success) {
      console.log(`✓ Rates updated: ${result.count} currencies for ${result.date}`);
    } else {
      console.error('✗ Failed to update rates:', result.error);
    }
  });

  console.log('Exchange rate cron job scheduled: Daily at 15:30');
};

module.exports = scheduleExchangeRateUpdate;
```

### Start Job in `backend/src/index.js`

```javascript
const scheduleExchangeRateUpdate = require('./jobs/exchangeRateJob');

// Start cron job
scheduleExchangeRateUpdate();
```

---

## API Endpoints

### Backend Routes: `backend/src/routes/exchangeRateRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const exchangeRateService = require('../services/exchangeRateService');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Get current rate
router.get('/rate', authenticateToken, async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const rate = await exchangeRateService.getRate(from, to, date);

    res.json({
      success: true,
      data: {
        from,
        to,
        rate,
        date: date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get exchange rate'
    });
  }
});

// Convert amount
router.post('/convert', authenticateToken, async (req, res) => {
  try {
    const { amount, from, to, date } = req.body;
    const converted = await exchangeRateService.convert(amount, from, to, date);

    res.json({
      success: true,
      data: {
        amount,
        from,
        to,
        converted,
        date: date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to convert amount'
    });
  }
});

// Manual update (super admin only)
router.post('/update', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await exchangeRateService.updateDailyRates();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update rates'
    });
  }
});

module.exports = router;
```

---

## Frontend Usage

### Example: Display Converted Prices

```javascript
// Get exchange rate
const getExchangeRate = async (from, to) => {
  const response = await fetch(
    `/api/exchange-rates/rate?from=${from}&to=${to}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data.rate;
};

// Convert and display
const displayPrice = async (priceUSD) => {
  const rate = await getExchangeRate('USD', 'TRY');
  const priceTRY = priceUSD * rate;

  return `$${priceUSD} (₺${priceTRY.toFixed(2)})`;
};
```

---

## Usage in Booking System

### Store Original Currency & Amount

```sql
-- Each service in booking stores original currency
INSERT INTO booking_services (
  booking_id,
  service_type,
  amount,
  currency,
  exchange_rate,
  amount_in_base_currency
) VALUES (
  1,
  'hotel',
  100.00,          -- Original amount
  'USD',           -- Original currency
  34.50,           -- Exchange rate on booking date
  3450.00          -- Converted to operator's base currency (TRY)
);
```

### Benefits
- Track original price in supplier's currency
- Store exchange rate at time of booking
- Calculate profit in base currency
- Handle currency fluctuations
- Generate accurate financial reports

---

## Dependencies Required

```bash
npm install axios xml2js node-cron
```

---

## Configuration in .env

```env
# Exchange Rate Settings
TCMB_API_URL=https://www.tcmb.gov.tr/kurlar
EXCHANGE_RATE_UPDATE_ENABLED=true
EXCHANGE_RATE_UPDATE_TIME=15:30
DEFAULT_BASE_CURRENCY=TRY
```

---

## Manual Update Option (Super Admin)

Add a button in the admin panel to manually trigger rate update:
- Button: "Update Exchange Rates"
- Shows last update time
- Displays current rates for major currencies
- Only accessible by super admin

---

## Fallback Strategy

If TCMB API is unavailable:
1. Use previous day's rates
2. Log warning message
3. Notify super admin
4. Allow manual rate entry as backup

---

## Testing

```javascript
// Test TCMB API connection
const testTCMBConnection = async () => {
  try {
    const rates = await exchangeRateService.fetchTCMBRates();
    console.log('✓ TCMB API working');
    console.log('Currencies available:', rates.length);
  } catch (error) {
    console.error('✗ TCMB API error:', error.message);
  }
};
```

---

**Status**: Specification Complete
**Source**: TCMB (Central Bank of Turkey)
**Update Schedule**: Daily at 15:30 Turkey time
**Next**: Implement exchange rate service
