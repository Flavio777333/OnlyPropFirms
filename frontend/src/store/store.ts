import { configureStore } from '@reduxjs/toolkit';
import propFirmReducer from './features/propFirms/propFirmSlice';
import filterReducer from './features/filters/filterSlice';

export const store = configureStore({
    reducer: {
        propFirms: propFirmReducer,
        filters: filterReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
