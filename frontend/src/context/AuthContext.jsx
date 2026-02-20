import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import useUserStore from '../store/useUserStore';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage immediately to prevent redirect on refresh
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('farmlyf_current_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from storage', error);
            return null;
        }
    });

    // Loading should be false if we already have a user from storage (Optimistic UI)
    const [loading, setLoading] = useState(() => {
        const savedUser = localStorage.getItem('farmlyf_current_user');
        return !savedUser;
    });

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('farmlyf_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    headers: getAuthHeaders(),
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    const updatedUser = { ...data, id: data._id };
                    setUser(updatedUser);
                    localStorage.setItem('farmlyf_current_user', JSON.stringify(updatedUser));
                } else {
                    // Only logout if explicitly unauthorized (401/403)
                    // This prevents logout on temporary 500 errors or network issues
                    if (response.status === 401 || response.status === 403) {
                        setUser(null);
                        localStorage.removeItem('farmlyf_current_user');
                        localStorage.removeItem('farmlyf_token');
                    }
                }
            } catch (error) {
                console.error("Auth status check failed:", error);
                // Do not clear user on network error to allow offline/optimistic usage
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = { ...data, id: data._id };
                setUser(userObj);

                // Store token in localStorage for cross-domain auth
                if (data.token) {
                    localStorage.setItem('farmlyf_token', data.token);
                }

                localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));
                
                // Merge Guest Cart
                try {
                    useCartStore.getState().mergeGuestCartIntoUser(userObj.id);
                } catch (err) {
                    console.error("Cart merge failed:", err);
                }

                toast.success('Logged in successfully!');
                return { success: true };
            } else {
                toast.error(data.message || 'Login failed');
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error('Network error, please try again');
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const sendOtp = async (phone) => {
        try {
            const response = await fetch(`${API_URL}/users/send-otp-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('OTP sent successfully!');
                return { success: true };
            } else {
                toast.error(data.message || 'Failed to send OTP');
                return { success: false, message: data.message || 'Failed to send OTP' };
            }
        } catch (error) {
            console.error("Send OTP Error:", error);
            toast.error('Network error, please try again');
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const verifyOtp = async (phone, otp, name = null, email = null, accountType = 'Individual', gstNumber = null) => {
        try {
            const response = await fetch(`${API_URL}/users/verify-otp-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, name, email, accountType, gstNumber }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isNewUser) {
                    return { success: true, isNewUser: true, phone: data.phone };
                }

                const userObj = { ...data, id: data._id };
                setUser(userObj);

                if (data.token) {
                    localStorage.setItem('farmlyf_token', data.token);
                }

                localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));

                // Merge Guest Cart
                try {
                    useCartStore.getState().mergeGuestCartIntoUser(userObj.id);
                } catch (err) {
                    console.error("Cart merge failed:", err);
                }

                toast.success('Logged in successfully!');
                return { success: true };
            } else {
                toast.error(data.message || 'Verification failed');
                return { success: false, message: data.message || 'Verification failed' };
            }
        } catch (error) {
            console.error("Verify OTP Error:", error);
            toast.error('Network error, please try again');
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = { ...data, id: data._id };
                setUser(userObj);

                // Store token in localStorage for cross-domain auth
                if (data.token) {
                    localStorage.setItem('farmlyf_token', data.token);
                }

                localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));

                // Merge Guest Cart
                try {
                    useCartStore.getState().mergeGuestCartIntoUser(userObj.id);
                } catch (err) {
                    console.error("Cart merge failed:", err);
                }

                toast.success('Account created successfully!');
                return { success: true };
            } else {
                toast.error(data.message || 'Signup failed');
                return { success: false, message: data.message || 'Signup failed' };
            }
        } catch (error) {
            console.error("Signup Error:", error);
            toast.error('Network error, please try again');
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const logout = async () => {
        // Set a flag to indicate manual logout is in progress
        // This prevents redundant "Please login" toasts in protected pages
        sessionStorage.setItem('farmlyf_logout_pending', 'true');

        try {
            await fetch(`${API_URL}/users/logout`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            toast.success('Logged out successfully');
        } catch (error) {
            console.error("Logout error:", error);
            // Even if API fails, logout client-side
            toast.error('Logout failed');
        }

        // Clear Zustand Stores
        if (user) {
            useCartStore.getState().clearCart(user.id);
            useUserStore.getState().clearUserPrefs(user.id);
        }

        setUser(null);
        localStorage.removeItem('farmlyf_current_user');
        localStorage.removeItem('farmlyf_token');
        localStorage.removeItem('farmlyf_wishlist');
        localStorage.removeItem('farmlyf_recently_viewed');
        localStorage.removeItem('farmlyf_save_for_later');

        // Note: farmlyf_logout_pending will be cleared by the protected pages
        // that would otherwise show a login prompt.
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, sendOtp, verifyOtp, getAuthHeaders }}>
            {children}
        </AuthContext.Provider>
    );
};
