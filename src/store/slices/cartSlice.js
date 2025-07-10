import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalQuantity: 0,
        totalAmount: 0
    },
    reducers: {
        addToCart: (state, action) => {
            // Logic thêm sản phẩm vào giỏ hàng
            const newItem = action.payload;
            state.items.push(newItem);
            state.totalQuantity += 1;
        },
        removeFromCart: (state, action) => {
            // Logic xóa sản phẩm khỏi giỏ hàng
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id);
            state.totalQuantity -= 1;
        }
    }
});

export const { addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;