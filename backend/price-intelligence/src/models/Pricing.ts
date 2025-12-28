/**
 * Core Pricing Model
 * Represents the current price & discount information for a Prop Firm
 */
export interface Pricing {
    // Identity
    id?: string; // UUID, auto-generated on persistence
    propFirmId: string; // Links to prop-firm entity
    propFirmName: string; // Display name (from Catalog)


    // Pricing Data
    accountSize: number; // in USD (e.g., 25000, 50000, 100000)
    accountSizeCurrency: 'USD' | 'EUR' | 'GBP'; // Typically USD

    // Current Pricing
    currentPrice: number; // Account evaluation cost in local currency
    priceCurrency: 'USD' | 'EUR' | 'GBP';
    discountPercent: number; // 0-100; 0 = no discount
    discountLabel?: string; // e.g., "Holiday Special", "Black Friday", "New Year"

    // Fees Breakdown (Optional, for True Cost calculation later)
    evaluationFee?: number;
    activationFee?: number;
    resetFee?: number;
    monthlyDataFee?: number;
    trueCost?: number; // Calculated Total Cost


    // Meta
    sourceUrl: string; // Where this price came from
    sourceTimestamp: Date; // When we found this price (from crawler)
    lastSeenAt: Date; // When we last verified this price

    // Change Tracking
    hasChanged: boolean; // Did this change since last snapshot?
    changedAt?: Date; // When it changed

    // QA Flags
    requiresManualReview: boolean; // Parser failed, needs human check
    isVerified: boolean; // Has a human confirmed this price?
    notes?: string; // Internal notes (e.g., "Price format unusual")
}

/**
 * Pricing Snapshot for Versioning
 * Immutable record of a pricing observation
 */
export interface PricingSnapshot extends Pricing {
    snapshotId: string; // UUID, unique per observation
    snapshotCreatedAt: Date; // When this snapshot was recorded
    version: number; // Incrementing version for this prop-firm + account-size combo
}
