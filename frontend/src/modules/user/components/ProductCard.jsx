import React from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import logo from '../../../assets/logo.png';
import toast from 'react-hot-toast';

const calculatePer100g = (price, quantity, unit, weightStr) => {
    let q = parseFloat(quantity);
    let u = unit ? unit.toLowerCase().trim() : '';

    // Known valid units for manual check
    const validUnits = ['g', 'gm', 'gms', 'kg', 'kgs'];
    const hasValidStructuredData = q && validUnits.includes(u);

    // Fallback parsing from weight string if structured data is effectively missing/invalid
    if (!hasValidStructuredData && weightStr) {
        const match = String(weightStr).match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/);
        if (match) {
            q = parseFloat(match[1]);
            u = match[3].toLowerCase();
        }
    }

    if (!q) return null;

    if (['g', 'gm', 'gms'].includes(u)) {
        return ((price / q) * 100).toFixed(2);
    }
    if (['kg', 'kgs'].includes(u)) {
        return ((price / (q * 1000)) * 100).toFixed(2);
    }

    return null;
};

const ProductCard = ({ product, showVault = true }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, getCart } = useCartStore();
    // const { addToCart, toggleWishlist, isInWishlist } = useShop(); // Removed
    const toggleWishlist = useUserStore(state => state.toggleWishlist);
    const addToSaved = useUserStore(state => state.addToSaved);
    const wishlistMap = useUserStore(state => state.wishlist);
    const savedMap = useUserStore(state => state.saveForLater);
    const userWishlist = user ? (wishlistMap[user.id] || []) : [];
    const userSaved = user ? (savedMap[user.id] || []) : [];

    // Handle products with variants (Flipkart style)
    const hasVariants = product.variants && product.variants.length > 0;

    // Helper to check wishlist
    const itemId = hasVariants ? product.variants[0].id : product.id;
    const isWishlisted = userWishlist.includes(itemId);
    const isSaved = userSaved.some(item => String(item.packId) === String(itemId));

    // Get lowest price for "From ₹X" look
    const displayPrice = hasVariants
        ? Math.min(...product.variants.map(v => v.price))
        : product.price;

    const displayMrp = hasVariants
        ? product.variants.find(v => v.price === displayPrice)?.mrp || product.variants[0].mrp
        : product.mrp;

    const displayDiscount = hasVariants
        ? product.variants.find(v => v.price === displayPrice)?.discount || product.variants[0].discount
        : product.discount;

    const per100gPrice = (() => {
        if (hasVariants) {
            const variant = product.variants.find(v => v.price === displayPrice) || product.variants[0];
            return calculatePer100g(displayPrice, variant.quantity, variant.unit, variant.weight);
        }
        return calculatePer100g(displayPrice, product.quantity, product.unit, product.weight);
    })();

    return (
        <motion.div
            layout
            onClick={() => navigate(`/product/${product.slug || product.id}`)}
            className="group/product relative bg-white border border-gray-100 rounded-[0.7rem] md:rounded-[1rem] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full"
        >
            {/* Image Header - Shorter Aspect Ratio to reduce overall card height */}
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#FDFDFD] p-2 md:p-4 text-center">
                {product.tag && (
                    <div className="absolute top-2 left-0 z-10 md:top-3">
                        <span className="bg-[#B07038] text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-3 md:py-1 rounded-r-lg shadow-sm">
                            {product.tag}
                        </span>
                    </div>
                )}
                {displayMrp > displayPrice && (
                    <div className="absolute top-2 right-2 z-10 md:top-3 md:right-3">
                        <span className="bg-primary text-white text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">
                            {Math.round(((displayMrp - displayPrice) / displayMrp) * 100)}% off
                        </span>
                    </div>
                )}

                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover/product:scale-110"
                />
            </div>

            {/* Content Section - Compact Height */}
            <div className="p-2 md:p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="flex items-center gap-1">
                        <img src={logo} alt="FarmLyf" className="h-2.5 md:h-3.5 w-auto object-contain" />
                        <span className="font-brand font-bold text-[7px] md:text-[10px] uppercase tracking-wide text-footerBg line-clamp-1">
                            PREMIUM
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-footerBg text-white flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] md:text-[9px] font-bold shrink-0">
                            <Star size={9} fill="currentColor" />
                            <span>{product.rating}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                    return navigate('/login');
                                }
                                toggleWishlist(user.id, itemId);
                            }}
                            className="text-gray-300 hover:text-red-500 transition-colors p-0.5 active:scale-95"
                        >
                            <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} className={isWishlisted ? "text-red-500" : ""} />
                        </button>
                    </div>
                </div>

                <h3 className="text-[9px] md:text-[12px] font-bold text-[#4A4A4A] leading-tight mb-0.5 line-clamp-2 h-7 md:h-8">
                    {product.name}
                </h3>

                <div className="mt-auto space-y-2 md:space-y-4">
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] md:text-sm font-black text-footerBg tracking-tight">₹{displayPrice}</span>
                            <span className="text-[9px] md:text-[11px] text-gray-600 line-through">₹{displayMrp}</span>
                            {per100gPrice && (
                                <span className="text-[8px] md:text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                    (₹{per100gPrice}/100g)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const itemId = hasVariants ? product.variants[0].id : product.id;
                                const stockAvailable = hasVariants ? (product.variants[0].stock || 0) : (product.stock?.quantity || 0);

                                if (stockAvailable <= 0) {
                                    toast.error("Item is currently out of stock");
                                    return;
                                }

                                const cartItems = getCart(user?.id);
                                const isInCart = cartItems.some(item => String(item.packId) === String(itemId));

                                if (isInCart) {
                                    navigate('/cart');
                                    return;
                                }

                                addToCart(user?.id, itemId, 1);
                            }}
                            disabled={(hasVariants ? (product.variants[0].stock || 0) : (product.stock?.quantity || 0)) <= 0}
                            className={`w-full py-2 md:py-2.5 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md
                                ${(hasVariants ? (product.variants[0].stock || 0) : (product.stock?.quantity || 0)) <= 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : getCart(user?.id).some(item => String(item.packId) === String(hasVariants ? product.variants[0].id : product.id))
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-footerBg hover:bg-primary text-white'}`}
                        >
                            {(hasVariants ? (product.variants[0].stock || 0) : (product.stock?.quantity || 0)) <= 0
                                ? 'Out of Stock'
                                : getCart(user?.id).some(item => String(item.packId) === String(hasVariants ? product.variants[0].id : product.id))
                                    ? 'Go to Cart'
                                    : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
