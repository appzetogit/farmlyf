import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PACKS, SKUS, PRODUCTS } from '../../mockData/data';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

// Async Thunks
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const [catRes, subRes] = await Promise.all([
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/subcategories`)
        ]);
        
        if (!catRes.ok || !subRes.ok) throw new Error('Failed to fetch categories');
        
        const categories = await catRes.json();
        const subCategories = await subRes.json();
        
        return { categories, subCategories };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const addProduct = createAsyncThunk('products/addProduct', async (productData, { rejectWithValue }) => {
    // Note: In a real app, this would be a POST request
    // For now, we simulate success and return the data
    return productData;
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, updates }, { rejectWithValue }) => {
    // Note: In a real app, this would be a PUT request
    return { id, updates };
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
    // Note: In a real app, this would be a DELETE request
    return id;
});

const initialState = {
    products: PRODUCTS,
    packs: PACKS,
    skus: SKUS,
    categories: [],
    subCategories: [],
    loading: false,
    error: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        // Synchronous actions if needed (e.g., legacy local updates)
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setPacks: (state, action) => {
            state.packs = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload) && action.payload.length > 0) {
                    state.products = action.payload;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(`Error loading products: ${action.payload}`);
            })
            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = Array.isArray(action.payload.categories) ? action.payload.categories : [];
                state.subCategories = Array.isArray(action.payload.subCategories) ? action.payload.subCategories : [];
            })
            // Add Product (Simulated)
            .addCase(addProduct.fulfilled, (state, action) => {
                state.products.unshift(action.payload);
                toast.success('Product added successfully');
            })
            // Update Product (Simulated)
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = { ...state.products[index], ...action.payload.updates };
                    toast.success('Product updated successfully');
                }
            })
            // Delete Product (Simulated)
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
                toast.success('Product deleted successfully');
            });
    },
});

export const { setProducts, setPacks } = productSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectPacks = (state) => state.products.packs;
export const selectCategories = (state) => state.products.categories;
export const selectSubCategories = (state) => state.products.subCategories;
export const selectProductById = (state, productId) => state.products.products.find(p => p.id === productId);

// Helper selector to mimic getPackById context function
export const selectPackById = (state, id) => {
    const pack = state.products.packs.find(p => p.id === id);
    if (pack) return pack;
    // Fallback to variant search
    for (const product of state.products.products) {
        const variant = product.variants?.find(v => v.id === id);
        if (variant) return { ...variant, product };
    }
    return null;
};

export default productSlice.reducer;
