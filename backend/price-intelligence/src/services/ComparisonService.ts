import { PricingRepository } from '../repositories/PricingRepository';
import { Pricing } from '../models/Pricing';

export interface ComparisonResult {
    accountSize: number;
    firms: {
        [firmId: string]: Pricing;
    };
    bestValueFirmId?: string; // Firm with lowest True Cost
}

export class ComparisonService {
    constructor(private pricingRepo: PricingRepository) { }

    /**
     * Compares selected firms across available account sizes.
     * Returns a matrix-friendly structure:
     * [
     *   { accountSize: 50000, firms: { 'ftmo': {...}, 'apex': {...} }, bestValue: 'apex' },
     *   { accountSize: 100000, firms: { 'ftmo': {...}, 'apex': {...} }, bestValue: 'apex' }
     * ]
     */
    async compareFirms(firmIds: string[], accountSize?: number): Promise<ComparisonResult[]> {
        const pricings = await this.pricingRepo.getPricingForFirms(firmIds, accountSize);

        // Group by Account Size
        const groupedMap = new Map<number, ComparisonResult>();

        for (const price of pricings) {
            if (!groupedMap.has(price.accountSize)) {
                groupedMap.set(price.accountSize, {
                    accountSize: price.accountSize,
                    firms: {},
                    bestValueFirmId: undefined
                });
            }

            const group = groupedMap.get(price.accountSize)!;
            group.firms[price.propFirmId] = price;

            // Determine Best Value (Simple Logic: Lowest True Cost)
            // Initialize or update if lower
            if (!group.bestValueFirmId) {
                group.bestValueFirmId = price.propFirmId;
            } else {
                const currentBest = group.firms[group.bestValueFirmId];
                if (price.trueCost !== undefined && currentBest.trueCost !== undefined) {
                    if (price.trueCost < currentBest.trueCost) {
                        group.bestValueFirmId = price.propFirmId;
                    }
                } else if (price.currentPrice < currentBest.currentPrice) {
                    // Fallback to advertised price if trueCost missing
                    group.bestValueFirmId = price.propFirmId;
                }
            }
        }

        // Convert Map to Array and Sort by Account Size
        return Array.from(groupedMap.values()).sort((a, b) => a.accountSize - b.accountSize);
    }
}
