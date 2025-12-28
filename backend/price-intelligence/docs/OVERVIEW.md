# Price Intelligence Module

## Purpose

The Price Intelligence Module is responsible for:
- **Catalog Management:** Maintaining a registry of Prop Firms and their pricing pages
- **Price Tracking:** Recording current prices, discounts, and fees for each firm
- **Change Detection:** Identifying price changes and flagging "new deals"
- **API Layer:** Exposing pricing data to the frontend

## Phase 0 Scope

In Phase 0 (MVP), this module provides:
- ✅ Data models and DTOs (TypeScript interfaces)
- ✅ OpenAPI specification for REST endpoints
- ✅ Source Catalog schema and seed data
- ✅ Frontend types and mock API integration
- ✅ Service layer skeleton (no database yet)
- ❌ No actual web crawler (planned Phase 1)
- ❌ No database persistence (planned Phase 1)
- ❌ No scheduler/cron jobs (planned Phase 1)

## Architecture

```
Frontend (Next.js)
    ↓
pricingService.ts (mocks Phase 0, real calls Phase 1)
    ↓
PricingController (REST endpoints)
    ↓
PricingService (business logic)
    ↓
PricingRepository (database – Phase 1)
    ↓
PostgreSQL (pricing_snapshots, source_catalog tables – Phase 1)
```

## Key Concepts

### Source Catalog
A JSON configuration file listing all Prop Firms, their pricing URLs, and crawling strategy.
- One entry per firm
- Defines: API endpoints, HTML selectors, update frequency
- Can be marked as "inactive" if crawler needs adjustment

### Pricing Snapshot
An immutable record of a pricing observation at a specific point in time.
- Includes: price, discount, account size, timestamp
- Allows historical price tracking
- Enables change detection

### Change Detection
Compairs old vs. new pricing snapshots to identify:
- Price changes
- Discount changes
- "New deals" (changes in last 24h)
- Firms requiring manual review

## Frontend Integration

The frontend consumes pricing data via REST API:
- `GET /api/v1/pricing/prop-firms` – List all pricing
- `GET /api/v1/pricing/prop-firms/{id}` – Get specific firm pricing
- `GET /api/v1/pricing/new-deals` – Get recent price changes

Pricing data is displayed as:
- Deal badges on FirmCard components ("NEW DEAL", "-30% OFF")
- "New Deals" section on homepage
- Price information in comparison table

## File Structure

```
price-intelligence/
├── src/models/              – Data structures
├── src/dtos/                – API response formats
├── src/schemas/             – Validation schemas
├── src/interfaces/          – Business logic contracts
├── src/services/            – Orchestration layer
├── src/controllers/         – REST endpoints
├── src/configs/             – Seed data & configuration
├── openapi/                 – API specification
├── docs/                    – Documentation
└── tests/                   – Test suites
```

## Next Steps (Phase 1+)

1. **Implement PricingRepository** – Database persistence layer
2. **Implement PriceNormalizer** – HTML/API parsing
3. **Implement PriceCrawler** – Web scraping with Puppeteer/Cheerio
4. **Add Scheduler** – Cron jobs for periodic updates
5. **Add Error Handling** – Retry logic, fallbacks
6. **Add Monitoring** – Logging, alerts, dashboard

## Testing

Phase 0 tests focus on:
- Model validation
- Service logic (with mocked database)
- API contract validation

```bash
npm test -- price-intelligence
```

## Troubleshooting

### "Pricing data not showing in frontend"
- Check that `pricingService.fetchPricingList()` is being called
- Verify mock data is being returned (Phase 0)
- Check browser console for errors

### "Frontend types don't match backend"
- Ensure `frontend/src/types/pricing.ts` matches `backend/price-intelligence/src/dtos/PricingDTO.ts`
- Run OpenAPI schema validator

## Questions?
Contact: @architecture-team
