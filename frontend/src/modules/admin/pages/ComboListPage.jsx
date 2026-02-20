import React, { useState, useMemo, useRef } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Boxes,
    Eye,
    EyeOff,
    Upload,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react';
import { useComboCategories, useAddComboCategory, useUpdateComboCategory, useDeleteComboCategory } from '../../../hooks/useProducts';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const ComboListPage = () => {
    const navigate = useNavigate();

    // Data & Mutation Hooks
    const { data: comboCategories = [], isLoading } = useComboCategories();
    const addMutation = useAddComboCategory();
    const updateMutation = useUpdateComboCategory();
    const deleteMutation = useDeleteComboCategory();

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({ name: '', image: '', description: '', status: 'Active' });
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredCombos = useMemo(() => {
        return comboCategories.filter(combo =>
            combo.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [comboCategories, searchTerm]);

    const paginatedCombos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCombos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCombos, currentPage]);

    const totalPages = Math.ceil(filteredCombos.length / itemsPerPage);

    const handleFileChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit) {
                    setEditingCombo(prev => ({ ...prev, image: reader.result }));
                } else {
                    setPreview(reader.result);
                    setNewItem(prev => ({ ...prev, image: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const isEdit = !!editingCombo;
        const payload = isEdit ? { ...editingCombo } : { ...newItem };

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: editingCombo.id || editingCombo._id, data: payload });
            } else {
                await addMutation.mutateAsync(payload);
            }

            setShowAddModal(false);
            setEditingCombo(null);
            setNewItem({ name: '', image: '', description: '', status: 'Active' });
            setPreview(null);
            toast.success(isEdit ? 'Combo category updated!' : 'Combo category added!');
        } catch (error) {
            console.error(error);
            toast.error('Error saving combo category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this combo category?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Combo deleted');
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete');
            }
        }
    };

    const toggleStatus = async (item) => {
        const newStatus = item.status === 'Active' ? 'Hidden' : 'Active';
        try {
            await updateMutation.mutateAsync({
                id: item.id || item._id,
                data: { ...item, status: newStatus }
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Combo Categories</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage your premium bundle types</p>
                </div>
                <button
                    onClick={() => {
                        setNewItem({ name: '', image: '', description: '', status: 'Active' });
                        setPreview(null);
                        setShowAddModal(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add New Category
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Categories</p>
                            <p className="text-2xl font-black text-footerBg">{comboCategories.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <Boxes size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Categories</p>
                            <p className="text-2xl font-black text-footerBg">{comboCategories.filter(c => c.status === 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hidden Categories</p>
                            <p className="text-2xl font-black text-footerBg">{comboCategories.filter(c => c.status !== 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <EyeOff size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search category types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Premium Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <AdminTable className="min-w-[800px]">
                        <AdminTableHeader>
                            <AdminTableHead className="min-w-[250px]">Category Identity</AdminTableHead>
                            <AdminTableHead className="min-w-[300px]">Description & Usage</AdminTableHead>
                            <AdminTableHead className="min-w-[150px]">Visibility Status</AdminTableHead>
                            <AdminTableHead className="text-right min-w-[120px]">Management</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {filteredCombos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 border border-dashed border-gray-200">
                                                <Boxes size={32} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No combo categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCombos.map(combo => (
                                    <AdminTableRow key={combo.id || combo._id} className="group">
                                        <AdminTableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                                    {combo.image ? (
                                                        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-gray-200" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-footerBg group-hover:text-primary transition-colors">{combo.name}</p>
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">{combo.description || "Premium collection tailored for special requirements and bulk value."}</p>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <button
                                                onClick={() => toggleStatus(combo)}
                                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${combo.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {combo.status === 'Active' ? <Eye size={12} strokeWidth={3} /> : <EyeOff size={12} strokeWidth={3} />}
                                                {combo.status || 'Active'}
                                            </button>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingCombo(combo)}
                                                    className="p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(combo.id || combo._id)}
                                                    className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>
                                ))
                            )}
                        </AdminTableBody>
                    </AdminTable>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredCombos.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingCombo) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCombo ? 'Edit Segment' : 'New Bundle Segment'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Configure your combo product category</p>
                            </div>
                            <button
                                onClick={() => { setShowAddModal(false); setEditingCombo(null); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800 ml-0.5">Segment Name</label>
                                <input
                                    type="text"
                                    value={editingCombo ? editingCombo.name : newItem.name}
                                    onChange={(e) => editingCombo
                                        ? setEditingCombo({ ...editingCombo, name: e.target.value })
                                        : setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    placeholder="e.g. Festival Combos"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800 ml-0.5">Cover Image</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, !!editingCombo)}
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/40 transition-all relative overflow-hidden group"
                                >
                                    {(editingCombo?.image || preview) ? (
                                        <>
                                            <img src={editingCombo?.image || preview} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                                                    <Upload size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-center p-6">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                                <Upload size={22} className="text-gray-400 group-hover:text-primary" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">Upload visual assets</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800 ml-0.5">Description</label>
                                <textarea
                                    value={editingCombo ? editingCombo.description : newItem.description}
                                    onChange={(e) => editingCombo
                                        ? setEditingCombo({ ...editingCombo, description: e.target.value })
                                        : setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                    placeholder="Write a brief overview of this segment..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingCombo(null);
                                    }}
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm disabled:opacity-70 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        editingCombo ? 'Save Changes' : 'Create Segment'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComboListPage;
