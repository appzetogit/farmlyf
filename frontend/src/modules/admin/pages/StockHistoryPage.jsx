import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Download,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const StockHistoryPage = () => {
    const navigate = useNavigate();

    // Dummy Data for Stock History
    const dummyHistory = [
        {
            id: 'h1',
            date: '2023-10-25T10:30:00',
            productName: 'Farmlyf Jumbo Roasted Royale Cashews',
            sku: 'CSW-ROY-JMB',
            image: 'https://images.unsplash.com/photo-1509911595723-a3b1f4f46bc8?w=200&q=80',
            type: 'adjustment',
            change: 50,
            previousStock: 120,
            newStock: 170,
            performedBy: 'Admin (Aditi)',
            reason: 'Restock'
        },
        {
            id: 'h2',
            date: '2023-10-24T14:15:00',
            productName: 'California Shelled Walnuts Half',
            sku: 'WLN-CAL-SHL',
            image: 'https://images.unsplash.com/photo-1585250001047-97d8ba17c5b9?w=200&q=80',
            type: 'order',
            change: -2,
            previousStock: 10,
            newStock: 8,
            performedBy: 'System',
            reason: 'Order #ORD-2023-1001'
        },
        {
            id: 'h3',
            date: '2023-10-24T09:00:00',
            productName: 'Iranian Mamra Almonds Premium',
            sku: 'ALM-MAM-IRN',
            image: 'https://images.unsplash.com/photo-1511270278403-918991a0f9b3?w=200&q=80',
            type: 'return',
            change: 1,
            previousStock: 44,
            newStock: 45,
            performedBy: 'System',
            reason: 'Return #RET-099'
        },
        {
            id: 'h4',
            date: '2023-10-23T16:45:00',
            productName: 'Farmlyf Jumbo Roasted Royale Cashews',
            sku: 'CSW-ROY-JMB',
            image: 'https://images.unsplash.com/photo-1509911595723-a3b1f4f46bc8?w=200&q=80',
            type: 'adjustment',
            change: -5,
            previousStock: 125,
            newStock: 120,
            performedBy: 'Admin (Aditi)',
            reason: 'Damage/Spoilage'
        },
        {
            id: 'h5',
            date: '2023-10-22T11:20:00',
            productName: 'Turkish Dried Apricots Jumbo',
            sku: 'APR-TRK-JMB',
            image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=200&q=80',
            type: 'adjustment',
            change: 62,
            previousStock: 0,
            newStock: 62,
            performedBy: 'Admin (Aditi)',
            reason: 'Initial Stock'
        },
        {
            id: 'h6',
            date: '2023-10-21T10:30:00',
            productName: 'Farmlyf Jumbo Roasted Royale Cashews',
            sku: 'CSW-ROY-JMB',
            image: 'https://images.unsplash.com/photo-1509911595723-a3b1f4f46bc8?w=200&q=80',
            type: 'adjustment',
            change: 125,
            previousStock: 0,
            newStock: 125,
            performedBy: 'Admin (Aditi)',
            reason: 'Initial Stock'
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredHistory = useMemo(() => {
        return dummyHistory.filter(item => {
            const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || item.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType]);

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredHistory, currentPage]);

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const getTypeColor = (type) => {
        switch (type) {
            case 'adjustment': return 'bg-purple-100 text-purple-700';
            case 'order': return 'bg-blue-100 text-blue-700';
            case 'return': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'adjustment': return 'Manual Adjustment';
            case 'order': return 'Order Fulfilled';
            case 'return': return 'Return Restock';
            default: return type;
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
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Stock History</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Audit trail of all inventory movements</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">Filter By:</span>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['all', 'adjustment', 'order', 'return'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterType === type ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Date & Time</AdminTableHead>
                        <AdminTableHead>Product Name</AdminTableHead>
                        <AdminTableHead>Transaction Type</AdminTableHead>
                        <AdminTableHead className="text-center">Stock Change</AdminTableHead>
                        <AdminTableHead className="text-center">Effect</AdminTableHead>
                        <AdminTableHead>User / Reason</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedHistory.map((item) => (
                            <AdminTableRow key={item.id} className="hover:bg-gray-50/50">
                                <AdminTableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">
                                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                            <img src={item.image} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.productName}</p>
                                            <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                        </div>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getTypeColor(item.type)}`}>
                                        {getTypeLabel(item.type)}
                                    </span>
                                </AdminTableCell>
                                <AdminTableCell className="text-center">
                                    <span className={`text-sm font-black ${item.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.change > 0 ? '+' : ''}{item.change}
                                    </span>
                                </AdminTableCell>
                                <AdminTableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500">
                                        <span>{item.previousStock}</span>
                                        <ArrowRight size={12} className="text-gray-300" />
                                        <span className="font-bold text-gray-900">{item.newStock}</span>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-900">{item.reason}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.performedBy}</span>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}

                        {filteredHistory.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="h-64 text-center text-gray-400">
                                    No history found matching your filters
                                </AdminTableCell>
                            </AdminTableRow>
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
                    totalItems={filteredHistory.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default StockHistoryPage;
