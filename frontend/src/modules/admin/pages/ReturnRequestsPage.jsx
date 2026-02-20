import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    Search,
    Filter,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    MessageSquare,
    IndianRupee,
    Truck,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const API_URL = API_BASE_URL;

const ReturnRequestsPage = () => {
    const navigate = useNavigate();
    const DUMMY_RETURNS = [
        {
            id: '101',
            orderId: '5001',
            userName: 'Rohan Sharma',
            type: 'Refund',
            reason: 'Damaged Product',
            requestDate: '2025-02-01T10:00:00Z',
            amount: 1500,
            status: 'Pending',
        },
        {
            id: '102',
            orderId: '5002',
            userName: 'Priya Verma',
            type: 'Replacement',
            reason: 'Wrong Color',
            requestDate: '2025-02-02T14:30:00Z',
            amount: 899,
            status: 'Approved',
        },
        {
            id: '103',
            orderId: '5003',
            userName: 'Amit Singh',
            type: 'Refund',
            reason: 'Size Issue',
            requestDate: '2025-02-03T09:15:00Z',
            amount: 2100,
            status: 'Refunded',
        },
        {
            id: '104',
            orderId: '5004',
            userName: 'Neha Gupta',
            type: 'Replacement',
            reason: 'Defective',
            requestDate: '2025-02-04T12:00:00Z',
            amount: 750,
            status: 'Rejected',
        },
        {
            id: '105',
            orderId: '5005',
            userName: 'Vikram Das',
            type: 'Refund',
            reason: 'Changed Mind',
            requestDate: '2025-02-05T16:45:00Z',
            amount: 1200,
            status: 'Completed',
        },
    ];

    // Fetch Returns
    const { data: returnsData = [] } = useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/returns`);
            if (!res.ok) throw new Error('Failed to fetch returns');
            return res.json();
        }
    });

    // Update Status Mutation
    const queryClient = useQueryClient();
    const updateReturnStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await fetch(`${API_URL}/returns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['returns']);
            toast.success('Return status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    // Approve Return Mutation
    const approveReturn = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/returns/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to approve');
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['returns']);
            toast.success(`Return approved! ${data.return?.awbCode ? `AWB: ${data.return.awbCode}` : ''}`);
        },
        onError: (err) => toast.error(err.message || 'Failed to approve return')
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const allReturns = useMemo(() => {
        if (Array.isArray(returnsData)) {
            return [...returnsData].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        }
        return [];
    }, [returnsData]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredReturns = useMemo(() => {
        return allReturns.filter(ret => {
            const matchesSearch =
                ret.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allReturns, searchTerm, statusFilter]);

    const paginatedReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReturns.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReturns, currentPage]);

    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed':
            case 'Refunded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const stats = [
        { label: 'Total Requests', value: allReturns.length, icon: RefreshCw, color: 'bg-indigo-50 text-indigo-500' },
        { label: 'Pending', value: allReturns.filter(r => r.status === 'Pending').length, icon: Clock, color: 'bg-amber-50 text-amber-500' },
        { label: 'Approved', value: allReturns.filter(r => r.status === 'Approved').length, icon: CheckCircle2, color: 'bg-blue-50 text-blue-500' },
        { label: 'Refunded', value: allReturns.filter(r => r.status === 'Refunded').length, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-500' }
    ];

    // Pickup status badge colors
    const getPickupStatusStyles = (status) => {
        switch (status) {
            case 'Picked Up':
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'In Transit': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Scheduled': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Not Scheduled':
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Return Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage Returns, Replacements and Refunds</p>
                </div>
            </div>

            {/* Stats Overview */}
            {statusFilter === 'All' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-footerBg">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 text-left">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                {statusFilter === 'All' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {['All', 'Pending', 'Approved', 'Refunded', 'Rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead className="min-w-[120px] px-6 py-4">Return ID</AdminTableHead>
                        <AdminTableHead className="min-w-[120px] px-6 py-4">Order ID</AdminTableHead>
                        <AdminTableHead className="min-w-[140px] px-6 py-4">Customer</AdminTableHead>
                        <AdminTableHead className="min-w-[120px] px-6 py-4">Reason</AdminTableHead>
                        <AdminTableHead className="min-w-[100px] px-6 py-4">Amount</AdminTableHead>
                        <AdminTableHead className="min-w-[100px] px-6 py-4">Status</AdminTableHead>
                        <AdminTableHead className="min-w-[100px] px-6 py-4">AWB</AdminTableHead>
                        <AdminTableHead className="min-w-[100px] px-6 py-4">Pickup</AdminTableHead>
                        <AdminTableHead className="text-right min-w-[140px] px-6 py-4">Action</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedReturns.map((ret) => (
                            <AdminTableRow key={ret._id || ret.id}>
                                <AdminTableCell className="font-bold text-xs text-footerBg select-all px-6 py-4">
                                    {ret.id || `RTN-${ret._id?.toString().slice(-4).toUpperCase()}`}
                                </AdminTableCell>
                                <AdminTableCell className="font-bold text-xs text-gray-500 select-all px-6 py-4">
                                    {ret.orderId || '-'}
                                </AdminTableCell>
                                <AdminTableCell className="px-6 py-4">
                                    <span className="font-bold text-footerBg text-sm">{ret.userName || '-'}</span>
                                </AdminTableCell>
                                <AdminTableCell className="text-xs text-gray-600 font-medium truncate max-w-[120px] px-6 py-4">
                                    {ret.reason || '-'}
                                </AdminTableCell>
                                <AdminTableCell className="font-black text-footerBg text-sm px-6 py-4">
                                    ₹{(ret.refundAmount || ret.amount || 0).toLocaleString()}
                                </AdminTableCell>
                                <AdminTableCell className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusStyles(ret.status)}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{ret.status}</span>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="font-mono text-xs text-gray-600 px-6 py-4">
                                    {ret.awbCode || '-'}
                                </AdminTableCell>
                                <AdminTableCell className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border ${getPickupStatusStyles(ret.pickupStatus || 'Not Scheduled')}`}>
                                        <span className="text-[9px] font-bold uppercase">{ret.pickupStatus || 'Not Scheduled'}</span>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-right px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {ret.status === 'Pending' && (
                                            <button
                                                onClick={() => approveReturn.mutate(ret._id)}
                                                disabled={approveReturn.isPending}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                                            >
                                                {approveReturn.isPending ? '...' : 'Approve'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/admin/returns/${ret._id}`)}
                                            className="px-3 py-1.5 bg-footerBg text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-footerBg/10"
                                        >
                                            View
                                        </button>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}
                        {paginatedReturns.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan="9" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                    No return requests found
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
                    totalItems={filteredReturns.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ReturnRequestsPage;
