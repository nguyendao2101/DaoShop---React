// src/page/Auth.jsx
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '../routes/index.js'
import {
    loginUser,
    registerUser,
    loginWithGoogle,
    handleGoogleCallback,
    clearMessage,
    clearError
} from '../store/slices/authSlice.js'
import VerifyOtp from '../components/layout/VerifyOtp.jsx'
import logoGG from '../assets/images/logoGG.png'


function Auth() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {
        isLoading,
        error,
        message,
        isAuthenticated,
        needsVerification,
        registrationEmail
    } = useSelector((state) => state.auth)

    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        email: ''
    })

    // Handle authentication success
    useEffect(() => {
        if (isAuthenticated && !needsVerification) {
            const timer = setTimeout(() => {
                console.log('Navigating to HOME using TanStack Router...')
                try {
                    navigate({ to: ROUTES.HOME })
                } catch (error) {
                    console.error('Navigation error:', error)
                    window.location.href = ROUTES.HOME
                }
            }, 1500)

            return () => clearTimeout(timer)
        }
    }, [isAuthenticated, needsVerification])

    // Handle Google callback on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const userStr = urlParams.get('user')
        const error = urlParams.get('error')

        if (token || userStr || error) {
            console.log('🔄 Processing Google callback...')
            dispatch(handleGoogleCallback(urlParams))
                .unwrap()
                .then((result) => {
                    console.log('Google login successful:', result)
                    window.history.replaceState({}, document.title, window.location.pathname)
                })
                .catch((error) => {
                    console.error('Google login failed:', error)
                    window.history.replaceState({}, document.title, window.location.pathname)
                })
        }
    }, [dispatch])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (error || message) {
            dispatch(clearMessage())
            dispatch(clearError())
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.userName.trim() || !formData.password.trim()) {
            return
        }

        if (isLogin) {
            dispatch(loginUser({
                userName: formData.userName,
                password: formData.password
            }))
        } else {
            if (!formData.email.trim()) {
                return
            }
            dispatch(registerUser({
                userName: formData.userName,
                password: formData.password,
                email: formData.email
            }))
        }
    }

    const handleGoogleLogin = () => {
        console.log('Starting Google login...')
        dispatch(loginWithGoogle())
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        setFormData({ userName: '', password: '', email: '' })
        dispatch(clearMessage())
        dispatch(clearError())
    }

    const handleOtpSuccess = () => {
        // Will be handled by useEffect above
    }

    const handleOtpBack = () => {
        dispatch(clearMessage())
        dispatch(clearError())
    }

    const getSuccessMessage = () => {
        if (isAuthenticated && message) {
            return `${message} Đang chuyển hướng...`
        }
        return error || message
    }

    // OTP verification screen
    if (needsVerification && registrationEmail) {
        return (
            <VerifyOtp
                email={registrationEmail}
                onSuccess={handleOtpSuccess}
                onBack={handleOtpBack}
            />
        )
    }

    const getMessageClass = () => {
        const baseClass = 'message'
        if (error) return `${baseClass} message-error`
        if (message) {
            if (message.includes('thành công') || isAuthenticated) return `${baseClass} message-success`
            return `${baseClass} message-info`
        }
        return baseClass
    }

    return (
        <div className="app-container fade-in">
            <header className="app-header md:max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </h1>

                {(message || error) && (
                    <div className={getMessageClass()}>
                        {getSuccessMessage()}
                        {isAuthenticated && (
                            <div className="flex justify-center mt-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Google Login Button */}
                <div className="w-full max-w-xs mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <img src={logoGG} alt="Google" className="w-5 h-5" />
                        <span>Đăng nhập với Google</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full max-w-xs mb-6 flex items-center">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400 text-sm">hoặc</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        name="userName"
                        placeholder={isLogin ? "Email hoặc tên đăng nhập" : "Tên đăng nhập"}
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        disabled={isLoading}
                    />

                    {!isLogin && (
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            disabled={isLoading}
                        />
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        minLength="6"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        className={`btn-primary w-full ${isLoading ? 'btn-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                {isLogin && (
                    <div className="mt-4 text-center">
                        <small className="text-gray-400 text-sm">
                            Bạn có thể đăng nhập bằng email hoặc tên đăng nhập
                        </small>
                    </div>
                )}

                <div className="text-center mt-4">
                    <button
                        onClick={toggleMode}
                        className="auth-form-toggle"
                        disabled={isLoading}
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <a className="app-link" href={ROUTES.HOME}>
                        ← Về trang chủ
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Auth