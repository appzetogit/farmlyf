import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useFeaturedSectionByName } from '../../../hooks/useContent';

const TopSellingProducts = () => {
    const scrollRef = useRef(null);
    const { data: sectionData, isLoading } = useFeaturedSectionByName('top-selling');
    const topProducts = sectionData?.products || [];

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <section className="bg-white pt-6 pb-4 md:py-6 px-4 md:px-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-4 md:mb-14 space-y-2">
                        <div className="skeleton shimmer h-7 md:h-10 w-64 md:w-96 rounded-md mx-auto" />
                        <div className="skeleton shimmer w-40 md:w-72 h-1.5 rounded-full mx-auto" />
                    </div>

                    <div className="flex gap-4 md:gap-6 overflow-hidden px-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[160px] w-[170px] md:min-w-[280px] md:w-[280px] rounded-2xl border border-gray-100 bg-white p-3 md:p-4"
                            >
                                <div className="skeleton shimmer aspect-[16/11] rounded-xl mb-3 md:mb-4" />
                                <div className="skeleton shimmer h-3 md:h-4 w-3/4 rounded mb-2" />
                                <div className="skeleton shimmer h-3 md:h-4 w-2/4 rounded mb-3 md:mb-4" />
                                <div className="skeleton shimmer h-7 md:h-9 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    if (topProducts.length === 0) return null;

    return (
        <section className="bg-white pt-6 pb-4 md:py-6 px-4 md:px-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <div className="container mx-auto">
                <div className="text-center mb-4 md:mb-14 space-y-2">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-4xl font-['Poppins'] font-bold text-footerBg tracking-tight"
                    >
                        Top Selling <span className="text-primary">Products</span>
                    </motion.h2>
                    <div className="w-40 md:w-72 h-1.5 bg-primary mx-auto rounded-full mt-2" />
                </div>

                <div className="relative">
                    {/* Left Navigation Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 md:-left-20 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 snap-x"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {topProducts.map((product, index) => (
                            <motion.div
                                key={product._id || product.id || index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="min-w-[160px] w-[170px] md:min-w-[280px] md:w-[280px] flex-shrink-0 snap-start"
                            >
                                <ProductCard product={product} showVault={false} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Navigation Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 md:-right-20 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TopSellingProducts;
