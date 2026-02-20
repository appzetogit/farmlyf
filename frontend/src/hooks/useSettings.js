import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = `${API_BASE_URL}/settings`;

export const useSetting = (key) => {
    return useQuery({
        queryKey: ['setting', key],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/${key}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch setting');
            return res.json();
        }
    });
};

export const useUpdateSetting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ key, value }) => {
            const res = await fetch(`${API_URL}/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update setting');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['setting', data.key]);
            toast.success('Setting updated successfully!');
        },
        onError: () => toast.error('Failed to update setting')
    });
};
