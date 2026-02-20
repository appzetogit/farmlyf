import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (userId, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/orders`);
        // Note: Real backend should filter by user, but here we fetch all and filter client side 
        // to match previous Context logic, or we can improve it. 
        // Context logic: fetched all and filtered.
        const allOrders = await response.json();
        // Return all orders map or array. Context kept a map { userId: [] }.
        // Let's stick to returning raw data and processing in reducer or component.
        return allOrders;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const initialState = {
    orders: JSON.parse(localStorage.getItem('farmlyf_orders')) || {}, // { userId: [orders] }
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        placeOrder: (state, action) => {
            const { userId, orderData } = action.payload;
            if (!state.orders[userId]) state.orders[userId] = [];
            
            const orderDate = new Date();
            const estimatedDeliveryDate = new Date(orderDate);
            estimatedDeliveryDate.setDate(orderDate.getDate() + 3);

            const newOrder = {
                id: 'ORD-' + Date.now() + Math.floor(Math.random() * 1000),
                date: orderDate.toISOString(),
                status: 'Processing',
                trackingId: 'TRK-FML-' + Math.floor(Math.random() * 1000000000),
                deliveryStatus: 'Processing',
                statusHistory: [{
                    status: 'Processing',
                    timestamp: orderDate.toISOString(),
                    info: 'Order placed'
                }],
                estimatedDelivery: estimatedDeliveryDate.toISOString(),
                deliveredDate: null,
                courierPartner: 'FarmLyf Express',
                ...orderData
            };

            state.orders[userId].unshift(newOrder);
            localStorage.setItem('farmlyf_orders', JSON.stringify(state.orders));
            toast.success('Order placed successfully!');
            return; // Context returned ID, we can't easily return from reducer but can use callback or selector
        },
        updateOrderStatus: (state, action) => {
            const { userId, orderId, newStatus, info } = action.payload;
             if (state.orders[userId]) {
                const orderIndex = state.orders[userId].findIndex(o => o.id === orderId);
                if (orderIndex > -1) {
                    const order = state.orders[userId][orderIndex];
                    order.status = newStatus;
                    order.deliveryStatus = newStatus;
                     const newStatusEntry = {
                        status: newStatus,
                        timestamp: new Date().toISOString(),
                        info: info || `Status updated to ${newStatus}`
                    };
                    order.statusHistory.push(newStatusEntry);
                    if (newStatus === 'Delivered' && !order.deliveredDate) {
                        order.deliveredDate = newStatusEntry.timestamp;
                    }
                    localStorage.setItem('farmlyf_orders', JSON.stringify(state.orders));
                    toast.success(`Order updated to ${newStatus}`);
                }
             }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrders.fulfilled, (state, action) => {
            // Re-organize flat array to map if backend returns array
            if (Array.isArray(action.payload)) {
                const ordersMap = {};
                action.payload.forEach(order => {
                    if (!ordersMap[order.userId]) ordersMap[order.userId] = [];
                    ordersMap[order.userId].push(order);
                });
                state.orders = ordersMap;
            }
        });
    }
});

export const { placeOrder, updateOrderStatus } = orderSlice.actions;

export const selectOrders = (state, userId) => state.orders.orders[userId] || [];
export const selectOrderById = (state, userId, orderId) => 
    state.orders.orders[userId]?.find(o => o.id === orderId);

export default orderSlice.reducer;
