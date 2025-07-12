import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/layout/SearchBar';
import FilterSidebar from '../components/layout/FilterSidebar';
import SortDropdown from '../components/layout/SortDropdown';
import ProductGridview from '../components/layout/ProductGridview';
import Pagination from '../components/layout/Pagination';

const Collection = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract collectionId từ pathname
    const collectionId = location.pathname.split('/collections/')[1];

    // Local state
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter and pagination state (similar to ProductAll)
    const [filters, setFilters] = useState({
        category: [],
        material: [],
        priceRange: [0, 50000000],
        gender: [],
        sortBy: 'featured'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    console.log('Collection ID extracted:', collectionId);

    // Fetch collection data
    useEffect(() => {
        const fetchCollectionData = async () => {
            if (!collectionId) {
                setError('Không tìm thấy ID bộ sưu tập');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log('Fetching collection:', collectionId);
                const response = await fetch(`http://localhost:8797/api/collections/${collectionId}/products`);
                const data = await response.json();

                console.log('API Response:', data);

                if (data.success) {
                    setCollection(data.data.collection);
                    setProducts(data.data.products || []);
                } else {
                    setError('Không thể tải dữ liệu bộ sưu tập');
                }
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionData();
    }, [collectionId]);

    // Handle search
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page
    }, []);

    // Handle sort change
    const handleSortChange = useCallback((sortBy) => {
        setFilters(prev => ({ ...prev, sortBy }));
        setCurrentPage(1); // Reset to first page
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Navigate to home
    const handleGoHome = () => {
        navigate({ to: '/' });
    };

    // Navigate to all products
    const handleGoProducts = () => {
        navigate({ to: '/products' });
    };

    // Filter and sort products
    const processedProducts = React.useMemo(() => {
        let filtered = [...products];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.material && product.material.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category
        if (filters.category.length > 0) {
            filtered = filtered.filter(product =>
                filters.category.includes(product.category)
            );
        }

        // Filter by material
        if (filters.material.length > 0) {
            filtered = filtered.filter(product =>
                product.material && filters.material.includes(product.material)
            );
        }

        // Filter by gender
        if (filters.gender.length > 0) {
            filtered = filtered.filter(product =>
                product.gender && filters.gender.includes(product.gender)
            );
        }

        // Filter by price range
        filtered = filtered.filter(product => {
            const price = product.sizePrice?.[0]?.price || product.sizePrice?.["0"]?.price || 0;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });

        // Sort products
        switch (filters.sortBy) {
            case 'price-asc':
                return filtered.sort((a, b) => {
                    const priceA = a.sizePrice?.[0]?.price || a.sizePrice?.["0"]?.price || 0;
                    const priceB = b.sizePrice?.[0]?.price || b.sizePrice?.["0"]?.price || 0;
                    return priceA - priceB;
                });
            case 'price-desc':
                return filtered.sort((a, b) => {
                    const priceA = a.sizePrice?.[0]?.price || a.sizePrice?.["0"]?.price || 0;
                    const priceB = b.sizePrice?.[0]?.price || b.sizePrice?.["0"]?.price || 0;
                    return priceB - priceA;
                });
            case 'newest':
                return filtered.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            case 'name-asc':
                return filtered.sort((a, b) => a.nameProduct.localeCompare(b.nameProduct));
            case 'name-desc':
                return filtered.sort((a, b) => b.nameProduct.localeCompare(a.nameProduct));
            default:
                return filtered;
        }
    }, [products, searchTerm, filters]);

    // Pagination
    const paginatedProducts = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedProducts.slice(startIndex, endIndex);
    }, [processedProducts, currentPage]);

    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);

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
                            <li>
                                <button
                                    onClick={handleGoProducts}
                                    className="text-gray-400 hover:text-primary"
                                >
                                    Sản phẩm
                                </button>
                            </li>
                            <li className="text-gray-600">/</li>
                            <li className="text-white font-medium">
                                {collection?.name || 'Bộ sưu tập'}
                            </li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-4">
                            {collection?.name || 'Bộ sưu tập'}
                        </h1>
                        <p className="text-gray-400">
                            {collection?.description || 'Khám phá những sản phẩm tuyệt vời trong bộ sưu tập này'}
                        </p>
                        {collection && (
                            <p className="text-primary mt-2">
                                {collection.totalProducts || products.length} sản phẩm
                            </p>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 flex justify-center">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder={`Tìm kiếm trong ${collection?.name || 'bộ sưu tập'}...`}
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
                                        Hiển thị {processedProducts.length} kết quả cho "{searchTerm}"
                                    </span>
                                ) : (
                                    <span>
                                        Hiển thị {paginatedProducts.length} / {processedProducts.length} sản phẩm
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
                                products={products}
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
                                        products={products}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product Grid */}
                        <div className="flex-1">
                            <ProductGridview
                                products={paginatedProducts}
                                loading={loading}
                                error={error}
                                emptyMessage={
                                    searchTerm
                                        ? `Không tìm thấy sản phẩm với từ khóa "${searchTerm}" trong bộ sưu tập này`
                                        : "Bộ sưu tập này chưa có sản phẩm nào"
                                }
                                gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            />

                            {/* Pagination - Only show if not searching and has multiple pages */}
                            {!loading && !error && totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}

                            {/* Back to Collections Button */}
                            {!loading && !error && (
                                <div className="text-center mt-12">
                                    <button
                                        onClick={handleGoProducts}
                                        className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors mr-4"
                                    >
                                        Xem tất cả sản phẩm
                                    </button>
                                    <button
                                        onClick={handleGoHome}
                                        className="bg-primary text-black px-8 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                                    >
                                        Về trang chủ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Collection;