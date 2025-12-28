/**
 * Selector Testing Script
 *
 * Purpose: Test CSS selectors against real pricing pages to verify they extract data correctly
 *
 * Usage:
 *   npx ts-node scripts/test-selectors.ts [firm-id]
 *
 * Examples:
 *   npx ts-node scripts/test-selectors.ts apex-trader-funding
 *   npx ts-node scripts/test-selectors.ts ftmo
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { SourceCatalogRepository } from '../src/repositories/SourceCatalogRepository';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/propfirms_mvp';

interface ExtractionResult {
  containerIndex: number;
  accountSize: string | null;
  price: string | null;
  originalPrice: string | null;
  discount: string | null;
  evaluationFee: string | null;
  activationFee: string | null;
  monthlyFee: string | null;
  resetFee: string | null;
}

async function testSelectors(firmId: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing selectors for: ${firmId}`);
  console.log('='.repeat(80));

  const catalogRepo = new SourceCatalogRepository(dbUrl);
  const entries = await catalogRepo.getAllActive();
  const entry = entries.find(e => e.propFirmId === firmId);

  if (!entry) {
    console.error(`❌ Firm '${firmId}' not found in source catalog`);
    console.log('\nAvailable firms:');
    entries.forEach(e => console.log(`  - ${e.propFirmId} (${e.propFirmName})`));
    process.exit(1);
  }

  console.log(`\n📋 Configuration:`);
  console.log(`   Firm: ${entry.propFirmName}`);
  console.log(`   URL: ${entry.pricingPageUrl}`);
  console.log(`   Strategy: ${entry.updateStrategy}`);
  console.log(`   Selectors: ${JSON.stringify(entry.htmlSelectors, null, 2)}`);

  if (entry.updateStrategy !== 'html') {
    console.log(`\n⚠️  Skipping: Firm uses '${entry.updateStrategy}' strategy, not 'html'`);
    process.exit(0);
  }

  console.log(`\n🌐 Launching browser...`);
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  const page = await browser.newPage();

  // Set realistic headers
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });

  console.log(`🔍 Navigating to ${entry.pricingPageUrl}...`);

  try {
    const response = await page.goto(entry.pricingPageUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    if (!response) {
      throw new Error('No response from page');
    }

    console.log(`✅ Page loaded (Status: ${response.status()})`);

    // Wait for potential dynamic content
    console.log(`⏳ Waiting 3 seconds for dynamic content...`);
    await page.waitForTimeout(3000);

    // Test extraction
    console.log(`\n🔬 Testing selectors...`);
    const results = await extractData(page, entry.htmlSelectors || {});

    // Display results
    console.log(`\n📊 Extraction Results:`);
    console.log(`   Found ${results.length} pricing container(s)\n`);

    if (results.length === 0) {
      console.log('❌ No data extracted. Possible issues:');
      console.log('   - Container selector not matching');
      console.log('   - Page uses bot protection');
      console.log('   - Dynamic content not fully loaded');
      console.log('   - Selectors need updating');

      // Debug: Show page HTML structure
      console.log('\n🔍 Debugging: Page Structure');
      await debugPageStructure(page);
    } else {
      results.forEach((result, i) => {
        console.log(`Container ${i + 1}:`);
        console.log(`   Account Size: ${result.accountSize || '❌ Not found'}`);
        console.log(`   Price: ${result.price || '❌ Not found'}`);
        console.log(`   Original Price: ${result.originalPrice || '(none)'}`);
        console.log(`   Discount: ${result.discount || '(none)'}`);
        console.log(`   Evaluation Fee: ${result.evaluationFee || '(none)'}`);
        console.log(`   Activation Fee: ${result.activationFee || '(none)'}`);
        console.log(`   Monthly Fee: ${result.monthlyFee || '(none)'}`);
        console.log(`   Reset Fee: ${result.resetFee || '(none)'}`);
        console.log('');
      });

      // Validate results
      const valid = results.filter(r => r.accountSize && r.price);
      const invalid = results.length - valid.length;

      console.log(`✅ Valid extractions: ${valid.length}`);
      if (invalid > 0) {
        console.log(`⚠️  Invalid/incomplete: ${invalid}`);
      }
    }

    console.log(`\n⏸️  Browser will stay open for manual inspection.`);
    console.log(`   Press Ctrl+C to close when done.`);

    // Keep browser open for manual inspection
    await new Promise(() => {}); // Never resolves - manual kill required

  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);

    if (error.message.includes('timeout')) {
      console.log('\n💡 Possible solutions:');
      console.log('   - Increase timeout value');
      console.log('   - Check if site requires authentication');
      console.log('   - Try different waitUntil strategy');
    } else if (error.message.includes('403') || error.message.includes('526')) {
      console.log('\n💡 Bot protection detected. Possible solutions:');
      console.log('   - Use puppeteer-extra-plugin-stealth');
      console.log('   - Add residential proxy');
      console.log('   - Use slower/human-like navigation');
      console.log('   - Check if firm provides API');
    }

    await browser.close();
    process.exit(1);
  }
}

async function extractData(page: Page, selectors: any): Promise<ExtractionResult[]> {
  return await page.evaluate((sel) => {
    const results: ExtractionResult[] = [];

    // Find containers
    const containerSelector = sel.containerSelector || 'div';
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach((container, index) => {
      const extractText = (selector: string | undefined): string | null => {
        if (!selector) return null;
        const element = container.querySelector(selector);
        return element?.textContent?.trim() || null;
      };

      results.push({
        containerIndex: index,
        accountSize: extractText(sel.accountSizeSelector),
        price: extractText(sel.priceSelector),
        originalPrice: extractText(sel.originalPriceSelector),
        discount: extractText(sel.discountSelector),
        evaluationFee: extractText(sel.evaluationFeeSelector),
        activationFee: extractText(sel.activationFeeSelector),
        monthlyFee: extractText(sel.monthlyFeeSelector),
        resetFee: extractText(sel.resetFeeSelector),
      });
    });

    return results;
  }, selectors);
}

async function debugPageStructure(page: Page) {
  const info = await page.evaluate(() => {
    // Find potential pricing containers by common class patterns
    const patterns = [
      'pricing',
      'price',
      'plan',
      'package',
      'tier',
      'card',
      'challenge',
      'account',
    ];

    const potentialContainers: { selector: string; count: number; sample?: string }[] = [];

    patterns.forEach(pattern => {
      const selector = `div[class*="${pattern}"], article[class*="${pattern}"], section[class*="${pattern}"]`;
      const elements = document.querySelectorAll(selector);

      if (elements.length > 0) {
        potentialContainers.push({
          selector,
          count: elements.length,
          sample: elements[0]?.outerHTML.substring(0, 200),
        });
      }
    });

    return {
      title: document.title,
      bodyClasses: document.body.className,
      potentialContainers,
    };
  });

  console.log(`   Title: ${info.title}`);
  console.log(`   Body classes: ${info.bodyClasses || '(none)'}`);
  console.log(`\n   Potential container selectors found:`);

  if (info.potentialContainers.length === 0) {
    console.log('      ❌ No common pricing patterns found');
  } else {
    info.potentialContainers.forEach(c => {
      console.log(`      - ${c.selector} (${c.count} element(s))`);
      if (c.sample) {
        console.log(`        Sample: ${c.sample}...`);
      }
    });
  }
}

// CLI Entry Point
const firmId = process.argv[2];

if (!firmId) {
  console.error('❌ Usage: npx ts-node scripts/test-selectors.ts <firm-id>');
  console.error('\nExample: npx ts-node scripts/test-selectors.ts apex-trader-funding');
  process.exit(1);
}

testSelectors(firmId).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
