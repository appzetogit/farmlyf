
import React, { Suspense, lazy } from 'react';
import HeroSection from '../components/HeroSection';
import CategoryStrip from '../components/CategoryStrip';
import TopSellingProducts from '../components/TopSellingProducts';
import HomePageSkeleton from '../components/HomePageSkeleton';
import { useBanners } from '../../../hooks/useContent';
import { useCategories } from '../../../hooks/useProducts';
import { useFeaturedSectionByName } from '../../../hooks/useContent';

const WhyChooseUs = lazy(() => import('../components/WhyChooseUs'));
const AboutSection = lazy(() => import('../components/AboutSection'));
const HealthBenefitsSection = lazy(() => import('../components/HealthBenefitsSection'));
const ReviewSection = lazy(() => import('../components/ReviewSection'));
const BlogSection = lazy(() => import('../components/BlogSection'));
const FAQSection = lazy(() => import('../components/FAQSection'));

const SectionSkeleton = () => (
    <div className="px-4 md:px-12 py-6">
        <div className="max-w-6xl mx-auto rounded-2xl border border-slate-100 bg-white p-5 md:p-8">
            <div className="skeleton shimmer h-5 w-40 rounded-md mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="skeleton shimmer h-24 rounded-xl" />
                <div className="skeleton shimmer h-24 rounded-xl" />
                <div className="skeleton shimmer h-24 rounded-xl" />
            </div>
        </div>
    </div>
);

const HomePage = () => {
    const { data: banners = [], isLoading: bannersLoading } = useBanners();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: topSellingData, isLoading: topSellingLoading } = useFeaturedSectionByName('top-selling');

    const hasHeroData = banners.length > 0;
    const hasCategoryData = categories.length > 0;
    const hasTopSellingData = (topSellingData?.products?.length || 0) > 0;

    const isInitialLoading =
        (bannersLoading && !hasHeroData) ||
        (categoriesLoading && !hasCategoryData) ||
        (topSellingLoading && !hasTopSellingData);

    if (isInitialLoading) {
        return <HomePageSkeleton />;
    }

    return (
        <div className="bg-white min-h-screen">
            <HeroSection />
            <CategoryStrip />
            <TopSellingProducts />
            <Suspense fallback={<SectionSkeleton />}>
                <WhyChooseUs />
                <AboutSection />
                <HealthBenefitsSection />
                <ReviewSection />
                <BlogSection />
                <FAQSection />
            </Suspense>
        </div>
    );
};

export default HomePage;
