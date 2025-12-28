import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';

puppeteer.use(StealthPlugin());

export class PriceCrawler {

    async crawlPricingPage(entry: SourceCatalogEntry): Promise<string> {
        console.log(`[Crawler] Starting crawl for ${entry.propFirmName} (${entry.pricingPageUrl})`);

        let browser;
        try {
            // Launch headless browser
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set User Agent to look like a real browser
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Navigate
            await page.goto(entry.pricingPageUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for selector if specified
            if (entry.htmlSelectors?.containerSelector) {
                try {
                    await page.waitForSelector(entry.htmlSelectors.containerSelector, { timeout: 5000 });
                } catch (e) {
                    console.warn(`[Crawler] Warning: Container selector ${entry.htmlSelectors.containerSelector} not found.`);
                }
            }

            // Get HTML
            const content = await page.content();
            return content;

        } catch (error) {
            console.error(`[Crawler] Error crawling ${entry.propFirmId}:`, error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }

    configureLimits(maxRequestsPerHour: number, respectRobotsTxt: boolean): void {
        // Phase 2: Rate limiting implementation
    }

    async schedulePeriodicCrawl(catalogEntry: SourceCatalogEntry, frequency: string): Promise<void> {
        // Phase 2: Scheduler implementation
    }
}
