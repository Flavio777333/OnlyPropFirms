import { IPriceChangeDetector } from '../interfaces/IPriceChangeDetector';
import { Pricing } from '../models/Pricing';
import { PriceChange } from '../models/ChangeDetection';

/**
 * Service: Change Detection Logic
 * Phase 1: Stub implementation
 */
export class ChangeDetectionService implements IPriceChangeDetector {

    /**
     * Compare old vs new pricing snapshots
     */
    detectChanges(oldSnapshot: Pricing, newSnapshot: Pricing): PriceChange | null {
        const changes: { fieldName: string, oldValue: any, newValue: any, changedAt: Date }[] = [];

        // Check Price
        if (oldSnapshot.currentPrice !== newSnapshot.currentPrice) {
            changes.push({
                fieldName: 'currentPrice',
                oldValue: oldSnapshot.currentPrice,
                newValue: newSnapshot.currentPrice,
                changedAt: new Date()
            });
        }

        // Check Discount
        if (oldSnapshot.discountPercent !== newSnapshot.discountPercent) {
            changes.push({
                fieldName: 'discountPercent',
                oldValue: oldSnapshot.discountPercent,
                newValue: newSnapshot.discountPercent,
                changedAt: new Date()
            });
        }

        if (changes.length === 0) return null;

        // Determine significance
        // A price drop or discount increase is significant
        const isPriceDrop = newSnapshot.currentPrice < oldSnapshot.currentPrice;
        const isDiscountIncrease = newSnapshot.discountPercent > oldSnapshot.discountPercent;

        return {
            propFirmId: newSnapshot.propFirmId,
            accountSize: newSnapshot.accountSize,
            fieldChanges: changes,
            hasSignificantChange: isPriceDrop || isDiscountIncrease,
            changeReasons: isPriceDrop ? ['price_drop'] : (isDiscountIncrease ? ['discount_increase'] : []),
            compareTimestamp: new Date()
        };
    }

    async getRecentChanges(since: Date): Promise<PriceChange[]> {
        // Phase 1: In a real app, this would query the DB for records with `is_new_deal = true`
        // For now, we'll return an empty array or rely on the Controller to fetch from Repository
        return [];
    }

    async identifyNewDeals(changeThresholdPercent: number): Promise<PriceChange[]> {
        return [];
    }
}
