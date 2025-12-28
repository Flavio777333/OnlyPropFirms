import { javaApi } from '@/lib/apiClient';
import { PropFirm } from '@/store/features/propFirms/propFirmSlice';

/**
 * Prop Firm Service
 * Handles all communication with the Java backend for prop firm catalog data
 */
export const propFirmService = {
    /**
     * Get all prop firms
     */
    getAll: async (): Promise<PropFirm[]> => {
        return javaApi.get<PropFirm[]>('/prop-firms');
    },

    /**
     * Get a specific prop firm by ID
     */
    getById: async (id: string): Promise<PropFirm> => {
        return javaApi.get<PropFirm>(`/prop-firms/${id}`);
    },

    /**
     * Filter prop firms by criteria
     * TODO: Implement on backend
     */
    filter: async (criteria: { minFunding?: number; platform?: string }): Promise<PropFirm[]> => {
        return javaApi.post<{ data: PropFirm[] }>('/filter-firms', criteria)
            .then(response => response.data);
    }
};
