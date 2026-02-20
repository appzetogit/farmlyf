import React, { useState } from 'react';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { Copy, Clock, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveCoupons } from '../../../hooks/useCoupons';

const OffersPage = () => {
    // const { getActiveCoupons } = useShop();
    const navigate = useNavigate();
    const { data: activeCoupons = [] } = useActiveCoupons(); // Hook usage
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header / Hero */}
            <div className="bg-footerBg text-white py-16 px-6 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <span className="px-4 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest animate-pulse">Limited Time Offers</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Best Deals For You</h1>
                    <p className="text-gray-400 font-medium max-w-lg mx-auto">
                        Save big on your favorite organic goodness. Grab these exclusive coupons before they expire!
                    </p>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                {activeCoupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCoupons.map((coupon) => (
                            <div key={coupon.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                                {/* Image / Visual Header */}
                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                    {coupon.image ? (
                                        <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 text-primary">
                                            <Tag size={48} />
                                        </div>
                                    )}
                                    {/* Badge */}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-footerBg px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 leading-tight">{coupon.title || 'Special Offer'}</h3>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wide">{coupon.subtitle || `Use Code: ${coupon.code}`}</p>
                                    </div>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">
                                        {coupon.description}
                                    </p>

                                    {/* Expiry & Eligibility */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <Clock size={12} />
                                            Expires {new Date(coupon.validUntil).toLocaleDateString()}
                                        </div>
                                        {coupon.minOrderValue > 0 && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                                Min Order: ₹{coupon.minOrderValue}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center gap-3 mt-auto">
                                        <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between group/code relative hover:bg-gray-100 transition-colors">
                                            <span className="font-black text-footerBg tracking-widest uppercase text-sm">{coupon.code}</span>
                                            <button
                                                onClick={() => handleCopy(coupon.code, coupon.id)}
                                                className="text-gray-400 hover:text-primary transition-colors"
                                            >
                                                {copiedId === coupon.id ? <span className="text-[10px] font-bold text-green-500">Copied!</span> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => navigate('/shop')}
                                            className="w-12 h-12 bg-footerBg text-white rounded-xl flex items-center justify-center hover:bg-primary transition-colors shadow-lg shadow-footerBg/20"
                                        >
                                            <ArrowRight size={20} className="-rotate-45" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                            <Tag size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Active Offers</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">We don't have any active coupons right now. Check back later or subscribe to our newsletter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
