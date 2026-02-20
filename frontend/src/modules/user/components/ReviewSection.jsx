import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import reviewBg from '../../../assets/images/review_bg_bright.png';

import { useFeaturedReviews } from '../../../hooks/useContent';

const ReviewSection = () => {
    const scrollRef = useRef(null);
    const { data: reviews = [], isLoading } = useFeaturedReviews();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="mt-10 md:mt-20">
            {/* Section Header - Outside Background */}
            <div className="container mx-auto px-4 md:px-12 text-center mb-8 md:mb-14">
                <h2 className="text-2xl md:text-4xl font-['Poppins'] font-bold mb-3 text-gray-900">Customer Reviews</h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto font-medium">
                    See what our happy customers have to say about their healthy journey with us
                </p>
            </div>

            {/* Content Area with Background */}
            <div className="relative py-8 md:py-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={reviewBg}
                        alt="Dry Fruits Background"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                </div>

                <div className="w-full relative z-10 px-4 md:px-24">
                    {/* Slider Container */}
                    <div className="relative group w-full">
                        {/* Left Navigation Button */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute -left-2 md:-left-20 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Reviews Scroll Container */}
                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4"
                        >
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review._id || review.id || index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="flex-shrink-0 w-[85vw] md:w-[calc(50%-12px)]"
                                >
                                    <div className="flex flex-col md:flex-row h-full rounded-2xl overflow-hidden min-h-[180px] md:h-[320px] border border-gray-100">
                                        {/* Left: Avatar Section */}
                                        <div className="w-full md:w-2/5 bg-[#f5f5f5] flex items-center justify-center p-2 md:p-6 relative">
                                            <div className="w-14 h-14 md:w-32 md:h-32 rounded-full overflow-hidden border-2 md:border-4 border-white">
                                                <img
                                                    src={review.image}
                                                    alt={review.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Content Section */}
                                        <div className="w-full md:w-3/5 bg-black/40 backdrop-blur-md p-3 md:p-6 flex flex-col justify-center relative">
                                            <Quote className="text-white/80 w-4 h-4 md:w-10 md:h-10 mb-1.5 md:mb-6" />

                                            <p className="text-white text-[10px] md:text-lg leading-relaxed mb-2 md:mb-6 font-medium">
                                                {review.comment}
                                            </p>

                                            <h4 className="text-white font-bold text-xs md:text-xl">
                                                {review.name}
                                            </h4>
                                        </div>
                                    </div>
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
            </div>
        </section>
    );
};

export default ReviewSection;
