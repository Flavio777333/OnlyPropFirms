-- Fix Selectors based on Dec 2025 Inspection

-- 1. Apex Trader Funding
-- Found: Size in h3.mb-20, Price in p.mt-3.mb-0
UPDATE source_catalog
SET json_config = '{
    "htmlSelectors": {
        "containerSelector": "div:has(> h3.mb-20)",
        "accountSizeSelector": "h3.mb-20",
        "priceSelector": "p.mt-3.mb-0",
        "discountLabelSelector": null
    },
    "expectedFields": ["accountSize", "price"]
}'
WHERE prop_firm_id = 'apex';

-- 2. FTMO
-- Found: Size in div.h2 or h5.h5, Price in div.h4
UPDATE source_catalog
SET json_config = '{
    "htmlSelectors": {
        "containerSelector": "div:has(> div.h2)",
        "accountSizeSelector": "div.h2",
        "priceSelector": "div.h4",
        "discountLabelSelector": null
    },
    "expectedFields": ["accountSize", "price"]
}'
WHERE prop_firm_id = 'ftmo';

-- 3. TopStep
-- Found: Container .pricing-grid--column--data, Size .pricing-grid--buying-power, Price .pricing-grid--column--price
UPDATE source_catalog
SET official_url = 'https://www.topstep.com',
    pricing_page_url = 'https://www.topstep.com',
    json_config = '{
    "htmlSelectors": {
        "containerSelector": ".pricing-grid--column--data",
        "accountSizeSelector": ".pricing-grid--buying-power",
        "priceSelector": ".pricing-grid--column--price",
        "discountLabelSelector": null
    },
    "expectedFields": ["accountSize", "price"]
}'
WHERE prop_firm_id = 'topstep';
