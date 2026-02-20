import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    Plus,
    Search,
    Edit2,
    Trash2,
    Ticket,
    Calendar,
    Users,
    Activity,
    Clock,
    Percent,
    Tag,
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Copy,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const API_URL = API_BASE_URL;

const CouponListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch Coupons
    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/coupons`);
            if (!res.ok) throw new Error('Failed to fetch coupons');
            return res.json();
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/coupons/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete coupon');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['coupons']);
            toast.success('Coupon deleted');
        },
        onError: () => {
            toast.error('Failed to delete coupon');
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const itemsPerPage = 10;

    const filteredCoupons = useMemo(() => {
        return coupons
            .filter(c =>
                c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => b.createdAt?.localeCompare(a.createdAt) || 0);
    }, [coupons, searchTerm]);

    const suggestions = useMemo(() => {
        if (searchTerm.length < 2) return [];
        return coupons
            .filter(c => c.code?.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);
    }, [coupons, searchTerm]);

    const paginatedCoupons = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCoupons.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCoupons, currentPage]);

    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            deleteMutation.mutate(id);
        }
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();
        if (!coupon.active) return { label: 'Inactive', color: 'bg-gray-50 text-gray-400 border-gray-100' };
        if (new Date(coupon.validUntil) < now) return { label: 'Expired', color: 'bg-red-50 text-red-500 border-red-100' };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'Sold Out', color: 'bg-amber-50 text-amber-500 border-amber-100' };
        return { label: 'Live', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied!');
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Marketing Center</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage high-conversion promotional campaigns</p>
                </div>
                <button
                    onClick={() => navigate('/admin/coupons/add')}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Create New Coupon
                </button>
            </div>

            {/* Stats Cards - Matched to Screenshot Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Total Campaigns',
                        value: coupons.length,
                        icon: Ticket,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50'
                    },
                    {
                        label: 'Active Now',
                        value: coupons.filter(c => c.active && new Date(c.validUntil) > new Date()).length,
                        icon: Activity,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50'
                    },
                    {
                        label: 'Total Redemptions',
                        value: coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0),
                        icon: Users,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-footerBg tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Tabs Match Product List */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by code or description..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                            >
                                <div className="p-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id || suggestion._id}
                                            onClick={() => {
                                                setSearchTerm(suggestion.code);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg border border-primary/10 flex items-center justify-center shrink-0 font-black text-[10px]">
                                                {suggestion.type === 'percent' ? '%' : '₹'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none mb-1">{suggestion.code}</p>
                                                <p className="text-[10px] font-bold text-gray-400 truncate">{suggestion.description}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Coupons Table using AdminTable */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Campaign Details</AdminTableHead>
                        <AdminTableHead>Type & Value</AdminTableHead>
                        <AdminTableHead>Usage Progress</AdminTableHead>
                        <AdminTableHead>Validity</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="py-20 text-center"><p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">Hydrating table...</p></td></tr>
                        ) : paginatedCoupons.length === 0 ? (
                            <tr><td colSpan="6" className="py-40 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                        <Ticket size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active campaigns found</p>
                                </div>
                            </td></tr>
                        ) : (
                            paginatedCoupons.map((coupon) => {
                                const status = getCouponStatus(coupon);
                                const usagePercent = Math.min((coupon.usageCount / (coupon.usageLimit || 1)) * 100, 100);

                                return (
                                    <AdminTableRow key={coupon.id || coupon._id}>
                                        <AdminTableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-footerBg text-white rounded-2xl flex flex-col items-center justify-center font-black relative overflow-hidden group/ticket shadow-lg shadow-footerBg/10 border border-footerBg">
                                                    <Ticket size={20} className="relative z-10 group-hover/ticket:scale-110 transition-transform" />
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-footerBg text-sm tracking-widest uppercase">{coupon.code}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(coupon.code); }}
                                                            className="text-gray-300 hover:text-primary transition-colors"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 line-clamp-1 max-w-[220px]">
                                                        {coupon.description || 'Global promotional offer'}
                                                    </p>
                                                </div>
                                            </div>
                                        </AdminTableCell>

                                        <AdminTableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl shrink-0 border border-emerald-100 italic font-black text-xs">
                                                    {coupon.type === 'percent' ? '%' : '₹'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-footerBg">
                                                        {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`} OFF
                                                    </p>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Min Rev: ₹{coupon.minOrderValue}</p>
                                                </div>
                                            </div>
                                        </AdminTableCell>

                                        <AdminTableCell>
                                            <div className="w-full max-w-[140px] space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-footerBg tracking-tight font-mono">{coupon.usageCount} <span className="text-gray-300 font-sans">Used</span></span>
                                                    <span className="text-[8px] font-black text-gray-300 uppercase">{coupon.usageLimit ? `${coupon.usageLimit} Cap` : '∞ Uncapped'}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${usagePercent}%` }}
                                                        className={`h-full rounded-full ${usagePercent > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </AdminTableCell>

                                        <AdminTableCell>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-gray-400" />
                                                <div>
                                                    <p className="text-[10px] font-black text-footerBg uppercase">Expires {new Date(coupon.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Started {new Date(coupon.createdAt || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </AdminTableCell>

                                        <AdminTableCell>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </AdminTableCell>

                                        <AdminTableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/admin/coupons/edit/${coupon.id || coupon._id}`)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
                                                    title="Edit Settings"
                                                >
                                                    <Edit2 size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id || coupon._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                    title="Terminate Campaign"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>
                                );
                            })
                        )}
                    </AdminTableBody>
                </AdminTable>

                <div className="border-t border-gray-50">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        totalItems={filteredCoupons.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            </div>

            {/* Empty State Tips */}
            <div className="bg-footerBg/5 p-6 rounded-[2rem] border border-footerBg/5 flex items-center gap-6">
                <div className="w-12 h-12 bg-footerBg text-white rounded-2xl flex items-center justify-center shrink-0">
                    <Percent size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-footerBg uppercase tracking-widest">Growth Tip: Flash Sales</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-2xl">Create high-value (20%+) flash coupons with a 24-hour expiry to boost weekend conversions. Limited usage caps create urgency.</p>
                </div>
            </div>
        </div>
    );
};

export default CouponListPage;
