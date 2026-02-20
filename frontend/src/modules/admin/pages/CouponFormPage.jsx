import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    ArrowLeft,
    Save,
    Calendar,
    Settings,
    ShieldCheck,
    Info,
    CheckCircle2,
    Ticket,
    Percent,
    Zap,
    Users,
    Trash2,
    Plus,
    Tag,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = API_BASE_URL;

const CouponFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    // Fetch dependencies for scope
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/products`);
            return res.json();
        }
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/categories`);
            return res.json();
        }
    });

    const { data: subCategories = [] } = useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/subcategories`);
            return res.json();
        }
    });

    // Fetch Coupon Data if Edit
    const { data: editingCoupon } = useQuery({
        queryKey: ['coupon', id],
        queryFn: async () => {
            if (!isEdit) return null;
            const res = await fetch(`${API_URL}/coupons/${id}`);
            if (!res.ok) throw new Error('Failed to fetch coupon');
            return res.json();
        },
        enabled: isEdit
    });

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'flat',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
        perUserLimit: 1,
        active: true,
        userEligibility: 'all',
        description: '',
        applicabilityType: 'all',
        targetItems: []
    });

    useEffect(() => {
        if (isEdit && editingCoupon) {
            setFormData({
                ...editingCoupon,
                validFrom: editingCoupon.validFrom ? new Date(editingCoupon.validFrom).toISOString().split('T')[0] : '',
                validUntil: editingCoupon.validUntil ? new Date(editingCoupon.validUntil).toISOString().split('T')[0] : '',
                applicabilityType: editingCoupon.applicabilityType || 'all',
                targetItems: editingCoupon.targetItems || []
            });
        }
    }, [isEdit, editingCoupon]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleTargetItem = (itemValue) => {
        setFormData(prev => {
            const current = prev.targetItems || [];
            if (current.includes(itemValue)) {
                return { ...prev, targetItems: current.filter(i => i !== itemValue) };
            } else {
                return { ...prev, targetItems: [...current, itemValue] };
            }
        });
    };

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const url = isEdit ? `${API_URL}/coupons/${id}` : `${API_URL}/coupons`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Operation failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            toast.success(isEdit ? 'Updated!' : 'Created!');
            navigate('/admin/coupons');
        },
        onError: (err) => toast.error(err.message)
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.code || !formData.value) {
            return toast.error('Code and Value required');
        }
        setLoading(true);
        
        // Date Validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (formData.validUntil) {
            const untilDate = new Date(formData.validUntil);
            if (untilDate < today) {
                setLoading(false);
                return toast.error('End date cannot be in the past');
            }
            
            if (formData.validFrom) {
                const fromDate = new Date(formData.validFrom);
                if (untilDate < fromDate) {
                    setLoading(false);
                    return toast.error('End date cannot be before start date');
                }
            }
        }

        const payload = {
            ...formData,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue),
            maxDiscount: Number(formData.maxDiscount) || null,
            usageLimit: Number(formData.usageLimit) || 1000,
            perUserLimit: Number(formData.perUserLimit) || 1
        };
        mutation.mutate(payload, { onSettled: () => setLoading(false) });
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'FLYF';
        for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, code: result });
    };

    return (
        <div className="space-y-6 pb-12 text-left font-['Inter']">
            {/* Compact Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="p-2 bg-white text-footerBg rounded-xl border border-gray-100 shadow-sm hover:bg-footerBg hover:text-white transition-all group shrink-0"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-footerBg uppercase tracking-tight leading-none">
                            {isEdit ? 'Edit Coupon' : 'New Coupon'}
                        </h1>
                        <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                            <Zap size={9} className="text-primary fill-primary" />
                            Campaign Configuration
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest text-gray-400 hover:text-footerBg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-footerBg text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-footerBg/10 disabled:opacity-70 group"
                    >
                        <Save size={14} className="group-hover:scale-110 transition-transform" />
                        {loading ? 'Wait...' : (isEdit ? 'Save Changes' : 'Go Live')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Primary Settings - Compact */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-footerBg">
                                    <Info size={16} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-footerBg uppercase tracking-widest">General Info</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-footerBg uppercase tracking-widest ml-1">Coupon Code</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g., WELCOME10"
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-black tracking-widest outline-none focus:bg-white focus:border-footerBg transition-all uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCode}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border border-gray-100 hover:border-footerBg hover:text-footerBg transition-all"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-footerBg uppercase tracking-widest ml-1">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all cursor-pointer"
                                        >
                                            <option value="flat">Fixed (₹)</option>
                                            <option value="percent">Percent (%)</option>
                                            <option value="free_shipping">Free Ship</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-footerBg uppercase tracking-widest ml-1">Value</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleChange}
                                                disabled={formData.type === 'free_shipping'}
                                                placeholder="0.00"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-black outline-none focus:bg-white focus:border-primary transition-all disabled:opacity-50"
                                            />
                                            {formData.type !== 'free_shipping' && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xs">
                                                    {formData.type === 'percent' ? '%' : '₹'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-footerBg uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Internal campaign notes..."
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Scope - Compact */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-footerBg">
                                    <ShieldCheck size={16} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-footerBg uppercase tracking-widest">Applicability</h3>
                            </div>
                            <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10 tracking-widest">
                                {formData.targetItems.length} ACTIVE
                            </span>
                        </div>

                        <div className="space-y-5">
                            <div className="flex p-1 bg-gray-100 rounded-xl space-x-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                                {[
                                    { id: 'all', label: 'Global' },
                                    { id: 'new_user', label: 'New' },
                                    { id: 'category', label: 'Cats' },
                                    { id: 'subcategory', label: 'Sub' },
                                    { id: 'product', label: 'SKU' }
                                ].map(scope => {
                                    const isActive = (scope.id === 'new_user' && formData.userEligibility === 'new') ||
                                        (scope.id !== 'new_user' && formData.applicabilityType === scope.id && formData.userEligibility !== 'new');

                                    return (
                                        <button
                                            key={scope.id}
                                            type="button"
                                            onClick={() => {
                                                if (scope.id === 'new_user') {
                                                    setFormData({ ...formData, applicabilityType: 'all', userEligibility: 'new', targetItems: [] });
                                                } else {
                                                    setFormData({ ...formData, applicabilityType: scope.id, userEligibility: 'all', targetItems: [] });
                                                }
                                            }}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${isActive
                                                ? 'bg-white text-footerBg shadow-sm'
                                                : 'text-gray-400 hover:text-footerBg'
                                                }`}
                                        >
                                            {scope.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50/30 p-4 min-h-[200px] max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                                <AnimatePresence mode="wait">
                                    {formData.userEligibility === 'new' ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-3 py-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Users size={20} />
                                            </div>
                                            <p className="text-[11px] font-black text-footerBg uppercase">New Customers Only</p>
                                        </motion.div>
                                    ) : formData.applicabilityType === 'all' ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-3 py-6">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                <Zap size={20} />
                                            </div>
                                            <p className="text-[11px] font-black text-footerBg uppercase">All Orders</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {formData.applicabilityType === 'category' && categories.map(cat => (
                                                <SelectionCard key={cat.id || cat._id} title={cat.name} isSelected={formData.targetItems.includes(cat.id || cat._id)} onToggle={() => toggleTargetItem(cat.id || cat._id)} />
                                            ))}
                                            {formData.applicabilityType === 'subcategory' && subCategories.map(sub => (
                                                <SelectionCard key={sub.name} title={sub.name} isSelected={formData.targetItems.includes(sub.name)} onToggle={() => toggleTargetItem(sub.name)} />
                                            ))}
                                            {formData.applicabilityType === 'product' && products.map(p => (
                                                <SelectionCard key={p.id} title={p.name} image={p.image} isSelected={formData.targetItems.includes(p.id)} onToggle={() => toggleTargetItem(p.id)} />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Dates - Compact */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-footerBg">
                                <Calendar size={16} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[11px] font-black text-footerBg uppercase tracking-widest">Timeline</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Starts</label>
                                <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none focus:bg-white focus:border-footerBg" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Ends</label>
                                <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none focus:bg-white focus:border-footerBg" />
                            </div>
                        </div>
                    </div>

                    {/* Constraints - Compact */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-footerBg">
                                <Settings size={16} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[11px] font-black text-footerBg uppercase tracking-widest">Limits</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Order (₹)</label>
                                <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none focus:bg-white focus:border-footerBg" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Disc (₹)</label>
                                <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} disabled={formData.type === 'flat'} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none focus:bg-white focus:border-footerBg disabled:opacity-30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Global Cap</label>
                                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Per User</label>
                                    <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-[10px] font-black outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-1 pt-2">
                                <span className="text-[9px] font-black text-footerBg uppercase tracking-widest">Active</span>
                                <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-10 h-5 rounded-full transition-all relative ${formData.active ? 'bg-footerBg' : 'bg-gray-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-0.5' : 'left-0.5'}`}></div></button>
                            </div>
                        </div>
                    </div>

                    {/* Compact Preview Card */}
                    <div className="bg-footerBg p-5 rounded-3xl text-white space-y-3 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 -rotate-6 group-hover:rotate-0 transition-transform"><Ticket size={120} /></div>
                        <div className="relative">
                            <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Preview</p>
                            <h4 className="text-xl font-black tracking-wider uppercase">{formData.code || 'CODE'}</h4>
                            <p className="text-[9px] font-bold text-gray-400 mt-0.5">{formData.type === 'percent' ? `${formData.value}%` : `₹${formData.value}`} Instant Off</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Compact Selection Card
const SelectionCard = ({ title, image, isSelected, onToggle }) => (
    <div onClick={onToggle} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-white border-footerBg' : 'bg-white border-transparent hover:border-gray-100 shadow-sm'}`}>
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-footerBg border-footerBg' : 'border-gray-200'}`}>{isSelected && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}</div>
        {image && <img src={image} className="w-7 h-7 object-contain mix-blend-multiply" alt="" />}
        <p className={`text-[11px] font-black truncate flex-1 ${isSelected ? 'text-footerBg' : 'text-gray-600'}`}>{title}</p>
    </div>
);

export default CouponFormPage;
