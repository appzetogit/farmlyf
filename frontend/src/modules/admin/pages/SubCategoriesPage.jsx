import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    Plus,
    Search,
    Edit2,
    Trash2,
    Layers,
    Loader,
    ChevronDown,
    CheckCircle2,
    EyeOff,
    Boxes
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../../../hooks/useProducts';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import Pagination from '../components/Pagination';

const SubCategoriesPage = () => {
    const { data: globalParents = [] } = useCategories();
    const queryClient = useQueryClient();
    const refreshGlobalCategories = () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    };

    // Data State
    // parents state removed, using globalParents
    const [subCategories, setSubCategories] = useState([]); // All sub categories
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [parentFilter, setParentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [newItem, setNewItem] = useState({ name: '', parentId: '', status: 'Active', showInShopByCategory: true });

    // Accordion State
    const [expandedParents, setExpandedParents] = useState({});

    const toggleParent = (id) => {
        setExpandedParents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Only fetch SubCategories, rely on Context for Parents
            const resS = await fetch(`${API_BASE_URL}/subcategories`);
            const dataS = await resS.json();

            if (resS.ok) {
                setSubCategories(dataS);
            } else {
                toast.error('Failed to load subcategories');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e, isEdit = false) => {
        e.preventDefault();
        setSubmitLoading(true);
        const toastId = toast.loading(isEdit ? 'Updating...' : 'Creating...');

        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit
                ? `${API_BASE_URL}/subcategories/${editingSub.id}`
                : `${API_BASE_URL}/subcategories`;

            let payload;
            if (isEdit) {
                payload = {
                    ...editingSub,
                    parent: editingSub.parent.id || editingSub.parent,
                    showInShopByCategory: editingSub.showInShopByCategory
                };
            } else {
                payload = {
                    name: newItem.name,
                    parent: newItem.parentId,
                    status: newItem.status,
                    showInShopByCategory: newItem.showInShopByCategory
                };
            }

            // Validation
            if (!payload.parent) throw new Error("Parent category is required");

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(isEdit ? 'Sub-category updated' : 'Sub-category created', { id: toastId });
                fetchData(); // Refresh local list
                refreshGlobalCategories(); // Refresh global context
                setShowAddModal(false);
                setEditingSub(null);
                setNewItem({ name: '', parentId: '', status: 'Active' });
            } else {
                toast.error(data.message || 'Operation failed', { id: toastId });
            }

        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleSubStatus = async (sub) => {
        const newStatus = sub.status === 'Active' ? 'Hidden' : 'Active';
        try {
            const res = await fetch(`${API_BASE_URL}/subcategories/${sub._id || sub.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...sub, status: newStatus, parent: sub.parent?._id || sub.parent?.id || sub.parent })
            });
            if (res.ok) {
                toast.success(`Status changed to ${newStatus}`);
                fetchData();
                refreshGlobalCategories();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sub-category?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/subcategories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Deleted');
                setSubCategories(subCategories.filter(s => (s._id || s.id) !== id));
                refreshGlobalCategories();
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) { toast.error('Error deleting'); }
    };

    // --- Filtering & Grouping ---
    const filteredSubs = useMemo(() => {
        return subCategories.filter(sub => {
            const pId = typeof sub.parent === 'object' ? sub.parent?._id || sub.parent?.id : sub.parent;
            const pName = typeof sub.parent === 'object' ? sub.parent?.name : globalParents.find(p => p.id === pId)?.name;

            const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pName && pName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesParent = parentFilter === 'All' || pId === parentFilter;
            const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;

            return matchesSearch && matchesParent && matchesStatus;
        });
    }, [subCategories, searchTerm, parentFilter, globalParents]);

    const groupedSubs = useMemo(() => {
        const groups = {};
        // Initialize groups for all parents to show empty sections too? Or just inhabited ones?
        // Let's show parents relevant to filter
        const relevantParents = parentFilter === 'All' ? globalParents : globalParents.filter(p => p.id === parentFilter);

        relevantParents.forEach(p => {
            // Find subs for this parent
            const subsForParent = filteredSubs.filter(s => {
                const sParentId = typeof s.parent === 'object' ? s.parent?._id || s.parent?.id : s.parent;
                return sParentId === p.id;
            });

            // Only add if there are subs OR we are specifically looking at this parent (or All)
            // Actually, showing empty parents is nice encouragement to add subs
            groups[p.id] = { category: p, subs: subsForParent };
        });
        return groups;

    }, [globalParents, filteredSubs, parentFilter]);

    const allGroups = useMemo(() => Object.values(groupedSubs), [groupedSubs]);

    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allGroups.slice(startIndex, startIndex + itemsPerPage);
    }, [allGroups, currentPage]);

    const totalPages = Math.ceil(allGroups.length / itemsPerPage);

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Sub-Category Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage secondary product levels</p>
                </div>
                <button
                    onClick={() => {
                        setNewItem({ name: '', parentId: '', status: 'Active', showInShopByCategory: true });
                        setShowAddModal(true);
                    }}
                    className="bg-[#2c5336] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#1f3b26] transition-all shadow-lg shadow-[#2c5336]/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Sub-category
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sub-levels</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <Layers size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Levels</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.filter(s => s.status === 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hidden Levels</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.filter(s => s.status !== 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <EyeOff size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sub-categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <Layers size={14} className="text-gray-400" />
                        <select
                            value={parentFilter}
                            onChange={(e) => setParentFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                        >
                            <option value="All">All Parents</option>
                            {globalParents.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['All', 'Active', 'Hidden'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#2c5336] shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? <div className="p-12 text-center"><Loader className="animate-spin inline-block text-gray-300" /></div> :
                <div className="space-y-6">
                    {paginatedGroups.map(({ category, subs }) => (
                        subs.length > 0 || parentFilter !== 'All' ? ( // Hide empty parents in general view to reduce clutter, optional
                            <div key={category._id || category.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-[#2c5336]/20">
                                <div
                                    className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleParent(category._id || category.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-transform duration-200 ${expandedParents[category._id || category.id] ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={18} className="text-gray-400" />
                                        </div>
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1.5 shadow-sm">
                                            {category.image ? <img src={category.image} className="w-full h-full object-contain" alt="" /> : <Layers size={16} />}
                                        </div>
                                        <div>
                                            <h2 className="font-medium text-gray-900 text-sm">{category.name}</h2>
                                            <p className="text-xs text-gray-500">{subs.length} Levels</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNewItem({ ...newItem, parentId: category.id });
                                            setShowAddModal(true);
                                        }}
                                        className="bg-white text-primary border border-gray-200 hover:bg-gray-50 hover:text-primaryDeep px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                                    >
                                        <Plus size={14} /> Add Sub
                                    </button>
                                </div>
                                {expandedParents[category._id || category.id] && (
                                    <div className="p-0 animate-in slide-in-from-top-2 duration-200 bg-gray-50/50">
                                        <AdminTable>
                                            <AdminTableHeader>
                                                <AdminTableHead className="py-3 text-gray-600">Sub-category</AdminTableHead>
                                                <AdminTableHead className="py-3 text-gray-600">Products</AdminTableHead>
                                                <AdminTableHead className="py-3 text-gray-600">Status</AdminTableHead>
                                                <AdminTableHead className="py-3 text-gray-600 text-right">Actions</AdminTableHead>
                                            </AdminTableHeader>
                                            <AdminTableBody>
                                                {subs.map((sub) => (
                                                    <AdminTableRow key={sub._id || sub.id} className="hover:bg-gray-100">
                                                        <AdminTableCell className="py-3">
                                                            <span className="font-medium text-gray-900 text-sm">{sub.name}</span>
                                                        </AdminTableCell>
                                                        <AdminTableCell className="py-3">
                                                            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                                                                {sub.productCount || 0}
                                                            </span>
                                                        </AdminTableCell>
                                                        <AdminTableCell className="py-3">
                                                            <button
                                                                onClick={() => toggleSubStatus(sub)}
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex w-fit items-center gap-1.5 transition-all ${sub.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                                            >
                                                                {sub.status === 'Active' ? <CheckCircle2 size={10} strokeWidth={3} /> : <EyeOff size={10} strokeWidth={3} />}
                                                                {sub.status}
                                                            </button>
                                                        </AdminTableCell>
                                                        <AdminTableCell className="py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => {
                                                                    setEditingSub(sub);
                                                                }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg"><Edit2 size={14} /></button>
                                                                <button onClick={() => handleDelete(sub._id || sub.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg"><Trash2 size={14} /></button>
                                                            </div>
                                                        </AdminTableCell>
                                                    </AdminTableRow>
                                                ))}
                                                {subs.length === 0 && (
                                                    <AdminTableRow>
                                                        <AdminTableCell colSpan="4" className="px-6 py-8 text-center text-sm text-gray-400">
                                                            No items yet
                                                        </AdminTableCell>
                                                    </AdminTableRow>
                                                )}
                                            </AdminTableBody>
                                        </AdminTable>
                                    </div>
                                )}
                            </div>
                        ) : null
                    ))}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={allGroups.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            }

            {/* Modal */}
            {(showAddModal || editingSub) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingSub(null); }} />
                    <div className="bg-white rounded-[1.5rem] w-full max-w-[320px] relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-sm font-black text-footerBg uppercase tracking-tight">{editingSub ? 'Edit Level' : 'New Level'}</h2>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                    Parent: {globalParents.find(p => p.id === (editingSub ? (editingSub.parent.id || editingSub.parent) : newItem.parentId))?.name || 'Select Parent'}
                                </p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingSub(null); }} className="p-1">
                                <Plus size={16} className="rotate-45 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, !!editingSub)} className="p-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Parent</label>
                                <select
                                    required
                                    value={editingSub ? (editingSub.parent._id || editingSub.parent.id || editingSub.parent) : newItem.parentId}
                                    onChange={(e) => editingSub ? setEditingSub({ ...editingSub, parent: e.target.value }) : setNewItem({ ...newItem, parentId: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none"
                                >
                                    <option value="">Select Parent Category</option>
                                    {globalParents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Name</label>
                                <input required type="text"
                                    value={editingSub ? editingSub.name : newItem.name}
                                    onChange={(e) => editingSub ? setEditingSub({ ...editingSub, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-[#2c5336]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Status</label>
                                    <select
                                        value={editingSub ? editingSub.status : newItem.status}
                                        onChange={(e) => editingSub ? setEditingSub({ ...editingSub, status: e.target.value }) : setNewItem({ ...newItem, status: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[10px] font-bold text-footerBg outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Hidden">Hidden</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer self-end">
                                    <input
                                        type="checkbox"
                                        checked={editingSub ? editingSub.showInShopByCategory : newItem.showInShopByCategory}
                                        onChange={(e) => editingSub ? setEditingSub({ ...editingSub, showInShopByCategory: e.target.checked }) : setNewItem({ ...newItem, showInShopByCategory: e.target.checked })}
                                        className="w-3.5 h-3.5 text-[#2c5336] rounded focus:ring-[#2c5336]"
                                    />
                                    <span className="text-[9px] font-black text-footerBg uppercase">In Shop Strip</span>
                                </label>
                            </div>

                            <button type="submit" disabled={submitLoading} className="w-full bg-[#2c5336] text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1f3b26] disabled:opacity-70 flex justify-center items-center gap-2">
                                {submitLoading && <Loader size={12} className="animate-spin" />}
                                {editingSub ? 'Save' : 'Create'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategoriesPage;
