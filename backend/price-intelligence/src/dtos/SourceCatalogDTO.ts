/**
 * Public view of Source Catalog
 * (Internal; not exposed to external API)
 */
export interface SourceCatalogDTO {
    propFirmId: string;
    propFirmName: string;

    pricingPageUrl: string;
    updateStrategy: string;
    updateFrequency: string;

    isActive: boolean;
    lastCheckedAt?: Date;
    failureCount: number;

    expectedFields: string[];
}
