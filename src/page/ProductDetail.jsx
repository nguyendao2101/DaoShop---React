import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProductById,
    fetchRelatedProducts,
    selectSelectedProduct,
    selectSelectedProductLoading,
    selectSelectedProductError,
    selectRelatedProducts,
    selectRelatedLoading,
    selectRelatedError,
    clearSelectedProduct,
    clearRelatedProducts
} from '../store/slices/productSlice';
import {
    addToCart,
    optimisticAddToCart,
    selectCartLoading
} from '../store/slices/cartSlice';
// ← ADD: Missing logout import
import { logout } from '../store/slices/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import OrderDialog from '../components/layout/OrderDialog';
import RelatedProducts from '../components/layout/RelatedProducts';

const ProductDetail = () => {
    // TanStack Router hooks
    const { productId } = useParams({ from: '/product/$productId' });
    const navigate = useNavigate({ from: '/product/$productId' });

    const dispatch = useDispatch();

    // Redux state
    const product = useSelector(selectSelectedProduct);
    const loading = useSelector(selectSelectedProductLoading);
    const error = useSelector(selectSelectedProductError);

    // Related products
    const relatedProducts = useSelector(selectRelatedProducts);
    const relatedLoading = useSelector(selectRelatedLoading);
    const relatedError = useSelector(selectRelatedError);

    // Cart state
    const { isAuthenticated } = useSelector(state => state.auth);
    const cartLoading = useSelector(selectCartLoading);

    // Component state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isBuyNowMode, setIsBuyNowMode] = useState(false);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }

        return () => {
            dispatch(clearSelectedProduct());
            dispatch(clearRelatedProducts());
        };
    }, [dispatch, productId]);

    useEffect(() => {
        if (product && product.category) {
            dispatch(fetchRelatedProducts({
                category: product.category,
                currentProductId: product.id,
                limit: 6
            }));
        }
    }, [dispatch, product]);

    // Helper functions
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getDiscountedPrice = (originalPrice, discountPercent) => {
        if (!discountPercent) return originalPrice;
        return originalPrice * (1 - discountPercent / 100);
    };

    const getProductImages = () => {
        if (!product?.productImg) return [];
        return Object.values(product.productImg);
    };

    const getSizeOptions = () => {
        if (!product?.sizePrice) return [];
        return Object.values(product.sizePrice);
    };

    const handleSizeSelect = (sizeOption) => {
        setSelectedSize(sizeOption);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && (!selectedSize || newQuantity <= selectedSize.stock)) {
            setQuantity(newQuantity);
        }
    };

    // ← FIXED: Better error handling with safe access to error.message
    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('Vui lòng chọn size');
            return;
        }

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate({ to: '/auth' });
            return;
        }

        try {
            const sizeOptions = getSizeOptions();
            const sizeIndex = sizeOptions.findIndex(opt => opt.size === selectedSize.size);

            // Sử dụng product.id thay vì product._id
            const productIdToSend = product.id || product.productId || product._id;

            console.log('ProductDetail - DETAILED DEBUG:', {
                'product.id': product.id,
                'product.productId': product.productId,
                'product._id': product._id,
                'productIdToSend': productIdToSend,
                'sizeIndex': sizeIndex,
                'quantity': quantity,
                'selectedSize': selectedSize,
                'allProductKeys': Object.keys(product),
                'authToken': localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING'
            });

            // Check if user still authenticated
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                dispatch(logout());
                navigate({ to: '/auth' });
                return;
            }

            // Gửi đúng productId mà backend expect
            const result = await dispatch(addToCart({
                productId: productIdToSend,  // ← Đây là key quan trọng
                sizeIndex,
                quantity: quantity
            })).unwrap();

            console.log('🛒 ProductDetail - Add to cart success:', result);
            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            setQuantity(1);

        } catch (error) {
            console.error('🛒 ProductDetail - Add to cart error:', error);

            const errorMessage = error?.message || error?.toString() || 'Unknown error';

            // Handle specific error types
            if (errorMessage.includes('Product not found')) {
                alert(`Lỗi: Không tìm thấy sản phẩm. ProductId gửi: ${productIdToSend || 'undefined'}`);
            } else if (errorMessage.includes('Authentication failed') ||
                errorMessage.includes('Invalid or expired token') ||
                errorMessage.includes('Invalid token') ||
                errorMessage.includes('jwt malformed')) {

                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('authToken');
                dispatch(logout());
                navigate({ to: '/auth' });
            } else if (errorMessage.includes('Authentication token not found')) {
                alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
                navigate({ to: '/auth' });
            } else {
                alert(`Có lỗi xảy ra: ${errorMessage}`);
            }
        }
    };

    const handleBuyNow = async () => {
        if (!selectedSize) {
            alert('Vui lòng chọn size');
            return;
        }

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để mua hàng');
            navigate({ to: '/auth' });
            return;
        }
        setIsBuyNowMode(true);
        setShowOrderDialog(true);
        // try {
        //     const sizeOptions = getSizeOptions();
        //     const sizeIndex = sizeOptions.findIndex(opt => opt.size === selectedSize.size);

        //     // Check if user still authenticated
        //     const token = localStorage.getItem('authToken');
        //     if (!token) {
        //         alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        //         dispatch(logout());
        //         navigate({ to: '/auth' });
        //         return;
        //     }

        //     // Add to cart first
        //     await dispatch(addToCart({
        //         productId: product._id,
        //         sizeIndex,
        //         quantity: quantity
        //     })).unwrap();

        //     // Navigate to checkout (will implement later)
        //     alert('Sản phẩm đã được thêm vào giỏ hàng! Chức năng checkout đang phát triển.');
        //     // navigate({ to: '/checkout' });
        // } catch (error) {
        //     console.error('🛒 ProductDetail - Buy now error:', error);

        //     // ← FIXED: Safe error message handling
        //     const errorMessage = error?.message || error?.toString() || 'Unknown error';

        //     if (errorMessage.includes('Authentication failed') ||
        //         errorMessage.includes('Invalid or expired token') ||
        //         errorMessage.includes('Invalid token') ||
        //         errorMessage.includes('jwt malformed')) {

        //         alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        //         localStorage.removeItem('authToken');
        //         dispatch(logout());
        //         navigate({ to: '/auth' });
        //     } else {
        //         alert(`Có lỗi xảy ra: ${errorMessage}`);
        //     }
        // }
    };

    const handleGoHome = () => {
        navigate({ to: '/' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-400 mb-4">⚠️ Có lỗi xảy ra</div>
                        <p className="text-gray-400 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
                        <button
                            onClick={handleGoHome}
                            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:opacity-80"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDescriptionList = (description) => {
        if (!description) return 'Đang cập nhật mô tả sản phẩm...';

        const items = description.split('-').filter(item => item.trim() !== '');

        if (items.length <= 1) {
            return <p className="text-gray-300 leading-relaxed">{description}</p>;
        }

        return (
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start">
                        <span className="text-primary mr-3 mt-1">▪</span>
                        <span className="text-gray-300 leading-relaxed">{item.trim()}</span>
                    </div>
                ))}
            </div>
        );
    };

    const images = getProductImages();
    const sizeOptions = getSizeOptions();
    const currentPrice = selectedSize ? getDiscountedPrice(selectedSize.price, product.discountPercent) : 0;
    const originalPrice = selectedSize ? selectedSize.price : 0;

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
                                <span className="text-gray-400">{product.category}</span>
                            </li>
                            <li className="text-gray-600">/</li>
                            <li className="text-white font-medium truncate max-w-xs">
                                {product.nameProduct}
                            </li>
                        </ol>
                    </nav>

                    {/* Product Detail Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        {/* Product Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                                <img
                                    src={images[selectedImageIndex] || images[0]}
                                    alt={product.nameProduct}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                                                ? 'border-primary'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.nameProduct} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Category & Brand */}
                            <div className="flex items-center space-x-2 text-sm">
                                <span className="text-primary font-medium">{product.category}</span>
                                <span className="text-gray-600">|</span>
                                <span className="text-gray-400">Nguyen Dao Jewelry</span>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                                {product.nameProduct}
                            </h1>

                            {/* Rating & Sales */}
                            <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-lg ${i < Math.floor(product.avgRating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-600'
                                                    }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-gray-400">
                                        ({product.avgRating || 0})
                                    </span>
                                </div>
                                <div className="text-gray-400">
                                    Đã bán: {product.totalSold || 0}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                {selectedSize ? (
                                    <div className="flex items-baseline space-x-3">
                                        <span className="text-3xl font-bold text-primary">
                                            {formatPrice(currentPrice)}
                                        </span>
                                        {product.discountPercent > 0 && (
                                            <>
                                                <span className="text-lg text-gray-500 line-through">
                                                    {formatPrice(originalPrice)}
                                                </span>
                                                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                                                    -{product.discountPercent}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        Vui lòng chọn size để xem giá
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-3 text-sm">
                                <div className="flex">
                                    <span className="w-20 text-gray-400">Chất liệu:</span>
                                    <span>{product.material}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 text-gray-400">Độ tinh khiết:</span>
                                    <span>{product.karat}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 text-gray-400">Giới tính:</span>
                                    <span>{product.gender}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-20 text-gray-400">Loại:</span>
                                    <span>{product.type}</span>
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Chọn size:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sizeOptions.map((sizeOption, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSizeSelect(sizeOption)}
                                            disabled={sizeOption.stock === 0}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize?.size === sizeOption.size
                                                ? 'border-primary bg-primary text-black'
                                                : sizeOption.stock === 0
                                                    ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                                                    : 'border-gray-600 text-white hover:border-primary'
                                                }`}
                                        >
                                            {sizeOption.size}
                                            {sizeOption.stock === 0 && ' (Hết hàng)'}
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && (
                                    <div className="text-sm text-gray-400">
                                        Còn lại: {selectedSize.stock} sản phẩm
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Số lượng:</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center border border-gray-600 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 border-x border-gray-600">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={!selectedSize || quantity >= selectedSize.stock}
                                            className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {selectedSize && (
                                        <span className="text-sm text-gray-400">
                                            Tối đa {selectedSize.stock} sản phẩm
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || selectedSize.stock === 0 || cartLoading}
                                    className="flex-1 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!selectedSize || selectedSize.stock === 0 || cartLoading}
                                    className="flex-1 bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cartLoading ? 'Đang xử lý...' : 'Mua ngay'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Description Section */}
                    <div className="border-t border-gray-800 pt-12 mb-16">
                        <div className="max-w-4xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Mô tả sản phẩm</h2>
                                {product.description && product.description.length > 300 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-primary hover:underline text-sm"
                                    >
                                        {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </div>

                            <div className={`${!showFullDescription && product.description && product.description.length > 300
                                ? 'max-h-32 overflow-hidden relative'
                                : ''
                                }`}>
                                {formatDescriptionList(product.description)}

                                {/* Gradient overlay khi thu gọn */}
                                {!showFullDescription && product.description && product.description.length > 300 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    <div className="border-t border-gray-800 pt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                Sản phẩm tương tự
                                {relatedProducts.length > 0 && (
                                    <span className="text-lg text-gray-400 font-normal ml-2">
                                        ({relatedProducts.length} sản phẩm)
                                    </span>
                                )}
                            </h2>

                            {/* Link to category page nếu có nhiều sản phẩm */}
                            {relatedProducts.length >= 6 && (
                                <button
                                    onClick={() => navigate({
                                        to: '/products',
                                        search: { category: product.category }
                                    })}
                                    className="text-primary hover:underline text-sm"
                                >
                                    Xem tất cả →
                                </button>
                            )}
                        </div>

                        <RelatedProducts
                            products={relatedProducts}
                            loading={relatedLoading}
                            error={relatedError}
                        />
                    </div>
                </div>
            </main>
            <OrderDialog
                showOrderDialog={showOrderDialog}
                setShowOrderDialog={setShowOrderDialog}
                selectedSize={selectedSize}
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isBuyNowMode={isBuyNowMode}
                isCheckingOut={isCheckingOut}
                setIsCheckingOut={setIsCheckingOut}
                images={images}
                selectedImageIndex={selectedImageIndex}
                currentPrice={currentPrice}
                formatPrice={formatPrice}
                handleAddToCart={handleAddToCart}
                dispatch={dispatch}
                navigate={navigate}
                getSizeOptions={getSizeOptions}
            />
            <Footer />
        </div>
    );
};

export default ProductDetail;