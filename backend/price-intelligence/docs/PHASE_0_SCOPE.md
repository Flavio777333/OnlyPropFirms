# Phase 0 Scope: Price Intelligence

## What IS in Phase 0

✅ **Data Models & Types**
- Pricing interface (price, discount, account size, timestamps)
- SourceCatalogEntry (config for each firm)
- PricingSnapshot (immutable record)
- PriceChange (change detection result)

✅ **API Contract (OpenAPI)**
- 3 endpoints defined: list, get by ID, new deals
- Response DTOs specified
- Error responses documented
- Postman/curl testing possible

✅ **Frontend Integration**
- Types in TypeScript (pricing.ts)
- pricingService with mock data
- FirmCard component with deal badges
- NewDealsSection component for homepage
- UI components ready for real data (Phase 1)

✅ **Source Catalog**
- JSON schema defined (sourceCatalog.schema.json)
- Seed data with 3-5 example firms
- No actual web scraping or API calls

✅ **Documentation**
- This file
- API_CONTRACT.md
- OVERVIEW.md
- ARCHITECTURE.md
- Inline code comments

## What is NOT in Phase 0

❌ **Web Crawler**
- No Puppeteer/Cheerio
- No HTML parsing
- No external API calls
- Deferred to Phase 1

❌ **Database Persistence**
- No PricingRepository implementation
- No PostgreSQL schema
- Data only in memory/mocks
- Deferred to Phase 1

❌ **Scheduler/Cron**
- No periodic crawling
- No job queue
- No background workers
- Deferred to Phase 1

❌ **Real Data**
- Seed data uses placeholder prices
- No firm contact for actual pricing
- Manual updates only
- Deferred to Phase 1

❌ **Advanced Features**
- Price history graphs
- Trend analysis
- ML-based deal detection
- Advanced analytics
- Deferred to Phase 2+

## MVP Workflow (Phase 0)

1. **Frontend Developer** reads `/docs/API_CONTRACT.md`
2. **Frontend Developer** implements components using `pricingService` mock data
3. **Backend Developer** implements PricingController with mock responses
4. **Both** test via Postman/curl to validate contract
5. **Phase 0 Complete:** Frontend can display deals; backend API works with mocks

## Phase 0 → Phase 1 Transition

When Phase 0 is complete and merged to `develop`:

1. Create new branch `feature/price-crawler-phase1`
2. Implement PricingRepository (database layer)
3. Implement PriceNormalizer (HTML/API parsing)
4. Implement PriceCrawler (web scraping)
5. Add Scheduler (cron jobs)
6. Update pricingService to use real API instead of mocks
7. Test with real firm data
8. Deploy to staging
9. Monitor crawler errors, fallbacks, quality

## Success Metrics (Phase 0 Complete)

- ✅ All 3 API endpoints respond with correct DTOs
- ✅ Frontend displays deal badges on FirmCard
- ✅ Frontend NewDealsSection renders without errors
- ✅ Postman tests pass for all endpoints
- ✅ No database calls needed (mocks sufficient)
- ✅ Team comfortable with architecture for Phase 1

## Rollover to Phase 1

Upon Phase 0 → Phase 1 gate:

1. Database schema created (pricing_snapshots, source_catalog tables)
2. PricingRepository implemented
3. Scheduler configured (run daily at 9 AM UTC)
4. Crawler tested on 3 pilot firms (Apex, Tradeify, TheTradeMakers)
5. Error handling & fallbacks in place
6. Monitoring dashboard live
7. Frontend updated to use real API endpoint (no more mocks)

---

**Current Status:** PHASE 0 IN PROGRESS
**Last Updated:** 2025-12-28
**Owned by:** @architecture-team
