// src/components/VerifyOtp.jsx
import { useState, useEffect } from 'react'
import { ROUTES } from '../../routes/index.js'
import { authService } from '../../services/authService.js'

function VerifyOtp({ email, onSuccess, onBack }) {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)

    // Handle OTP input change
    const handleOtpChange = (e) => {
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

                if (result.data?.token) {
                    localStorage.setItem('authToken', result.data.token)
                    localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                }

                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess(result)
                    }, 1500)
                } else {
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
            window.history.back()
        }
    }

    // Start cooldown when component mounts
    useEffect(() => {
        startResendCooldown()
    }, [])

    // Get message classes
    const getMessageClass = () => {
        const baseClass = 'message'
        switch (messageType) {
            case 'success': return `${baseClass} message-success`
            case 'error': return `${baseClass} message-error`
            case 'info': return `${baseClass} message-info`
            default: return baseClass
        }
    }

    return (
        <div className="otp-container fade-in">
            <header className="app-header md:max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
                    Xác thực Email
                </h1>

                <div className="otp-info">
                    <p className="mb-2 text-gray-300 text-base">
                        Mã OTP đã được gửi đến:
                    </p>
                    <strong className="otp-email">{email}</strong>
                    <p className="otp-note">
                        Vui lòng kiểm tra hộp thư và thư mục spam
                    </p>
                </div>

                {message && (
                    <div className={getMessageClass()}>
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
                            className="form-input-otp"
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
                        className={`btn-primary w-full ${loading ? 'btn-loading' : ''}`}
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
                        <summary className="help-summary">
                            Không nhận được mã OTP?
                        </summary>
                        <div className="help-content">
                            <p className="help-text">• Kiểm tra thư mục spam/junk</p>
                            <p className="help-text">• Đảm bảo email chính xác</p>
                            <p className="help-text">• Chờ tối đa 2-3 phút</p>
                            <p className="help-text">• Thử gửi lại mã OTP</p>
                        </div>
                    </details>
                </div>
            </header>
        </div>
    )
}

export default VerifyOtp