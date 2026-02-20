import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOfferBySlug } from '../../../hooks/useOffers';
import ProductCard from '../components/ProductCard';
import { ChevronRight, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SingleOfferPage = () => {
    const { slug } = useParams();
    const { data: offer, isLoading, error } = useOfferBySlug(slug);

    // Note: useOffer hook in useOffers.js currently uses ID. 
    // I need to adjust useOffers.js or use a different call.
    // Actually, I'll update useOffers.js to include useOfferBySlug.

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-primary uppercase tracking-widest">Hydrating Offer...</p>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                    <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-black text-footerBg uppercase tracking-tight">Offer Not Found</h2>
                <p className="text-gray-400 font-bold mt-2 uppercase tracking-wide text-xs">The collection you're looking for might have expired or moved.</p>
                <Link to="/catalog" className="mt-8 bg-black text-white px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all">
                    Explore Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20 font-['Inter'] text-left">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 md:px-12 py-4 flex items-center gap-2 text-[10px] md:text-[12px] font-medium text-gray-400">
                <Link to="/" className="hover:text-primary">Home</Link>
                <ChevronRight size={14} />
                <Link to="/catalog" className="hover:text-primary">Shop</Link>
                <ChevronRight size={14} />
                <span className="text-black font-semibold truncate uppercase">{offer.title}</span>
            </div>

            {/* Header Section */}
            <div className="container mx-auto px-4 md:px-12 mt-10 mb-10">
                <div className="max-w-4xl space-y-4">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border border-primary/20">
                        Special Collection
                    </span>
                    <h1 className="text-4xl md:text-7xl font-black text-footerBg uppercase tracking-tighter leading-none">
                        {offer.title}
                    </h1>
                    {offer.description && (
                        <p className="text-gray-500 text-sm md:text-xl font-medium leading-relaxed max-w-3xl">
                            {offer.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 md:px-12">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-sm md:text-lg font-black text-footerBg uppercase tracking-widest flex items-center gap-3">
                        <ShoppingBag size={20} className="text-primary" />
                        Curated Products
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-4 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                        {offer.products?.length || 0} Items
                    </span>
                </div>

                {offer.products?.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-x-8 md:gap-y-12">
                        {offer.products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No products in this collection yet.</p>
                    </div>
                )}
            </div>
            
            {/* Back CTA */}
            <div className="container mx-auto px-4 md:px-12 mt-20 text-center">
                <Link to="/catalog" className="inline-flex items-center gap-3 text-gray-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to all products
                </Link>
            </div>
        </div>
    );
};

export default SingleOfferPage;
