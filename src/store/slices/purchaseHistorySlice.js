import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { purchaseHistoryService } from '../../services/purchaseHistoryService.js';
import { logout } from './authSlice';

// Async thunks for purchase history operations
export const fetchPurchaseHistory = createAsyncThunk(
    'purchaseHistory/fetchPurchaseHistory',
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const response = await purchaseHistoryService.getPurchaseHistory(page, limit);
            console.log('Redux - Fetching purchase history response:', response);
            return response.data; // Return the data object with orders, pagination info
        } catch (error) {
            console.error('Redux - Fetch purchase history error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderDetails = createAsyncThunk(
    'purchaseHistory/fetchOrderDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            console.log('Redux - Fetching order details:', orderId);
            const response = await purchaseHistoryService.getOrderDetails(orderId);
            console.log('Redux - Fetch order details response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Fetch order details error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const createOrder = createAsyncThunk(
    'purchaseHistory/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            console.log('Redux - Creating order:', orderData);
            const response = await purchaseHistoryService.createOrder(orderData);
            console.log('Redux - Create order response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Create order error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'purchaseHistory/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            console.log('Redux - Cancelling order:', orderId);
            const response = await purchaseHistoryService.cancelOrder(orderId);
            console.log('Redux - Cancel order response:', response);
            return { orderId, result: response.data };
        } catch (error) {
            console.error('Redux - Cancel order error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const createStripePayment = createAsyncThunk(
    'purchaseHistory/createStripePayment',
    async (orderData, { rejectWithValue }) => {
        try {
            console.log('Redux - Creating Stripe payment:', orderData);
            const response = await purchaseHistoryService.createStripePayment(orderData);
            console.log('Redux - Create Stripe payment response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Create Stripe payment error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const checkPaymentStatus = createAsyncThunk(
    'purchaseHistory/checkPaymentStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            console.log('Redux - Checking payment status:', orderId);
            const response = await purchaseHistoryService.checkPaymentStatus(orderId);
            console.log('Redux - Check payment status response:', response);
            return { orderId, result: response.data };
        } catch (error) {
            console.error('Redux - Check payment status error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    orders: [], // Array of orders
    orderDetails: null, // Currently selected order details
    currentOrderId: null, // ID of currently selected order
    stripeSessionUrl: null, // URL for Stripe checkout session
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    },
    loading: false,
    orderDetailsLoading: false,
    error: null,
    orderDetailsError: null,
    // Action-specific loading states
    creatingOrder: false,
    cancellingOrder: {},
    creatingStripePayment: false,
    checkingPaymentStatus: {},
    // Success states
    orderCreated: false,
    stripePaymentCreated: false
};

// Purchase history slice
const purchaseHistorySlice = createSlice({
    name: 'purchaseHistory',
    initialState,
    reducers: {
        // Clear error
        clearPurchaseHistoryError: (state) => {
            state.error = null;
            state.orderDetailsError = null;
        },
        // Reset purchase history state (on logout)
        resetPurchaseHistory: (state) => {
            return initialState;
        },
        // Clear order created flag
        clearOrderCreated: (state) => {
            state.orderCreated = false;
        },
        // Clear stripe payment created flag
        clearStripePaymentCreated: (state) => {
            state.stripePaymentCreated = false;
            state.stripeSessionUrl = null;
        },
        // Set current order ID
        setCurrentOrderId: (state, action) => {
            state.currentOrderId = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Purchase History
            .addCase(fetchPurchaseHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseHistory.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload;

                state.orders = data.orders || [];
                state.pagination = data.pagination || initialState.pagination;

                console.log('Redux - Purchase history fetched successfully:', {
                    ordersCount: state.orders.length,
                    pagination: state.pagination
                });
            })
            .addCase(fetchPurchaseHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch purchase history';
                console.error('Redux - Fetch purchase history failed:', action.payload);
            })

            // Fetch Order Details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.orderDetailsLoading = true;
                state.orderDetailsError = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.orderDetailsLoading = false;
                state.orderDetails = action.payload;
                state.currentOrderId = action.payload.orderId || action.payload._id;

                console.log('Redux - Order details fetched successfully:', {
                    orderId: state.currentOrderId
                });
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.orderDetailsLoading = false;
                state.orderDetailsError = action.payload || 'Failed to fetch order details';
                console.error('Redux - Fetch order details failed:', action.payload);
            })

            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.creatingOrder = true;
                state.error = null;
                state.orderCreated = false;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.creatingOrder = false;
                state.orderCreated = true;

                // Add new order to the beginning of the orders array
                if (action.payload) {
                    state.orders = [action.payload, ...state.orders];
                    state.currentOrderId = action.payload.orderId || action.payload._id;
                    state.orderDetails = action.payload;

                    // Update pagination if needed
                    if (state.pagination.total) {
                        state.pagination.total += 1;
                    }
                }

                console.log('Redux - Order created successfully:', action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.creatingOrder = false;
                state.error = action.payload || 'Failed to create order';
                state.orderCreated = false;
                console.error('Redux - Create order failed:', action.payload);
            })

            // Cancel Order
            .addCase(cancelOrder.pending, (state, action) => {
                const orderId = action.meta.arg;
                state.cancellingOrder[orderId] = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const { orderId } = action.payload;
                state.cancellingOrder[orderId] = false;

                // Update the order in the list
                const orderIndex = state.orders.findIndex(order =>
                    order.orderId === orderId || order._id === orderId
                );

                if (orderIndex !== -1) {
                    state.orders[orderIndex].orderStatus = 'cancelled';

                    // If this is the currently selected order, update order details too
                    if (state.currentOrderId === orderId) {
                        state.orderDetails = {
                            ...state.orderDetails,
                            orderStatus: 'cancelled'
                        };
                    }
                }

                console.log('Redux - Order cancelled successfully:', orderId);
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                const orderId = action.meta.arg;
                state.cancellingOrder[orderId] = false;
                state.error = action.payload || 'Failed to cancel order';
                console.error('Redux - Cancel order failed:', action.payload);
            })

            // Create Stripe Payment
            .addCase(createStripePayment.pending, (state) => {
                state.creatingStripePayment = true;
                state.error = null;
                state.stripePaymentCreated = false;
                state.stripeSessionUrl = null;
            })
            .addCase(createStripePayment.fulfilled, (state, action) => {
                state.creatingStripePayment = false;
                state.stripePaymentCreated = true;

                // Store Stripe checkout URL
                if (action.payload && action.payload.url) {
                    state.stripeSessionUrl = action.payload.url;
                }

                console.log('Redux - Stripe payment created successfully');
            })
            .addCase(createStripePayment.rejected, (state, action) => {
                state.creatingStripePayment = false;
                state.error = action.payload || 'Failed to create Stripe payment';
                state.stripePaymentCreated = false;
                console.error('Redux - Create Stripe payment failed:', action.payload);
            })

            // Check Payment Status
            .addCase(checkPaymentStatus.pending, (state, action) => {
                const orderId = action.meta.arg;
                state.checkingPaymentStatus[orderId] = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state, action) => {
                const { orderId, result } = action.payload;
                state.checkingPaymentStatus[orderId] = false;

                // Update the order payment status
                const orderIndex = state.orders.findIndex(order =>
                    order.orderId === orderId || order._id === orderId
                );

                if (orderIndex !== -1 && result) {
                    state.orders[orderIndex].paymentStatus = result.paymentStatus;

                    // If this is the currently selected order, update order details too
                    if (state.currentOrderId === orderId) {
                        state.orderDetails = {
                            ...state.orderDetails,
                            paymentStatus: result.paymentStatus
                        };
                    }
                }

                console.log('Redux - Payment status checked successfully:', orderId);
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                const orderId = action.meta.arg;
                state.checkingPaymentStatus[orderId] = false;
                state.error = action.payload || 'Failed to check payment status';
                console.error('Redux - Check payment status failed:', action.payload);
            })

            // Handle logout
            .addCase(logout, (state) => {
                return initialState;
            });
    }
});

// Export actions
export const {
    clearPurchaseHistoryError,
    resetPurchaseHistory,
    clearOrderCreated,
    clearStripePaymentCreated,
    setCurrentOrderId
} = purchaseHistorySlice.actions;

// Selectors
export const selectPurchaseHistory = (state) => state.purchaseHistory;
export const selectOrders = (state) => state.purchaseHistory.orders;
export const selectOrderDetails = (state) => state.purchaseHistory.orderDetails;
export const selectCurrentOrderId = (state) => state.purchaseHistory.currentOrderId;
export const selectStripeSessionUrl = (state) => state.purchaseHistory.stripeSessionUrl;
export const selectPurchaseHistoryLoading = (state) => state.purchaseHistory.loading;
export const selectOrderDetailsLoading = (state) => state.purchaseHistory.orderDetailsLoading;
export const selectPurchaseHistoryError = (state) => state.purchaseHistory.error;
export const selectOrderDetailsError = (state) => state.purchaseHistory.orderDetailsError;
export const selectPurchaseHistoryPagination = (state) => state.purchaseHistory.pagination;

// Loading state selectors
export const selectCreatingOrder = (state) => state.purchaseHistory.creatingOrder;
export const selectCancellingOrder = (state, orderId) =>
    state.purchaseHistory.cancellingOrder[orderId] || false;
export const selectCreatingStripePayment = (state) => state.purchaseHistory.creatingStripePayment;
export const selectCheckingPaymentStatus = (state, orderId) =>
    state.purchaseHistory.checkingPaymentStatus[orderId] || false;

// Success state selectors
export const selectOrderCreated = (state) => state.purchaseHistory.orderCreated;
export const selectStripePaymentCreated = (state) => state.purchaseHistory.stripePaymentCreated;

// Utility selectors
export const selectOrderById = (state, orderId) =>
    state.purchaseHistory.orders.find(order =>
        order.orderId === orderId || order._id === orderId
    );

export const selectOrderStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'text-yellow-400';
        case 'processing':
            return 'text-blue-400';
        case 'confirmed':
            return 'text-green-400';
        case 'shipped':
            return 'text-blue-500';
        case 'delivered':
            return 'text-green-500';
        case 'cancelled':
            return 'text-red-400';
        default:
            return 'text-gray-400';
    }
};

export const selectPaymentStatusColor = (status) => {
    switch (status) {
        case 'paid':
            return 'text-green-400';
        case 'pending':
            return 'text-yellow-400';
        case 'failed':
            return 'text-red-400';
        case 'refunded':
            return 'text-purple-400';
        default:
            return 'text-gray-400';
    }
};

export default purchaseHistorySlice.reducer;