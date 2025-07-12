import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
    fetchAllProducts,
    fetchAllProductsForSearch,
    searchAllProducts,
    selectPaginatedProducts,
    selectPagination,
    selectProductsLoading,
    selectProductsError,
    selectAllProductsCache,
    selectSearchResults,
    selectSearchLoading,
    selectSearchError,
    selectIsSearchMode,
    selectFilters,
    selectCurrentPage,
    selectSearchTerm,
    setFilters,
    setCurrentPage,
    setSearchTerm,
    clearSearchResults
} from '../store/slices/productSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/layout/SearchBar';
import FilterSidebar from '../components/layout/FilterSidebar';
import SortDropdown from '../components/layout/SortDropdown';
import ProductGridview from '../components/layout/ProductGridview';
import Pagination from '../components/layout/Pagination';

const ProductAll = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const paginatedProducts = useSelector(selectPaginatedProducts);
    const pagination = useSelector(selectPagination);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const allProductsCache = useSelector(selectAllProductsCache);
    const searchResults = useSelector(selectSearchResults);
    const searchLoading = useSelector(selectSearchLoading);
    const searchError = useSelector(selectSearchError);
    const isSearchMode = useSelector(selectIsSearchMode);
    const filters = useSelector(selectFilters);
    const currentPage = useSelector(selectCurrentPage);
    const searchTerm = useSelector(selectSearchTerm);

    // Local state
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Build API params cho paginated mode
    const buildAPIParams = useCallback(() => {
        const apiParams = {
            page: currentPage,
            limit: 10
        };

        // Map frontend filters to API params với đúng tên parameters
        if (filters.category && filters.category !== '') {
            apiParams.category = filters.category;
        }
        if (filters.material && filters.material !== '') {
            apiParams.material = filters.material;
        }
        if (filters.karat && filters.karat !== '') {
            apiParams.karat = filters.karat;
        }
        if (filters.gender && filters.gender !== '') {
            apiParams.gender = filters.gender;
        }

        // FIX: Use correct backend parameter names for price
        if (filters.priceRange[0] > 0) {
            apiParams.priceMin = filters.priceRange[0]; // Will be mapped to minPrice in Redux
        }
        if (filters.priceRange[1] < 100000000) {
            apiParams.priceMax = filters.priceRange[1]; // Will be mapped to maxPrice in Redux
        }

        // Map frontend sortBy to API format
        if (filters.sortBy) {
            apiParams.sortBy = filters.sortBy;
        }

        console.log('Built API params:', apiParams);
        return apiParams;
    }, [currentPage, filters]);

    const getProductPrice = (product) => {
        // Try different price formats
        if (product.sizePrice) {
            // Array format: sizePrice[0].price
            if (Array.isArray(product.sizePrice) && product.sizePrice[0]?.price) {
                return Number(product.sizePrice[0].price);
            }
            // Object format: sizePrice["0"].price or sizePrice.price
            if (typeof product.sizePrice === 'object') {
                if (product.sizePrice["0"]?.price) {
                    return Number(product.sizePrice["0"].price);
                }
                if (product.sizePrice.price) {
                    return Number(product.sizePrice.price);
                }
            }
        }
        // Direct price field
        if (product.price) {
            return Number(product.price);
        }
        return 0;
    };

    // Process search results với frontend filtering và sorting - FIX PRICE LOGIC
    const processedSearchResults = useMemo(() => {
        if (!isSearchMode) return [];

        let filtered = [...searchResults];
        console.log('Processing search results, initial count:', filtered.length);

        // Apply filters
        if (filters.category && filters.category !== '') {
            filtered = filtered.filter(product => product.category === filters.category);
            console.log('After category filter:', filtered.length);
        }

        if (filters.material && filters.material !== '') {
            filtered = filtered.filter(product => product.material === filters.material);
            console.log('After material filter:', filtered.length);
        }

        if (filters.karat && filters.karat !== '') {
            filtered = filtered.filter(product => product.karat === filters.karat);
            console.log('After karat filter:', filtered.length);
        }

        if (filters.gender && filters.gender !== '') {
            filtered = filtered.filter(product => product.gender === filters.gender);
            console.log('After gender filter:', filtered.length);
        }

        // Price filter - IMPROVED LOGIC
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0 || maxPrice < 100000000) {
            filtered = filtered.filter(product => {
                const price = getProductPrice(product);
                return price >= minPrice && price <= maxPrice;
            });
        }

        // Sort products
        switch (filters.sortBy) {
            case 'price_asc':
                return filtered.sort((a, b) => getProductPrice(a) - getProductPrice(b));
            case 'price_desc':
                return filtered.sort((a, b) => getProductPrice(b) - getProductPrice(a));
            case 'bestseller':
                return filtered.sort((a, b) => (parseInt(b.totalSold) || 0) - (parseInt(a.totalSold) || 0));
            case 'rating':
                return filtered.sort((a, b) => (parseFloat(b.avgRating) || 0) - (parseFloat(a.avgRating) || 0));
            case 'name_asc':
                return filtered.sort((a, b) => (a.nameProduct || '').localeCompare(b.nameProduct || ''));
            case 'name_desc':
                return filtered.sort((a, b) => (b.nameProduct || '').localeCompare(a.nameProduct || ''));
            case 'newest':
            default:
                return filtered.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
        }
    }, [searchResults, filters, isSearchMode]);

    // Pagination cho search results
    const paginatedSearchResults = useMemo(() => {
        if (!isSearchMode) return [];

        const itemsPerPage = 12;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedSearchResults.slice(startIndex, endIndex);
    }, [processedSearchResults, currentPage, isSearchMode]);

    // Search pagination info
    const searchPagination = useMemo(() => {
        if (!isSearchMode) return null;

        const itemsPerPage = 12;
        const total = processedSearchResults.length;
        const totalPages = Math.ceil(total / itemsPerPage);

        return {
            total,
            page: currentPage,
            limit: itemsPerPage,
            totalPages
        };
    }, [processedSearchResults, currentPage, isSearchMode]);

    // Determine what to display
    const displayProducts = isSearchMode ? paginatedSearchResults : paginatedProducts;
    const displayPagination = isSearchMode ? searchPagination : pagination;
    const displayLoading = isSearchMode ? searchLoading : loading;
    const displayError = isSearchMode ? searchError : error;

    // Fetch data on mount và khi filters change
    useEffect(() => {
        if (!isSearchMode) {
            const apiParams = buildAPIParams();
            console.log('Fetching paginated products:', apiParams);
            dispatch(fetchAllProducts(apiParams));
        }
    }, [dispatch, buildAPIParams, isSearchMode]);

    // Fetch all products cache on mount (cho search và filter options)
    useEffect(() => {
        if (allProductsCache.length === 0) {
            console.log('Loading all products cache...');
            dispatch(fetchAllProductsForSearch());
        }
    }, [dispatch, allProductsCache.length]);

    // Handle search
    const handleSearch = useCallback((term) => {
        console.log('ProductAll handleSearch:', term);
        dispatch(setSearchTerm(term));
        dispatch(setCurrentPage(1));

        if (term.trim()) {
            dispatch(searchAllProducts(term.trim()));
        } else {
            dispatch(clearSearchResults());
        }
    }, [dispatch]);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters) => {
        console.log('ProductAll handleFilterChange:', newFilters);
        dispatch(setFilters(newFilters));
    }, [dispatch]);

    // Handle sort change
    const handleSortChange = useCallback((sortBy) => {
        console.log('ProductAll handleSortChange:', sortBy);
        dispatch(setFilters({ ...filters, sortBy }));
    }, [dispatch, filters]);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        dispatch(setCurrentPage(page));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    // Navigate to home
    const handleGoHome = () => {
        navigate({ to: '/' });
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li>
                                <button
                                    onClick={handleGoHome}
                                    className="text-gray-400 hover:text-primary"
                                >
                                    Trang chủ
                                </button>
                            </li>
                            <li className="text-gray-600">/</li>
                            <li className="text-white font-medium">
                                Tất cả sản phẩm
                            </li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-4">Tất cả sản phẩm</h1>
                        <p className="text-gray-400">
                            Khám phá bộ sưu tập trang sức đa dạng của Nguyen Dao Jewelry
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 flex justify-center">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Tìm kiếm trang sức, nhẫn, dây chuyền..."
                        />
                    </div>

                    {/* Search Mode Indicator */}
                    {isSearchMode && (
                        <div className="mb-6 p-4 bg-primary bg-opacity-10 border border-primary rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-primary font-semibold">
                                        Kết quả tìm kiếm cho "{searchTerm}"
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        Tìm thấy {processedSearchResults.length} sản phẩm
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleSearch('')}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="lg:hidden flex items-center px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:border-primary transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                                Bộ lọc
                            </button>

                            {/* Results Count */}
                            <div className="text-gray-400 text-sm">
                                <span>
                                    Hiển thị {displayProducts.length} / {displayPagination?.total || 0} sản phẩm
                                    {searchTerm && ` cho "${searchTerm}"`}
                                </span>
                                {displayPagination && (
                                    <span className="ml-2 text-gray-500">
                                        (Trang {displayPagination.page}/{displayPagination.totalPages})
                                    </span>
                                )}
                                {isSearchMode && (
                                    <span className="ml-2 text-primary text-xs">
                                        • Chế độ tìm kiếm
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <SortDropdown
                            sortBy={filters.sortBy}
                            onSortChange={handleSortChange}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex gap-8">
                        {/* Filter Sidebar - Desktop */}
                        <div className="hidden lg:block">
                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                products={allProductsCache} // Use cache cho filter options
                            />
                        </div>

                        {/* Mobile Filter Overlay */}
                        {showMobileFilters && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                                <div className="absolute left-0 top-0 h-full w-80 bg-black p-4 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Bộ lọc</h3>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <FilterSidebar
                                        filters={filters}
                                        onFilterChange={(newFilters) => {
                                            handleFilterChange(newFilters);
                                            setShowMobileFilters(false);
                                        }}
                                        products={allProductsCache}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product Grid */}
                        <div className="flex-1">
                            <ProductGridview
                                products={displayProducts}
                                loading={displayLoading}
                                error={displayError}
                                emptyMessage={
                                    searchTerm
                                        ? `Không tìm thấy sản phẩm với từ khóa "${searchTerm}"`
                                        : "Không có sản phẩm nào"
                                }
                                gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            />

                            {/* Pagination */}
                            {!displayLoading && !displayError && displayPagination && displayPagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={displayPagination.page}
                                    totalPages={displayPagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductAll;