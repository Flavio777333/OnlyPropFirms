import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PricingRepository } from './repositories/PricingRepository';
import { SourceCatalogRepository } from './repositories/SourceCatalogRepository';
import { PricingService } from './services/PricingService';
import { ChangeDetectionService } from './services/ChangeDetectionService';
import { PricingController } from './controllers/PricingController';
import { PriceCrawler } from './services/PriceCrawler';
import { PriceNormalizer } from './services/PriceNormalizer';

import { CrawlScheduler } from './services/CrawlScheduler';

dotenv.config();

const app = express();
const port = process.env.PORT || 8082; // Updated to 8082

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/onlypropfirms';

console.log(`[Init] Connecting to database...`);
const pricingRepo = new PricingRepository(dbUrl);
const catalogRepo = new SourceCatalogRepository(dbUrl);

// Services
const changeDetector = new ChangeDetectionService();
const crawler = new PriceCrawler();
const normalizer = new PriceNormalizer();
const scheduler = new CrawlScheduler(catalogRepo, crawler, normalizer, pricingRepo, changeDetector);

// Start Scheduler
scheduler.start();

// Main Service
const pricingService = new PricingService(pricingRepo, changeDetector);

// Controller
const pricingController = new PricingController(pricingService);

// Routes
const router = express.Router();

router.get('/pricing/prop-firms', (req, res) => pricingController.listPricing(req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message })));
router.get('/pricing/prop-firms/:id', (req, res) => pricingController.getPricingForFirm(req.params.id, req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message })));
router.get('/pricing/new-deals', (req, res) => pricingController.getNewDeals().then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message })));

// Temporary Crawl Trigger (for Manual Verification)
router.post('/admin/crawl/:firmId', async (req, res) => {
    try {
        const firmId = req.params.firmId;
        console.log(`[Admin] Manual crawl triggered for ${firmId}`);

        // 1. Get Catalog Entry
        // This is a simplified flow for Phase 1.1 - ideally this logic moves to a Service
        const entries = await catalogRepo.getAllActive();
        const entry = entries.find(e => e.propFirmId === firmId);

        if (!entry) {
            return res.status(404).json({ error: 'Firm not found in catalog' });
        }

        // 2. Crawl
        const html = await crawler.crawlPricingPage(entry);

        // 3. Normalize
        const pricings = await normalizer.normalizeFromHTML(html as string, entry);

        // 4. Save & Detect Changes
        const results = [];
        for (const p of pricings) {
            const oldSnapshot = await pricingRepo.getCurrentPricing(p.propFirmId, p.accountSize);

            if (oldSnapshot) {
                const change = changeDetector.detectChanges(oldSnapshot, p);
                p.hasChanged = !!change;
            } else {
                p.hasChanged = true; // First time seen
            }

            const saved = await pricingRepo.savePricingSnapshot(p);
            results.push(saved);
        }

        res.json({ success: true, count: results.length, data: results });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/v1', router);

// Start Server
app.listen(port, () => {
    console.log(`[Server] Price Intelligence Service running on port ${port}`);
});
