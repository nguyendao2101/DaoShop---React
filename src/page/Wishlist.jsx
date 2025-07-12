import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
    fetchWishlist,
    removeFromWishlist,
    clearWishlist,
    selectWishlist,
    selectWishlistItems,
    selectWishlistLoading,
    selectWishlistError,
    selectWishlistTotalItems,
    selectWishlistPagination,
    selectIsRemovingFromWishlist,
    selectIsClearingWishlist
} from '../store/slices/wishlistSlice';
import { logout } from '../store/slices/authSlice';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux selectors
    const wishlistItems = useSelector(selectWishlistItems);
    const wishlistLoading = useSelector(selectWishlistLoading);
    const wishlistError = useSelector(selectWishlistError);
    const totalItems = useSelector(selectWishlistTotalItems);
    const pagination = useSelector(selectWishlistPagination);
    const isClearingWishlist = useSelector(selectIsClearingWishlist);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Fetch wishlist on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/auth' });
            return;
        }

        console.log('🛒 Wishlist Page - Fetching wishlist data...');
        dispatch(fetchWishlist());
    }, [dispatch, isAuthenticated, navigate]);

    // Helper functions
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getFirstImage = (productImg) => {
        if (!productImg) return null;
        return productImg["0"] || Object.values(productImg)[0];
    };

    const getMinPrice = (sizePrice) => {
        if (!sizePrice) return 0;
        const prices = Object.values(sizePrice).map(item => item.price);
        return Math.min(...prices);
    };

    const getDiscountedPrice = (originalPrice, discountPercent) => {
        if (!discountPercent) return originalPrice;
        return originalPrice * (1 - discountPercent / 100);
    };

    // Handle remove item from wishlist
    const handleRemoveItem = async (productId) => {
        const confirmRemove = window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?');
        if (!confirmRemove) return;

        try {
            await dispatch(removeFromWishlist(productId)).unwrap();
            console.log('Removed from wishlist:', productId);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);

            if (error.includes('Authentication failed') || error.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                dispatch(logout());
                navigate({ to: '/auth' });
            } else {
                alert(`Lỗi xóa sản phẩm: ${error}`);
            }
        }
    };

    // Handle clear all wishlist
    const handleClearWishlist = async () => {
        const confirmClear = window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?');
        if (!confirmClear) return;

        try {
            await dispatch(clearWishlist()).unwrap();
            console.log('✅ Wishlist cleared successfully');
        } catch (error) {
            console.error('❌ Failed to clear wishlist:', error);

            if (error.includes('Authentication failed') || error.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                dispatch(logout());
                navigate({ to: '/auth' });
            } else {
                alert(`Lỗi xóa danh sách yêu thích: ${error}`);
            }
        }
    };

    // Handle product click
    const handleProductClick = (productId) => {
        navigate({
            to: '/product/$productId',
            params: { productId }
        });
    };

    // Handle continue shopping
    const handleContinueShopping = () => {
        navigate({ to: '/' });
    };

    // Loading state
    if (wishlistLoading && !wishlistItems.length) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-300">Đang tải danh sách yêu thích...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Error state
    if (wishlistError) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">❌</div>
                        <p className="text-gray-300 mb-4">Lỗi tải danh sách yêu thích: {wishlistError}</p>
                        <button
                            onClick={() => dispatch(fetchWishlist())}
                            className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Empty wishlist state
    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 pt-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💝</div>
                            <h1 className="text-3xl font-bold text-white mb-4">Danh sách yêu thích trống</h1>
                            <p className="text-gray-400 mb-8">Chưa có sản phẩm nào trong danh sách yêu thích của bạn.</p>
                            <button
                                onClick={handleContinueShopping}
                                className="bg-primary text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition-opacity"
                            >
                                Khám phá sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 pt-20 pb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Danh sách yêu thích</h1>
                            <p className="text-gray-400">
                                {totalItems} sản phẩm yêu thích
                            </p>
                        </div>

                        {/* Clear all button */}
                        {wishlistItems.length > 0 && (
                            <button
                                onClick={handleClearWishlist}
                                disabled={isClearingWishlist}
                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isClearingWishlist ? 'Đang xóa...' : 'Xóa tất cả'}
                            </button>
                        )}
                    </div>

                    {/* Wishlist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            const product = item.product;
                            const isRemoving = useSelector(state => selectIsRemovingFromWishlist(state, product.id));
                            const firstImage = getFirstImage(product.productImg);
                            const minPrice = getMinPrice(product.sizePrice);
                            const discountedPrice = getDiscountedPrice(minPrice, product.discountPercent);

                            return (
                                <div
                                    key={item.productId}
                                    className={`bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 group relative ${isRemoving ? 'opacity-50' : ''
                                        }`}
                                >
                                    {/* Product Image */}
                                    <div
                                        className="aspect-square bg-gray-800 relative overflow-hidden cursor-pointer"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        {/* Discount Badge */}
                                        {product.discountPercent > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                                                -{product.discountPercent}%
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveItem(product.id);
                                            }}
                                            disabled={isRemoving}
                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-20 disabled:opacity-50"
                                            title="Xóa khỏi danh sách yêu thích"
                                        >
                                            {isRemoving ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        {firstImage ? (
                                            <img
                                                src={firstImage}
                                                alt={product.nameProduct}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0PC90ZXh0Pjwvc3ZnPg==';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-4xl">💎</span>
                                            </div>
                                        )}

                                        {/* Rating */}
                                        {product.avgRating > 0 && (
                                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                                                <span className="text-yellow-400 mr-1">⭐</span>
                                                {product.avgRating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        {/* Category */}
                                        <div className="text-primary text-xs font-medium mb-1">{product.category}</div>

                                        {/* Product Name */}
                                        <h3
                                            className="text-white font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                                            title={product.nameProduct}
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            {product.nameProduct}
                                        </h3>

                                        {/* Material & Karat */}
                                        <div className="text-gray-400 text-xs mb-2">
                                            {product.material} {product.karat}
                                        </div>

                                        {/* Price */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                {product.discountPercent > 0 ? (
                                                    <>
                                                        <span className="text-lg font-bold text-primary">
                                                            {formatPrice(discountedPrice)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 line-through">
                                                            {formatPrice(minPrice)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold text-primary">
                                                        {formatPrice(minPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Added date */}
                                        <div className="text-gray-500 text-xs mt-2">
                                            Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Continue Shopping Button */}
                    <div className="text-center mt-12">
                        <button
                            onClick={handleContinueShopping}
                            className="bg-primary text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition-opacity"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-400">Đăng nhập với</p>
                            <p className="font-medium text-primary">{user.userName}</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Wishlist;