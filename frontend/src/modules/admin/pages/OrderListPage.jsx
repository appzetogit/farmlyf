import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    Search,
    Filter,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const API_URL = API_BASE_URL;

const OrderListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status') || 'All';

    // Fetch Orders - Force Refresh 2024
    console.log('OrderListPage rendering');
    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Orders are already a flat list from API
    const allOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [orders]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const matchesSearch =
                order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userName?.toLowerCase().includes(searchTerm.toLowerCase());

            const normalizedStatus = order.status === 'pending' ? 'Processing' : order.status;
            const matchesStatus = statusFilter === 'All' || normalizedStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allOrders, searchTerm, statusFilter]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const getStatusStyles = (st) => {
        const normalized = st === 'pending' ? 'Processing' : st;
        switch (normalized) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Received': return 'bg-sky-50 text-sky-600 border-sky-100';
            case 'Processed': return 'bg-teal-50 text-teal-600 border-teal-100';
            case 'OutForDelivery': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'ReturnInitiated': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Returned': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const stats = [
        { label: 'All Order', value: allOrders.length, icon: Package, color: 'bg-indigo-50 text-indigo-500' },
        { label: 'Pending Order', value: allOrders.filter(o => o.status === 'Processing' || o.status === 'pending').length, icon: Clock, color: 'bg-amber-50 text-amber-500' },
        { label: 'Delivered Order', value: allOrders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500' },
        { label: 'Cancelled Order', value: allOrders.filter(o => o.status === 'Cancelled').length, icon: XCircle, color: 'bg-red-50 text-red-500' }
    ];

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Order Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Monitor and fulfill customer dryfruit orders</p>
                </div>
                <button className="bg-footerBg text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-footerBg/20">
                    <Download size={18} /> Export Reports
                </button>
            </div>

            {/* Stats Overview */}
            {statusFilter === 'All' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        placeholder="Search by Order ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                {statusFilter === 'All' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto no-scrollbar">
                            {['All', 'Processing', 'Delivered', 'Cancelled'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => navigate(`/admin/orders?status=${s}`)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                        }`}
                                >
                                    {s === 'Processing' ? 'Pending' : s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead width="60px" className="text-center">#</AdminTableHead>
                        <AdminTableHead className="min-w-[120px]">Order ID</AdminTableHead>
                        <AdminTableHead className="min-w-[110px]">Date</AdminTableHead>
                        <AdminTableHead className="min-w-[160px]">Customer</AdminTableHead>
                        <AdminTableHead className="min-w-[120px]">Customer Type</AdminTableHead>
                        <AdminTableHead className="min-w-[100px]">Payment</AdminTableHead>
                        <AdminTableHead className="text-center min-w-[80px]">Items</AdminTableHead>
                        <AdminTableHead className="min-w-[120px]">Value</AdminTableHead>
                        <AdminTableHead className="min-w-[140px]">Order Status</AdminTableHead>
                        <AdminTableHead className="min-w-[120px]">Shipment</AdminTableHead>
                        <AdminTableHead className="text-right min-w-[100px]">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedOrders.map((order, index) => {
                            const realIndex = (currentPage - 1) * itemsPerPage + index + 1;

                            return (
                                <AdminTableRow key={order.id}>
                                    <AdminTableCell className="text-center font-bold text-gray-400">
                                        {realIndex}
                                    </AdminTableCell>
                                    <AdminTableCell className="font-bold text-xs text-footerBg select-all">
                                        #{order.id}
                                    </AdminTableCell>
                                    <AdminTableCell className="text-sm text-gray-500">
                                        {(new Date(order.date)).toLocaleDateString('en-GB')}
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="font-bold text-footerBg text-sm">{order.userName || order.shippingAddress?.fullName || 'Unknown'}</span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${(order.id?.charCodeAt(order.id.length - 1) || 0) % 2 === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                            {(order.id?.charCodeAt(order.id.length - 1) || 0) % 2 === 0 ? 'Returning' : 'New'}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className={`font-bold text-xs ${order.paymentMethod === 'cod' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                            {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="font-bold text-center text-gray-500">
                                        {order.items?.length || 0}
                                    </AdminTableCell>
                                    <AdminTableCell className="font-black text-footerBg text-sm">
                                        ₹{order.amount?.toLocaleString()}
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusStyles(order.status)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {order.status === 'pending' ? 'Processing' : order.status}
                                            </span>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        {order.awbCode ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-footerBg">{order.courierName || 'Courier'}</span>
                                                    {order.deliveryStatus && (
                                                        <div className={`px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tighter ${getStatusStyles(order.deliveryStatus)}`}>
                                                            {order.deliveryStatus === 'OutForDelivery' ? 'Out For Delivery' : order.deliveryStatus}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="block text-[10px] font-mono text-gray-400">{order.awbCode}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-400 uppercase">Pending</span>
                                                {order.status === 'Cancelled' && (
                                                    <span className="text-[8px] font-black text-red-400 uppercase px-1.5 py-0.5 rounded border border-red-100 bg-red-50">Cancelled</span>
                                                )}
                                            </div>
                                        )}
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            className="px-3 py-1.5 bg-footerBg text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-footerBg/10"
                                        >
                                            View
                                        </button>
                                    </AdminTableCell>
                                </AdminTableRow>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan="10" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                    No orders found matching requirements
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
                    totalItems={filteredOrders.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default OrderListPage;
