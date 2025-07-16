import React, { useState } from 'react';
import { addToCart } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import { createOrder } from '../../store/slices/purchaseHistorySlice';
import { createCheckout } from '../../store/slices/stripeSlice';

const OrderDialog = ({
    showOrderDialog,
    setShowOrderDialog,
    selectedSize,
    product,
    quantity,
    setQuantity,
    paymentMethod,
    setPaymentMethod,
    isBuyNowMode,
    isCheckingOut,
    setIsCheckingOut,
    images,
    selectedImageIndex,
    currentPrice,
    formatPrice,
    dispatch,
    navigate,
    getSizeOptions,
    cartItems
}) => {
    const [deliveryAddress, setDeliveryAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        zipCode: "",
        notes: ""
    });
    // Don't show if dialog is hidden or no size is selected
    if (!showOrderDialog || (!selectedSize && (!cartItems || cartItems.length === 0))) return null;

    // Tính tổng tiền cho nhiều sản phẩm
    const totalAmount = cartItems && cartItems.length > 0
        ? cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0) + 30000
        : currentPrice * quantity + 30000;

    // Chuẩn bị mảng items cho đơn hàng
    const orderItems = cartItems && cartItems.length > 0
        ? cartItems.map(item => ({
            productId: item.productId,
            nameProduct: item.name || item.nameProduct || `Sản phẩm ${item.productId}`,
            quantity: item.quantity,
            sizeIndex: item.sizeIndex,
            unitPrice: item.finalPrice,
            productImage: item.image || null
        }))
        : [{
            productId: product.id || product.productId || product._id,
            nameProduct: product.nameProduct,
            quantity: quantity,
            sizeIndex: getSizeOptions().findIndex(opt => opt.size === selectedSize.size),
            unitPrice: currentPrice,
            productImage: images && images.length > 0 ? images[selectedImageIndex || 0] : null
        }];

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleCloseDialog = () => {
        setShowOrderDialog(false);
        setPaymentMethod('cod');
    };

    // Hàm xử lý thay đổi trường địa chỉ
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirmOrder = async () => {
        setIsCheckingOut(true);
        try {
            // Validate thông tin giao hàng
            if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street ||
                !deliveryAddress.ward || !deliveryAddress.district || !deliveryAddress.city) {
                alert('Vui lòng điền đầy đủ thông tin giao hàng!');
                setIsCheckingOut(false);
                return;
            }

            // Chuẩn bị dữ liệu đơn hàng cho nhiều sản phẩm hoặc 1 sản phẩm
            const orderData = {
                userId: "6870c70c1ca5164be10bb91d", // Thực tế sẽ lấy từ trạng thái người dùng
                orderId: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                items: cartItems && cartItems.length > 0
                    ? cartItems.map(item => ({
                        productId: item.productId,
                        nameProduct: item.name || item.nameProduct || `Sản phẩm ${item.productId}`,
                        quantity: item.quantity,
                        sizeIndex: item.sizeIndex,
                        unitPrice: item.finalPrice,
                        productImage: item.image || null
                    }))
                    : [{
                        productId: product.id || product.productId || product._id,
                        nameProduct: product.nameProduct,
                        quantity: quantity,
                        sizeIndex: getSizeOptions().findIndex(opt => opt.size === selectedSize.size),
                        unitPrice: currentPrice,
                        productImage: images && images.length > 0 ? images[selectedImageIndex || 0] : null
                    }],
                totalAmount: cartItems && cartItems.length > 0
                    ? cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0) + 30000
                    : currentPrice * quantity + 30000,
                paymentMethod: paymentMethod,
                deliveryAddress: {
                    fullName: deliveryAddress.fullName,
                    phone: deliveryAddress.phone,
                    street: deliveryAddress.street,
                    ward: deliveryAddress.ward,
                    district: deliveryAddress.district,
                    city: deliveryAddress.city,
                    zipCode: deliveryAddress.zipCode || ""
                },
                shippingFee: 30000,
                discount: 0,
                notes: deliveryAddress.notes || ""
            };

            // Nếu phương thức thanh toán là Stripe
            if (paymentMethod === 'stripe') {
                const orderResult = await dispatch(createOrder(orderData)).unwrap();
                const orderId = orderResult.orderId || orderResult._id;
                const stripeData = {
                    orderId: orderId,
                    totalAmount: orderData.totalAmount,
                    items: orderData.items.map(item => ({
                        productId: item.productId,
                        nameProduct: item.nameProduct.replace(/[^\x00-\x7F]/g, ""),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        productImage: item.productImage ? encodeURI(item.productImage) : null
                    })),
                    shippingFee: orderData.shippingFee,
                    discount: orderData.discount
                };
                const checkoutResult = await dispatch(createCheckout(stripeData)).unwrap();
                if (checkoutResult.data && checkoutResult.data.sessionUrl) {
                    window.location.href = checkoutResult.data.sessionUrl;
                    return;
                } else if (checkoutResult.data && checkoutResult.data.url) {
                    window.location.href = checkoutResult.data.url;
                    return;
                } else if (checkoutResult.sessionUrl) {
                    window.location.href = checkoutResult.sessionUrl;
                    return;
                } else if (checkoutResult.url) {
                    window.location.href = checkoutResult.url;
                    return;
                } else {
                    console.error("Không tìm thấy URL thanh toán trong dữ liệu phản hồi:", checkoutResult);
                    throw new Error('Không nhận được URL thanh toán từ Stripe');
                }
            } else {
                // Các phương thức thanh toán khác
                await dispatch(createOrder(orderData)).unwrap();
                alert('Đặt hàng thành công!');
                navigate({ to: '/purchaseHistory' });
            }

            setShowOrderDialog(false);
            setQuantity(1);
            setIsCheckingOut(false);
        } catch (error) {
            console.error('Lỗi xác nhận đơn hàng:', error);
            const errorMessage = error?.message || error?.toString() || 'Lỗi không xác định';

            if (errorMessage.includes('Authentication failed') ||
                errorMessage.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                dispatch(logout());
                navigate({ to: '/auth' });
            } else {
                alert(`Có lỗi xảy ra: ${errorMessage}`);
            }
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Thông tin đơn hàng</h3>
                    <button
                        onClick={handleCloseDialog}
                        className="text-gray-400 hover:text-white"
                    >
                        &times;
                    </button>
                </div>

                {/* Product info */}
                {cartItems && cartItems.length > 0 ? (
                    <div className="mb-6 pb-4 border-b border-gray-700">
                        <h4 className="font-medium text-white mb-2">Sản phẩm sẽ thanh toán:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <img
                                        src={item.image}
                                        alt={item.name || item.nameProduct || `Sản phẩm ${item.productId}`}
                                        className="w-10 h-10 rounded bg-gray-800 object-cover"
                                        onError={e => { e.target.src = ''; }}
                                    />
                                    <div>
                                        <div className="text-white text-sm">{item.name || item.nameProduct || `Sản phẩm ${item.productId}`}</div>
                                        <div className="text-xs text-gray-400">Size: {item.sizeName || item.sizeIndex} • SL: {item.quantity}</div>
                                    </div>
                                    <div className="ml-auto text-primary font-bold text-sm">{formatPrice(item.finalPrice * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start space-x-4 mb-6 pb-4 border-b border-gray-700">
                        <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <img
                                src={images[selectedImageIndex] || images[0]}
                                alt={product?.nameProduct}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-white">{product?.nameProduct}</h4>
                            <div className="text-sm text-gray-400 mt-1">
                                <p>Size: {selectedSize?.size}</p>
                                <p>Số lượng: {quantity}</p>
                            </div>
                            <div className="mt-2">
                                <div className="text-primary font-bold">
                                    {formatPrice(currentPrice * quantity)}
                                </div>
                                {product?.discountPercent > 0 && (
                                    <div className="text-xs text-green-400">
                                        Giảm {product.discountPercent}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {isBuyNowMode && (
                    <div className="mb-6 border-t border-gray-700 pt-4">
                        <h4 className="font-medium text-white mb-3">Thông tin giao hàng:</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={deliveryAddress.fullName}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={deliveryAddress.phone}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Địa chỉ</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={deliveryAddress.street}
                                    onChange={handleAddressChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    placeholder="Số nhà, tên đường"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phường/Xã</label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={deliveryAddress.ward}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="Phường/Xã"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Quận/Huyện</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={deliveryAddress.district}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="Quận/Huyện"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Thành phố</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={deliveryAddress.city}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="Thành phố"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Mã bưu điện</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={deliveryAddress.zipCode}
                                        onChange={handleAddressChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        placeholder="Mã bưu điện (nếu có)"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={deliveryAddress.notes}
                                    onChange={handleAddressChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    placeholder="Ghi chú cho đơn hàng (nếu có)"
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}
                {/* Payment method selection */}
                <div className="mb-6">
                    <h4 className="font-medium text-white mb-3">Chọn phương thức thanh toán:</h4>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={handlePaymentChange}
                                className="accent-primary"
                            />
                            <div>
                                <div className="text-white">Thanh toán khi nhận hàng (COD)</div>
                                <div className="text-xs text-gray-400">Thanh toán bằng tiền mặt khi nhận hàng</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank_transfer"
                                checked={paymentMethod === 'bank_transfer'}
                                onChange={handlePaymentChange}
                                className="accent-primary"
                            />
                            <div>
                                <div className="text-white">Chuyển khoản ngân hàng</div>
                                <div className="text-xs text-gray-400">Thanh toán qua chuyển khoản ngân hàng</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit_card"
                                checked={paymentMethod === 'credit_card'}
                                onChange={handlePaymentChange}
                                className="accent-primary"
                            />
                            <div>
                                <div className="text-white">Thẻ tín dụng/ghi nợ</div>
                                <div className="text-xs text-gray-400">Thanh toán bằng thẻ Visa, Mastercard, JCB</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="e_wallet"
                                checked={paymentMethod === 'e_wallet'}
                                onChange={handlePaymentChange}
                                className="accent-primary"
                            />
                            <div>
                                <div className="text-white">Ví điện tử</div>
                                <div className="text-xs text-gray-400">Momo, ZaloPay, VNPay, ShopeePay</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="stripe"
                                checked={paymentMethod === 'stripe'}
                                onChange={handlePaymentChange}
                                className="accent-primary"
                            />
                            <div>
                                <div className="text-white">Stripe</div>
                                <div className="text-xs text-gray-400">Thanh toán trực tuyến qua Stripe</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Total and action buttons */}
                <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between mb-4">
                        <span className="text-white font-medium">Tổng thanh toán:</span>
                        <span className="text-primary font-bold">
                            {cartItems && cartItems.length > 0
                                ? formatPrice(totalAmount)
                                : formatPrice(currentPrice * quantity)}
                        </span>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleCloseDialog}
                            className="flex-1 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirmOrder}
                            disabled={isCheckingOut}
                            className="flex-1 bg-primary text-black py-2 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            {isCheckingOut ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                isBuyNowMode ? 'Thanh toán ngay' : 'Thêm vào giỏ'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default OrderDialog;