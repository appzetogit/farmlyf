import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// import { useShop } from '../../../context/ShopContext';
import { useBannersBySection } from '../../../hooks/useContent';
import logo from '../../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiUrl';

const HeroSection = () => {
    const navigate = useNavigate();
    const rawBanners = useBannersBySection('hero');

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

    const [promoSettings, setPromoSettings] = useState({
        badgeText1: 'Upto',
        discountTitle: '60',
        discountSuffix: '%',
        discountLabel: 'OFF',
        extraDiscountSubtitle: 'EXTRA SAVE',
        extraDiscount: '15',
        extraDiscountSuffix: '%',
        couponCode: 'REPUBLICJOY',
        topBadge: 'Hot Deal',
        showCouponCode: true,
        isVisible: true
    });

    useEffect(() => {
        const fetchPromoSettings = async () => {
            const API_URL = API_BASE_URL;
            try {
                const res = await fetch(`${API_URL}/promo-card`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        // Backend returns the object directly now
                        setPromoSettings(prev => ({ ...prev, ...data }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch promo settings:', error);
            }
        };
        fetchPromoSettings();
    }, []);

    // Auto-slide
    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    // Fallback if no banners
    if (banners.length === 0) return null;

    const currentSlide = banners[currentIndex];

    // Safety check for undefined slide
    if (!currentSlide) return null;

    return (
        <div className="w-full bg-background py-4 md:py-6 px-3 md:px-12">
            <div className="w-full">
                <div className="relative w-full rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/6] bg-[#fdfdfd] shadow-2xl border border-mint/20 group">

                    {/* Slider Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            className="absolute inset-0 flex items-center justify-between px-6 md:px-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Background Banner Image */}
                            <div className="absolute inset-0 z-0">
                                <motion.img
                                    initial={{ scale: 1.05 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 6, ease: "linear" }}
                                    src={currentSlide.image}
                                    alt={currentSlide.title}
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    className="w-full h-full object-fill md:object-cover object-center"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=1600';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for text readability */}
                            </div>

                            {/* Left Side Content */}
                            <div className="z-30 space-y-0.5 md:space-y-2 max-w-[75%] md:max-w-md mt-12 md:mt-16 md:ml-4 relative text-shadow-sm">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1 md:mb-2"
                                >
                                    <span className="bg-offerRed text-white text-[7px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-lg uppercase">
                                        LIMITED TIME
                                    </span>
                                    {currentSlide.badgeText && (
                                        <span className="text-white bg-primary px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full font-bold text-[7px] md:text-[10px] tracking-widest uppercase shadow-md">
                                            {currentSlide.badgeText}
                                        </span>
                                    )}
                                </motion.div>

                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg md:text-5xl lg:text-5xl font-black text-white drop-shadow-lg leading-none md:leading-tight"
                                >
                                    {currentSlide.title}
                                </motion.h1>

                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-white/95 text-[9px] md:text-lg font-bold max-w-xs leading-tight drop-shadow-md mb-1.5 md:mb-4"
                                >
                                    {currentSlide.subtitle}
                                </motion.p>

                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={() => currentSlide.link && navigate(currentSlide.link)}
                                    className="mt-1 md:mt-3 bg-primary hover:bg-primaryHover text-white px-3 py-1.5 md:px-8 md:py-3 rounded-full font-bold text-[10px] md:text-base flex items-center gap-1 md:gap-2 transition-all shadow-xl active:scale-95"
                                >
                                    {currentSlide.ctaText || 'Shop Now'} <ArrowRight size={12} className="md:w-[18px] md:h-[18px]" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Static Branding Overlay */}
                    <div className="absolute top-3 left-4 md:left-12 z-40 bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/20">
                        <span className="text-[8px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase text-white/80 font-bold block">Passion for Nutrition</span>
                        <div className="flex items-center gap-1 md:gap-1.5">
                            <img src={logo} alt="FarmLyf" className="h-4 md:h-6 w-auto object-contain" />
                        </div>
                    </div>

                    {/* Dynamic Right Side Offer Box - Conditionally Rendered */}
                    {promoSettings.isVisible && (
                        <div className="hidden lg:flex flex-col items-center justify-center border border-white/60 bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl shadow-2xl z-20 absolute right-20 top-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-105">
                            <div className="absolute -top-3 -right-3 bg-offerRed text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce uppercase tracking-tighter">
                                {promoSettings.topBadge}
                            </div>
                            <div className="text-center font-sans">
                                <p className="text-footerBg/60 font-black text-[9px] uppercase tracking-[0.2em]">{promoSettings.badgeText1}</p>
                                <div className="flex items-baseline gap-0.5 justify-center leading-none my-1">
                                    <span className="text-5xl font-black text-offerRed tracking-tighter">{promoSettings.discountTitle}</span>
                                    <div className="flex flex-col items-start translate-y-1">
                                        <span className="text-xl font-black text-footerBg">{promoSettings.discountSuffix}</span>
                                        <span className="text-[9px] font-bold text-footerBg/70 uppercase">{promoSettings.discountLabel}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-1 bg-primary/30 mx-auto rounded-full my-2"></div>
                                <p className="text-footerBg/60 font-black text-[9px] uppercase tracking-[0.2em]">{promoSettings.extraDiscountSubtitle}</p>
                                <div className="flex items-baseline gap-0.5 justify-center leading-none mt-1">
                                    <span className="text-3xl font-black text-primary">{promoSettings.extraDiscount}</span>
                                    <span className="text-lg font-bold text-footerBg">{promoSettings.extraDiscountSuffix}</span>
                                </div>
                            </div>
                            {promoSettings.showCouponCode && (
                                <div className="mt-5 bg-footerBg text-white px-5 py-2 rounded-lg text-xs font-black tracking-widest border border-white/20 select-all cursor-pointer hover:bg-primary transition-colors">
                                    {promoSettings.couponCode}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Slider Controls (Desktop Hover) */}
                    <div className="hidden md:flex absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-between px-4 pointer-events-none">
                        <button
                            onClick={prevSlide}
                            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Slider Controls (Mobile Always Visible) */}
                    <div className="md:hidden absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-2 pointer-events-none">
                        <button
                            onClick={prevSlide}
                            className="pointer-events-auto p-2 rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/25 shadow-md active:scale-95"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="pointer-events-auto p-2 rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/25 shadow-md active:scale-95"
                            aria-label="Next banner"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Bottom Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`transition-all duration-500 rounded-full h-1 ${currentIndex === idx ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HeroSection;
