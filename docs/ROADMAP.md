# OnlyPropFirms Roadmap

**Current Version:** 0.1.0-alpha
**Last Updated:** 2025-12-28

## 🏁 Phase 0: MVP 0.1-0.3 (COMPLETED ✅)
**Goal:** Validate core business logic with minimal infrastructure.

### ✅ Completed
- **Frontend**
    - [x] Homepage, Listings (`/prop-firms`), Comparison (`/prop-firm-comparison`)
    - [x] Redux Stores: `propFirmSlice`, `filterSlice`
    - [x] Components: `FirmCard`, `ComparisonTable`, `FilterSidebar`
    - [x] Testing Infrastructure (Jest + React Testing Library)
- **Backend (Spring Boot)**
    - [x] API Skeleton (3 Endpoints: List, Filter, Details)
    - [x] Database: PostgreSQL (2 Tables: `prop_firms`, `filters_applied`)
    - [x] Price Intelligence Module Structure (Models, DTOs, API Contract)
    - [x] Testing Infrastructure (JUnit 5 + MockMvc)
- **Infrastructure (Local)**
    - [x] Docker Compose (Frontend + Backend + DB)
    - [x] GitHub Actions (Lint + Test)

**Validation Reports**:
- [PHASE_0_VALIDATION_REPORT.md](../PHASE_0_VALIDATION_REPORT.md) - Infrastructure + Backend API
- [PHASE_0_PRIORITY_2_VALIDATION.md](../PHASE_0_PRIORITY_2_VALIDATION.md) - Redux + CI/CD
- [PHASE_0_PRIORITY_3_VALIDATION.md](../PHASE_0_PRIORITY_3_VALIDATION.md) - UI Components
- [PHASE_0_TESTING_VALIDATION.md](../PHASE_0_TESTING_VALIDATION.md) - Testing Infrastructure

---

## 🚀 Phase 1: Price Intelligence & Crawler (IN PROGRESS 🚧)
**Goal:** Real-time pricing data and "New Deals" feature.

### ✅ Phase 1.0: Structure & Mock Integration (COMPLETE)
- [x] Backend Structure (Models, DTOs, Services, Controllers, Interfaces)
- [x] Source Catalog & Models (Pricing, ChangeDetection, SourceCatalogEntry)
- [x] API Contract (OpenAPI Specification for 3 pricing endpoints)
- [x] Frontend Types & Service Layer (pricing.ts, pricingService.ts)
- [x] NewDealsSection Component (homepage integration)
- [x] Enhanced FirmCard with Pricing & Deal Badges
- [x] Mock Data Integration (2 sample firms with pricing)
- [x] Documentation (OVERVIEW.md, API_CONTRACT.md, CRAWLER_STRATEGY.md, ADR-007)
- [x] Critical Bug Fixes (Import paths, API URL port 8081, homepage integration)

**Validation Reports**:
- [PHASE_1_STRUCTURE_VALIDATION.md](../PHASE_1_STRUCTURE_VALIDATION.md) - Full structure analysis
- [PHASE_1_CORRECTIONS_APPLIED.md](../PHASE_1_CORRECTIONS_APPLIED.md) - Bug fixes applied

---

### 🚧 Phase 1.1: Implementation (PENDING)

**Database & Persistence**:
- [x] Create `pricing_snapshots` table migration
- [x] Create `source_catalog` table migration
- [x] Implement `PricingRepository` (implements `IPricingStore`)
- [ ] Implement PropFirmName join logic (resolve 'TODO' in PricingService.ts:89)

**Web Crawler & Data Collection**:
- [ ] Implement `PriceNormalizer` (Cheerio for HTML parsing)
- [ ] Implement `ChangeDetectionService` (time-series query logic)
- [ ] Implement `SourceCatalogService` (load from database)
- [ ] Add error handling & retry logic for crawlers
- [ ] Add proxy rotation strategy (if needed)

**Automation & Scheduling**:
- [ ] Implement scheduler/cron jobs for periodic crawling
- [ ] Add rate limiting per firm (respect robots.txt)
- [ ] Add monitoring & alerting for crawler failures

**Frontend Integration**:
- [ ] Replace mock data with real API calls in `pricingService.ts`
- [ ] Add error handling & retry logic for API calls
- [ ] Add loading states & skeleton screens

**Testing**:
- [ ] Backend unit tests (PricingService, ChangeDetectionService, etc.)
- [ ] Backend integration tests (API endpoints with database)
- [ ] Frontend unit tests (NewDealsSection, enhanced FirmCard)
- [ ] E2E tests for "New Deals" user journey

**Additional Features**:
- [ ] True Cost Calculator (Phase 1 or deferred to Phase 2)

---

### ⛔ Deferred to Phase 2+
- User Accounts / Auth0
- Kubernetes / EKS
- Multi-region Deployment
- Distributed Tracing

---

## 🚀 Phase 2: Production Readiness (Q2 2026)
**Goal:** AWS deployment and additional features.
- [ ] AWS Deployment (EC2/RDS or ECS/Fargate)
- [ ] Economic Calendar Integration
- [ ] Affiliate Analytics Dashboard
- [ ] User Accounts & Authentication (Auth0)

---

## 🌍 Phase 3: Enterprise Scale (Q3+ 2026)
**Goal:** Enterprise architecture for global scale.
- [ ] Kubernetes (EKS)
- [ ] Multi-region Failover
- [ ] CDN Integration (CloudFront)
- [ ] Advanced Analytics & Reporting

---

## Architecture Change Log

| Date | Type | Description |
|------|------|-------------|
| 2025-12-28 | INIT | Initial Project Structure Created |
| 2025-12-28 | DECISION | Selected Next.js + Spring Boot |
| 2025-12-28 | COMPLETE | Phase 0 (MVP) - Infrastructure, Backend API, Frontend, Tests |
| 2025-12-28 | DECISION | ADR-007: Two-phase Price Intelligence strategy (Structure → Implementation) |
| 2025-12-28 | COMPLETE | Phase 1.0 (Structure) - Models, API Contract, Mock Integration, NewDealsSection |
| 2025-12-28 | FIX | Phase 1 Critical Bugs (Import paths, API URL, homepage integration) |
