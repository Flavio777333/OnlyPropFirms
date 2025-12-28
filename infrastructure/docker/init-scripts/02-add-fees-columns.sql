-- Add fee structure columns to pricing_snapshots
ALTER TABLE pricing_snapshots ADD COLUMN IF NOT EXISTS activation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pricing_snapshots ADD COLUMN IF NOT EXISTS evaluation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pricing_snapshots ADD COLUMN IF NOT EXISTS monthly_data_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pricing_snapshots ADD COLUMN IF NOT EXISTS true_cost DECIMAL(10,2);
