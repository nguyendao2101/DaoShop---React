import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
    fetchPurchaseHistory,
    fetchOrderDetails,
    cancelOrder,
    createStripePayment,
    checkPaymentStatus,
    clearPurchaseHistoryError,
    setCurrentOrderId,
    selectOrders,
    selectOrderDetails,
    selectCurrentOrderId,
    selectPurchaseHistoryLoading,
    selectOrderDetailsLoading,
    selectPurchaseHistoryError,
    selectOrderDetailsError,
    selectCancellingOrder,
    selectPurchaseHistoryPagination,
    selectCreatingStripePayment,
    selectStripeSessionUrl,
    selectOrderStatusColor,
    selectPaymentStatusColor
} from '../store/slices/purchaseHistorySlice';
import { logout } from '../store/slices/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { formatDate, formatCurrency } from '../utils/formatters';

const PurchaseHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const orders = useSelector(selectOrders);
    const orderDetails = useSelector(selectOrderDetails);
    const currentOrderId = useSelector(selectCurrentOrderId);
    const loading = useSelector(selectPurchaseHistoryLoading);
    const orderDetailsLoading = useSelector(selectOrderDetailsLoading);
    const error = useSelector(selectPurchaseHistoryError);
    const orderDetailsError = useSelector(selectOrderDetailsError);
    const pagination = useSelector(selectPurchaseHistoryPagination);
    const creatingStripePayment = useSelector(selectCreatingStripePayment);
    const stripeSessionUrl = useSelector(selectStripeSessionUrl);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Thêm các hooks này vào đầu component (thay vì trong JSX)
    const isCancellingOrder = useSelector(state =>
        orderDetails ? selectCancellingOrder(state, orderDetails.orderId) : false
    );

    // Local state
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle resize events
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch orders on mount and when page changes
    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/auth' });
            return;
        }

        console.log('Purchase History - Fetching orders for page:', currentPage);
        dispatch(fetchPurchaseHistory({ page: currentPage, limit: 10 }))
            .unwrap()
            .catch(error => {
                console.error('Failed to fetch purchase history:', error);
                if (error.includes('Authentication failed')) {
                    dispatch(logout());
                    navigate({ to: '/auth' });
                }
            });
    }, [dispatch, currentPage, isAuthenticated, navigate]);

    // Redirect to Stripe checkout if URL is available
    useEffect(() => {
        if (stripeSessionUrl) {
            console.log('Redirecting to Stripe checkout:', stripeSessionUrl);
            window.location.href = stripeSessionUrl;
        }
    }, [stripeSessionUrl]);

    // Handle order selection
    const handleOrderSelect = (order) => {
        // Nếu đã chọn đơn hàng này và đang hiển thị chi tiết thì ẩn đi
        if (currentOrderId === order.orderId && showOrderDetails) {
            setShowOrderDetails(false);
            return;
        }

        console.log('Selecting order:', order.orderId);
        dispatch(setCurrentOrderId(order.orderId));

        dispatch(fetchOrderDetails(order.orderId))
            .unwrap()
            .then(() => {
                setShowOrderDetails(true);
            })
            .catch(error => {
                console.error('Failed to fetch order details:', error);
                if (error.includes('Authentication failed')) {
                    dispatch(logout());
                    navigate({ to: '/auth' });
                }
            });
    };

    // Handle order cancellation
    const handleCancelOrder = (order) => {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
            return;
        }

        console.log('Cancelling order:', order.orderId);
        dispatch(cancelOrder(order.orderId))
            .unwrap()
            .then(() => {
                alert('Đơn hàng đã được hủy thành công');
            })
            .catch(error => {
                console.error('Failed to cancel order:', error);
                alert(`Không thể hủy đơn hàng: ${error}`);
                if (error.includes('Authentication failed')) {
                    dispatch(logout());
                    navigate({ to: '/auth' });
                }
            });
    };
    // Handle payment with Stripe
    const handleStripePayment = (order) => {
        if (!order) return;

        const paymentData = {
            orderId: order.orderId || order._id,
            items: order.items.map(item => ({
                id: item.productId,
                name: item.nameProduct,
                price: item.unitPrice,
                quantity: item.quantity,
                image: item.productImage || item.productDetails?.productImg?.[0] || ''
            })),
            shippingFee: order.shippingFee || 0,
            discount: order.discount || 0,
            totalAmount: order.totalAmount || 0
        };

        console.log('Creating Stripe payment for order:', paymentData);
        dispatch(createStripePayment(paymentData))
            .unwrap()
            .catch(error => {
                console.error('Failed to create Stripe payment:', error);
                alert(`Không thể tạo thanh toán: ${error}`);
                if (error.includes('Authentication failed')) {
                    dispatch(logout());
                    navigate({ to: '/auth' });
                }
            });
    };

    // Handle checking payment status
    const handleCheckPayment = (order) => {
        console.log('Checking payment status for order:', order.orderId);
        dispatch(checkPaymentStatus(order.orderId))
            .unwrap()
            .then(() => {
                alert('Trạng thái thanh toán đã được cập nhật');
            })
            .catch(error => {
                console.error('Failed to check payment status:', error);
                alert(`Không thể kiểm tra trạng thái thanh toán: ${error}`);
                if (error.includes('Authentication failed')) {
                    dispatch(logout());
                    navigate({ to: '/auth' });
                }
            });
    };

    // Filter orders based on status
    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.orderStatus === filterStatus);

    // Format date
    const formatOrderDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render order status badge
    const renderOrderStatusBadge = (status) => {
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-800';
        let statusText = 'Không xác định';

        switch (status) {
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                statusText = 'Chờ xác nhận';
                break;
            case 'processing':
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                statusText = 'Đang xử lý';
                break;
            case 'confirmed':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                statusText = 'Đã xác nhận';
                break;
            case 'shipped':
                bgColor = 'bg-indigo-100';
                textColor = 'text-indigo-800';
                statusText = 'Đang giao';
                break;
            case 'delivered':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                statusText = 'Đã giao';
                break;
            case 'cancelled':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                statusText = 'Đã hủy';
                break;
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                {statusText}
            </span>
        );
    };

    // Render payment status badge
    const renderPaymentStatusBadge = (status) => {
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-800';
        let statusText = 'Không xác định';

        switch (status) {
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                statusText = 'Chờ thanh toán';
                break;
            case 'paid':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                statusText = 'Đã thanh toán';
                break;
            case 'failed':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                statusText = 'Thanh toán thất bại';
                break;
            case 'refunded':
                bgColor = 'bg-purple-100';
                textColor = 'text-purple-800';
                statusText = 'Đã hoàn tiền';
                break;
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                {statusText}
            </span>
        );
    };

    // Check if order can be cancelled
    const canCancelOrder = (order) => {
        return ['pending', 'processing', 'confirmed'].includes(order.orderStatus);
    };

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Render loading state
    if (loading && orders.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Render error state
    if (error && orders.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-red-500 text-xl mb-4">❌</div>
                            <p className="text-gray-300 mb-4">Lỗi: {error}</p>
                            <button
                                onClick={() => {
                                    dispatch(clearPurchaseHistoryError());
                                    dispatch(fetchPurchaseHistory({ page: 1, limit: 10 }));
                                }}
                                className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80"
                            >
                                Thử lại
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
            <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Lịch sử đơn hàng</h1>
                        <p className="text-gray-400">Quản lý và theo dõi các đơn hàng của bạn</p>
                    </div>

                    {/* Filter */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'all'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'pending'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Chờ xác nhận
                        </button>
                        <button
                            onClick={() => setFilterStatus('confirmed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'confirmed'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Đã xác nhận
                        </button>
                        <button
                            onClick={() => setFilterStatus('shipped')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'shipped'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Đang giao
                        </button>
                        <button
                            onClick={() => setFilterStatus('delivered')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'delivered'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Đã giao
                        </button>
                        <button
                            onClick={() => setFilterStatus('cancelled')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'cancelled'
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Đã hủy
                        </button>
                    </div>

                    {/* Orders and Order Details Layout */}
                    <div className={`grid ${showOrderDetails && !isMobile ? 'grid-cols-1 lg:grid-cols-3 gap-6' : 'grid-cols-1'}`}>
                        {/* Orders List */}
                        <div className={`${showOrderDetails && !isMobile ? 'lg:col-span-1' : 'w-full'}`}>
                            {filteredOrders.length === 0 ? (
                                <div className="bg-black rounded-lg border border-gray-800 p-6 text-center">
                                    <p className="text-gray-400">Không có đơn hàng nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredOrders.map((order) => (
                                        <div
                                            key={order._id || order.orderId}
                                            className={`bg-black rounded-lg border ${currentOrderId === order.orderId && showOrderDetails
                                                ? 'border-primary'
                                                : 'border-gray-800'
                                                } p-4 cursor-pointer hover:border-gray-600 transition-all`}
                                            onClick={() => handleOrderSelect(order)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                                                <div className="text-white font-medium mb-2 sm:mb-0">
                                                    {order.orderId}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {renderOrderStatusBadge(order.orderStatus)}
                                                    {renderPaymentStatusBadge(order.paymentStatus)}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                                                <div className="text-gray-400 mb-2 sm:mb-0">
                                                    <span className="block sm:inline">Ngày đặt: {formatOrderDate(order.purchaseDate)}</span>
                                                </div>
                                                <div className="text-primary font-bold">
                                                    {formatPrice(order.totalAmount)}
                                                </div>
                                            </div>

                                            <div className="mt-3 text-gray-500 text-sm">
                                                {order.items?.length || 0} sản phẩm
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium ${currentPage === 1 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            &larr;
                                        </button>

                                        {[...Array(pagination.totalPages).keys()].map((page) => (
                                            <button
                                                key={page + 1}
                                                onClick={() => setCurrentPage(page + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page + 1
                                                    ? 'border-primary bg-primary text-black font-bold'
                                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    } text-sm`}
                                            >
                                                {page + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                            disabled={currentPage === pagination.totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium ${currentPage === pagination.totalPages ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="sr-only">Next</span>
                                            &rarr;
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        {showOrderDetails && (
                            <div className={`${!isMobile ? 'lg:col-span-2' : ''}`}>
                                {orderDetailsLoading ? (
                                    <div className="bg-black rounded-lg border border-gray-800 p-6">
                                        <div className="flex justify-center items-center h-40">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                        </div>
                                    </div>
                                ) : orderDetailsError ? (
                                    <div className="bg-black rounded-lg border border-gray-800 p-6">
                                        <div className="text-center">
                                            <div className="text-red-500 text-xl mb-4">❌</div>
                                            <p className="text-gray-300 mb-4">Lỗi: {orderDetailsError}</p>
                                            <button
                                                onClick={() => {
                                                    dispatch(clearPurchaseHistoryError());
                                                    dispatch(fetchOrderDetails(currentOrderId));
                                                }}
                                                className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </div>
                                ) : orderDetails ? (
                                    <div className="bg-black rounded-lg border border-gray-800 p-6">
                                        {/* Mobile close button */}
                                        {isMobile && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => setShowOrderDetails(false)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )}

                                        {/* Order header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-800">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    Đơn hàng #{orderDetails.orderId}
                                                </h2>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Ngày đặt: {formatOrderDate(orderDetails.purchaseDate)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 mt-3 sm:mt-0">
                                                {renderOrderStatusBadge(orderDetails.orderStatus)}
                                                {renderPaymentStatusBadge(orderDetails.paymentStatus)}
                                            </div>
                                        </div>

                                        {/* Order items */}
                                        <div className="mb-6 pb-4 border-b border-gray-800">
                                            <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
                                            <div className="space-y-4">
                                                {orderDetails.items?.map((item, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-3 bg-gray-800/30 rounded-lg">
                                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                                            <img
                                                                src={item.productImage || (item.productDetails?.productImg && item.productDetails.productImg[0])}
                                                                alt={item.nameProduct}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full">
                                                            <div>
                                                                <h4 className="text-white text-sm font-medium">{item.nameProduct}</h4>
                                                                <div className="text-gray-400 text-sm mt-1 space-y-1">
                                                                    <p>Mã SP: <span className="text-gray-300">{item.productId}</span></p>
                                                                    {item.size && (
                                                                        <p>Kích thước: <span className="text-gray-300">{item.size}</span></p>
                                                                    )}
                                                                    <p>Đơn giá: <span className="text-primary">{formatPrice(item.unitPrice)}</span></p>
                                                                    <p>Số lượng: <span className="text-gray-300">{item.quantity}</span></p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0 text-right">
                                                                <div className="text-primary font-semibold">
                                                                    {formatPrice(item.totalPrice || (item.quantity * item.unitPrice))}
                                                                </div>
                                                                {item.productDetails?.discountPercent > 0 && (
                                                                    <div className="text-xs text-green-400 mt-1">
                                                                        Giảm {item.productDetails.discountPercent}%
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delivery address */}
                                        <div className="mb-6 pb-4 border-b border-gray-800">
                                            <h3 className="text-white font-semibold mb-4">Địa chỉ giao hàng</h3>
                                            <div className="text-gray-300 space-y-2">
                                                <p><span className="text-gray-400">Người nhận:</span> {orderDetails.deliveryAddress?.fullName}</p>
                                                <p><span className="text-gray-400">Số điện thoại:</span> {orderDetails.deliveryAddress?.phone}</p>
                                                <p><span className="text-gray-400">Địa chỉ:</span> {orderDetails.deliveryAddress?.street}, {orderDetails.deliveryAddress?.ward}, {orderDetails.deliveryAddress?.district}, {orderDetails.deliveryAddress?.city}</p>
                                                {orderDetails.deliveryAddress?.zipCode && (
                                                    <p><span className="text-gray-400">Mã bưu điện:</span> {orderDetails.deliveryAddress.zipCode}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order summary */}
                                        <div className="mb-6 pb-4 border-b border-gray-800">
                                            <h3 className="text-white font-semibold mb-4">Tổng kết đơn hàng</h3>
                                            <div className="space-y-3 bg-gray-800/30 p-4 rounded-lg">
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Tổng tiền sản phẩm ({orderDetails.items?.length || 0} sản phẩm)</span>
                                                    <span className="text-gray-300">
                                                        {formatPrice(
                                                            orderDetails.items?.reduce(
                                                                (total, item) => total + (item.totalPrice || (item.quantity * item.unitPrice)),
                                                                0
                                                            ) || 0
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Phí vận chuyển</span>
                                                    <span className="text-gray-300">{formatPrice(orderDetails.shippingFee || 0)}</span>
                                                </div>
                                                {orderDetails.discount > 0 && (
                                                    <div className="flex justify-between text-gray-400">
                                                        <span>Giảm giá</span>
                                                        <span className="text-green-400">-{formatPrice(orderDetails.discount)}</span>
                                                    </div>
                                                )}
                                                {orderDetails.stripeTax > 0 && (
                                                    <div className="flex justify-between text-gray-400">
                                                        <span>Thuế</span>
                                                        <span className="text-gray-300">{formatPrice(orderDetails.stripeTax)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-white font-bold pt-3 mt-2 border-t border-gray-700">
                                                    <span>Tổng thanh toán</span>
                                                    <span className="text-primary text-lg">{formatPrice(orderDetails.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment and shipping info */}
                                        <div className="mb-6 pb-4 border-b border-gray-800">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-white font-semibold mb-2">Thông tin thanh toán</h3>
                                                    <div className="text-gray-300">
                                                        <p>
                                                            <span className="text-gray-400">Phương thức:</span> {' '}
                                                            {orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                                                                orderDetails.paymentMethod === 'stripe' ? 'Thanh toán online (Stripe)' :
                                                                    orderDetails.paymentMethod}
                                                        </p>
                                                        <p>
                                                            <span className="text-gray-400">Trạng thái:</span> {' '}
                                                            <span className={selectPaymentStatusColor(orderDetails.paymentStatus)}>
                                                                {orderDetails.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                                                                    orderDetails.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                                        orderDetails.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                                                                            orderDetails.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                                                                                orderDetails.paymentStatus}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold mb-2">Thông tin vận chuyển</h3>
                                                    <div className="text-gray-300">
                                                        <p>
                                                            <span className="text-gray-400">Trạng thái:</span> {' '}
                                                            <span className={selectOrderStatusColor(orderDetails.orderStatus)}>
                                                                {orderDetails.orderStatus === 'pending' ? 'Chờ xác nhận' :
                                                                    orderDetails.orderStatus === 'processing' ? 'Đang xử lý' :
                                                                        orderDetails.orderStatus === 'confirmed' ? 'Đã xác nhận' :
                                                                            orderDetails.orderStatus === 'shipped' ? 'Đang giao hàng' :
                                                                                orderDetails.orderStatus === 'delivered' ? 'Đã giao hàng' :
                                                                                    orderDetails.orderStatus === 'cancelled' ? 'Đã hủy' :
                                                                                        orderDetails.orderStatus}
                                                            </span>
                                                        </p>
                                                        {orderDetails.trackingNumber && (
                                                            <p>
                                                                <span className="text-gray-400">Mã vận đơn:</span> {' '}
                                                                {orderDetails.trackingNumber}
                                                            </p>
                                                        )}
                                                        {orderDetails.notes && (
                                                            <p>
                                                                <span className="text-gray-400">Ghi chú:</span> {' '}
                                                                {orderDetails.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            {canCancelOrder(orderDetails) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelOrder(orderDetails);
                                                    }}
                                                    disabled={isCancellingOrder}  // Dùng biến thay vì hook
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isCancellingOrder ? ( // Dùng biến thay vì hook
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Đang hủy...
                                                        </span>
                                                    ) : 'Hủy đơn hàng'}
                                                </button>
                                            )}



                                            {orderDetails.paymentStatus === 'pending' && orderDetails.paymentMethod === 'stripe' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStripePayment(orderDetails);
                                                    }}
                                                    disabled={creatingStripePayment}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {creatingStripePayment ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Đang xử lý...
                                                        </span>
                                                    ) : 'Thanh toán lại'}
                                                </button>
                                            )}

                                            {orderDetails.paymentMethod === 'stripe' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckPayment(orderDetails);
                                                    }}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                                                >
                                                    Kiểm tra thanh toán
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black rounded-lg border border-gray-800 p-6 text-center">
                                        <p className="text-gray-400">Chọn một đơn hàng để xem chi tiết</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PurchaseHistory;