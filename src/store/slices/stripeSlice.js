import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createPaymentIntent,
    createStripeCheckoutSession,
    confirmPayment,
    getPaymentStatus,
    requestRefund,
    getOrderStatus,
    testPaymentConfig,
    createTestOrder,
    triggerTestWebhook
} from '../../services/stripeService';

// Async thunks for Stripe operations
export const initiatePayment = createAsyncThunk(
    'stripe/initiatePayment',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await createPaymentIntent(orderData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể khởi tạo thanh toán');
        }
    }
);

export const createCheckout = createAsyncThunk(
    'stripe/createCheckout',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await createStripeCheckoutSession(orderData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể tạo phiên thanh toán Stripe');
        }
    }
);

export const processPayment = createAsyncThunk(
    'stripe/processPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await confirmPayment(paymentData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể xác nhận thanh toán');
        }
    }
);

export const checkPaymentStatus = createAsyncThunk(
    'stripe/checkPaymentStatus',
    async (paymentIntentId, { rejectWithValue }) => {
        try {
            const response = await getPaymentStatus(paymentIntentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể kiểm tra trạng thái thanh toán');
        }
    }
);

export const refundPayment = createAsyncThunk(
    'stripe/refundPayment',
    async ({ orderId, refundData }, { rejectWithValue }) => {
        try {
            const response = await requestRefund(orderId, refundData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể hoàn tiền');
        }
    }
);

export const checkOrderStatus = createAsyncThunk(
    'stripe/checkOrderStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await getOrderStatus(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể kiểm tra trạng thái đơn hàng');
        }
    }
);

// Test/Development thunks
export const testStripeConfig = createAsyncThunk(
    'stripe/testConfig',
    async (_, { rejectWithValue }) => {
        try {
            const response = await testPaymentConfig();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể kiểm tra cấu hình thanh toán');
        }
    }
);

export const createStripeTestOrder = createAsyncThunk(
    'stripe/createTestOrder',
    async (_, { rejectWithValue }) => {
        try {
            const response = await createTestOrder();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể tạo đơn hàng test');
        }
    }
);

export const triggerStripeTestWebhook = createAsyncThunk(
    'stripe/triggerTestWebhook',
    async (webhookData, { rejectWithValue }) => {
        try {
            const response = await triggerTestWebhook(webhookData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể kích hoạt test webhook');
        }
    }
);

// Initial state
const initialState = {
    // Payment intent data
    clientSecret: null,
    paymentIntentId: null,

    // Checkout session data
    checkoutUrl: null,
    sessionId: null,

    // Order and payment info
    orderId: null,
    amount: 0,
    currency: 'vnd',
    paymentStatus: null,
    paymentMethod: null,

    // Refund information
    refundId: null,
    refundAmount: 0,
    refundStatus: null,

    // UI state
    loading: false,
    error: null,
    message: '',
    success: false,

    // Test data (only for development)
    testData: null
};

// Create the slice
const stripeSlice = createSlice({
    name: 'stripe',
    initialState,
    reducers: {
        resetStripeState: (state) => {
            return initialState;
        },
        clearStripeError: (state) => {
            state.error = null;
        },
        setPaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // initiatePayment cases
            .addCase(initiatePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initiatePayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.clientSecret = action.payload.data?.clientSecret;
                state.paymentIntentId = action.payload.data?.paymentIntentId;
                state.amount = action.payload.data?.amount;
                state.currency = action.payload.data?.currency || 'vnd';
                state.orderId = action.payload.data?.orderId;
                state.message = 'Đã khởi tạo thanh toán thành công';
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // createCheckout cases
            .addCase(createCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.checkoutUrl = action.payload.data?.url;
                state.sessionId = action.payload.data?.sessionId;
                state.orderId = action.payload.data?.orderId;
                state.message = 'Đã tạo phiên thanh toán thành công';
            })
            .addCase(createCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // processPayment cases
            .addCase(processPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.paymentStatus = action.payload.data?.status;
                state.message = 'Thanh toán đã được xác nhận';
            })
            .addCase(processPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // checkPaymentStatus cases
            .addCase(checkPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentStatus = action.payload.data?.status;
                state.message = `Trạng thái thanh toán: ${action.payload.data?.status}`;
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // refundPayment cases
            .addCase(refundPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refundPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.refundId = action.payload.data?.refundId;
                state.refundAmount = action.payload.data?.amount;
                state.refundStatus = action.payload.data?.status;
                state.message = 'Hoàn tiền thành công';
            })
            .addCase(refundPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // checkOrderStatus cases
            .addCase(checkOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload.data?.orderId;
                state.paymentStatus = action.payload.data?.paymentStatus;
                state.message = `Trạng thái đơn hàng: ${action.payload.data?.status}`;
            })
            .addCase(checkOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error.message;
            })

            // Testing functions
            .addCase(testStripeConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.testData = action.payload.data;
                state.message = 'Kiểm tra cấu hình thanh toán thành công';
            })
            .addCase(createStripeTestOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload.data?.orderId;
                state.message = 'Đã tạo đơn hàng test thành công';
            })
            .addCase(triggerStripeTestWebhook.fulfilled, (state, action) => {
                state.loading = false;
                state.message = 'Đã kích hoạt test webhook thành công';
            });
    },
});

export const { resetStripeState, clearStripeError, setPaymentMethod } = stripeSlice.actions;
export default stripeSlice.reducer;