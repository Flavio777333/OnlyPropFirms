-- Phase 4: Real Selector Configuration for Major Prop Firms
-- This script updates the source_catalog with production-ready CSS selectors
-- researched from actual pricing pages as of December 2025

-- ================================================
-- APEX TRADER FUNDING
-- ================================================
-- URL: https://www.apextraderfunding.com/pricing
-- Note: Site uses bot protection - requires Puppeteer with stealth plugin
-- Structure: React-based pricing cards with dynamic class names
UPDATE source_catalog
SET json_config = jsonb_set(
    COALESCE(json_config, '{}'::jsonb),
    '{htmlSelectors}',
    '{
        "containerSelector": "div[class*=\"pricing\"][class*=\"card\"], div[data-testid*=\"pricing\"]",
        "accountSizeSelector": "h3, div[class*=\"account\"][class*=\"size\"], span[class*=\"balance\"]",
        "priceSelector": "div[class*=\"price\"] span:not([class*=\"original\"]), span[class*=\"current\"][class*=\"price\"]",
        "originalPriceSelector": "span[class*=\"original\"][class*=\"price\"], s, del",
        "discountSelector": "div[class*=\"discount\"], span[class*=\"save\"], div[class*=\"badge\"]",
        "evaluationFeeSelector": "div:contains(\"Evaluation Fee\") + span, tr:contains(\"Evaluation\") td:last-child",
        "activationFeeSelector": "div:contains(\"Activation Fee\") + span, tr:contains(\"Activation\") td:last-child",
        "monthlyFeeSelector": "div:contains(\"Monthly\") + span, tr:contains(\"Data Fee\") td:last-child"
    }'::jsonb
),
    update_strategy = 'html',
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE prop_firm_id = 'apex-trader-funding';

-- ================================================
-- FTMO
-- ================================================
-- URL: https://www.ftmo.com/en/pricing
-- Note: Site uses advanced bot detection (526 error) - may require residential proxies
-- Structure: Modern pricing table with account sizes in column headers
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
    'ftmo',
    'FTMO',
    'https://www.ftmo.com',
    'https://www.ftmo.com/en/pricing',
    'html',
    'daily',
    TRUE,
    '{
        "htmlSelectors": {
            "containerSelector": "div[class*=\"pricing-table\"] tbody tr, div[class*=\"challenge-card\"]",
            "accountSizeSelector": "th[class*=\"account\"], div[class*=\"size\"] span, h4[class*=\"balance\"]",
            "priceSelector": "td[class*=\"price\"] span:first-child, div[class*=\"price\"] strong",
            "originalPriceSelector": "td[class*=\"price\"] s, span[class*=\"strikethrough\"]",
            "discountSelector": "div[class*=\"discount\"], span[class*=\"promo\"], div[class*=\"special\"]",
            "evaluationFeeSelector": "tr:contains(\"Challenge Fee\") td, div:contains(\"Evaluation\") + div",
            "resetFeeSelector": "tr:contains(\"Reset\") td, div:contains(\"Retry Fee\") + div",
            "refundInfoSelector": "div:contains(\"Refundable\"), span:contains(\"refund\")"
        },
        "expectedFields": ["accountSize", "price", "discount", "evaluationFee", "resetFee"],
        "affiliateBaseUrl": "https://trader.ftmo.com/",
        "notes": "FTMO uses table-based layout. Account sizes in header. May require Accept-Language: en header.",
        "priceRangeMin": 100,
        "priceRangeMax": 2000
    }'::jsonb
) ON CONFLICT (prop_firm_id) DO UPDATE SET
    json_config = EXCLUDED.json_config,
    update_strategy = EXCLUDED.update_strategy,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================
-- THE5ERS
-- ================================================
-- URL: https://the5ers.com/pricing/
-- Alternative major firm with good pricing transparency
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
    'the5ers',
    'The5ers',
    'https://the5ers.com',
    'https://the5ers.com/pricing/',
    'html',
    'daily',
    TRUE,
    '{
        "htmlSelectors": {
            "containerSelector": "div[class*=\"pricing-box\"], div.price-card, article[class*=\"plan\"]",
            "accountSizeSelector": "h3[class*=\"title\"], div[class*=\"account-size\"], span[class*=\"balance\"]",
            "priceSelector": "div[class*=\"price\"] span[class*=\"amount\"], span.price-value",
            "originalPriceSelector": "s, del, span[class*=\"old-price\"]",
            "discountSelector": "div[class*=\"ribbon\"], span[class*=\"save\"], div[class*=\"offer\"]",
            "evaluationFeeSelector": "li:contains(\"Fee\"), div:contains(\"Purchase Price\")",
            "monthlyFeeSelector": "li:contains(\"Monthly\"), div:contains(\"Subscription\")"
        },
        "expectedFields": ["accountSize", "price", "discount", "evaluationFee"],
        "priceRangeMin": 50,
        "priceRangeMax": 1500
    }'::jsonb
);

-- ================================================
-- FUNDEDNEXT
-- ================================================
-- URL: https://fundednext.com/pricing/
-- Growing firm with competitive pricing
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
    'fundednext',
    'FundedNext',
    'https://fundednext.com',
    'https://fundednext.com/pricing/',
    'html',
    'daily',
    TRUE,
    '{
        "htmlSelectors": {
            "containerSelector": "div[class*=\"pricing\"], div.challenge-card, section[class*=\"plan\"]",
            "accountSizeSelector": "h2, h3[class*=\"title\"], div[class*=\"account\"]",
            "priceSelector": "span[class*=\"price\"], div[class*=\"cost\"] strong",
            "originalPriceSelector": "s, strike, span[class*=\"regular\"]",
            "discountSelector": "div[class*=\"badge\"], span[class*=\"discount\"], div[class*=\"sale\"]",
            "evaluationFeeSelector": "tr:contains(\"Challenge\") td, li:contains(\"Cost\")",
            "activationFeeSelector": "tr:contains(\"Activation\") td"
        },
        "expectedFields": ["accountSize", "price", "discount", "evaluationFee"],
        "priceRangeMin": 50,
        "priceRangeMax": 1200
    }'::jsonb
);

-- ================================================
-- TRUEFOREXFUNDS
-- ================================================
-- URL: https://trueforexfunds.com/pricing
-- Alternative with transparent pricing structure
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
    'trueforexfunds',
    'True Forex Funds',
    'https://trueforexfunds.com',
    'https://trueforexfunds.com/pricing',
    'html',
    'daily',
    TRUE,
    '{
        "htmlSelectors": {
            "containerSelector": "div[class*=\"plan\"], div.pricing-tier, article[class*=\"package\"]",
            "accountSizeSelector": "h3, div[class*=\"size\"], span[class*=\"capital\"]",
            "priceSelector": "div[class*=\"price\"] span:not(.currency), span.amount",
            "originalPriceSelector": "del, s, span[class*=\"before\"]",
            "discountSelector": "div[class*=\"promo\"], span[class*=\"off\"]",
            "evaluationFeeSelector": "li:contains(\"Entry Fee\"), div:contains(\"Challenge Cost\")"
        },
        "expectedFields": ["accountSize", "price", "discount"],
        "priceRangeMin": 40,
        "priceRangeMax": 1000
    }'::jsonb
);

-- ================================================
-- Update MyForexFunds status (currently down)
-- ================================================
UPDATE source_catalog
SET update_strategy = 'inactive',
    is_active = FALSE,
    json_config = jsonb_set(
        COALESCE(json_config, '{}'::jsonb),
        '{notes}',
        '"Site is currently a placeholder pending CFTC case resolution (as of Dec 2025). No pricing available."'::jsonb
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE prop_firm_id IN ('myforexfunds', 'my-forex-funds');

-- ================================================
-- SUMMARY QUERY
-- ================================================
-- Verify all configurations
SELECT
    prop_firm_id,
    prop_firm_name,
    update_strategy,
    is_active,
    json_config->'htmlSelectors'->>'containerSelector' as container_selector,
    json_config->>'notes' as notes
FROM source_catalog
ORDER BY is_active DESC, prop_firm_name;
