import React from 'react';
import { motion } from 'framer-motion';
import { useAboutSection } from '../../../hooks/useContent';

const AboutSection = () => {
    const { data: aboutData, isLoading } = useAboutSection();

    // Logging to help debug "not reflecting" issue
    React.useEffect(() => {
        if (aboutData) {
            console.log('Homepage About Section Data:', aboutData);
        }
    }, [aboutData]);

    // Stats items from data or fallback
    const stats = (aboutData?.stats && aboutData.stats.length > 0) ? aboutData.stats : [
        { label: 'Outlets', value: '15+' },
        { label: 'Happy Customers', value: '500000+' },
        { label: 'Orders Delivered', value: '750000+' }
    ];

    if (isLoading) return <div className="h-96 flex items-center justify-center">Loading About Section...</div>;
    if (!aboutData || Object.keys(aboutData).length === 0) return null;

    const displayData = aboutData;

    return (
        <section className="bg-white py-4 md:py-6 px-4 md:px-12 relative overflow-hidden">
            <div className="container mx-auto">
                {/* Mobile Header (Visible only on Mobile) */}
                <div className="md:hidden text-center mb-6 space-y-2">
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-primary font-bold tracking-[0.3em] uppercase text-xs"
                        >
                            {displayData.sectionLabel}
                        </motion.h3>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl font-['Poppins'] font-bold text-footerBg leading-tight"
                        >
                            {displayData.title} <span className="text-primary">{displayData.highlightedTitle}</span>
                        </motion.h2>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">

                        {/* Left Side: Image with Styled Border */}
                        <div className="lg:w-1/2 relative h-[280px] md:h-[450px] w-[85%] ml-4 md:w-full md:ml-0 mt-2 md:mt-6 self-start lg:self-center">
                            {/* Decorative background border */}
                            <div className="absolute inset-0 border-2 border-primary/30 rounded-[20px] md:rounded-[32px] -m-4 md:-m-5 z-0" />

                            <div className="relative h-full w-full rounded-[20px] md:rounded-[32px] overflow-hidden z-10 shadow-xl">
                                <img
                                    src={displayData.image}
                                    alt="Farmlyf Journey"
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/5" />
                            </div>

                            {/* Mobile Stats Overlay (Screenshot Style) */}
                            <div className="absolute top-1/2 -translate-y-1/2 -right-10 md:hidden flex flex-col bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl overflow-hidden py-2 z-30 min-w-[130px]">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="px-5 py-3 border-b border-gray-100 last:border-0 flex flex-col relative group">
                                        <span className="text-lg font-black text-footerBg leading-none mb-1">
                                            {stat.value}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase leading-tight">
                                            {stat.label}
                                        </span>
                                        {/* Decorative small underline for active feel */}
                                        <div className="w-5 h-0.5 bg-primary/20 mt-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Content (No Card) */}
                        <div className="lg:w-1/2 py-2 md:py-12 flex flex-col justify-center space-y-4 md:space-y-8">
                            <div className="hidden md:block space-y-3 md:space-y-4">
                                <motion.h3
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="text-primary font-bold tracking-[0.3em] uppercase text-xs md:text-sm"
                                >
                                    {displayData.sectionLabel}
                                </motion.h3>
                                <motion.h2
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl md:text-4xl font-['Poppins'] font-bold text-footerBg leading-tight"
                                >
                                    {displayData.title} <span className="text-primary">{displayData.highlightedTitle}</span>
                                </motion.h2>
                            </div>

                            <div className="space-y-4">
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-600 text-sm md:text-lg leading-relaxed max-w-xl font-medium"
                                >
                                    {displayData.description1}
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-gray-600 text-sm md:text-lg leading-relaxed max-w-xl"
                                >
                                    {displayData.description2}
                                </motion.p>
                            </div>

                        {/* Stats Section - Highlighted Style (Desktop Only) */}
                        <div className="hidden md:flex pt-8 md:pt-10 border-t border-gray-100 flex-wrap gap-10 md:gap-14">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex flex-col group cursor-default"
                                >
                                    <span className="text-3xl md:text-4xl font-black text-footerBg mb-1 group-hover:text-primary transition-colors duration-300">
                                        {stat.value}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 md:w-8 h-0.5 bg-primary rounded-full origin-left group-hover:scale-x-125 transition-transform duration-300" />
                                        <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
                                            {stat.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
