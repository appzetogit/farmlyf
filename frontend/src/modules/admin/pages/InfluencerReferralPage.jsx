import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Edit2, Trash2, Users, CheckCircle2, XCircle,
    Copy, ExternalLink, Calendar, DollarSign, Percent, MoreHorizontal,
    Twitter, Instagram, Youtube, Filter, Eye, ArrowRight, Activity, Ticket, IndianRupee, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

import { useReferrals, useCreateReferral, useUpdateReferral, useDeleteReferral, useAddPayout } from '../../../hooks/useReferrals';

const InfluencerReferralPage = () => {
    const { data: serverReferrals = [], isLoading } = useReferrals();

    // Fallback Dummy Data
    const dummyInfluencers = [
        { _id: '1', name: 'Rahul Sharma', platform: 'Instagram', code: 'RAHULFIT20', type: 'percentage', value: 20, commissionRate: 10, usageCount: 145, totalSales: 285000, totalPaid: 15000, active: true, validTo: '2026-12-31' },
        { _id: '2', name: 'Priya Verma', platform: 'Youtube', code: 'PRIYAFRY15', type: 'percentage', value: 15, commissionRate: 8, usageCount: 89, totalSales: 154000, totalPaid: 5000, active: true, validTo: '2026-06-30' },
        { _id: '3', name: 'Vikram Singh', platform: 'Instagram', code: 'VIKDRY10', type: 'percentage', value: 10, commissionRate: 5, usageCount: 34, totalSales: 42000, totalPaid: 0, active: false, validTo: '2025-12-31' },
    ];

    const influencers = serverReferrals.length > 0 ? serverReferrals : dummyInfluencers;

    const createReferralMutation = useCreateReferral();
    const updateReferralMutation = useUpdateReferral();
    const deleteReferralMutation = useDeleteReferral();

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        platform: 'Instagram',
        code: '',
        type: 'percentage',
        value: '',
        commissionRate: 5,
        validFrom: '',
        validTo: '',
        active: true
    });

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredList = influencers.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm)
    );

    const paginatedList = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredList, currentPage]);

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ...item,
                validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : '',
                validTo: item.validTo ? new Date(item.validTo).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                platform: 'Instagram',
                code: '',
                type: 'percentage',
                value: '',
                commissionRate: 5,
                validFrom: new Date().toISOString().split('T')[0],
                validTo: '',
                active: true,
                totalPaid: 0
            });
        }
        setShowModal(true);
    };

    const openDetailView = (item) => {
        navigate(`/admin/referrals/${item._id || item.id}`);
    };

    const calculateEarnings = (item) => {
        const totalSales = item.totalSales || 0;
        const discountValue = item.value || 0;

        let netSales = totalSales;
        if (item.type === 'percentage') {
            netSales = totalSales * (1 - (discountValue / 100));
        } else {
            // If fixed, we assume it's subtracted from each sale, but since we only have totalSales
            // we'll approximate by subtract it if it's a single sale or proportional.
            // However, the user specifically mentioned "Profit Percentage", suggesting % is the norm.
            netSales = Math.max(0, totalSales - (discountValue * (item.usageCount || 0)));
        }

        return Math.floor(netSales * (item.commissionRate / 100));
    };


    const handleSave = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            value: Number(formData.value),
            commissionRate: Number(formData.commissionRate)
        };

        if (editingItem) {
            updateReferralMutation.mutate({ id: editingItem._id || editingItem.id, ...submissionData }, {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Influencer updated successfully!');
                }
            });
        } else {
            createReferralMutation.mutate(submissionData, {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Influencer added successfully!');
                }
            });
        }
    };

    const toggleStatus = (item) => {
        updateReferralMutation.mutate({ id: item._id || item.id, active: !item.active });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this influencer code?')) {
            deleteReferralMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Influencer & Referral Codes</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage partner campaigns and commissions</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#1a1a1a] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 group"
                >
                    <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    Add New Influencer
                </button>
            </div>

            {/* Stats Cards - Matched to Screenshot Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Total Partners',
                        value: influencers.length,
                        icon: Users,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50'
                    },
                    {
                        label: 'Active Campaigns',
                        value: influencers.filter(i => i.active).length,
                        icon: Activity,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50'
                    },
                    {
                        label: 'Total Generated',
                        value: `₹${(influencers.reduce((acc, curr) => acc + (curr.totalSales || 0), 0) / 1000).toFixed(1)}k`,
                        icon: IndianRupee,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolkit Bar */}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search influencers or codes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </div>

                {/* Table Area */}
                <div className="min-h-[400px]">
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead>Influencer</AdminTableHead>
                            <AdminTableHead>Referral Code</AdminTableHead>
                            <AdminTableHead>User Profit</AdminTableHead>
                            <AdminTableHead>Performance</AdminTableHead>
                            <AdminTableHead>Validity</AdminTableHead>
                            <AdminTableHead>Status</AdminTableHead>
                            <AdminTableHead className="text-right">Actions</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {paginatedList.map((item) => (
                                <AdminTableRow key={item._id || item.id}>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-full bg-footerBg/5 flex items-center justify-center text-footerBg font-black text-[10px] uppercase shadow-inner shrink-0 border border-footerBg/5">
                                                {item.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#1a1a1a] text-xs uppercase tracking-tight">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                        {item.platform === 'Instagram' && <Instagram size={10} />}
                                                        {item.platform === 'Youtube' && <Youtube size={10} />}
                                                        {item.platform === 'Twitter' && <Twitter size={10} />}
                                                        {item.platform}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-2 group/code cursor-pointer" onClick={() => {
                                            navigator.clipboard.writeText(item.code);
                                            toast.success('Code copied!');
                                        }}>
                                            <span className="font-black text-[#1a1a1a] text-[10px] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-[0.1em] group-hover/code:bg-[#1a1a1a] group-hover/code:text-white transition-all">
                                                {item.code}
                                            </span>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            {item.type === 'percentage' ? `${item.value}% OFF` : `₹${item.value} OFF`}
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="space-y-1 text-left">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <Users size={12} className="text-blue-500" /> {item.usageCount} Uses
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                <IndianRupee size={12} /> ₹{item.totalSales?.toLocaleString()}
                                            </div>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <div className={`w-1.5 h-1.5 rounded-full ${new Date(item.validTo) < new Date() ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                                            {item.validTo ? new Date(item.validTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Lifetime'}
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.1em] border transition-all ${item.active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                            {item.active ? 'Active' : 'Paused'}
                                        </button>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => openDetailView(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View"><Eye size={16} /></button>
                                            <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-footerBg hover:bg-gray-50 rounded-lg transition-all" title="Edit"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                        </AdminTableBody>
                    </AdminTable>
                    {filteredList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                            <Search size={48} className="mb-4 opacity-5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No partners found matching search</p>
                        </div>
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredList.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* Modal - Compact & Clean Version */}
            {showModal && (
                <div className="fixed inset-0 bg-footerBg/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                            <div className="text-left">
                                <h2 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">
                                    {editingItem ? 'Edit Partner Code' : 'New Strategic Partner'}
                                </h2>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Management & Performance Tracking</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={16} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Partner Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Rahul Fitness"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 font-black text-[#1a1a1a] text-xs outline-none focus:bg-white focus:border-gray-200 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Core Platform</label>
                                    <select
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 font-black text-[#1a1a1a] text-xs outline-none focus:bg-white focus:border-gray-200 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="Instagram">Instagram</option>
                                        <option value="Youtube">Youtube</option>
                                        <option value="Twitter">Twitter/X</option>
                                        <option value="Blog">Blog/Website</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Unique Referral Code</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        placeholder="RAHULFIT20"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 font-black text-[#1a1a1a] text-base uppercase tracking-[0.2em] outline-none focus:bg-white focus:border-gray-200 transition-all placeholder:text-gray-300"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300 uppercase">
                                        {formData.code.length}/20
                                    </div>
                                </div>
                            </div>

                            {/* Compact Financial Settings */}
                            <div className="p-6 bg-gray-50 rounded-[1.5rem] grid grid-cols-1 md:grid-cols-3 gap-5 border border-gray-100">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Type</label>
                                    <div className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2.5 text-[9px] font-black text-[#1a1a1a] uppercase">
                                        Percent (%)
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">User Profit (%)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="20"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2.5 font-black text-[#1a1a1a] text-[10px] outline-none focus:border-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Influencer Comm (%)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="10"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2.5 font-black text-[#1a1a1a] text-[10px] outline-none focus:border-gray-200"
                                    />
                                </div>

                                {/* Calculation Example/Preview */}
                                <div className="col-span-full pt-4 border-t border-gray-100 mt-2">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">Commission Logic Preview (per ₹1000 sale)</p>
                                        <div className="bg-white/50 rounded-xl p-3 flex items-center justify-between gap-2 border border-dashed border-gray-200">
                                            <div className="text-center flex-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Sale</p>
                                                <p className="text-xs font-black text-[#1a1a1a]">₹1,000</p>
                                            </div>
                                            <div className="text-gray-300 text-xs font-black">-</div>
                                            <div className="text-center flex-1">
                                                <p className="text-[9px] font-bold text-red-400 uppercase leading-none mb-1">User Profit</p>
                                                <p className="text-xs font-black text-red-500">
                                                    ₹{formData.type === 'percentage'
                                                        ? (1000 * (Number(formData.value) / 100)).toLocaleString()
                                                        : Number(formData.value).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-gray-300 text-xs font-black">=</div>
                                            <div className="text-center flex-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Net Base</p>
                                                <p className="text-xs font-black text-[#1a1a1a]">
                                                    ₹{(1000 - (formData.type === 'percentage'
                                                        ? (1000 * (Number(formData.value) / 100))
                                                        : Number(formData.value))).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-gray-300 text-xs font-black">→</div>
                                            <div className="text-center flex-1 bg-emerald-50 rounded-lg py-1">
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase leading-none mb-1">Partner Earn</p>
                                                <p className="text-xs font-black text-emerald-700">
                                                    ₹{Math.floor((1000 - (formData.type === 'percentage'
                                                        ? (1000 * (Number(formData.value) / 100))
                                                        : Number(formData.value))) * (Number(formData.commissionRate) / 100)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Launch Date</label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 font-black text-[#1a1a1a] text-[10px] outline-none focus:bg-white focus:border-gray-200 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest pl-1">Expiry (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.validTo}
                                        onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 font-black text-[#1a1a1a] text-[10px] outline-none focus:bg-white focus:border-gray-200 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                        className={`w-10 h-5 rounded-full transition-all relative ${formData.active ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-0.5' : 'left-0.5'}`}></div>
                                    </button>
                                    <span className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-widest">
                                        {formData.active ? 'Active' : 'Paused'}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[#1a1a1a] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-[#1a1a1a]/10"
                                    >
                                        {editingItem ? 'Save Changes' : 'Confirm Launch'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default InfluencerReferralPage;
