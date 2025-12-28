# Phase 1.1 - Next Steps & Action Plan

**Date**: 2025-12-28
**Current Status**: Phase 1.1 Implementation In Progress
**Last Update**: Express server + real API integration complete

---

## Current State Summary

### ✅ What's Complete (Phase 1.1)

**Backend Implementation**:
- ✅ Express server running on port 8081 ([src/index.ts](backend/price-intelligence/src/index.ts))
- ✅ PricingRepository with PostgreSQL integration (CRUD operations)
- ✅ SourceCatalogRepository with PostgreSQL integration
- ✅ PriceCrawler implementation (Puppeteer for dynamic pages)
- ✅ PriceNormalizer implementation (Cheerio for HTML parsing)
- ✅ ChangeDetectionService (price delta tracking)
- ✅ Database schema (pricing_snapshots, source_catalog tables)
- ✅ 3 REST endpoints (list, get by firm, new deals)
- ✅ Manual crawl trigger endpoint (POST /admin/crawl/{firmId})

**Frontend Integration**:
- ✅ pricingService updated to use real API calls (replaced mocks)
- ✅ Error handling with fallback to empty data
- ✅ NewDealsSection component integrated
- ✅ FirmCard with deal badges

**Infrastructure**:
- ✅ Docker Compose with PostgreSQL
- ✅ Database initialization scripts
- ✅ Environment configuration

---

## What's Next: Immediate Priorities

### Priority 1: Testing & Verification (TODAY)

#### 1.1 Manual Testing
**Goal**: Verify the end-to-end flow works

**Steps**:
```bash
# 1. Start all services
docker-compose up -d

# 2. Start the price-intelligence backend
cd backend/price-intelligence
npm install
npm run dev

# 3. Test manual crawl trigger
curl -X POST http://localhost:8081/api/v1/admin/crawl/apex-trader-funding
# Expected: JSON response with crawled pricing data

# 4. Test pricing API
curl http://localhost:8081/api/v1/pricing/prop-firms
# Expected: JSON array with pricing snapshots

# 5. Test new deals endpoint
curl http://localhost:8081/api/v1/pricing/new-deals
# Expected: JSON array with recent price changes

# 6. Test frontend integration
# Visit http://localhost:3000
# Expected: NewDealsSection shows real data from API
```

**Validation Checklist**:
- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] Manual crawl trigger works (returns pricing data)
- [ ] Pricing API returns data from database
- [ ] New deals endpoint filters correctly (last 24h)
- [ ] Frontend displays real data (not mocks)
- [ ] Deal badges appear correctly on FirmCard
- [ ] No CORS errors in browser console

#### 1.2 Identify & Fix Issues

**Common Issues to Check**:

1. **Database Connection**
   - Check DATABASE_URL in `.env`
   - Verify PostgreSQL is running (docker ps)
   - Check connection string format

2. **Missing Dependencies**
   - Run `npm install` in backend/price-intelligence
   - Check package.json dependencies are installed

3. **Port Conflicts**
   - Ensure port 8081 is not in use
   - Check frontend env (NEXT_PUBLIC_API_URL)

4. **Crawler Issues**
   - Verify Puppeteer can launch (may need additional dependencies in Docker)
   - Check HTML selectors match actual website structure
   - Test with sample HTML first

5. **Frontend API Calls**
   - Check browser Network tab for API requests
   - Verify CORS headers in responses
   - Check error handling in pricingService

---

### Priority 2: Documentation & Walkthrough (NEXT)

#### 2.1 Create Walkthrough Document

**File**: `backend/price-intelligence/WALKTHROUGH.md`

**Contents**:
```markdown
# Price Intelligence Module - Walkthrough

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- Node.js 20.9+ installed
- PostgreSQL client (optional, for DB inspection)

### 2. Start Services
...

### 3. Test Crawling
...

### 4. Verify Frontend Integration
...

## Troubleshooting
...

## API Reference
...
```

**Action**: Create this document with step-by-step verification

#### 2.2 Update Validation Reports

**Files to Create/Update**:
- `PHASE_1_IMPLEMENTATION_VALIDATION.md` - Document Phase 1.1 completion
- Update `docs/ROADMAP.md` - Mark Phase 1.1 items as complete

---

### Priority 3: Automated Testing (THIS WEEK)

#### 3.1 Backend Tests

**Create Test Files**:

1. **PricingRepository.test.ts**
   ```typescript
   describe('PricingRepository', () => {
     it('should save pricing snapshot', async () => {
       // Test savePricingSnapshot
     });

     it('should retrieve current pricing', async () => {
       // Test getCurrentPricing
     });

     it('should filter by discount', async () => {
       // Test getBulkPricing with minDiscount filter
     });
   });
   ```

2. **PriceCrawler.test.ts**
   ```typescript
   describe('PriceCrawler', () => {
     it('should crawl pricing page', async () => {
       // Mock Puppeteer, test HTML extraction
     });

     it('should handle errors gracefully', async () => {
       // Test timeout, invalid URL
     });
   });
   ```

3. **ChangeDetectionService.test.ts**
   ```typescript
   describe('ChangeDetectionService', () => {
     it('should detect price increase', () => {
       // Test detectChanges with price increase
     });

     it('should detect discount change', () => {
       // Test discount percent changes
     });
   });
   ```

**Run Tests**:
```bash
cd backend/price-intelligence
npm test
```

**Target**: >80% code coverage

#### 3.2 Frontend Tests

**Create Test Files**:

1. **NewDealsSection.test.tsx**
   ```typescript
   describe('NewDealsSection', () => {
     it('should display loading state', () => {
       // Test loading UI
     });

     it('should display deals from API', async () => {
       // Mock pricingService, test rendering
     });

     it('should handle API errors', async () => {
       // Test error state
     });
   });
   ```

2. **pricingService.test.ts**
   ```typescript
   describe('pricingService', () => {
     it('should fetch pricing list', async () => {
       // Mock fetch, test API call
     });

     it('should handle 404 for firm pricing', async () => {
       // Test null return on 404
     });
   });
   ```

**Run Tests**:
```bash
cd frontend
npm test
```

#### 3.3 Integration Tests

**Create E2E Test** (Optional - Playwright/Cypress):
```typescript
test('New Deals workflow', async ({ page }) => {
  // 1. Navigate to homepage
  await page.goto('http://localhost:3000');

  // 2. Verify NewDealsSection appears
  await expect(page.locator('.section--deals')).toBeVisible();

  // 3. Verify deal badges
  await expect(page.locator('.badge--discount')).toBeVisible();

  // 4. Click "Get Funded" button
  // ...
});
```

---

### Priority 4: Scheduler Implementation (THIS WEEK)

#### 4.1 Add Cron Job System

**Goal**: Automatically crawl firms every N hours

**Approach**: Use `node-cron` library

**Implementation**:

1. **Install Dependencies**:
   ```bash
   npm install node-cron @types/node-cron
   ```

2. **Create Scheduler Service**:
   ```typescript
   // src/services/CrawlScheduler.ts
   import cron from 'node-cron';

   export class CrawlScheduler {
     private jobs: Map<string, cron.ScheduledTask> = new Map();

     scheduleForFirm(firmId: string, frequency: string, callback: () => Promise<void>) {
       const cronExpression = this.parseToCron(frequency); // '1h' -> '0 */1 * * *'

       const job = cron.schedule(cronExpression, async () => {
         console.log(`[Scheduler] Running scheduled crawl for ${firmId}`);
         await callback();
       });

       this.jobs.set(firmId, job);
     }

     stopAll() {
       this.jobs.forEach(job => job.stop());
     }
   }
   ```

3. **Integrate in src/index.ts**:
   ```typescript
   import { CrawlScheduler } from './services/CrawlScheduler';

   const scheduler = new CrawlScheduler();

   // Schedule all active firms
   catalogRepo.getAllActive().then(entries => {
     entries.forEach(entry => {
       scheduler.scheduleForFirm(entry.propFirmId, entry.crawlFrequency, async () => {
         // Trigger crawl logic (same as /admin/crawl endpoint)
       });
     });
   });
   ```

**Configuration** (in `.env`):
```env
ENABLE_SCHEDULER=true
DEFAULT_CRAWL_FREQUENCY=6h
```

---

### Priority 5: Monitoring & Logging (THIS WEEK)

#### 5.1 Add Structured Logging

**Goal**: Better observability and debugging

**Implementation**:

1. **Already have winston dependency**, configure it:
   ```typescript
   // src/utils/logger.ts
   import winston from 'winston';

   export const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });
   ```

2. **Replace console.log with logger**:
   ```typescript
   // Before:
   console.log('[Crawler] Starting crawl...');

   // After:
   logger.info('Starting crawl', { firmId, url });
   ```

#### 5.2 Add Health Check Endpoint

**Implementation**:
```typescript
// src/index.ts
router.get('/health', async (req, res) => {
  try {
    // Check DB connection
    await pricingRepo.pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        crawler: 'up',
        scheduler: scheduler.isRunning() ? 'up' : 'down'
      }
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

**Access**: http://localhost:8081/api/v1/health

---

### Priority 6: Production Readiness (NEXT WEEK)

#### 6.1 Docker Integration for Price Intelligence

**Goal**: Run price-intelligence backend in Docker

**Create Dockerfile**:
```dockerfile
# backend/price-intelligence/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

**Update docker-compose.yml**:
```yaml
services:
  # ... existing services

  price-intelligence:
    build: ./backend/price-intelligence
    ports:
      - "8081:8081"
    environment:
      - DATABASE_URL=postgresql://admin:admin123@db:5432/propfirms_mvp
      - PORT=8081
      - ENABLE_SCHEDULER=true
    depends_on:
      - db
```

#### 6.2 Environment Variable Management

**Create comprehensive .env.example**:
```env
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/propfirms_mvp

# Server
PORT=8081
NODE_ENV=development

# Scheduler
ENABLE_SCHEDULER=false
DEFAULT_CRAWL_FREQUENCY=6h

# Crawler
PUPPETEER_HEADLESS=true
CRAWLER_TIMEOUT=30000
MAX_CONCURRENT_CRAWLS=3

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/price-intelligence
```

#### 6.3 Rate Limiting & Anti-Bot Measures

**Implement Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP'
});

app.use('/api/v1', apiLimiter);
```

**Crawler Anti-Detection**:
- Randomize User-Agent headers
- Add delays between requests (1-5 seconds)
- Rotate proxies (if needed)
- Respect robots.txt

---

### Priority 7: Database Optimizations (NEXT WEEK)

#### 7.1 Add Indexes

**Missing Indexes**:
```sql
-- For faster change detection queries
CREATE INDEX idx_pricing_snapshots_firm_date
ON pricing_snapshots(prop_firm_id, created_at DESC);

-- For discount filtering
CREATE INDEX idx_pricing_snapshots_discount
ON pricing_snapshots(discount_percent)
WHERE discount_percent > 0;

-- For new deals query (last 24h)
CREATE INDEX idx_pricing_snapshots_recent
ON pricing_snapshots(created_at DESC)
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Add to**: `infrastructure/docker/init-scripts/pricing-schema.sql`

#### 7.2 Implement PropFirmName Join

**Fix PricingService.ts line 89**:

Current:
```typescript
propFirmName: 'TODO', // Will come from prop-firm table join
```

Fixed:
```typescript
// In PricingRepository.getCurrentPricing:
const query = `
  SELECT ps.*, pf.name as prop_firm_name
  FROM pricing_snapshots ps
  LEFT JOIN prop_firms pf ON ps.prop_firm_id = pf.id
  WHERE ps.prop_firm_id = $1
  ...
`;

// Then map in PricingService:
propFirmName: pricing.propFirmName || 'Unknown Firm',
```

---

### Priority 8: CI/CD Updates (NEXT WEEK)

#### 8.1 Update GitHub Actions

**Add price-intelligence tests to workflow**:
```yaml
# .github/workflows/ci.yml
jobs:
  # ... existing jobs

  price-intelligence-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: backend/price-intelligence
        run: npm ci
      - name: Run tests
        working-directory: backend/price-intelligence
        run: npm test
      - name: Build TypeScript
        working-directory: backend/price-intelligence
        run: npm run build
```

---

## Summary: Next 7 Days Action Plan

### Day 1-2 (Today & Tomorrow)
- [ ] Manual testing & verification (Priority 1)
- [ ] Fix any critical bugs discovered
- [ ] Create WALKTHROUGH.md documentation (Priority 2)
- [ ] Update ROADMAP.md with Phase 1.1 progress

### Day 3-4
- [ ] Write backend unit tests (Priority 3.1)
- [ ] Write frontend tests (Priority 3.2)
- [ ] Achieve >80% code coverage
- [ ] Fix PropFirmName join issue (Priority 7.2)

### Day 5-6
- [ ] Implement CrawlScheduler (Priority 4)
- [ ] Add structured logging with winston (Priority 5.1)
- [ ] Add health check endpoint (Priority 5.2)
- [ ] Add database indexes (Priority 7.1)

### Day 7
- [ ] Docker integration for price-intelligence (Priority 6.1)
- [ ] Update CI/CD pipeline (Priority 8)
- [ ] Create PHASE_1_IMPLEMENTATION_VALIDATION.md
- [ ] Push all changes to GitHub

---

## Long-Term Roadmap (Phase 2+)

### Phase 2: Production Deployment (2-3 weeks)
- [ ] Deploy to AWS/Azure
- [ ] Set up monitoring (CloudWatch/Application Insights)
- [ ] Implement alerting (PagerDuty/OpsGenie)
- [ ] Add user authentication (Auth0)
- [ ] Implement True Cost Calculator
- [ ] Affiliate analytics dashboard

### Phase 3: Enterprise Scale (1-2 months)
- [ ] Kubernetes deployment
- [ ] Multi-region setup
- [ ] CDN integration
- [ ] Advanced caching strategies
- [ ] Performance optimization

---

## Questions to Answer

1. **Scheduler Frequency**: Should we crawl all firms every 6h, or customize per firm?
2. **Error Handling**: What happens when a crawl fails? Retry logic? Alert?
3. **Data Retention**: How long should we keep pricing snapshots? (30 days? 1 year?)
4. **Rate Limiting**: Do we need proxy rotation now, or wait until we scale?
5. **Testing Strategy**: E2E tests now, or after Phase 1.1 completion?

---

## Success Criteria for Phase 1.1 Completion

✅ **Functional**:
- [ ] All 3 pricing endpoints return real data from database
- [ ] Manual crawl trigger works for all firms in source_catalog
- [ ] Frontend displays real pricing data (not mocks)
- [ ] Deal badges appear correctly based on API data
- [ ] Change detection tracks price deltas over time

✅ **Quality**:
- [ ] >80% test coverage (backend + frontend)
- [ ] All tests passing in CI/CD
- [ ] No critical bugs or errors in logs
- [ ] Documentation is complete and accurate

✅ **Production-Ready**:
- [ ] Runs in Docker Compose
- [ ] Health check endpoint implemented
- [ ] Structured logging in place
- [ ] Environment variables documented
- [ ] Scheduler running (if enabled)

---

**Current Focus**: Priority 1 (Testing & Verification)

**Next Update**: After manual testing completion, document results and create walkthrough.

**Estimated Time to Phase 1.1 Completion**: 5-7 days (with testing + scheduler + Docker integration)
