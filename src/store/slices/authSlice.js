// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService.js'

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ userName, password }, { rejectWithValue }) => {
        try {
            const result = await authService.login(userName, password)
            if (result.success) {
                localStorage.setItem('authToken', result.data.token)
                localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                return result.data
            } else {
                return rejectWithValue(result.message)
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ userName, password, email }, { rejectWithValue }) => {
        try {
            const result = await authService.register(userName, password, email)
            if (result.success) {
                return { email, userName, needsVerification: true }
            } else {
                return rejectWithValue(result.message)
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const result = await authService.verifyOtp(email, otp)
            if (result.success) {
                localStorage.setItem('authToken', result.data.token)
                localStorage.setItem('userData', JSON.stringify(result.data.user || result.data))
                return result.data
            } else {
                return rejectWithValue(result.message)
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loginWithGoogle = createAsyncThunk(
    'auth/loginWithGoogle',
    async (_, { rejectWithValue }) => {
        try {
            authService.loginWithGoogle()
            return { redirecting: true }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const handleGoogleCallback = createAsyncThunk(
    'auth/handleGoogleCallback',
    async (urlParams, { rejectWithValue }) => {
        try {
            const result = await authService.handleGoogleCallback(urlParams)
            if (result.success) {
                // Store tokens in localStorage
                localStorage.setItem('authToken', result.data.token)
                localStorage.setItem('userData', JSON.stringify(result.data.user))
                return result.data
            } else {
                return rejectWithValue(result.message)
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


// Initial state
const getInitialAuthState = () => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')

    return {
        user: userData ? JSON.parse(userData) : null,
        token: token,
        isAuthenticated: !!token,
        isLoading: false,
        error: null,
        message: null,
        needsVerification: false,
        registrationEmail: null
    }
}

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuthState(),
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
            state.message = null
            state.needsVerification = false
            state.registrationEmail = null

            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
        },
        clearMessage: (state) => {
            state.message = null
            state.error = null
        },
        clearError: (state) => {
            state.error = null
        },
        setNeedsVerification: (state, action) => {
            state.needsVerification = true
            state.registrationEmail = action.payload.email
        },
        restoreAuth: (state) => {
            const token = localStorage.getItem('authToken')
            const userData = localStorage.getItem('userData')

            if (token && userData) {
                state.token = token
                state.user = JSON.parse(userData)
                state.isAuthenticated = true
            }
        }
    },
    extraReducers: (builder) => {
        // Login cases
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user || action.payload
                state.token = action.payload.token
                state.isAuthenticated = true
                state.message = 'Đăng nhập thành công!'
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })

        // Register cases
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.message = 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'
                state.needsVerification = action.payload.needsVerification
                state.registrationEmail = action.payload.email
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

        // Verify OTP cases
        builder
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user || action.payload
                state.token = action.payload.token
                state.isAuthenticated = true
                state.needsVerification = false
                state.registrationEmail = null
                state.message = 'Xác thực email thành công!'
                state.error = null
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

        // Google Login cases
        builder
            .addCase(loginWithGoogle.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = 'Đang chuyển hướng đến Google...'
            })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.isLoading = false
                state.message = 'Đang chuyển hướng đến Google...'
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            }),
            builder
                .addCase(handleGoogleCallback.pending, (state) => {
                    state.isLoading = true
                    state.error = null
                    state.message = 'Đang xử lý đăng nhập Google...'
                })
                .addCase(handleGoogleCallback.fulfilled, (state, action) => {
                    state.isLoading = false
                    state.user = action.payload.user
                    state.token = action.payload.token
                    state.isAuthenticated = true
                    state.message = 'Đăng nhập Google thành công!'
                    state.error = null
                    state.needsVerification = false
                    state.registrationEmail = null
                })
                .addCase(handleGoogleCallback.rejected, (state, action) => {
                    state.isLoading = false
                    state.error = action.payload
                    state.isAuthenticated = false
                })
    }
})

export const { logout, clearMessage, clearError, setNeedsVerification } = authSlice.actions
export default authSlice.reducer