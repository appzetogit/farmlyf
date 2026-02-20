import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
    ChevronRight,
    ArrowRight,
    Copy,
    Layout,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const API_URL = API_BASE_URL;

const OfferListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch Offers
    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['offers'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/offers`);
            if (!res.ok) throw new Error('Failed to fetch offers');
            return res.json();
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/offers/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete offer');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            toast.success('Offer deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete offer');
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOffers = useMemo(() => {
        return offers
            .filter(o =>
                o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.slug?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => b.createdAt?.localeCompare(a.createdAt) || 0);
    }, [offers, searchTerm]);

    const paginatedOffers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOffers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOffers, currentPage]);

    const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            deleteMutation.mutate(id);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied!');
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Offers & Collections</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage curated product collections for banners</p>
                </div>
                <button
                    onClick={() => navigate('/admin/offers/add')}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Create New Offer
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Offers Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Offer Details</AdminTableHead>
                        <AdminTableHead>Target Link</AdminTableHead>
                        <AdminTableHead>Products</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="py-20 text-center"><p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading offers...</p></td></tr>
                        ) : paginatedOffers.length === 0 ? (
                            <tr><td colSpan="5" className="py-40 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                        <Tag size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No offers created yet</p>
                                </div>
                            </td></tr>
                        ) : (
                            paginatedOffers.map((offer) => (
                                <AdminTableRow key={offer._id}>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                                {offer.image ? (
                                                    <img src={offer.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Layout size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-footerBg text-sm uppercase tracking-tight">{offer.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                    {offer.description || 'No description provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </AdminTableCell>

                                    <AdminTableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-gray-50 px-2 py-1 rounded text-[10px] font-bold text-primary border border-gray-100 uppercase tracking-tighter">
                                                {offer.targetLink}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(offer.targetLink)}
                                                className="text-gray-300 hover:text-primary transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </AdminTableCell>

                                    <AdminTableCell>
                                        <span className="text-[10px] font-black text-footerBg bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 uppercase tracking-widest">
                                            {offer.products?.length || 0} Products
                                        </span>
                                    </AdminTableCell>

                                    <AdminTableCell>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${offer.isActive
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-500 border-red-100'
                                            }`}>
                                            {offer.isActive ? 'Live' : 'Inactive'}
                                        </span>
                                    </AdminTableCell>

                                    <AdminTableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => navigate(`/admin/offers/edit/${offer._id}`)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
                                            >
                                                <Edit2 size={16} strokeWidth={2.5} />
                                            </button>
                                            <a
                                                href={offer.targetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                            >
                                                <ExternalLink size={16} strokeWidth={2.5} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(offer._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))
                        )}
                    </AdminTableBody>
                </AdminTable>

                <div className="border-t border-gray-50">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredOffers.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default OfferListPage;
