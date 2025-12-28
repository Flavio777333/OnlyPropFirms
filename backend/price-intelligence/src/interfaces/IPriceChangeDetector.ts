import { Pricing } from '../models/Pricing';
import { PriceChange } from '../models/ChangeDetection';

/**
 * Interface: Change Detection Logic
 * Implemented by: ChangeDetectionService
 */
export interface IPriceChangeDetector {
    /**
     * Compare old vs new pricing snapshots
     */
    detectChanges(oldSnapshot: Pricing, newSnapshot: Pricing): PriceChange | null;

    /**
     * Mark all changes from last 24h
     */
    getRecentChanges(since: Date): Promise<PriceChange[]>;

    /**
     * Identify "new deals" (significant price drops)
     */
    identifyNewDeals(changeThresholdPercent: number): Promise<PriceChange[]>;
}
