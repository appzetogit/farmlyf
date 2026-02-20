import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogs } from '../../../hooks/useContent';
import toast from 'react-hot-toast';

// Import blog images (fallback/placeholder logic if needed, but data should have URLs)
import logoImg from '../../../assets/logo.png';

const BlogSection = () => {
    const scrollRef = useRef(null);
    const { data: blogPosts = [], isLoading } = useBlogs();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading our latest blogs...</p>
            </div>
        );
    }

    if (blogPosts.length === 0) {
        return null; // Or show a placeholder
    }

    return (
        <section className="bg-white pt-12 pb-2 md:pt-16 md:pb-4 overflow-hidden">
            <div className="container mx-auto px-4 md:px-24">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-14">
                    <h2 className="text-2xl md:text-4xl font-['Poppins'] font-bold text-gray-900 mb-3">
                        Our Recent <span className="text-primary">Blogs</span>
                    </h2>
                    <div className="w-24 md:w-32 h-1 bg-primary mx-auto rounded-full" />
                </div>

                {/* Slider Container */}
                <div className="relative">
                    {/* Left Navigation Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 md:-left-20 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8"
                    >
                        {blogPosts.map((post) => (
                            <motion.div
                                key={post._id || post.id}
                                whileHover={{ y: -5 }}
                                className="flex-shrink-0 w-[280px] md:w-[400px] relative mt-4 mb-4"
                            >
                                <Link to={`/blog/${post.slug}`}>
                                    {/* Image Container (Background Layer) */}
                                    <div className="h-[160px] md:h-[280px] w-full rounded-2xl overflow-hidden relative z-0 shadow-sm">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                                    </div>

                                    {/* Floating Content Card (Top Layer) */}
                                    <div className="bg-white rounded-2xl shadow-xl p-2 md:p-3 mx-2 md:mx-4 relative z-10 -mt-16 md:-mt-28 border border-gray-100">
                                        {/* Meta Header */}
                                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                                                    <img src={logoImg} alt="FarmLyf" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold">{post.author}</span>
                                                    <span className="text-[10px]">{post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                                    {post.category}
                                                </span>
                                                <Share2
                                                    size={14}
                                                    className="text-gray-400 hover:text-primary cursor-pointer z-20 relative"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const shareUrl = `${window.location.origin}/blog/${post.slug}`;
                                                        if (navigator.share) {
                                                            navigator.share({
                                                                title: post.title,
                                                                text: post.excerpt,
                                                                url: shareUrl,
                                                            }).catch(console.error);
                                                        } else {
                                                            navigator.clipboard.writeText(shareUrl)
                                                                .then(() => toast.success('Link copied to clipboard!'))
                                                                .catch((err) => {
                                                                    console.error(err);
                                                                    toast.error('Failed to copy link');
                                                                });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xs md:text-base font-bold text-gray-900 mb-1 md:mb-2 leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                                            {post.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-[10px] md:text-xs text-gray-600 mb-1 md:mb-2 line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        {/* Read More */}
                                        <div className="text-[10px] md:text-sm font-bold text-gray-900 hover:text-primary flex items-center gap-1 group transition-colors">
                                            Read More
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Navigation Button */}
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

export default BlogSection;
