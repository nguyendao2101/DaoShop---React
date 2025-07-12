import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    selectIsProductInWishlist,
    selectIsAddingToWishlist,
    selectIsRemovingFromWishlist,
    selectWishlistError
} from '../../store/slices/wishlistSlice';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ✅ Redux selectors
    const isInWishlist = useSelector(state => selectIsProductInWishlist(state, product.id));
    const isAddingToWishlist = useSelector(state => selectIsAddingToWishlist(state, product.id));
    const isRemovingFromWishlist = useSelector(state => selectIsRemovingFromWishlist(state, product.id));
    const wishlistError = useSelector(selectWishlistError);
    const { isAuthenticated } = useSelector(state => state.auth);

    // ✅ Fetch wishlist on component mount (only once)
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, isAuthenticated]);

    // Helper functions
    const getMinPrice = (sizePrice) => {
        if (!sizePrice) return 0;
        const prices = Object.values(sizePrice).map(item => item.price);
        return Math.min(...prices);
    };

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

    const getDiscountedPrice = (originalPrice, discountPercent) => {
        if (!discountPercent) return originalPrice;
        return originalPrice * (1 - discountPercent / 100);
    };

    // ✅ Handle wishlist toggle
    const handleWishlistToggle = async (e) => {
        e.stopPropagation(); // Prevent product click navigation

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            return;
        }

        if (isAddingToWishlist || isRemovingFromWishlist) return;

        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlist(product.id)).unwrap();
                console.log('✅ Removed from wishlist:', product.id);
            } else {
                await dispatch(addToWishlist(product.id)).unwrap();
                console.log('✅ Added to wishlist:', product.id);
            }
        } catch (error) {
            console.error('❌ Wishlist action failed:', error);
            alert(`Lỗi: ${error}`);
        }
    };

    const handleProductClick = () => {
        navigate({
            to: '/product/$productId',
            params: { productId: product.id }
        });
    };

    const minPrice = getMinPrice(product.sizePrice);
    const discountedPrice = getDiscountedPrice(minPrice, product.discountPercent);
    const firstImage = getFirstImage(product.productImg);

    // ✅ Determine loading state
    const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

    return (
        <div
            onClick={handleProductClick}
            className="bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 group cursor-pointer relative"
        >
            {/* Product Image */}
            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                {/* Discount Badge */}
                {product.discountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                        -{product.discountPercent}%
                    </div>
                )}

                {/* ✅ Wishlist Heart Button */}
                <button
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading || !isAuthenticated}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isInWishlist
                        ? 'bg-red-500 text-white shadow-lg scale-110'
                        : 'bg-black/60 text-white hover:bg-red-500 hover:text-white hover:scale-110'
                        } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''} ${!isAuthenticated ? 'opacity-70' : ''
                        }`}
                    title={
                        !isAuthenticated
                            ? 'Đăng nhập để thêm vào yêu thích'
                            : isInWishlist
                                ? 'Xóa khỏi danh sách yêu thích'
                                : 'Thêm vào danh sách yêu thích'
                    }
                >
                    {isWishlistLoading ? (
                        /* ✅ Loading spinner */
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        /* ✅ Heart icon */
                        <svg
                            className={`w-4 h-4 transition-all duration-200 ${isInWishlist ? 'scale-110' : ''}`}
                            fill={isInWishlist ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={isInWishlist ? 0 : 2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
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
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2" title={product.nameProduct}>
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
                                    {formatPrice(minPrice)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(minPrice + minPrice * product.discountPercent / 100)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(minPrice)}
                            </span>
                        )}
                    </div>

                    {/* ✅ Wishlist status indicator (optional small indicator) */}
                    {isInWishlist && (
                        <div className="text-red-500 text-xs font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Yêu thích
                        </div>
                    )}
                </div>

                {/* Total Sold */}
                {product.totalSold > 0 && (
                    <div className="text-gray-500 text-xs mt-1">
                        Đã bán: {product.totalSold}
                    </div>
                )}
            </div>

            {/* ✅ Error indicator (if any) */}
            {wishlistError && (
                <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-xs p-1 text-center z-30">
                    ⚠️ Lỗi wishlist
                </div>
            )}
        </div>
    );
};

export default ProductCard;