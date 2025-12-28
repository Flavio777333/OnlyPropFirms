import { Pool } from 'pg';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

export class SourceCatalogRepository {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
    }

    async getAllActive(): Promise<SourceCatalogEntry[]> {
        const client = await this.pool.connect();
        try {
            const res = await client.query('SELECT * FROM source_catalog WHERE is_active = TRUE');
            return res.rows.map(this.mapRowToEntry);
        } finally {
            client.release();
        }
    }

    async save(entry: SourceCatalogEntry): Promise<void> {
        const client = await this.pool.connect();
        try {
            const query = `
        INSERT INTO source_catalog (
            prop_firm_id, prop_firm_name, official_url, pricing_page_url,
            update_strategy, update_frequency, is_active,
            json_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (prop_firm_id) DO UPDATE SET
            prop_firm_name = EXCLUDED.prop_firm_name,
            update_strategy = EXCLUDED.update_strategy,
            updated_at = CURRENT_TIMESTAMP
      `;
            const values = [
                entry.propFirmId, entry.propFirmName, entry.officialUrl, entry.pricingPageUrl,
                entry.updateStrategy, entry.updateFrequency, entry.isActive,
                JSON.stringify({
                    htmlSelectors: entry.htmlSelectors,
                    expectedFields: entry.expectedFields
                })
            ];
            await client.query(query, values);
        } finally {
            client.release();
        }
    }

    private mapRowToEntry(row: any): SourceCatalogEntry {
        const config = row.json_config || {};
        return {
            propFirmId: row.prop_firm_id,
            propFirmName: row.prop_firm_name,
            officialUrl: row.official_url,
            pricingPageUrl: row.pricing_page_url,
            updateStrategy: row.update_strategy,
            updateFrequency: row.update_frequency,
            isActive: row.is_active,
            htmlSelectors: config.htmlSelectors,
            expectedFields: config.expectedFields,
            failureCount: row.failure_count || 0,
            maxConsecutiveFailures: 5
        };
    }
}
