# Validation Checklist (Phase 0)

Use this checklist to verify the "Priority 1" completion status.

## 1. Infrastructure Startup
- [ ] Run `cd infrastructure/docker && docker-compose up --build`
- [ ] Verify `onlypropfirms-db` is **Healthy** (Green)
- [ ] Verify `onlypropfirms-backend` started (Log: "Started OnlyPropFirmsApplication")
- [ ] Verify `onlypropfirms-frontend` started (Log: "Ready on http://localhost:3000")

## 2. API Validation (Backend)
Run these commands or use Postman:

### List Firms
```bash
curl -i http://localhost:8081/api/v1/prop-firms
# Expect: 200 OK, JSON array with 3 firms (Apex, Topstep, MyFundedFutures)
```

### Get Details
```bash
curl -i http://localhost:8081/api/v1/prop-firms/apex-trader
# Expect: 200 OK, JSON object with "evaluationFee": 147.00
```

### Filter Firms
```bash
curl -X POST http://localhost:8081/api/v1/filter-firms \
  -H "Content-Type: application/json" \
  -d '{"minFunding": 50000}'
# Expect: 200 OK, JSON with matchCount >= 1
```

## 3. Database Validation
- [ ] Connect to DB: `psql -h localhost -U admin propfirms_mvp`
- [ ] Query: `SELECT count(*) FROM prop_firms;` (Should be 3)
- [ ] Query: `\dt` (Should show `prop_firms` and `filters_applied`)

## 4. Frontend Validation
- [ ] Open http://localhost:3000
- [ ] Expect: Next.js Welcome Page (since we haven't built the UI yet, but server responds)
