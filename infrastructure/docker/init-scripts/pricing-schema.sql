-- Source Catalog Table
-- Stores configuration for scraping Prop Firms
CREATE TABLE IF NOT EXISTS source_catalog (
    prop_firm_id VARCHAR(100) PRIMARY KEY,
    prop_firm_name VARCHAR(255) NOT NULL,
    official_url TEXT NOT NULL,
    pricing_page_url TEXT NOT NULL,
    update_strategy VARCHAR(50) DEFAULT 'html', -- 'api', 'html', 'manual'
    update_frequency VARCHAR(50) DEFAULT 'daily',    
    is_active BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    failure_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    json_config JSONB -- Flexible field for selectors, headers, specific scraping rules
);

-- Pricing Snapshots Table
-- Immutable record of price observations
CREATE TABLE IF NOT EXISTS pricing_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prop_firm_id VARCHAR(100) NOT NULL REFERENCES source_catalog(prop_firm_id),
    account_size INT NOT NULL,
    account_size_currency VARCHAR(10) DEFAULT 'USD',
    current_price DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(10) DEFAULT 'USD',
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_label VARCHAR(255),
    snapshot_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_new_deal BOOLEAN DEFAULT FALSE,
    requires_manual_review BOOLEAN DEFAULT FALSE,
    source_url TEXT
);

-- Indexes for fast querying
CREATE INDEX idx_pricing_snapshots_firm_date ON pricing_snapshots(prop_firm_id, snapshot_created_at DESC);
CREATE INDEX idx_pricing_snapshots_new_deals ON pricing_snapshots(is_new_deal) WHERE is_new_deal = TRUE;
