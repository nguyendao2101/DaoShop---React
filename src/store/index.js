import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import productReducer from './slices/productSlice';
import collectionReducer from './slices/collectionSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import userReducer from './slices/userSlice.js';
import purchaseHistoryReducer from './slices/purchaseHistorySlice.js';
import stripeReducer from './slices/stripeSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        collections: collectionReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        user: userReducer,
        purchaseHistory: purchaseHistoryReducer,
        stripe: stripeReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        }),
    devTools: process.env.NODE_ENV !== 'production'
});