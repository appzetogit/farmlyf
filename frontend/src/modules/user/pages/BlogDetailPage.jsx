import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBlogBySlug } from '../../../hooks/useContent';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const { data: blog, isLoading, error } = useBlogBySlug(slug);

    const handleShare = async () => {
        const shareData = {
            title: blog.title,
            text: `Check out this article: ${blog.title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy link:', err);
                toast.error('Failed to copy link');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
                <p className="text-gray-600 mb-8 text-center">Sorry, the blog post you are looking for doesn't exist or has been moved.</p>
                <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all">
                    Back to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Image Header */}
            <div className="relative h-[30vh] md:h-[60vh] w-full">
                <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-0 py-5 md:py-12">
                <div className="max-w-6xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-xs uppercase tracking-widest">Back</span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2">
                        <span className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                            <User size={14} />
                            {blog.author}
                        </span>
                    </div>

                    <h1 className="text-xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                        {blog.title}
                    </h1>

                    <div className="overflow-hidden">
                        <div
                            className="prose prose-base md:prose-lg max-w-none prose-img:rounded-3xl prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Share & Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-900">Share this article:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleShare}
                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aesthetic CSS for Prose */}
            <style>{`
                .prose {
                    color: #4b5563;
                    text-align: left;
                }
                .prose h1, .prose h2, .prose h3, .prose h4 {
                    color: #111827;
                    font-weight: 800;
                    margin-top: 2em;
                    margin-bottom: 0.5em;
                }
                .prose p, .prose li {
                    margin-bottom: 1.5em;
                    line-height: 1.8;
                    font-size: 1.25rem;
                    text-align: left;
                }
                .prose li {
                    margin-bottom: 0.5em;
                }
                .prose blockquote {
                    border-left: 4px solid #16a34a;
                    padding-left: 1.5em;
                    font-style: italic;
                    color: #4b5563;
                }
                .prose ul {
                    list-style-type: disc;
                    padding-left: 1.5em;
                    margin-bottom: 1.5em;
                }
            `}</style>
        </div>
    );
};

export default BlogDetailPage;
