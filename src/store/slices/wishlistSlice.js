import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlistService.js';
import { logout } from './authSlice';

// Async thunks for wishlist operations
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const response = await wishlistService.getWishlist();
            console.log('Redux - Fetching wishlist response:', response);
            return response.data; // Return the data object with items, pagination info
        } catch (error) {
            console.error('Redux - Fetch wishlist error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            console.log('Redux - Adding to wishlist:', productId);
            const response = await wishlistService.addToWishlist(productId);
            console.log('Redux - Add to wishlist response:', response);
            return { productId, result: response };
        } catch (error) {
            console.error('Redux - Add to wishlist error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            console.log('Redux - Removing from wishlist:', productId);
            const response = await wishlistService.removeFromWishlist(productId);
            console.log('Redux - Remove from wishlist response:', response);
            return { productId, result: response };
        } catch (error) {
            console.error('Redux - Remove from wishlist error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const clearWishlist = createAsyncThunk(
    'wishlist/clearWishlist',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Redux - Clearing wishlist...');
            const response = await wishlistService.clearWishlist();
            console.log('Redux - Clear wishlist response:', response);
            return response;
        } catch (error) {
            console.error('Redux - Clear wishlist error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    items: [], // Array of wishlist items
    productIds: [], // Quick lookup array of product IDs
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    loading: false,
    error: null,
    // Action-specific loading states
    addingToWishlist: {},
    removingFromWishlist: {},
    clearingWishlist: false
};

// Wishlist slice
const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Clear error
        clearWishlistError: (state) => {
            state.error = null;
        },
        // Reset wishlist state (on logout)
        resetWishlist: (state) => {
            return initialState;
        },
        // Update product IDs for quick lookup
        updateProductIds: (state) => {
            state.productIds = state.items.map(item => item.productId);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload;

                state.items = data.items || [];
                state.totalItems = data.totalItems || 0;
                state.currentPage = data.currentPage || 1;
                state.totalPages = data.totalPages || 1;
                state.hasNextPage = data.hasNextPage || false;
                state.hasPrevPage = data.hasPrevPage || false;

                // Update product IDs for quick lookup
                state.productIds = state.items.map(item => item.productId);

                console.log('Redux - Wishlist fetched successfully:', {
                    itemsCount: state.items.length,
                    productIds: state.productIds
                });
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch wishlist';
                console.error('Redux - Fetch wishlist failed:', action.payload);
            })

            //Add to Wishlist
            .addCase(addToWishlist.pending, (state, action) => {
                const productId = action.meta.arg;
                state.addingToWishlist[productId] = true;
                state.error = null;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                const { productId } = action.payload;
                state.addingToWishlist[productId] = false;

                // Add to productIds if not already present
                if (!state.productIds.includes(productId)) {
                    state.productIds.push(productId);
                    state.totalItems += 1;
                }

                console.log('Redux - Added to wishlist successfully:', productId);
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                const productId = action.meta.arg;
                state.addingToWishlist[productId] = false;
                state.error = action.payload || 'Failed to add to wishlist';
                console.error('Redux - Add to wishlist failed:', action.payload);
            })

            // Remove from Wishlist
            .addCase(removeFromWishlist.pending, (state, action) => {
                const productId = action.meta.arg;
                state.removingFromWishlist[productId] = true;
                state.error = null;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                const { productId } = action.payload;
                state.removingFromWishlist[productId] = false;

                // Remove from items and productIds
                state.items = state.items.filter(item => item.productId !== productId);
                state.productIds = state.productIds.filter(id => id !== productId);
                state.totalItems = Math.max(0, state.totalItems - 1);

                console.log('Redux - Removed from wishlist successfully:', productId);
            })
            .addCase(removeFromWishlist.rejected, (state, action) => {
                const productId = action.meta.arg;
                state.removingFromWishlist[productId] = false;
                state.error = action.payload || 'Failed to remove from wishlist';
                console.error('Redux - Remove from wishlist failed:', action.payload);
            })

            // Clear Wishlist
            .addCase(clearWishlist.pending, (state) => {
                state.clearingWishlist = true;
                state.error = null;
            })
            .addCase(clearWishlist.fulfilled, (state) => {
                state.clearingWishlist = false;
                state.items = [];
                state.productIds = [];
                state.totalItems = 0;
                state.currentPage = 1;
                state.totalPages = 1;
                state.hasNextPage = false;
                state.hasPrevPage = false;

                console.log('Redux - Wishlist cleared successfully');
            })
            .addCase(clearWishlist.rejected, (state, action) => {
                state.clearingWishlist = false;
                state.error = action.payload || 'Failed to clear wishlist';
                console.error('Redux - Clear wishlist failed:', action.payload);
            })

            // Handle logout
            .addCase(logout, (state) => {
                return initialState;
            });
    }
});

// Export actions
export const { clearWishlistError, resetWishlist, updateProductIds } = wishlistSlice.actions;

// Selectors
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistProductIds = (state) => state.wishlist.productIds;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectWishlistTotalItems = (state) => state.wishlist.totalItems;
export const selectWishlistPagination = (state) => ({
    currentPage: state.wishlist.currentPage,
    totalPages: state.wishlist.totalPages,
    hasNextPage: state.wishlist.hasNextPage,
    hasPrevPage: state.wishlist.hasPrevPage
});

// Utility selectors
export const selectIsProductInWishlist = (state, productId) =>
    state.wishlist.productIds.includes(productId);

export const selectIsAddingToWishlist = (state, productId) =>
    state.wishlist.addingToWishlist[productId] || false;

export const selectIsRemovingFromWishlist = (state, productId) =>
    state.wishlist.removingFromWishlist[productId] || false;

export const selectIsClearingWishlist = (state) =>
    state.wishlist.clearingWishlist;

export default wishlistSlice.reducer;