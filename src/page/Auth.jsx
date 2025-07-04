// src/page/Auth.jsx
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '../routes/index.js'
import { loginUser, registerUser, clearMessage, clearError } from '../store/slices/authSlice.js'
import VerifyOtp from '../components/layout/VerifyOtp.jsx'

function Auth() {
    const dispatch = useDispatch()
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
            setTimeout(() => {
                window.location.href = ROUTES.HOME
            }, 2000)
        }
    }, [isAuthenticated, needsVerification])

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear messages when user types
        if (error || message) {
            dispatch(clearMessage())
            dispatch(clearError())
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate inputs
        if (!formData.userName.trim()) {
            return
        }

        if (!formData.password.trim()) {
            return
        }

        if (isLogin) {
            // Đăng nhập
            dispatch(loginUser({
                userName: formData.userName,
                password: formData.password
            }))
        } else {
            // Đăng ký
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

    // Toggle between login and register
    const toggleMode = () => {
        setIsLogin(!isLogin)
        setFormData({
            userName: '',
            password: '',
            email: ''
        })
        dispatch(clearMessage())
        dispatch(clearError())
    }

    // Handle OTP verification success
    const handleOtpSuccess = () => {
        // Redux sẽ tự động handle redirect thông qua useEffect
    }

    // Handle back from OTP verification
    const handleOtpBack = () => {
        dispatch(clearMessage())
        dispatch(clearError())
    }

    // Render OTP verification component
    if (needsVerification && registrationEmail) {
        return (
            <VerifyOtp
                email={registrationEmail}
                onSuccess={handleOtpSuccess}
                onBack={handleOtpBack}
            />
        )
    }

    // Get message type
    const getMessageType = () => {
        if (error) return 'error'
        if (message) {
            if (message.includes('thành công')) return 'success'
            return 'info'
        }
        return ''
    }

    // Get message classes
    const getMessageClass = () => {
        const baseClass = 'message'
        const type = getMessageType()
        switch (type) {
            case 'success': return `${baseClass} message-success`
            case 'error': return `${baseClass} message-error`
            case 'info': return `${baseClass} message-info`
            default: return baseClass
        }
    }

    // Render main auth form
    return (
        <div className="app-container fade-in">
            <header className="app-header md:max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </h1>

                {(message || error) && (
                    <div className={getMessageClass()}>
                        {error || message}
                    </div>
                )}

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
                            💡 Bạn có thể đăng nhập bằng email hoặc tên đăng nhập
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