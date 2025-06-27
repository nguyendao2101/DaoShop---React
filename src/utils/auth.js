// src/utils/auth.js
export const authUtils = {
    // Kiểm tra user đã đăng nhập chưa
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken')
        return !!token
    },

    // Lấy token
    getToken: () => {
        return localStorage.getItem('authToken')
    },

    // Lấy user data
    getUserData: () => {
        const userData = localStorage.getItem('userData')
        return userData ? JSON.parse(userData) : null
    },

    // Đăng xuất
    logout: () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        window.location.href = '/auth'
    }
}