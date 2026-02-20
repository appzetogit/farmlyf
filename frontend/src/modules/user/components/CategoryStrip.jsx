
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Import generated images from project assets
import cashewImg from '../../../assets/cashew.png';
import pistaImg from '../../../assets/pista.png';
import walnutImg from '../../../assets/walnut.png';
import datesImg from '../../../assets/dates.png';
import almondImg from '../../../assets/baadaam.png';
import anjeerImg from '../../../assets/anjeer.png';
import raisinImg from '../../../assets/raisin.png';

// Asset Mapping for seeded categories
const assetMap = {
    'cashew-(kaju)': cashewImg, // Old slug format support
    'cashews': cashewImg,
    'pistachio-(pista)': pistaImg,
    'pistachios': pistaImg,
    'walnut-(akhrot)': walnutImg,
    'walnuts': walnutImg,
    'dates-(khajur)': datesImg,
    'wet-dates-(khajur)': datesImg,
    'dates': datesImg,
    'badam-(almond)': almondImg,
    'almonds-(badam)': almondImg,
    'almonds': almondImg,
    'anjeer-(figs)': anjeerImg,
    'dried-figs-(anjeer)': anjeerImg, // Matches seed name 'Dried Figs (Anjeer)' -> slug might be generated differently if not hardcoded? Seed slug was 'figs'
    'figs': anjeerImg,
    'raisin-(kishmish)': raisinImg,
    'raisins-(kishmish)': raisinImg,
    'raisins': raisinImg
};


// Static colors for dynamic assignment
const colors = [
    'bg-[#006071]', 'bg-[#67705B]', 'bg-[#902D45]',
    'bg-[#7E3021]', 'bg-[#C08552]', 'bg-[#7D5A5A]', 'bg-[#A68966]'
];

import { useCategories } from '../../../hooks/useProducts';

const CategoryStrip = () => {
    const { data: categories = [], isLoading } = useCategories(); // Use Parent Categories
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // Filter categories that are marked to show in the shop strip
    const displayCategories = categories.filter(c => c.showInShopByCategory && c.status === 'Active');

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    // ... variants ...

    return (
        <section className="bg-white pt-10 pb-1 md:pt-16 md:pb-4 px-4 md:px-24 relative overflow-hidden">
            {/* ... header ... */}
            <div className="container mx-auto">
                <div className="text-center mb-2 md:mb-14 space-y-1 md:space-y-2">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] block opacity-80"
                    >
                        Fresh from Farm
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-4xl font-['Poppins'] font-bold text-footerBg tracking-tight"
                    >
                        Shop By <span className="text-primary">Category</span>
                    </motion.h2>
                    <div className="w-32 md:w-48 h-1 bg-primary mx-auto rounded-full mt-2" />
                </div>

                <div className="relative flex items-center group">
                    {/* Left Navigation Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 md:-left-20 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <motion.div
                        ref={scrollRef}
                        className="flex gap-2 md:gap-14 overflow-x-auto no-scrollbar scroll-smooth items-center w-full min-h-[90px] md:min-h-[150px]"
                    >
                        {isLoading ? (
                            <div className="text-center w-full text-gray-400 text-sm">
                                <p>Loading categories...</p>
                            </div>
                        ) : displayCategories.length === 0 ? (
                            <div className="text-center w-full text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 p-8 rounded-xl">
                                <p>No categories to display</p>
                                <p className="text-[10px] mt-1 normal-case text-gray-300">Set "Show in Tiles" in Admin &gt; Categories</p>
                            </div>
                        ) : (
                            displayCategories.map((cat, index) => (
                                <motion.div
                                    key={cat._id || cat.id}
                                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    // Navigate to subcategory page filter? Currently assumes structure
                                    onClick={() => navigate(`/category/${cat.slug}`)}
                                    className="relative min-w-[160px] md:min-w-[280px] h-14 md:h-24 flex items-center cursor-pointer group/item flex-shrink-0"
                                >
                                    {/* Elongated Pill Background */}
                                    <div className={`absolute right-0 w-[90%] md:w-[85%] h-[80%] md:h-[70%] ${colors[index % colors.length]} rounded-full flex items-center justify-center shadow-md border border-white/10 pl-14 md:pl-20 pr-4 md:pr-6 overflow-hidden transition-all duration-500 group-hover/item:shadow-2xl group-hover/item:border-white/30`}>
                                        <span className="text-white font-black text-[9px] md:text-[15px] tracking-widest uppercase text-center leading-tight drop-shadow-lg z-10">
                                            {cat.name}
                                        </span>
                                        {/* Reflection/Shine Effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover/item:translate-x-[150%] transition-transform duration-1000"
                                        />
                                    </div>

                                    {/* Popping Product Image */}
                                    <motion.div
                                        animate={{
                                            y: [0, -5, 0],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.2
                                        }}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 md:w-32 md:h-32 z-10 flex items-center justify-center"
                                    >
                                        <motion.img
                                            whileHover={{ scale: 1.15, rotate: 5 }}
                                            src={assetMap[cat.slug] || (cat.image ? (cat.image.startsWith('http') ? cat.image : `http://localhost:5000${cat.image}`) : 'https://cdn-icons-png.flaticon.com/512/3592/3592864.png')}
                                            alt={cat.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] group-hover/item:drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] transition-all duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/3592/3592864.png';
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>

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

export default CategoryStrip;
