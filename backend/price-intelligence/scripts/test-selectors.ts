import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

puppeteer.use(StealthPlugin());

const url = process.argv[2];
const selector = process.argv[3];

if (!url) {
  console.error('Usage: npx ts-node scripts/test-selectors.ts <url> [selector]');
  process.exit(1);
}

(async () => {
  console.log(`Testing URL: ${url}`);

  // Launch browser (Headful for debugging if needed, but stealth works best headless usually)
  const browser = await puppeteer.launch({
    headless: true, // Switch to false to see it opening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Page loaded. Extracting HTML...');
    const html = await page.content();
    const $ = cheerio.load(html);

    if (selector) {
      console.log(`\nTesting Selector: "${selector}"`);
      const elements = $(selector);
      console.log(`Found ${elements.length} matches.`);

      elements.each((i, el) => {
        const text = $(el).text().trim();
        console.log(`[${i}] Text: "${text}"`);
        // Check for price patterns
        if (text.match(/[\d,]+\.?\d*/)) {
          console.log(`    -> Potential Price: ${text}`);
        }
      });
    } else {
      console.log('\nNo specific selector provided. Dumping Title and H1s:');
      console.log('Title:', $('title').text());
      $('h1').each((i, el) => console.log(`H1: ${$(el).text().trim()}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
