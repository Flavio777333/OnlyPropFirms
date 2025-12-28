import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

puppeteer.use(StealthPlugin());

const url = process.argv[2];
const searchTerms = ['50K', '100K', '50,000', '100,000', '$', '€', 'Evaluation'];

if (!url) {
    console.error('Usage: npx ts-node scripts/inspect-page.ts <url>');
    process.exit(1);
}

(async () => {
    console.log(`Inspecting URL: ${url}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        console.log('--- Found Elements containing Price/Size keywords ---');

        // Search for elements containing key terms
        // We look for leaf nodes (no children) or nodes with text directly
        $('*').each((i, el: any) => {
            const text = $(el).clone().children().remove().end().text().trim(); // Get own text only
            if (text.length > 0 && text.length < 50 && searchTerms.some(term => text.includes(term))) {
                // Build path
                const parents = $(el).parents().map((i, p: any) => p.tagName).get().reverse().join(' > ');
                const tag = el.tagName;
                const className = $(el).attr('class');
                const id = $(el).attr('id');

                let selector = tag;
                if (id) selector += `#${id}`;
                if (className) selector += `.${className.split(' ').join('.')}`;

                console.log(`MATCH: "${text}"`);
                console.log(`  Path: ${parents} > ${selector}`);
                console.log('---');
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
