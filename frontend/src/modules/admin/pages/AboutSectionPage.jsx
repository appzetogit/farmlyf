import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    RotateCcw,
    ImageIcon,
    Type,
    AlignLeft,
    Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_DATA = {
    sectionLabel: 'Our Story',
    title: 'Freshness That',
    highlightedTitle: 'Connects Us!',
    description1: "Our journey began with a simple mission: to bring the finest, farm-fresh dry fruits and nuts directly to your doorstep. We believe that healthy eating shouldn't be a luxury.",
    description2: "Today, FarmLyf is a community of health enthusiasts. We source premium produce, ensuring every pack carries our promise of quality and nutrition.",
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1600',
    stats: [
        { id: 1, label: 'Outlets', value: '15+' },
        { id: 2, label: 'Happy Customers', value: '500,000+' },
        { id: 3, label: 'Orders Delivered', value: '750,000+' }
    ]
};

import { useAboutSection, useUpdateAboutSectionInfo } from '../../../hooks/useContent';

const AboutSectionPage = () => {
    const navigate = useNavigate();
    const { data: aboutData, isLoading: loading } = useAboutSection();
    const updateAboutMutation = useUpdateAboutSectionInfo();
    const [formData, setFormData] = useState(DEFAULT_DATA);

    // Sync formData with fetched data
    useEffect(() => {
        if (aboutData && Object.keys(aboutData).length > 0) {
            setFormData({
                ...DEFAULT_DATA,
                ...aboutData,
                stats: aboutData.stats || DEFAULT_DATA.stats
            });
        }
    }, [aboutData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStatChange = (id, field, value) => {
        const newStats = formData.stats.map(stat => {
            const isMatch = (stat._id && stat._id === id) || (stat.id && stat.id === id);
            return isMatch ? { ...stat, [field]: value } : stat;
        });
        setFormData(prev => ({ ...prev, stats: newStats }));
    };

    const handleSave = async () => {
        try {
            await updateAboutMutation.mutateAsync({ 
                data: {
                    title: 'About Us Section',
                    content: formData
                } 
            });
        } catch (error) {
            console.error('Failed to save about section:', error);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset to default content?')) {
            setFormData(DEFAULT_DATA);
            toast.success('Content reset to default');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">About Section</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage your brand story</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Reset Default
                    </button>
                     <button
                        onClick={handleSave}
                        disabled={updateAboutMutation.isPending}
                        className={`px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-gray-200 ${
                            updateAboutMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                        }`}
                    >
                        {updateAboutMutation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Edit Form */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Type size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Content Editor</h3>
                            <p className="text-xs text-gray-400">Update text and images</p>
                        </div>
                    </div>

                    {/* Headings */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Headings & Label</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Section Label</label>
                                <input
                                    type="text"
                                    value={formData.sectionLabel}
                                    onChange={(e) => handleChange('sectionLabel', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Main Title Start</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Highlighted Text</label>
                                <input
                                    type="text"
                                    value={formData.highlightedTitle}
                                    onChange={(e) => handleChange('highlightedTitle', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-primary focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Visual Asset</label>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Image URL</label>
                            <div className="relative">
                                <ImageIcon size={16} className="absolute left-4 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => handleChange('image', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-gray-600 focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Description Paragraphs</label>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Paragraph 1 (Main Info)</label>
                                <textarea
                                    rows="3"
                                    value={formData.description1}
                                    onChange={(e) => handleChange('description1', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Paragraph 2 (Additional Info)</label>
                                <textarea
                                    rows="3"
                                    value={formData.description2}
                                    onChange={(e) => handleChange('description2', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats - Edit Only */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Key Statistics</label>
                        <div className="grid grid-cols-1 gap-4">
                            {formData.stats.map((stat, index) => (
                                <div key={stat.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs shadow-sm border border-gray-100">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Value</label>
                                        <input
                                            type="text"
                                            value={stat.value}
                                            onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-black text-gray-900 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="flex-[2] space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Label</label>
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview - Replicating AboutSection Component Structure */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Live Preview</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">Desktop View</span>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
                        {/* Simulation of About Section Component */}
                        <div className="p-8 md:p-12">
                            <div className="flex flex-col gap-10">

                                {/* Image Area */}
                                <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-lg group">
                                    <div className="absolute inset-0 border-2 border-primary/30 rounded-[24px] -m-3 md:-m-4 z-0 pointer-events-none" />
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover relative z-10"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Invalid+Image+URL'}
                                    />

                                    {/* Mobile Stats Overlay Simulation (Visual only, usually hidden on desktop but showing here for context) */}
                                    <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white shadow-lg rounded-xl py-2 z-20 scale-75 origin-right hidden sm:flex flex-col">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <span className="block font-black text-gray-900">{formData.stats[0]?.value}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-bold">{formData.stats[0]?.label}</span>
                                        </div>
                                        <div className="px-4 py-2">
                                            <span className="block font-black text-gray-900">{formData.stats[1]?.value}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-bold">{formData.stats[1]?.label}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{formData.sectionLabel}</h3>
                                        <h2 className="text-3xl font-bold text-[#1a1a1a] leading-tight">
                                            {formData.title} <span className="text-primary">{formData.highlightedTitle}</span>
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {formData.description1}
                                        </p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {formData.description2}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100">
                                        {formData.stats.map((stat, idx) => (
                                            <div key={stat.id} className="flex flex-col">
                                                <span className="text-2xl font-black text-[#1a1a1a] mb-1">{stat.value}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-0.5 bg-primary rounded-full" />
                                                    <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">{stat.label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSectionPage;
