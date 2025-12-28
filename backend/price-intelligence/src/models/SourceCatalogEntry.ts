/**
 * Source Catalog Entry
 * Defines HOW and WHERE to fetch pricing data for a Prop Firm
 */
export interface SourceCatalogEntry {
    // Identity
    propFirmId: string; // Must match prop-firm table
    propFirmName: string; // Denormalized for readability

    // URLs
    officialUrl: string; // Main website
    pricingPageUrl: string; // Specific pricing page
    affiliateBaseUrl?: string; // Where to redirect for affiliate tracking

    // Update Strategy
    updateStrategy: 'api' | 'html' | 'manual' | 'inactive';
    updateFrequency: 'realtime' | 'hourly' | '4hourly' | 'daily' | 'weekly' | 'manual';

    // If API-based
    apiEndpoint?: string; // URL to pricing API, if available
    apiAuthentication?: 'none' | 'bearer_token' | 'api_key'; // Auth method
    apiKey?: string; // ENCRYPTED; stored in secrets manager in production

    // If HTML-based
    htmlSelectors?: {
        accountSizeSelector?: string; // CSS/XPath to account size label
        priceSelector?: string; // CSS/XPath to price
        discountSelector?: string; // CSS/XPath to discount
        containerSelector?: string; // Parent container for repeated pricing rows
    };

    // Data Mapping
    expectedFields: string[]; // Which fields to extract: ['price', 'discount', 'resetFee']
    fieldMapping?: Record<string, string>; // Map source field names to internal model

    // Validation
    priceRangeMin?: number; // Sanity check: price should be > this
    priceRangeMax?: number; // Sanity check: price should be < this

    // Metadata
    isActive: boolean; // Should crawler include this?
    lastCheckedAt?: Date; // Last successful fetch
    lastFailureAt?: Date; // Last error
    failureCount: number; // Consecutive failures
    maxConsecutiveFailures: number; // After this many, mark as inactive

    // Notes
    notes?: string; // e.g., "Site blocks scrapers; use API instead"
    maintainedBy?: string; // GitHub handle of person responsible
}
