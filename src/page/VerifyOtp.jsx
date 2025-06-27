// src/components/VerifyOtp.jsx
import { useState } from 'react'
import { ROUTES } from '../routes/index.js'
import { authService } from '../services/authService.js'
import '../App.scss'

function VerifyOtp({ email, onSuccess, onBack }) {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)

    // Handle OTP input change
    const handleOtpChange = (e) => {
        // Chỉ cho phép nhập số và giới hạn 6 ký tự
        const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
        setOtp(numericValue)

        if (message) {
            setMessage('')
            setMessageType('')
        }
    }

    // Handle resend OTP cooldown
    const startResendCooldown = () => {
        setResendCooldown(60)
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Handle OTP verification
    const handleOtpVerification = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (!otp.trim() || otp.length !== 6) {
            setMessage('Vui lòng nhập đầy đủ mã OTP 6 số')
            setMessageType('error')
            setLoading(false)
            return
        }

        try {
            const result = await authService.verifyOtp(email, otp)

            if (result.success) {
                setMessage(result.message)
                setMessageType('success')

                // Lưu token nếu có
                if (result.data?.token) {
                    localStorage.setItem('authToken', result.data.token)
                    localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                }

                // Gọi callback success
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess(result)
                    }, 1500)
                } else {
                    // Fallback redirect
                    setTimeout(() => {
                        window.location.href = ROUTES.HOME
                    }, 2000)
                }
            } else {
                setMessage(result.message)
                setMessageType('error')
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra! Vui lòng thử lại.')
            setMessageType('error')
            console.error('OTP verification error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return

        setLoading(true)
        setMessage('')

        try {
            const result = await authService.resendOtp(email)

            if (result.success) {
                setMessage(result.message)
                setMessageType('success')
                startResendCooldown()
            } else {
                setMessage(result.message)
                setMessageType('error')
            }
        } catch (error) {
            setMessage('Không thể gửi lại mã OTP!')
            setMessageType('error')
            console.error('Resend OTP error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle back button
    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            // Fallback
            window.history.back()
        }
    }

    // Start cooldown when component mounts
    useState(() => {
        startResendCooldown()
    }, [])

    return (
        <div className="App fade-in">
            <header className="App-header">
                <h1>Xác thực Email</h1>

                <div className="otp-info">
                    <p>Mã OTP đã được gửi đến:</p>
                    <strong>{email}</strong>
                    <p className="otp-note">
                        Vui lòng kiểm tra hộp thư và thư mục spam
                    </p>
                </div>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleOtpVerification} className="auth-form">
                    <div className="otp-input-container">
                        <input
                            type="text"
                            name="otp"
                            placeholder="000000"
                            value={otp}
                            onChange={handleOtpChange}
                            className="auth-form__input otp-input"
                            required
                            disabled={loading}
                            maxLength="6"
                            autoComplete="one-time-code"
                            autoFocus
                        />
                        <div className="otp-length-indicator">
                            {otp.length}/6
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-form__submit"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                    </button>
                </form>

                <div className="otp-actions">
                    <button
                        onClick={handleResendOtp}
                        className="resend-btn"
                        disabled={loading || resendCooldown > 0}
                    >
                        {resendCooldown > 0
                            ? `Gửi lại sau ${resendCooldown}s`
                            : '🔄 Gửi lại mã OTP'
                        }
                    </button>

                    <button
                        onClick={handleBack}
                        className="back-btn"
                        disabled={loading}
                    >
                        ← Quay lại đăng ký
                    </button>
                </div>

                <div className="otp-help">
                    <details className="help-details">
                        <summary>Không nhận được mã OTP?</summary>
                        <div className="help-content">
                            <p>• Kiểm tra thư mục spam/junk</p>
                            <p>• Đảm bảo email chính xác</p>
                            <p>• Chờ tối đa 2-3 phút</p>
                            <p>• Thử gửi lại mã OTP</p>
                        </div>
                    </details>
                </div>
            </header>
        </div>
    )
}

export default VerifyOtp