import puppeteer from 'puppeteer';
import { IPriceCrawler } from '../interfaces/IPriceCrawler';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

export class PriceCrawler implements IPriceCrawler {

    async crawlPricingPage(catalogEntry: SourceCatalogEntry): Promise<string> {
        console.log(`[Crawler] Starting crawl for ${catalogEntry.propFirmName} (${catalogEntry.pricingPageUrl})`);

        // Launch headless browser
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            // Set User-Agent to avoid immediate blocks
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Navigate
            await page.goto(catalogEntry.pricingPageUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for selector if specified
            if (catalogEntry.htmlSelectors?.containerSelector) {
                try {
                    await page.waitForSelector(catalogEntry.htmlSelectors.containerSelector, { timeout: 5000 });
                } catch (e) {
                    console.warn(`[Crawler] Warning: Container selector ${catalogEntry.htmlSelectors.containerSelector} not found.`);
                }
            }

            // Get HTML
            const content = await page.content();
            return content;

        } catch (error) {
            console.error(`[Crawler] Error crawling ${catalogEntry.propFirmId}:`, error);
            throw error;
        } finally {
            await browser.close();
        }
    }

    configureLimits(maxRequestsPerHour: number, respectRobotsTxt: boolean): void {
        // Phase 2: Rate limiting implementation
    }

    async schedulePeriodicCrawl(catalogEntry: SourceCatalogEntry, frequency: string): Promise<void> {
        // Phase 2: Scheduler implementation
    }
}
