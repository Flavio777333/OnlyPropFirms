import * as cheerio from 'cheerio';
import { IPriceNormalizer } from '../interfaces/IPriceNormalizer';
import { Pricing } from '../models/Pricing';
import { SourceCatalogEntry } from '../models/SourceCatalogEntry';
import { TrueCostService } from './TrueCostService';

export class PriceNormalizer implements IPriceNormalizer {
    private trueCostService = new TrueCostService();

    async normalizeFromHTML(html: string, catalogEntry: SourceCatalogEntry): Promise<Pricing[]> {
        const $ = cheerio.load(html);
        const results: Pricing[] = [];
        const selectors = catalogEntry.htmlSelectors;

        if (!selectors || !selectors.containerSelector) {
            console.warn(`[Normalizer] No container selector for ${catalogEntry.propFirmId}`);
            return [];
        }

        $(selectors.containerSelector).each((_, element) => {
            const $el = $(element);

            let accountSizeText = selectors.accountSizeSelector ? $el.find(selectors.accountSizeSelector).text() : '';
            let priceText = selectors.priceSelector ? $el.find(selectors.priceSelector).text() : '';
            let discountText = selectors.discountSelector ? $el.find(selectors.discountSelector).text() : '';

            // Extract optional fees if selectors exist (Phase 2)
            // For now, we default to 0, but this is where we'd add `activationFeeSelector`
            let activationFee = 0;
            let monthlyDataFee = 0;

            // Parsing logic
            const accountSize = this.parseNumber(accountSizeText);
            const currentPrice = this.parseNumber(priceText);
            const discountPercent = this.parseNumber(discountText) || 0;

            if (accountSize > 0 && currentPrice > 0) {
                const pricing: Pricing = {
                    propFirmId: catalogEntry.propFirmId,
                    propFirmName: catalogEntry.propFirmName,
                    accountSize: accountSize,
                    accountSizeCurrency: 'USD',
                    currentPrice: currentPrice,
                    priceCurrency: 'USD',
                    discountPercent: discountPercent,

                    // Fees
                    activationFee: activationFee,
                    monthlyDataFee: monthlyDataFee,
                    evaluationFee: 0,

                    sourceUrl: catalogEntry.pricingPageUrl,
                    sourceTimestamp: new Date(),
                    lastSeenAt: new Date(),
                    hasChanged: false,
                    requiresManualReview: false,
                    isVerified: false
                };

                // Calculate True Cost
                pricing.trueCost = this.trueCostService.calculateTrueCost(pricing);

                results.push(pricing);
            }
        });

        return results;
    }

    async normalizeFromAPI(apiResponse: Record<string, any>, catalogEntry: SourceCatalogEntry): Promise<Pricing[]> {
        // Phase 2 for API strategies
        return [];
    }

    validate(pricing: Partial<Pricing>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        if (!pricing.propFirmId) errors.push('Missing propFirmId');
        if (!pricing.currentPrice || pricing.currentPrice < 0) errors.push('Invalid price');
        if (!pricing.accountSize) errors.push('Invalid account size');
        return { valid: errors.length === 0, errors };
    }

    // Utility to extract numbers like "$149.00" -> 149
    private parseNumber(text: string): number {
        if (!text) return 0;
        const clean = text.replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    }
}
