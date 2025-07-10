import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collectionService } from '../../services/collectionService';

export const fetchCollectionProducts = createAsyncThunk(
    'collections/fetchCollectionProducts',
    async (collectionId) => {
        return await collectionService.getCollectionProducts(collectionId);
    }
);

const collectionSlice = createSlice({
    name: 'collections',
    initialState: {
        collection: null,
        products: [],
        loading: false,
        error: null
    },
    reducers: {
        clearCollectionData: (state) => {
            state.collection = null;
            state.products = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCollectionProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollectionProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.collection = action.payload.collection;
                state.products = action.payload.products;
            })
            .addCase(fetchCollectionProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearCollectionData } = collectionSlice.actions;
export default collectionSlice.reducer;