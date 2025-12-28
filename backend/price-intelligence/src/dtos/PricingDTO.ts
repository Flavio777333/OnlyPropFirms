/**
 * API Response DTO
 * What the frontend receives from GET /api/v1/pricing/prop-firms/{id}
 */
export interface PricingDTO {
    // Identity
    propFirmId: string;
    propFirmName: string;

    // Price Information
    accountSize: number;
    accountSizeCurrency: string;

    currentPrice: number;
    priceCurrency: string;
    discountPercent: number;
    discountLabel?: string;

    // True Cost (calculated)
    trueCost?: {
        evaluationFee: number;
        activationFee: number;
        totalFirstMonth: number;
    };

    // Recency
    lastUpdatedAt: Date;
    lastUpdatedAtISO: string; // ISO string for frontend
    lastUpdatedAgo: string; // "2 hours ago", human-readable

    // Flags for UI
    isNewDeal: boolean; // Changed in last 24h?
    isFeaturedDeal?: boolean; // Admin-marked as featured?
    requiresManualReview: boolean;

    // Links
    affiliateLink?: string; // Where to click "Get Funded"
    sourceUrl: string; // Where we found this price
}

export interface PricingListDTO {
    data: PricingDTO[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    };
    filters?: {
        propFirmId?: string;
        minDiscount?: number;
        hasChangedOnly?: boolean;
    };
}
