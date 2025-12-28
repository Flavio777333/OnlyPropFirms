import { Pricing } from '../types/pricing';

export interface PricingFilters {
    minPrice?: number;
    maxPrice?: number;
    accountSize?: number;
}

class PricingService {
    private baseUrl = 'http://localhost:8082/api/v1';

    async getPropFirms(filters?: PricingFilters): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.accountSize) params.append('accountSize', filters.accountSize.toString());
        // Add other filters as needed

        const response = await fetch(`${this.baseUrl}/pricing/prop-firms?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch pricing');
        return response.json();
    }

    async getFirmDetails(id: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/pricing/prop-firms/${id}`);
        if (!response.ok) throw new Error('Failed to fetch firm details');
        return response.json();
    }

    async getNewDeals(): Promise<Pricing[]> {
        const response = await fetch(`${this.baseUrl}/pricing/new-deals`);
        if (!response.ok) throw new Error('Failed to fetch new deals');
        const json = await response.json();
        return json.map((item: any) => ({
            ...item,
            lastUpdatedAt: new Date(item.lastSeenAt)
        }));
    }

    async compareFirms(firmIds: string[], accountSize?: number): Promise<any[]> {
        const params = new URLSearchParams();
        params.append('ids', firmIds.join(','));
        if (accountSize) params.append('accountSize', accountSize.toString());

        const response = await fetch(`${this.baseUrl}/pricing/compare?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch comparison');
        const json = await response.json();
        return json.data; // Assuming backend returns { data: [...] }
    }
}

export const pricingService = new PricingService();
