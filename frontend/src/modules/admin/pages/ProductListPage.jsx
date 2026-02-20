import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Package,
    Tag as TagIcon,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    Star,
    Calendar,
    Settings,
    AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, useDeleteProduct } from '../../../hooks/useProducts';
import { useUpdateFeaturedSection } from '../../../hooks/useContent';
import { useQueryClient } from '@tanstack/react-query';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';


const ProductListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: products = [] } = useProducts();
    const queryClient = useQueryClient();
    const updateSectionMutation = useUpdateFeaturedSection();
    const deleteProductMutation = useDeleteProduct();

    // Check if we are in Selection Mode (e.g. for Homepage Sections)
    const selectionMode = location.state?.selectionMode;
    const targetSectionId = location.state?.sectionId;
    const targetSectionTitle = location.state?.sectionTitle;
    const dbSectionId = location.state?.dbSectionId;

    const handleDelete = (id) => {
        if (window.confirm('Delete this product?')) {
            deleteProductMutation.mutate(id);
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            selectedProducts.forEach(id => deleteProductMutation.mutate(id));
            setSelectedProducts([]);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const itemsPerPage = 8;

    const [expandedProductId, setExpandedProductId] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(location.state?.preSelected || []);

    // Toggle Row Expansion for Variants
    const toggleExpand = (id) => {
        setExpandedProductId(prev => prev === id ? null : id);
    };

    // Checkbox Logic
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(paginatedProducts.map(p => p._id));
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleConfirmSelection = async () => {
        if (!dbSectionId) {
            toast.error('Missing target section ID');
            return;
        }

        try {
            await updateSectionMutation.mutateAsync({
                id: dbSectionId,
                data: { products: selectedProducts }
            });
            navigate(-1);
        } catch (error) {
            toast.error('Failed to update section');
        }
    };

    const getPriceRange = (variants) => {
        if (!variants || variants.length === 0) return 'N/A';
        const prices = variants.map(v => v.price);
        const minFn = (arr) => Math.min(...arr);
        const maxFn = (arr) => Math.max(...arr);
        const min = minFn(prices);
        const max = maxFn(prices);

        if (min === max) return `₹${min}`;
        return `₹${min} – ₹${max}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                const matchesSearch =
                    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    String(product._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (typeof product.category === 'string' ? product.category : product.category?.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.subcategory?.name?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory = filterCategory === 'All' || 
                    (typeof product.category === 'string' ? product.category === filterCategory : product.category?.name === filterCategory);

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => (String(b._id || '').localeCompare(String(a._id || '')) || 0)); // Assuming higher ID is newer
    }, [products, searchTerm, filterCategory]);

    const suggestions = useMemo(() => {
        if (searchTerm.length < 2) return [];
        return products
            .filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 6);
    }, [products, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const categories = ['All', ...new Set(products.map(p => typeof p.category === 'string' ? p.category : p.category?.name).filter(Boolean))];

    const getStockStatus = (variants) => {
        if (!variants || variants.length === 0) return { label: 'No Variants', color: 'text-gray-400 bg-gray-50' };
        const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
        const hasOutOfStock = variants.some(v => (v.stock || 0) === 0);

        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100' };
        if (hasOutOfStock) return { label: 'Partially In Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
        return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    };



    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                        {selectionMode ? `Adding to: ${targetSectionTitle}` : 'Product Inventory'}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                        {selectionMode ? 'Select products to display in this section' : 'Manage your premium dry fruit catalog'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mode: Standard */}
                    {!selectionMode && selectedProducts.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100 animate-in fade-in zoom-in duration-200"
                        >
                            <Trash2 size={18} strokeWidth={3} /> Delete ({selectedProducts.length})
                        </button>
                    )}
                    {!selectionMode && (
                        <button
                            onClick={() => navigate('/admin/products/add')}
                            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} strokeWidth={3} /> Add New Product
                        </button>
                    )}

                    {/* Mode: Selection */}
                    {selectionMode && (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-white text-gray-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSelection}
                                className="bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                            >
                                <CheckCircle2 size={18} strokeWidth={3} /> Save Selection ({selectedProducts.length})
                            </button>
                        </>
                    )}
                </div>
            </div>



            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products, brands..."
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
                                            key={suggestion.id}
                                            onClick={() => {
                                                setSearchTerm(suggestion.name);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0">
                                                <img src={suggestion.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none mb-1">{suggestion.brand}</p>
                                                <p className="text-xs font-bold text-footerBg truncate">{suggestion.name}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Press Enter to see all results</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-50 border border-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-primary cursor-pointer shrink-0"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead width="30px"></AdminTableHead>
                        <AdminTableHead width="40px">
                            <input
                                type="checkbox"
                                onChange={toggleSelectAll}
                                checked={paginatedProducts.length > 0 && selectedProducts.length === paginatedProducts.length}
                                className={`w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer ${!selectionMode ? 'hidden group-hover:block' : ''}`}
                            />
                        </AdminTableHead>
                        <AdminTableHead>Product Name</AdminTableHead>
                        <AdminTableHead className="text-center">SKU Count</AdminTableHead>
                        <AdminTableHead>Category</AdminTableHead>
                        <AdminTableHead>Price Range</AdminTableHead>
                        <AdminTableHead>Stock Status</AdminTableHead>
                        <AdminTableHead>Rating</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead>Created Date</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedProducts.map((product) => {
                            const status = getStockStatus(product.variants);
                            const isExpanded = expandedProductId === product._id;
                            const isSelected = selectedProducts.includes(product._id);

                            return (
                                <React.Fragment key={product._id}>
                                    <AdminTableRow
                                        className={`${isExpanded ? 'bg-gray-50' : ''} ${isSelected ? 'bg-green-50/30' : ''}`}
                                        onClick={() => toggleExpand(product._id)}
                                    >
                                        <AdminTableCell onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleExpand(product._id)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </AdminTableCell>
                                        <AdminTableCell onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectProduct(product._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </AdminTableCell>
                                        <AdminTableCell className="cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                    <img src={product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url)} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                        {product.name}
                                                    </p>
                                                    {product.brand?.replace(/Farmlyf( Premium)?/gi, '').trim() && (
                                                        <p className="text-xs text-gray-500">{product.brand?.replace(/Farmlyf( Premium)?/gi, '').trim()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-center">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                                {product.variants?.length || 0}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-700">{typeof product.category === 'string' ? product.category : product.category?.name}</span>
                                                <span className="text-xs text-gray-400">{product.subcategory?.name || '-'}</span>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm font-medium text-gray-900">{getPriceRange(product.variants)}</span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-')}`}>
                                                {status.label}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                                <span className="text-sm text-gray-700">{product.rating || '4.5'}</span>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.variants?.some(v => (v.stock || 0) > 0) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {product.variants?.some(v => (v.stock || 0) > 0) ? 'Active' : 'Inactive'}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm text-gray-500">{formatDate(product.createdAt || product.id?.split('_')[1] || Date.now())}</span>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>
                                    {isExpanded && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="11" className="p-0 border-b border-gray-100">
                                                <div className="p-4 pl-14">
                                                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm w-full md:w-3/4 max-w-full">
                                                        <table className="text-left border-collapse w-full">
                                                            <thead>
                                                                <tr className="bg-gray-100 border-b border-gray-200">
                                                                    <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">SKU / ID</th>
                                                                    <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Weight</th>
                                                                    <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Price</th>
                                                                    <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Stock</th>
                                                                    <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap text-right">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {product.variants?.map((variant, idx) => (
                                                                    <tr key={variant.id || idx} className="hover:bg-gray-50/50">
                                                                        <td className="px-4 py-2 font-mono text-xs font-bold text-gray-600">
                                                                            {product.brand?.substring(0, 3).toUpperCase()}-{variant.weight || 'VAR'}-{idx + 1}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-700">{variant.weight}</td>
                                                                        <td className="px-4 py-2">
                                                                            <div className="flex items-baseline gap-2">
                                                                                <span className="text-sm text-gray-900">₹{variant.price}</span>
                                                                                <span className="text-xs text-gray-400 line-through">₹{variant.mrp}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-700">{variant.stock}</td>
                                                                        <td className="px-4 py-2 text-right">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${(variant.stock || 0) > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                                (variant.stock || 0) > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                                    'bg-red-50 text-red-600 border-red-100'
                                                                                }`}>
                                                                                {(variant.stock || 0) > 10 ? 'Active' : (variant.stock || 0) > 0 ? 'Low' : 'OOS'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="11" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No products found matching your criteria</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                                            className="mt-4 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </AdminTableBody>
                </AdminTable>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ProductListPage;
