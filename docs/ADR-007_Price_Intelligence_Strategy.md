# ADR-007: Price Intelligence Module Strategy

## Status
Accepted

## Date
2025-12-28

## Context
OnlyPropFirms needs to track pricing and discounts for Prop Firms to provide value to users ("New Deals" feature). We need a system to fetch, normalize, and store this data.

## Decision
We will separate the implementation into **Phase 0 (Structure/Mock)** and **Phase 1 (Crawler/DB)**.

### Phase 0 (Structure)
- Define all data models (Pricing, SourceCatalog) in TypeScript.
- Define API Contract (OpenAPI).
- Implement Mock Services to unblock Frontend development.
- No real crawling; manual seed data.

### Phase 1 (Implementation)
- Implement `PricingRepository` (PostgreSQL).
- Implement `PriceNormalizer` (HTML parsing strategy).
- Use `Puppeteer` for crawling (handled in separate worker).
- Use `SourceCatalog` to configure crawlers dynamically.

## Consequences
- **Positive:** Frontend can be built immediately. Architecture is decoupled.
- **Negative:** Data is static until Phase 1 is complete.
