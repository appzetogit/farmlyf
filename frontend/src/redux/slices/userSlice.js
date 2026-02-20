import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

const initialState = {
    wishlist: JSON.parse(localStorage.getItem('farmlyf_wishlist')) || {}, // { userId: [packIds] }
    recentlyViewed: JSON.parse(localStorage.getItem('farmlyf_recently_viewed')) || {}, // { userId: [productIds] }
    saveForLater: JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {}, // { userId: [{ packId, qty }] }
    returns: JSON.parse(localStorage.getItem('farmlyf_returns')) || {}, // { userId: [returnObj] }
    loading: false,
    error: null,
};

export const fetchReturns = createAsyncThunk('user/fetchReturns', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/returns`);
        if (!response.ok) throw new Error('Failed to fetch returns');
        return await response.json();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // --- Wishlist ---
        toggleWishlist: (state, action) => {
            const { userId, packId } = action.payload;
            if (!userId) {
                toast.error("Please login to manage wishlist");
                return;
            }
            if (!state.wishlist[userId]) state.wishlist[userId] = [];
            
            if (state.wishlist[userId].includes(packId)) {
                state.wishlist[userId] = state.wishlist[userId].filter(id => id !== packId);
                toast.success("Removed from wishlist");
            } else {
                state.wishlist[userId].push(packId);
                toast.success("Added to wishlist");
            }
            localStorage.setItem('farmlyf_wishlist', JSON.stringify(state.wishlist));
        },

        // --- Recently Viewed ---
        addToRecentlyViewed: (state, action) => {
            const { userId, productId } = action.payload;
            if (!userId) return;
            if (!state.recentlyViewed[userId]) state.recentlyViewed[userId] = [];

            // Remove if exists, add to top
            let userRecent = state.recentlyViewed[userId].filter(id => id !== productId);
            userRecent.unshift(productId);
            // Limit to 12
            userRecent = userRecent.slice(0, 12);

            state.recentlyViewed[userId] = userRecent;
            localStorage.setItem('farmlyf_recently_viewed', JSON.stringify(state.recentlyViewed));
        },

        // --- Save For Later ---
        addToSaved: (state, action) => {
            const { userId, packId, qty = 1 } = action.payload;
            if (!userId) {
                toast.error("Please login to save items");
                return;
            }
            if (!state.saveForLater[userId]) state.saveForLater[userId] = [];

            if (!state.saveForLater[userId].find(i => String(i.packId) === String(packId))) {
                state.saveForLater[userId].push({ packId, qty });
                localStorage.setItem('farmlyf_save_for_later', JSON.stringify(state.saveForLater));
                toast.success("Saved for later");
            }
        },
        removeFromSaved: (state, action) => {
             const { userId, packId } = action.payload;
             if (state.saveForLater[userId]) {
                 state.saveForLater[userId] = state.saveForLater[userId].filter(item => item.packId !== packId);
                 localStorage.setItem('farmlyf_save_for_later', JSON.stringify(state.saveForLater));
             }
        },
        moveToCartFromSaved: (state, action) => {
            // Note: This needs dispatching addToCart as well, usually handled in component or thunk.
            // But we can handle the removal part here.
            // Ideally, component dispatches `addToCart` AND `removeFromSaved`.
             const { userId, packId } = action.payload;
             // Logic handled by separate actions in component usually, but keeping simple reducer for removal
             if (state.saveForLater[userId]) {
                 state.saveForLater[userId] = state.saveForLater[userId].filter(item => item.packId !== packId);
                 localStorage.setItem('farmlyf_save_for_later', JSON.stringify(state.saveForLater));
             }
        },

        // --- Returns ---
        createReturnRequest: (state, action) => {
            const { userId, returnData } = action.payload;
             if (!state.returns[userId]) state.returns[userId] = [];

            const newReturn = {
                id: 'RET-' + Date.now() + Math.floor(Math.random() * 1000),
                requestDate: new Date().toISOString(),
                status: 'Pending',
                statusHistory: [{
                    status: 'Pending',
                    timestamp: new Date().toISOString(),
                    info: 'Return request received'
                }],
                ...returnData
            };

            state.returns[userId].unshift(newReturn);
            localStorage.setItem('farmlyf_returns', JSON.stringify(state.returns));
            toast.success("Return request submitted");
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchReturns.fulfilled, (state, action) => {
             // Sync if needed, or just rely on local storage for now as backend sync approach
             // Replicating Context logic of fetching all and filtering
             if (Array.isArray(action.payload)) {
                 const returnsMap = {};
                 action.payload.forEach(ret => {
                     if (!returnsMap[ret.userId]) returnsMap[ret.userId] = [];
                     returnsMap[ret.userId].push(ret);
                 });
                 state.returns = returnsMap;
             }
        });
    }
});

export const { toggleWishlist, addToRecentlyViewed, addToSaved, removeFromSaved, createReturnRequest } = userSlice.actions;

export const selectWishlist = (state, userId) => state.user.wishlist[userId] || [];
export const selectRecentlyViewed = (state, userId) => state.user.recentlyViewed[userId] || [];
export const selectSaveForLater = (state, userId) => state.user.saveForLater[userId] || [];
export const selectReturns = (state, userId) => state.user.returns[userId] || [];

export default userSlice.reducer;
