const API_BASE_URL = 'http://localhost:8797/api';

export const purchaseHistoryService = {
    getAuthHeaders: () => {
        const token = localStorage.getItem('authToken');
        console.log('Purchase History Service - Getting auth headers, token:', token ? `${token.substring(0, 20)}...` : 'MISSING');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Purchase History Service - Authorization header added');
        } else {
            console.warn('Purchase History Service - No valid token found for authorization');
        }

        return headers;
    },

    // Get purchase history
    getPurchaseHistory: async (page = 1, limit = 10) => {
        try {
            console.log('PurchaseHistory Service - Getting purchase history...');

            const response = await fetch(`${API_BASE_URL}/purchase-history?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: purchaseHistoryService.getAuthHeaders()
            });

            console.log('PurchaseHistory Service - Get purchase history response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Get purchase history success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Get purchase history error:', error);
            throw error;
        }
    },

    // Get order details by ID
    getOrderDetails: async (orderId) => {
        try {
            // Convert orderId to string to ensure proper URL formatting
            const safeOrderId = String(orderId);
            console.log('PurchaseHistory Service - Getting order details for:', safeOrderId);

            const response = await fetch(`${API_BASE_URL}/purchase-history/${safeOrderId}`, {
                method: 'GET',
                headers: purchaseHistoryService.getAuthHeaders()
            });

            console.log('PurchaseHistory Service - Get order details response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }

                if (response.status === 400) {
                    throw new Error(`Invalid order ID format or parameters: ${safeOrderId}`);
                }

                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Get order details success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Get order details error:', error);
            throw error;
        }
    },

    // Create new order
    createOrder: async (orderData) => {
        try {
            console.log('PurchaseHistory Service - Creating new order:', orderData);

            const headers = purchaseHistoryService.getAuthHeaders();
            console.log('PurchaseHistory Service - Headers:', JSON.stringify(headers, null, 2));

            // Kiểm tra token có trong header không
            const hasAuthHeader = headers.Authorization && headers.Authorization.startsWith('Bearer ');
            console.log('PurchaseHistory Service - Has valid auth header:', hasAuthHeader);

            if (!hasAuthHeader) {
                console.error('PurchaseHistory Service - Missing Authorization header!');
                throw new Error('Missing authentication token');
            }

            console.log('PurchaseHistory Service - Request URL:', `${API_BASE_URL}/purchase-history/create`);
            console.log('PurchaseHistory Service - Request body:', JSON.stringify(orderData, null, 2));

            const response = await fetch(`${API_BASE_URL}/purchase-history/create`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            });

            console.log('PurchaseHistory Service - Create order response status:', response.status);
            console.log('PurchaseHistory Service - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Create order success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Create order error:', error);
            throw error;
        }
    },

    // Cancel order
    cancelOrder: async (orderId) => {
        try {
            // Convert orderId to string
            const safeOrderId = String(orderId);
            console.log('PurchaseHistory Service - Cancelling order:', safeOrderId);

            const response = await fetch(`${API_BASE_URL}/purchase-history/${safeOrderId}/cancel`, {
                method: 'PUT',
                headers: purchaseHistoryService.getAuthHeaders()
            });

            console.log('PurchaseHistory Service - Cancel order response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Cancel order success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Cancel order error:', error);
            throw error;
        }
    },

    // Create payment with Stripe
    createStripePayment: async (orderData) => {
        try {
            console.log('PurchaseHistory Service - Creating Stripe payment:', orderData);

            const headers = purchaseHistoryService.getAuthHeaders();

            const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            });

            console.log('PurchaseHistory Service - Create Stripe payment response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Create Stripe payment success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Create Stripe payment error:', error);
            throw error;
        }
    },

    // Create payment session (previously using non-existent stripeService)
    createPaymentSession: async (paymentData) => {
        try {
            console.log('PurchaseHistory Service - Creating payment session:', paymentData);

            const response = await fetch(`${API_BASE_URL}/payments/stripe/create-session`, {
                method: 'POST',
                headers: purchaseHistoryService.getAuthHeaders(), // Fixed: use purchaseHistoryService instead of stripeService
                body: JSON.stringify(paymentData)
            });

            console.log('PurchaseHistory Service - Create payment session response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Create payment session success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Create payment session error:', error);
            throw error;
        }
    },

    // Check payment status (previously using non-existent stripeService)
    checkPaymentStatus: async (orderId) => {
        try {
            // Convert orderId to string
            const safeOrderId = String(orderId);
            console.log('PurchaseHistory Service - Checking payment status for order:', safeOrderId);

            const response = await fetch(`${API_BASE_URL}/payments/stripe/check-status/${safeOrderId}`, {
                method: 'GET',
                headers: purchaseHistoryService.getAuthHeaders() // Fixed: use purchaseHistoryService instead of stripeService
            });

            console.log('PurchaseHistory Service - Check payment status response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PurchaseHistory Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PurchaseHistory Service - Check payment status success:', data);
            return data;
        } catch (error) {
            console.error('PurchaseHistory Service - Check payment status error:', error);
            throw error;
        }
    }
};

export default purchaseHistoryService;