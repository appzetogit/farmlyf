
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import generated images from project assets
import dailyPackImg from '../../../assets/daily_pack.png';
import familyPackImg from '../../../assets/family_pack.png';
import fitnessPackImg from '../../../assets/fitness_pack.png';
import partyPackImg from '../../../assets/party_pack.png';

const packAssetMap = {
    'daily-packs': dailyPackImg,
    'family-packs': familyPackImg, // Seed slug might vary, let's cover bases
    'grand-family-packs': familyPackImg,
    'health-fitness': fitnessPackImg,
    'daily-health-fitness-pack': fitnessPackImg,
    'party-packs': partyPackImg,
    'vibrant-party-packs': partyPackImg,
    // Add these for the seeded data:
    'festival-combos': 'https://images.pexels.com/photos/5702927/pexels-photo-5702927.jpeg?auto=compress&cs=tinysrgb&w=800', // Hardcoded fallback from original file
};

// Static colors removed/unused
// const colors...

const defaultPacks = [
    {
        title: 'Daily Health Packs',
        subtitle: 'Portion-controlled daily nutrition',
        image: dailyPackImg,
        id: 'static-1',
        slug: 'daily-packs',
        tag: 'BESTSELLER'
    },
    // ... Any other defaults if DB is empty
];

// import { useShop } from '../../../context/ShopContext'; // Removed
import { useCategories, useSubCategories, useComboCategories } from '../../../hooks/useProducts';
import { useQuery } from '@tanstack/react-query';

const ShopByPacks = () => {
    const { data: categories = [] } = useCategories();
    // Fetch Combo Categories from centralized hook
    const { data: comboCategories = [] } = useComboCategories();

    const packs = React.useMemo(() => {
        const activeCombos = comboCategories.filter(c => c.status === 'Active');
        if (activeCombos.length === 0) return defaultPacks;

        return activeCombos.map(p => ({
            title: p.name,
            subtitle: p.description || 'Curated collection',
            image: packAssetMap[p.slug] || p.image || dailyPackImg,
            path: `/category/combos-packs/${p.slug}`,
            tag: 'SPECIAL',
            id: p._id || p.id
        }));
    }, [comboCategories]);
    return (
        <section className="bg-[#FFFBEB] py-8 md:py-20 px-3 md:px-12 relative overflow-hidden">
            <div className="container mx-auto relative z-10">
                <div className="text-center mb-6 md:mb-10 space-y-1 md:space-y-2">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] block opacity-80"
                    >
                        Curated Collections
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-['Poppins'] font-bold text-footerBg tracking-tight"
                    >
                        Shop By <span className="text-primary">Packs</span>
                    </motion.h2>
                    <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-1" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                    {packs.map((pack, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link to={pack.path} className="group block h-full">
                                <div className="bg-white rounded-[1.2rem] md:rounded-[2rem] p-3 md:p-5 h-full shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-primary/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:bg-[#F8FAF9] transition-all duration-500 flex flex-col items-center text-center group-hover:scale-[1.02] relative">
                                    {/* Image Container with balanced padding */}
                                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[1rem] md:rounded-[1.5rem] bg-gray-50 mb-3 md:mb-6 shadow-sm transition-all duration-500">
                                        <img
                                            src={pack.image}
                                            alt={pack.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />

                                        {/* Minimal Tag Overlay */}
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4">
                                            <span className="bg-primary text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[9px] font-black tracking-widest uppercase shadow-lg">
                                                {pack.tag}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content with elegant type */}
                                    <div className="space-y-1 md:space-y-2 pb-1 md:pb-2 w-full">
                                        <h3 className="text-sm md:text-2xl font-black text-primary tracking-tight transition-colors duration-300 leading-tight">
                                            {pack.title}
                                        </h3>
                                        <p className="hidden md:block text-gray-500 text-[13px] md:text-sm font-medium leading-relaxed max-w-[90%] mx-auto">
                                            {pack.subtitle}
                                        </p>
                                    </div>

                                    {/* Subtle subtle indicator - Always Visible */}
                                    <div className="mt-2 md:mt-4 flex items-center gap-1 md:gap-2 text-primary transition-all duration-500">
                                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">Shop</span>
                                        <div className="w-4 md:w-8 h-[1px] bg-primary group-hover:w-8 md:group-hover:w-12 transition-all duration-500" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByPacks;
