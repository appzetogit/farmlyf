import React, { useState, useEffect } from 'react';
import {
    Layout,
    Link as LinkIcon,
    Facebook,
    Instagram,
    Twitter,
    Plus,
    Trash2,
    Edit2,
    Save,
    Move,
    MapPin,
    Heart,
    ThumbsUp,
    Phone,
    Mail,
    Globe,
    ArrowLeft,
    RotateCcw,
    Award,
    Truck,
    ShieldCheck,
    Star,
    Leaf,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebsiteContent, useUpdateWebsiteContent } from '../../../hooks/useContent';

const DEFAULT_FOOTER_CONFIG = {
    brand: {
        description: "Fine, hand-picked dry fruits from around the globe. Quality that nourishes."
    },
    socials: {
        facebook: '#',
        instagram: '#',
        twitter: '#'
    },
    columns: [
        {
            id: 'col1',
            title: 'Quick Shop',
            links: [
                { label: 'Daily Health', url: '/shop' },
                { label: 'Family Packs', url: '/shop?category=packs' },
                { label: 'Energy & Fitness', url: '/shop?tag=energy' },
                { label: 'Festival', url: '/shop?tag=festival' },
                { label: 'Gifting', url: '/shop?tag=gifting' }
            ]
        },
        {
            id: 'col2',
            title: 'Information',
            links: [
                { label: 'About Us', url: '/about-us' },
                { label: 'Track Order', url: '/orders' },
                { label: 'Returns', url: '/returns' },
                { label: 'Privacy Policy', url: '/privacy-policy' },
                { label: 'Terms & Conditions', url: '/terms-conditions' }
            ]
        }
    ],
    contact: {
        address: "Office No 501, Princess center, 5th Floor, New Palasia, Indore, 452001",
        phone: "+91 98765 43210",
        email: "support@farmlyf.com"
    },
    badges: [
        { icon: 'Award', text: 'Certified Quality' },
        { icon: 'Truck', text: 'Pan-India Delivery' },
        { icon: 'ShieldCheck', text: 'Secure Checkout' },
        { icon: 'RotateCcw', text: '7-Day Return' }
    ]
};

const FooterManagerPage = () => {
    const navigate = useNavigate();
    const { data: serverConfig, isLoading } = useWebsiteContent('footer-config');
    const updateMutation = useUpdateWebsiteContent('footer-config');
    const [config, setConfig] = useState(DEFAULT_FOOTER_CONFIG);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (serverConfig?.content) {
            setConfig(serverConfig.content);
        }
    }, [serverConfig]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                title: 'Footer Configuration',
                content: config,
                slug: 'footer-config'
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save footer config", error);
        }
    };

    const handleReset = () => {
        if (window.confirm("Reset footer to default settings?")) {
            setConfig(DEFAULT_FOOTER_CONFIG);
        }
    };

    const updateNestedState = (path, value) => {
        setConfig(prev => {
            const newState = { ...prev };
            let current = newState;
            const parts = path.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newState;
        });
    };

    // Link Management
    const addLink = (colIndex) => {
        const newColumns = [...config.columns];
        newColumns[colIndex].links.push({ label: 'New Link', url: '#' });
        setConfig({ ...config, columns: newColumns });
    };

    const updateLink = (colIndex, linkIndex, field, value) => {
        const newColumns = [...config.columns];
        newColumns[colIndex].links[linkIndex][field] = value;
        setConfig({ ...config, columns: newColumns });
    };

    const removeLink = (colIndex, linkIndex) => {
        const newColumns = [...config.columns];
        newColumns[colIndex].links = newColumns[colIndex].links.filter((_, i) => i !== linkIndex);
        setConfig({ ...config, columns: newColumns });
    };

    const updateColumnTitle = (colIndex, value) => {
        const newColumns = [...config.columns];
        newColumns[colIndex].title = value;
        setConfig({ ...config, columns: newColumns });
    };

    // Badge Management
    const updateBadge = (index, field, value) => {
        const newBadges = [...config.badges];
        newBadges[index][field] = value;
        setConfig({ ...config, badges: newBadges });
    };

    const addBadge = () => {
        setConfig({ ...config, badges: [...config.badges, { icon: 'Star', text: 'New Badge' }] });
    };

    const removeBadge = (index) => {
        const newBadges = config.badges.filter((_, i) => i !== index);
        setConfig({ ...config, badges: newBadges });
    };

    const AVAILABLE_ICONS = ['Award', 'Truck', 'ShieldCheck', 'RotateCcw', 'Star', 'Leaf', 'Zap', 'Heart', 'ThumbsUp'];

    return (
        <div className="space-y-8 font-['Inter'] pb-32 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Footer Manager</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Customize website footer</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                        disabled={!isEditing}
                    >
                        <RotateCcw size={16} />
                        Reset Default
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Edit2 size={16} />
                            Edit Footer
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primaryDeep transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isEditing ? 'opacity-80 pointer-events-none' : ''}`}>
                {/* Brand & Socials Section */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Layout size={18} /> Brand Information
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Footer Description</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    rows="3"
                                    value={config.brand.description}
                                    onChange={(e) => updateNestedState('brand.description', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Globe size={18} /> Social Links
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Facebook size={12} /> Facebook URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    value={config.socials.facebook}
                                    onChange={(e) => updateNestedState('socials.facebook', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Instagram size={12} /> Instagram URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    value={config.socials.instagram}
                                    onChange={(e) => updateNestedState('socials.instagram', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Twitter size={12} /> Twitter URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    value={config.socials.twitter}
                                    onChange={(e) => updateNestedState('socials.twitter', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Phone size={18} /> Contact Details
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><MapPin size={10} className="inline mr-1" /> Address</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    rows="3"
                                    value={config.contact.address}
                                    onChange={(e) => updateNestedState('contact.address', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><Phone size={10} className="inline mr-1" /> Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                        value={config.contact.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            updateNestedState('contact.phone', value);
                                        }}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><Mail size={10} className="inline mr-1" /> Email</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-footerBg outline-none focus:border-black transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                        value={config.contact.email}
                                        onChange={(e) => updateNestedState('contact.email', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Link Columns */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isEditing ? 'opacity-80 pointer-events-none' : ''}`}>
                {config.columns.map((col, colIndex) => (
                    <div key={col.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <LinkIcon size={18} /> Column {colIndex + 1}
                            </h3>
                            <input
                                type="text"
                                value={col.title}
                                onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-black w-40 text-center disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Section Title"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-3">
                            {col.links.map((link, linkIndex) => (
                                <div key={linkIndex} className="flex gap-2 items-center group">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. About Us)"
                                            value={link.label}
                                            onChange={(e) => updateLink(colIndex, linkIndex, 'label', e.target.value)}
                                            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-medium text-footerBg focus:bg-white focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                            disabled={!isEditing}
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL (e.g. /about)"
                                            value={link.url}
                                            onChange={(e) => updateLink(colIndex, linkIndex, 'url', e.target.value)}
                                            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 focus:bg-white focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeLink(colIndex, linkIndex)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <button
                                onClick={() => addLink(colIndex)}
                                className="mt-6 w-full py-3 border border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Link
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Trust Badges Management */}
            <div className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm ${!isEditing ? 'opacity-80 pointer-events-none' : ''}`}>
                <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Award size={18} /> Trust Badges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {config.badges.map((badge, index) => (
                        <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative group">
                            {isEditing && (
                                <button
                                    onClick={() => removeBadge(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon</label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {AVAILABLE_ICONS.map(iconName => (
                                        <button
                                            key={iconName}
                                            onClick={() => updateBadge(index, 'icon', iconName)}
                                            className={`p-1.5 rounded-lg border transition-all ${badge.icon === iconName ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary'} ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}`}
                                            title={iconName}
                                            disabled={!isEditing}
                                        >
                                            {React.createElement({ Award, Truck, ShieldCheck, RotateCcw, Star, Leaf, Zap, Heart, ThumbsUp }[iconName], { size: 14 })}
                                        </button>
                                    ))}
                                </div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Text</label>
                                <input
                                    type="text"
                                    value={badge.text}
                                    onChange={(e) => updateBadge(index, 'text', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    ))}
                    {isEditing && (
                        <button
                            onClick={addBadge}
                            className="p-4 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all min-h-[160px]"
                        >
                            <Plus size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Add Badge</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FooterManagerPage;
