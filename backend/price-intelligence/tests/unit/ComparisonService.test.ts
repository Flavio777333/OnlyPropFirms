import { ComparisonService } from '../../src/services/ComparisonService';
import { PricingRepository } from '../../src/repositories/PricingRepository';
import { Pricing } from '../../src/models/Pricing';

// Mock Repository
const mockRepo = {
    getPricingForFirms: jest.fn()
} as unknown as PricingRepository;

describe('ComparisonService', () => {
    let service: ComparisonService;

    beforeEach(() => {
        service = new ComparisonService(mockRepo);
    });

    const mockPricing: Pricing[] = [
        // FTMO 50k
        {
            propFirmId: 'ftmo',
            propFirmName: 'FTMO',
            accountSize: 50000,
            accountSizeCurrency: 'USD',
            currentPrice: 350,
            priceCurrency: 'USD',
            trueCost: 350,
            discountPercent: 0,
            sourceUrl: '', sourceTimestamp: new Date(), lastSeenAt: new Date(), hasChanged: false, requiresManualReview: false, isVerified: true
        },
        // Apex 50k (Cheaper)
        {
            propFirmId: 'apex',
            propFirmName: 'Apex',
            accountSize: 50000,
            accountSizeCurrency: 'USD',
            currentPrice: 150,
            priceCurrency: 'USD',
            trueCost: 200, // Includes fees
            discountPercent: 0,
            sourceUrl: '', sourceTimestamp: new Date(), lastSeenAt: new Date(), hasChanged: false, requiresManualReview: false, isVerified: true
        },
        // FTMO 100k
        {
            propFirmId: 'ftmo',
            propFirmName: 'FTMO',
            accountSize: 100000,
            accountSizeCurrency: 'USD',
            currentPrice: 600,
            priceCurrency: 'USD',
            trueCost: 600,
            discountPercent: 0,
            sourceUrl: '', sourceTimestamp: new Date(), lastSeenAt: new Date(), hasChanged: false, requiresManualReview: false, isVerified: true
        }
    ];

    it('should group pricing by account size and identify best value', async () => {
        (mockRepo.getPricingForFirms as jest.Mock).mockResolvedValue(mockPricing);

        const result = await service.compareFirms(['ftmo', 'apex']);

        expect(result).toHaveLength(2); // 50k and 100k

        // Group 1: 50k
        const group50k = result.find(g => g.accountSize === 50000);
        expect(group50k).toBeDefined();
        expect(group50k?.firms['ftmo']).toBeDefined();
        expect(group50k?.firms['apex']).toBeDefined();

        // Best value should be Apex (True Cost 200 vs 350)
        expect(group50k?.bestValueFirmId).toBe('apex');

        // Group 2: 100k
        const group100k = result.find(g => g.accountSize === 100000);
        expect(group100k).toBeDefined();
        expect(group100k?.firms['ftmo']).toBeDefined();
        expect(group100k?.bestValueFirmId).toBe('ftmo'); // Only one option
    });
});
