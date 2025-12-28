import { Pricing, PricingSnapshot } from '../models/Pricing';

/**
 * Interface: Pricing Persistence Layer
 * Implemented by: PricingRepository (Phase 1+)
 */
export interface IPricingStore {
    /**
     * Save a new pricing snapshot
     */
    savePricingSnapshot(pricing: Pricing): Promise<PricingSnapshot>;

    /**
     * Retrieve current pricing for a firm
     */
    getCurrentPricing(propFirmId: string, accountSize?: number): Promise<Pricing | null>;

    /**
     * Retrieve pricing history (for price graphs later)
     */
    getPricingHistory(propFirmId: string, accountSize: number, days: number): Promise<PricingSnapshot[]>;

    /**
     * Bulk get current pricing for multiple firms
     */
    getBulkPricing(filters?: { propFirmIds?: string[]; minDiscount?: number }): Promise<Pricing[]>;

    /**
     * Get pricing for specific firms (Comparison Feature)
     */
    getPricingForFirms(firmIds: string[], accountSize?: number): Promise<Pricing[]>;
}
