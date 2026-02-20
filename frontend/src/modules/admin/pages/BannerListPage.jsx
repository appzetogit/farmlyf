import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader, ExternalLink, Edit2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useBanners, useAddBanner, useDeleteBanner, useUpdateBanner } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';
import { useOffers } from '../../../hooks/useOffers';

const BannerListPage = () => {
    const { data: banners = [], isLoading: loading } = useBanners();
    const addBannerMutation = useAddBanner();
    const updateBannerMutation = useUpdateBanner();
    const deleteBannerMutation = useDeleteBanner();
    const uploadImageMutation = useUploadImage();
    const { data: offers = [] } = useOffers();

    const defaultPromoCard = {
        topBadge: 'Hot Deal',
        badgeText1: 'Upto',
        discountTitle: '60',
        discountSuffix: '%',
        discountLabel: 'OFF',
        extraDiscountSubtitle: 'EXTRA SAVE',
        extraDiscount: '15',
        extraDiscountSuffix: '%',
        couponCode: 'FRESH20',
        showCouponCode: true,
        isVisible: false
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: 'Slide', subtitle: '', badgeText: '',
        ctaText: 'Shop Now', link: '/', section: 'hero',
        image: '', publicId: '', slides: [], isActive: true,
        promoCard: { ...defaultPromoCard }
    });

    const [preview, setPreview] = useState(null);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [offerDropdownOpen, setOfferDropdownOpen] = useState(false);
    const [linkSearch, setLinkSearch] = useState('');
    const [editMode, setEditMode] = useState('banner');

    const activeSlide = (formData.slides && formData.slides[activeSlideIndex]) || null;

    const resetForm = () => {
        setFormData({
            title: 'Slide', subtitle: '', badgeText: '',
            ctaText: 'Shop Now', link: '/', section: 'hero',
            image: '', publicId: '', slides: [], isActive: true,
            promoCard: { ...defaultPromoCard }
        });
        setPreview(null);
        setIsEditing(false);
        setEditId(null);
        setActiveSlideIndex(0);
    };

    const handleAddSlide = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const res = await uploadImageMutation.mutateAsync(file);
            if (res?.url) {
                const newSlide = { image: res.url, publicId: res.publicId, link: '/', ctaText: 'Shop Now' };
                setFormData(prev => {
                    const updatedSlides = [...(prev.slides || []), newSlide];
                    return { ...prev, image: updatedSlides[0].image, publicId: updatedSlides[0].publicId, slides: updatedSlides };
                });
                if (!formData.image) setPreview(res.url);
                setActiveSlideIndex((formData.slides || []).length);
            }
        } catch (error) { toast.error('Upload failed'); }
        if (e.target) e.target.value = '';
    };

    const handleReplaceSlideImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const res = await uploadImageMutation.mutateAsync(file);
            if (res?.url) {
                setFormData(prev => {
                    const updatedSlides = [...(prev.slides || [])];
                    if (updatedSlides[activeSlideIndex]) {
                        updatedSlides[activeSlideIndex] = {
                            ...updatedSlides[activeSlideIndex],
                            image: res.url,
                            publicId: res.publicId
                        };
                    }
                    const rootUpdates = activeSlideIndex === 0 ? { image: res.url, publicId: res.publicId } : {};
                    return { ...prev, slides: updatedSlides, ...rootUpdates };
                });
                toast.success('Image replaced');
            }
        } catch (error) { toast.error('Replacement failed'); }
        if (e.target) e.target.value = '';
    };

    const removeSlide = (index) => {
        setFormData(prev => {
            const updatedSlides = (prev.slides || []).filter((_, i) => i !== index);
            return {
                ...prev,
                image: updatedSlides.length > 0 ? updatedSlides[0].image : '',
                publicId: updatedSlides.length > 0 ? updatedSlides[0].publicId : '',
                slides: updatedSlides
            };
        });
        if ((formData.slides || []).length <= 1) setPreview(null);
        if (activeSlideIndex >= index && activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
    };

    const handleEdit = (banner) => {
        const migratedSlides = (banner.slides && banner.slides.length > 0)
            ? banner.slides.map(s => ({ ...s, link: s.link || banner.link || '/', ctaText: s.ctaText || banner.ctaText || 'Shop Now' }))
            : (banner.image ? [{ image: banner.image, publicId: banner.publicId, link: banner.link || '/', ctaText: banner.ctaText || 'Shop Now' }] : []);

        setFormData({
            title: banner.title || 'Slide', subtitle: banner.subtitle || '', badgeText: banner.badgeText || '',
            ctaText: banner.ctaText || 'Shop Now', link: banner.link || '/', section: banner.section || 'hero',
            image: banner.image || '', publicId: banner.publicId || '', slides: migratedSlides, isActive: banner.isActive !== false,
            promoCard: banner.promoCard ? { ...defaultPromoCard, ...banner.promoCard } : { ...defaultPromoCard }
        });
        setPreview(banner.image);
        setIsEditing(true);
        setEditId(banner._id || banner.id);
        setActiveSlideIndex(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateActiveSlide = (key, value) => {
        setFormData(prev => {
            const updatedSlides = [...(prev.slides || [])];
            if (updatedSlides[activeSlideIndex]) {
                updatedSlides[activeSlideIndex] = { ...updatedSlides[activeSlideIndex], [key]: value };
            }
            // Also update root for legacy/fallback support if it's the first slide
            const rootUpdates = activeSlideIndex === 0 ? { [key]: value } : {};
            return { ...prev, slides: updatedSlides, ...rootUpdates };
        });
    };

    const filteredOfferLinks = offers.filter(o =>
        o.title.toLowerCase().includes(linkSearch.toLowerCase()) ||
        o.targetLink.toLowerCase().includes(linkSearch.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image && (!formData.slides || formData.slides.length === 0)) {
            toast.error('Please upload at least one image'); return;
        }
        try {
            if (isEditing) { await updateBannerMutation.mutateAsync({ id: editId, data: formData }); }
            else { await addBannerMutation.mutateAsync({ ...formData, order: banners.length + 1 }); }
            resetForm();
            toast.success(isEditing ? 'Banner updated' : 'Banner published');
        } catch (error) { toast.error('Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        deleteBannerMutation.mutate(id);
    };

    return (
        <div className="p-4 md:p-6 max-w-[1250px] mx-auto min-h-screen bg-transparent">
            <Toaster position="top-right" />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{isEditing ? 'Edit Banner' : 'New Banner'}</h2>
                            <p className="text-xs text-gray-400 mt-1 font-medium italic">Customize your billboard carousel</p>
                        </div>

                        {activeSlide && (
                            <div className="mb-6 aspect-[21/9] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner group/preview">
                                <img src={activeSlide.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 pointer-events-none">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-lg">
                                            {formData.badgeText || 'SPECIAL'}
                                        </span>
                                    </div>
                                    <h4 className="text-white font-black leading-tight text-lg mb-0.5 truncate drop-shadow-md">
                                        {activeSlide.title || formData.title}
                                    </h4>
                                    <p className="text-white/80 text-[7px] font-bold max-w-[80%] mb-2 leading-tight drop-shadow-md italic underline-offset-2">
                                        {activeSlide.subtitle || formData.subtitle || 'Perfect for your premium needs'}
                                    </p>
                                    <button className="bg-white text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all shadow-xl w-fit">
                                        {activeSlide.ctaText || 'Shop Now'}
                                    </button>
                                </div>
                                {formData.promoCard?.isVisible && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-lg border border-white/40 shadow-xl z-20 scale-[0.4] origin-right pointer-events-none">
                                        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg h-fit w-fit">{formData.promoCard?.topBadge}</div>
                                        <div className="text-center font-sans">
                                            <p className="text-gray-500 font-bold text-[8px] uppercase">{formData.promoCard?.badgeText1}</p>
                                            <div className="flex items-baseline gap-0.5 justify-center leading-none">
                                                <span className="text-3xl font-black text-red-500">{formData.promoCard?.discountTitle}</span>
                                                <span className="text-lg font-black text-gray-800">{formData.promoCard?.discountSuffix}</span>
                                            </div>
                                            <div className="w-8 h-0.5 bg-primary/30 mx-auto rounded-full my-1"></div>
                                            <p className="text-gray-500 font-bold text-[8px] uppercase leading-none">{formData.promoCard?.extraDiscountSubtitle}</p>
                                            <div className="flex items-baseline gap-0.5 justify-center mt-0.5">
                                                <span className="text-xl font-black text-primary">{formData.promoCard?.extraDiscount}</span>
                                                <span className="text-sm font-bold text-gray-800">{formData.promoCard?.extraDiscountSuffix}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[7px] font-bold text-white uppercase border border-white/10 z-20">Slide {activeSlideIndex + 1}/{formData.slides.length}</div>
                            </div>
                        )}

                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-6">
                            {['banner', 'promo'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setEditMode(tab)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${editMode === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab === 'banner' ? 'Banner Settings' : 'Offer Box'}
                                </button>
                            ))}
                        </div>

                        {editMode === 'banner' ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-800 uppercase tracking-tighter">Slides ({formData.slides.length})</label>
                                        <div className="relative h-8 px-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors group">
                                            <input type="file" onChange={handleAddSlide} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {uploadImageMutation.isPending ? <Loader size={14} className="animate-spin text-primary" /> : <div className="flex items-center gap-1.5"><Plus size={14} className="text-primary group-hover:scale-125 transition-transform" /><span className="text-[10px] font-bold text-primary">ADD</span></div>}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                        {(formData.slides || []).map((slide, idx) => (
                                            <div key={idx} onClick={() => setActiveSlideIndex(idx)} className={`relative shrink-0 w-16 h-11 rounded-lg overflow-hidden cursor-pointer transition-all ${activeSlideIndex === idx ? 'ring-2 ring-primary scale-105' : 'ring-1 ring-gray-100 opacity-60'}`}>
                                                <img src={slide.image} className="w-full h-full object-cover" alt="" />
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeSlide(idx); }} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><X size={8} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {activeSlide && (
                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Slide</label>
                                                <div className="relative h-7 px-2 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors group">
                                                    <input type="file" onChange={handleReplaceSlideImage} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    <div className="flex items-center gap-1"><ImageIcon size={10} className="text-gray-500" /><span className="text-[9px] font-bold text-gray-600">CHANGE IMAGE</span></div>
                                                </div>
                                            </div>
                                            <input type="text" value={activeSlide.ctaText ?? ''} onChange={(e) => updateActiveSlide('ctaText', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all" placeholder="Button Label" />
                                            <div className="relative group/link">
                                                <div className="flex items-center gap-2 mb-1 justify-between">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Redirect URL</label>
                                                    {offers.some(o => o.targetLink === activeSlide.link) && (
                                                        <span className="bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase shadow-sm shadow-primary/20">Offer Linked</span>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <ExternalLink size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 z-10" />
                                                    <input
                                                        type="text"
                                                        value={activeSlide.link ?? ''}
                                                        onChange={(e) => {
                                                            updateActiveSlide('link', e.target.value);
                                                            setLinkSearch(e.target.value);
                                                        }}
                                                        onFocus={() => setOfferDropdownOpen(true)}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                                                        placeholder="URL or select offer..."
                                                    />

                                                    <AnimatePresence>
                                                        {offerDropdownOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-20" onClick={() => setOfferDropdownOpen(false)} />
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar"
                                                                >
                                                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Available Offers</p>
                                                                    </div>
                                                                    {filteredOfferLinks.length > 0 ? (
                                                                        filteredOfferLinks.map(offer => (
                                                                            <button
                                                                                key={offer._id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    updateActiveSlide('link', offer.targetLink);
                                                                                    setOfferDropdownOpen(false);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 text-left transition-colors border-b border-gray-50 last:border-0 group"
                                                                            >
                                                                                <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                                                                                    {offer.products?.[0]?.image ? (
                                                                                        <img src={offer.products[0].image} className="w-full h-full object-contain" alt="" />
                                                                                    ) : (
                                                                                        <ImageIcon size={14} className="text-gray-300" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{offer.title}</p>
                                                                                    <p className="text-[9px] font-medium text-gray-400 truncate">{offer.targetLink}</p>
                                                                                </div>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-4 text-center">
                                                                            <p className="text-[10px] font-bold text-gray-300 uppercase italic">No matching offers</p>
                                                                        </div>
                                                                    )}

                                                                    <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Links</p>
                                                                    </div>
                                                                    {[
                                                                        { label: 'Home Page', path: '/' },
                                                                        { label: 'Product Catalog', path: '/catalog' },
                                                                        { label: 'User Profile', path: '/profile' }
                                                                    ].map(link => (
                                                                        <button
                                                                            key={link.path}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                updateActiveSlide('link', link.path);
                                                                                setOfferDropdownOpen(false);
                                                                            }}
                                                                            className="w-full p-2.5 px-4 text-left hover:bg-primary/5 transition-colors"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[11px] font-bold text-gray-700">{link.label}</span>
                                                                                <span className="text-[9px] font-medium text-gray-400">{link.path}</span>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Banner Info (Current Slide)</label>
                                            <input type="text" value={activeSlide.title ?? ''} onChange={(e) => updateActiveSlide('title', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all" placeholder="Title" />
                                            <input type="text" value={activeSlide.subtitle ?? ''} onChange={(e) => updateActiveSlide('subtitle', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all" placeholder="Subtitle" />
                                            <input type="text" value={activeSlide.badgeText ?? ''} onChange={(e) => updateActiveSlide('badgeText', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all" placeholder="Badge" />
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Banner Active</span>
                                            <label className="relative inline-flex items-center cursor-pointer scale-75">
                                                <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                                                <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full"></div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2 text-left">
                                    {isEditing && <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-tighter py-3 rounded-xl transition-all">Discard</button>}
                                    <button type="submit" disabled={addBannerMutation.isPending || updateBannerMutation.isPending || (formData.slides && formData.slides.length === 0)} className="flex-[2] bg-primary hover:bg-primaryDeep disabled:opacity-70 text-white text-[10px] font-black uppercase tracking-tighter py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                        {(addBannerMutation.isPending || updateBannerMutation.isPending) ? <Loader size={16} className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Publish Banner')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Offer Box Visible</span>
                                        <span className="text-[8px] text-gray-400 font-medium">Show overlay on this banner</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-75">
                                        <input type="checkbox" className="sr-only peer" checked={formData.promoCard?.isVisible} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, isVisible: e.target.checked } }))} />
                                        <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Top Badge</label>
                                            <input type="text" value={formData.promoCard?.topBadge} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, topBadge: e.target.value } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Discount Title</label>
                                            <input type="text" value={formData.promoCard?.discountTitle} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, discountTitle: e.target.value } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Extra Discount Text</label>
                                        <input type="text" value={formData.promoCard?.extraDiscountSubtitle} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, extraDiscountSubtitle: e.target.value } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Extra Discount Value</label>
                                            <input type="text" value={formData.promoCard?.extraDiscount} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, extraDiscount: e.target.value } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Coupon Code</label>
                                            <input type="text" value={formData.promoCard?.couponCode} onChange={(e) => setFormData(prev => ({ ...prev, promoCard: { ...prev.promoCard, couponCode: e.target.value } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all uppercase" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-[10px] text-blue-600 font-bold text-center uppercase tracking-wide">
                                        Save changes by clicking "Save Changes" in the main Banner Settings tab.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Sequence</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage your active billboard carousel</p>
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-primary border border-primary/10 shadow-sm uppercase tracking-wider">{banners.length} Active</div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100"><Loader className="animate-spin mb-4 text-primary" /><p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic font-black">Syncing Billboard...</p></div>
                    ) : (
                        <div className="space-y-4">
                            {banners.map((banner) => (
                                <div key={banner._id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex items-center gap-5 group ${editId === banner._id ? 'border-primary ring-4 ring-primary/5' : 'border-gray-50 hover:border-gray-200 hover:shadow-md'}`}>
                                    <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative border border-gray-100">
                                        <img src={banner.image || (banner.slides?.[0]?.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-white/10">{banner.slides?.length || 1} Slides</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <button
                                                onClick={() => updateBannerMutation.mutate({ id: banner._id || banner.id, data: { ...banner, isActive: banner.isActive === false } })}
                                                className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter border transition-all hover:scale-105 active:scale-95 ${banner.isActive !== false ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                            >
                                                {banner.isActive !== false ? 'LIVE' : 'HIDDEN'}
                                            </button>
                                            <h3 className="text-xs font-black text-gray-900 truncate uppercase tracking-tight italic">{banner.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold italic truncate"><ExternalLink size={10} className="text-primary" />{banner.link || '/'}</div>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <button onClick={() => handleEdit(banner)} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-gray-50"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(banner._id)} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-50"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {banners.length === 0 && <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-50"><ImageIcon size={32} className="mx-auto text-gray-200 mb-4" /><h3 className="text-gray-900 font-black uppercase tracking-widest italic">Empty Sequence</h3><p className="text-gray-400 text-[10px] mt-1 font-bold">Add slides to start.</p></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerListPage;
