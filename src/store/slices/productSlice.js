import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8797/api';

// Async thunks
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch products');
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeatured',
    async (limit = 3, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch featured products');
            }

            // Filter và sort để lấy sản phẩm nổi bật
            const featuredProducts = data.data
                .filter(product => product.show === "true")
                .sort((a, b) => {
                    // Sort by totalSold desc, then by avgRating desc
                    if (b.totalSold !== a.totalSold) {
                        return b.totalSold - a.totalSold;
                    }
                    return b.avgRating - a.avgRating;
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch products by category');
            }
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch product');
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRelatedProducts = createAsyncThunk(
    'products/fetchRelated',
    async ({ category, currentProductId, limit = 6 }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error('Failed to fetch related products');
            }

            // Filter products cùng category và loại trừ sản phẩm hiện tại
            const relatedProducts = data.data
                .filter(product =>
                    product.category === category &&
                    product.id !== currentProductId &&
                    product.show === "true"
                )
                .sort((a, b) => {
                    // Sort by totalSold desc, then by avgRating desc
                    if (b.totalSold !== a.totalSold) {
                        return b.totalSold - a.totalSold;
                    }
                    return b.avgRating - a.avgRating;
                })
                .slice(0, limit);

            return relatedProducts;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    // All products
    products: [],
    productsLoading: false,
    productsError: null,

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
        sortBy: 'newest' // newest, price_asc, price_desc, rating, bestseller
    },

    // Pagination
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12
};

// Product slice
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        // Clear errors
        clearErrors: (state) => {
            state.productsError = null;
            state.featuredError = null;
            state.categoryError = null;
            state.selectedProductError = null;
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.currentPage = 1; // Reset to first page when filtering
        },
        // Clear related products
        clearRelatedProducts: (state) => {
            state.relatedProducts = [];
            state.relatedError = null;
        },

        // Clear filters
        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.currentPage = 1;
        },

        // Set current page
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },

        // Set current category
        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },

        // Clear selected product
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
            state.selectedProductError = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch all products
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.productsLoading = true;
                state.productsError = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.products = action.payload;
                state.productsError = null;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.productsLoading = false;
                state.productsError = action.payload;
            })

        // Fetch featured products
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

        // Fetch products by category
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

        // Fetch product by ID
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
            });
    }
});

// Export actions
export const {
    clearErrors,
    setFilters,
    clearFilters,
    setCurrentPage,
    setCurrentCategory,
    clearSelectedProduct,
    clearRelatedProducts
} = productSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.productsLoading;
export const selectProductsError = (state) => state.products.productsError;

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
export const selectCurrentCategory = (state) => state.products.currentCategory;

export const selectRelatedProducts = (state) => state.products.relatedProducts;
export const selectRelatedLoading = (state) => state.products.relatedLoading;
export const selectRelatedError = (state) => state.products.relatedError;

// Computed selectors
export const selectFilteredProducts = (state) => {
    const products = state.products.products;
    const filters = state.products.filters;

    let filtered = products.filter(product => {
        // Category filter
        if (filters.category && product.category !== filters.category) {
            return false;
        }

        // Price range filter
        const minPrice = Math.min(...Object.values(product.sizePrice || {}).map(item => item.price));
        if (minPrice < filters.priceRange[0] || minPrice > filters.priceRange[1]) {
            return false;
        }

        // Material filter
        if (filters.material && product.material !== filters.material) {
            return false;
        }

        // Karat filter
        if (filters.karat && product.karat !== filters.karat) {
            return false;
        }

        // Gender filter
        if (filters.gender && product.gender !== filters.gender) {
            return false;
        }

        return true;
    });

    // Sort filtered products
    switch (filters.sortBy) {
        case 'price_asc':
            filtered.sort((a, b) => {
                const priceA = Math.min(...Object.values(a.sizePrice || {}).map(item => item.price));
                const priceB = Math.min(...Object.values(b.sizePrice || {}).map(item => item.price));
                return priceA - priceB;
            });
            break;
        case 'price_desc':
            filtered.sort((a, b) => {
                const priceA = Math.min(...Object.values(a.sizePrice || {}).map(item => item.price));
                const priceB = Math.min(...Object.values(b.sizePrice || {}).map(item => item.price));
                return priceB - priceA;
            });
            break;
        case 'rating':
            filtered.sort((a, b) => b.avgRating - a.avgRating);
            break;
        case 'bestseller':
            filtered.sort((a, b) => b.totalSold - a.totalSold);
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    return filtered;
};

export const selectPaginatedProducts = (state) => {
    const filtered = selectFilteredProducts(state);
    const currentPage = state.products.currentPage;
    const itemsPerPage = state.products.itemsPerPage;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        products: filtered.slice(startIndex, endIndex),
        totalProducts: filtered.length,
        totalPages: Math.ceil(filtered.length / itemsPerPage),
        currentPage,
        itemsPerPage
    };
};

export default productSlice.reducer;