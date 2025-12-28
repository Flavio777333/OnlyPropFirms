import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const propFirms = [
    { id: 'myfundedfutures', url: 'https://myfundedfutures.com' },
    { id: 'tradeday', url: 'https://tradeday.io' },
    { id: 'earn2trade', url: 'https://earn2trade.com' },
    { id: 'takeprofittrader', url: 'https://takeprofittrader.com' },
    { id: 'bulenox', url: 'https://bulenox.com' },
    { id: 'uprofit', url: 'https://uprofit.com' },
    { id: 'tickticktrader', url: 'https://tickticktrader.com' },
    { id: 'elitetraderfunding', url: 'https://elitetraderfunding.com' },
    { id: 'bluskytrading', url: 'https://bluskytrading.com' },
    { id: 'fundingticks', url: 'https://fundingticks.com' },
    { id: 'daytraders', url: 'https://daytraders.com' },
    { id: 'fundedfuturesnetwork', url: 'https://fundedfuturesnetwork.com' },
    { id: 'fasttracktrading', url: 'https://fasttracktrading.net' },
    { id: 'the5ers', url: 'https://the5ers.com' },
    { id: 'fundednext', url: 'https://fundednext.com' },
    { id: 'fundingpips', url: 'https://fundingpips.com' },
    { id: 'e8markets', url: 'https://e8markets.com' },
    { id: 'goatfundedtrader', url: 'https://goatfundedtrader.com' },
    { id: 'alphacapitalgroup', url: 'https://alphacapitalgroup.uk' },
    { id: 'maventrading', url: 'https://maventrading.com' },
    { id: 'fxify', url: 'https://fxify.com' },
    { id: 'blueberryfunded', url: 'https://blueberryfunded.com' },
    { id: 'citytradersimperium', url: 'https://citytradersimperium.com' },
    { id: 'dnafunded', url: 'https://dnafunded.com' },
    { id: 'funderpro', url: 'https://funderpro.com' },
    { id: 'instantfunding', url: 'https://instantfunding.io' },
    { id: 'larkfunding', url: 'https://larkfunding.com' },
    { id: 'audacitycapital', url: 'https://audacitycapital.com' },
    { id: 'mentfunding', url: 'https://mentfunding.com' },
    { id: 'surgetrader', url: 'https://surgetrader.com' },
    { id: 'thefundedtrader', url: 'https://thefundedtraderprogram.com' }
];

const searchTerms = ['50K', '100K', '50,000', '100,000', '$', '€', 'Evaluation', 'Challenge', 'Assessment'];
const CONCURRENCY = 3;

async function inspectUrl(browser: any, firm: { id: string, url: string }) {
    console.log(`[${firm.id}] Inspecting ${firm.url}...`);
    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        // Shorter timeout to fail fast on slow sites
        await page.goto(firm.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait a bit for JS rendering
        await new Promise(r => setTimeout(r, 2000));

        const html = await page.content();
        const $ = cheerio.load(html);

        let sizeSelectors: { [key: string]: number } = {};
        let priceSelectors: { [key: string]: number } = {};
        let containerCandidates: { [key: string]: number } = {};

        $('*').each((i, el: any) => {
            const text = $(el).clone().children().remove().end().text().trim();
            if (text.length > 0 && text.length < 50) {
                const isSize = ['50K', '100K', '50,000', '100,000'].some(t => text.includes(t));
                const isPrice = ['$', '€'].some(t => text.includes(t)) && /\d/.test(text);

                if (isSize || isPrice) {
                    const tag = el.tagName;
                    const className = $(el).attr('class');
                    // Simple selector generation
                    let selector = tag;
                    if (className) selector += `.${className.split(/\s+/).filter((c: string) => !c.includes(':') && !c.includes('/')).join('.')}`;
                    // Avoid excessively long selectors or unique IDs

                    if (isSize) sizeSelectors[selector] = (sizeSelectors[selector] || 0) + 1;
                    if (isPrice) priceSelectors[selector] = (priceSelectors[selector] || 0) + 1;

                    // Container heuristic: Parent of this element
                    const parentTag = $(el).parent().prop('tagName');
                    const parentClass = $(el).parent().attr('class');
                    let parentSelector = parentTag;
                    if (parentClass) parentSelector += `.${parentClass.split(/\s+/).filter((c: string) => !c.includes(':')).join('.')}`;
                    containerCandidates[parentSelector] = (containerCandidates[parentSelector] || 0) + 1;
                }
            }
        });

        // Pick top Candidates
        const topSize = Object.entries(sizeSelectors).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        const topPrice = Object.entries(priceSelectors).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        const topContainer = Object.entries(containerCandidates).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return {
            id: firm.id,
            selectors: {
                containerSelector: topContainer,
                accountSizeSelector: topSize,
                priceSelector: topPrice,
                discountLabelSelector: null
            },
            status: 'SUCCESS'
        };

    } catch (error: any) {
        console.error(`[${firm.id}] Error: ${error.message}`);
        return { id: firm.id, status: 'ERROR', error: error.message };
    } finally {
        if (page) await page.close();
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const results = [];

    // Chunk array for concurrency
    for (let i = 0; i < propFirms.length; i += CONCURRENCY) {
        const chunk = propFirms.slice(i, i + CONCURRENCY);
        const promises = chunk.map(firm => inspectUrl(browser, firm));
        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
    }

    await browser.close();

    // Generate SQL
    let sqlOutput = '-- Generated Selectors\n';
    results.forEach((r: any) => {
        if (r.status === 'SUCCESS' && r.selectors.containerSelector) {
            const config = JSON.stringify({ htmlSelectors: r.selectors, expectedFields: ["accountSize", "price"] });
            sqlOutput += `UPDATE source_catalog SET json_config = '${config}' WHERE prop_firm_id = '${r.id}';\n`;
        } else {
            sqlOutput += `-- [${r.id}] Failed to detect selectors or connection error.\n`;
        }
    });

    console.log(sqlOutput);
    fs.writeFileSync('generated-selectors.sql', sqlOutput);
})();
