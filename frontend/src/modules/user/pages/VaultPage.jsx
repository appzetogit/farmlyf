
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, ShoppingCart, Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useUserStore from '../../../store/useUserStore';
import useCartStore from '../../../store/useCartStore';
import { useProducts } from '../../../hooks/useProducts';

const VaultPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const { getSaveForLater, removeFromSaved } = useUserStore();
    const { addToCart } = useCartStore();
    const { data: products = [] } = useProducts();

    const savedItems = user ? getSaveForLater(user.id) : [];

    // Helper to find pack
    const getPackById = (packId) => {
         for(let p of products) {
            if(p.id === packId) return p;
            const v = p.variants?.find(v => v.id === packId);
            if(v) return { ...v, product: p };
        }
        return null;
    };

    const handleMoveToCart = (packId) => {
        const pack = getPackById(packId);
        if(pack) {
            addToCart(user?.id, packId, 1);
            removeFromSaved(user?.id, packId);
        }
    };

    const handleRemove = (packId) => {
        removeFromSaved(user?.id, packId);
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <Bookmark size={64} className="text-gray-200 mb-4" />
                <h2 className="text-2xl font-bold text-footerBg mb-2">Your Vault is Locked</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">Login to see your saved treasures and curated collection.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    Login to Unlock
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-6 md:py-10 px-4 md:px-12">
            <div className="container mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 text-footerBg rounded-full hover:bg-footerBg hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-xl md:text-2xl font-black text-footerBg uppercase tracking-tight">Your Reserved Vault</h1>
                </div>

                {savedItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-[32px] p-8 md:p-12 text-center border border-dashed border-gray-200">
                        <Bookmark size={40} className="text-gray-200 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-footerBg mb-1">Your Vault is Empty</h2>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto font-medium">Start saving your favorite picks here.</p>
                        <Link
                            to="/catalog"
                            className="inline-flex items-center gap-2 bg-footerBg text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary transition-all shadow-md"
                        >
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {savedItems.map((item) => {
                            const packData = getPackById(item.packId);
                            if (!packData) return null;

                            const productCardData = packData.product ? {
                                ...packData.product,
                                ...packData,
                                id: packData.product.id
                            } : packData;

                            return (
                                <ProductCard key={item.packId} product={productCardData} />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaultPage;
