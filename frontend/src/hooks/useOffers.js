import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const useOffers = () => {
    return useQuery({
        queryKey: ['offers'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/offers`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch offers');
            return res.json();
        }
    });
};

export const useOffer = (id) => {
    return useQuery({
        queryKey: ['offer', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/offers/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch offer');
            return res.json();
        },
        enabled: !!id,
    });
};

export const useOfferBySlug = (slug) => {
    return useQuery({
        queryKey: ['offer', 'slug', slug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/offers/slug/${slug}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch offer');
            return res.json();
        },
        enabled: !!slug,
    });
};

export const useAddOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (offerData) => {
            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData),
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create offer');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            toast.success('Offer created successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useUpdateOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_URL}/offers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update offer');
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['offer', variables.id] });
            toast.success('Offer updated successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useDeleteOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/offers/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete offer');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            toast.success('Offer deleted successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};
