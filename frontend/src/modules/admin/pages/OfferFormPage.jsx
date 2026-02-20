import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ImageIcon,
    Package,
    Info,
    Search,
    CheckCircle2,
    Zap,
    Link as LinkIcon
} from 'lucide-react';
import { useProducts, useUploadImage } from '../../../hooks/useProducts';
import { useOffer, useAddOffer, useUpdateOffer } from '../../../hooks/useOffers';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const OfferFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const { data: products = [] } = useProducts();
    const { data: offerToEdit, isLoading: isOfferLoading } = useOffer(id);
    
    const addOfferMutation = useAddOffer();
    const updateOfferMutation = useUpdateOffer();
    const uploadImageMutation = useUploadImage();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        products: [],
        isActive: true,
        targetLink: ''
    });

    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isEdit && offerToEdit) {
            setFormData({
                ...offerToEdit,
                products: offerToEdit.products?.map(p => typeof p === 'object' ? p._id : p) || []
            });
        }
    }, [isEdit, offerToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'title' && !isEdit && !prev.slug) {
                newData.slug = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                newData.targetLink = `/offers/${newData.slug}`;
            }
            if (name === 'slug') {
                newData.targetLink = `/offers/${value}`;
            }
            return newData;
        });
    };

    const toggleProduct = (productId) => {
        setFormData(prev => {
            const current = prev.products || [];
            if (current.includes(productId)) {
                return { ...prev, products: current.filter(id => id !== productId) };
            } else {
                return { ...prev, products: [...current, productId] };
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (isEdit) {
            updateOfferMutation.mutate({ id, data: formData }, {
                onSuccess: () => navigate('/admin/offers')
            });
        } else {
            addOfferMutation.mutate(formData, {
                onSuccess: () => navigate('/admin/offers')
            });
        }
    };

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products.slice(0, 50);
        return products.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.id?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [products, productSearch]);

    if (isEdit && isOfferLoading) {
        return <div className="py-20 text-center font-black text-gray-400 animate-pulse">LOADING OFFER...</div>;
    }

    return (
        <div className="space-y-10 pb-20 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/offers')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                            {isEdit ? 'Edit Offer' : 'Create New Offer'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                            Configure curated collections for marketing banners
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={addOfferMutation.isPending || updateOfferMutation.isPending}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    <Save size={18} /> {isEdit ? 'Update Offer' : 'Save Offer'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: General Info & Product Selection */}
                <div className="lg:col-span-8 space-y-8">
                    {/* General Settings */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-300 shadow-sm space-y-8">
                        <h3 className="text-lg font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Info size={20} className="text-primary" />
                            General Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Offer Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Summer Refreshments"
                                    className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="summer-refreshments"
                                        className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        name="isActive"
                                        value={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                        className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="true">Live / Active</option>
                                        <option value="false">Hidden / Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Brief summary displayed on the offer page..."
                                    className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-300 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Package size={20} className="text-primary" />
                                Linked Products
                            </h3>
                            <span className="text-[10px] font-black text-footerBg bg-gray-100 px-3 py-1 rounded-full border border-gray-200 uppercase tracking-widest">
                                {formData.products?.length || 0} Selected
                            </span>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredProducts.map(p => {
                                const isSelected = formData.products.includes(p._id);
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => toggleProduct(p._id)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group ${
                                            isSelected 
                                            ? 'bg-primary/5 border-primary' 
                                            : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                            isSelected 
                                            ? 'bg-primary border-primary' 
                                            : 'bg-white border-gray-200 group-hover:border-gray-300'
                                        }`}>
                                            {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                        {p.image && (
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg p-1 border border-gray-100 shrink-0">
                                                <img src={p.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-black truncate ${isSelected ? 'text-primary' : 'text-footerBg'}`}>
                                                {p.name}
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                {p.variants?.[0]?.weight || 'Standard'} • ₹{p.variants?.[0]?.price || 0}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Media & Preview - REMOVED BANNER */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Target Link Info */}
                    <div className="bg-footerBg p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                            <Zap size={100} />
                        </div>
                        <div className="relative space-y-4">
                            <div className="flex items-center gap-2">
                                <LinkIcon size={18} className="text-primary shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Generated Target Link</h3>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase leading-relaxed">
                                    Use this link in your Banners or SMS campaigns to direct users to this collection.
                                </p>
                                <div className="flex items-center gap-2 bg-black/20 p-3 rounded-xl border border-white/5 group/link">
                                    <code className="text-xs font-black text-primary truncate flex-1">
                                        {formData.targetLink || '/offers/your-slug'}
                                    </code>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(formData.targetLink);
                                            toast.success('Link copied!');
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center pt-2">
                                Collection ID: {id || 'PENDING'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferFormPage;
