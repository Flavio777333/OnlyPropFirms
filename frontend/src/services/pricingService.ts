import { Pricing, PricingListResponse } from '../types/pricing';

/**
 * Service: Pricing API Integration
 * 
 * Phase 0: Uses mock data + Postman/curl testing
 * Phase 1: Real API calls to backend
 */
class PricingService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

    /**
   * Fetch pricing list (with optional filters)
   */
    async fetchPricingList(params?: {
        propFirmIds?: string[];
        minDiscount?: number;
        hasChangedOnly?: boolean;
    }): Promise<PricingListResponse> {
        const searchParams = new URLSearchParams();
        if (params?.propFirmIds) searchParams.append('propFirmIds', params.propFirmIds.join(','));
        if (params?.minDiscount) searchParams.append('minDiscount', params.minDiscount.toString());
        if (params?.hasChangedOnly) searchParams.append('hasChangedOnly', 'true');

        try {
            const res = await fetch(`${this.baseUrl}/pricing/prop-firms?${searchParams.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch pricing list');
            return await res.json();
        } catch (error) {
            console.error('[PricingService] Error:', error);
            // Fallback to empty list or re-throw
            return { data: [], meta: { total: 0, page: 1, pageSize: 20, hasMore: false } };
        }
    }

    /**
     * Fetch pricing for a specific firm
     */
    async fetchPricingForFirm(
        propFirmId: string,
        accountSize?: number
    ): Promise<Pricing | null> {
        try {
            const url = `${this.baseUrl}/pricing/prop-firms/${propFirmId}` +
                (accountSize ? `?accountSize=${accountSize}` : '');
            const res = await fetch(url);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error('Failed to fetch firm pricing');
            return await res.json();
        } catch (error) {
            console.error('[PricingService] Error:', error);
            return null;
        }
    }

    /**
     * Fetch new deals (last 24h)
     */
    async fetchNewDeals(): Promise<Pricing[]> {
        try {
            const res = await fetch(`${this.baseUrl}/pricing/new-deals`);
            if (!res.ok) throw new Error('Failed to fetch new deals');
            return await res.json();
        } catch (error) {
            console.error('[PricingService] Error:', error);
            return [];
        }
    }

    /**
     * MOCK DATA (Phase 0 only)
     */
    private getMockPricingList(): PricingListResponse {
        return {
            data: [
                {
                    propFirmId: 'apex-trader-funding',
                    propFirmName: 'Apex Trader Funding',
                    accountSize: 50000,
                    accountSizeCurrency: 'USD',
                    currentPrice: 297,
                    priceCurrency: 'USD',
                    discountPercent: 0,
                    lastUpdatedAt: new Date(),
                    lastUpdatedAtISO: new Date().toISOString(),
                    lastUpdatedAgo: '2 hours ago',
                    isNewDeal: false,
                    requiresManualReview: false,
                    sourceUrl: 'https://www.apextraderfunding.com/pricing',
                    affiliateLink: 'https://affiliate.apex.com?code=PW'
                },
                {
                    propFirmId: 'tradeify',
                    propFirmName: 'Tradeify',
                    accountSize: 50000,
                    accountSizeCurrency: 'USD',
                    currentPrice: 199,
                    priceCurrency: 'USD',
                    discountPercent: 30,
                    discountLabel: 'New Year Special',
                    lastUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    lastUpdatedAtISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    lastUpdatedAgo: '2 hours ago',
                    isNewDeal: true,
                    requiresManualReview: false,
                    sourceUrl: 'https://www.tradeify.com/pricing',
                    affiliateLink: 'https://tradeify.com/ref/PW'
                }
            ],
            meta: {
                total: 2,
                page: 1,
                pageSize: 20,
                hasMore: false
            }
        };
    }
}

export const pricingService = new PricingService();
