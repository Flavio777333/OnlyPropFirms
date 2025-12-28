import cron from 'node-cron';
import { SourceCatalogRepository } from '../repositories/SourceCatalogRepository';
import { PriceCrawler } from './PriceCrawler';
import { PriceNormalizer } from './PriceNormalizer';
import { PricingRepository } from '../repositories/PricingRepository';
import { ChangeDetectionService } from './ChangeDetectionService';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

export class CrawlScheduler {
    constructor(
        private catalogRepo: SourceCatalogRepository,
        private crawler: PriceCrawler,
        private normalizer: PriceNormalizer,
        private pricingRepo: PricingRepository,
        private changeDetector: ChangeDetectionService
    ) { }

    start() {
        console.log('[Scheduler] specialized job scheduler started');

        // Daily crawl at 09:00 UTC
        // In a real app, we'd parse entry.updateFrequency instead of hardcoding
        cron.schedule('0 9 * * *', () => {
            console.log('[Scheduler] Triggering daily crawl job...');
            this.runBatchCrawl();
        });

        console.log('[Scheduler] Jobs scheduled: Daily (09:00 UTC)');
    }

    async runBatchCrawl() {
        console.log('[Scheduler] Starting batch crawl...');
        try {
            const activeEntries = await this.catalogRepo.getAllActive();
            console.log(`[Scheduler] Found ${activeEntries.length} active firms to crawl.`);

            for (const entry of activeEntries) {
                await this.processEntry(entry);
            }
            console.log('[Scheduler] Batch crawl completed.');
        } catch (error) {
            console.error('[Scheduler] Batch crawl failed:', error);
        }
    }

    private async processEntry(entry: SourceCatalogEntry) {
        if (entry.updateStrategy !== 'html') {
            console.log(`[Scheduler] Skipping ${entry.propFirmId} (strategy: ${entry.updateStrategy})`);
            return;
        }

        console.log(`[Scheduler] Crawling ${entry.propFirmId}...`);
        try {
            // 1. Crawl
            const html = await this.crawler.crawlPricingPage(entry);

            // 2. Normalize
            const pricings = await this.normalizer.normalizeFromHTML(html, entry);

            if (pricings.length === 0) {
                console.warn(`[Scheduler] No pricing data found for ${entry.propFirmId}`);
                return;
            }

            // 3. Save & Detect Changes
            let changesCount = 0;
            for (const p of pricings) {
                const oldSnapshot = await this.pricingRepo.getCurrentPricing(p.propFirmId, p.accountSize);

                if (oldSnapshot) {
                    const change = this.changeDetector.detectChanges(oldSnapshot, p);
                    p.hasChanged = !!change;
                    if (change) changesCount++;
                } else {
                    p.hasChanged = true; // First time seen
                    changesCount++;
                }

                await this.pricingRepo.savePricingSnapshot(p);
            }
            console.log(`[Scheduler] Finished ${entry.propFirmId}: ${pricings.length} prices, ${changesCount} changes.`);

        } catch (error) {
            console.error(`[Scheduler] Failed to process ${entry.propFirmId}:`, error);
            // In Phase 2: Update failure count in SourceCatalog
        }
    }
}
