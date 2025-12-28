import { IPricingStore } from '../interfaces/IPricingStore';
import { IPriceChangeDetector } from '../interfaces/IPriceChangeDetector';
import { Pricing, PricingSnapshot } from '../models/Pricing';
import { PricingDTO, PricingListDTO } from '../dtos/PricingDTO';

/**
 * Service: Pricing Business Logic
 * Orchestrates pricing retrieval, change detection, and API responses
 * 
 * Dependencies:
 * - IPricingStore (to be injected)
 * - IPriceChangeDetector (to be injected)
 */
export class PricingService {
    constructor(
        private pricingStore: IPricingStore,
        private changeDetector: IPriceChangeDetector
    ) { }

    /**
     * Get current pricing for a firm (formatted as DTO for API)
     */
    async getPricingForFirm(
        propFirmId: string,
        accountSize?: number
    ): Promise<PricingDTO | null> {
        const pricing = await this.pricingStore.getCurrentPricing(propFirmId, accountSize);

        if (!pricing) return null;

        return this.mapToPricingDTO(pricing);
    }

    /**
     * Get list of all current pricing (with filters)
     */
    async getPricingList(filters?: {
        propFirmIds?: string[];
        minDiscount?: number;
        hasChangedOnly?: boolean;
    }): Promise<PricingListDTO> {
        const pricings = await this.pricingStore.getBulkPricing(filters);

        const dtos = pricings.map(p => this.mapToPricingDTO(p));

        return {
            data: dtos,
            meta: {
                total: dtos.length,
                page: 1,
                pageSize: dtos.length,
                hasMore: false
            },
            filters
        };
    }

    /**
     * Get recent deals (changed in last 24h)
     */
    async getNewDeals(): Promise<PricingDTO[]> {
        const changes = await this.changeDetector.getRecentChanges(
            new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        const deals = await Promise.all(
            changes.map(change =>
                this.pricingStore.getCurrentPricing(change.propFirmId)
            )
        );

        return deals
            .filter(d => d !== null)
            .map(d => this.mapToPricingDTO(d!));
    }

    /**
     * Internal: Map Pricing model to DTO
     */
    private mapToPricingDTO(pricing: Pricing): PricingDTO {
        const now = new Date();
        const minutesAgo = Math.floor((now.getTime() - pricing.lastSeenAt.getTime()) / 60000);
        const lastUpdatedAgo = minutesAgo < 60
            ? `${minutesAgo}m ago`
            : `${Math.floor(minutesAgo / 60)}h ago`;

        return {
            propFirmId: pricing.propFirmId,
            propFirmName: 'TODO', // Will come from prop-firm table join
            accountSize: pricing.accountSize,
            accountSizeCurrency: pricing.accountSizeCurrency,
            currentPrice: pricing.currentPrice,
            priceCurrency: pricing.priceCurrency,
            discountPercent: pricing.discountPercent,
            discountLabel: pricing.discountLabel,
            lastUpdatedAt: pricing.lastSeenAt,
            lastUpdatedAtISO: pricing.lastSeenAt.toISOString(),
            lastUpdatedAgo,
            isNewDeal: pricing.hasChanged && pricing.changedAt ?
                (now.getTime() - pricing.changedAt.getTime()) < 24 * 60 * 60 * 1000 : false,
            requiresManualReview: pricing.requiresManualReview,
            sourceUrl: pricing.sourceUrl
        };
    }
}
