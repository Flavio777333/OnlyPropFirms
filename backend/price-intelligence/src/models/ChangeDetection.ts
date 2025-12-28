/**
 * Price Change Detection Result
 */
export interface PriceChange {
    propFirmId: string;
    accountSize: number;

    // What changed?
    fieldChanges: {
        fieldName: string; // 'currentPrice' | 'discountPercent' | 'resetFee'
        oldValue: any;
        newValue: any;
        changedAt: Date;
    }[];

    // Impact
    hasSignificantChange: boolean; // Is this noteworthy for user?
    changeReasons?: string[]; // e.g., ["discount_increased", "fee_added"]

    // Metadata
    compareTimestamp: Date;
}

export interface ChangeDetectionResult {
    timestamp: Date;
    totalEntriesProcessed: number;
    changesDetected: PriceChange[];
    newDeals: PriceChange[]; // Changes in last 24 hours
    failedComparisons: {
        propFirmId: string;
        reason: string;
    }[];
}
