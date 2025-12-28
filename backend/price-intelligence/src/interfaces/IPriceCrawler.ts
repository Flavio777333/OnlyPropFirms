import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

/**
 * Interface: Web Crawler (Placeholder for Phase 1+)
 * Will be implemented in separate module when ready
 */
export interface IPriceCrawler {
    /**
     * Fetch pricing from external source
     */
    crawlPricingPage(catalogEntry: SourceCatalogEntry): Promise<string | Record<string, any>>;

    /**
     * Respect robots.txt and rate limits
     */
    configureLimits(maxRequestsPerHour: number, respectRobotsTxt: boolean): void;

    /**
     * Schedule periodic crawls
     */
    schedulePeriodicCrawl(catalogEntry: SourceCatalogEntry, frequency: string): Promise<void>;
}
