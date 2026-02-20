import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useUserStore = create(
    persist(
        (set, get) => ({
            wishlist: {}, // { userId: [packId] }
            recentlyViewed: {}, // { userId: [productId] }
            saveForLater: {}, // { userId: [{ packId, qty }] }
            notifications: {}, // { userId: [{ id, title, body, createdAt, read, data }] }

            getWishlist: (userId) => get().wishlist[userId] || [],
            getSaveForLater: (userId) => get().saveForLater[userId] || [],
            getRecentlyViewed: (userId) => get().recentlyViewed[userId] || [], // Returns IDs
            getNotifications: (userId) => get().notifications[userId] || [],

            toggleWishlist: (userId, packId) => {
                if (!userId) {
                    toast.error("Please login to manage wishlist");
                    return;
                }
                const allWishlists = get().wishlist;
                let userWishlist = allWishlists[userId] || [];
                
                if (userWishlist.includes(packId)) {
                    userWishlist = userWishlist.filter(id => id !== packId);
                    toast.success("Removed from wishlist");
                } else {
                    userWishlist.push(packId);
                    toast.success("Added to wishlist");
                }
                set({ wishlist: { ...allWishlists, [userId]: userWishlist } });
            },

            addToRecentlyViewed: (userId, productId) => {
                if (!userId) return;
                const allRecent = get().recentlyViewed;
                let userRecent = allRecent[userId] || [];
                
                userRecent = userRecent.filter(id => id !== productId);
                userRecent.unshift(productId);
                userRecent = userRecent.slice(0, 12);
                
                set({ recentlyViewed: { ...allRecent, [userId]: userRecent } });
            },

            addToSaved: (userId, packId, qty = 1, options = {}) => {
                if (!userId) {
                    toast.error("Please login to save items");
                    return;
                }
                const allSaved = get().saveForLater;
                const userSaved = [...(allSaved[userId] || [])];
                const existingIndex = userSaved.findIndex(i => String(i.packId) === String(packId));

                if (existingIndex > -1) {
                    userSaved[existingIndex] = {
                        ...userSaved[existingIndex],
                        qty: Number(userSaved[existingIndex].qty || 0) + Number(qty || 1)
                    };
                    set({ saveForLater: { ...allSaved, [userId]: userSaved } });
                    if (!options?.silent) {
                        toast.success("Updated in vault");
                    }
                } else {
                    userSaved.push({ packId, qty });
                    set({ saveForLater: { ...allSaved, [userId]: userSaved } });
                    if (!options?.silent) {
                        toast.success("Saved for later");
                    }
                }
            },

            removeFromSaved: (userId, packId) => {
                const allSaved = get().saveForLater;
                if (allSaved[userId]) {
                    const userSaved = allSaved[userId].filter(item => item.packId !== packId);
                    set({ saveForLater: { ...allSaved, [userId]: userSaved } });
                }
            },

            addNotification: (userId, notification) => {
                if (!userId) return;
                const allNotifications = get().notifications;
                const userNotifications = allNotifications[userId] || [];
                const normalized = {
                    id: notification?.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    title: notification?.title || 'New Notification',
                    body: notification?.body || '',
                    createdAt: notification?.createdAt || new Date().toISOString(),
                    read: false,
                    data: notification?.data || {}
                };
                const nextNotifications = [normalized, ...userNotifications].slice(0, 100);
                set({ notifications: { ...allNotifications, [userId]: nextNotifications } });
            },

            markAllNotificationsRead: (userId) => {
                if (!userId) return;
                const allNotifications = get().notifications;
                const userNotifications = allNotifications[userId] || [];
                const next = userNotifications.map((item) => ({ ...item, read: true }));
                set({ notifications: { ...allNotifications, [userId]: next } });
            },

            clearNotifications: (userId) => {
                if (!userId) return;
                const allNotifications = get().notifications;
                set({ notifications: { ...allNotifications, [userId]: [] } });
            },

            clearUserPrefs: (userId) => {
                const allWishlist = get().wishlist;
                const allRecent = get().recentlyViewed;
                const allSaved = get().saveForLater;

                set({
                    wishlist: { ...allWishlist, [userId]: [] },
                    recentlyViewed: { ...allRecent, [userId]: [] },
                    saveForLater: { ...allSaved, [userId]: [] },
                    notifications: { ...get().notifications, [userId]: [] }
                });
            },
            
            // Helper to move from saved to cart (Logic partially here, component usually bridges)
            // But we can just have a function to remove it, and component calls cartStore.add
            // Or we keep it simple.
        }),
        {
            name: 'farmlyf_user_prefs', 
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                wishlist: state.wishlist, 
                recentlyViewed: state.recentlyViewed,
                saveForLater: state.saveForLater,
                notifications: state.notifications
            }), // Only persist these
            // Note: We are migrating from keys 'farmlyf_wishlist', 'farmlyf_save_for_later' etc.
            // Zustand persist uses one key for the whole store object usually.
            // If we want to keep backward compatibility with specific keys, we might need custom storage or migration.
            // For now, we will start fresh with 'farmlyf_user_prefs' or manually load old keys in `onRehydrate` if needed.
            // Let's stick to standard behavior for simplicity, assuming data migration isn't critical for this refactor demo.
        }
    )
);

// Initialization logic to migrate old data if needed could go here
// But simplest is to respect the new key.

export default useUserStore;
