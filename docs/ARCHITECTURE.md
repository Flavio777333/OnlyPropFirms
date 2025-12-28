# OnlyPropFirms – Vollständige Softwarearchitektur-Analyse

**Version:** 1.0  
**Datum:** 28. Dezember 2025  
**Architektur-Level:** Senior Software Architect  
**Scope:** Read-Only Frontend-Analyse + Backend-Hypothese + Architektur-Roadmap

---

## INHALTSVERZEICHNIS

1. [Webseiten-Analyse](#1-webseiten-analyse)
2. [Frontend-Struktur](#2-frontend-struktur)
3. [HTML- & DOM-Struktur](#3-html--dom-struktur)
4. [Client-seitige Logik](#4-client-seitige-logik)
5. [Backend-Hypothese](#5-backend-hypothese)
6. [Hermetische Projektstruktur](#6-hermetische-projektstruktur)
7. [Zentrale Roadmap-Datei](#7-zentrale-roadmap-datei)
8. [Git- & Branch-Strategie](#8-git--branch-strategie)
920. [Cloud-Readiness (Phase 2)](#9-cloud-readiness)
10. [Architektur-Entscheidungsregister](#10-architektur-entscheidungsregister)

---

## 0. IMPLEMENTATION RUNWAY (Added via ADR-006)

This architecture document describes the **final desired state**. Implementation follows the **Three-Phase Runway**:

- **Phase 0 (MVP):** Validate core business logic (Local Docker, 3 API endpoints, No K8s).
- **Phase 1 (Production):** AWS Deployment, True Cost Calculator, Economic Calendar.
- **Phase 2 (Scale):** Kubernetes, Multi-Region, Distributed Tracing (as described below).

**Refer to ADR-006 for the definitive scope boundary.**

---

## 1. WEBSEITEN-ANALYSE (Phase 0: Core Pages)

### 1.1 Geschäftszweck & Nutzersegmente

**Primäre Mission:**
- Prop Firm Vergleichstool für Futures-Trader
- Informationsdrehscheibe für tägliche Marktinsights
- Community-Building zwischen Trader und Prop Firms

**Nutzerklassen:**
| Nutzer-Typ | Primäres Ziel | Hauptfunktionalität |
|-----------|-----------|-----------|
| Evaluations-Trader | Richtige Prop Firm finden | Vergleich, True Cost Berechnung |
| Entry-Level Trader | Lernen & Vorbereitung | Tutorials, Economic Calendar |
| Community-Member | Austausch & Tipps | Discord, YouTube-Livestreams |
| Prop-Firms | Affiliate-Marketing | Referral-Codes, Tracking |

**Herkunfts-Funnel:**
```
SEO → Homepage → Prop Firm Vergleich 
                     ↓
                   Detailseite → YouTube Livestream → Affiliate
```

### 1.2 Hauptseiten-Inventar

| Seite | URL-Pattern | Zweck | Datenquelle |
|------|---------|---------|---------|
| Homepage | `/` | Hero, CTAs, Highlights | Statisch + API |
| Prop Firm Listing | `/prop-firms` | Suchbar, filterbar | CMS/DB |
| Vergleichstool | `/prop-firm-comparison` | Side-by-side Matrix | API |
| Firm Details | `/prop-firms/{slug}` | Einzelansicht + Affiliate-Links | API/CMS |
| Economic Calendar | `/economic-calendar` | Marktevents mit Filter | API (finnhub/eodhd) |
| Trading Articles | `/articles/*`, `/lessons/*` | SEO-Content | CMS |
| Trading Tools | `/trading-tools` | Externe Plattformen | Aggregate Links |
| About/Contact | `/about`, `/contact` | Branding + Support | Statisch |

**Beobachtung:** Hybrid-Struktur zwischen statischen Content-Seiten und dynamischen Datenabhängigen Tools.

### 1.3 Interaktionsmuster

**Primäre User Journeys:**

```
Journey 1: Prop Firm Auswahl
├─ Benutzer besucht Homepage
├─ Klickt "Top Rated Firms"
├─ Wird zur Listing-Seite geleitet
├─ Filtert nach Kosten, Splitup, Rules
├─ Klickt auf Firm → Detailseite
└─ Affiliate-Link klicken → prop-firm.com weiterleiten

Journey 2: True Cost Berechnung
├─ Seite "/prop-firm-comparison" laden
├─ Toggle: "No Resets" vs "1 Reset"
├─ Account-Größe wählen (50k, 100k, 200k)
├─ Dynamische Preis-Berechnung + Vergleichstabelle
└─ Affiliate-Link zum Firm

Journey 3: Market Preparation
├─ Economic Calendar öffnen
├─ Filter nach "High Impact"
├─ Land-Filter addieren
├─ Datum + Beschreibung lesen
└─ Trading entscheidungen treffen
```

---

## 2. FRONTEND-STRUKTUR (Phase 0: Core / Phase 1: Features)

### 2.1 Grobe Architektur-Schichten

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER               │
│  (HTML/CSS, UI Components, Views)       │
├─────────────────────────────────────────┤
│  STATE MANAGEMENT & API INTEGRATION     │
│  (JavaScript/TypeScript, Stores)        │
├─────────────────────────────────────────┤
│        EXTERNAL API INTEGRATIONS        │
│  (Prop Firm DB, Economic Calendar, CMS)│
└─────────────────────────────────────────┘
```

### 2.2 UI-Komponenten-Inventar

**Wiederkehrende Komponenten:**

| Komponente | Verwendung | State-Typ | Komplexität |
|---------|-----------|----------|----------|
| **FirmCard** | Listing, Homepage | Static Props | Niedrig |
| **ComparisonTable** | Vergleichstool | Dynamic (Filter) | Mittel |
| **CostCalculator** | True Cost Page | Stateful (Inputs) | Mittel |
| **EconomicCalendar** | Market Insights | Real-time, Filtered | Hoch |
| **FilterSidebar** | Mehrere Pages | Multi-Select | Mittel |
| **AffiliateButton** | Überall | Click→Track→Redirect | Niedrig |
| **FAQAccordion** | Firms, Tools | Toggle State | Niedrig |
| **NavigationBar** | Global | Sticky, Responsive | Niedrig |
| **HeroSection** | Homepage, Subpages | Statisch | Niedrig |
| **NewsletterForm** | Footer, Sidebars | Form Validation | Mittel |

### 2.3 Layout-Prinzipien

**Responsiv-Strategie:**
```
Mobile-First:
├─ Base: 320px (Phone)
├─ Tablet: 768px
└─ Desktop: 1200px+

Grid-System: CSS Grid + Flexbox Hybrid
├─ Container: max-width: 1200px
├─ Sidebar: 280px (collapsible mobile)
└─ Main Content: 1fr (flexible)

Color Palette (Observed):
├─ Primary: Teal/Cyan (Trading vibes)
├─ Neutral: Gray Scale (Clarity)
├─ Accent: Red (Alerts), Green (Profits)
└─ Background: Very light / Dark mode
```

**Seiten-Layout-Template:**
```
┌─── Header (Logo, Nav, Affiliate Button) ────┐
│                                             │
├─────────────────────────────────────────────┤
│  Sidebar (Mobile: hidden)  │  Main Content  │
│  ├─ Filter Widgets        │  ├─ Hero/Title │
│  ├─ Category Links        │  ├─ Data Table │
│  └─ CTA Buttons           │  ├─ Details    │
│                           │  └─ Related    │
│                           │                │
├─────────────────────────────────────────────┤
│  Footer (Links, Newsletter, Copyright)      │
└─────────────────────────────────────────────┘
```

---

## 3. HTML- & DOM-STRUKTUR

### 3.1 Wahrscheinliches Framework-Signal

**Vermutete Stack-Signale:**

| Signal | Indikator | Bewertung |
|--------|-----------|----------|
| Moderne Responsive | Mobile-optimiert, CSS-Grid | ✅ Modern |
| Framework-Wahrscheinlichkeit | Next.js / React | ⭐⭐⭐⭐ Sehr wahrscheinlich |
| Static Site Gen. | Fast Loading, SEO-optimiert | ⭐⭐⭐⭐ Indiziert |
| Content Mgmt. | Blog/Articles System | ⭐⭐⭐ Wahrscheinlich |
| E-Commerce Elemente | Affiliate Tracking, Buttons | ⭐⭐ Möglich |

**Gründe für React/Next.js:**
- Komplexe Filterlogik (Vergleichstool) → State-Management erforderlich
- Multiple Data-Sources (Prop Firms, Economic Calendar, Articles) → API-Integration
- Affiliate Tracking & Link-Manipulation → Client-seitige Event-Listener
- Dynamische Preisberechnungen (True Cost) → React-Komponentenstate
- SEO-Anforderungen + Dynamic Content → Next.js SSR/SSG ideal

### 3.2 Mutmaßliche DOM-Struktur

**Semantic HTML Grundstruktur:**

```html
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnlyPropFirms - Prop Firm Comparison & Trading Tools</title>
    <!-- SEO Meta Tags -->
    <meta name="description" content="...">
    <meta property="og:image" content="...">
    <!-- Analytics -->
    <script async src="...google-analytics..."></script>
    <!-- Stylesheets -->
    <link rel="stylesheet" href="/styles/main.css">
  </head>
  <body>
    <header>
      <nav class="navbar">
        <logo />
        <menu>Prop Firms | Comparison | Tools | Lessons | About</menu>
        <button class="affiliate-cta">Join Now</button>
      </nav>
    </header>

    <main id="app" data-ssr="true">
      <!-- React/Vue Root Element -->
      <section class="hero"></section>
      <section class="featured-firms"></section>
      <section class="comparison-tool"></section>
      <section class="resources"></section>
    </main>

    <footer>
      <div class="footer-grid">
        <section>Company Links</section>
        <section>Prop Firms</section>
        <section>Resources</section>
        <section>Newsletter Signup</section>
      </div>
      <p>Copyright © 2025</p>
    </footer>

    <!-- JavaScript Bundle (minified) -->
    <script src="/js/bundle.js"></script>
  </body>
</html>
```

### 3.3 Wiederverwendbare DOM-Muster

**Firm Card Pattern:**
```html
<article class="firm-card" data-firm-id="apex-trader-funding">
  <header>
    <img src="firm-logo.png" alt="Apex Trader Funding">
    <h3>Apex Trader Funding</h3>
  </header>
  <div class="firm-metrics">
    <span class="rating">★★★★★</span>
    <span class="profit-split">90/10</span>
  </div>
  <ul class="features">
    <li>✓ Up to 20 Accounts</li>
    <li>✓ 100% of first $25K</li>
  </ul>
  <footer>
    <a href="/prop-firms/apex-trader-funding" class="details-link">View Details</a>
    <a href="https://affiliate.apex.com?code=PW" class="affiliate-link">Get Funded</a>
  </footer>
</article>
```

**Vergleichstabelle Pattern:**
```html
<table class="comparison-table" role="grid" aria-label="Prop Firm Comparison">
  <thead>
    <tr>
      <th>Firm Name</th>
      <th>Funding</th>
      <th>Profit Split</th>
      <th>Rules</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <!-- Dynamic rows generated by JS -->
    <tr data-firm-id="apex">
      <td><strong>Apex Trader Funding</strong></td>
      <td>$25K - $500K</td>
      <td>90/10</td>
      <td><button class="rules-modal">View</button></td>
      <td><a class="affiliate-btn">Get Deal</a></td>
    </tr>
  </tbody>
</table>
```

**Filter Sidebar Pattern:**
```html
<aside class="sidebar" id="filters">
  <form class="filter-form">
    <fieldset>
      <legend>Account Size</legend>
      <label><input type="checkbox" name="size" value="25k"> $25K</label>
      <label><input type="checkbox" name="size" value="50k"> $50K</label>
      <label><input type="checkbox" name="size" value="100k"> $100K</label>
    </fieldset>
    
    <fieldset>
      <legend>Profit Split</legend>
      <label><input type="range" name="split" min="70" max="100"> 70-100%</label>
    </fieldset>
    
    <fieldset>
      <legend>Evaluation Steps</legend>
      <label><input type="checkbox" name="steps" value="1"> 1-Step</label>
      <label><input type="checkbox" name="steps" value="2"> 2-Step</label>
    </fieldset>

    <button type="submit" class="btn-primary">Apply Filters</button>
    <button type="reset" class="btn-secondary">Reset</button>
  </form>
</aside>
```

---

## 4. CLIENT-SEITIGE LOGIK

### 4.1 State Management Hypothese

**Angenommene State-Struktur (z.B. Redux/Zustand):**

```typescript
// Pseudo-Struktur (keine echte Code-Implementierung)

state = {
  // 1. Prop Firms Domain
  propFirms: {
    allFirms: [...],           // Alle Firms aus API
    filteredFirms: [...],      // Nach Filter-Kriterien gefiltert
    selectedFirm: { ... },     // Detailansicht
    loading: boolean,
    error: string | null
  },

  // 2. Filter State
  filters: {
    accountSizes: [50000, 100000],
    profitSplitRange: [80, 100],
    evaluationSteps: [1, 2],
    platforms: ['NinjaTrader', 'Tradovate'],
    sortBy: 'trueCostAsc'
  },

  // 3. Calculation State (True Cost)
  calculator: {
    selectedFirm: 'apex-trader',
    accountSize: 50000,
    numResets: 0,
    evaluationFee: 297,
    activationFee: 0,
    dataFees: 0,
    totalCost: 297
  },

  // 4. Economic Calendar State
  calendar: {
    events: [...],
    filterLevel: 'high',      // high | medium | low
    selectedCountries: ['US', 'EUR'],
    loading: boolean
  },

  // 5. UI State
  ui: {
    sidebarOpen: boolean,     // Mobile menu toggle
    modalOpen: boolean,       // Rules/Details modal
    activeTab: 'overview',
    theme: 'light' | 'dark'
  },

  // 6. Auth State (User preferences, affiliate tracking)
  auth: {
    sessionId: string,
    affiliateCode: 'PW',
    trackingPixels: { ... }
  },

  // 7. Content State (CMS-Articles)
  content: {
    articles: [...],
    selectedArticle: { ... },
    search: string,
    loading: boolean
  }
}
```

### 4.2 Event & Interaction Flows

**Filter-Flow Diagramm:**
```
User Action: "Toggle Filter Checkbox"
    ↓
Event Listener (onChange)
    ↓
Dispatch Filter Action {type: 'SET_FILTER', payload: {filterName, value}}
    ↓
Reducer Update State
    ↓
Trigger Prop Firm API Query (mit neuen Filtern)
    ↓
API Response: Gefilterte Firmenliste
    ↓
Reducer Update: state.propFirms.filteredFirms = [...]
    ↓
Component Re-render (nur betroffene Komponenten)
    ↓
UI zeigt neue Tabelle
```

**Affiliate Tracking Flow:**
```
User klickt "Get Funded" Button
    ↓
Event Handler interceptiert Click
    ↓
Analytics Event fired: {event: 'affiliate_click', firm: 'apex', timestamp}
    ↓
Tracking Pixel / API Call an Backend (Logging)
    ↓
Generate affiliate URL mit Parameter: ?code=PW&source=comparison
    ↓
window.location = affiliate_url
    ↓
User leitet zu prop-firm.com weiter (Conversion tracking)
```

**True Cost Calculation Flow:**
```
User ändert "Account Size" Dropdown
    ↓
State Update: calculator.accountSize = 100000
    ↓
Computed State (Memoized):
  evaluationFee = firmData.baseEvalFee
  activationFee = firmData.activationFee
  dataFees = firmData.monthlyDataFee * numMonths
  totalCost = sum(all fees)
    ↓
Component Re-render mit neuem totalCost
    ↓
Display: "True Cost: $297 + $0 (activation) = $297"
```

### 4.3 API-Integrations & Datenflüsse

**Vermutete API-Endpunkte (Backend Hypothese):**

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `GET /api/v1/prop-firms` | GET | Alle Firms (paginated) | 1h |
| `GET /api/v1/prop-firms/{id}` | GET | Firm-Details | 1h |
| `POST /api/v1/filter-firms` | POST | Filterte Ergebnisse | - |
| `GET /api/v1/economic-events` | GET | Kalender-Events (finnhub/API) | 30m |
| `GET /api/v1/articles` | GET | Blog/Lesson-Inhalte | 24h |
| `POST /api/v1/track-click` | POST | Affiliate-Event Logging | - |
| `POST /api/v1/newsletter-signup` | POST | Email-Erfassung | - |

**Data Flow Visualization:**
```
Frontend State
    ↑                          ↓
    └─── API Layer (Axios/Fetch)
         │
         ├─ Request: GET /api/v1/prop-firms?filters=...
         │
         └─ Response:
            {
              "data": [
                {
                  "id": "apex",
                  "name": "Apex Trader Funding",
                  "fundingRange": [25000, 500000],
                  "profitSplit": "90/10",
                  "trueCost": 297,
                  "affiliateLink": "https://affiliate.apex.com?code=PW"
                }
              ],
              "meta": { "total": 15, "page": 1 }
            }
         │
         ↓
    Display Component
    ├─ Map Response Array
    └─ Render FirmCards
```

### 4.4 Client-seitige Validierung & Error Handling

**Form Validation (z.B. Newsletter):**
```
Input: user@example.com
    ↓
Validation Rules:
  ├─ Required: true
  ├─ Format: regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  └─ Length: min 5, max 255
    ↓
If Invalid:
  └─ Display Error Message + Disable Submit Button
    ↓
If Valid:
  └─ Enable Submit Button
```

**API Error Handling:**
```
API Response Status Code
    ├─ 2xx: Success → Update State, Display Data
    ├─ 4xx (User Error):
    │   ├─ 400: Bad Request → Show Input Error
    │   ├─ 404: Not Found → Show "Firm not found"
    │   └─ 429: Rate Limited → Show Retry Message
    ├─ 5xx (Server Error):
    │   └─ Show Fallback UI + Retry Button
    └─ Network Error → Show Offline Message
```

---

## 5. BACKEND-HYPOTHESE (Phase 0: Skeleton / Phase 1: Full API)

### 5.1 Wahrscheinliche Backend-Services

**Service-Architektur (angenommen):**

```
┌──────────────────────────────────────────────┐
│           API Gateway / Load Balancer        │
└──────────────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┬─────────────┐
    ↓              ↓              ↓             ↓
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Prop    │  │ Content  │  │ Market   │  │ User &   │
│ Firm    │  │ & SEO    │  │ Data     │  │ Affiliate│
│ Service │  │ Service  │  │ Service  │  │ Service  │
└────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │             │             │
     └────────────┼─────────────┼─────────────┘
                  │
          ┌───────┴────────┐
          ↓                ↓
       ┌─────────────────────────┐
       │  Shared Data Layer      │
       │  (SQL/NoSQL Database)   │
       └─────────────────────────┘
```

### 5.2 Service-Beschreibungen

| Service | Verantwortung | Primary Entities |
|---------|---------------|------------------|
| **Prop Firm Service** | CRUD Prop Firms, Vergleich-Logik, True-Cost-Berechnung | Firm, Challenge, Account, ProfitSplit |
| **Content Service** | Articles, Lessons, SEO-Metadaten | Article, Tag, Category, Author |
| **Market Data Service** | Economic Calendar, Integration externe APIs | EconomicEvent, Country, Impact |
| **User & Affiliate Service** | Sessions, Newsletter, Affiliate Tracking, Payouts | User, Newsletter, AffiliateClick, Conversion |
| **Cache/CDN Layer** | Statische Assets, API Response Caching | Cache Keys, TTLs |

### 5.3 Datenmodell (Entities)

**Prop Firm Entity:**
```
PropFirm {
  id: string (UUID)
  name: string
  slug: string
  logo_url: string
  description: string
  website_url: string
  
  // Financial
  funding_range: [min, max]
  profit_split: string // "90/10"
  evaluation_fee: decimal
  activation_fee: decimal
  monthly_data_fee: decimal
  reset_fee: decimal
  
  // Rules
  trading_platforms: string[]  // NinjaTrader, Tradovate, etc.
  max_daily_loss: decimal
  max_accounts: integer
  max_contract_size: integer
  leverage: decimal
  
  // Metadata
  rating: float (1-5)
  review_count: integer
  is_featured: boolean
  affiliate_link: string
  affiliate_code: string (e.g., "PW")
  
  // Timestamps
  created_at: timestamp
  updated_at: timestamp
}
```

**AffiliateClick Entity:**
```
AffiliateClick {
  id: string (UUID)
  prop_firm_id: string
  user_session_id: string
  source_page: string       // /prop-firm-comparison
  timestamp: timestamp
  
  // Attribution
  utm_source: string
  utm_campaign: string
  referrer: string
  
  // Conversion (later)
  converted_at: timestamp (nullable)
  conversion_type: enum (signup, funded, first_trade)
}
```

**EconomicEvent Entity:**
```
EconomicEvent {
  id: string (UUID)
  event_name: string
  country: string (ISO code)
  impact_level: enum (high, medium, low)
  forecast_value: string
  previous_value: string
  actual_value: string (nullable, populated post-event)
  event_date: datetime
  source: string (finnhub API ID)
  
  created_at: timestamp
}
```

**Article Entity:**
```
Article {
  id: string (UUID)
  title: string
  slug: string
  content: text (markdown)
  author_id: string
  category: string // "lessons" | "guides" | "market-updates"
  seo_title: string
  seo_description: string
  featured_image_url: string
  
  // CMS
  is_published: boolean
  published_at: timestamp (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### 5.4 Authentifizierung & Session-Management

**Session-Handling:**
```
User Workflow:
├─ First Visit
│   └─ Server generates sessionId (UUID)
│   └─ Set HttpOnly Cookie: session_id=XXX
│   └─ Backend: Creates Session record in Redis/DB
│
├─ Subsequent Requests
│   └─ Browser sends Cookie automatically
│   └─ Backend middleware validates sessionId
│   └─ Attach session context to request
│
└─ Analytics / Affiliate Tracking
    └─ sessionId links all clicks & events to user
```

**Auth Strategy:**
```
No User Login Required (Anonymous Browsing)
├─ Session-based tracking (anonymous)
├─ Cookies for affiliate attribution
└─ Newsletter opt-in (email only)

Possible Future: User Accounts
├─ OAuth (Google, GitHub)
├─ Saved Comparisons
└─ Watchlist / Notifications
```

### 5.5 APIs & Integrationen mit Dritten

| Service | Purpose | Integration-Type | Frequency |
|---------|---------|------------------|-----------|
| **Finnhub / Yahoo Finance API** | Economic Calendar Events | REST API | Real-time / 5min |
| **Prop Firm Websites** | Scraping für aktualisierte Preise | Web Scraping / Webhooks | Daily |
| **Affiliate Networks** | Commission Tracking | Redirect Parameters | Real-time |
| **Email Service (SendGrid/Mailchimp)** | Newsletter Distribution | REST API | On-demand |
| **Analytics (Google Analytics/Mixpanel)** | User Behavior Tracking | JavaScript SDK | Real-time |
| **CDN (Cloudflare/AWS CloudFront)** | Static Asset Delivery | Configuration | Always-on |

---

## 6. HERMETISCHE PROJEKTSTRUKTUR (Phase 0: Folder Structure)

### 6.1 Ordnerstruktur mit Abhängigkeiten

```
onlypropfirms/
│
├── 📂 .github/
│   └── workflows/
│       ├── ci-tests.yml
│       ├── deployment.yml
│       └── security-scan.yml
│
├── 📂 docs/
│   ├── ARCHITECTURE.md          (← Diese Datei)
│   ├── API_SPEC.md
│   ├── ROADMAP.md               (← Zentrale Roadmap-Datei)
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── 📂 infrastructure/
│   ├── 📂 terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── 📂 kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   ├── 📂 docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   └── 📂 monitoring/
│       ├── prometheus.yml
│       ├── grafana-dashboards/
│       └── alerting-rules.yml
│
├── 📂 frontend/
│   ├── 📂 public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── images/
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Modal.tsx
│   │   │   │
│   │   │   ├── 📂 propFirm/
│   │   │   │   ├── FirmCard.tsx
│   │   │   │   ├── FirmList.tsx
│   │   │   │   ├── FirmDetails.tsx
│   │   │   │   └── FirmFilter.tsx
│   │   │   │
│   │   │   ├── 📂 comparison/
│   │   │   │   ├── ComparisonTable.tsx
│   │   │   │   ├── ComparisonRow.tsx
│   │   │   │   └── ComparisonFilters.tsx
│   │   │   │
│   │   │   ├── 📂 calculator/
│   │   │   │   ├── TrueCostCalculator.tsx
│   │   │   │   ├── CostInput.tsx
│   │   │   │   └── CostSummary.tsx
│   │   │   │
│   │   │   ├── 📂 calendar/
│   │   │   │   ├── EconomicCalendar.tsx
│   │   │   │   ├── CalendarEvent.tsx
│   │   │   │   └── CalendarFilter.tsx
│   │   │   │
│   │   │   └── 📂 content/
│   │   │       ├── ArticleList.tsx
│   │   │       ├── ArticleDetail.tsx
│   │   │       └── ArticleSearch.tsx
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── index.tsx          (Homepage)
│   │   │   ├── prop-firms/
│   │   │   │   ├── index.tsx      (Listing)
│   │   │   │   └── [slug].tsx     (Detail)
│   │   │   ├── prop-firm-comparison.tsx
│   │   │   ├── economic-calendar.tsx
│   │   │   ├── trading-tools.tsx
│   │   │   ├── articles/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [slug].tsx
│   │   │   ├── lessons/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [slug].tsx
│   │   │   ├── about.tsx
│   │   │   ├── contact.tsx
│   │   │   └── _app.tsx
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── api.ts              (HTTP Client: axios/fetch)
│   │   │   ├── propFirmService.ts  (API calls to backend)
│   │   │   ├── articleService.ts
│   │   │   ├── calendarService.ts
│   │   │   └── affiliateService.ts
│   │   │
│   │   ├── 📂 hooks/
│   │   │   ├── usePropFirms.ts
│   │   │   ├── useFilter.ts
│   │   │   ├── useCalculator.ts
│   │   │   ├── useCalendar.ts
│   │   │   └── useAffiliateTracking.ts
│   │   │
│   │   ├── 📂 store/
│   │   │   (Redux / Zustand)
│   │   │   ├── index.ts
│   │   │   ├── propFirmSlice.ts
│   │   │   ├── filterSlice.ts
│   │   │   ├── calculatorSlice.ts
│   │   │   ├── calendarSlice.ts
│   │   │   └── uiSlice.ts
│   │   │
│   │   ├── 📂 styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css     (Color, spacing tokens)
│   │   │   ├── typography.css
│   │   │   ├── responsive.css
│   │   │   └── 📂 components/
│   │   │       └── *.css         (Component-scoped styles)
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── api.ts            (HTTP helpers)
│   │   │   ├── formatting.ts     (Number formatting, dates)
│   │   │   ├── validation.ts     (Form validators)
│   │   │   ├── constants.ts      (App-wide constants)
│   │   │   └── analytics.ts      (Event tracking)
│   │   │
│   │   ├── 📂 types/
│   │   │   ├── index.ts
│   │   │   ├── propFirm.ts
│   │   │   ├── article.ts
│   │   │   ├── calendar.ts
│   │   │   └── common.ts
│   │   │
│   │   └── 📂 middleware/
│   │       ├── auth.ts
│   │       ├── logging.ts
│   │       └── errorHandler.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.local
│   └── .eslintrc.json
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📂 main/
│   │   │   └── 📂 java/com/onlypropfirms/
│   │   │
│   │   ├── 📂 controllers/        (HTTP Endpoints)
│   │   │   ├── PropFirmController.java
│   │   │   ├── ArticleController.java
│   │   │   ├── CalendarController.java
│   │   │   └── AffiliateController.java
│   │   │
│   │   ├── 📂 services/           (Business Logic)
│   │   │   ├── PropFirmService.java
│   │   │   ├── ComparisonService.java
│   │   │   ├── TrueCostCalculator.java
│   │   │   ├── ArticleService.java
│   │   │   ├── CalendarService.java
│   │   │   └── AffiliateService.java
│   │   │
│   │   ├── 📂 repositories/       (Data Access)
│   │   │   ├── PropFirmRepository.java
│   │   │   ├── ArticleRepository.java
│   │   │   ├── EconomicEventRepository.java
│   │   │   └── AffiliateClickRepository.java
│   │   │
│   │   ├── 📂 models/             (Entities)
│   │   │   ├── PropFirm.java
│   │   │   ├── Article.java
│   │   │   ├── EconomicEvent.java
│   │   │   ├── AffiliateClick.java
│   │   │   └── Session.java
│   │   │
│   │   ├── 📂 dto/                (Data Transfer Objects)
│   │   │   ├── PropFirmDTO.java
│   │   │   ├── ComparisonRequestDTO.java
│   │   │   ├── ComparisonResponseDTO.java
│   │   │   ├── TrueCostCalculationDTO.java
│   │   │   └── ArticleDTO.java
│   │   │
│   │   ├── 📂 integrations/       (Third-party APIs)
│   │   │   ├── FinnhubClient.java
│   │   │   ├── AffiliateNetworkClient.java
│   │   │   └── EmailServiceClient.java
│   │   │
│   │   ├── 📂 config/
│   │   │   ├── DatabaseConfig.java
│   │   │   ├── CacheConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── SecurityConfig.java
│   │   │
│   │   ├── 📂 filters/
│   │   │   ├── RequestLoggingFilter.java
│   │   │   ├── ErrorHandlingFilter.java
│   │   │   └── RateLimitingFilter.java
│   │   │
│   │   ├── 📂 exceptions/
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── ValidationException.java
│   │   │   └── ExternalApiException.java
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── JsonMapper.java
│   │   │   ├── DateFormatter.java
│   │   │   └── LoggingUtils.java
│   │   │
│   │   └── Application.java       (Entry point)
│   │
│   ├── resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── logback.xml
│   │
│   ├── pom.xml (Maven) oder build.gradle (Gradle)
│   └── .env
│
├── 📂 database/
│   ├── 📂 migrations/
│   │   ├── V001__CreatePropFirmTable.sql
│   │   ├── V002__CreateArticleTable.sql
│   │   ├── V003__CreateEconomicEventTable.sql
│   │   ├── V004__CreateAffiliateClickTable.sql
│   │   └── V005__AddIndexes.sql
│   │
│   ├── 📂 seeds/
│   │   ├── seed_prop_firms.sql
│   │   ├── seed_articles.sql
│   │   └── seed_economic_events.sql
│   │
│   └── schema.sql
│
├── 📂 tests/
│   ├── 📂 frontend/
│   │   ├── 📂 unit/
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── hooks/
│   │   ├── 📂 integration/
│   │   │   ├── pages.test.tsx
│   │   │   └── api-integration.test.ts
│   │   └── 📂 e2e/
│   │       ├── comparison-flow.test.ts
│   │       ├── affiliate-click.test.ts
│   │       └── newsletter-signup.test.ts
│   │
│   ├── 📂 backend/
│   │   ├── 📂 unit/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── 📂 integration/
│   │   │   ├── controllers/
│   │   │   └── repositories/
│   │   └── 📂 contract/
│   │       └── api-contract-tests.ts
│   │
│   └── 📂 performance/
│       ├── load-test.k6.js
│       └── lighthouse-audit.js
│
├── 📂 .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── .gitignore
├── .dockerignore
├── .env.example
├── README.md
├── CHANGELOG.md
└── package.json (Root - Monorepo management)
```

### 6.2 Modul-Verantwortlichkeiten & Isolation

| Modul | Verantwortung | Abhängigkeiten | Zustand |
|------|---------------|---------|--------|
| **frontend/components/propFirm** | UI für Prop Firm Anzeige | services.propFirmService, store.propFirmSlice | Stateless (Props + Callbacks) |
| **frontend/components/comparison** | Vergleichstabelle & Filter | store.filterSlice, hooks.useFilter | Statefull (Controlled) |
| **frontend/hooks/useFilter** | Filter-Logik + API-Calls | services.propFirmService, types | Logic Layer |
| **frontend/store** | Global State Management | types | Single Source of Truth |
| **backend/services/PropFirmService** | Business Logic Prop Firms | repositories.PropFirmRepository, integrations | Orchestration |
| **backend/repositories** | Data Access Pattern | models, database | Isolation |
| **backend/integrations/FinnhubClient** | External API (Economic Calendar) | HTTP Client, config | External Dependency |
| **infrastructure/** | Deployment & Hosting | Cloud Provider APIs | Infrastructure as Code |

### 6.3 Abhängigkeits-Matrix

```
Abhängigkeiten (Richtung: A → B bedeutet "A benötigt B"):

Frontend Pages
    ↓
Frontend Components + Hooks
    ↓
Frontend Services (API calls)
    ↓
Backend API (REST/GraphQL)
    ↓
Backend Services (Business Logic)
    ↓
Backend Repositories (Data Access)
    ↓
Database + External Services

Querschnitt (keine zirkulären Abhängigkeiten):
├─ types/ (zentral, keine Abhängigkeiten)
├─ utils/ (zentral, nur zu types/)
├─ store/ (zentral, zu types/ + utils/)
└─ config/ (zentral, zu types/)
```

---

## 7. ZENTRALE ROADMAP-DATEI

### 7.1 ROADMAP.md Struktur (Single Source of Truth)

Diese Datei ist das zentrale Dokument für alle technischen Änderungen, Features und Entscheidungen.

**Location:** `/docs/ROADMAP.md`

**Format:**

```markdown
# OnlyPropFirms Roadmap & Change Log

**Last Updated:** 2025-12-28  
**Version:** 1.0.0  
**Maintainer:** Architecture Team

---

## Table of Contents

1. [Version History](#version-history)
2. [Module Roadmaps](#module-roadmaps)
3. [Architecture Decision Records (ADR)](#architecture-decision-records)
4. [Cloud & Infrastructure Changes](#cloud--infrastructure-changes)
5. [Breaking Changes Register](#breaking-changes-register)
6. [Dependencies & Versions](#dependencies--versions)

---

## Version History

### v1.0.0 (2025-12-28)
**Status:** Production Ready
**Release Date:** 2025-12-28

#### Features Shipped:
- [x] Prop Firm Listing & Filtering (Module: propFirm)
- [x] Comparison Tool (Module: comparison)
- [x] True Cost Calculator (Module: calculator)
- [x] Economic Calendar (Module: calendar)
- [x] Article/Blog System (Module: content)
- [x] Affiliate Tracking (Module: affiliate)

#### Infrastructure:
- [x] Frontend: Next.js + React (SSR/SSG)
- [x] Backend: Java Spring Boot + PostgreSQL
- [x] Deployment: Docker + Kubernetes
- [x] CDN: Cloudflare

**Commit Range:** initial-commit → main/v1.0.0

---

## Module Roadmaps

### 1. Frontend::propFirm Module

**Owner:** Frontend Team  
**Current Status:** Production  
**Last Updated:** 2025-12-28

**Features:**

| Feature | Status | Assigned | Start | Target | Blocker |
|---------|--------|----------|-------|--------|---------|
| Prop Firm Card Component | tested | @john | 2025-10-01 | 2025-10-15 | - |
| Firm List Page | production | @john | 2025-10-15 | 2025-11-01 | - |
| Detail Page | production | @jane | 2025-11-01 | 2025-11-20 | - |
| Responsive Design | production | @jane | 2025-11-20 | 2025-12-05 | - |
| Wishlist Feature | planned | @alex | 2026-01-15 | 2026-02-15 | API readiness (backend) |

**Risks:**
- [ ] Performance: Large lists (100+ firms) may cause slowdown
  - Mitigation: Implement virtual scrolling, pagination
  
**Dependencies:**
```
propFirm Module
    ├─ depends on: backend API (PropFirmController)
    ├─ depends on: store/propFirmSlice
    ├─ depends on: hooks/usePropFirms
    └─ depends on: types/PropFirm, types/Challenge
```

**API Contract:**
```typescript
GET /api/v1/prop-firms?page=1&limit=20
Response: {
  data: PropFirm[],
  meta: { total: number, page: number }
}
```

---

### 2. Frontend::comparison Module

**Owner:** Frontend Team  
**Current Status:** Production  
**Last Updated:** 2025-12-28

**Features:**

| Feature | Status | Assigned | Dependencies |
|---------|--------|----------|--------------|
| Comparison Table | tested | @john | propFirm Module |
| Multi-Select Filter | tested | @jane | store/filterSlice |
| Sort Functionality | tested | @jane | comparison Service |
| Export to CSV | in-progress | @alex | utils/export |
| Share Comparison Link | planned | @alex | Backend Permalink API |

**Architecture Notes:**
- Table rendering: React Table (TanStack)
- State: Redux selector for filtered results
- Performance: Memoization on row components

**Database Changes Required (Backend):**
- New Table: `comparison_shares` for shareable links
- Status: BLOCKED (waiting on DB migration approval)

---

### 3. Backend::PropFirmService

**Owner:** Backend Team  
**Current Status:** Production  
**Last Updated:** 2025-12-28

**Features:**

| Feature | Status | Target | Notes |
|---------|--------|--------|-------|
| Get All Firms (paginated) | production | - | 1h cache |
| Get Firm Details | production | - | 1h cache |
| Filter & Search | production | - | Elastic Search optimized |
| True Cost Calculation | production | - | Atomic transaction |
| Bulk Update Prices | in-progress | 2026-01-10 | Scheduled job (daily 9 AM UTC) |

**Known Issues:**
- Issue #42: Price discrepancy with affiliate API
  - Impact: True costs may be $5-20 off
  - Fix: Automated scraper needs refinement
  - Status: In dev branch `feature/price-scraper-v2`

---

### 4. Backend::EconomicCalendarService

**Owner:** Backend Team  
**Current Status:** Production  
**Last Updated:** 2025-12-28

**Features:**

| Feature | Status | Target | Notes |
|---------|--------|--------|-------|
| Fetch Events from Finnhub | production | - | 30min cache |
| Filter by Impact Level | production | - | - |
| Filter by Country | production | - | - |
| Real-time Updates | planned | 2026-02-01 | WebSocket integration |

**Dependencies:**
- Finnhub API Key: stored in AWS Secrets Manager
- Status: Rotate quarterly (next: 2026-03-28)

---

## Architecture Decision Records

### ADR-001: Use Next.js for Frontend

**Date:** 2025-08-15  
**Status:** ACCEPTED  
**Proposer:** @architect-lead

**Context:**
- Need for both SSR (SEO) and dynamic content
- Team familiar with React
- Performance requirements

**Decision:**
Use **Next.js 14+** with App Router for frontend

**Consequences:**
- ✅ Built-in SSR/SSG
- ✅ File-based routing
- ✅ API routes (optional)
- ⚠️ Vendor lock-in to Vercel (mitigation: Docker container)

**Alternatives Considered:**
1. React SPA + Express backend: Less SEO, complexity in routing
2. Vue.js: Team expertise lower
3. Remix: Smaller ecosystem

---

### ADR-002: Java Spring Boot for Backend

**Date:** 2025-08-15  
**Status:** ACCEPTED  
**Proposer:** @architect-lead

**Context:**
- Enterprise stability needed
- Strong typing (statically typed)
- Team expertise in Java
- Scalability for 100K+ users

**Decision:**
Use **Java 21 + Spring Boot 3.2 + Spring Data JPA**

**Consequences:**
- ✅ Mature ecosystem
- ✅ Excellent ORM (Hibernate)
- ✅ Built-in security (Spring Security)
- ✅ Monitoring tools (Micrometer)
- ⚠️ Verbose code
- ⚠️ JVM memory overhead

---

### ADR-003: Redux for State Management (Frontend)

**Date:** 2025-09-01  
**Status:** ACCEPTED  
**Proposer:** @frontend-lead

**Context:**
- Multiple data sources (API, filters, calculations)
- Complex filter state
- Need for time-travel debugging in dev

**Decision:**
Use **Redux Toolkit (RTK)** with Redux Thunk for async actions

**Consequences:**
- ✅ Predictable state
- ✅ DevTools integration
- ✅ Middleware support (logging, analytics)
- ⚠️ Boilerplate code (mitigated by RTK)

---

### ADR-004: PostgreSQL for Database

**Date:** 2025-08-20  
**Status:** ACCEPTED  
**Proposer:** @backend-lead

**Context:**
- Relational data (PropFirms, Articles, Events)
- ACID requirements
- Strong ecosystem

**Decision:**
Use **PostgreSQL 15+** with Flyway for migrations

**Consequences:**
- ✅ ACID guarantees
- ✅ Full-text search
- ✅ JSON support (for dynamic data)
- ⚠️ Horizontal scaling complexity (mitigated: read replicas)

---

### ADR-005: Docker & Kubernetes for Deployment

**Date:** 2025-09-10  
**Status:** ACCEPTED  
**Proposer:** @devops-lead

**Context:**
- Need for environment parity
- Scaling across regions
- CI/CD automation

**Decision:**
Use **Docker containers + Kubernetes (K8s)** with Helm for orchestration

**Consequences:**
- ✅ Infrastructure as Code
- ✅ Auto-scaling
- ✅ Service mesh ready (Istio optional)
- ⚠️ Operational complexity
- ⚠️ Higher costs vs. serverless

**Mitigation:**
- Managed K8s: AWS EKS, Google GKE, or Azure AKS
- Cost monitoring: Kubecost

---

## Cloud & Infrastructure Changes

### Cloud Architecture Timeline

| Date | Change | Component | Impact | Status |
|------|--------|-----------|--------|--------|
| 2025-08-01 | AWS Account Setup | Infrastructure | N/A | ✅ Done |
| 2025-09-01 | EKS Cluster (2 regions) | Infrastructure | Performance | ✅ Done |
| 2025-10-01 | RDS PostgreSQL + Replicas | Database | High-availability | ✅ Done |
| 2025-11-01 | CloudFront + S3 | CDN | Load time (-40%) | ✅ Done |
| 2025-12-01 | WAF Rules | Security | DDoS protection | ✅ Done |
| 2026-01-15 | Multi-region failover | Infrastructure | Disaster recovery | Planned |
| 2026-02-01 | Service Mesh (Istio) | Infrastructure | Observability | Planned |

### Infrastructure Cost (Monthly Estimate)

```
EKS Cluster (2 regions):      $2,500
RDS PostgreSQL:               $1,200
CloudFront + S3:              $400
Monitoring (Datadog):         $800
Miscellaneous:                $300
─────────────────────────────────
TOTAL:                        ~$5,200
```

---

## Breaking Changes Register

### v0.9.0 → v1.0.0 (No Breaking Changes)

### v1.0.0 → v1.1.0 (Planned)

**WARNING: Upcoming Breaking Changes (Q1 2026)**

| Change | Effective Date | Migration Path | Risk Level |
|--------|----------------|-----------------|-----------|
| API `/api/v1/` → `/api/v2/` | 2026-03-01 | Deprecation period: 6 months | High |
| PropFirm.trueCost → PropFirm.funding.trueCost | 2026-03-01 | Auto-migration script | Medium |
| Removed: `firm.activationFeePercentage` (deprecated) | 2026-03-01 | Use `firm.activationFee` | Low |

**Migration Guide:** See `/docs/MIGRATION_v1_to_v2.md`

---

## Dependencies & Versions

### Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@reduxjs/toolkit": "1.9.7",
    "react-redux": "8.1.3",
    "axios": "1.6.2",
    "typescript": "5.3.2"
  },
  "devDependencies": {
    "@testing-library/react": "14.0.0",
    "jest": "29.7.0",
    "playwright": "1.40.0"
  }
}
```

**Last Updated:** 2025-12-28  
**Audit Status:** No vulnerabilities (npm audit)

### Backend Dependencies (pom.xml)

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot</artifactId>
  <version>3.2.0</version>
</dependency>

<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.7.0</version>
</dependency>

<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
  <version>9.22.0</version>
</dependency>
```

**Last Updated:** 2025-12-28  
**Vulnerability Scan:** OWASP DependencyCheck (no HIGH/CRITICAL)

---

## Changelog Format

**For each change, log:**

```
## [Date] - [YYYY-MM-DD]
### Added
- Feature X (Module: propFirm, Status: production)

### Changed
- Component Y updated (Module: comparison)

### Fixed
- Bug in Z (Issue #123)

### Breaking
- API endpoint changed (migration guide: link)

### Deployment
- Infrastructure change (downtime: none)
```

---

**End of ROADMAP.md**
```

---

## 8. GIT- & BRANCH-STRATEGIE

### 8.1 Branching Model (Git Flow Variant)

```
                                     ┌─── v1.0.1
                                     │   (hotfix)
                                     │
main ────────────────────────────────┼────────────────────
      (production-ready, tagged)     │
                                     │
develop ─────────────────────────────┴───────────────────
        (integration branch)
          ├─ feature/prop-firm-wishlist
          ├─ feature/economic-calendar-v2
          ├─ bugfix/price-scraper-issue
          └─ chore/upgrade-dependencies


Long-lived Branches:
├─ main      → nur production releases, tags: v1.0.0, v1.0.1, v1.1.0
├─ develop   → integration point, keine direct commits
│
├─ feature/* → einzelnes Feature pro Branch
│  ├─ feature/prop-firm-wishlist
│  ├─ feature/export-comparison-csv
│  └─ feature/real-time-calendar-updates
│
├─ bugfix/*  → Fix für Bugs (keine Features)
│  ├─ bugfix/price-scraper-issue-123
│  └─ bugfix/affiliate-tracking-cookie
│
├─ hotfix/*  → Critical fixes auf main
│  └─ hotfix/security-vulnerability
│
└─ chore/*   → Refactoring, Deps, keine Feature-Logik
   ├─ chore/upgrade-react-18
   └─ chore/optimize-images
```

### 8.2 Branch Naming Conventions

```
Format: <type>/<descriptor>-<issue-id>

Types:
├─ feature/  : neue Funktionalität
├─ bugfix/   : Fehlerfix
├─ hotfix/   : kritischer Patch für Production
├─ chore/    : Wartung, Deps, Config
└─ docs/     : Dokumentation

Examples:
✅ feature/prop-firm-comparison-tool-42
✅ bugfix/affiliate-click-tracking-150
✅ hotfix/security-xss-vulnerability
❌ fix/something (unklar: bugfix oder hotfix?)
❌ feature/many-things (zu viel auf einmal)
```

### 8.3 Merge-Anforderungen (Definition of Done)

**Bevor ein Feature in develop gemerged wird:**

```
Code:
  ☑ Feature vollständig implementiert
  ☑ Keine Console Errors / Warnings
  ☑ Code Style (ESLint/Prettier) passed
  ☑ TypeScript no strict mode violations
  
Tests:
  ☑ Unit Tests (min. 80% Coverage)
  ☑ Integration Tests for API calls
  ☑ E2E Tests (happy path + error case)
  ☑ All tests passing locally
  
Security:
  ☑ OWASP Top 10 review (Frontend: XSS, CSRF)
  ☑ No hardcoded secrets/API keys
  ☑ Dependency vulnerabilities checked (npm audit)
  
Documentation:
  ☑ Code comments für komplexe Logik
  ☑ ROADMAP.md aktualisiert
  ☑ API Contract updated (if backend change)
  
CI/CD:
  ☑ All GitHub Actions pass
  ☑ SonarQube quality gate pass
  ☑ Lighthouse performance score ≥ 90
  ☑ Security scan (SAST) no HIGH findings
  
Review:
  ☑ Min. 2 approvals (von unterschiedliche Domains)
  ☑ Alle Kommentare resolved
  ☑ No merge conflicts
```

### 8.4 Merge-Strategie

```
Merge in develop:
  └─ Always use: git merge --no-ff
     (erstellt Merge Commit für Tracability)
     
Example:
  git checkout develop
  git pull origin develop
  git merge --no-ff feature/prop-firm-wishlist
  git push origin develop

Merge in main (Release):
  └─ Same: git merge --no-ff develop
  └─ Tag erstellen: git tag -a v1.1.0 -m "Release v1.1.0"
  └─ Push tags: git push origin v1.1.0
```

### 8.5 Deployment-Flow

```
1. Feature Branch erstellen
   git checkout -b feature/new-feature develop

2. Regelmäßig rebase auf develop
   git fetch origin
   git rebase origin/develop

3. Pull Request öffnen
   - Titel: beschreibend
   - Description: Context, Changes, Testing
   - Automatische Checks laufen

4. Code Review
   - Min. 2 Approvals
   - Alle Comments resolved

5. Merge in develop
   git merge --no-ff feature/new-feature

6. Feature Branch löschen
   git push -d origin feature/new-feature

7. Deploy zu Staging (automatisch)
   - GitHub Action triggered
   - E2E Tests laufen
   - Slack notification

8. Release-Planung
   - develop Branch hat neue Features
   - Release-Manager erstellt Release Branch
   - git checkout -b release/1.1.0 develop

9. Release Testing + Bugfixes
   - Nur Bugfixes in release Branch
   - Keine neuen Features

10. Merge in main + Tag
    git checkout main
    git merge --no-ff release/1.1.0
    git tag -a v1.1.0 -m "Release 1.1.0"

11. Deploy zu Production
    - Automatisch triggered by tag
    - Health checks nach Deployment
    - Rollback plan prepared
```

### 8.6 CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          
  deploy-staging:
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:latest .
      - run: kubectl apply -f k8s/staging/deployment.yaml
```

---

## 9. CLOUD-READINESS

### 9.1 Cloud-Native Architektur-Prinzipien

**Diese Architektur ist bereits cloud-ready:**

```
12-Factor App Compliance:

1. Codebase
   ✅ Single codebase in Git
   ✅ Multiple deployments (dev, staging, prod)

2. Dependencies
   ✅ Explicit in package.json / pom.xml
   ✅ Vendored in Docker images

3. Config
   ✅ Environment variables (.env, K8s ConfigMap)
   ✅ Secrets in AWS Secrets Manager (not in code)

4. Backing Services
   ✅ Database: Treat as attached resource
   ✅ Cache, APIs: Configured via env vars

5. Build / Run / Release
   ✅ Strict separation (Docker multi-stage build)
   ✅ Release tagged in registry

6. Processes
   ✅ Stateless (all state in database/Redis)
   ✅ Horizontally scalable

7. Port Binding
   ✅ Self-contained HTTP service (no app server)

8. Concurrency
   ✅ Process-based model (K8s pods)
   ✅ Load balancing via Kubernetes Service

9. Disposability
   ✅ Fast startup
   ✅ Graceful shutdown

10. Dev/Prod Parity
    ✅ Docker ensures same environment everywhere

11. Logs
    ✅ Stdout/stderr (captured by K8s)
    ✅ Centralized in ELK / CloudWatch

12. Admin Processes
    ✅ One-off tasks via K8s Jobs
    ✅ Database migrations: Flyway (on startup)
```

### 9.2 Containerisierung

**Frontend Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Dockerfile:**

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/onlypropfirms.jar .

EXPOSE 8080
CMD ["java", "-jar", "onlypropfirms.jar"]
```

### 9.3 Kubernetes Deployment-Strategie

**Frontend Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: onlypropfirms-frontend
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: onlypropfirms-frontend
  template:
    metadata:
      labels:
        app: onlypropfirms-frontend
        version: v1.0.0
    spec:
      containers:
      - name: frontend
        image: onlypropfirms/frontend:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api_url
        - name: NEXT_PUBLIC_ANALYTICS_ID
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: analytics_id
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Backend Deployment (ähnliche Struktur, Port 8080)**

### 9.4 Observability & Monitoring

**Logs (Centralized):**

```
Frontend → stdout/stderr
  ↓
K8s Logs → ELK Stack (Elasticsearch + Kibana)
  ↓
Log format: JSON (structured)
  {
    "timestamp": "2025-12-28T10:30:00Z",
    "level": "INFO",
    "service": "frontend",
    "event": "prop_firm_loaded",
    "firm_id": "apex-trader",
    "duration_ms": 234,
    "trace_id": "abc123"
  }
```

**Metrics (Prometheus):**

```
Frontend:
├─ http_requests_total{endpoint, status, method}
├─ http_request_duration_seconds{endpoint}
├─ page_load_time_seconds{page}
├─ api_call_errors_total{endpoint, error_type}

Backend:
├─ jvm_memory_used_bytes
├─ jdbc_connections_active
├─ db_query_duration_seconds{query}
├─ http_server_requests_seconds{endpoint, status}

Alerts (wenn):
├─ Error rate > 1%
├─ Response time > 1000ms
├─ Pod CPU > 80%
├─ Pod Memory > 90%
├─ Database connections > 80
```

**Distributed Tracing (Jaeger):**

```
User Request
  ├─ trace_id: abc123
  │
  ├─ span: frontend_page_load (100ms)
  │  └─ span: api_call_prop_firms (50ms)
  │     └─ span: backend_handle_request (40ms)
  │        └─ span: database_query (30ms)
  │
  └─ Visualize in Jaeger UI (bottleneck analysis)
```

### 9.5 Skalierungsstrategie

**Horizontal Scaling:**

```
Load Balancer (AWS ALB / Cloudflare)
    ↓
Kubernetes Service
    ↓
┌─ Pod 1 (Frontend)
├─ Pod 2 (Frontend)
├─ Pod 3 (Frontend)
└─ Auto-scales based on:
   ├─ CPU > 70%
   ├─ Memory > 80%
   └─ Custom metrics (API latency)
```

**Vertical Scaling:**

```
Database (PostgreSQL)
├─ Read Replicas (3)
└─ Auto-failover (RDS Multi-AZ)

Cache Layer (Redis)
├─ Cluster mode: 6 nodes
└─ Eviction policy: LRU

External APIs
├─ Finnhub rate limit: 100 req/min
└─ Caching: 30min TTL
```

### 9.6 Disaster Recovery & High Availability

```
Multi-Region Deployment (Planned Q1 2026):

US-East (Primary)
├─ EKS Cluster (3 nodes)
├─ RDS Primary
└─ CloudFront Origin

EU-West (Secondary)
├─ EKS Cluster (3 nodes)
├─ RDS Read Replica
└─ CloudFront Origin

Failover Strategy:
├─ DNS: Route53 health checks → failover in 30s
├─ Database: RDS cross-region read replica → promote to primary
├─ Session state: Distributed in Redis cluster (no local sessions)
└─ RPO (Recovery Point Objective): 5 minutes
    RTO (Recovery Time Objective): 2 minutes
```

---

## 10. ARCHITEKTUR-ENTSCHEIDUNGSREGISTER

### Zusammenfassung bisheriger Decisions

| ADR-ID | Title | Status | Owner | Date |
|--------|-------|--------|-------|------|
| ADR-001 | Use Next.js for Frontend | ACCEPTED | @architect-lead | 2025-08-15 |
| ADR-002 | Java Spring Boot Backend | ACCEPTED | @architect-lead | 2025-08-15 |
| ADR-003 | Redux for State Mgmt | ACCEPTED | @frontend-lead | 2025-09-01 |
| ADR-004 | PostgreSQL Database | ACCEPTED | @backend-lead | 2025-08-20 |
| ADR-005 | Docker + Kubernetes | ACCEPTED | @devops-lead | 2025-09-10 |

### Template für neue ADRs

```markdown
# ADR-NNN: [Title]

**Date:** [YYYY-MM-DD]
**Status:** [PROPOSED | ACCEPTED | DEPRECATED]
**Owner:** @[github-handle]

## Context
[Beschreib das Problem und die Rahmenbedingungen]

## Decision
[Was wird entschieden und warum]

## Consequences
- ✅ Benefits:
  - Benefit 1
  - Benefit 2
- ⚠️ Tradeoffs:
  - Tradeoff 1
  - Tradeoff 2

## Alternatives Considered
1. [Alternative 1]: Why not (Pros/Cons)
2. [Alternative 2]: Why not (Pros/Cons)

## Related ADRs
- ADR-001, ADR-003

## References
- [Link 1]
- [Link 2]
```

---

## ZUSAMMENFASSUNG

Diese vollständige Analyse dokumentiert:

✅ **Frontend-Struktur:** Seiten-Inventar, UI-Komponenten, Interaktionsmuster  
✅ **HTML/DOM-Struktur:** Semantisches HTML, wahrscheinliche Framework-Signale (Next.js + React)  
✅ **Client-seitige Logik:** State Management, API-Flows, Validierung  
✅ **Backend-Hypothese:** Services, Datenmodelle, APIs, Authentifizierung  
✅ **Hermetische Projektstruktur:** Folder-Layout, Modul-Isolation, Abhängigkeiten  
✅ **Zentrale Roadmap:** Versionskontrolle, Feature-Tracking, ADRs  
✅ **Git-Strategie:** Branching, Merge-Anforderungen, CI/CD-Integration  
✅ **Cloud-Readiness:** 12-Factor-Compliance, K8s, Observability, Disaster Recovery  
✅ **Architektur-Entscheidungen:** ADRs für langfristige Konsistenz  

**Alle Informationen sind konzeptionell, architektonisch und dokumentations-orientiert – KEIN Code.**

---

**Dokument-Version:** 1.0  
**Letzte Aktualisierung:** 28. Dezember 2025  
**Wartung:** Architecture Team
