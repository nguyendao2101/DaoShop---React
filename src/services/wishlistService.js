const API_BASE_URL = 'http://localhost:8797/api';

export const wishlistService = {
    getAuthHeaders: () => {
        const token = localStorage.getItem('authToken');
        console.log('Wishlist Service - Getting auth headers, token:', token ? `${token.substring(0, 20)}...` : 'MISSING');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Wishlist Service - Authorization header added');
        } else {
            console.warn('Wishlist Service - No valid token found for authorization');
        }

        return headers;
    },

    // Get wishlist
    getWishlist: async () => {
        try {
            console.log('Wishlist Service - Getting Wishlist...');

            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                method: 'GET',
                headers: wishlistService.getAuthHeaders()
            });

            console.log('Wishlist Service - Get Wishlist response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Wishlist Service - Get Wishlist success:', data);
            return data;
        } catch (error) {
            console.error('Wishlist Service - Get Wishlist error:', error);
            throw error;
        }
    },
    addToWishlist: async (productId) => {
        try {
            console.log('🛒 Wishlist Service - FULL REQUEST DEBUG:', {
                productId,
                productIdType: typeof productId,
                productIdValue: productId,
            });

            const headers = wishlistService.getAuthHeaders();
            console.log('Wishlist Service - Headers:', JSON.stringify(headers, null, 2));

            // Kiểm tra token có trong header không
            const hasAuthHeader = headers.Authorization && headers.Authorization.startsWith('Bearer ');
            console.log('Wishlist Service - Has valid auth header:', hasAuthHeader);

            if (!hasAuthHeader) {
                console.error('Wishlist Service - Missing Authorization header!');
                throw new Error('Missing authentication token');
            }

            const requestBody = {
                productId,
            };

            console.log('Wishlist Service - Request URL:', `${API_BASE_URL}/wishlist/add`);
            console.log('Wishlist Service - Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log('Wishlist Service - Response status:', response.status);
            console.log('Wishlist Service - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Wishlist Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Wishlist Service - Add to Wishlist success:', data);
            return data;
        } catch (error) {
            console.error('Wishlist Service - Add to Wishlist error:', error);
            throw error;
        }
    },
    removeFromWishlist: async (productId) => {
        try {
            console.log('Wishlist Service - Removing from Wishlist:', { productId });

            const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: wishlistService.getAuthHeaders()
            });

            console.log('Wishlist Service - Remove from Wishlist response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Wishlist Service - Remove from Wishlist success:', data);
            return data;
        } catch (error) {
            console.error('Wishlist Service - Remove from Wishlist error:', error);
            throw error;
        }
    },
    clearWishlist: async () => {
        try {
            console.log('Wishlist Service - Clearing Wishlist...');

            const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
                method: 'DELETE',
                headers: wishlistService.getAuthHeaders()
            });

            console.log('Wishlist Service - Clear Wishlist response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Wishlist Service - Clear Wishlist success:', data);
            return data;
        } catch (error) {
            console.error('Wishlist Service - Clear Wishlist error:', error);
            throw error;
        }
    }
}