import React from 'react';

const HomePageSkeleton = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="px-3 md:px-12 py-4 md:py-6">
                <div className="max-w-[1400px] mx-auto rounded-3xl overflow-hidden border border-slate-100">
                    <div className="skeleton shimmer aspect-[16/9] md:aspect-[21/6] w-full" />
                </div>
            </div>

            <div className="px-4 md:px-24 py-8">
                <div className="skeleton shimmer h-6 w-44 rounded-md mx-auto mb-6" />
                <div className="flex gap-3 md:gap-6 overflow-hidden">
                    <div className="skeleton shimmer h-14 md:h-24 min-w-[160px] md:min-w-[280px] rounded-full" />
                    <div className="skeleton shimmer h-14 md:h-24 min-w-[160px] md:min-w-[280px] rounded-full" />
                    <div className="skeleton shimmer h-14 md:h-24 min-w-[160px] md:min-w-[280px] rounded-full" />
                    <div className="skeleton shimmer h-14 md:h-24 min-w-[160px] md:min-w-[280px] rounded-full" />
                </div>
            </div>

            <div className="px-4 md:px-24 py-4">
                <div className="skeleton shimmer h-6 w-56 rounded-md mx-auto mb-6" />
                <div className="flex gap-4 md:gap-6 overflow-hidden">
                    <div className="skeleton shimmer h-[260px] md:h-[420px] min-w-[170px] md:min-w-[280px] rounded-2xl" />
                    <div className="skeleton shimmer h-[260px] md:h-[420px] min-w-[170px] md:min-w-[280px] rounded-2xl" />
                    <div className="skeleton shimmer h-[260px] md:h-[420px] min-w-[170px] md:min-w-[280px] rounded-2xl" />
                    <div className="skeleton shimmer h-[260px] md:h-[420px] min-w-[170px] md:min-w-[280px] rounded-2xl" />
                </div>
            </div>
        </div>
    );
};

export default HomePageSkeleton;
