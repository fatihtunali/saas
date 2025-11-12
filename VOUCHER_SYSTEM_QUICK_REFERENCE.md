# Voucher System - Quick Reference

## 📁 File Locations

### Core Library (`frontend/src/lib/vouchers/`)
```
vouchers/
├── index.ts              # Main exports
├── types.ts              # TypeScript definitions (500+ lines)
├── templates.ts          # HTML templates (1200+ lines) 
├── generator.ts          # PDF generation (200+ lines)
└── utils.ts              # Helper functions (400+ lines)
```

### UI Components (`frontend/src/components/features/vouchers/`)
```
vouchers/
├── index.ts              # Component exports
├── VoucherGenerator.tsx  # Main UI (300+ lines)
├── VoucherPreview.tsx    # Preview modal (100+ lines)
└── VoucherQuickActions.tsx # Quick actions (150+ lines)
```

### Integration Points
- `BookingHeader.tsx` - Header "Vouchers" button
- `ServicesTab.tsx` - Per-service voucher actions
- `[id]/page.tsx` - Booking details page integration

---

## 🎨 Voucher Types Supported

| Type | Icon | Features |
|------|------|----------|
| 🏨 Hotel | Hotel | Check-in/out, rooms, meal plan, guests |
| 🚗 Transfer | Car | Pickup/dropoff, vehicle, driver, flights |
| 🗺️ Tour | Map | Itinerary, inclusions, meeting point |
| 👤 Guide | User | Languages, duration, itinerary |
| 🍽️ Restaurant | Utensils | Reservation, menu, dietary needs |

---

## 🚀 Quick Start

### Generate Single Voucher
```typescript
import { createVoucherFromService, downloadVoucherPDF } from '@/lib/vouchers';

const voucher = createVoucherFromService(booking, service, passengers);
await downloadVoucherPDF(voucher);
```

### Preview Before Download
```typescript
import { previewVoucherHTML } from '@/lib/vouchers';

const voucher = createVoucherFromService(booking, service, passengers);
previewVoucherHTML(voucher);
```

### Generate Multiple Vouchers
```typescript
import { createVouchersFromBooking, downloadMultipleVouchers } from '@/lib/vouchers';

const vouchers = createVouchersFromBooking(booking, services, passengers);
await downloadMultipleVouchers(vouchers);
```

### Use UI Component
```tsx
import { VoucherGenerator } from '@/components/features/vouchers';

<VoucherGenerator
  booking={booking}
  services={services}
  passengers={passengers}
/>
```

---

## 📊 Key Functions

### Generator Functions
- `generateVoucherPDF()` - Generate PDF blob
- `downloadVoucherPDF()` - Download single voucher
- `downloadMultipleVouchers()` - Download multiple
- `previewVoucherHTML()` - Preview in browser
- `getVoucherAsBase64()` - Get base64 encoded

### Utility Functions
- `createVoucherFromService()` - Map service to voucher
- `createVouchersFromBooking()` - Create multiple vouchers
- `validateVoucherData()` - Validate before generation
- `generateVoucherNumber()` - Generate unique ID
- `formatPassengerNames()` - Format guest list

### Template Functions
- `generateHotelVoucherHTML()`
- `generateTransferVoucherHTML()`
- `generateTourVoucherHTML()`
- `generateGuideVoucherHTML()`
- `generateRestaurantVoucherHTML()`

---

## 🎯 Where to Use

### 1. Booking Details Page
- Header "Vouchers" button → Opens VoucherGenerator dialog
- Select multiple services → Bulk generate

### 2. Services Tab
- Each service card has voucher dropdown
- Quick actions: Preview, Download, Email (coming soon)

### 3. Programmatic Use
- Import functions from `@/lib/vouchers`
- Create voucher data → Generate PDF
- Full control over the process

---

## 🛠️ Customization

### Change Colors/Branding
```typescript
const config: VoucherTemplateConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  fontFamily: 'Arial, sans-serif',
  logoUrl: 'https://your-logo.png'
};

await generateVoucherPDF(voucherData, {}, config);
```

### Modify Templates
Edit HTML in `templates.ts`:
- `getCommonStyles()` - Global CSS
- `generateHotelVoucherHTML()` - Hotel template
- etc.

---

## ✅ Status Indicators

Service cards show:
- ✅ Green badge - Voucher sent
- ⚠️ Red alert - Generation error
- 🔄 Spinner - Generating

---

## 📱 User Flow

1. Navigate to Booking Details
2. Click "Vouchers" button in header OR
3. Go to Services tab → Click voucher button on service
4. Select services (bulk) or single service
5. Preview (optional)
6. Click "Generate" → PDFs download automatically

---

## 🔍 Troubleshooting

### No vouchers button?
- Check if booking has services
- Only shows for: hotel, transfer, tour, guide, restaurant

### PDF not downloading?
- Check browser pop-up blocker
- Verify jsPDF and html2canvas are installed
- Check console for errors

### Template not showing correctly?
- Verify voucher data is complete
- Run `validateVoucherData()` first
- Check for missing required fields

---

## 📚 Documentation

Full documentation: `PHASE_4_VOUCHER_SYSTEM_COMPLETION.md`

**Dependencies:**
- jsPDF (already installed)
- html2canvas (already installed)
- date-fns (already installed)

**No additional npm installs needed!**
