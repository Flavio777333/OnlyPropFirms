/**
 * Frontend Type Definitions for Pricing Data
 * Mirrors backend PricingDTO, but may include UI-specific fields
 */

export interface Pricing {
    // Identity
    propFirmId: string;
    propFirmName: string;

    // Price Information
    accountSize: number;
    accountSizeCurrency: 'USD' | 'EUR' | 'GBP';

    currentPrice: number;
    priceCurrency: 'USD' | 'EUR' | 'GBP';
    discountPercent: number;
    discountLabel?: string;

    // Recency
    lastUpdatedAt: Date;
    lastUpdatedAtISO: string;
    lastUpdatedAgo: string; // "2 hours ago"

    // UI Flags
    isNewDeal: boolean;
    isFeaturedDeal?: boolean;
    requiresManualReview: boolean;

    // Links
    affiliateLink?: string;
    sourceUrl: string;
}

export interface PricingListResponse {
    data: Pricing[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    };
}

/**
 * Deal Badge Information (for UI components)
 */
export interface DealBadge {
    label: string; // "NEUER DEAL", "-20% DISCOUNT", "NEW"
    variant: 'new' | 'discount' | 'featured' | 'alert';
    tooltip?: string;
}

export function getDealBadges(pricing: Pricing): DealBadge[] {
    const badges: DealBadge[] = [];

    if (pricing.isNewDeal) {
        badges.push({
            label: 'NEUER DEAL',
            variant: 'new',
            tooltip: `Changed ${pricing.lastUpdatedAgo}`
        });
    }

    if (pricing.discountPercent > 0) {
        badges.push({
            label: `-${pricing.discountPercent}% DISCOUNT`,
            variant: 'discount',
            tooltip: pricing.discountLabel || 'Limited time offer'
        });
    }

    if (pricing.isFeaturedDeal) {
        badges.push({
            label: 'FEATURED',
            variant: 'featured'
        });
    }

    if (pricing.requiresManualReview) {
        badges.push({
            label: 'PRICE UNVERIFIED',
            variant: 'alert'
        });
    }

    return badges;
}
