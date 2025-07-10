// src/page/ProductAll.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
    fetchAllProducts,
    selectFilteredProducts,
    selectPaginatedProducts,
    selectProductsLoading,
    selectProductsError,
    selectFilters,
    selectCurrentPage,
    setFilters,
    setCurrentPage
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
    const paginatedData = useSelector(selectPaginatedProducts);
    const allProducts = useSelector(selectFilteredProducts);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const filters = useSelector(selectFilters);
    const currentPage = useSelector(selectCurrentPage);

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Fetch products on mount
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    // Handle search
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        dispatch(setCurrentPage(1)); // Reset to first page
    }, [dispatch]);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);

    // Handle sort change
    const handleSortChange = useCallback((sortBy) => {
        dispatch(setFilters({ ...filters, sortBy }));
    }, [dispatch, filters]);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        dispatch(setCurrentPage(page));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    // Filter products by search term
    const searchFilteredProducts = React.useMemo(() => {
        if (!searchTerm) return paginatedData.products;

        return paginatedData.products.filter(product =>
            product.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.material.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [paginatedData.products, searchTerm]);

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
                                {searchTerm ? (
                                    <span>
                                        Hiển thị {searchFilteredProducts.length} kết quả cho "{searchTerm}"
                                    </span>
                                ) : (
                                    <span>
                                        Hiển thị {paginatedData.products.length} / {paginatedData.totalProducts} sản phẩm
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
                                products={allProducts}
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
                                        products={allProducts}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product Grid */}
                        <div className="flex-1">
                            <ProductGridview
                                products={searchTerm ? searchFilteredProducts : paginatedData.products}
                                loading={loading}
                                error={error}
                                emptyMessage={searchTerm ? `Không tìm thấy sản phẩm với từ khóa "${searchTerm}"` : "Không có sản phẩm nào"}
                                gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            />

                            {/* Pagination - Only show if not searching */}
                            {!searchTerm && !loading && !error && paginatedData.totalPages > 1 && (
                                <Pagination
                                    currentPage={paginatedData.currentPage}
                                    totalPages={paginatedData.totalPages}
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