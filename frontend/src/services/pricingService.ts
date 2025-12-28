import { pricingApi } from '@/lib/apiClient';
import { Pricing } from '../types/pricing';

export interface PricingFilters {
    minPrice?: number;
    maxPrice?: number;
    accountSize?: number;
}

/**
 * Pricing Service
 * Handles all communication with the Price Intelligence backend (Node.js)
 */
class PricingService {
    /**
     * Get pricing data for all prop firms
     */
    async getPropFirms(filters?: PricingFilters): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.accountSize) params.append('accountSize', filters.accountSize.toString());
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return pricingApi.get<any[]>(`/pricing/prop-firms${query}`);
    }

    /**
     * Get pricing details for a specific firm
     */
    async getFirmDetails(id: string, accountSize?: number): Promise<any> {
        const params = accountSize ? `?accountSize=${accountSize}` : '';
        return pricingApi.get<any>(`/pricing/prop-firms/${id}${params}`);
    }

    /**
     * Get new deals (recent price changes or discounts)
     */
    async getNewDeals(): Promise<Pricing[]> {
        const deals = await pricingApi.get<any[]>('/pricing/new-deals');
        return deals.map((item: any) => ({
            ...item,
            lastUpdatedAt: new Date(item.lastSeenAt),
        }));
    }

    /**
     * Compare pricing across multiple firms
     */
    async compareFirms(firmIds: string[], accountSize?: number): Promise<any[]> {
        const params = new URLSearchParams();
        params.append('ids', firmIds.join(','));
        if (accountSize) params.append('accountSize', accountSize.toString());

        const response = await pricingApi.get<{ data: any[] }>(`/pricing/compare?${params.toString()}`);
        return response.data;
    }
}

export const pricingService = new PricingService();
