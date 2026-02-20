import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

// Helper to check if user is authenticated
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

export const useUsers = () => {
    const { getAuthHeaders } = useAuth();
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users`, { 
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};
