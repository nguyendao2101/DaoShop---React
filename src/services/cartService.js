const API_BASE_URL = 'http://localhost:8797/api';

export const cartService = {
    // ← FIX: Always include Authorization header
    getAuthHeaders: () => {
        const token = localStorage.getItem('authToken');
        console.log('Cart Service - Getting auth headers, token:', token ? `${token.substring(0, 20)}...` : 'MISSING');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Cart Service - Authorization header added');
        } else {
            console.warn('Cart Service - No valid token found for authorization');
        }

        return headers;
    },

    // Get cart
    getCart: async () => {
        try {
            console.log('Cart Service - Getting cart...');

            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'GET',
                headers: cartService.getAuthHeaders()
            });

            console.log('Cart Service - Get cart response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Cart Service - Get cart success:', data);
            return data;
        } catch (error) {
            console.error('Cart Service - Get cart error:', error);
            throw error;
        }
    },

    // Add to cart
    addToCart: async (productId, sizeIndex, quantity) => {
        try {
            console.log('🛒 Cart Service - FULL REQUEST DEBUG:', {
                productId,
                productIdType: typeof productId,
                productIdValue: productId,
                sizeIndex,
                sizeIndexType: typeof sizeIndex,
                quantity,
                quantityType: typeof quantity
            });

            const headers = cartService.getAuthHeaders();
            console.log('Cart Service - Headers:', JSON.stringify(headers, null, 2));

            // Kiểm tra token có trong header không
            const hasAuthHeader = headers.Authorization && headers.Authorization.startsWith('Bearer ');
            console.log('Cart Service - Has valid auth header:', hasAuthHeader);

            if (!hasAuthHeader) {
                console.error('Cart Service - Missing Authorization header!');
                throw new Error('Missing authentication token');
            }

            const requestBody = {
                productId,
                sizeIndex,
                quantity
            };

            console.log('Cart Service - Request URL:', `${API_BASE_URL}/cart/add`);
            console.log('Cart Service - Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log('Cart Service - Response status:', response.status);
            console.log('Cart Service - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Cart Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Cart Service - Add to cart success:', data);
            return data;
        } catch (error) {
            console.error('Cart Service - Add to cart error:', error);
            throw error;
        }
    },

    // Update cart item
    updateCartItem: async (productId, sizeIndex, quantity) => {
        try {
            console.log('Cart Service - Updating cart item:', { productId, sizeIndex, quantity });

            const response = await fetch(`${API_BASE_URL}/cart/update`, {
                method: 'PUT',
                headers: cartService.getAuthHeaders(),
                body: JSON.stringify({
                    productId,
                    sizeIndex,
                    quantity
                })
            });

            console.log('Cart Service - Update cart response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Cart Service - Update cart success:', data);
            return data;
        } catch (error) {
            console.error('Cart Service - Update cart error:', error);
            throw error;
        }
    },

    // Remove from cart
    removeFromCart: async (productId, sizeIndex) => {
        try {
            console.log('Cart Service - Removing from cart:', { productId, sizeIndex });

            const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}/${sizeIndex}`, {
                method: 'DELETE',
                headers: cartService.getAuthHeaders()
            });

            console.log('Cart Service - Remove from cart response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Cart Service - Remove from cart success:', data);
            return data;
        } catch (error) {
            console.error('Cart Service - Remove from cart error:', error);
            throw error;
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            console.log('Cart Service - Clearing cart...');

            const response = await fetch(`${API_BASE_URL}/cart/clear`, {
                method: 'DELETE',
                headers: cartService.getAuthHeaders()
            });

            console.log('Cart Service - Clear cart response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Cart Service - Clear cart success:', data);
            return data;
        } catch (error) {
            console.error('Cart Service - Clear cart error:', error);
            throw error;
        }
    }
};