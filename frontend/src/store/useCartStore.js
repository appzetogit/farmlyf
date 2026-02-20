import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import useUserStore from './useUserStore';

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: {}, // { userId: [{ packId, qty }] }
            appliedCoupons: {}, // { userId: couponData }

            getCart: (userId) => get().cartItems[userId || 'guest'] || [],

            addToCart: (userId, packId, qty = 1) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                const userCart = cart[effectiveId] || [];

                const existingItemIndex = userCart.findIndex(item => String(item.packId) === String(packId));

                if (existingItemIndex > -1) {
                    userCart[existingItemIndex].qty += qty;
                } else {
                    userCart.push({ packId, qty });
                }

                set({ cartItems: { ...cart, [effectiveId]: userCart } });
                toast.success("Item added to cart");
                return true;
            },

            removeFromCart: (userId, packId) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                if (cart[effectiveId]) {
                    const removedItem = cart[effectiveId].find(item => String(item.packId) === String(packId));
                    const updatedUserCart = cart[effectiveId].filter(item => String(item.packId) !== String(packId));
                    set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });

                    const canMoveToVault = Boolean(userId && effectiveId !== 'guest' && removedItem);
                    if (canMoveToVault) {
                        useUserStore.getState().addToSaved(effectiveId, removedItem.packId, removedItem.qty, { silent: true });
                        toast.success("Item moved to Vault");
                    } else {
                        toast.success("Item removed from cart");
                    }
                }
            },

            updateCartQty: (userId, packId, qty) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                if (cart[effectiveId]) {
                    if (qty < 1) {
                        const removedItem = cart[effectiveId].find(item => String(item.packId) === String(packId));
                        const updatedUserCart = cart[effectiveId].filter(item => String(item.packId) !== String(packId));
                        set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });
                        if (userId && effectiveId !== 'guest' && removedItem) {
                            useUserStore.getState().addToSaved(effectiveId, removedItem.packId, removedItem.qty, { silent: true });
                            toast.success("Item moved to Vault");
                        }
                        return;
                    }
                    const updatedUserCart = cart[effectiveId].map(item =>
                        item.packId === packId ? { ...item, qty } : item
                    );
                    set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });
                }
            },

            mergeGuestCartIntoUser: (userId) => {
                if (!userId) return;
                const cart = { ...get().cartItems };
                const guestCart = cart['guest'] || [];
                if (guestCart.length === 0) return;

                const userCart = [...(cart[userId] || [])];

                guestCart.forEach(guestItem => {
                    const existingIndex = userCart.findIndex(i => String(i.packId) === String(guestItem.packId));
                    if (existingIndex > -1) {
                        userCart[existingIndex].qty += guestItem.qty;
                    } else {
                        userCart.push({ ...guestItem });
                    }
                });

                // Clear guest cart and update user cart
                cart['guest'] = [];
                cart[userId] = userCart;
                set({ cartItems: cart });
                toast.success("Guest items added to your cart");
            },

            clearCart: (userId) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                const coupons = get().appliedCoupons;
                set({
                    cartItems: { ...cart, [effectiveId]: [] },
                    appliedCoupons: { ...coupons, [effectiveId]: null }
                });
            },

            applyCoupon: (userId, coupon) => {
                const effectiveId = userId || 'guest';
                const coupons = get().appliedCoupons;
                set({ appliedCoupons: { ...coupons, [effectiveId]: coupon } });
                toast.success(`Coupon ${coupon.code} applied!`);
            },

            removeCoupon: (userId) => {
                const effectiveId = userId || 'guest';
                const coupons = get().appliedCoupons;
                set({ appliedCoupons: { ...coupons, [effectiveId]: null } });
                toast.success("Coupon removed");
            },

            getAppliedCoupon: (userId) => get().appliedCoupons[userId || 'guest'] || null
        }),
        {
            name: 'farmlyf_cart', // unique name
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCartStore;
