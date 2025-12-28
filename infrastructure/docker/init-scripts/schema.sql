-- Initial Schema for OnlyPropFirms MVP (Phase 0)

CREATE TABLE IF NOT EXISTS prop_firms (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'apex-trader'
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    
    -- Financial Details
    profit_split VARCHAR(20), -- '90/10'
    min_funding INTEGER, -- 25000
    max_funding INTEGER, -- 300000
    evaluation_fee DECIMAL(10, 2),
    
    -- Metadata
    rating DECIMAL(2, 1), -- 4.8
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    -- Affiliate
    affiliate_link VARCHAR(255),
    affiliate_code VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS filters_applied (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL, -- Anonymous cookie ID
    filter_type VARCHAR(50) NOT NULL, -- 'account_size', 'profit_split'
    filter_value VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_prop_firms_funding ON prop_firms (min_funding, max_funding);
CREATE INDEX idx_filters_session ON filters_applied (session_id);

-- Initial Seed Data (Example)
INSERT INTO prop_firms (id, name, profit_split, min_funding, max_funding, evaluation_fee, rating, is_featured) VALUES
('apex-trader', 'Apex Trader Funding', '90/10', 25000, 300000, 147.00, 4.8, true),
('topstep', 'Topstep', '90/10', 50000, 150000, 165.00, 4.7, true),
('myfundedfutures', 'MyFundedFutures', '90/10', 50000, 300000, 150.00, 4.5, false)
ON CONFLICT (id) DO NOTHING;
