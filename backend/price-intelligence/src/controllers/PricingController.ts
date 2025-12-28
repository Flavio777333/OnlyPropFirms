import { PricingService } from '../services/PricingService';

/**
 * Controller: Pricing REST Endpoints
 * 
 * Endpoints:
 * - GET /api/v1/pricing/prop-firms
 * - GET /api/v1/pricing/prop-firms/{id}
 * - GET /api/v1/pricing/new-deals
 * 
 * (Wiring to Express/Spring Boot in Phase 1+)
 */
export class PricingController {
    constructor(private pricingService: PricingService) { }

    /**
     * GET /api/v1/pricing/prop-firms
     * Query params: ?propFirmIds=apex,tradeify&minDiscount=10&hasChangedOnly=true
     */
    async listPricing(query: any) {
        const filters = {
            propFirmIds: query.propFirmIds?.split(','),
            minDiscount: parseInt(query.minDiscount, 10) || undefined,
            hasChangedOnly: query.hasChangedOnly === 'true'
        };

        return await this.pricingService.getPricingList(filters);
    }

    /**
     * GET /api/v1/pricing/prop-firms/{propFirmId}
     * Query params: ?accountSize=50000
     */
    async getPricingForFirm(propFirmId: string, query: any) {
        const accountSize = query.accountSize ? parseInt(query.accountSize, 10) : undefined;
        const pricing = await this.pricingService.getPricingForFirm(propFirmId, accountSize);

        if (!pricing) {
            return { error: 'Pricing not found', statusCode: 404 };
        }

        return pricing;
    }

    /**
     * GET /api/v1/pricing/new-deals
     * Returns deals changed in last 24 hours
     */
    async getNewDeals() {
        return await this.pricingService.getNewDeals();
    }
}
