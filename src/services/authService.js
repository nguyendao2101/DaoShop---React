// src/services/authService.js
import axios from 'axios'

// Base URL cho API
const API_BASE_URL = 'http://localhost:8797/api'

// Tạo axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
})

// Auth service
export const authService = {
    // Đăng nhập
    login: async (userName, password) => {
        try {
            const response = await apiClient.post('/auth/login', {
                userName,
                password
            })
            return {
                success: true,
                data: response.data,
                message: 'Đăng nhập thành công!'
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng nhập thất bại!',
                error: error.response?.data || error.message
            }
        }
    },

    // Đăng ký (nếu backend có endpoint này)
    register: async (userName, password, email) => {
        try {
            const response = await apiClient.post('/auth/register', {
                userName,
                password,
                email
            })
            return {
                success: true,
                data: response.data,
                message: 'Đăng ký thành công!'
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng ký thất bại!',
                error: error.response?.data || error.message
            }
        }
    },

    //verify OTP
    verifyOtp: async (email, otp) => {
        try {
            console.log('📧 Verify OTP request:', { email, otp })

            const response = await apiClient.post('/auth/verify-otp', {
                email,
                otp
            })

            console.log('Verify OTP response:', response.data)
            return {
                success: true,
                data: response.data,
                message: 'Xác thực email thành công!'
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!',
                error: error.response?.data || error.message
            }
        }
    },

    //Resend OTP
    resendOtp: async (email) => {
        try {
            console.log('Resend OTP request:', { email })
            const response = await apiClient.post('/auth/resend-otp', { email })
            console.log('Resend OTP response:', response.data)
            return {
                success: true,
                data: response.data,
                message: 'OTP đã được gửi lại thành công!'
            }
        } catch (error) {
            console.error('Resend OTP error:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể gửi lại mã OTP!',
                error: error.response?.data || error.message
            }
        }
    }
}

export default authService