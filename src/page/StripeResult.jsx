import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    let status = params.get('status');
    // Nếu status bị dính thêm ?session_id=..., tách lại cho đúng
    if (status && status.includes('?')) {
        status = status.split('?')[0];
    }
    return {
        status,
        order_id: params.get('order_id'),
        session_id: params.get('session_id'),
    };
}

const StripeResult = () => {
    const navigate = useNavigate();
    const search = getQueryParams();

    console.log("StripeResult search params:", search);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        async function fetchOrder() {
            try {
                if (search.status === 'success' && search.session_id) {
                    const res = await axios.get(`/api/payment/order-by-session/${search.session_id}`);
                    console.log("StripeResult order API response:", res.data);
                    setOrder(res.data.order);
                }
                setLoading(false);
            } catch (err) {
                console.error("StripeResult order API error:", err);
                setError("Không tìm thấy đơn hàng hoặc có lỗi xảy ra.");
                setLoading(false);
            }
        }
        fetchOrder();
    }, [search]);
    useEffect(() => {
        if (search.status === 'success' && !loading && !error) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate({ to: '/purchaseHistory' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [search.status, loading, error, navigate]);

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                                <p className="text-xl">Đang kiểm tra trạng thái thanh toán...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="text-red-500 text-5xl mb-4">❌</div>
                                <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
                                <p className="text-gray-400 mb-6">{error}</p>
                                <button
                                    onClick={() => navigate({ to: '/purchaseHistory' })}
                                    className="bg-primary text-black px-6 py-2 rounded-lg font-medium"
                                >
                                    Xem lịch sử đơn hàng
                                </button>
                            </div>
                        ) : search.status === 'success' ? (
                            <div className="text-center py-8">
                                <div className="text-green-500 text-5xl mb-4">✓</div>
                                <h2 className="text-2xl font-bold mb-4">Thanh toán thành công!</h2>
                                <p className="text-gray-400 mb-6">
                                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
                                </p>
                                <p className="text-primary mb-6">
                                    Bạn sẽ được chuyển hướng đến trang lịch sử đơn hàng sau {countdown} giây...
                                </p>
                                <button
                                    onClick={() => navigate({ to: '/purchaseHistory' })}
                                    className="bg-primary text-black px-6 py-2 rounded-lg font-medium"
                                >
                                    Xem đơn hàng ngay
                                </button>
                            </div>
                        ) : search.status === 'canceled' ? (
                            <div className="text-center py-8">
                                <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold mb-4">Thanh toán đã bị hủy</h2>
                                <p className="text-gray-400 mb-6">
                                    Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu lại, bạn có thể thanh toán sau.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => navigate({ to: '/cart' })}
                                        className="border border-primary text-primary px-6 py-2 rounded-lg font-medium hover:bg-primary hover:text-black transition-colors"
                                    >
                                        Quay lại giỏ hàng
                                    </button>
                                    <button
                                        onClick={() => navigate({ to: '/purchaseHistory' })}
                                        className="bg-primary text-black px-6 py-2 rounded-lg font-medium"
                                    >
                                        Xem lịch sử đơn hàng
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-yellow-500 text-5xl mb-4">?</div>
                                <h2 className="text-2xl font-bold mb-4">Trạng thái thanh toán không xác định</h2>
                                <p className="text-gray-400 mb-6">
                                    Chúng tôi không thể xác định trạng thái thanh toán của bạn. Vui lòng kiểm tra lịch sử đơn hàng hoặc liên hệ với chúng tôi.
                                </p>
                                <button
                                    onClick={() => navigate({ to: '/purchaseHistory' })}
                                    className="bg-primary text-black px-6 py-2 rounded-lg font-medium"
                                >
                                    Xem lịch sử đơn hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default StripeResult;