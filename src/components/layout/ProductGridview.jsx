// src/components/layout/ProductGridview.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductGridview = ({
    products,
    loading,
    error,
    emptyMessage = "Không có sản phẩm nào",
    gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="text-red-400 mb-4">⚠️ Có lỗi xảy ra</div>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-300">{emptyMessage}</h3>
                <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols} gap-4`}>
            {products.map((product) => (
                <ProductCard
                    key={product.id || product._id}
                    product={product}
                />
            ))}
        </div>
    );
};

export default ProductGridview;