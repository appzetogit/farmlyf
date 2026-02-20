import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Heart, HelpCircle } from 'lucide-react';
import { useHealthBenefits } from '../../../hooks/useContent';

const HealthBenefitsSection = ({ data }) => {
    const { data: fetchedData, isLoading } = useHealthBenefits();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const scrollRef = useRef(null);

    // Logging to help debug "not reflecting" issue
    useEffect(() => {
        if (fetchedData) {
            console.log('Homepage Health Benefits Data:', fetchedData);
        }
    }, [fetchedData]);

    if (isLoading) return <div className="h-96 flex items-center justify-center">Loading Health Benefits...</div>;
    if (!fetchedData || !fetchedData.benefits) return null;

    const sectionData = {
        ...fetchedData,
        benefits: fetchedData.benefits.map(b => {
            // Enhanced check for URLs/Images
            const isUrl = b.icon && (
                b.icon.includes('/') ||
                b.icon.startsWith('data:') ||
                /\.(png|jpg|jpeg|svg|webp|gif|bmp|avif)$/i.test(b.icon)
            );

            let renderedIcon;

            if (isUrl) {
                // Remove bg/color effect from image, keep size consistent
                renderedIcon = (
                    <img
                        src={b.icon}
                        alt={b.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Hide if broken
                            // Note: Fallback to text icon would require state, simpler to just hide or show broken image
                        }}
                    />
                );
            } else {
                // Case-insensitive lookup for Lucide icons
                const iconKey = Object.keys(LucideIcons).find(
                    key => key.toLowerCase() === (b.icon || '').toLowerCase()
                );
                const IconComponent = LucideIcons[iconKey] || LucideIcons[b.icon] || Heart;
                renderedIcon = React.createElement(IconComponent, { size: 60, strokeWidth: 1.5 });
            }

            return {
                ...b,
                icon: renderedIcon,
                borderStyle: { borderColor: b.baseColor || '#006071' },
                textStyle: { color: b.baseColor || '#006071' }
            };
        })
    };

    return (
        <section className="bg-gray-50 py-4 md:py-6 relative overflow-hidden">
            {/* Background Decorative Blobs for Glassmorphism Context */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#006071]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-full h-full max-w-4xl bg-gradient-to-tr from-[#902D45]/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-2 md:px-4 max-w-screen-2xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-14 space-y-2 md:space-y-3">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-['Poppins'] font-bold text-footerBg leading-tight"
                    >
                        {sectionData.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto"
                    >
                        {sectionData.subtitle}
                    </motion.p>
                </div>

                {/* Horizontal Scroll on Mobile, Flex on Desktop for constant one-line display */}
                <div className="flex overflow-x-auto md:overflow-x-visible pb-12 gap-4 md:gap-6 snap-x snap-mandatory no-scrollbar justify-start md:justify-center">
                    {sectionData.benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className="flex-shrink-0 w-36 md:w-auto md:flex-1 md:min-w-[200px] max-w-[300px] snap-center cursor-pointer pt-10 md:pt-20"
                        >
                            <div className="relative">
                                {/* White Circle Icon Container - Hides on hover */}
                                <AnimatePresence>
                                    {hoveredIndex !== index && (
                                        <motion.div
                                            initial={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 30 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2 z-20"
                                        >
                                            <div
                                                style={benefit.borderStyle}
                                                className={`relative bg-white rounded-full w-20 h-20 md:w-32 md:h-32 flex items-center justify-center shadow-lg border-2`}
                                            >
                                                <div style={benefit.textStyle} className={`scale-75 md:scale-100 transform`}>
                                                    {benefit.icon}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Card Container */}
                                <div
                                    style={{
                                        background: `linear-gradient(145deg, ${benefit.baseColor}40, ${benefit.baseColor}10)`,
                                        borderColor: `${benefit.baseColor}4D`
                                    }}
                                    className={`
                                        relative h-36 md:h-64 rounded-[20px] md:rounded-[32px] 
                                        backdrop-blur-xl border
                                        shadow-xl hover:shadow-2xl
                                        transition-all duration-500
                                        overflow-hidden
                                        flex flex-col items-center justify-center
                                        p-2 md:p-4
                                    `}>
                                    <AnimatePresence mode="wait">
                                        {hoveredIndex !== index ? (
                                            <motion.div
                                                key="title"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="flex items-center justify-center h-full w-full text-center pt-6"
                                            >
                                                <h3 style={benefit.textStyle} className={`font-bold text-[10px] md:text-lg px-1 uppercase tracking-tight`}>
                                                    {benefit.title}
                                                </h3>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="description"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center justify-center h-full w-full"
                                            >
                                                <p style={benefit.textStyle} className={`text-[8px] md:text-xs leading-relaxed font-bold px-2 text-center italic`}>
                                                    {benefit.description}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HealthBenefitsSection;
