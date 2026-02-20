import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import useCartStore from '../../../store/useCartStore';
import { useAuth } from '../../../context/AuthContext';

const BottomNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Correctly accessing the cartItems map from the store
    const cartItemsMap = useCartStore(state => state.cartItems);

    // safe access to user's cart
    const userCart = cartItemsMap[user?.id || 'guest'] || [];
    const cartCount = userCart.length;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000]">
            {/* The SVG Filter for the Gooey/Notch effect (Advanced) - simplified to standard rounded bar for stability */}
            <div className="bg-black text-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.15)] flex justify-around items-end h-[65px] pb-2 px-2 relative">

                {/* Active Indicator Slide - Optional, for now just static dots */}

                {/* Home */}
                <Link
                    to="/"
                    className="flex flex-col items-center justify-end h-full flex-1 gap-1 pb-1 relative group"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Home size={22} className={isActive('/') ? 'text-white' : 'text-gray-400'} strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive('/') ? 'text-white' : 'text-gray-500'}`}>HOME</span>
                </Link>

                {/* Shop */}
                <Link
                    to="/catalog"
                    className="flex flex-col items-center justify-end h-full flex-1 gap-1 pb-1 relative"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Grid size={22} className={isActive('/catalog') ? 'text-white' : 'text-gray-400'} strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive('/catalog') ? 'text-white' : 'text-gray-500'}`}>SHOP</span>
                </Link>

                {/* Cart */}
                <Link
                    to="/cart"
                    className="flex flex-col items-center justify-end h-full flex-1 gap-1 pb-1 relative"
                >
                    {/* Always visible Floating Icon */}
                    <div className="absolute -top-9 w-14 h-14 bg-background rounded-full flex items-center justify-center shadow-[0_10px_0_0_black]">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center -mt-1 relative">
                            <ShoppingBag size={20} className="text-white" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="h-6"></div>

                    <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive('/cart') ? 'text-white' : 'text-gray-400'}`}>CART</span>
                </Link>

                {/* Bundles / Offer -> Using 'Buy 4 at 1399' equivalent */}
                <Link
                    to="/wishlist"
                    className="flex flex-col items-center justify-end h-full flex-1 gap-1 pb-1 relative"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Heart size={22} className={isActive('/wishlist') ? 'text-white' : 'text-gray-400'} strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive('/wishlist') ? 'text-white' : 'text-gray-500'}`}>WISHLIST</span>
                </Link>

                {/* Login / Profile */}
                <Link
                    to={user ? "/profile" : "/login"}
                    className="flex flex-col items-center justify-end h-full flex-1 gap-1 pb-1 relative"
                >
                    <div className="flex flex-col items-center gap-1">
                        <User size={22} className={(isActive('/profile') || isActive('/login')) ? 'text-white' : 'text-gray-400'} strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase ${(isActive('/profile') || isActive('/login')) ? 'text-white' : 'text-gray-500'}`}>
                        {user ? user.name.split(' ')[0] : 'LOGIN'}
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default BottomNavbar;
