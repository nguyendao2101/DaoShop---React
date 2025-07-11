import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import { logout } from './authSlice';

// Async thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.getCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, sizeIndex, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartService.addToCart(productId, sizeIndex, quantity);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, sizeIndex, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartService.updateCartItem(productId, sizeIndex, quantity);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ productId, sizeIndex }, { rejectWithValue }) => {
        try {
            const response = await cartService.removeFromCart(productId, sizeIndex);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.clearCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    cart: null,
    loading: false,
    error: null,
    // Derived state for easy access
    totalItems: 0,
    totalAmount: 0,
    items: []
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        // Local optimistic updates
        optimisticAddToCart: (state, action) => {
            const { productId, sizeIndex, quantity, price } = action.payload;
            if (state.cart) {
                // Check if item already exists
                const existingItemIndex = state.cart.items.findIndex(
                    item => item.productId === productId && item.sizeIndex === sizeIndex
                );

                if (existingItemIndex >= 0) {
                    // Update existing item
                    state.cart.items[existingItemIndex].quantity += quantity;
                } else {
                    // Add new item
                    state.cart.items.push({
                        productId,
                        sizeIndex,
                        quantity,
                        price,
                        addedAt: new Date().toISOString(),
                        _id: `temp_${Date.now()}`
                    });
                }

                // Update totals
                state.cart.totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
                state.cart.totalAmount = state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                // Update derived state
                state.totalItems = state.cart.totalItems;
                state.totalAmount = state.cart.totalAmount;
                state.items = state.cart.items;
            }
        },
        clearCartState: (state) => {
            state.cart = null;
            state.loading = false;
            state.error = null;
            state.totalItems = 0;
            state.totalAmount = 0;
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.totalItems = action.payload?.totalItems || 0;
                state.totalAmount = action.payload?.totalAmount || 0;
                state.items = action.payload?.items || [];
                console.log('🛒 Redux - Cart fetched:', action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('🛒 Redux - Fetch cart error:', action.payload);
            })

            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.totalItems = action.payload?.totalItems || 0;
                state.totalAmount = action.payload?.totalAmount || 0;
                state.items = action.payload?.items || [];
                console.log('🛒 Redux - Item added to cart:', action.payload);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('🛒 Redux - Add to cart error:', action.payload);
            })

            // Update Cart Item
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.totalItems = action.payload?.totalItems || 0;
                state.totalAmount = action.payload?.totalAmount || 0;
                state.items = action.payload?.items || [];
                console.log('🛒 Redux - Cart item updated:', action.payload);
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('🛒 Redux - Update cart error:', action.payload);
            })

            // Remove from Cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.totalItems = action.payload?.totalItems || 0;
                state.totalAmount = action.payload?.totalAmount || 0;
                state.items = action.payload?.items || [];
                console.log('🛒 Redux - Item removed from cart:', action.payload);
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('🛒 Redux - Remove from cart error:', action.payload);
            })

            // Clear Cart
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload || null;
                state.totalItems = 0;
                state.totalAmount = 0;
                state.items = [];
                console.log('🛒 Redux - Cart cleared:', action.payload);
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('🛒 Redux - Clear cart error:', action.payload);
            })
            .addCase(logout, (state) => {
                state.cart = null;
                state.loading = false;
                state.error = null;
                state.totalItems = 0;
                state.totalAmount = 0;
                state.items = [];
            });
    }
});

export const { clearCartError, optimisticAddToCart } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;

export default cartSlice.reducer;