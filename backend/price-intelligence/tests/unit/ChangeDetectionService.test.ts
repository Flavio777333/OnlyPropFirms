import { ChangeDetectionService } from '../../src/services/ChangeDetectionService';
import { Pricing } from '../../src/models/Pricing';

describe('ChangeDetectionService', () => {
    let service: ChangeDetectionService;

    beforeEach(() => {
        service = new ChangeDetectionService();
    });

    const basePricing: Pricing = {
        propFirmId: 'firm-1',
        propFirmName: 'Firm 1',
        accountSize: 50000,
        accountSizeCurrency: 'USD',
        currentPrice: 300,
        priceCurrency: 'USD',
        discountPercent: 0,
        sourceUrl: 'http://test.com',
        sourceTimestamp: new Date(),
        lastSeenAt: new Date(),
        hasChanged: false,
        requiresManualReview: false,
        isVerified: true
    };

    it('should return null when no changes are detected', () => {
        const change = service.detectChanges(basePricing, basePricing);
        expect(change).toBeNull();
    });

    it('should detect price drop', () => {
        const newPricing = { ...basePricing, currentPrice: 200 }; // Drop from 300 to 200
        const change = service.detectChanges(basePricing, newPricing);

        expect(change).not.toBeNull();
        expect(change?.hasSignificantChange).toBe(true);
        expect(change?.changeReasons).toContain('price_drop');
        expect(change?.fieldChanges).toHaveLength(1);
        expect(change?.fieldChanges[0].fieldName).toBe('currentPrice');
        expect(change?.fieldChanges[0].oldValue).toBe(300);
        expect(change?.fieldChanges[0].newValue).toBe(200);
    });

    it('should detect discount increase', () => {
        const newPricing = { ...basePricing, discountPercent: 20 }; // Increase from 0 to 20%
        const change = service.detectChanges(basePricing, newPricing);

        expect(change).not.toBeNull();
        expect(change?.hasSignificantChange).toBe(true);
        expect(change?.changeReasons).toContain('discount_increase');
    });

    it('should detect price increase (insignificant change)', () => {
        const newPricing = { ...basePricing, currentPrice: 400 }; // Increase
        const change = service.detectChanges(basePricing, newPricing);

        expect(change).not.toBeNull();
        expect(change?.hasSignificantChange).toBe(false); // Not significant for deal hunting
        expect(change?.changeReasons).toEqual([]);
    });
});
