import React from 'react';
import { useAnnouncements } from '../../../hooks/useContent';

const OfferStrip = () => {
    const { data: allAnnouncements = [], isLoading } = useAnnouncements();
    const marqueeAnnouncements = allAnnouncements.filter(a => a.position === 'marquee' && a.isActive);
    
    const marqueeItems = marqueeAnnouncements.map(a => a.text);

    if (isLoading) return <div className="h-10 bg-amber-50/20" />;
    if (marqueeItems.length === 0) return null;

    const renderItems = () => (
        <div className="flex gap-16 md:gap-28 items-center px-4">
            {marqueeItems.map((item, index) => (
                <React.Fragment key={index}>
                    <span className="flex items-center gap-2">{item}</span>
                    <span className="text-amber-300 font-light ml-8 md:ml-14">|</span>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="bg-amber-50/40 backdrop-blur-sm text-amber-900 text-[10px] md:text-xs py-2.5 overflow-hidden font-bold tracking-[0.2em] relative w-full">
            {/* Soft Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

            <div className="inline-flex whitespace-nowrap animate-marquee-infinite">
                {renderItems()}
                {/* Duplicate for seamless loop */}
                {renderItems()}
            </div>
            <style>{`
                .animate-marquee-infinite {
                    display: inline-flex;
                    animation: marquee-scroll 25s linear infinite;
                }
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-infinite:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default OfferStrip;
