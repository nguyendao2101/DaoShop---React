const API_BASE_URL = 'http://localhost:8797/api';

export const userService = {
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

    //Get user profile
    getProfile: async () => {
        try {
            console.log('User Service - Getting profile...');

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: userService.getAuthHeaders()
            });

            console.log('User Service - Get profile response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('User Service - Get profile success:', data);
            return data;
        } catch (error) {
            console.error('User Service - Get profile error:', error);
            throw error;
        }
    },

    //Update user profile
    updateProfile: async (profileData) => {
        try {
            console.log('User Service - Updating profile:', profileData);

            const headers = userService.getAuthHeaders();
            console.log('User Service - Headers:', JSON.stringify(headers, null, 2));

            // Kiểm tra token có trong header không
            const hasAuthHeader = headers.Authorization && headers.Authorization.startsWith('Bearer ');
            console.log('User Service - Has valid auth header:', hasAuthHeader);

            if (!hasAuthHeader) {
                console.error('User Service - Missing Authorization header!');
                throw new Error('Missing authentication token');
            }

            console.log('User Service - Request URL:', `${API_BASE_URL}/auth/profile`);
            console.log('User Service - Request body:', JSON.stringify(profileData, null, 2));

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(profileData)
            });

            console.log('User Service - Update profile response status:', response.status);
            console.log('User Service - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('User Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('User Service - Update profile success:', data);
            return data;
        } catch (error) {
            console.error('User Service - Update profile error:', error);
            throw error;
        }
    },

    // Update user address
    updateAddress: async (addressData) => {
        try {
            console.log('User Service - Updating address:', addressData);

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: userService.getAuthHeaders(),
                body: JSON.stringify({ address: addressData })
            });

            console.log('User Service - Update address response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('User Service - Update address success:', data);
            return data;
        } catch (error) {
            console.error('User Service - Update address error:', error);
            throw error;
        }
    },

    // Update user avatar
    updateAvatar: async (avatarUrl) => {
        try {
            console.log('User Service - Updating avatar:', avatarUrl);

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: userService.getAuthHeaders(),
                body: JSON.stringify({ avatar: avatarUrl })
            });

            console.log('User Service - Update avatar response status:', response.status);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('User Service - Update avatar success:', data);
            return data;
        } catch (error) {
            console.error('User Service - Update avatar error:', error);
            throw error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            console.log('User Service - Changing password...');

            const headers = userService.getAuthHeaders();
            console.log('User Service - Headers:', JSON.stringify(headers, null, 2));

            if (!headers.Authorization || !headers.Authorization.startsWith('Bearer ')) {
                console.error('User Service - Missing Authorization header!');
                throw new Error('Missing authentication token');
            }

            const requestBody = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            };

            console.log('User Service - Request URL:', `${API_BASE_URL}/auth/change-password`);
            console.log('User Service - Request body keys:', Object.keys(requestBody));

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log('User Service - Change password response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('User Service - Error response:', errorText);

                if (response.status === 403 || response.status === 401) {
                    throw new Error('Authentication failed - please login again');
                }
                if (response.status === 400) {
                    throw new Error('Invalid password data - please check your input');
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('User Service - Change password success:', data);
            return data;
        } catch (error) {
            console.error('User Service - Change password error:', error);
            throw error;
        }
    }
};

export default userService;