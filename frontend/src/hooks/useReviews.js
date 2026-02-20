import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

// Note: isAuthenticated is used for query enabling, keeping it for now but could also use useAuth() logic
const isAuthenticated = () => {
    try {
        const user = localStorage.getItem('farmlyf_current_user');
        const token = localStorage.getItem('farmlyf_token');
        return !!(user && token);
    } catch {
        return false;
    }
};

const API_URL = API_BASE_URL;

// Admin Reviews (Control List)
export const useAdminReviews = () => {
    const { getAuthHeaders } = useAuth();
    return useQuery({
        queryKey: ['admin-reviews'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/reviews/admin`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch admin reviews');
            return res.json();
        },
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};

// User Reviews (Pure user-submitted reviews)
export const useUserReviews = () => {
    const { getAuthHeaders } = useAuth();
    return useQuery({
        queryKey: ['user-reviews'],
        queryFn: async () => {
            // Assuming endpoint for all reviews filtered by role or similar if needed
            // For now, using same as admin but filtered or a specific "user" endpoint if available
            const res = await fetch(`${API_URL}/reviews`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch user reviews');
            return res.json();
        },
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};

export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await fetch(`${API_URL}/reviews/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Status updated');
        }
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete review');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Review deleted');
        }
    });
};
export const useAddAdminReview = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(`${API_URL}/reviews/admin`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add admin review');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Admin review added successfully');
        }
    });
};
