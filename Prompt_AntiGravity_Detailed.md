# DETAILLIERTE IMPLEMENTIERUNGS-PROMPT FÜR ANTIGRAVITY
## Price Intelligence & Pricing Catalog System für OnlyPropFirms

**Datum:** 28. Dezember 2025  
**Adressat:** @AntiGravity (GitHub-Direktzugriff)  
**Kontext:** OnlyPropFirms Phase 0 MVP – Price Intelligence Layer (konzeptionell, keine Produktions-Crawler)  
**Ziel:** Struktur, API-Verträge, Frontend-Integration vorbereiten; echte Crawler später  
**Deadline:** Möglich bis 31. Dezember 2025 (strukturelle Vorbereitung)

---

## PART 1: VERZEICHNIS-STRUKTUR ANLEGEN

### 1.1 Neue Backend-Verzeichnis-Struktur

Falls noch **kein** `backend/` Verzeichnis existiert, lege das an. Falls ja, erweitere wie folgt:

```
backend/
├── price-intelligence/                          ← NEUES MODUL
│   ├── src/
│   │   ├── models/
│   │   │   ├── Pricing.ts                      (TypeScript Interface)
│   │   │   ├── PricingSnapshot.ts              (Versioned pricing data)
│   │   │   └── SourceCatalogEntry.ts           (Prop-firm source config)
│   │   │
│   │   ├── dtos/
│   │   │   ├── PricingDTO.ts                   (API response format)
│   │   │   ├── PricingListDTO.ts               (Paginated list response)
│   │   │   ├── SourceCatalogDTO.ts             (Catalog entry DTO)
│   │   │   └── PricingChangeDTO.ts             (Change detection result)
│   │   │
│   │   ├── schemas/
│   │   │   ├── sourceCatalog.schema.json       (JSON schema für Source Catalog)
│   │   │   └── pricing.schema.json             (Pricing data validation schema)
│   │   │
│   │   ├── configs/
│   │   │   └── sourceCatalog.seed.json         (Initiale Prop-Firm Liste)
│   │   │
│   │   ├── interfaces/
│   │   │   ├── IPricingStore.ts                (Interface: Pricing-Persistierung)
│   │   │   ├── IPriceChangeDetector.ts         (Interface: Änderungserkennung)
│   │   │   ├── IPriceNormalizer.ts             (Interface: Daten-Normalisierung)
│   │   │   └── IPriceCrawler.ts                (Interface: künftiger Crawler)
│   │   │
│   │   ├── services/
│   │   │   ├── PricingService.ts               (Business logic)
│   │   │   ├── SourceCatalogService.ts         (Catalog management)
│   │   │   └── ChangeDetectionService.ts       (Diff-Logik)
│   │   │
│   │   ├── controllers/
│   │   │   └── PricingController.ts            (REST endpoints)
│   │   │
│   │   ├── repositories/
│   │   │   ├── PricingRepository.ts            (DB access – placeholder)
│   │   │   └── SourceCatalogRepository.ts      (Catalog DB access)
│   │   │
│   │   └── types/
│   │       └── index.ts                        (Alle TypeScript exports)
│   │
│   ├── docs/
│   │   ├── OVERVIEW.md                         (Modul-Erklärung)
│   │   ├── ARCHITECTURE.md                     (Detaillierter Aufbau)
│   │   ├── API_CONTRACT.md                     (API-Endpoints + Beispiele)
│   │   ├── PHASE_0_SCOPE.md                    (Was Phase 0, was Phase 1+)
│   │   └── CRAWLER_STRATEGY.md                 (Zukünftige Crawler-Planung)
│   │
│   ├── tests/
│   │   ├── models/
│   │   │   └── Pricing.test.ts                 (Model validation tests)
│   │   ├── services/
│   │   │   ├── ChangeDetection.test.ts
│   │   │   └── SourceCatalog.test.ts
│   │   └── api/
│   │       └── pricing.contract.test.ts        (API contract tests)
│   │
│   ├── README.md                               (Quick start)
│   └── openapi/
│       └── pricing.openapi.yaml                (OpenAPI spec)
│
└── [rest of backend structure unchanged]
```

---

## PART 2: DETAILLIERTE DATEI-INHALTE

### 2.1 Models (Backend Core Types)

**Datei:** `backend/price-intelligence/src/models/Pricing.ts`

```typescript
/**
 * Core Pricing Model
 * Represents the current price & discount information for a Prop Firm
 */
export interface Pricing {
  // Identity
  id?: string; // UUID, auto-generated on persistence
  propFirmId: string; // Links to prop-firm entity
  
  // Pricing Data
  accountSize: number; // in USD (e.g., 25000, 50000, 100000)
  accountSizeCurrency: 'USD' | 'EUR' | 'GBP'; // Typically USD
  
  // Current Pricing
  currentPrice: number; // Account evaluation cost in local currency
  priceCurrency: 'USD' | 'EUR' | 'GBP';
  discountPercent: number; // 0-100; 0 = no discount
  discountLabel?: string; // e.g., "Holiday Special", "Black Friday", "New Year"
  
  // Fees Breakdown (Optional, for True Cost calculation later)
  evaluationFee?: number;
  activationFee?: number;
  resetFee?: number;
  monthlyDataFee?: number;
  
  // Meta
  sourceUrl: string; // Where this price came from
  sourceTimestamp: Date; // When we found this price (from crawler)
  lastSeenAt: Date; // When we last verified this price
  
  // Change Tracking
  hasChanged: boolean; // Did this change since last snapshot?
  changedAt?: Date; // When it changed
  
  // QA Flags
  requiresManualReview: boolean; // Parser failed, needs human check
  isVerified: boolean; // Has a human confirmed this price?
  notes?: string; // Internal notes (e.g., "Price format unusual")
}

/**
 * Pricing Snapshot for Versioning
 * Immutable record of a pricing observation
 */
export interface PricingSnapshot extends Pricing {
  snapshotId: string; // UUID, unique per observation
  snapshotCreatedAt: Date; // When this snapshot was recorded
  version: number; // Incrementing version for this prop-firm + account-size combo
}
```

**Datei:** `backend/price-intelligence/src/models/SourceCatalogEntry.ts`

```typescript
/**
 * Source Catalog Entry
 * Defines HOW and WHERE to fetch pricing data for a Prop Firm
 */
export interface SourceCatalogEntry {
  // Identity
  propFirmId: string; // Must match prop-firm table
  propFirmName: string; // Denormalized for readability
  
  // URLs
  officialUrl: string; // Main website
  pricingPageUrl: string; // Specific pricing page
  affiliateBaseUrl?: string; // Where to redirect for affiliate tracking
  
  // Update Strategy
  updateStrategy: 'api' | 'html' | 'manual' | 'inactive';
  updateFrequency: 'realtime' | 'hourly' | '4hourly' | 'daily' | 'weekly' | 'manual';
  
  // If API-based
  apiEndpoint?: string; // URL to pricing API, if available
  apiAuthentication?: 'none' | 'bearer_token' | 'api_key'; // Auth method
  apiKey?: string; // ENCRYPTED; stored in secrets manager in production
  
  // If HTML-based
  htmlSelectors?: {
    accountSizeSelector?: string; // CSS/XPath to account size label
    priceSelector?: string; // CSS/XPath to price
    discountSelector?: string; // CSS/XPath to discount
    containerSelector?: string; // Parent container for repeated pricing rows
  };
  
  // Data Mapping
  expectedFields: string[]; // Which fields to extract: ['price', 'discount', 'resetFee']
  fieldMapping?: Record<string, string>; // Map source field names to internal model
  
  // Validation
  priceRangeMin?: number; // Sanity check: price should be > this
  priceRangeMax?: number; // Sanity check: price should be < this
  
  // Metadata
  isActive: boolean; // Should crawler include this?
  lastCheckedAt?: Date; // Last successful fetch
  lastFailureAt?: Date; // Last error
  failureCount: number; // Consecutive failures
  maxConsecutiveFailures: number; // After this many, mark as inactive
  
  // Notes
  notes?: string; // e.g., "Site blocks scrapers; use API instead"
  maintainedBy?: string; // GitHub handle of person responsible
}
```

**Datei:** `backend/price-intelligence/src/models/ChangeDetection.ts`

```typescript
/**
 * Price Change Detection Result
 */
export interface PriceChange {
  propFirmId: string;
  accountSize: number;
  
  // What changed?
  fieldChanges: {
    fieldName: string; // 'currentPrice' | 'discountPercent' | 'resetFee'
    oldValue: any;
    newValue: any;
    changedAt: Date;
  }[];
  
  // Impact
  hasSignificantChange: boolean; // Is this noteworthy for user?
  changeReasons?: string[]; // e.g., ["discount_increased", "fee_added"]
  
  // Metadata
  compareTimestamp: Date;
}

export interface ChangeDetectionResult {
  timestamp: Date;
  totalEntriesProcessed: number;
  changesDetected: PriceChange[];
  newDeals: PriceChange[]; // Changes in last 24 hours
  failedComparisons: {
    propFirmId: string;
    reason: string;
  }[];
}
```

---

### 2.2 DTOs (API Response Format)

**Datei:** `backend/price-intelligence/src/dtos/PricingDTO.ts`

```typescript
/**
 * API Response DTO
 * What the frontend receives from GET /api/v1/pricing/prop-firms/{id}
 */
export interface PricingDTO {
  // Identity
  propFirmId: string;
  propFirmName: string;
  
  // Price Information
  accountSize: number;
  accountSizeCurrency: string;
  
  currentPrice: number;
  priceCurrency: string;
  discountPercent: number;
  discountLabel?: string;
  
  // True Cost (calculated)
  trueCost?: {
    evaluationFee: number;
    activationFee: number;
    totalFirstMonth: number;
  };
  
  // Recency
  lastUpdatedAt: Date;
  lastUpdatedAtISO: string; // ISO string for frontend
  lastUpdatedAgo: string; // "2 hours ago", human-readable
  
  // Flags for UI
  isNewDeal: boolean; // Changed in last 24h?
  isFeaturedDeal?: boolean; // Admin-marked as featured?
  requiresManualReview: boolean;
  
  // Links
  affiliateLink?: string; // Where to click "Get Funded"
  sourceUrl: string; // Where we found this price
}

export interface PricingListDTO {
  data: PricingDTO[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  filters?: {
    propFirmId?: string;
    minDiscount?: number;
    hasChangedOnly?: boolean;
  };
}
```

**Datei:** `backend/price-intelligence/src/dtos/SourceCatalogDTO.ts`

```typescript
/**
 * Public view of Source Catalog
 * (Internal; not exposed to external API)
 */
export interface SourceCatalogDTO {
  propFirmId: string;
  propFirmName: string;
  
  pricingPageUrl: string;
  updateStrategy: string;
  updateFrequency: string;
  
  isActive: boolean;
  lastCheckedAt?: Date;
  failureCount: number;
  
  expectedFields: string[];
}
```

---

### 2.3 Schemas (Validation & Configuration)

**Datei:** `backend/price-intelligence/src/schemas/sourceCatalog.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Source Catalog Entry",
  "type": "object",
  "required": ["propFirmId", "propFirmName", "officialUrl", "pricingPageUrl", "updateStrategy"],
  "properties": {
    "propFirmId": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Unique identifier (slug format)"
    },
    "propFirmName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "officialUrl": {
      "type": "string",
      "format": "uri"
    },
    "pricingPageUrl": {
      "type": "string",
      "format": "uri"
    },
    "updateStrategy": {
      "type": "string",
      "enum": ["api", "html", "manual", "inactive"]
    },
    "updateFrequency": {
      "type": "string",
      "enum": ["realtime", "hourly", "4hourly", "daily", "weekly", "manual"]
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "expectedFields": {
      "type": "array",
      "items": { "type": "string" },
      "examples": [["price", "discount", "resetFee"]]
    }
  }
}
```

**Datei:** `backend/price-intelligence/src/configs/sourceCatalog.seed.json`

Dies ist der **INITIALER DATENSATZ** – keine echten Preise, nur Struktur:

```json
{
  "catalog": [
    {
      "propFirmId": "apex-trader-funding",
      "propFirmName": "Apex Trader Funding",
      "officialUrl": "https://www.apextraderfunding.com",
      "pricingPageUrl": "https://www.apextraderfunding.com/pricing",
      "affiliateBaseUrl": "https://affiliate.apextraderfunding.com?code=PW",
      "updateStrategy": "html",
      "updateFrequency": "daily",
      "isActive": true,
      "htmlSelectors": {
        "containerSelector": ".pricing-package",
        "accountSizeSelector": ".account-size",
        "priceSelector": ".price",
        "discountSelector": ".discount-badge"
      },
      "expectedFields": ["price", "discount"],
      "priceRangeMin": 50,
      "priceRangeMax": 1000,
      "notes": "Uses responsive pricing table; requires careful selector tuning"
    },
    {
      "propFirmId": "tradeify",
      "propFirmName": "Tradeify",
      "officialUrl": "https://www.tradeify.com",
      "pricingPageUrl": "https://www.tradeify.com/pricing",
      "affiliateBaseUrl": "https://tradeify.com/ref/PW",
      "updateStrategy": "manual",
      "updateFrequency": "weekly",
      "isActive": true,
      "expectedFields": ["price"],
      "notes": "No API available; price changes infrequently"
    },
    {
      "propFirmId": "the-trade-makers",
      "propFirmName": "TheTradeMakers",
      "officialUrl": "https://thettrademakers.com",
      "pricingPageUrl": "https://thetrademakers.com/challenges",
      "updateStrategy": "inactive",
      "updateFrequency": "manual",
      "isActive": false,
      "expectedFields": [],
      "notes": "Site restructured; crawler not yet updated"
    }
  ]
}
```

---

### 2.4 Interfaces (Business Logic Contracts)

**Datei:** `backend/price-intelligence/src/interfaces/IPricingStore.ts`

```typescript
/**
 * Interface: Pricing Persistence Layer
 * Implemented by: PricingRepository (Phase 1+)
 */
export interface IPricingStore {
  /**
   * Save a new pricing snapshot
   */
  savePricingSnapshot(pricing: Pricing): Promise<PricingSnapshot>;
  
  /**
   * Retrieve current pricing for a firm
   */
  getCurrentPricing(propFirmId: string, accountSize?: number): Promise<Pricing | null>;
  
  /**
   * Retrieve pricing history (for price graphs later)
   */
  getPricingHistory(propFirmId: string, accountSize: number, days: number): Promise<PricingSnapshot[]>;
  
  /**
   * Bulk get current pricing for multiple firms
   */
  getBulkPricing(filters?: { propFirmIds?: string[]; minDiscount?: number }): Promise<Pricing[]>;
}
```

**Datei:** `backend/price-intelligence/src/interfaces/IPriceChangeDetector.ts`

```typescript
/**
 * Interface: Change Detection Logic
 * Implemented by: ChangeDetectionService
 */
export interface IPriceChangeDetector {
  /**
   * Compare old vs new pricing snapshots
   */
  detectChanges(oldSnapshot: Pricing, newSnapshot: Pricing): PriceChange | null;
  
  /**
   * Mark all changes from last 24h
   */
  getRecentChanges(since: Date): Promise<PriceChange[]>;
  
  /**
   * Identify "new deals" (significant price drops)
   */
  identifyNewDeals(changeThresholdPercent: number): Promise<PriceChange[]>;
}
```

**Datei:** `backend/price-intelligence/src/interfaces/IPriceNormalizer.ts`

```typescript
/**
 * Interface: Data Normalization
 * Converts HTML/API responses into internal Pricing model
 * Implemented by: PricingNormalizerService (Phase 1+)
 */
export interface IPriceNormalizer {
  /**
   * Parse HTML response into Pricing[]
   */
  normalizeFromHTML(
    html: string,
    catalogEntry: SourceCatalogEntry
  ): Promise<Pricing[]>;
  
  /**
   * Parse API response into Pricing[]
   */
  normalizeFromAPI(
    apiResponse: Record<string, any>,
    catalogEntry: SourceCatalogEntry
  ): Promise<Pricing[]>;
  
  /**
   * Validate pricing data against schema
   */
  validate(pricing: Partial<Pricing>): { valid: boolean; errors: string[] };
}
```

**Datei:** `backend/price-intelligence/src/interfaces/IPriceCrawler.ts`

```typescript
/**
 * Interface: Web Crawler (Placeholder for Phase 1+)
 * Will be implemented in separate module when ready
 */
export interface IPriceCrawler {
  /**
   * Fetch pricing from external source
   */
  crawlPricingPage(catalogEntry: SourceCatalogEntry): Promise<string | Record<string, any>>;
  
  /**
   * Respect robots.txt and rate limits
   */
  configureLimits(maxRequestsPerHour: number, respectRobotsTxt: boolean): void;
  
  /**
   * Schedule periodic crawls
   */
  schedulePeriodicCrawl(catalogEntry: SourceCatalogEntry, frequency: string): Promise<void>;
}
```

---

### 2.5 Services (Business Logic)

**Datei:** `backend/price-intelligence/src/services/PricingService.ts`

```typescript
import { IPricingStore } from '../interfaces/IPricingStore';
import { IPriceChangeDetector } from '../interfaces/IPriceChangeDetector';
import { Pricing, PricingSnapshot } from '../models/Pricing';
import { PricingDTO, PricingListDTO } from '../dtos/PricingDTO';

/**
 * Service: Pricing Business Logic
 * Orchestrates pricing retrieval, change detection, and API responses
 * 
 * Dependencies:
 * - IPricingStore (to be injected)
 * - IPriceChangeDetector (to be injected)
 */
export class PricingService {
  constructor(
    private pricingStore: IPricingStore,
    private changeDetector: IPriceChangeDetector
  ) {}
  
  /**
   * Get current pricing for a firm (formatted as DTO for API)
   */
  async getPricingForFirm(
    propFirmId: string,
    accountSize?: number
  ): Promise<PricingDTO | null> {
    const pricing = await this.pricingStore.getCurrentPricing(propFirmId, accountSize);
    
    if (!pricing) return null;
    
    return this.mapToPricingDTO(pricing);
  }
  
  /**
   * Get list of all current pricing (with filters)
   */
  async getPricingList(filters?: {
    propFirmIds?: string[];
    minDiscount?: number;
    hasChangedOnly?: boolean;
  }): Promise<PricingListDTO> {
    const pricings = await this.pricingStore.getBulkPricing(filters);
    
    const dtos = pricings.map(p => this.mapToPricingDTO(p));
    
    return {
      data: dtos,
      meta: {
        total: dtos.length,
        page: 1,
        pageSize: dtos.length,
        hasMore: false
      },
      filters
    };
  }
  
  /**
   * Get recent deals (changed in last 24h)
   */
  async getNewDeals(): Promise<PricingDTO[]> {
    const changes = await this.changeDetector.getRecentChanges(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const deals = await Promise.all(
      changes.map(change =>
        this.pricingStore.getCurrentPricing(change.propFirmId)
      )
    );
    
    return deals
      .filter(d => d !== null)
      .map(d => this.mapToPricingDTO(d!));
  }
  
  /**
   * Internal: Map Pricing model to DTO
   */
  private mapToPricingDTO(pricing: Pricing): PricingDTO {
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - pricing.lastSeenAt.getTime()) / 60000);
    const lastUpdatedAgo = minutesAgo < 60 
      ? `${minutesAgo}m ago`
      : `${Math.floor(minutesAgo / 60)}h ago`;
    
    return {
      propFirmId: pricing.propFirmId,
      propFirmName: 'TODO', // Will come from prop-firm table join
      accountSize: pricing.accountSize,
      accountSizeCurrency: pricing.accountSizeCurrency,
      currentPrice: pricing.currentPrice,
      priceCurrency: pricing.priceCurrency,
      discountPercent: pricing.discountPercent,
      discountLabel: pricing.discountLabel,
      lastUpdatedAt: pricing.lastSeenAt,
      lastUpdatedAtISO: pricing.lastSeenAt.toISOString(),
      lastUpdatedAgo,
      isNewDeal: pricing.hasChanged && 
        (now.getTime() - pricing.changedAt!.getTime()) < 24 * 60 * 60 * 1000,
      requiresManualReview: pricing.requiresManualReview,
      sourceUrl: pricing.sourceUrl
    };
  }
}
```

**Datei:** `backend/price-intelligence/src/services/SourceCatalogService.ts`

```typescript
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

/**
 * Service: Source Catalog Management
 * Manages the catalog of Prop Firms to crawl
 */
export class SourceCatalogService {
  private catalog: Map<string, SourceCatalogEntry> = new Map();
  
  /**
   * Load catalog from JSON seed file
   */
  async loadCatalogFromSeed(seedPath: string): Promise<void> {
    // TODO: Implement in Phase 1
    console.log(`Loading catalog from ${seedPath}`);
  }
  
  /**
   * Get active catalog entries (to be crawled)
   */
  getActiveCatalogEntries(): SourceCatalogEntry[] {
    return Array.from(this.catalog.values()).filter(e => e.isActive);
  }
  
  /**
   * Get catalog entry by prop-firm ID
   */
  getCatalogEntry(propFirmId: string): SourceCatalogEntry | undefined {
    return this.catalog.get(propFirmId);
  }
  
  /**
   * Update catalog entry (e.g., after successful crawl)
   */
  async updateCatalogEntry(
    propFirmId: string,
    updates: Partial<SourceCatalogEntry>
  ): Promise<void> {
    const entry = this.catalog.get(propFirmId);
    if (entry) {
      Object.assign(entry, updates);
    }
  }
  
  /**
   * Mark entry as needing manual review
   */
  async markForManualReview(propFirmId: string, reason: string): Promise<void> {
    const entry = this.catalog.get(propFirmId);
    if (entry) {
      entry.notes = `[Manual Review Needed] ${reason}`;
    }
  }
}
```

---

### 2.6 Controllers (REST Endpoints)

**Datei:** `backend/price-intelligence/src/controllers/PricingController.ts`

```typescript
import { PricingService } from '../services/PricingService';

/**
 * Controller: Pricing REST Endpoints
 * 
 * Endpoints:
 * - GET /api/v1/pricing/prop-firms
 * - GET /api/v1/pricing/prop-firms/{propFirmId}
 * - GET /api/v1/pricing/new-deals
 * 
 * (Implementation details for Spring Boot / Express / Fastify to be done Phase 1+)
 */
export class PricingController {
  constructor(private pricingService: PricingService) {}
  
  /**
   * GET /api/v1/pricing/prop-firms
   * Query params: ?propFirmIds=apex,tradeify&minDiscount=10&hasChangedOnly=true
   */
  async listPricing(query: any) {
    const filters = {
      propFirmIds: query.propFirmIds?.split(','),
      minDiscount: parseInt(query.minDiscount, 10) || undefined,
      hasChangedOnly: query.hasChangedOnly === 'true'
    };
    
    return await this.pricingService.getPricingList(filters);
  }
  
  /**
   * GET /api/v1/pricing/prop-firms/{propFirmId}
   * Query params: ?accountSize=50000
   */
  async getPricingForFirm(propFirmId: string, query: any) {
    const accountSize = query.accountSize ? parseInt(query.accountSize, 10) : undefined;
    const pricing = await this.pricingService.getPricingForFirm(propFirmId, accountSize);
    
    if (!pricing) {
      return { error: 'Pricing not found', statusCode: 404 };
    }
    
    return pricing;
  }
  
  /**
   * GET /api/v1/pricing/new-deals
   * Returns deals changed in last 24 hours
   */
  async getNewDeals() {
    return await this.pricingService.getNewDeals();
  }
}
```

---

### 2.7 OpenAPI Specification

**Datei:** `backend/price-intelligence/openapi/pricing.openapi.yaml`

```yaml
openapi: 3.0.0
info:
  title: OnlyPropFirms Pricing API
  version: 1.0.0-alpha
  description: |
    Pricing Intelligence API for OnlyPropFirms.
    Returns current prices, discounts, and deal information for Prop Firms.
    
    **Phase 0 Status:** API contract defined; backend implementation in progress.
    **Data Source:** Dummy/seed data; real crawlers added in Phase 1.

servers:
  - url: http://localhost:8080/api/v1
    description: Local development
  - url: https://api.onlypropfirms.com/api/v1
    description: Production

paths:
  /pricing/prop-firms:
    get:
      summary: List all current pricing
      description: Returns a list of all Prop Firms with current pricing data
      parameters:
        - name: propFirmIds
          in: query
          description: Comma-separated list of prop-firm IDs to filter
          example: "apex-trader-funding,tradeify"
          schema:
            type: string
        - name: minDiscount
          in: query
          description: Filter to firms with at least this discount percentage
          schema:
            type: number
            minimum: 0
            maximum: 100
        - name: hasChangedOnly
          in: query
          description: If true, only return firms with price changes
          schema:
            type: boolean
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PricingListResponse'
        '400':
          description: Bad request (invalid filters)
        '500':
          description: Server error

  /pricing/prop-firms/{propFirmId}:
    get:
      summary: Get pricing for a specific Prop Firm
      parameters:
        - name: propFirmId
          in: path
          required: true
          example: "apex-trader-funding"
          schema:
            type: string
        - name: accountSize
          in: query
          description: Optional; filter by specific account size (USD)
          example: 50000
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PricingDTO'
        '404':
          description: Prop Firm not found
        '500':
          description: Server error

  /pricing/new-deals:
    get:
      summary: Get new deals (price changes in last 24h)
      description: Returns Prop Firms with pricing changes detected in the last 24 hours
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/PricingDTO'
        '500':
          description: Server error

components:
  schemas:
    PricingDTO:
      type: object
      properties:
        propFirmId:
          type: string
          example: "apex-trader-funding"
        propFirmName:
          type: string
          example: "Apex Trader Funding"
        accountSize:
          type: number
          example: 50000
        accountSizeCurrency:
          type: string
          enum: ["USD", "EUR", "GBP"]
        currentPrice:
          type: number
          description: "Evaluation cost for this account size"
          example: 297
        priceCurrency:
          type: string
          enum: ["USD", "EUR", "GBP"]
        discountPercent:
          type: number
          minimum: 0
          maximum: 100
          example: 20
        discountLabel:
          type: string
          example: "Holiday Special"
          nullable: true
        trueCost:
          type: object
          nullable: true
          properties:
            evaluationFee:
              type: number
            activationFee:
              type: number
            totalFirstMonth:
              type: number
        lastUpdatedAt:
          type: string
          format: date-time
        lastUpdatedAgo:
          type: string
          example: "2 hours ago"
        isNewDeal:
          type: boolean
          description: "Changed in last 24 hours?"
        isFeaturedDeal:
          type: boolean
          nullable: true
        requiresManualReview:
          type: boolean
        sourceUrl:
          type: string
          format: uri
        affiliateLink:
          type: string
          format: uri
          nullable: true

    PricingListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/PricingDTO'
        meta:
          type: object
          properties:
            total:
              type: integer
            page:
              type: integer
            pageSize:
              type: integer
            hasMore:
              type: boolean
        filters:
          type: object
          nullable: true
```

---

## PART 3: FRONTEND-INTEGRATIONEN

### 3.1 Frontend Types

**Datei:** `frontend/src/types/pricing.ts`

```typescript
/**
 * Frontend Type Definitions for Pricing Data
 * Mirrors backend PricingDTO, but may include UI-specific fields
 */

export interface Pricing {
  // Identity
  propFirmId: string;
  propFirmName: string;
  
  // Price Information
  accountSize: number;
  accountSizeCurrency: 'USD' | 'EUR' | 'GBP';
  
  currentPrice: number;
  priceCurrency: 'USD' | 'EUR' | 'GBP';
  discountPercent: number;
  discountLabel?: string;
  
  // Recency
  lastUpdatedAt: Date;
  lastUpdatedAtISO: string;
  lastUpdatedAgo: string; // "2 hours ago"
  
  // UI Flags
  isNewDeal: boolean;
  isFeaturedDeal?: boolean;
  requiresManualReview: boolean;
  
  // Links
  affiliateLink?: string;
  sourceUrl: string;
}

export interface PricingListResponse {
  data: Pricing[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

/**
 * Deal Badge Information (for UI components)
 */
export interface DealBadge {
  label: string; // "NEUER DEAL", "-20% DISCOUNT", "NEW"
  variant: 'new' | 'discount' | 'featured' | 'alert';
  tooltip?: string;
}

export function getDealBadges(pricing: Pricing): DealBadge[] {
  const badges: DealBadge[] = [];
  
  if (pricing.isNewDeal) {
    badges.push({
      label: 'NEUER DEAL',
      variant: 'new',
      tooltip: `Changed ${pricing.lastUpdatedAgo}`
    });
  }
  
  if (pricing.discountPercent > 0) {
    badges.push({
      label: `-${pricing.discountPercent}% DISCOUNT`,
      variant: 'discount',
      tooltip: pricing.discountLabel || 'Limited time offer'
    });
  }
  
  if (pricing.isFeaturedDeal) {
    badges.push({
      label: 'FEATURED',
      variant: 'featured'
    });
  }
  
  if (pricing.requiresManualReview) {
    badges.push({
      label: 'PRICE UNVERIFIED',
      variant: 'alert'
    });
  }
  
  return badges;
}
```

### 3.2 Frontend Service

**Datei:** `frontend/src/services/pricingService.ts`

```typescript
import { Pricing, PricingListResponse } from '../types/pricing';

/**
 * Service: Pricing API Integration
 * 
 * Phase 0: Uses mock data + Postman/curl testing
 * Phase 1: Real API calls to backend
 */
class PricingService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  
  /**
   * Fetch pricing list (with optional filters)
   */
  async fetchPricingList(params?: {
    propFirmIds?: string[];
    minDiscount?: number;
    hasChangedOnly?: boolean;
  }): Promise<PricingListResponse> {
    // TODO: Phase 1 – Replace with real API call
    // const response = await fetch(`${this.baseUrl}/pricing/prop-firms?...`);
    // return response.json();
    
    // Phase 0: Return mock data
    console.warn('[Phase 0 Mock] fetchPricingList called with params:', params);
    return this.getMockPricingList();
  }
  
  /**
   * Fetch pricing for a specific firm
   */
  async fetchPricingForFirm(
    propFirmId: string,
    accountSize?: number
  ): Promise<Pricing | null> {
    // TODO: Phase 1 – Real API call
    // const response = await fetch(
    //   `${this.baseUrl}/pricing/prop-firms/${propFirmId}?accountSize=${accountSize}`
    // );
    // if (response.status === 404) return null;
    // return response.json();
    
    // Phase 0: Mock data
    console.warn(`[Phase 0 Mock] fetchPricingForFirm(${propFirmId}, ${accountSize})`);
    const list = this.getMockPricingList();
    return list.data.find(p => p.propFirmId === propFirmId) || null;
  }
  
  /**
   * Fetch new deals (last 24h)
   */
  async fetchNewDeals(): Promise<Pricing[]> {
    // TODO: Phase 1 – Real API call
    // const response = await fetch(`${this.baseUrl}/pricing/new-deals`);
    // return response.json();
    
    // Phase 0: Mock
    console.warn('[Phase 0 Mock] fetchNewDeals called');
    return this.getMockPricingList().data.filter(p => p.isNewDeal);
  }
  
  /**
   * MOCK DATA (Phase 0 only)
   */
  private getMockPricingList(): PricingListResponse {
    return {
      data: [
        {
          propFirmId: 'apex-trader-funding',
          propFirmName: 'Apex Trader Funding',
          accountSize: 50000,
          accountSizeCurrency: 'USD',
          currentPrice: 297,
          priceCurrency: 'USD',
          discountPercent: 0,
          lastUpdatedAt: new Date(),
          lastUpdatedAtISO: new Date().toISOString(),
          lastUpdatedAgo: '2 hours ago',
          isNewDeal: false,
          requiresManualReview: false,
          sourceUrl: 'https://www.apextraderfunding.com/pricing',
          affiliateLink: 'https://affiliate.apex.com?code=PW'
        },
        {
          propFirmId: 'tradeify',
          propFirmName: 'Tradeify',
          accountSize: 50000,
          accountSizeCurrency: 'USD',
          currentPrice: 199,
          priceCurrency: 'USD',
          discountPercent: 30,
          discountLabel: 'New Year Special',
          lastUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastUpdatedAtISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastUpdatedAgo: '2 hours ago',
          isNewDeal: true,
          requiresManualReview: false,
          sourceUrl: 'https://www.tradeify.com/pricing',
          affiliateLink: 'https://tradeify.com/ref/PW'
        }
      ],
      meta: {
        total: 2,
        page: 1,
        pageSize: 20,
        hasMore: false
      }
    };
  }
}

export const pricingService = new PricingService();
```

### 3.3 FirmCard Component (mit Deal-Badges)

**Datei:** `frontend/src/components/propFirm/FirmCard.tsx`

```typescript
import React from 'react';
import { Pricing, getDealBadges, DealBadge } from '../../types/pricing';

interface FirmCardProps {
  propFirmId: string;
  propFirmName: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  
  // NEW: Pricing information
  pricing?: Pricing;
  
  // Handlers
  onViewDetails?: () => void;
  onGetFunded?: () => void;
}

/**
 * Component: Firm Card with Deal Badges
 * Shows a single Prop Firm card with optional pricing info and deal badges
 */
export const FirmCard: React.FC<FirmCardProps> = ({
  propFirmId,
  propFirmName,
  logo,
  rating,
  reviewCount,
  pricing,
  onViewDetails,
  onGetFunded
}) => {
  const badges = pricing ? getDealBadges(pricing) : [];
  
  return (
    <article className="firm-card" data-firm-id={propFirmId}>
      {/* Badge Section */}
      {badges.length > 0 && (
        <div className="firm-card__badges">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className={`badge badge--${badge.variant}`}
              title={badge.tooltip}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}
      
      {/* Header */}
      <header className="firm-card__header">
        {logo && <img src={logo} alt={propFirmName} />}
        <h3>{propFirmName}</h3>
      </header>
      
      {/* Metrics */}
      <div className="firm-card__metrics">
        {rating && <span className="rating">★ {rating.toFixed(1)}</span>}
        {reviewCount && <span className="reviews">({reviewCount} reviews)</span>}
      </div>
      
      {/* Pricing (Phase 0+) */}
      {pricing && (
        <div className="firm-card__pricing">
          <div className="price-row">
            <span className="label">Account Size:</span>
            <span className="value">
              {pricing.accountSize.toLocaleString()} {pricing.accountSizeCurrency}
            </span>
          </div>
          <div className="price-row">
            <span className="label">Evaluation Fee:</span>
            <span className="value">
              {pricing.currentPrice} {pricing.priceCurrency}
              {pricing.discountPercent > 0 && (
                <span className="discount"> (-{pricing.discountPercent}%)</span>
              )}
            </span>
          </div>
          <div className="price-row meta">
            <span className="label">Last Updated:</span>
            <span className="value">{pricing.lastUpdatedAgo}</span>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <footer className="firm-card__footer">
        <button
          className="btn btn--secondary"
          onClick={onViewDetails}
        >
          View Details
        </button>
        <a
          href={pricing?.affiliateLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          onClick={onGetFunded}
        >
          Get Funded
        </a>
      </footer>
    </article>
  );
};
```

### 3.4 Home Page „New Deals" Section

**Datei:** `frontend/src/components/home/NewDealsSection.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Pricing } from '../../types/pricing';
import { pricingService } from '../../services/pricingService';
import { FirmCard } from '../propFirm/FirmCard';

/**
 * Component: New Deals Section (Homepage)
 * Displays the top 3-5 recent deal changes
 */
export const NewDealsSection: React.FC = () => {
  const [deals, setDeals] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadNewDeals = async () => {
      try {
        setLoading(true);
        const newDeals = await pricingService.fetchNewDeals();
        setDeals(newDeals.slice(0, 5)); // Top 5
        setError(null);
      } catch (err) {
        setError('Failed to load new deals');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadNewDeals();
  }, []);
  
  if (loading) return <div className="section section--deals">Loading deals...</div>;
  if (error) return <div className="section section--deals error">{error}</div>;
  if (deals.length === 0) return null; // Don't show if no deals
  
  return (
    <section className="section section--deals">
      <div className="section__header">
        <h2>🔥 Fresh Deals This Week</h2>
        <p>Price changes detected in the last 24 hours</p>
      </div>
      
      <div className="deals-grid">
        {deals.map(deal => (
          <FirmCard
            key={deal.propFirmId}
            propFirmId={deal.propFirmId}
            propFirmName={deal.propFirmName}
            pricing={deal}
            onGetFunded={() => {
              // Log affiliate click (Phase 0.5)
              console.log('Affiliate click:', deal.propFirmId);
            }}
          />
        ))}
      </div>
    </section>
  );
};
```

---

## PART 4: DOKUMENTATION

### 4.1 OVERVIEW.md

**Datei:** `backend/price-intelligence/docs/OVERVIEW.md`

```markdown
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
Compares old vs. new pricing snapshots to identify:
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
```

### 4.2 API_CONTRACT.md

**Datei:** `backend/price-intelligence/docs/API_CONTRACT.md`

```markdown
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

## Testing

### Using cURL

```bash
# Get all pricing
curl http://localhost:8080/api/v1/pricing/prop-firms

# Get specific firm
curl http://localhost:8080/api/v1/pricing/prop-firms/apex-trader-funding

# Filter by discount
curl http://localhost:8080/api/v1/pricing/prop-firms?minDiscount=20

# Get new deals
curl http://localhost:8080/api/v1/pricing/new-deals
```

### Using Postman

Import `backend/price-intelligence/openapi/pricing.openapi.yaml` into Postman.
```

### 4.3 PHASE_0_SCOPE.md

**Datei:** `backend/price-intelligence/docs/PHASE_0_SCOPE.md`

```markdown
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
```

---

## PART 5: CHECKLISTE FÜR ANTIGRAVITY

Hier ist die **AKTION-CHECKLISTE** für AntiGravity:

```markdown
# IMPLEMENTATION CHECKLIST FÜR ANTIGRAVITY

## Step 1: Repository Analysis (15 min)
- [ ] Verify Next.js frontend exists in `frontend/`
- [ ] Check if `backend/` directory exists
  - If YES: verify structure
  - If NO: will create as part of this task
- [ ] Read ARCHITECTURE.md and ADR-006_MVP_Scope.md
- [ ] Confirm this is Phase 0 (concepts, no live crawlers)

## Step 2: Create Directory Structure (20 min)
- [ ] Create `backend/price-intelligence/` directory tree (as specified in PART 1)
- [ ] Create `src/models/`, `src/dtos/`, `src/interfaces/`, etc.
- [ ] Create `docs/`, `openapi/`, `tests/` directories
- [ ] Create `.gitkeep` files if directories are empty

## Step 3: Create Backend Models (30 min)
- [ ] Create `src/models/Pricing.ts` (from PART 2.1)
- [ ] Create `src/models/SourceCatalogEntry.ts` (from PART 2.1)
- [ ] Create `src/models/ChangeDetection.ts` (from PART 2.1)
- [ ] Verify TypeScript syntax (no errors in IDE)

## Step 4: Create DTOs (20 min)
- [ ] Create `src/dtos/PricingDTO.ts` (from PART 2.2)
- [ ] Create `src/dtos/PricingListDTO.ts` (from PART 2.2)
- [ ] Create `src/dtos/SourceCatalogDTO.ts` (from PART 2.2)

## Step 5: Create Schemas & Configs (20 min)
- [ ] Create `src/schemas/sourceCatalog.schema.json` (from PART 2.3)
- [ ] Create `src/schemas/pricing.schema.json` (optional, basic validation)
- [ ] Create `src/configs/sourceCatalog.seed.json` (5-10 example firms, from PART 2.3)
- [ ] Verify JSON is valid (use online JSON validator if needed)

## Step 6: Create Interfaces (15 min)
- [ ] Create `src/interfaces/IPricingStore.ts` (from PART 2.4)
- [ ] Create `src/interfaces/IPriceChangeDetector.ts` (from PART 2.4)
- [ ] Create `src/interfaces/IPriceNormalizer.ts` (from PART 2.4)
- [ ] Create `src/interfaces/IPriceCrawler.ts` (from PART 2.4)
- [ ] Add comment: "Implementation deferred to Phase 1"

## Step 7: Create Services (30 min)
- [ ] Create `src/services/PricingService.ts` (from PART 2.5)
- [ ] Create `src/services/SourceCatalogService.ts` (from PART 2.5)
- [ ] Create `src/services/ChangeDetectionService.ts` (stub: comment "Phase 1")
- [ ] Verify imports & exports are correct

## Step 8: Create Controllers (15 min)
- [ ] Create `src/controllers/PricingController.ts` (from PART 2.6)
- [ ] Add comment: "Wiring to Express/Spring Boot in Phase 1"

## Step 9: Create OpenAPI Specification (10 min)
- [ ] Create `openapi/pricing.openapi.yaml` (from PART 2.7)
- [ ] Validate YAML syntax (use online YAML validator)
- [ ] Verify endpoint paths match controller methods

## Step 10: Create Frontend Types (20 min)
- [ ] Create `frontend/src/types/pricing.ts` (from PART 3.1)
- [ ] Create `frontend/src/services/pricingService.ts` (from PART 3.2)
  - Ensure mock data returns valid Pricing[] objects
  - Test by importing in a component

## Step 11: Update Frontend Components (30 min)
- [ ] Update `frontend/src/components/propFirm/FirmCard.tsx` (add Pricing prop + badges)
- [ ] Create `frontend/src/components/home/NewDealsSection.tsx` (from PART 3.4)
- [ ] Add NewDealsSection to homepage (import + include in JSX)
- [ ] Test: components render without errors (npm run dev)

## Step 12: Create Documentation (40 min)
- [ ] Create `backend/price-intelligence/docs/OVERVIEW.md` (from PART 4.1)
- [ ] Create `backend/price-intelligence/docs/API_CONTRACT.md` (from PART 4.2)
- [ ] Create `backend/price-intelligence/docs/PHASE_0_SCOPE.md` (from PART 4.3)
- [ ] Create `backend/price-intelligence/docs/ARCHITECTURE.md` (brief diagram)
- [ ] Create `backend/price-intelligence/docs/CRAWLER_STRATEGY.md` (Phase 1 planning)
- [ ] Create `backend/price-intelligence/README.md` (quick start guide)

## Step 13: Create Test Stubs (20 min)
- [ ] Create `tests/models/Pricing.test.ts` (placeholder with comment "Phase 1")
- [ ] Create `tests/services/ChangeDetection.test.ts` (placeholder)
- [ ] Create `tests/api/pricing.contract.test.ts` (placeholder)

## Step 14: Create/Update ADR (20 min)
- [ ] Create `docs/ADR-007_Price_Intelligence_Strategy.md` (or append to ADR-006)
  - Summarize Phase 0 scope
  - Link to price-intelligence module
  - Explain transition to Phase 1

## Step 15: Update ROADMAP.md (15 min)
- [ ] Add section: "Price Intelligence (Phase 0)"
- [ ] List tasks completed (all PART 1-4 items)
- [ ] Mark as "Ready for Phase 1: Backend + Crawler Implementation"

## Step 16: Git Commit (10 min)
- [ ] Stage all files: `git add backend/price-intelligence frontend/src/types/pricing.ts ...`
- [ ] Commit message:
  ```
  feat: Price Intelligence module structure (Phase 0)
  
  - Add source catalog schema & seed data
  - Add Pricing models, DTOs, and API contract
  - Add interfaces for services (implementation in Phase 1)
  - Add frontend types and mock pricingService
  - Add FirmCard deal badges and NewDealsSection component
  - Add comprehensive documentation & OpenAPI spec
  
  Phase 0 Status: READY FOR TESTING
  Next: Connect to real backend + implement crawler (Phase 1)
  ```

## Step 17: Verification (10 min)
- [ ] Run `npm run lint` in frontend (no errors)
- [ ] Run `npm run build` in frontend (builds successfully)
- [ ] Check that pricingService imports work (no red squiggles in IDE)
- [ ] Verify FirmCard component renders with pricing prop (no TypeScript errors)
- [ ] Confirm git status shows all files added

## FINAL STEP: Summary for Team
When complete, post in Slack/GitHub:

```
✅ **Price Intelligence Module - Phase 0 Complete**

**What was added:**
- Backend module structure (models, DTOs, interfaces, services)
- OpenAPI specification (3 endpoints)
- Frontend types & mock API integration
- FirmCard deal badges, NewDealsSection component
- Documentation & API contract

**What is NOT included (Phase 1):**
- Web crawler (Puppeteer, Cheerio)
- Database persistence
- Scheduler/cron jobs
- Real external API calls

**Next step:** Phase 1 implementation (backend + crawler)

**Files changed:** ~25 new files across backend/ & frontend/
**Test it:** npm run dev → homepage should show mock deals with badges
```
```

---

## PART 6: TIME ESTIMATE & SEQUENCING

| Task | Duration | Who | Dependencies |
|------|----------|-----|--------------|
| Step 1-2: Analysis + Structure | 35 min | AntiGravity | None |
| Step 3-5: Models + Schemas | 70 min | AntiGravity | Steps 1-2 |
| Step 6-7: Interfaces + Services | 45 min | AntiGravity | Steps 3-5 |
| Step 8-9: Controller + OpenAPI | 25 min | AntiGravity | Step 7 |
| Step 10-11: Frontend Integration | 50 min | AntiGravity | Step 9 |
| Step 12-13: Documentation + Tests | 60 min | AntiGravity | All above |
| Step 14-15: ADR + ROADMAP | 35 min | @architecture-lead | All above |
| Step 16-17: Git + Verification | 20 min | AntiGravity | All above |
| **TOTAL** | **~5.5 hours** | AntiGravity + Lead | Sequential |

**Timeline:** 
- Start: Dec 28, 2025 (~17:30 CET)
- Realistic completion: Dec 29, 2025 (morning)
- Ideal: Dec 28, 2025 (evening, if uninterrupted)

---

## PART 7: VALIDATION CHECKLIST (Post-Implementation)

After AntiGravity completes all steps, run these tests:

```bash
# 1. Frontend Build
cd frontend
npm install
npm run build
# → Should complete without errors

# 2. Lint Frontend
npm run lint -- --fix
# → Should show no errors in types/pricing.ts or services/pricingService.ts

# 3. Verify Imports
grep -r "from '@/types/pricing'" frontend/src/
# → Should find FirmCard.tsx, NewDealsSection.tsx

# 4. Validate JSON Files
# Use online validator or:
# cat backend/price-intelligence/src/configs/sourceCatalog.seed.json | jq .
# → Should parse without errors

# 5. Validate YAML
# cat backend/price-intelligence/openapi/pricing.openapi.yaml | yamllint -
# → Should have no critical errors

# 6. Visual Check
cd frontend
npm run dev
# → Navigate to homepage
# → Should see "🔥 Fresh Deals This Week" section
# → Should see deal badges on mock firms
```

---

**FINAL NOTE:**

Dies ist eine **vollständig spezifizierte, Copy-Paste-Ready Prompt**. AntiGravity kann alle Dateien direkt 1:1 erstellen, ohne zu raten oder zu improvisieren. Jede Datei hat:
- ✅ Exakter Pfad
- ✅ Vollständiger Inhalt
- ✅ Klare Struktur
- ✅ Kommentare wo nötig
- ✅ Phase-Hinweise (Phase 0 vs. Phase 1+)

Nach Abschluss hat das Projekt eine **solide konzeptionelle Fundament** für Phase 1, ohne sich in Live-Crawlern zu verlaufen.

