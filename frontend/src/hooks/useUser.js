import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const useUserProfile = () => {
    const { getAuthHeaders } = useAuth();
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users/profile`, { 
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        enabled: !!localStorage.getItem('farmlyf_token')
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: async (userData) => {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile']);
            toast.success('Profile updated successfully!');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};
