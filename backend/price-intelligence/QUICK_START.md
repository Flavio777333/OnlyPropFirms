# Price Intelligence Module - Quick Start Guide

**Version**: Phase 1.1 (Implementation Complete)
**Last Updated**: 2025-12-28

---

## Prerequisites

- Docker & Docker Compose installed
- Node.js 20.9+ installed
- PostgreSQL running (via Docker Compose)

---

## Quick Start (5 Minutes)

### Step 1: Start Database

```bash
# From project root
cd infrastructure/docker
docker-compose up -d db

# Wait for PostgreSQL to be ready (10 seconds)
docker-compose logs -f db
# Look for: "database system is ready to accept connections"
```

### Step 2: Install Dependencies

```bash
# Navigate to price-intelligence module
cd ../../backend/price-intelligence

# Install npm packages
npm install
```

### Step 3: Configure Environment

```bash
# Create .env file (or use existing)
cat > .env << EOF
DATABASE_URL=postgresql://admin:admin123@localhost:5432/propfirms_mvp
PORT=8081
NODE_ENV=development
ENABLE_SCHEDULER=false
LOG_LEVEL=info
EOF
```

### Step 4: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Expected output:
# [Init] Connecting to database...
# [Server] Price Intelligence Service running on port 8081
```

### Step 5: Verify API

**Test Health Check**:
```bash
curl http://localhost:8081/api/v1/health
# Expected: { "status": "ok", "timestamp": "..." }
```

**Test Pricing List**:
```bash
curl http://localhost:8081/api/v1/pricing/prop-firms
# Expected: { "data": [], "meta": {...} } (empty initially)
```

### Step 6: Trigger Manual Crawl

```bash
# Crawl a specific firm
curl -X POST http://localhost:8081/api/v1/admin/crawl/apex-trader-funding

# Expected output:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "snapshot_id": "...",
      "prop_firm_id": "apex-trader-funding",
      "account_size": 50000,
      "current_price": 297.00,
      "discount_percent": 0,
      ...
    }
  ]
}
```

### Step 7: Verify Data Saved

```bash
# Check pricing list again
curl http://localhost:8081/api/v1/pricing/prop-firms
# Expected: JSON array with crawled pricing data
```

### Step 8: Test Frontend Integration

```bash
# Start Next.js frontend (in separate terminal)
cd ../../frontend
npm run dev

# Visit http://localhost:3000
# Expected: NewDealsSection shows real pricing data
```

---

## API Endpoints

### 1. GET /api/v1/pricing/prop-firms

**Description**: List all pricing snapshots with optional filters

**Query Parameters**:
- `propFirmIds` (string): Comma-separated firm IDs (e.g., "apex,tradeify")
- `minDiscount` (number): Minimum discount percentage (0-100)
- `hasChangedOnly` (boolean): Only show recent changes

**Example**:
```bash
# Get all pricing
curl http://localhost:8081/api/v1/pricing/prop-firms

# Get pricing with at least 20% discount
curl "http://localhost:8081/api/v1/pricing/prop-firms?minDiscount=20"

# Get specific firms
curl "http://localhost:8081/api/v1/pricing/prop-firms?propFirmIds=apex-trader-funding,tradeify"
```

**Response**:
```json
{
  "data": [
    {
      "propFirmId": "apex-trader-funding",
      "propFirmName": "Apex Trader Funding",
      "accountSize": 50000,
      "accountSizeCurrency": "USD",
      "currentPrice": 297.00,
      "priceCurrency": "USD",
      "discountPercent": 0,
      "lastUpdatedAt": "2025-12-28T10:00:00Z",
      "lastUpdatedAtISO": "2025-12-28T10:00:00Z",
      "lastUpdatedAgo": "2h ago",
      "isNewDeal": false,
      "requiresManualReview": false,
      "sourceUrl": "https://apextraderfunding.com/pricing"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  }
}
```

### 2. GET /api/v1/pricing/prop-firms/:id

**Description**: Get pricing for a specific firm

**Path Parameters**:
- `id` (string): Firm ID (e.g., "apex-trader-funding")

**Query Parameters**:
- `accountSize` (number): Specific account size (optional)

**Example**:
```bash
curl http://localhost:8081/api/v1/pricing/prop-firms/apex-trader-funding

# Get pricing for specific account size
curl "http://localhost:8081/api/v1/pricing/prop-firms/apex-trader-funding?accountSize=50000"
```

**Response**: Same format as list endpoint (single object)

### 3. GET /api/v1/pricing/new-deals

**Description**: Get pricing changes from last 24 hours

**Example**:
```bash
curl http://localhost:8081/api/v1/pricing/new-deals
```

**Response**: Array of pricing objects (same format as list)

### 4. POST /api/v1/admin/crawl/:firmId

**Description**: Manually trigger crawl for a specific firm

**Path Parameters**:
- `firmId` (string): Firm ID to crawl

**Example**:
```bash
curl -X POST http://localhost:8081/api/v1/admin/crawl/apex-trader-funding
```

**Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d db

# Check logs
docker-compose logs db
```

### Issue: "Module not found" errors

**Solution**:
```bash
cd backend/price-intelligence
rm -rf node_modules package-lock.json
npm install
```

### Issue: Crawl fails with "Navigation timeout"

**Possible Causes**:
1. Website is slow or blocking automated requests
2. HTML selectors in source_catalog are incorrect
3. Network issues

**Solution**:
```bash
# Check catalog configuration
psql -h localhost -U admin -d propfirms_mvp -c "SELECT * FROM source_catalog;"

# Update selectors if needed
```

### Issue: Frontend shows empty data

**Checklist**:
1. Is backend running on port 8081? (`curl http://localhost:8081/api/v1/pricing/prop-firms`)
2. Is NEXT_PUBLIC_API_URL correct in frontend/.env? (`http://localhost:8081/api/v1`)
3. Check browser console for CORS errors
4. Verify database has data (`SELECT * FROM pricing_snapshots;`)

---

## Database Inspection

### Connect to Database

```bash
# Using Docker
docker exec -it onlypropfirms-db psql -U admin -d propfirms_mvp

# Or using local psql
psql -h localhost -U admin -d propfirms_mvp
# Password: admin123
```

### Useful Queries

```sql
-- Check source catalog
SELECT * FROM source_catalog;

-- Check recent pricing snapshots
SELECT * FROM pricing_snapshots ORDER BY snapshot_created_at DESC LIMIT 10;

-- Count snapshots per firm
SELECT prop_firm_id, COUNT(*)
FROM pricing_snapshots
GROUP BY prop_firm_id;

-- Find new deals (last 24h)
SELECT * FROM pricing_snapshots
WHERE snapshot_created_at > NOW() - INTERVAL '24 hours'
ORDER BY snapshot_created_at DESC;
```

---

## Development Workflow

### Make Code Changes

1. Edit files in `src/`
2. Server auto-reloads (if using `npm run dev`)
3. Test with curl or Postman

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string (required) |
| `PORT` | 8081 | Server port |
| `NODE_ENV` | development | Environment (development/production) |
| `ENABLE_SCHEDULER` | false | Enable automatic crawling |
| `DEFAULT_CRAWL_FREQUENCY` | 6h | Default crawl interval |
| `LOG_LEVEL` | info | Logging level (debug/info/warn/error) |
| `PUPPETEER_HEADLESS` | true | Run Puppeteer headless |
| `CRAWLER_TIMEOUT` | 30000 | Crawler timeout (ms) |

---

## Next Steps

After verifying everything works:

1. **Add More Firms to Source Catalog**:
   ```sql
   INSERT INTO source_catalog (prop_firm_id, prop_firm_name, official_url, pricing_page_url)
   VALUES ('tradeify', 'Tradeify', 'https://tradeify.com', 'https://tradeify.com/pricing');
   ```

2. **Test Automated Crawling**:
   - Set `ENABLE_SCHEDULER=true` in .env
   - Restart server
   - Check logs for scheduled crawls

3. **Write Tests**:
   - See `tests/` directory for examples
   - Run `npm test` to verify

4. **Deploy to Docker**:
   - See main `PHASE_1_NEXT_STEPS.md` for Docker integration

---

## Support

- **Documentation**: See `docs/` folder
- **API Contract**: `openapi/pricing.openapi.yaml`
- **Architecture**: `docs/OVERVIEW.md`
- **Issues**: Check GitHub Issues

---

**Status**: ✅ Ready for development and testing
**Last Verified**: 2025-12-28
