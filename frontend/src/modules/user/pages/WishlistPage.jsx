import useUserStore from '../../../store/useUserStore';
import { useProducts } from '../../../hooks/useProducts';
import { useAuth } from '../../../context/AuthContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Stores
    const wishlistMap = useUserStore(state => state.wishlist);
    const wishlistIds = user ? (wishlistMap[user.id] || []) : [];

    // Data
    const { data: products = [] } = useProducts();

    const wishlistItems = wishlistIds.map(id => {
        // Find product by its ID OR by checking if it contains a variant with that ID
        return products.find(p =>
            p.id === id ||
            (p.variants && p.variants.some(v => v.id === id))
        );
    })
        .filter(Boolean)
        // Remove duplicates (in case mixed IDs point to same product)
        .filter((product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        );

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <Heart size={60} className="text-gray-200 mb-4" />
                <h2 className="text-xl font-bold text-footerBg mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-500 text-sm mb-6 text-center">Save items you love here for later.</p>
                <Link to="/catalog" className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-sm hover:bg-opacity-90 transition-all shadow-md">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">Wishlist</h1>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Your Favorite Treasures</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default WishlistPage;
