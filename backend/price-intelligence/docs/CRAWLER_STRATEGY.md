# Crawler Strategy (Phase 1+)

## Overview
Detailed plan for implementing the web crawler in Phase 1.

## Tech Stack
- **Library:** Puppeteer (Core/Headless) or Cheerio (Lightweight HTML)
- **Language:** TypeScript
- **Runtime:** Node.js

## Architecture
- **Worker:** Separate container/process for crawling to avoid blocking API
- **Queue:** Redis/RabbitMQ (optional for MVP, maybe simple cron first)
- **Proxy:** BrightData/PacketStream (optional, if IP blocks occur)

## Logic
1. `SourceCatalogService` reads active entries.
2. Scheduler triggers `PricingService.triggerCrawl(entry)`.
3. `IPriceCrawler` fetches HTML/API.
4. `IPriceNormalizer` parses data.
5. `PricingStore` saves snapshot.
6. `ChangeDetector` compares with previous.

## Risks
- **IP Blocking:** Use proxies or low frequency.
- **Layout Changes:** Robust selectors + "Requires Manual Review" flag.
- **Dynamic Content:** Use Puppeteer for JS-heavy sites.

This document will be expanded in Phase 1.
