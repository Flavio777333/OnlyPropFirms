-- Real Firm Selectors
-- Schema uses json_config for selectors

-- 1. Apex Trader Funding
INSERT INTO source_catalog (
    prop_firm_id, prop_firm_name, official_url, pricing_page_url,
    update_strategy, update_frequency, is_active,
    json_config
) VALUES (
    'apex', 
    'Apex Trader Funding', 
    'https://apextraderfunding.com/', 
    'https://apextraderfunding.com/',
    'HTML_CRAWL', 
    'DAILY', 
    true,
    '{
        "htmlSelectors": {
            "containerSelector": ".pricing-table .col-md-4",
            "accountSizeSelector": "h4",
            "priceSelector": ".price",
            "discountLabelSelector": null
        },
        "expectedFields": ["accountSize", "price"]
    }'
) ON CONFLICT (prop_firm_id) DO UPDATE 
SET pricing_page_url = EXCLUDED.pricing_page_url,
    json_config = EXCLUDED.json_config,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- 2. FTMO
INSERT INTO source_catalog (
    prop_firm_id, prop_firm_name, official_url, pricing_page_url,
    update_strategy, update_frequency, is_active,
    json_config
) VALUES (
    'ftmo', 
    'FTMO', 
    'https://ftmo.com/', 
    'https://ftmo.com/en/#pricing',
    'HTML_CRAWL', 
    'DAILY', 
    true,
    '{
        "htmlSelectors": {
            "containerSelector": ".pricing-table",
            "accountSizeSelector": ".heading",
            "priceSelector": ".price",
            "discountLabelSelector": null
        },
        "expectedFields": ["accountSize", "price"]
    }'
) ON CONFLICT (prop_firm_id) DO NOTHING;

-- 3. TopStep
INSERT INTO source_catalog (
    prop_firm_id, prop_firm_name, official_url, pricing_page_url,
    update_strategy, update_frequency, is_active,
    json_config
) VALUES (
    'topstep', 
    'TopStep', 
    'https://www.topstep.com/', 
    'https://www.topstep.com/pricing/',
    'HTML_CRAWL', 
    'DAILY', 
    true,
    '{
        "htmlSelectors": {
            "containerSelector": ".pricing-card",
            "accountSizeSelector": ".card-title",
            "priceSelector": ".price-amount",
            "discountLabelSelector": null
        },
        "expectedFields": ["accountSize", "price"]
    }'
) ON CONFLICT (prop_firm_id) DO NOTHING;
