import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import { 

    Layout, 
    Save, 
    Eye, 
    EyeOff, 
    GripVertical, 
    ArrowUp, 
    ArrowDown,
    List,
    Layers,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const API_URL = API_BASE_URL;

const HeaderCategoryPage = () => {
    const queryClient = useQueryClient();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            if (res.ok) {
                // Sort by order initially
                setCategories(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNavbar = async (category) => {
        const originalCategories = [...categories];
        const newShowInNavbar = !category.showInNavbar;
        
        // Optimistic update
        setCategories(categories.map(c => 
            c.id === category.id ? { ...c, showInNavbar: newShowInNavbar } : c
        ));

        try {
            const res = await fetch(`${API_URL}/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showInNavbar: newShowInNavbar })
            });

            if (!res.ok) throw new Error('Failed to update');
            
            toast.success(`${category.name} ${newShowInNavbar ? 'added to' : 'removed from'} header`);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (error) {
            setCategories(originalCategories);
            toast.error('Failed to update visibility');
        }
    };

    const handleOrderChange = (id, newOrder) => {
        setCategories(categories.map(c => 
            c.id === id ? { ...c, order: parseInt(newOrder) || 0 } : c
        ));
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            // We could implement a bulk update endpoint, but for now we'll do individual updates
            // or just update the ones that changed. To be safe and simple, let's update all.
            const updates = categories.map(cat => 
                fetch(`${API_URL}/categories/${cat.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: cat.order })
                })
            );

            await Promise.all(updates);
            toast.success('Display order saved successfully');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // Re-sort
            setCategories([...categories].sort((a, b) => (a.order || 0) - (b.order || 0)));
        } catch (error) {
            toast.error('Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const headerCategories = categories.filter(c => c.showInNavbar);

    if (loading) return <div className="p-10 text-center">Loading categories...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Header Category Management</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage which categories appear in the main navigation</p>
                </div>
                <button
                    onClick={handleSaveOrder}
                    disabled={saving}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Order Changes'}
                </button>
            </div>

            {/* Current Header Setup Preview */}
            <div className="bg-footerBg p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Layout size={20} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight">Current Header Navigation</h2>
                    </div>

                    {headerCategories.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 italic">No categories currently visible in header.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {headerCategories.sort((a,b) => a.order - b.order).map((cat, idx) => (
                                <div key={cat.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                    <span className="text-[10px] font-black text-primary">{idx + 1}</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            {/* Management Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <List size={20} className="text-gray-400" />
                        <h3 className="font-black text-footerBg uppercase tracking-tight">All Categories List</h3>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toggle visibility and set display priority</p>
                </div>

                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Category</AdminTableHead>
                        <AdminTableHead className="text-center">Current Status</AdminTableHead>
                        <AdminTableHead className="text-center">Display Order</AdminTableHead>
                        <AdminTableHead className="text-right">Action</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {categories.map((cat) => (
                            <AdminTableRow key={cat.id}>
                                <AdminTableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 p-1">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-md" />
                                            ) : (
                                                <Layers size={18} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-footerBg text-sm">{cat.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{cat.slug}</p>
                                        </div>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-center">
                                    <div className="flex justify-center">
                                        {cat.showInNavbar ? (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-green-100">
                                                <CheckCircle2 size={10} /> Active in Header
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                                                Not in Header
                                            </span>
                                        )}
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            value={cat.order || 0}
                                            onChange={(e) => handleOrderChange(cat.id, e.target.value)}
                                            className="w-16 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-center text-xs font-bold text-footerBg outline-none focus:border-black"
                                        />
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-right">
                                    <button
                                        onClick={() => handleToggleNavbar(cat)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            cat.showInNavbar 
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {cat.showInNavbar ? 'Remove' : 'Add to Header'}
                                    </button>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}
                    </AdminTableBody>
                </AdminTable>
                
                {categories.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">No categories found</p>
                    </div>
                )}
            </div>
            
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-amber-600 shrink-0 shadow-sm">
                    <ArrowUp size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">How Ordering Works</h4>
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        Categories are sorted by their **Display Order** value in ascending order (0, 1, 2...). 
                        Categories with the same order value will appear alphabetically.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HeaderCategoryPage;
