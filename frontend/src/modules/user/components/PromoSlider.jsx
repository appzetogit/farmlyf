
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';


// import { useShop } from '../../../context/ShopContext';
import { useBannersBySection } from '../../../hooks/useContent';

const PromoSlider = () => {
    const rawBanners = useBannersBySection('promo');

    // Flatten banners that have multiple slides
    const banners = React.useMemo(() => {
        return rawBanners.flatMap(b => {
            if (b.slides && b.slides.length > 0) {
                return b.slides.map(s => ({
                    ...b,
                    image: s.image,
                    publicId: s.publicId,
                    title: s.title || b.title,
                    subtitle: s.subtitle || b.subtitle,
                    badgeText: s.badgeText || b.badgeText,
                    link: s.link || b.link,
                    ctaText: s.ctaText || b.ctaText
                }));
            }
            return [b];
        });
    }, [rawBanners]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    if (banners.length === 0) return null;

    return (
        <section className="w-full bg-background py-4 md:py-10 px-3 md:px-12 font-['Inter']">
            <div className="relative w-full h-[220px] md:h-[400px] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl bg-black group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10" />
                        <img
                            src={banners[currentIndex].image}
                            alt={banners[currentIndex].title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=800&q=80';
                            }}
                        />

                        <div className="absolute inset-0 z-20 flex flex-col justify-center px-5 md:px-16 text-white pointer-events-none">
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4"
                            >
                                <span className="bg-primary text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg">
                                    {banners[currentIndex].badgeText}
                                </span>
                                <div className="h-[1px] w-8 md:w-12 bg-white/30" />
                            </motion.div>

                            <motion.h2
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl md:text-5xl font-black mb-2 md:mb-3 font-['Poppins'] leading-tight max-w-xl text-white drop-shadow-md"
                            >
                                {banners[currentIndex].title}
                            </motion.h2>

                            <motion.p
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-[10px] md:text-lg text-white/80 font-bold max-w-sm mb-6 leading-snug"
                            >
                                {banners[currentIndex].subtitle}
                            </motion.p>

                            <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={() => {
                                    const slide = banners[currentIndex];
                                    if (slide.link) window.location.href = slide.link;
                                }}
                                className="pointer-events-auto bg-primary hover:bg-primaryHover text-white font-bold text-[9px] md:text-sm uppercase tracking-widest px-4 py-2 md:px-6 md:py-3 rounded-full transition-all shadow-xl active:scale-95 w-fit flex items-center gap-2 group/btn"
                            >
                                {banners[currentIndex].ctaText || 'Explore Collection'}
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                                    <ChevronRight size={12} />
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Controls - Minimal & Hidden until hover */}
                <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-6 pointer-events-none">
                    <button
                        onClick={prevSlide}
                        className="pointer-events-auto p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-footerBg text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="pointer-events-auto p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-footerBg text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* Bottom Indicators */}
                <div className="absolute bottom-6 left-8 md:left-16 z-30 flex gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`transition-all duration-500 rounded-full h-1.5 ${currentIndex === idx ? 'w-8 bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromoSlider;
