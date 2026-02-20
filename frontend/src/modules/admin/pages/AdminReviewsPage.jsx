import React, { useState, useMemo } from 'react';
import { Plus, Star, Trash2, CheckCircle, XCircle, Loader, Search, Clock, User, ShieldCheck, MessageCircle, ExternalLink, X, Image as ImageIcon, ArrowLeft, Eye, Quote, Edit3, Power, CheckCircle2, AlertCircle, Filter, Camera, Boxes, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import { useAdminReviews, useAddAdminReview, useUpdateAdminReview, useDeleteAdminReview, useAllUserReviews, useUpdateReviewStatus } from '../../../hooks/useContent';
import { API_BASE_URL } from '@/lib/apiUrl';

const AdminReviewsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab') === 'admin' ? 'admin' : 'user';

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Reset status filter when switching tabs
    React.useEffect(() => {
        setStatusFilter('All');
    }, [activeTab]);

    // API Hooks
    const { data: adminReviews = [], isLoading: isLoadingAdmin } = useAdminReviews();
    const { data: userReviews = [], isLoading: isLoadingUser } = useAllUserReviews();
    const addAdminReviewMutation = useAddAdminReview();
    const updateAdminReviewMutation = useUpdateAdminReview();
    const deleteAdminReviewMutation = useDeleteAdminReview();
    const updateStatusMutation = useUpdateReviewStatus();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        comment: '',
        image: '',
        rating: 5,
        status: activeTab === 'user' ? 'Approved' : 'Active'
    });
    const [preview, setPreview] = useState(null);

    // Filter Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredReviews = useMemo(() => {
        const list = activeTab === 'user' ? userReviews : adminReviews;
        return list.filter(r => {
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            const searchStr = (activeTab === 'user' ? `${r.user?.name} ${r.product?.name} ${r.title}` : `${r.name} ${r.comment}`).toLowerCase();
            const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [activeTab, userReviews, adminReviews, statusFilter, searchTerm]);

    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReviews, currentPage]);

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
            case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected':
            case 'Inactive': return 'bg-red-50 text-red-600 border-red-100';
            case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            setPreview(data.url);
            setFormData(prev => ({ ...prev, image: data.url }));
            toast.success('Image uploaded');
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addAdminReviewMutation.mutate(formData, {
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateAdminReviewMutation.mutate({ id: selectedReview._id, data: formData }, {
            onSuccess: () => {
                setShowEditModal(false);
                resetForm();
            }
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            comment: '',
            image: '',
            rating: 5,
            status: activeTab === 'user' ? 'Approved' : 'Active'
        });
        setPreview(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this review permanently?')) {
            deleteAdminReviewMutation.mutate(id);
        }
    };

    const handleStatusUpdate = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleView = (review) => {
        setSelectedReview(review);
        setShowViewModal(true);
    };

    const handleOpenEdit = (review) => {
        setSelectedReview(review);
        setFormData({
            name: activeTab === 'user' ? review.user?.name : review.name,
            title: review.title || '',
            comment: review.comment,
            image: review.image || '',
            rating: review.rating || 5,
            status: review.status
        });
        setPreview(review.image || null);
        setShowEditModal(true);
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                        {activeTab === 'user' ? 'Customer Feedback' : 'Homepage Testimonials'}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                        {activeTab === 'user' ? 'Moderate and approve real customer reviews' : 'Manage manually created reviews for homepage'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {activeTab === 'admin' && (
                        <button
                            onClick={() => { resetForm(); setShowAddModal(true); }}
                            className="bg-[#2c5336] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#1f3b26] transition-all shadow-lg shadow-[#2c5336]/20"
                        >
                            <Plus size={18} strokeWidth={3} /> Add Review
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards Row - Matched to CategoriesPage Size */}
            <div className={`grid gap-4 ${activeTab === 'user' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {activeTab === 'user' ? (
                    <>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Approved Reviews</p>
                                    <p className="text-2xl font-black text-footerBg">{userReviews.filter(r => r.status === 'Approved').length}</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={22} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Moderation</p>
                                    <p className="text-2xl font-black text-footerBg">{userReviews.filter(r => r.status === 'Pending').length}</p>
                                </div>
                                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Clock size={22} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rejected Feedback</p>
                                    <p className="text-2xl font-black text-footerBg">{userReviews.filter(r => r.status === 'Rejected').length}</p>
                                </div>
                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={22} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Testimonials</p>
                                    <p className="text-2xl font-black text-footerBg">{adminReviews.filter(r => r.status === 'Active').length}</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={22} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hidden Testimonials</p>
                                    <p className="text-2xl font-black text-footerBg">{adminReviews.filter(r => r.status === 'Inactive').length}</p>
                                </div>
                                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <EyeOff size={22} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filter Bar - Matched to CategoriesPage Size */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['All', ...(activeTab === 'user' ? ['Pending', 'Approved', 'Rejected'] : ['Active', 'Inactive'])].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#2c5336] shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {(isLoadingAdmin || isLoadingUser) ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Loader size={32} className="text-primary animate-spin mb-2" />
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">Fetching Reviews...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <MessageCircle size={32} className="text-gray-200 mb-2" />
                        <h3 className="text-gray-900 font-bold uppercase tracking-widest text-[10px]">No Matching Reviews Found</h3>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead>{activeTab === 'user' ? 'Product' : 'Reviewer Name'}</AdminTableHead>
                            {activeTab === 'user' && (
                                <>
                                    <AdminTableHead>Customer</AdminTableHead>
                                    <AdminTableHead>Heading</AdminTableHead>
                                    <AdminTableHead>Rating</AdminTableHead>
                                </>
                            )}
                            <AdminTableHead>Status</AdminTableHead>
                            <AdminTableHead className="text-right">Actions</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {paginatedReviews.map((review) => (
                                <AdminTableRow key={review._id}>
                                    <AdminTableCell className="font-bold text-[#0f1a11] text-sm">
                                        {activeTab === 'user' ? (review.product?.name || 'N/A') : review.name}
                                    </AdminTableCell>
                                    {activeTab === 'user' && (
                                        <>
                                            <AdminTableCell className="text-xs text-gray-600 font-medium">
                                                {review.user?.name || 'Guest'}
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <span className="text-[10px] font-black text-[#2c5336] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                                                    {review.title || 'No Heading'}
                                                </span>
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <div className="flex items-center gap-0.5 text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-500" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </AdminTableCell>
                                        </>
                                    )}
                                    <AdminTableCell>
                                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusColor(review.status)}`}>
                                            {review.status}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {activeTab === 'user' && review.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'Approved')}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'Rejected')}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleView(review)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all" title="View"><Eye size={16} /></button>
                                            <button onClick={() => handleOpenEdit(review)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit3 size={16} /></button>
                                            <button onClick={() => handleDelete(review._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                        </AdminTableBody>
                    </AdminTable>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredReviews.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* View Modal */}
            {showViewModal && selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setShowViewModal(false)} className="absolute right-6 top-6 text-gray-400"><X size={20} /></button>

                        {activeTab === 'user' ? (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-black uppercase mx-auto mb-4">{selectedReview.user?.name?.charAt(0)}</div>
                        ) : (
                            selectedReview.image && <img src={selectedReview.image} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-md mx-auto mb-4" alt="" />
                        )}
                        <h2 className="text-xl font-black text-footerBg uppercase tracking-tight">{activeTab === 'user' ? selectedReview.user?.name : selectedReview.name}</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 mb-6">{new Date(selectedReview.createdAt).toLocaleDateString()}</p>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 text-left">
                            {selectedReview.title && <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject: {selectedReview.title}</p>}
                            <p className="text-gray-700 text-sm font-medium italic leading-relaxed">"{selectedReview.comment}"</p>
                            {activeTab === 'user' && (
                                <div className="mt-4 pt-4 border-t border-gray-200/60">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating: {selectedReview.rating || 0}/5</p>
                                    <p className="text-xs font-bold text-footerBg uppercase">Target: {selectedReview.product?.name}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {activeTab === 'user' && selectedReview.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => { handleStatusUpdate(selectedReview._id, 'Approved'); setShowViewModal(false); }}
                                        className="flex-1 bg-emerald-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => { handleStatusUpdate(selectedReview._id, 'Rejected'); setShowViewModal(false); }}
                                        className="flex-1 bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button onClick={() => setShowViewModal(false)} className={`flex-1 ${activeTab === 'user' && selectedReview.status === 'Pending' ? 'bg-gray-100 text-gray-400' : 'bg-[#2c5336] text-white'} py-4 rounded-xl text-[10px] font-black uppercase tracking-widest`}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Form (Add/Edit) */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0f0b]/80 backdrop-blur-md" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#0f1a11] uppercase tracking-tight leading-none bg-gradient-to-r from-[#0f1a11] to-[#1e3b26] bg-clip-text text-transparent">
                                    {showEditModal ? 'Update Review' : 'Create Review'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Manage Testimonial Content</p>
                            </div>
                            <button
                                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                                className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
                            >
                                <X size={20} className="transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} className="p-8 pt-4 space-y-5">
                            {activeTab === 'admin' && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-20 rounded-[1.5rem] border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center relative overflow-hidden group shadow-inner transition-colors hover:border-[#2c5336]">
                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {preview ? (
                                            <img src={preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Camera size={20} className="text-gray-200 mx-auto mb-1" />
                                                <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImageIcon size={18} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#0f1a11] uppercase tracking-wider px-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter reviewer name..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-[#0f1a11] text-sm outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                                />
                            </div>

                            {activeTab === 'user' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#0f1a11] uppercase tracking-wider px-1">Review Heading</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-[#0f1a11] text-sm outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#0f1a11] uppercase tracking-wider px-1">Rating</label>
                                        <div className="flex gap-2 p-1.5 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: s })}
                                                    className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center ${formData.rating >= s ? 'text-yellow-500 bg-white shadow-sm ring-1 ring-yellow-100' : 'text-gray-200 hover:text-gray-400'}`}
                                                >
                                                    <Star size={16} fill={formData.rating >= s ? "currentColor" : "none"} strokeWidth={formData.rating >= s ? 0 : 2} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#0f1a11] uppercase tracking-wider px-1">Content</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-[#0f1a11] text-sm outline-none focus:bg-white focus:border-[#2c5336] transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-1.5 pt-2">
                                {(activeTab === 'user' ? ['Pending', 'Approved', 'Rejected'] : ['Active', 'Inactive']).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.status === s ? getStatusColor(s) + ' border-current shadow-md scale-[1.02]' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#0f1a11] hover:bg-black text-white py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] mt-2"
                            >
                                {showEditModal ? 'Update Review' : 'Publish Now'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsPage;
