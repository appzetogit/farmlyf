import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    RotateCcw,
    Edit2,
    HelpCircle, // Fallback icon
    Upload,
    ImageIcon,
    Trash2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';

// Removed fixed ICON_OPTIONS to allow dynamic input

// Default Data matching the HealthBenefitsSection component
const DEFAULT_DATA = {
    title: "Health Benefits",
    subtitle: "Discover the amazing benefits of premium dry fruits for your health and wellness",
    benefits: [
        {
            id: 1,
            icon: 'Heart',
            title: "Heart Health",
            description: "Rich in omega-3 fatty acids and antioxidants that support cardiovascular health.",
            baseColor: "#006071"
        },
        {
            id: 2,
            icon: 'Brain',
            title: "Brain Function",
            description: "Enhance cognitive function, memory, and mental clarity with essential nutrients.",
            baseColor: "#67705B"
        },
        {
            id: 3,
            icon: 'Zap',
            title: "Energy Boost",
            description: "Natural sustained energy from healthy fats and proteins.",
            baseColor: "#902D45"
        },
        {
            id: 4,
            icon: 'Shield',
            title: "Immunity",
            description: "Strengthen your immune system with vitamin E and antioxidants.",
            baseColor: "#7E3021"
        },
        {
            id: 5,
            icon: 'Scale',
            title: "Weight Balance",
            description: "High protein and fiber content helps maintain healthy weight goals.",
            baseColor: "#C08552"
        }
    ]
};

import { useHealthBenefits, useUpdateHealthBenefitSection } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';

const HealthBenefitsSectionPage = () => {
    const navigate = useNavigate();
    const { data: healthData, isLoading: loading } = useHealthBenefits();
    const updateHealthMutation = useUpdateHealthBenefitSection();
    const uploadImageMutation = useUploadImage();

    const [formData, setFormData] = useState(DEFAULT_DATA);
    const [editModal, setEditModal] = useState(null); // { bucketId, ...data }
    const [isSaving, setIsSaving] = useState(false);

    // Sync formData with fetched data
    useEffect(() => {
        if (healthData && Object.keys(healthData).length > 0) {
            setFormData({
                ...DEFAULT_DATA,
                ...healthData,
                benefits: healthData.benefits || DEFAULT_DATA.benefits
            });
        }
    }, [healthData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                subtitle: formData.subtitle,
                benefits: (formData.benefits || []).map((benefit) => ({
                    icon: benefit.icon,
                    title: benefit.title,
                    description: benefit.description,
                    baseColor: benefit.baseColor
                })),
                isActive: formData.isActive !== false
            };
            await updateHealthMutation.mutateAsync({
                data: payload
            });
            toast.success('Changes saved successfully to database!');
        } catch (error) {
            toast.error(error.message || 'Failed to save changes to database');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset to default content?')) {
            setFormData(DEFAULT_DATA);
            toast.success('Content reset to default (Save to persist)');
        }
    };

    const handleEditCard = (card) => {
        setEditModal({ ...card });
    };

    const saveCard = () => {
        let matchFound = false;
        const updatedBenefits = formData.benefits.map(b => {
            const isMatch = (b._id && b._id === editModal._id) || (b.id && b.id === editModal.id);
            if (isMatch) matchFound = true;
            return isMatch ? editModal : b;
        });

        if (!matchFound) {
            console.warn('Could not find matching benefit to update. b._id:', formData.benefits.map(b => b._id), 'editModal._id:', editModal._id);
            toast.error('Error: Could not identify which card to update.');
            return;
        }

        setFormData(prev => ({ ...prev, benefits: updatedBenefits }));
        setEditModal(null);
        toast.success('Card updated locally (Save Changes to persist)');
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
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Health Benefits Section</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage benefit cards</p>
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
                        disabled={isSaving}
                        className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-gray-200 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Section Title & Global Settings */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Section Header</label>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Main Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Subtitle</label>
                                <textarea
                                    rows="3"
                                    value={formData.subtitle}
                                    onChange={(e) => handleChange('subtitle', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-3xl border border-blue-100 p-6">
                        <h4 className="font-bold text-blue-900 mb-2 text-sm">Preview Note</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            The live preview below approximates the look of the actual homepage. In the real site, these cards have complex hover animations (flipping/expanding) which are simulated here as static or simplified states.
                        </p>
                    </div>
                </div>

                {/* Right Column: Cards Editor & Preview */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Cards List (Edit Mode) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.benefits.map((benefit, index) => {
                            const isUrl = benefit.icon && (
                                benefit.icon.includes('/') ||
                                benefit.icon.startsWith('data:') ||
                                /\.(png|jpg|jpeg|svg|webp|gif|bmp|avif)$/i.test(benefit.icon)
                            );

                            let IconComponent = HelpCircle;
                            if (!isUrl) {
                                const iconKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === (benefit.icon || '').toLowerCase());
                                IconComponent = LucideIcons[iconKey] || LucideIcons[benefit.icon] || HelpCircle;
                            }

                            // Ensure key is truly unique even if data is corrupted
                            const itemKey = benefit._id || benefit.id || `benefit-${index}`;
                            return (
                                <div key={itemKey} className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                    <button
                                        onClick={() => handleEditCard(benefit)}
                                        className="absolute top-3 right-3 p-2 bg-gray-50 text-gray-400 hover:bg-primary hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100" // Added z-index just in case
                                        style={{ zIndex: 10 }}
                                    >
                                        <Edit2 size={16} />
                                    </button>

                                    <div className="flex flex-col items-center text-center space-y-4 pt-2">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center mb-2 overflow-hidden"
                                            style={{ backgroundColor: `${benefit.baseColor}20`, color: benefit.baseColor }}
                                        >
                                            {isUrl ? (
                                                <img src={benefit.icon} alt={benefit.title} className="w-10 h-10 object-contain" />
                                            ) : (
                                                <IconComponent size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm mb-1" style={{ color: benefit.baseColor }}>{benefit.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2">{benefit.description}</p>
                                        </div>
                                        <div className="pt-2 w-full border-t border-gray-50 flex justify-between items-center text-[10px] font-mono text-gray-400">
                                            <span>Card #{index + 1}</span>
                                            <span style={{ color: benefit.baseColor }}>{benefit.baseColor}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Live Preview Section - Full Width */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-hidden">
                <div className="mb-8 text-center space-y-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Live Preview</h3>
                    <h2 className="text-2xl font-bold font-['Poppins'] text-[#1a1a1a]">{formData.title}</h2>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto">{formData.subtitle}</p>
                </div>

                <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-8 px-4">
                    {formData.benefits.map((benefit, index) => {
                        const isUrl = benefit.icon && (
                            benefit.icon.includes('/') ||
                            benefit.icon.startsWith('data:') ||
                            /\.(png|jpg|jpeg|svg|webp|gif|bmp|avif)$/i.test(benefit.icon)
                        );

                        let IconComponent = HelpCircle;
                        if (!isUrl) {
                            const iconKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === (benefit.icon || '').toLowerCase());
                            IconComponent = LucideIcons[iconKey] || LucideIcons[benefit.icon] || HelpCircle;
                        }

                        const itemKey = `preview-${benefit._id || benefit.id || index}`;
                        return (
                            <div key={itemKey} className="w-[200px] h-[280px] relative pt-12 flex-shrink-0"> {/* Added flex-shrink-0 to fix layout */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-2" style={{ borderColor: benefit.baseColor }}>
                                    <div style={{ color: benefit.baseColor }} className="w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                                        {isUrl ? (
                                            <img src={benefit.icon} alt="" className="w-14 h-14 object-contain" />
                                        ) : (
                                            <IconComponent size={40} />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="h-full w-full rounded-[24px] pt-14 px-4 pb-6 flex flex-col items-center text-center backdrop-blur-sm border shadow-md"
                                    style={{
                                        background: `linear-gradient(145deg, ${benefit.baseColor}40, ${benefit.baseColor}10)`,
                                        borderColor: `${benefit.baseColor}4D`
                                    }}
                                >
                                    <h3 className="font-bold text-lg mb-2" style={{ color: benefit.baseColor }}>{benefit.title}</h3>
                                    <p className="text-xs font-semibold" style={{ color: benefit.baseColor }}>{benefit.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Edit Card</h2>
                            <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                                <RotateCcw size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Icon Selection */}
                            {/* Icon Selection - Changed to Manual Input */}
                            {/* Icon Selection - Manual Input or Upload */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Icon (Upload or Name)</label>

                                <div className="space-y-3">
                                    {/* Preview & Remove */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                            {(() => {
                                                const isUrl = editModal.icon && (
                                                    editModal.icon.includes('/') ||
                                                    editModal.icon.startsWith('data:') ||
                                                    /\.(png|jpg|jpeg|svg|webp|gif|bmp|avif)$/i.test(editModal.icon)
                                                );

                                                if (isUrl) {
                                                    return <img src={editModal.icon} alt="Icon" className="w-full h-full object-contain p-2" />;
                                                }
                                                // Case insensitive
                                                const iconKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === (editModal.icon || '').toLowerCase());
                                                const IconC = LucideIcons[iconKey] || LucideIcons[editModal.icon] || HelpCircle;
                                                return <IconC size={24} className="text-gray-400" />;
                                            })()}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {/* File Upload */}
                                            <label className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-all flex items-center gap-2">
                                                {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Icon'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadImageMutation.isPending}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const res = await uploadImageMutation.mutateAsync(file);
                                                                if (res?.url) {
                                                                    setEditModal(prev => ({ ...prev, icon: res.url }));
                                                                }
                                                            } catch (error) {
                                                                // Toast handled by hook
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Upload size={14} />
                                            </label>

                                            {/* Legacy Text Input Toggle or direct input */}
                                            <input
                                                type="text"
                                                value={editModal.icon}
                                                onChange={(e) => setEditModal(prev => ({ ...prev, icon: e.target.value }))}
                                                placeholder="Or type Lucide icon name..."
                                                className="bg-transparent border-b border-gray-200 text-[10px] py-1 outline-none text-gray-500 focus:border-black transition-all"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        Upload a PNG/SVG or type a <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide icon name</a>.
                                    </p>
                                </div>
                            </div>

                            {/* Text Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Title</label>
                                    <input
                                        type="text"
                                        value={editModal.title}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        rows="3"
                                        value={editModal.description}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Theme Color (Hex Code)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl shadow-inner border border-gray-200" style={{ backgroundColor: editModal.baseColor }}></div>
                                        <input
                                            type="text"
                                            value={editModal.baseColor}
                                            onChange={(e) => setEditModal(prev => ({ ...prev, baseColor: e.target.value }))}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:bg-white focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setEditModal(null)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCard}
                                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primaryDeep shadow-lg shadow-primary/20 transition-all text-sm"
                            >
                                Update Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthBenefitsSectionPage;
