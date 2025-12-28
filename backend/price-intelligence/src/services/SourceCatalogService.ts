import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

/**
 * Service: Source Catalog Management
 * Manages the catalog of Prop Firms to crawl
 */
export class SourceCatalogService {
    private catalog: Map<string, SourceCatalogEntry> = new Map();

    /**
     * Load catalog from seed file
     */
    async loadCatalogFromSeed(seedPath: string): Promise<void> {
        // TODO: Phase 1
        console.log(`Loading catalog from ${seedPath}`);
    }

    /**
     * Get active catalog entries (to be crawled)
     */
    getActiveCatalogEntries(): SourceCatalogEntry[] {
        return Array.from(this.catalog.values()).filter(e => e.isActive);
    }

    /**
     * Get catalog entry by prop-firm ID
     */
    getCatalogEntry(propFirmId: string): SourceCatalogEntry | undefined {
        return this.catalog.get(propFirmId);
    }

    /**
     * Update catalog entry (e.g., after successful crawl)
     */
    async updateCatalogEntry(
        propFirmId: string,
        updates: Partial<SourceCatalogEntry>
    ): Promise<void> {
        const entry = this.catalog.get(propFirmId);
        if (entry) {
            Object.assign(entry, updates);
        }
    }

    /**
     * Mark entry as needing manual review
     */
    async markForManualReview(propFirmId: string, reason: string): Promise<void> {
        const entry = this.catalog.get(propFirmId);
        if (entry) {
            entry.notes = `[Manual Review Needed] ${reason}`;
        }
    }
}
