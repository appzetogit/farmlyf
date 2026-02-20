import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    AlertTriangle,
    Search,
    Filter,
    ArrowRight,
    Package,
    ShoppingCart,
    Bell
} from 'lucide-react';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

import { useProducts } from '../../../hooks/useProducts';

const LowStockAlertsPage = () => {
    const navigate = useNavigate();
    const { data: allProducts = [], isLoading } = useProducts();

    const products = useMemo(() => {
        return allProducts.filter(p => {
            const stock = p.stock?.quantity || 0;
            const threshold = p.lowStockThreshold || 10;
            return stock <= threshold;
        }).map(p => ({
            id: p._id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            image: p.image,
            stock: p.stock?.quantity || 0,
            threshold: p.lowStockThreshold || 10,
            status: (p.stock?.quantity || 0) === 0 ? 'out_of_stock' : 'low_stock'
        }));
    }, [allProducts]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0).length;

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Low Stock Alerts</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Items needing attention immediately</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/inventory/adjust')}
                        className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Package size={16} />
                        Restock Items
                    </button>
                </div>
            </div>

            {/* Summary Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-red-900">{outOfStockCount}</h3>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Critical (Out of Stock)</p>
                    </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-orange-900">{lowStockCount}</h3>
                        <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Low Stock Warning</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead width="40%">Product Details</AdminTableHead>
                        <AdminTableHead width="15%">Category</AdminTableHead>
                        <AdminTableHead width="25%">Stock Status</AdminTableHead>
                        <AdminTableHead width="20%" className="text-right">Action</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {filteredProducts.map((p) => {
                            const percent = Math.min(100, (p.stock / p.threshold) * 100);
                            const isCritical = p.stock === 0;

                            return (
                                <AdminTableRow key={p.id} className="hover:bg-gray-50/50">
                                    <AdminTableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
                                                <img src={p.image} className={`w-full h-full object-contain ${isCritical ? 'opacity-50 grayscale' : ''}`} />
                                                {isCritical && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <AlertTriangle size={16} className="text-red-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                                            </div>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">
                                            {p.category}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="w-full max-w-[200px]">
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className={isCritical ? 'text-red-600' : 'text-orange-600'}>
                                                    {p.stock} units left
                                                </span>
                                                <span className="text-gray-400">
                                                    Alert at {p.threshold}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <button
                                            onClick={() => navigate('/admin/inventory/adjust')}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all hover:border-gray-300"
                                        >
                                            Quick Restock <ArrowRight size={14} />
                                        </button>
                                    </AdminTableCell>
                                </AdminTableRow>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan={4} className="h-64 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <CheckCircle size={32} className="text-green-500 opacity-50" />
                                        <p>No low stock alerts!</p>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        )}
                    </AdminTableBody>
                </AdminTable>
            </div>
        </div>
    );
};

// Helper Icon for empty state
import { CheckCircle } from 'lucide-react';

export default LowStockAlertsPage;
