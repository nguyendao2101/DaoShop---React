import { useState } from 'react'
import { ROUTES } from '../routes/index.js'
import { authService } from '../services/authService.js'
import '../App.scss'

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        email: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('') // 'success' or 'error'

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear message when user types
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
                // Đăng nhập - gửi userName (có thể là email hoặc username)
                console.log('Login attempt with:', {
                    userName: formData.userName,
                    password: formData.password
                })
                result = await authService.login(formData.userName, formData.password)
            } else {
                // Đăng ký
                if (!formData.email.trim()) {
                    setMessage('Vui lòng nhập email để đăng ký')
                    setMessageType('error')
                    setLoading(false)
                    return
                }
                result = await authService.register(formData.userName, formData.password, formData.email)
            }


            if (result.success) {
                setMessage(result.message)
                setMessageType('success')

                // Lưu token nếu có
                if (result.data?.token) {
                    localStorage.setItem('authToken', result.data.token)
                    localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                }

                // Redirect sau 2 giây
                setTimeout(() => {
                    window.location.href = ROUTES.HOME
                }, 2000)

            } else {
                setMessage(result.message)
                setMessageType('error')
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
        setFormData({
            userName: '',
            password: '',
            email: ''
        })
        setMessage('')
        setMessageType('')
    }

    return (
        <div className="App fade-in">
            <header className="App-header">
                <h1>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>

                {/* Message display */}
                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        name="userName"
                        placeholder="Tên đăng nhập"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="auth-form__input"
                        required
                        disabled={loading}
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
                    />

                    <button
                        type="submit"
                        className="auth-form__submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

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