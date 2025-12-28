import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    minFunding: number | null;
    maxFunding: number | null;
    profitSplit: string | null;
    platform: string | null; // e.g., 'MetaTrader 5'
    searchQuery: string;
}

const initialState: FilterState = {
    minFunding: null,
    maxFunding: null,
    profitSplit: null,
    platform: null,
    searchQuery: '',
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setMinFunding(state, action: PayloadAction<number | null>) {
            state.minFunding = action.payload;
        },
        setMaxFunding(state, action: PayloadAction<number | null>) {
            state.maxFunding = action.payload;
        },
        setPlatform(state, action: PayloadAction<string | null>) {
            state.platform = action.payload;
        },
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        resetFilters(state) {
            return initialState;
        },
    },
});

export const {
    setMinFunding,
    setMaxFunding,
    setPlatform,
    setSearchQuery,
    resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;
