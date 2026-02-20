import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Search,
    RefreshCcw,
    AlertCircle,
    Check,
    Package,
    Plus,
    Minus,
    ArrowRight
} from 'lucide-react';
import { useProducts, useUpdateProduct } from '../../../hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import Pagination from '../components/Pagination';

const StockAdjustmentPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: products = [], isLoading } = useProducts();
    const updateProductMutation = useUpdateProduct();

    const [searchTerm, setSearchTerm] = useState('');
    const [adjustments, setAdjustments] = useState({}); // { 'productId:variantId' or 'productId': addedQuantity }
    const [selectedVariants, setSelectedVariants] = useState({}); // { productId: variantId }
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handleAdjustmentChange = (id, value) => {
        if (value === '') {
            const newAdjustments = { ...adjustments };
            delete newAdjustments[id];
            setAdjustments(newAdjustments);
            return;
        }

        const qty = parseInt(value);
        if (isNaN(qty)) return;

        setAdjustments(prev => ({
            ...prev,
            [id]: qty
        }));
    };

    const handleSaveAll = async () => {
        const adjustedKeys = Object.keys(adjustments);
        if (adjustedKeys.length === 0) return;

        setIsSaving(true);
        const loadingToast = toast.loading('Syncing stock ledger...');

        try {
            // Group by productId
            const productUpdates = {};
            adjustedKeys.forEach(key => {
                const [pid, vid] = key.split(':'); // Using colon to avoid confusion with potential hyphens in IDs
                if (!productUpdates[pid]) productUpdates[pid] = [];
                productUpdates[pid].push({ vid, adjustment: adjustments[key] });
            });

            for (const pid of Object.keys(productUpdates)) {
                const product = products.find(p => p.id === pid || p._id === pid);
                if (!product) continue;

                const updatedData = JSON.parse(JSON.stringify(product)); // Deep clone
                
                productUpdates[pid].forEach(({ vid, adjustment }) => {
                    if (!vid) {
                        // Main product adjustment
                        const currentStock = updatedData.stock?.quantity || 0;
                        updatedData.stock = { ...updatedData.stock, quantity: Math.max(0, currentStock + adjustment) };
                    } else {
                        // Variant adjustment
                        const variantIndex = updatedData.variants?.findIndex(v => v.id === vid || v._id === vid);
                        if (variantIndex !== -1) {
                            const currentVStock = updatedData.variants[variantIndex].stock || 0;
                            updatedData.variants[variantIndex].stock = Math.max(0, currentVStock + adjustment);
                        }
                    }
                });

                await updateProductMutation.mutateAsync({ id: pid, data: updatedData });
            }

            toast.success('Stock updated successfully!', { id: loadingToast });
            setAdjustments({});
            queryClient.invalidateQueries({ queryKey: ['products'] });

        } catch (error) {
            console.error('Stock update error:', error);
            toast.error('Failed to update some items', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

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
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Stock Adjustments</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Add or Remove stock for your inventory</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSaveAll}
                        disabled={Object.keys(adjustments).length === 0 || isSaving}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${Object.keys(adjustments).length > 0
                                ? 'bg-black text-white hover:bg-gray-900 active:scale-95 shadow-primary/20'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                        Sync Changes
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products by Name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                {Object.keys(adjustments).length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                        <AlertCircle size={14} />
                        <span>{Object.keys(adjustments).length} pending modifications</span>
                    </div>
                )}
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead width="40%">Product Details</AdminTableHead>
                        <AdminTableHead width="15%">SKU Code</AdminTableHead>
                        <AdminTableHead width="15%" className="text-center">Current Stock</AdminTableHead>
                        <AdminTableHead width="15%" className="text-center border-x border-gray-100 bg-gray-50/50">Add / Remove</AdminTableHead>
                        <AdminTableHead width="15%" className="text-center">Final Stock</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {isLoading ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading...</p>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : (
                            paginatedProducts.map((p) => {
                                const productId = p.id || p._id;
                                const hasVariants = p.variants && p.variants.length > 0;
                                const selectedVariantId = selectedVariants[productId] || (hasVariants ? p.variants[0].id || p.variants[0]._id : null);
                                const selectedVariant = hasVariants ? p.variants.find(v => (v.id || v._id) === selectedVariantId) : null;
                                
                                const adjustmentKey = selectedVariantId ? `${productId}:${selectedVariantId}` : productId;
                                const adjustment = adjustments[adjustmentKey];
                                const isModified = adjustment !== undefined && adjustment !== 0;
                                
                                const currentStock = hasVariants ? (selectedVariant?.stock || 0) : (p.stock?.quantity || 0);
                                const finalStock = Math.max(0, currentStock + (adjustment || 0));

                                return (
                                    <AdminTableRow key={productId} className={`group ${isModified ? 'bg-blue-50/20' : ''}`}>
                                        <AdminTableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                    {p.image ? (
                                                        <img src={p.image} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Package size={20} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-footerBg text-sm line-clamp-1 uppercase">
                                                        {p.name}
                                                    </p>
                                                    {hasVariants ? (
                                                        <select
                                                            value={selectedVariantId}
                                                            onChange={(e) => setSelectedVariants(prev => ({ ...prev, [productId]: e.target.value }))}
                                                            className="mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary outline-none focus:border-primary transition-all cursor-pointer"
                                                        >
                                                            {p.variants.map(v => (
                                                                <option key={v.id || v._id} value={v.id || v._id}>
                                                                    {v.weight}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category || 'Uncategorized'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">
                                                {hasVariants ? (selectedVariant?.id?.slice(-6).toUpperCase()) : (p.sku || p.id?.slice(-6).toUpperCase() || '-')}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-center">
                                            <div className={`transition-all duration-500 ${isModified ? 'scale-110 font-black' : ''}`}>
                                                <span className={`text-sm ${currentStock === 0 ? 'text-red-500 font-bold' : 'text-gray-700 font-bold'}`}>
                                                    {currentStock}
                                                </span>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-center border-x border-gray-100 bg-gray-50/30 p-0">
                                            <div className="flex items-center justify-center w-full h-full p-2">
                                                <div className="relative w-24">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={adjustment !== undefined ? adjustment : ''}
                                                        onChange={(e) => handleAdjustmentChange(adjustmentKey, e.target.value)}
                                                        className={`w-full text-center text-sm font-bold border rounded-lg py-2 outline-none transition-all placeholder:text-gray-300 ${isModified
                                                                ? (adjustment > 0 ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700')
                                                                : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {isModified ? (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                                        <ArrowRight size={14} className="text-gray-300" />
                                                        <span className={`text-sm font-black ${finalStock > currentStock ? 'text-green-600' : finalStock < currentStock ? 'text-red-500' : 'text-gray-900'}`}>
                                                            {finalStock}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>
                                );
                            })
                        )}
                        {!isLoading && filteredProducts.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan={5} className="h-64 text-center text-gray-400">
                                    No products found matching "{searchTerm}"
                                </AdminTableCell>
                            </AdminTableRow>
                        )}
                    </AdminTableBody>
                </AdminTable>
                
                {filteredProducts.length > itemsPerPage && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Floating Bar */}
            {Object.keys(adjustments).length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-8 py-4 rounded-xl shadow-2xl border border-gray-200 flex items-center justify-between gap-10 z-[100] animate-in slide-in-from-bottom-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                            <RefreshCcw size={20} className={isSaving ? 'animate-spin' : ''} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Review Changes</p>
                            <p className="text-xs text-gray-500">
                                Updating {Object.keys(adjustments).length} products
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setAdjustments({})}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Reset All
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="bg-black text-white px-8 py-2.5 rounded-lg font-bold text-xs hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            Confirm Updates <Check size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAdjustmentPage;
