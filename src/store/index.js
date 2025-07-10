import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import productReducer from './slices/productSlice';
import collectionReducer from './slices/collectionSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        collections: collectionReducer,
        cart: cartReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        }),
    devTools: process.env.NODE_ENV !== 'production'
});