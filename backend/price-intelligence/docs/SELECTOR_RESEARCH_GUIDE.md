# Selector Research Guide

## Purpose
This guide explains how to research and configure CSS selectors for new prop firms to enable automated price crawling.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Research Process](#research-process)
3. [Common Patterns](#common-patterns)
4. [Anti-Bot Protection](#anti-bot-protection)
5. [Selector Testing](#selector-testing)
6. [Configuration Template](#configuration-template)

---

## Prerequisites

### Tools Required
- **Chrome DevTools** (or Firefox Developer Tools)
- **Puppeteer** (for headless browser testing)
- **PostgreSQL client** (for updating source_catalog)

### Knowledge Required
- Basic HTML/CSS understanding
- CSS selector syntax
- Understanding of dynamic vs static content
- Familiarity with React/Vue/Angular patterns

---

## Research Process

### Step 1: Manual Page Inspection

1. **Navigate to the pricing page** in Chrome
2. **Open DevTools** (F12 or Ctrl+Shift+I)
3. **Use Elements tab** to inspect the pricing structure

### Step 2: Identify Container Elements

Look for the parent element that wraps each pricing package/tier:

```html
<!-- Example 1: Class-based -->
<div class="pricing-card">
  <h3>$50,000 Account</h3>
  <span class="price">$299</span>
</div>

<!-- Example 2: Data attributes -->
<article data-testid="pricing-tier" data-size="50000">
  <div class="account-size">50K</div>
  <div class="price-info">$299</div>
</article>

<!-- Example 3: Semantic HTML -->
<section class="plan">
  <header><h2>50K Challenge</h2></header>
  <div class="cost">$299</div>
</section>
```

**Selector examples:**
- `.pricing-card` (best - specific class)
- `div[class*="pricing"]` (flexible - matches partial class names)
- `article[data-testid*="pricing"]` (data attribute approach)
- `section.plan` (semantic + class)

### Step 3: Identify Data Elements

For each pricing package, locate:

#### Account Size
```html
<!-- Pattern 1: Heading -->
<h3 class="account-title">$50,000 Account</h3>

<!-- Pattern 2: Dedicated div -->
<div class="account-size">50K</div>

<!-- Pattern 3: Badge/Label -->
<span class="balance-label">$50,000</span>
```

**Selector strategy:**
```css
h3, h4                                    /* Generic headings */
div[class*="account"][class*="size"]      /* Class name contains both */
span[class*="balance"]                    /* Contains "balance" */
```

#### Current Price
```html
<!-- Pattern 1: Simple span -->
<span class="price">$299</span>

<!-- Pattern 2: Nested structure -->
<div class="pricing">
  <span class="currency">$</span>
  <span class="amount">299</span>
</div>

<!-- Pattern 3: Emphasized text -->
<strong class="current-price">$299</strong>
```

**Selector strategy:**
```css
span.price                                /* Direct class */
div[class*="price"] span:first-child      /* First child of price container */
strong[class*="current"]                  /* Emphasized current price */
```

#### Original Price (if discounted)
```html
<!-- Pattern 1: Strikethrough -->
<s>$399</s>

<!-- Pattern 2: CSS-based strikethrough -->
<span class="original-price">$399</span>

<!-- Pattern 3: Semantic deletion -->
<del>$399</del>
```

**Selector strategy:**
```css
s, del, strike                            /* HTML strikethrough tags */
span[class*="original"]                   /* Contains "original" */
span[class*="before"]                     /* "before" price */
```

#### Discount Badge
```html
<!-- Pattern 1: Badge/ribbon -->
<div class="discount-badge">-25%</div>

<!-- Pattern 2: Promo label -->
<span class="promo">Save $100</span>

<!-- Pattern 3: Emphasized text -->
<strong class="offer">25% OFF</strong>
```

**Selector strategy:**
```css
div[class*="discount"], div[class*="badge"]
span[class*="save"], span[class*="promo"]
strong[class*="offer"]
```

#### Fee Breakdowns
```html
<!-- Pattern 1: Definition list -->
<dl>
  <dt>Evaluation Fee</dt>
  <dd>$299</dd>
  <dt>Activation Fee</dt>
  <dd>$0</dd>
</dl>

<!-- Pattern 2: Table rows -->
<tr>
  <td>Monthly Data Fee</td>
  <td>$150</td>
</tr>

<!-- Pattern 3: Label + value pairs -->
<div class="fee-item">
  <span>Reset Fee:</span>
  <span class="amount">$99</span>
</div>
```

**Selector strategy (using :contains):**
```css
/* Warning: :contains is not native CSS, requires jQuery or custom implementation */
dt:contains("Evaluation") + dd
tr:contains("Activation") td:last-child
div:contains("Monthly") + span.amount
```

**Alternative without :contains:**
```javascript
// In Puppeteer/JavaScript
const evaluationFee = await page.evaluate(() => {
  const label = Array.from(document.querySelectorAll('dt, td, label'))
    .find(el => /evaluation/i.test(el.textContent));
  return label?.nextElementSibling?.textContent;
});
```

### Step 4: Test in DevTools Console

Open the Console tab and test your selectors:

```javascript
// Test container selector
document.querySelectorAll('div[class*="pricing-card"]')
// Should return all pricing cards

// Test account size extraction
Array.from(document.querySelectorAll('div.pricing-card')).map(card =>
  card.querySelector('h3')?.textContent
)
// Should return array of account sizes

// Test price extraction
document.querySelector('.pricing-card .price')?.textContent
// Should return first price
```

### Step 5: Handle Dynamic Content

Many modern sites use React/Vue/Angular with:
- Client-side rendering
- Lazy loading
- Dynamic class names (e.g., `css-1a2b3c4`)

**Detection:**
```javascript
// Check if content loads after page render
console.log('Initial:', document.querySelectorAll('.pricing-card').length);
setTimeout(() => {
  console.log('After 2s:', document.querySelectorAll('.pricing-card').length);
}, 2000);
```

**Solution:**
- Use Puppeteer with `waitForSelector`
- Wait for network idle: `page.goto(url, { waitUntil: 'networkidle2' })`
- Use more stable selectors (data attributes, ARIA labels)

---

## Common Patterns

### Pattern 1: CSS Modules (React)
```html
<div class="PricingCard_container_1a2b3c">
  <h3 class="PricingCard_title_4d5e6f">50K</h3>
  <span class="PricingCard_price_7g8h9i">$299</span>
</div>
```

**Problem:** Class names change on each build

**Solution:** Use attribute selectors that match patterns
```css
div[class*="PricingCard"][class*="container"]
h3[class*="title"]
span[class*="price"]
```

### Pattern 2: Tailwind CSS
```html
<div class="flex flex-col bg-white rounded-lg shadow-md p-6">
  <h3 class="text-2xl font-bold">50K Account</h3>
  <span class="text-3xl text-green-600">$299</span>
</div>
```

**Problem:** Only utility classes, no semantic names

**Solution:** Use structure + position
```css
div.flex.flex-col                /* Container */
div.flex.flex-col > h3           /* Account size (first heading) */
div.flex.flex-col > span         /* Price (first span) */
```

**Better:** Add data attributes during development:
```html
<div data-testid="pricing-tier">
```

### Pattern 3: Table-Based Layout
```html
<table class="pricing-table">
  <thead>
    <tr>
      <th>Account Size</th>
      <th>$10K</th>
      <th>$25K</th>
      <th>$50K</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Price</td>
      <td>$99</td>
      <td>$199</td>
      <td>$299</td>
    </tr>
  </tbody>
</table>
```

**Solution:** Extract by column index
```javascript
const accountSizes = Array.from(
  document.querySelectorAll('thead th:not(:first-child)')
).map(th => th.textContent);

const prices = Array.from(
  document.querySelectorAll('tbody tr:first-child td:not(:first-child)')
).map(td => td.textContent);
```

---

## Anti-Bot Protection

### Common Protections

1. **Cloudflare Bot Management** (403/526 errors)
2. **reCAPTCHA** (requires human verification)
3. **Rate Limiting** (IP-based throttling)
4. **User-Agent detection** (blocks headless browsers)
5. **JavaScript challenges** (requires JS execution)

### Detection

```bash
# Test with curl (will fail if bot protection exists)
curl -I https://www.ftmo.com/en/pricing

# Look for:
# - 403 Forbidden
# - 526 Invalid SSL
# - 503 Service Temporarily Unavailable
# - Cloudflare in headers/body
```

### Solutions

#### Level 1: Basic Headers
```javascript
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
await page.setExtraHTTPHeaders({
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml',
});
```

#### Level 2: Puppeteer Stealth Plugin
```javascript
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({ headless: 'new' });
```

#### Level 3: Residential Proxies
```javascript
const browser = await puppeteer.launch({
  args: [
    '--proxy-server=http://residential-proxy.com:8080'
  ]
});
```

#### Level 4: Alternative Data Sources
- Check if firm provides an API
- Use affiliate networks (often have pricing APIs)
- Manual updates with `update_strategy: 'manual'`

---

## Selector Testing

### Test Script Template

Create `backend/price-intelligence/scripts/test-selectors.ts`:

```typescript
import puppeteer from 'puppeteer';

async function testSelectors(url: string, selectors: any) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const results = await page.evaluate((sel) => {
    const containers = document.querySelectorAll(sel.containerSelector);

    return Array.from(containers).map(container => ({
      accountSize: container.querySelector(sel.accountSizeSelector)?.textContent?.trim(),
      price: container.querySelector(sel.priceSelector)?.textContent?.trim(),
      discount: container.querySelector(sel.discountSelector)?.textContent?.trim(),
    }));
  }, selectors);

  console.log('Extracted data:', JSON.stringify(results, null, 2));

  await browser.close();
}

// Test Apex
testSelectors('https://www.apextraderfunding.com/pricing', {
  containerSelector: 'div[class*="pricing-card"]',
  accountSizeSelector: 'h3',
  priceSelector: 'span[class*="price"]',
  discountSelector: 'div[class*="discount"]',
});
```

### Run Test
```bash
cd backend/price-intelligence
npx ts-node scripts/test-selectors.ts
```

---

## Configuration Template

### SQL Insert Template

```sql
INSERT INTO source_catalog (
    prop_firm_id,
    prop_firm_name,
    official_url,
    pricing_page_url,
    update_strategy,
    update_frequency,
    is_active,
    json_config
) VALUES (
    'firm-slug',                          -- Lowercase, hyphenated
    'Firm Display Name',                  -- Proper capitalization
    'https://firm.com',                   -- Homepage
    'https://firm.com/pricing',           -- Pricing page
    'html',                               -- 'api', 'html', 'manual', 'inactive'
    'daily',                              -- 'realtime', 'hourly', '4hourly', 'daily', 'weekly'
    TRUE,                                 -- Active?
    '{
        "htmlSelectors": {
            "containerSelector": "div.pricing-card",
            "accountSizeSelector": "h3",
            "priceSelector": "span.price",
            "originalPriceSelector": "s, del",
            "discountSelector": "div.discount-badge",
            "evaluationFeeSelector": "tr:contains(\"Evaluation\") td",
            "activationFeeSelector": "tr:contains(\"Activation\") td",
            "resetFeeSelector": "tr:contains(\"Reset\") td",
            "monthlyFeeSelector": "tr:contains(\"Monthly\") td"
        },
        "expectedFields": ["accountSize", "price", "discount", "evaluationFee"],
        "affiliateBaseUrl": "https://affiliate.firm.com/?ref=OPFW",
        "notes": "Uses React with dynamic class names. Requires Puppeteer.",
        "priceRangeMin": 50,
        "priceRangeMax": 1500
    }'::jsonb
);
```

### TypeScript Interface (for reference)

```typescript
interface SelectorConfig {
  htmlSelectors: {
    containerSelector?: string;
    accountSizeSelector?: string;
    priceSelector?: string;
    originalPriceSelector?: string;
    discountSelector?: string;
    evaluationFeeSelector?: string;
    activationFeeSelector?: string;
    resetFeeSelector?: string;
    monthlyFeeSelector?: string;
  };
  expectedFields: string[];
  affiliateBaseUrl?: string;
  notes?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
}
```

---

## Checklist for New Firm

- [ ] Navigate to pricing page in browser
- [ ] Inspect HTML structure with DevTools
- [ ] Identify container element selector
- [ ] Identify account size selector
- [ ] Identify current price selector
- [ ] Identify original price selector (if applicable)
- [ ] Identify discount badge selector (if applicable)
- [ ] Identify fee breakdown selectors
- [ ] Test selectors in DevTools console
- [ ] Check for dynamic content (wait 2-3 seconds, re-test)
- [ ] Test with curl to detect bot protection
- [ ] Write test script with Puppeteer
- [ ] Verify data extraction accuracy
- [ ] Document any special requirements (proxies, delays)
- [ ] Add to source_catalog with SQL INSERT
- [ ] Test with manual crawl endpoint
- [ ] Verify data appears in pricing_snapshots table

---

## Troubleshooting

### Problem: Selector returns empty
**Cause:** Element loads after initial page render
**Solution:** Use `page.waitForSelector()` in Puppeteer

### Problem: Extracted text includes extra characters
**Cause:** Whitespace, currency symbols, or child elements
**Solution:** Use `.trim()` and regex to clean:
```javascript
const price = text.replace(/[^0-9.]/g, ''); // Extract numbers only
```

### Problem: Multiple elements match selector
**Cause:** Selector is too broad
**Solution:** Add more specificity or use `:first-child`, `:nth-of-type()`

### Problem: 403/526 errors
**Cause:** Bot protection (Cloudflare, etc.)
**Solution:** Use puppeteer-extra-plugin-stealth or residential proxies

### Problem: Data changes frequently
**Cause:** A/B testing, personalization, or time-based promotions
**Solution:** Run multiple crawls, store historical data, flag as `requiresManualReview`

---

## Resources

- [CSS Selector Reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Puppeteer API Documentation](https://pptr.dev/)
- [Puppeteer Stealth Plugin](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

**Last Updated:** December 2025
**Maintained By:** OnlyPropFirms Development Team
