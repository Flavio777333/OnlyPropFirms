import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the PropFirm type (matching API_MVP.yaml / Backend Entity)
export interface PropFirm {
    id: string;
    name: string;
    logoUrl?: string; // Optional
    websiteUrl?: string; // Optional
    profitSplit: string;
    minFunding: number;
    maxFunding: number;
    evaluationFee: number;
    rating: number; // Decimal in DB, but TS uses number float
    reviewCount: number;
    isFeatured: boolean;
    affiliateLink?: string;
    affiliateCode?: string;
}

interface PropFirmState {
    firms: PropFirm[];
    selectedFirm: PropFirm | null;
    loading: boolean;
    error: string | null;
}

const initialState: PropFirmState = {
    firms: [],
    selectedFirm: null,
    loading: false,
    error: null,
};

// Async Thunk to fetch firms from API
// Uses environment variable for API URL or defaults to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const fetchPropFirms = createAsyncThunk(
    'propFirms/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<PropFirm[]>(`${API_URL}/prop-firms`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch prop firms');
        }
    }
);

const propFirmSlice = createSlice({
    name: 'propFirms',
    initialState,
    reducers: {
        selectFirm(state, action: PayloadAction<PropFirm>) {
            state.selectedFirm = action.payload;
        },
        clearSelectedFirm(state) {
            state.selectedFirm = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPropFirms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPropFirms.fulfilled, (state, action) => {
                state.loading = false;
                state.firms = action.payload;
            })
            .addCase(fetchPropFirms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { selectFirm, clearSelectedFirm } = propFirmSlice.actions;
export default propFirmSlice.reducer;
