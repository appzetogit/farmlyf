import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Truck, Wallet, ShieldCheck, Trophy, Star, Clock, Gift, Headset } from 'lucide-react';
import { useTrustSignals } from '../../../hooks/useContent';

const WhyChooseUs = () => {
    const { data: allFeatures = [] } = useTrustSignals();

    // Logging to help debug "not reflecting" issue
    React.useEffect(() => {
        if (allFeatures.length > 0) {
            console.log('Homepage Trust Signals Data:', allFeatures);
        }
    }, [allFeatures]);

    const features = allFeatures.slice(0, 4).filter(f => f.isActive !== false).map((f, index) => {
        const IconComponent = LucideIcons[f.icon] || Star;
        return {
            ...f,
            icon: IconComponent,
            title: f.topText,
            subtitle: f.bottomText,
            delay: (index + 1) * 0.1
        };
    });

    if (features.length === 0) return null;

    return (
        <section className="bg-white py-4 md:py-6 px-4 md:px-12 relative overflow-hidden">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-footerBg rounded-2xl md:rounded-[40px] px-4 py-8 md:py-12 grid grid-cols-2 md:flex md:flex-row items-start md:items-center justify-between gap-x-4 gap-y-8 md:gap-4 relative overflow-hidden"
                >
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                    {features.map((feature, index) => (
                        <React.Fragment key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: feature.delay, duration: 0.5 }}
                                className="flex flex-col items-center text-center space-y-3 md:flex-1 group z-10"
                            >
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                                    {/* Small Decorative Dot - Like the screenshot */}
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-lg border-2 border-footerBg" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-white/80 text-[10px] md:text-sm font-medium uppercase tracking-wider">
                                        {feature.title}
                                    </p>
                                    <p className="text-white text-xs md:text-base font-bold">
                                        {feature.subtitle}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Vertical Divider for Desktop */}
                            {index < features.length - 1 && (
                                <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            )}


                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
