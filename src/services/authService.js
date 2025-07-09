// src/services/authService.js
const API_BASE_URL = 'http://localhost:8797/api'

// Create axios instance
const apiClient = {
    post: async (url, data) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        return { data: await response.json() }
    },
    get: async (url) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return { data: await response.json() }
    }
}

export const authService = {
    // Regular login
    login: async (userName, password) => {
        try {
            console.log('🔄 Attempting login for:', userName)
            const response = await apiClient.post('/auth/login', {
                userName,
                password
            })

            console.log('Login response:', response.data)

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Đăng nhập thành công!'
                }
            }

            return {
                success: false,
                message: response.data.message || 'Đăng nhập thất bại!'
            }
        } catch (error) {
            console.error('Login error:', error)
            return {
                success: false,
                message: 'Đăng nhập thất bại!',
                error: error.message
            }
        }
    },

    // Register
    register: async (userName, password, email) => {
        try {
            console.log('🔄 Attempting register for:', { userName, email })
            const response = await apiClient.post('/auth/register', {
                userName,
                password,
                email
            })

            console.log('Register response:', response.data)

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Đăng ký thành công!'
                }
            }

            return {
                success: false,
                message: response.data.message || 'Đăng ký thất bại!'
            }
        } catch (error) {
            console.error('Register error:', error)
            return {
                success: false,
                message: 'Đăng ký thất bại!',
                error: error.message
            }
        }
    },

    // Verify OTP
    verifyOtp: async (email, otp) => {
        try {
            console.log('🔄 Verifying OTP for:', email)
            const response = await apiClient.post('/auth/verify-otp', {
                email,
                otp
            })

            console.log('Verify OTP response:', response.data)

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Xác thực email thành công!'
                }
            }

            return {
                success: false,
                message: response.data.message || 'Mã OTP không hợp lệ!'
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            return {
                success: false,
                message: 'Xác thực thất bại!',
                error: error.message
            }
        }
    },

    // Google Login - Redirect to backend
    loginWithGoogle: () => {
        console.log('🔄 Redirecting to Google OAuth...')
        window.location.href = `${API_BASE_URL}/auth/google`
    },

    // Handle Google callback from URL parameters
    handleGoogleCallback: async (urlParams) => {
        try {
            const token = urlParams.get('token')
            const userStr = urlParams.get('user')
            const error = urlParams.get('error')

            console.log('🔍 Google callback params:', {
                hasToken: !!token,
                hasUser: !!userStr,
                hasError: !!error,
                tokenValue: token ? `${token.substring(0, 20)}...` : 'NULL',
                errorValue: error
            })

            if (error) {
                return {
                    success: false,
                    message: 'Đăng nhập Google thất bại!',
                    error: error
                }
            }

            // ✅ Chỉ cần có token là đủ
            if (token) {
                let user

                // Nếu có user data từ URL
                if (userStr) {
                    try {
                        user = JSON.parse(decodeURIComponent(userStr))
                        console.log('👤 User from URL:', user)
                    } catch (parseError) {
                        console.warn('⚠️ Failed to parse user from URL:', parseError)
                        user = null
                    }
                }

                // ✅ Nếu không có user data, decode từ JWT token
                if (!user) {
                    try {
                        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
                        console.log('🔓 Decoded token payload:', tokenPayload)

                        user = {
                            id: tokenPayload.userId,
                            userName: tokenPayload.userName,
                            email: tokenPayload.email,
                            loginMethod: 'google'
                        }
                        console.log('👤 User from token:', user)
                    } catch (decodeError) {
                        console.error('❌ Failed to decode token:', decodeError)
                        // Fallback user object
                        user = {
                            userName: 'Google User',
                            email: 'user@gmail.com',
                            loginMethod: 'google'
                        }
                        console.log('👤 Using fallback user:', user)
                    }
                }

                // Store in localStorage
                localStorage.setItem('authToken', token)
                localStorage.setItem('userData', JSON.stringify(user))

                console.log('✅ Google callback successful!')
                return {
                    success: true,
                    data: { token, user },
                    message: 'Đăng nhập Google thành công!'
                }
            }

            // ✅ Không có token
            console.error('❌ No token found in callback')
            return {
                success: false,
                message: 'Không nhận được token từ Google!',
                error: 'Missing token'
            }

        } catch (error) {
            console.error('❌ Google callback processing error:', error)
            return {
                success: false,
                message: 'Xử lý callback Google thất bại!',
                error: error.message
            }
        }
    }
}