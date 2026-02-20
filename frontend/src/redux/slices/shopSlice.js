import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bannerMix from '../../assets/banner_mix.jpg';
import authShowcase from '../../assets/auth_showcase.jpg';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

// Async Thunks for Coupons
export const fetchCoupons = createAsyncThunk('shop/fetchCoupons', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/coupons`);
        if (!response.ok) throw new Error('Failed to fetch coupons');
        return await response.json();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const addCoupon = createAsyncThunk('shop/addCoupon', async (couponData, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/coupons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create coupon');
        }
        return await response.json();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const updateCoupon = createAsyncThunk('shop/updateCoupon', async ({ id, updates }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/coupons/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update coupon');
        return await response.json();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const deleteCoupon = createAsyncThunk('shop/deleteCoupon', async (id, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete coupon');
        return id;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// Mock Data for Banners (Logic ported from ShopContext)
const defaultBanners = [
    {
        id: 'hero-1',
        section: 'hero',
        title: 'Sale is Live!',
        subtitle: 'Experience the crunch of health with our Premium Selection.',
        image: bannerMix,
        badgeText: 'Republic Day Special',
        ctaText: 'Shop Collections',
        link: '/collections'
    },
    {
        id: 'hero-2',
        section: 'hero',
        title: 'Organic & Pure',
        subtitle: 'Sourced directly from the best farms in Kashmir.',
        image: authShowcase,
        badgeText: '100% Natural',
        ctaText: 'Explore Now',
        link: '/catalog'
    }
    // ... add others if needed or rely on dynamic
];

const initialState = {
    coupons: [],
    banners: JSON.parse(localStorage.getItem('farmlyf_banners')) || defaultBanners,
    loading: false,
    error: null,
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        addBanner: (state, action) => {
            const newBanner = { id: 'bnr-' + Date.now(), ...action.payload };
            state.banners.push(newBanner);
            localStorage.setItem('farmlyf_banners', JSON.stringify(state.banners));
            toast.success('Banner added');
        },
        deleteBanner: (state, action) => {
            state.banners = state.banners.filter(b => b.id !== action.payload);
            localStorage.setItem('farmlyf_banners', JSON.stringify(state.banners));
            toast.success('Banner deleted');
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Coupons
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                if(Array.isArray(action.payload)) state.coupons = action.payload;
            })
            // Add Coupon
            .addCase(addCoupon.fulfilled, (state, action) => {
                state.coupons.unshift(action.payload);
                toast.success('Coupon created successfully!');
            })
            .addCase(addCoupon.rejected, (state, action) => {
                toast.error(`Error creating coupon: ${action.payload}`);
            })
            // Update Coupon
            .addCase(updateCoupon.fulfilled, (state, action) => {
                const index = state.coupons.findIndex(c => c.id === action.payload.id || c._id === action.payload._id);
                if (index !== -1) state.coupons[index] = action.payload;
                toast.success('Coupon updated successfully!');
            })
            // Delete Coupon
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.coupons = state.coupons.filter(c => c.id !== action.payload && c._id !== action.payload);
                toast.success('Coupon deleted successfully!');
            });
    }
});

export const { addBanner, deleteBanner } = shopSlice.actions;

export const selectCoupons = (state) => state.shop.coupons;
export const selectActiveCoupons = (state) => {
    const now = new Date();
    return state.shop.coupons.filter(c => 
        c.active && 
        new Date(c.validUntil) > now && 
        (!c.usageLimit || c.usageCount < c.usageLimit)
    );
};
export const selectBanners = (state) => state.shop.banners;
export const selectBannersBySection = (state, section) => state.shop.banners.filter(b => b.section === section);

export default shopSlice.reducer;
