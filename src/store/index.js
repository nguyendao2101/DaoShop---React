import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import productReducer from './slices/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        }),
    devTools: process.env.NODE_ENV !== 'production'
});
