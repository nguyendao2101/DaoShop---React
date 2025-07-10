// src/components/layout/RelatedProducts.jsx
import React from 'react';
import { useNavigate } from '@tanstack/react-router';

const RelatedProducts = ({ products, loading, error }) => {
    const navigate = useNavigate();

    // Helper functions
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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

    const getFirstImage = (productImg) => {
        if (!productImg) return null;
        return productImg["0"] || Object.values(productImg)[0];
    };

    const handleProductClick = (productId) => {
        navigate({
            to: '/product/$productId',
            params: { productId }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Không thể tải sản phẩm tương tự</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Không có sản phẩm tương tự</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product) => {
                const minPrice = getMinPrice(product.sizePrice);
                const discountedPrice = getDiscountedPrice(minPrice, product.discountPercent);
                const firstImage = getFirstImage(product.productImg);

                return (
                    <div
                        key={product.id || product._id}
                        onClick={() => handleProductClick(product.id)}
                        className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 group cursor-pointer"
                    >
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-800 relative overflow-hidden">
                            {/* Discount Badge */}
                            {product.discountPercent > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium z-10">
                                    -{product.discountPercent}%
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {firstImage ? (
                                <img
                                    src={firstImage}
                                    alt={product.nameProduct}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0PC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-2xl">💎</span>
                                </div>
                            )}

                            {/* Rating */}
                            {product.avgRating > 0 && (
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-xs flex items-center">
                                    <span className="text-yellow-400 mr-1">⭐</span>
                                    {product.avgRating.toFixed(1)}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                            {/* Product Name */}
                            <h4 className="text-white font-medium text-sm mb-2 line-clamp-2" title={product.nameProduct}>
                                {product.nameProduct}
                            </h4>

                            {/* Material & Karat */}
                            <div className="text-gray-400 text-xs mb-2">
                                {product.material} {product.karat}
                            </div>

                            {/* Price */}
                            <div className="flex flex-col">
                                {product.discountPercent > 0 ? (
                                    <>
                                        <span className="text-primary font-bold text-sm">
                                            {formatPrice(discountedPrice)}
                                        </span>
                                        <span className="text-gray-500 line-through text-xs">
                                            {formatPrice(minPrice)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-primary font-bold text-sm">
                                        {formatPrice(minPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Total Sold */}
                            {product.totalSold > 0 && (
                                <div className="text-gray-500 text-xs mt-1">
                                    Đã bán: {product.totalSold}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RelatedProducts;