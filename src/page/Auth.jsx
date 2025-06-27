// src/page/Auth.jsx
import { useState } from 'react'
import { ROUTES } from '../routes/index.js'
import { authService } from '../services/authService.js'
import VerifyOtp from './VerifyOtp.jsx'
import '../App.scss'

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [showOtpVerification, setShowOtpVerification] = useState(false)
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        email: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (message) {
            setMessage('')
            setMessageType('')
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        // Validate inputs
        if (!formData.userName.trim()) {
            setMessage('Vui lòng nhập email hoặc tên đăng nhập')
            setMessageType('error')
            setLoading(false)
            return
        }

        if (!formData.password.trim()) {
            setMessage('Vui lòng nhập mật khẩu')
            setMessageType('error')
            setLoading(false)
            return
        }

        try {
            let result

            if (isLogin) {
                // Đăng nhập
                console.log('Login attempt with:', {
                    userName: formData.userName,
                    password: formData.password
                })
                result = await authService.login(formData.userName, formData.password)

                if (result.success) {
                    setMessage(result.message)
                    setMessageType('success')

                    if (result.data?.token) {
                        localStorage.setItem('authToken', result.data.token)
                        localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                    }

                    setTimeout(() => {
                        window.location.href = ROUTES.HOME
                    }, 2000)
                } else {
                    setMessage(result.message)
                    setMessageType('error')
                }
            } else {
                // Đăng ký
                if (!formData.email.trim()) {
                    setMessage('Vui lòng nhập email để đăng ký')
                    setMessageType('error')
                    setLoading(false)
                    return
                }

                result = await authService.register(formData.userName, formData.password, formData.email)

                if (result.success) {
                    setMessage(result.message)
                    setMessageType('success')

                    // Chuyển sang màn hình verify OTP sau 2 giây
                    setTimeout(() => {
                        setShowOtpVerification(true)
                    }, 2000)
                } else {
                    setMessage(result.message)
                    setMessageType('error')
                }
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra! Vui lòng thử lại.')
            setMessageType('error')
            console.error('Auth error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Toggle between login and register
    const toggleMode = () => {
        setIsLogin(!isLogin)
        setShowOtpVerification(false)
        setFormData({
            userName: '',
            password: '',
            email: ''
        })
        setMessage('')
        setMessageType('')
    }

    // Handle OTP verification success
    const handleOtpSuccess = (result) => {
        console.log('OTP verification successful:', result)
        // Redirect to home page
        window.location.href = ROUTES.HOME
    }

    // Handle back from OTP verification
    const handleOtpBack = () => {
        setShowOtpVerification(false)
        setMessage('')
        setMessageType('')
        // Giữ lại thông tin form để user có thể sửa
    }

    // Render OTP verification component
    if (showOtpVerification) {
        return (
            <VerifyOtp
                email={formData.email}
                onSuccess={handleOtpSuccess}
                onBack={handleOtpBack}
            />
        )
    }

    // Render main auth form
    return (
        <div className="App fade-in">
            <header className="App-header">
                <h1>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        name="userName"
                        placeholder={isLogin ? "Email hoặc tên đăng nhập" : "Tên đăng nhập"}
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="auth-form__input"
                        required
                        disabled={loading}
                        autoComplete={isLogin ? "username" : "new-password"}
                    />

                    {!isLogin && (
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="auth-form__input"
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="auth-form__input"
                        required
                        minLength="6"
                        disabled={loading}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />

                    <button
                        type="submit"
                        className="auth-form__submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                {isLogin && (
                    <div className="login-hint">
                        <small style={{ color: '#888', fontSize: '14px' }}>
                            💡 Bạn có thể đăng nhập bằng email hoặc tên đăng nhập
                        </small>
                    </div>
                )}

                <div className="text-center mt-1">
                    <button
                        onClick={toggleMode}
                        className="auth-form__toggle"
                        disabled={loading}
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>

                <div className="text-center mt-1">
                    <a className="App-link" href={ROUTES.HOME}>
                        ← Về trang chủ
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Auth