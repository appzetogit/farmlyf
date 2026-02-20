import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Percent, Tag, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const DUMMY_PRODUCTS = [
    {
        id: 101,
        name: 'Premium Kashmiri Saffron',
        category: 'Spices',
        price: 599,
        mrp: 899,
        brand: 'FARMLYF Premium',
        image: 'https://images.unsplash.com/photo-1564417539002-3f1912a520cb?auto=format&fit=crop&q=80&w=400',
        rating: 4.9
    },
    {
        id: 102,
        name: 'Organic Chia Seeds',
        category: 'Seeds',
        price: 249,
        mrp: 349,
        brand: 'FARMLYF Organics',
        image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400',
        rating: 4.5
    },
    {
        id: 103,
        name: 'Cold Pressed Coconut Oil',
        category: 'Oils',
        price: 399,
        mrp: 599,
        brand: 'FARMLYF Oils',
        image: 'https://images.unsplash.com/photo-1585642652174-8b63e8a38a79?auto=format&fit=crop&q=80&w=400',
        rating: 4.7
    },
    {
        id: 104,
        name: 'Raw Forest Honey',
        category: 'Sweeteners',
        price: 450,
        mrp: 650,
        brand: 'FARMLYF Naturals',
        image: 'https://images.unsplash.com/photo-1587049352851-8d4e1613d285?auto=format&fit=crop&q=80&w=400',
        rating: 4.8
    }
];

import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useProducts } from '../../../hooks/useProducts';


const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Zustand Stores
    const { getCart, removeFromCart, updateCartQty, addToCart } = useCartStore();
    const { getSaveForLater, saveForLater, addToSaved: saveForLaterAction, removeFromSaved } = useUserStore();

    // Data Hooks
    const { data: products = [] } = useProducts();


    // Helpers (moved from Context or re-implemented)
    // We need to implement getRecommendations locally or via new hook if complex
    // For now, simple random or dummy
    const getRecommendations = (userId, limit) => {
        if (!products.length) return [];

        // Get unique products by ID first to avoid data duplicates
        const uniqueById = Array.from(new Map(products.map(p => [p._id || p.id, p])).values());

        // Shuffle the unique products
        const shuffled = [...uniqueById].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    };

    // Helper functions for CartPage logic
    const moveToSaveForLater = (userId, packId) => {
        // Find item qty from cart
        const cartItem = getCart(userId).find(i => i.packId === packId);
        if (cartItem) {
            saveForLaterAction(userId, packId, cartItem.qty);
            removeFromCart(userId, packId);
        }
    };

    const moveToCartFromSaved = (userId, packId) => {
        // Find item qty from saved
        const savedItem = saveForLater(userId).find(i => i.packId === packId);
        if (savedItem) {
            addToCart(userId, packId, savedItem.qty);
            removeFromSaved(userId, packId);
        }
    };

    // Legacy helpers to resolve product data
    const getVariantById = (variantId) => {
        // Loop products
        for (let p of products) {
            const v = p.variants?.find(v => v.id === variantId);
            if (v) return { ...v, product: p };
        }
        return null;
    };

    const getPackById = (packId) => {
        // Assuming packs are variants or handled similarly
        return getVariantById(packId);
    };



    const handleAddToCart = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        addToCart(user?.id, item.id);
    };

    const handleBuyNow = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        addToCart(user?.id, item.id);
        navigate('/checkout');
    };

    const cartItems = getCart(user?.id);

    // Enrich cart items with product details
    const enrichedCart = cartItems.map(item => {
        // Try to get variant first
        const variantData = getVariantById(item.packId);
        if (variantData) {
            return {
                ...item,
                id: variantData.id,
                name: variantData.product.name,
                weight: variantData.weight,
                price: variantData.price,
                mrp: variantData.mrp,
                image: variantData.product.image,
                category: variantData.product.category,
                productId: variantData.product.id,
                slug: variantData.product.slug,
                stock: variantData.stock || 0
            };
        }

        // Fallback to legacy pack
        const pack = getPackById(item.packId);
        if (pack) {
            return { ...item, ...pack };
        }
        return null;
    }).filter(Boolean);

    const savedItems = user ? getSaveForLater(user.id) : [];
    const enrichedSaved = savedItems.map(item => {
        const variantData = getVariantById(item.packId);
        if (variantData) {
            return {
                ...item,
                id: variantData.id,
                name: variantData.product.name,
                weight: variantData.weight,
                price: variantData.price,
                mrp: variantData.mrp,
                image: variantData.product.image,
                category: variantData.product.category,
                productId: variantData.product.id,
                slug: variantData.product.slug,
                stock: variantData.stock || 0
            };
        }
        const pack = getPackById(item.packId);
        if (pack) return { ...item, ...pack };
        return null;
    }).filter(Boolean);

    const subtotal = enrichedCart.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0);

    if (enrichedCart.length === 0) {
        return (
            <div className="min-h-[40vh] md:min-h-[60vh] flex flex-col items-center justify-center p-4">
                <ShoppingBag className="w-12 h-12 md:w-20 md:h-20 text-gray-200 mb-4 md:mb-6" />
                <h2 className="text-lg md:text-2xl font-bold text-footerBg mb-2">Your Bag is Empty</h2>
                <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">Add something to your bag and it will show up here.</p>
                <Link to="/catalog" className="bg-primary text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-opacity-90 transition-all">
                    Shop Now
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-3 md:py-12">
            <div className="container mx-auto px-2 md:px-12">
                <div className="flex items-center gap-2 mb-3 md:mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-lg md:text-3xl font-black text-footerBg uppercase tracking-tight">Shopping Bag</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-2 md:space-y-6">
                        {enrichedCart.map((item) => (
                            <div key={item.id} className="bg-white p-2 md:p-6 rounded-lg md:rounded-2xl border border-gray-100 flex gap-2 md:gap-6 shadow-sm group">
                                <div
                                    onClick={() => navigate(`/product/${item.slug || item.productId || item.id}`)}
                                    className="w-16 h-16 md:w-24 md:h-24 rounded-md md:rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer"
                                >
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div
                                            onClick={() => navigate(`/product/${item.slug || item.productId || item.id}`)}
                                            className="cursor-pointer min-w-0"
                                        >
                                            <h3 className="font-bold text-footerBg text-[13px] md:text-lg group-hover:text-primary transition-colors line-clamp-2 pr-1">{item.name}</h3>
                                            <div className="flex gap-1.5 items-center flex-wrap">
                                                <p className="text-gray-400 text-[9px] md:text-sm uppercase tracking-tighter">{item.category}</p>
                                                {item.weight && (
                                                    <span className="text-primary font-black text-[8px] md:text-xs bg-primary/5 px-1.5 py-0.5 rounded">
                                                        {item.weight}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => removeFromCart(user?.id, item.id)}
                                                className="text-gray-200 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 md:mt-4">
                                        <div className="flex items-center border border-gray-100 rounded-md overflow-hidden bg-gray-50/50">
                                            <button
                                                onClick={() => updateCartQty(user?.id, item.id, item.qty - 1)}
                                                className="p-1 md:p-2 hover:bg-white transition-colors"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="w-7 md:w-10 text-center font-bold text-[11px] md:text-base">{item.qty}</span>
                                            <button
                                                onClick={() => {
                                                    const stockLimit = item.stock || 0;
                                                    if (item.qty >= stockLimit) {
                                                        toast.error(`Only ${stockLimit} items available in stock`);
                                                        return;
                                                    }
                                                    updateCartQty(user?.id, item.id, item.qty + 1);
                                                }}
                                                className={`p-1 md:p-2 transition-colors ${item.qty >= (item.stock || 0) ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-white'}`}
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                        {item.stock > 0 && item.stock < 5 && (
                                            <div className="text-[9px] md:text-[11px] font-black text-orange-500 uppercase mt-1">
                                                Only {item.stock} left!
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <div className="text-gray-400 text-[9px] md:text-sm line-through">₹{Math.round(item.price * 1.5) * item.qty}</div>
                                            <div className="text-sm md:text-xl font-black text-footerBg">₹{item.price * item.qty}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-fit sticky top-28">
                        <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-3xl border border-gray-100 shadow-sm space-y-3 md:space-y-6">
                            <h2 className="text-base md:text-xl font-black text-footerBg uppercase tracking-tight">Order Summary</h2>
                            <div className="space-y-2 md:space-y-4 text-[11px] md:text-sm font-medium">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-footerBg">₹{subtotal}</span>
                                </div>

                                <div className="pt-2 md:pt-4 border-t border-gray-100 flex justify-between text-base md:text-xl font-black text-footerBg">
                                    <span>Total Amount</span>
                                    <span>₹{subtotal}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (user) {
                                        navigate('/checkout');
                                    } else {
                                        navigate('/login?redirect=/checkout');
                                    }
                                }}
                                className="w-full bg-footerBg text-white py-2.5 md:py-4 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg active:scale-95"
                            >
                                Secure Checkout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save for Later Section */}
                {enrichedSaved.length > 0 && (
                    <div className="mt-12 border-t border-gray-100 pt-8">
                        <div className="flex items-center gap-2 mb-6 text-center justify-center">
                            <h3 className="text-lg font-black text-footerBg uppercase tracking-tight">Reserved for Later</h3>
                            <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-100">
                                {enrichedSaved.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {enrichedSaved.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-50 flex gap-3 shadow-sm hover:shadow-md transition-all h-full">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h4 className="font-bold text-footerBg text-xs line-clamp-1">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[9px] text-gray-400 font-bold">{item.weight || 'Default'}</p>
                                                <p className="text-primary font-black text-xs">₹{item.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => moveToCartFromSaved(user.id, item.id)}
                                                className="flex-1 text-[9px] font-black text-white bg-footerBg py-1.5 rounded-lg hover:bg-primary transition-all whitespace-nowrap uppercase tracking-widest"
                                            >
                                                Move to Cart
                                            </button>
                                            <button
                                                onClick={() => removeFromSaved(user.id, item.id)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors border border-gray-100 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Section - "You might also like" */}
                {user && (() => {
                    const cartItemIds = new Set(enrichedCart.map(item => item.productId || item.id));
                    const cartItemNames = new Set(enrichedCart.map(item => item.name.toLowerCase()));

                    const allRecs = getRecommendations(user.id, products.length);

                    const uniqueRecs = [];
                    const seenNames = new Set();
                    const seenIds = new Set();

                    for (const p of allRecs) {
                        const id = p._id || p.id;
                        const name = p.name.toLowerCase();

                        if (!cartItemIds.has(id) &&
                            !cartItemNames.has(name) &&
                            !seenIds.has(id) &&
                            !seenNames.has(name)) {
                            uniqueRecs.push(p);
                            seenNames.add(name);
                            seenIds.add(id);
                        }
                        if (uniqueRecs.length >= 4) break;
                    }

                    const displayItems = uniqueRecs.length > 0 ? uniqueRecs : DUMMY_PRODUCTS.slice(0, 4);

                    return (
                        <div className="mt-12 md:mt-20 border-t border-gray-100 pt-10 md:pt-16">
                            <div className="space-y-1 mb-6 md:mb-8 flex items-end justify-between">
                                <div className="text-center md:text-left w-full md:w-auto">
                                    <h3 className="text-lg md:text-xl font-black text-footerBg uppercase tracking-tight">You Might Also Like</h3>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Based on your personality & cart</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-6">
                                {displayItems.map((item) => (
                                    <ProductCard key={item._id || item.id} product={item} />
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default CartPage;
