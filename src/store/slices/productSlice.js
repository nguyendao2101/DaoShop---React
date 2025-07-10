import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8797/api';

// Fetch products với pagination từ API
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const {
                page = 1,
                limit = 10,
                category = '',
                material = '',
                karat = '',
                gender = '',
                sortBy = 'newest',
                priceMin = 0,
                priceMax = 100000000
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            // Map frontend params to backend API format
            if (category) queryParams.append('category', category);
            if (material) queryParams.append('material', material);
            if (karat) queryParams.append('karat', karat);
            if (gender) queryParams.append('gender', gender);
            if (sortBy) queryParams.append('sortBy', sortBy);

            // FIX: Use correct backend parameter names
            if (priceMin > 0) queryParams.append('minPrice', priceMin);
            if (priceMax < 100000000) queryParams.append('maxPrice', priceMax);

            const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
            console.log('🔥 Fetching paginated products URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // DEBUG: Log API response
            console.log('🔥 API Response - Success:', data.success);
            console.log('🔥 API Response - Data count:', data.data?.length || 0);
            console.log('🔥 API Response - Pagination:', data.pagination);
            console.log('🔥 API Response - Sample product prices:',
                data.data?.slice(0, 3).map(p => ({
                    name: p.nameProduct,
                    sizePrice: p.sizePrice,
                    extractedPrice: p.sizePrice?.[0]?.price || p.sizePrice?.["0"]?.price || 0
                }))
            );

            if (!data.success) {
                throw new Error('Failed to fetch products');
            }
            return data;
        } catch (error) {
            console.error('🔥 Error fetching products:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Fetch ALL products cho search/filter (không phân trang)
export const fetchAllProductsForSearch = createAsyncThunk(
    'products/fetchAllForSearch',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔥 Fetching all products for search...');
            const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch all products');
            }
            console.log('🔥 All products loaded:', data.data?.length || 0);
            return data.data;
        } catch (error) {
            console.error('🔥 Error fetching all products:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Search trong tất cả products
export const searchAllProducts = createAsyncThunk(
    'products/searchAll',
    async (searchTerm, { getState, rejectWithValue }) => {
        try {
            console.log('🔥 Searching with term:', searchTerm);
            const state = getState();
            let allProducts = state.products.allProductsCache;

            // Nếu chưa có cache, fetch all products
            if (!allProducts.length) {
                console.log('🔥 No cache, fetching all products first...');
                const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (!data.success) throw new Error('Failed to fetch products');
                allProducts = data.data;
            }

            // Frontend filtering
            const searchLower = searchTerm.toLowerCase().trim();
            const filteredProducts = allProducts.filter(product => {
                return (
                    product.nameProduct?.toLowerCase().includes(searchLower) ||
                    product.category?.toLowerCase().includes(searchLower) ||
                    product.material?.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.gender?.toLowerCase().includes(searchLower) ||
                    product.type?.toLowerCase().includes(searchLower)
                );
            });

            console.log('🔥 Search results:', filteredProducts.length);
            return {
                products: filteredProducts,
                searchTerm: searchTerm,
                allProducts: allProducts // Cập nhật cache
            };
        } catch (error) {
            console.error('🔥 Search error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// THÊM các async thunks khác (featured, category, single product)
export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeatured',
    async (limit = 3, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products?limit=100`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error('Failed to fetch featured products');

            const featuredProducts = data.data
                .filter(product => product.show === "true" || product.show === true)
                .sort((a, b) => {
                    const soldA = parseInt(a.totalSold) || 0;
                    const soldB = parseInt(b.totalSold) || 0;
                    const ratingA = parseFloat(a.avgRating) || 0;
                    const ratingB = parseFloat(b.avgRating) || 0;
                    return soldB - soldA || ratingB - ratingA;
                })
                .slice(0, limit);

            return featuredProducts;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductsByCategory = createAsyncThunk(
    'products/fetchByCategory',
    async (category, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error('Failed to fetch products by category');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error('Failed to fetch product');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRelatedProducts = createAsyncThunk(
    'products/fetchRelated',
    async ({ productId, category, limit = 4 }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}&limit=20`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error('Failed to fetch related products');

            const relatedProducts = (data.data || [])
                .filter(product => product._id !== productId)
                .slice(0, limit);

            return relatedProducts;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    // Paginated products từ API (với filters)
    paginatedProducts: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    },
    productsLoading: false,
    productsError: null,

    // All products cache cho search
    allProductsCache: [],
    allProductsLoading: false,
    allProductsError: null,

    // Search results
    searchResults: [],
    searchLoading: false,
    searchError: null,
    isSearchMode: false,

    // Featured products
    featuredProducts: [],
    featuredLoading: false,
    featuredError: null,

    // Products by category
    categoryProducts: [],
    categoryLoading: false,
    categoryError: null,
    currentCategory: null,

    // Single product
    selectedProduct: null,
    selectedProductLoading: false,
    selectedProductError: null,

    // Related products
    relatedProducts: [],
    relatedLoading: false,
    relatedError: null,

    // Filters
    filters: {
        category: '',
        priceRange: [0, 100000000],
        material: '',
        karat: '',
        gender: '',
        sortBy: 'newest'
    },

    // Pagination
    currentPage: 1,
    searchTerm: ''
};

// Product slice
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            console.log('🔥 Redux setFilters:', action.payload);
            state.filters = { ...state.filters, ...action.payload };
            state.currentPage = 1; // Reset page
            state.isSearchMode = false; // Thoát search mode khi filter
            state.searchResults = [];
            state.searchTerm = '';
        },

        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },

        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            state.currentPage = 1;
            if (!action.payload.trim()) {
                state.isSearchMode = false;
                state.searchResults = [];
            }
        },

        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.currentPage = 1;
            state.isSearchMode = false;
            state.searchResults = [];
            state.searchTerm = '';
        },

        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchError = null;
            state.isSearchMode = false;
            state.searchTerm = '';
        },

        clearErrors: (state) => {
            state.productsError = null;
            state.featuredError = null;
            state.categoryError = null;
            state.selectedProductError = null;
            state.searchError = null;
            state.allProductsError = null;
        },

        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },

        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
            state.selectedProductError = null;
        },

        clearRelatedProducts: (state) => {
            state.relatedProducts = [];
            state.relatedError = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch paginated products
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.productsLoading = true;
                state.productsError = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.paginatedProducts = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
                state.productsError = null;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.productsLoading = false;
                state.productsError = action.payload;
            })

        // Fetch all products for search
        builder
            .addCase(fetchAllProductsForSearch.pending, (state) => {
                state.allProductsLoading = true;
                state.allProductsError = null;
            })
            .addCase(fetchAllProductsForSearch.fulfilled, (state, action) => {
                state.allProductsLoading = false;
                state.allProductsCache = action.payload || [];
                state.allProductsError = null;
            })
            .addCase(fetchAllProductsForSearch.rejected, (state, action) => {
                state.allProductsLoading = false;
                state.allProductsError = action.payload;
            })

        // Search all products
        builder
            .addCase(searchAllProducts.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
            })
            .addCase(searchAllProducts.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload.products;
                state.allProductsCache = action.payload.allProducts; // Cập nhật cache
                state.isSearchMode = true;
                state.searchError = null;
            })
            .addCase(searchAllProducts.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
                state.isSearchMode = false;
            })

        // Featured products
        builder
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.featuredLoading = true;
                state.featuredError = null;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.featuredLoading = false;
                state.featuredProducts = action.payload;
                state.featuredError = null;
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.featuredLoading = false;
                state.featuredError = action.payload;
            })

        // Products by category
        builder
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.categoryLoading = true;
                state.categoryError = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.categoryLoading = false;
                state.categoryProducts = action.payload;
                state.categoryError = null;
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.categoryLoading = false;
                state.categoryError = action.payload;
            })

        // Single product
        builder
            .addCase(fetchProductById.pending, (state) => {
                state.selectedProductLoading = true;
                state.selectedProductError = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.selectedProductLoading = false;
                state.selectedProduct = action.payload;
                state.selectedProductError = null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.selectedProductLoading = false;
                state.selectedProductError = action.payload;
            })

        // Related products
        builder
            .addCase(fetchRelatedProducts.pending, (state) => {
                state.relatedLoading = true;
                state.relatedError = null;
            })
            .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
                state.relatedLoading = false;
                state.relatedProducts = action.payload;
                state.relatedError = null;
            })
            .addCase(fetchRelatedProducts.rejected, (state, action) => {
                state.relatedLoading = false;
                state.relatedError = action.payload;
            });
    }
});

// Export actions
export const {
    setFilters,
    setCurrentPage,
    setSearchTerm,
    clearFilters,
    clearSearchResults,
    clearErrors,
    setCurrentCategory,
    clearSelectedProduct,
    clearRelatedProducts
} = productSlice.actions;

// Selectors
export const selectPaginatedProducts = (state) => state.products.paginatedProducts;
export const selectPagination = (state) => state.products.pagination;
export const selectProductsLoading = (state) => state.products.productsLoading;
export const selectProductsError = (state) => state.products.productsError;

export const selectAllProductsCache = (state) => state.products.allProductsCache;
export const selectAllProductsLoading = (state) => state.products.allProductsLoading;
export const selectAllProductsError = (state) => state.products.allProductsError;

export const selectSearchResults = (state) => state.products.searchResults;
export const selectSearchLoading = (state) => state.products.searchLoading;
export const selectSearchError = (state) => state.products.searchError;
export const selectIsSearchMode = (state) => state.products.isSearchMode;

export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectFeaturedLoading = (state) => state.products.featuredLoading;
export const selectFeaturedError = (state) => state.products.featuredError;

export const selectCategoryProducts = (state) => state.products.categoryProducts;
export const selectCategoryLoading = (state) => state.products.categoryLoading;
export const selectCategoryError = (state) => state.products.categoryError;

export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectSelectedProductLoading = (state) => state.products.selectedProductLoading;
export const selectSelectedProductError = (state) => state.products.selectedProductError;

export const selectFilters = (state) => state.products.filters;
export const selectCurrentPage = (state) => state.products.currentPage;
export const selectSearchTerm = (state) => state.products.searchTerm;
export const selectCurrentCategory = (state) => state.products.currentCategory;

export const selectRelatedProducts = (state) => state.products.relatedProducts;
export const selectRelatedLoading = (state) => state.products.relatedLoading;
export const selectRelatedError = (state) => state.products.relatedError;

// LEGACY selectors để tương thích
export const selectAllProducts = (state) => state.products.allProductsCache;
export const selectFilteredProducts = (state) => state.products.allProductsCache;

export default productSlice.reducer;