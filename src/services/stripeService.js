import axios from 'axios';

const API_BASE_URL = 'http://localhost:8797/api';

// Hàm helper để lấy auth headers (dựa theo mẫu từ wishlistService)
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    console.log('Stripe Service - Getting auth headers, token:', token ? `${token.substring(0, 20)}...` : 'MISSING');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Stripe Service - Authorization header added');
    } else {
        console.warn('Stripe Service - No valid token found for authorization');
    }

    return headers;
};

// Tạo payment intent (dùng cho thanh toán Stripe Elements)
export const createPaymentIntent = async (orderData) => {
    try {
        console.log('Stripe Service - Creating payment intent:', orderData);
        const response = await axios.post(
            `${API_BASE_URL}/payment/create-intent`,
            orderData,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Payment intent created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error creating payment intent:', error);
        throw error;
    }
};

// Tạo phiên thanh toán Stripe Checkout
export const createStripeCheckoutSession = async (orderData) => {
    try {
        console.log('Stripe Service - Creating checkout session:', orderData);
        const response = await axios.post(
            `${API_BASE_URL}/payment/create-checkout`,
            orderData,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Checkout session created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error creating checkout session:', error);
        throw error;
    }
};

// Xác nhận thanh toán
export const confirmPayment = async (paymentData) => {
    try {
        console.log('Stripe Service - Confirming payment:', paymentData);
        const response = await axios.post(
            `${API_BASE_URL}/payment/confirm`,
            paymentData,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Payment confirmed successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error confirming payment:', error);
        throw error;
    }
};

// Kiểm tra trạng thái thanh toán
export const getPaymentStatus = async (paymentIntentId) => {
    try {
        console.log('Stripe Service - Checking payment status for:', paymentIntentId);
        const response = await axios.get(
            `${API_BASE_URL}/payment/status/${paymentIntentId}`,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Payment status retrieved successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error checking payment status:', error);
        throw error;
    }
};

// Xử lý hoàn tiền
export const requestRefund = async (orderId, refundData = {}) => {
    try {
        console.log('Stripe Service - Requesting refund for order:', orderId, refundData);
        const response = await axios.post(
            `${API_BASE_URL}/payment/refund/${orderId}`,
            refundData,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Refund processed successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error requesting refund:', error);
        throw error;
    }
};

// Kiểm tra trạng thái đơn hàng
export const getOrderStatus = async (orderId) => {
    try {
        console.log('Stripe Service - Checking order status for:', orderId);
        const response = await axios.get(
            `${API_BASE_URL}/payment/order-status/${orderId}`,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Order status retrieved successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error checking order status:', error);
        throw error;
    }
};

// Functions for development/testing only
export const testPaymentConfig = async () => {
    try {
        console.log('Stripe Service - Testing payment configuration');
        const response = await axios.get(
            `${API_BASE_URL}/payment/test-config`,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Test config response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error testing payment config:', error);
        throw error;
    }
};

export const createTestOrder = async () => {
    try {
        console.log('Stripe Service - Creating test order');
        const response = await axios.post(
            `${API_BASE_URL}/payment/create-test-order`,
            {},
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Test order created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error creating test order:', error);
        throw error;
    }
};

export const triggerTestWebhook = async (webhookData) => {
    try {
        console.log('Stripe Service - Triggering test webhook:', webhookData);
        const response = await axios.post(
            `${API_BASE_URL}/payment/test-webhook`,
            webhookData,
            { headers: getAuthHeaders() }
        );
        console.log('Stripe Service - Test webhook triggered successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Stripe Service - Error triggering test webhook:', error);
        throw error;
    }
};