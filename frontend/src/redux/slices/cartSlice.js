import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
    cartItems: JSON.parse(localStorage.getItem('farmlyf_cart')) || {}, // { userId: [{ packId, qty }] }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { userId, packId, qty = 1 } = action.payload;
            if (!userId) {
                toast.error("Please login to add to cart");
                return;
            }

            if (!state.cartItems[userId]) state.cartItems[userId] = [];
            
            const existingItem = state.cartItems[userId].find(item => String(item.packId) === String(packId));
            
            if (existingItem) {
                existingItem.qty += qty;
            } else {
                state.cartItems[userId].push({ packId, qty });
            }
            
            // Persist
            localStorage.setItem('farmlyf_cart', JSON.stringify(state.cartItems));
            toast.success("Item added to cart");
        },
        removeFromCart: (state, action) => {
            const { userId, packId } = action.payload;
            if (state.cartItems[userId]) {
                state.cartItems[userId] = state.cartItems[userId].filter(item => item.packId !== packId);
                localStorage.setItem('farmlyf_cart', JSON.stringify(state.cartItems));
                toast.success("Item removed from cart");
            }
        },
        updateCartQty: (state, action) => {
            const { userId, packId, qty } = action.payload;
            if (qty < 1) {
                // Remove logic if qty < 1
                if (state.cartItems[userId]) {
                     state.cartItems[userId] = state.cartItems[userId].filter(item => item.packId !== packId);
                     localStorage.setItem('farmlyf_cart', JSON.stringify(state.cartItems));
                }
                return;
            }

            const item = state.cartItems[userId]?.find(i => i.packId === packId);
            if (item) {
                item.qty = qty;
                localStorage.setItem('farmlyf_cart', JSON.stringify(state.cartItems));
            }
        },
        clearCart: (state, action) => {
            const { userId } = action.payload;
            if (state.cartItems[userId]) {
                state.cartItems[userId] = [];
                localStorage.setItem('farmlyf_cart', JSON.stringify(state.cartItems));
            }
        }
    }
});

export const { addToCart, removeFromCart, updateCartQty, clearCart } = cartSlice.actions;

export const selectCartItems = (state, userId) => state.cart.cartItems[userId] || [];

export default cartSlice.reducer;
