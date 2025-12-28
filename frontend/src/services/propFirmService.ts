import axios from 'axios';
import { PropFirm } from '@/store/features/propFirms/propFirmSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const propFirmService = {
    getAll: async (): Promise<PropFirm[]> => {
        const response = await axios.get<PropFirm[]>(`${API_URL}/prop-firms`);
        return response.data;
    },

    getById: async (id: string): Promise<PropFirm> => {
        const response = await axios.get<PropFirm>(`${API_URL}/prop-firms/${id}`);
        return response.data;
    },

    filter: async (criteria: { minFunding?: number; platform?: string }): Promise<PropFirm[]> => {
        const response = await axios.post<{ data: PropFirm[] }>(`${API_URL}/filter-firms`, criteria);
        return response.data.data;
    }
};
