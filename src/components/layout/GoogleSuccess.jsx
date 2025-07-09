// src/components/layout/GoogleSuccess.jsx
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import { handleGoogleCallback } from '../../store/slices/authSlice.js'
import { ROUTES } from '../../routes/index.js'

function GoogleSuccess() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('🔄 GoogleSuccess component loaded')
        console.log('📍 Current URL:', window.location.href)

        // Get all URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const allParams = Object.fromEntries(urlParams)
        console.log('📋 All URL params:', allParams)

        const token = urlParams.get('token')
        const error = urlParams.get('error')

        console.log('🔍 Extracted params:', {
            token: token ? `${token.substring(0, 30)}...` : 'NULL',
            error: error || 'NULL'
        })

        if (token) {
            console.log('✅ Token found, processing Google callback...')

            // ✅ Xử lý thành công ngay lập tức
            dispatch(handleGoogleCallback(urlParams))
                .unwrap()
                .then((result) => {
                    console.log('✅ Google callback processed successfully:', result)
                    console.log('🏠 Redirecting to home in 1.5s...')

                    setTimeout(() => {
                        console.log('📍 Navigating to:', ROUTES.HOME)
                        navigate({ to: ROUTES.HOME })
                    }, 1500)
                })
                .catch((error) => {
                    console.error('❌ Google callback processing failed:', error)
                    console.log('🔄 Redirecting to auth with error...')
                    navigate({ to: `${ROUTES.AUTH}?error=${encodeURIComponent(error)}` })
                })
        } else if (error) {
            console.error('❌ Error in URL:', error)
            navigate({ to: `${ROUTES.AUTH}?error=${encodeURIComponent(error)}` })
        } else {
            console.error('❌ No token or error found in URL')
            navigate({ to: `${ROUTES.AUTH}?error=no_data` })
        }
    }, [dispatch, navigate])

    return (
        <div className="app-container fade-in">
            <div className="app-header">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-xl font-semibold text-primary">
                        Đang xử lý đăng nhập Google...
                    </h2>
                    <p className="text-gray-400 text-center">
                        Vui lòng đợi trong giây lát
                    </p>
                </div>
            </div>
        </div>
    )
}

export default GoogleSuccess