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

const getAuthHeaders = () => {
    try {
        const token = localStorage.getItem('farmlyf_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

// Mock Banners Data for now if API not ready, or use local storage logic if that was the plan.
// Previous implementation used localStorage 'farmlyf_banners'.
// We can use a query that reads from localStorage for now to mimic "Server/Persisted" state,
// or better, use a Zustand store if it's purely client-side admin demo.
// However, the prompt asked for "Products -> React Query", implies data fetching.
// I will assume Banners are data.

const API_URL = API_BASE_URL;

const defaultBanners = [
    {
        id: 1,
        title: "Kashmiri Walnuts",
        subtitle: "Direct from the orchards of Pahalgam, 100% natural and generic.",
        image: "https://images.unsplash.com/photo-1574545488652-2a97d6aaa1c2?auto=format&fit=crop&q=80&w=1600",
        badgeText: "PREMIUM HARVEST",
        section: "hero"
    },
    {
        id: 2,
        title: "Winter Superfoods",
        subtitle: "Boost your immunity with our curated mix of nuts, seeds, and berries.",
        image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=1600",
        badgeText: "SEASONAL SPECIAL",
        section: "hero"
    },
     {
        id: 3,
        title: "Gift of Health",
        subtitle: "Premium dry fruit gift boxes for your loved ones.",
        image: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=800&q=80",
        badgeText: "GIFTING",
        section: "promo"
    }
];

export const useBanners = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/banners`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch banners');
            return res.json();
        },
        staleTime: 5 * 60 * 1000
    });
};

export const useAddBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(`${API_URL}/banners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to add banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner added successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useUpdateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner updated successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useDeleteBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner deleted successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

// Helper hook to filter locally
export const useBannersBySection = (section) => {
    const { data: banners = [] } = useBanners();
    return banners.filter(b => (b.section || 'hero') === section && b.isActive !== false);
};

// Generic CRUD Factory for Homepage Sections
const createCRUDHooks = (queryKey, path) => {
    return {
        useData: () => useQuery({
            queryKey: [queryKey],
            queryFn: async () => {
                const res = await fetch(`${API_URL}/${path}`, {
                    credentials: 'include',
                    headers: getAuthHeaders()
                });
                if (!res.ok) throw new Error(`Failed to fetch ${queryKey}`);
                return res.json();
            },
            staleTime: 5 * 60 * 1000
        }),
        useAdd: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: async (data) => {
                    const res = await fetch(`${API_URL}/${path}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error(`Failed to add ${queryKey}`);
                    return res.json();
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [queryKey] });
                    toast.success(`${queryKey} added!`);
                },
                onError: (err) => toast.error(err.message)
            });
        },
        useUpdate: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: async ({ id, data }) => {
                    const res = await fetch(`${API_URL}/${path}/${id || ''}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error(`Failed to update ${queryKey}`);
                    return res.json();
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [queryKey] });
                    toast.success(`${queryKey} updated!`);
                },
                onError: (err) => toast.error(err.message)
            });
        },
        useDelete: () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: async (id) => {
                    const res = await fetch(`${API_URL}/${path}/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error(`Failed to delete ${queryKey}`);
                    return res.json();
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [queryKey] });
                    toast.success(`${queryKey} deleted!`);
                },
                onError: (err) => toast.error(err.message)
            });
        }
    };
};

const announcements = createCRUDHooks('announcements', 'announcements');
export const useAnnouncements = announcements.useData;
export const useAddAnnouncement = announcements.useAdd;
export const useUpdateAnnouncement = announcements.useUpdate;
export const useDeleteAnnouncement = announcements.useDelete;

const featuredSections = createCRUDHooks('featured-sections', 'featured-sections');
export const useFeaturedSections = featuredSections.useData;
export const useAddFeaturedSection = featuredSections.useAdd;
export const useUpdateFeaturedSection = featuredSections.useUpdate;
export const useDeleteFeaturedSection = featuredSections.useDelete;

export const useFeaturedSectionByName = (name) => {
    return useQuery({
        queryKey: ['featured-sections', name],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/featured-sections/${name}`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(`Failed to fetch featured section ${name}`);
            return res.json();
        },
        enabled: !!name,
        staleTime: 5 * 60 * 1000,
    });
};

const trustSignals = createCRUDHooks('trust-signals', 'trust-signals');
export const useTrustSignals = trustSignals.useData;
export const useAddTrustSignal = trustSignals.useAdd;
export const useUpdateTrustSignal = trustSignals.useUpdate;
export const useDeleteTrustSignal = trustSignals.useDelete;

// Migrated About Section to WebsiteContent system
export const useAboutSection = () => {
    return useQuery({
        queryKey: ['about-section'], // Keep queryKey for cache stability if needed, or unify to ['page-content', 'about-us']
        queryFn: async () => {
            const res = await fetch(`${API_URL}/page-content/homepage-about`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(`Failed to fetch homepage-about content`);
            const data = await res.json();
            // Return the nested content object to maintain compatibility with existing components
            return data.content || {};
        },
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};
export const useUpdateAboutSectionInfo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }) => {
            const res = await fetch(`${API_URL}/page-content/homepage-about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to update homepage-about`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['about-section'] });
            queryClient.invalidateQueries({ queryKey: ['page-content', 'about-us'] });
            toast.success(`About section updated!`);
        },
        onError: (err) => toast.error(err.message)
    });
};

const healthBenefits = createCRUDHooks('health-benefits', 'health-benefits');
export const useHealthBenefits = healthBenefits.useData;
export const useUpdateHealthBenefitSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }) => {
            const res = await fetch(`${API_URL}/health-benefits`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to update health-benefits`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-benefits'] });
            toast.success(`Health benefits updated!`);
        },
        onError: (err) => toast.error(err.message)
    });
};

const faqs = createCRUDHooks('faqs', 'faqs');
export const useFAQs = faqs.useData;
export const useAddFAQ = faqs.useAdd;
export const useUpdateFAQ = faqs.useUpdate;
export const useDeleteFAQ = faqs.useDelete;

// Admin Reviews (Testimonials)
export const useAdminReviews = () => {
    return useQuery({
        queryKey: ['admin-reviews'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/reviews/admin/testimonials`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch testimonials');
            return res.json();
        }
    });
};

const adminReviewsFactory = createCRUDHooks('user-reviews-admin', 'reviews/admin');
export const useAllUserReviews = adminReviewsFactory.useData;
export const useAddAdminReview = adminReviewsFactory.useAdd;
export const useUpdateAdminReview = adminReviewsFactory.useUpdate;
export const useDeleteAdminReview = adminReviewsFactory.useDelete;

export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await fetch(`${API_URL}/reviews/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update review status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews-admin'] });
            toast.success('Review status updated!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useFeaturedReviews = () => {
    return useQuery({
        queryKey: ['reviews', 'featured'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/reviews/testimonials`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch testimonials');
            return res.json();
        },
        staleTime: 5 * 60 * 1000
    });
};

const blogs = createCRUDHooks('blogs', 'blogs');
export const useBlogs = blogs.useData;
export const useAddBlog = blogs.useAdd;
export const useUpdateBlog = blogs.useUpdate;
export const useDeleteBlog = blogs.useDelete;

export const useBlogBySlug = (slug) => {
    return useQuery({
        queryKey: ['blogs', 'slug', slug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/blogs/slug/${slug}`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(`Failed to fetch blog for ${slug}`);
            return res.json();
        },
        enabled: !!slug
    });
};

export const useWebsiteContent = (slug) => {
    return useQuery({
        queryKey: ['page-content', slug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/page-content/${slug}`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(`Failed to fetch content for ${slug}`);
            return res.json();
        },
        enabled: !!slug
    });
};

export const useUpdateWebsiteContent = (slug) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(`${API_URL}/page-content/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to update content for ${slug}`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['page-content', slug] });
            toast.success('Page content updated successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};
