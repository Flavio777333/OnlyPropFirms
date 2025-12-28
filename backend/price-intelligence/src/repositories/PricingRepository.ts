import { Pool, PoolClient } from 'pg';
import { IPricingStore } from '../interfaces/IPricingStore';
import { Pricing, PricingSnapshot } from '../models/Pricing';
import { PricingDTO } from '../dtos/PricingDTO';

export class PricingRepository implements IPricingStore {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({
            connectionString,
        });
    }

    /**
     * Save a new pricing snapshot
     */
    async savePricingSnapshot(pricing: Pricing): Promise<PricingSnapshot> {
        const client = await this.pool.connect();
        try {
            const query = `
        INSERT INTO pricing_snapshots (
          prop_firm_id, account_size, account_size_currency,
          current_price, price_currency, discount_percent, discount_label,
          is_new_deal, requires_manual_review, source_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;

            const values = [
                pricing.propFirmId,
                pricing.accountSize,
                pricing.accountSizeCurrency,
                pricing.currentPrice,
                pricing.priceCurrency,
                pricing.discountPercent,
                pricing.discountLabel,
                pricing.hasChanged, // is_new_deal logic can be refined
                pricing.requiresManualReview,
                pricing.sourceUrl
            ];

            const res = await client.query(query, values);
            return this.mapRowToSnapshot(res.rows[0]);
        } finally {
            client.release();
        }
    }

    /**
     * Retrieve current pricing for a firm
     * Gets the LATEST snapshot for each account size
     */
    async getCurrentPricing(propFirmId: string, accountSize?: number): Promise<Pricing | null> {
        const client = await this.pool.connect();
        try {
            let query = `
        SELECT DISTINCT ON (ps.prop_firm_id, ps.account_size) 
          ps.*,
          sc.prop_firm_name
        FROM pricing_snapshots ps
        JOIN source_catalog sc ON ps.prop_firm_id = sc.prop_firm_id
        WHERE ps.prop_firm_id = $1
      `;

            const values: any[] = [propFirmId];

            if (accountSize) {
                query += ` AND ps.account_size = $2`;
                values.push(accountSize);
            }

            query += ` ORDER BY ps.prop_firm_id, ps.account_size, ps.snapshot_created_at DESC`;

            const res = await client.query(query, values);

            if (res.rows.length === 0) return null;

            return this.mapRowToPricing(res.rows[0]);
        } finally {
            client.release();
        }
    }

    /**
     * Bulk get current pricing
     */
    async getBulkPricing(filters?: { propFirmIds?: string[]; minDiscount?: number }): Promise<Pricing[]> {
        const client = await this.pool.connect();
        try {
            // Complex query to get latest per group
            let query = `
        SELECT DISTINCT ON (ps.prop_firm_id, ps.account_size) 
          ps.*,
          sc.prop_firm_name
        FROM pricing_snapshots ps
        JOIN source_catalog sc ON ps.prop_firm_id = sc.prop_firm_id
        WHERE 1=1
      `;

            const values: any[] = [];
            let idx = 1;

            if (filters?.propFirmIds && filters.propFirmIds.length > 0) {
                query += ` AND ps.prop_firm_id = ANY($${idx})`;
                values.push(filters.propFirmIds);
                idx++;
            }

            if (filters?.minDiscount) {
                query += ` AND ps.discount_percent >= $${idx}`;
                values.push(filters.minDiscount);
                idx++;
            }

            query += ` ORDER BY ps.prop_firm_id, ps.account_size, ps.snapshot_created_at DESC`;

            const res = await client.query(query, values);
            return res.rows.map(this.mapRowToPricing);
        } finally {
            client.release();
        }
    }

    async getPricingHistory(propFirmId: string, accountSize: number, days: number): Promise<PricingSnapshot[]> {
        throw new Error('Method not implemented.');
    }

    // Mappers
    private mapRowToPricing(row: any): Pricing {
        return {
            propFirmName: row.prop_firm_name || row.prop_firm_id,
            propFirmId: row.prop_firm_id,
            accountSize: row.account_size,
            accountSizeCurrency: row.account_size_currency,
            currentPrice: parseFloat(row.current_price),
            priceCurrency: row.price_currency,
            discountPercent: parseFloat(row.discount_percent),
            discountLabel: row.discount_label,
            sourceUrl: row.source_url,
            sourceTimestamp: row.snapshot_created_at,
            lastSeenAt: row.snapshot_created_at,
            hasChanged: row.is_new_deal,
            requiresManualReview: row.requires_manual_review,
            isVerified: true
        };
    }

    private mapRowToSnapshot(row: any): PricingSnapshot {
        return {
            ...this.mapRowToPricing(row),
            snapshotId: row.snapshot_id,
            snapshotCreatedAt: row.snapshot_created_at,
            version: 1 // TODO
        };
    }
}
