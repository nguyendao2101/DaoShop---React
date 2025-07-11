import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    searchAllProducts,
    fetchAllProductsForSearch,
    selectSearchResults,
    selectSearchLoading,
    selectSearchError,
    selectAllProductsCache,
    clearSearchResults,
    setSearchTerm
} from '../../store/slices/productSlice';

const SearchDialog = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const searchInputRef = useRef(null);

    // Redux state
    const searchResults = useSelector(selectSearchResults);
    const searchLoading = useSelector(selectSearchLoading);
    const searchError = useSelector(selectSearchError);
    const allProductsCache = useSelector(selectAllProductsCache);

    console.log('🔥 SearchDialog - Search results count:', searchResults.length);
    console.log('🔥 SearchDialog - Cache count:', allProductsCache.length);

    // Load all products cache khi dialog mở (nếu chưa có)
    useEffect(() => {
        if (isOpen) {
            loadRecentSearches();

            // Load all products cache nếu chưa có
            if (allProductsCache.length === 0) {
                console.log('🔥 SearchDialog - Loading all products cache...');
                dispatch(fetchAllProductsForSearch());
            }

            // Focus input
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            // Reset khi đóng
            setLocalSearchTerm('');
            dispatch(clearSearchResults());
        }
    }, [isOpen, dispatch, allProductsCache.length]);

    // Debounced search effect
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(() => {
            if (localSearchTerm.trim().length >= 2) {
                console.log('🔥 SearchDialog - Searching for:', localSearchTerm);
                dispatch(searchAllProducts(localSearchTerm.trim()));
            } else if (localSearchTerm.trim().length === 0) {
                dispatch(clearSearchResults());
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [localSearchTerm, dispatch, isOpen]);

    // Load recent searches từ localStorage
    const loadRecentSearches = () => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    };

    // Save recent search
    const saveRecentSearch = (term) => {
        if (!term.trim()) return;

        const updated = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Handle search submit
    const handleSearch = (term = localSearchTerm) => {
        if (term.trim()) {
            saveRecentSearch(term.trim());
            // Set global search term and navigate
            dispatch(setSearchTerm(term.trim()));
            navigate({ to: '/products', search: { search: term.trim() } });
            onClose();
        }
    };

    // Handle product click
    const handleProductClick = (product) => {
        saveRecentSearch(product.nameProduct);
        navigate({ to: `/product/${product._id}` });
        onClose();
    };

    // Handle recent search click
    const handleRecentSearchClick = (term) => {
        setLocalSearchTerm(term);
        // Trigger immediate search
        dispatch(searchAllProducts(term));
    };

    // Handle clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Get product price
    const getProductPrice = (product) => {
        if (product.sizePrice) {
            // Array format
            if (Array.isArray(product.sizePrice) && product.sizePrice[0]?.price) {
                return product.sizePrice[0].price;
            }
            // Object format
            if (typeof product.sizePrice === 'object') {
                if (product.sizePrice["0"]?.price) {
                    return product.sizePrice["0"].price;
                }
                if (product.sizePrice.price) {
                    return product.sizePrice.price;
                }
            }
        }
        return product.price || 0;
    };

    // Get product image
    const getProductImage = (product) => {
        if (product.imageUrl) {
            return Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl["0"] || product.imageUrl;
        }
        if (product.productImg) {
            return Array.isArray(product.productImg) ? product.productImg[0] : product.productImg["0"] || product.productImg;
        }
        return null;
    };

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    // Filter và limit results for display
    const displayResults = searchResults.slice(0, 8); // Limit to 8 for UI

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
                {/* Header với Search Input */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        {/* Search Icon */}
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Search Input */}
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, nhẫn, bông tai..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-white text-lg placeholder-gray-400 outline-none"
                        />

                        {/* Clear Button */}
                        {localSearchTerm && (
                            <button
                                onClick={() => {
                                    setLocalSearchTerm('');
                                    dispatch(clearSearchResults());
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                    {searchLoading ? (
                        /* Loading State */
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Đang tìm kiếm...</p>
                        </div>
                    ) : localSearchTerm.trim().length >= 2 ? (
                        /* Search Results */
                        displayResults.length > 0 ? (
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">
                                    Kết quả tìm kiếm ({searchResults.length} sản phẩm)
                                </h3>
                                <div className="space-y-2">
                                    {displayResults.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product)}
                                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                                        >
                                            {/* Product Image */}
                                            <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                {getProductImage(product) ? (
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.nameProduct}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyNiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TvjwvdGV4dD4KPC9zdmc+';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        💎
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">
                                                    {product.nameProduct}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                    <span>{product.category}</span>
                                                    {product.material && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{product.material}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-primary font-semibold text-sm">
                                                {getProductPrice(product) > 0
                                                    ? formatPrice(getProductPrice(product))
                                                    : 'Liên hệ'
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View All Results */}
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <button
                                        onClick={() => handleSearch()}
                                        className="w-full text-center py-3 text-primary hover:text-primary-dark transition-colors"
                                    >
                                        Xem tất cả {searchResults.length} kết quả cho "{localSearchTerm}"
                                    </button>
                                </div>
                            </div>
                        ) : searchError ? (
                            /* Error State */
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">⚠️</div>
                                <p className="text-red-400 mb-2">Có lỗi xảy ra</p>
                                <p className="text-sm text-gray-500">{searchError}</p>
                            </div>
                        ) : (
                            /* No Results */
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="text-gray-400 mb-2">Không tìm thấy sản phẩm</p>
                                <p className="text-sm text-gray-500">
                                    Thử tìm kiếm với từ khóa khác
                                </p>
                            </div>
                        )
                    ) : localSearchTerm.trim().length === 1 ? (
                        /* Need more characters */
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">⌨️</div>
                            <p className="text-gray-400 mb-2">Nhập thêm ký tự</p>
                            <p className="text-sm text-gray-500">
                                Cần ít nhất 2 ký tự để tìm kiếm
                            </p>
                        </div>
                    ) : (
                        /* Recent Searches & Suggestions */
                        <div className="p-4">
                            {recentSearches.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-gray-400">
                                            Tìm kiếm gần đây
                                        </h3>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-gray-500 hover:text-gray-400"
                                        >
                                            Xóa tất cả
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((term, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleRecentSearchClick(term)}
                                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-300">{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Searches */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-3">
                                    Tìm kiếm phổ biến
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['nhẫn', 'bông tai', 'dây chuyền', 'vòng tay', 'vàng', 'bạc'].map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => handleRecentSearchClick(term)}
                                            className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Debug Info */}
                            {/* {process.env.NODE_ENV === 'development' && (
                                <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500">
                                    <div>Cache: {allProductsCache.length} products</div>
                                    <div>Search results: {searchResults.length} products</div>
                                    <div>Loading: {searchLoading ? 'Yes' : 'No'}</div>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchDialog;