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

## 🚀 Phase 1: Price Intelligence & Crawler (COMPLETED ✅)
**Goal:** Real-time pricing data and "New Deals" feature.

### ✅ Phase 1.0 - 1.3: Implementation (COMPLETE)
- [x] Backend Structure & API Mock
- [x] Database Schema & Repositories (`pricing_snapshots`, `source_catalog`)
- [x] Web Crawler (Puppeteer + Stealth)
- [x] Frontend "New Deals" Section
- [x] Scheduler & Change Detection

---

## 🚀 Phase 2: True Cost Calculator (COMPLETED ✅)
**Goal:** Implement algorithm to calculate "True Cost" of accounts.
- [x] `TrueCostService` Implementation
- [x] Fee Handling (Activation, Monthly, etc.)
- [x] Integration with Pricing Models

---

## 🚀 Phase 3: Comparison Matrix (COMPLETED ✅)
**Goal:** Comparison table for side-by-side analysis.
- [x] Backend Comparison Endpoint
- [x] Frontend Comparison Matrix Component
- [x] Firm Selection Logic

---

## 🚀 Phase 4: Data Population (COMPLETED ✅)
**Goal:** Populate with real firm data.
- [x] Real Selectors for Apex, FTMO, TopStep
- [x] Stealth Mode Configuration
- [x] Data Seeding

---

## 🚀 Phase 5: System Integration & Polish (COMPLETED ✅)
**Goal:** Deep Dive Analysis fixes.
- [x] DB Refactoring (Singleton Pool)
- [x] Java Swagger/OpenAPI
- [x] Java Global Exception Handling & CORS
- [x] Unified Frontend API Client

---

## 🚀 Phase 6: Production Readiness (CURRENT 🚧)
**Goal:** Prepare for production deployment.
- [ ] **Infrastructure**: `docker-compose.prod.yml`
- [ ] **Reverse Proxy**: Nginx Configuration
- [ ] **CI/CD**: GitHub Actions for Build/Test
- [ ] **Monitoring**: Basic Container Monitoring
- [ ] **Security**: Rate Limiting & Hardening

---

## 🌍 Phase 7: Enterprise Scale (Q3+ 2026)
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
