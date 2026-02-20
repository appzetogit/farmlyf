import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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

const API_URL = API_BASE_URL + '/referrals';

// Helper function to handle fetch calls
const fetchData = async (url, options = {}) => {
    const token = localStorage.getItem('farmlyf_token');
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

const fetchReferrals = async () => {
    return fetchData(API_URL);
};

const createReferral = async (referralData) => {
    return fetchData(API_URL, {
        method: 'POST',
        body: JSON.stringify(referralData),
    });
};

const updateReferral = async ({ id, ...referralData }) => {
    return fetchData(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(referralData),
    });
};

const deleteReferral = async (id) => {
    return fetchData(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
};

const addPayout = async ({ id, amount }) => {
    return fetchData(`${API_URL}/${id}/payout`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
};

export const useReferrals = () => {
    return useQuery({
        queryKey: ['referrals'],
        queryFn: fetchReferrals,
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};

export const useReferral = (id) => {
    return useQuery({
        queryKey: ['referral', id],
        queryFn: () => fetchData(`${API_URL}/${id}`),
        enabled: !!id,
    });
};

export const useCreateReferral = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createReferral,
        onSuccess: () => {
            queryClient.invalidateQueries(['referrals']);
            // toast.success('Referral created successfully'); // Handled in component
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create referral');
        },
    });
};

export const useUpdateReferral = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateReferral,
        onSuccess: () => {
            queryClient.invalidateQueries(['referrals']);
            // toast.success('Referral updated successfully'); // Handled in component
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update referral');
        },
    });
};

export const useDeleteReferral = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReferral,
        onSuccess: () => {
            queryClient.invalidateQueries(['referrals']);
            toast.success('Referral deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete referral');
        },
    });
};

export const useAddPayout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addPayout,
        onSuccess: () => {
            queryClient.invalidateQueries(['referrals']);
            queryClient.invalidateQueries(['referral']);
            toast.success('Payout added successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add payout');
        },
    });
};

const validateReferralCode = async (code) => {
    return fetchData(`${API_URL}/validate`, {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
};

export const useValidateReferral = () => {
    return useMutation({
        mutationFn: validateReferralCode,
        onError: (error) => {
            // Error handled in component
        },
    });
};

export const useReferralOrders = (id) => {
    return useQuery({
        queryKey: ['referral', id, 'orders'],
        queryFn: () => fetchData(`${API_URL}/${id}/orders`),
        enabled: !!id,
    });
};
