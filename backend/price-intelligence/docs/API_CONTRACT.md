# Pricing API Contract

## Overview

All pricing endpoints return JSON responses with consistent structure.

## Endpoints

### GET /api/v1/pricing/prop-firms

**Description:** List all current pricing with optional filters

**Query Parameters:**
- `propFirmIds` (string, comma-separated) – Filter by firm IDs
  - Example: `?propFirmIds=apex-trader-funding,tradeify`
- `minDiscount` (number, 0-100) – Filter to firms with at least this discount
  - Example: `?minDiscount=20`
- `hasChangedOnly` (boolean) – Only return firms with recent changes
  - Example: `?hasChangedOnly=true`

**Response:**

```json
{
  "data": [
    {
      "propFirmId": "apex-trader-funding",
      "propFirmName": "Apex Trader Funding",
      "accountSize": 50000,
      "accountSizeCurrency": "USD",
      "currentPrice": 297,
      "priceCurrency": "USD",
      "discountPercent": 0,
      "lastUpdatedAt": "2025-12-28T10:30:00Z",
      "lastUpdatedAgo": "2 hours ago",
      "isNewDeal": false,
      "requiresManualReview": false,
      "sourceUrl": "https://www.apextraderfunding.com/pricing",
      "affiliateLink": "https://affiliate.apex.com?code=PW"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  }
}
```

### GET /api/v1/pricing/prop-firms/{propFirmId}

**Description:** Get current pricing for a specific firm

**Path Parameters:**
- `propFirmId` (string) – Firm ID slug
  - Example: `apex-trader-funding`

**Query Parameters:**
- `accountSize` (number) – Optional; filter by account size
  - Example: `?accountSize=50000`

**Response:**

```json
{
  "propFirmId": "apex-trader-funding",
  "propFirmName": "Apex Trader Funding",
  "accountSize": 50000,
  "currentPrice": 297,
  "discountPercent": 0,
  "lastUpdatedAt": "2025-12-28T10:30:00Z",
  "lastUpdatedAgo": "2 hours ago",
  "isNewDeal": false,
  "affiliateLink": "https://affiliate.apex.com?code=PW"
}
```

### GET /api/v1/pricing/new-deals

**Description:** Get pricing changes detected in last 24 hours

**Response:**

```json
[
  {
    "propFirmId": "tradeify",
    "propFirmName": "Tradeify",
    "accountSize": 50000,
    "currentPrice": 199,
    "discountPercent": 30,
    "discountLabel": "New Year Special",
    "lastUpdatedAt": "2025-12-28T08:15:00Z",
    "lastUpdatedAgo": "4 hours ago",
    "isNewDeal": true,
    "affiliateLink": "https://tradeify.com/ref/PW"
  }
]
```

## Error Responses

### 404 Not Found
Returned when prop-firm doesn't exist or has no pricing data.

```json
{
  "error": "Prop firm not found",
  "statusCode": 404,
  "propFirmId": "unknown-firm"
}
```

### 400 Bad Request
Invalid query parameters.

```json
{
  "error": "Invalid minDiscount; must be between 0 and 100",
  "statusCode": 400
}
```

### 500 Internal Server Error
Unexpected error.

```json
{
  "error": "Internal server error",
  "statusCode": 500,
  "requestId": "abc123"
}
```

## Rate Limiting

- **Phase 0:** No rate limiting
- **Phase 1:** 100 requests/minute per API key

## Caching

- **Pricing List:** Cached for 5 minutes
- **Individual Pricing:** Cached for 10 minutes
- **New Deals:** Cached for 1 minute

## CORS

Enabled for `localhost:3000` (frontend dev) and `onlypropfirms.com` (production).
