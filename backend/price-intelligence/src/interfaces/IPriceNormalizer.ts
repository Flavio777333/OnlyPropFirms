import { Pricing } from '../models/Pricing';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

/**
 * Interface: Data Normalization
 * Converts HTML/API responses into internal Pricing model
 * Implemented by: PricingNormalizerService (Phase 1+)
 */
export interface IPriceNormalizer {
    /**
     * Parse HTML response into Pricing[]
     */
    normalizeFromHTML(
        html: string,
        catalogEntry: SourceCatalogEntry
    ): Promise<Pricing[]>;

    /**
     * Parse API response into Pricing[]
     */
    normalizeFromAPI(
        apiResponse: Record<string, any>,
        catalogEntry: SourceCatalogEntry
    ): Promise<Pricing[]>;

    /**
     * Validate pricing data against schema
     */
    validate(pricing: Partial<Pricing>): { valid: boolean; errors: string[] };
}
