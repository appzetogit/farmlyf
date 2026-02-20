import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Package,
    Heart,
    ShieldOff,
    ShieldCheck,
    ChevronRight,
    IndianRupee,
    User as UserIcon,
    ShoppingBag,
    Wallet,
    ChevronDown,
    ChevronUp,
    Briefcase,
    Building2,
    AlertCircle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = API_BASE_URL;

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();
    const queryClient = useQueryClient();
    const [showAllOrders, setShowAllOrders] = useState(false);

    // Fetch real user data
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch user');
            return res.json();
        }
    });

    // Fetch real order history for this user
    const { data: orders } = useQuery({
        queryKey: ['admin-user-orders', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders/user/${id}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!user
    });

    const orderHistory = useMemo(() => orders || [], [orders]);
    const displayedOrders = showAllOrders ? orderHistory : orderHistory.slice(0, 4);

    const handleToggleBan = async () => {
        try {
            const res = await fetch(`${API_URL}/users/${id}/ban`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                // Invalidate and refetch user data
                queryClient.invalidateQueries(['admin-user', id]);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    if (isLoading) return <div className="p-20 text-center text-xs font-black uppercase tracking-widest text-gray-400">Loading User Details...</div>;
    if (error || !user) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShieldOff size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-footerBg mb-2 uppercase tracking-tighter">Error Loading User</h2>
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 px-6 py-3 bg-footerBg text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
                <ArrowLeft size={18} /> Back to Users
            </button>
        </div>
    );

    const totalSpend = user.totalSpend || 0;

    return (
        <div className="space-y-6 font-['Inter'] text-footerBg animate-in fade-in duration-500">
            {/* Simple Top Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-gray-500 hover:text-footerBg font-black text-[10px] uppercase tracking-[0.2em] transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to CRM
                </button>
                <div className="flex items-center gap-3">
                    {user.isBanned ? (
                        <div className="flex items-center gap-2">
                            {/* Static Status Label - Non-Clickable */}
                            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 select-none">
                                <AlertCircle size={14} />
                                Restricted Account
                            </div>
                            {/* Separate Action Button */}
                            <button
                                onClick={handleToggleBan}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2"
                                title="Unlock User"
                            >
                                <ShieldCheck size={14} />
                                Unlock User
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleToggleBan}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
                            title="Restrict Account"
                        >
                            <ShieldOff size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center font-black text-2xl border border-gray-100">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-footerBg tracking-tight">{user.name}</h1>
                            <span className={`w-fit mx-auto md:mx-0 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${user.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-[#2c5336]'
                                }`}>
                                {user.isBanned ? 'Restricted' : 'Verified Resident'}
                            </span>
                            <span className={`w-fit mx-auto md:mx-0 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${user.accountType === 'Business' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {user.accountType || 'Individual'}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1">
                            <div className="flex items-center gap-1.5 text-footerBg text-xs font-bold">
                                <Mail size={14} className="text-gray-400" />
                                <span className="underline decoration-gray-100 underline-offset-4">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-footerBg text-xs font-bold">
                                <Phone size={14} className="text-gray-400" />
                                {user.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                                <Calendar size={12} />
                                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            {user.accountType === 'Business' && user.gstNumber && (
                                <div className="flex items-center gap-1.5 text-blue-600 text-[8px] font-black uppercase tracking-widest">
                                    <Building2 size={12} />
                                    GST: {user.gstNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Addresses */}
                <div className="space-y-6">
                    {/* Compact Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                                <ShoppingBag size={20} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                            <p className="text-2xl font-black text-footerBg tabular-nums">{user.totalOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                                <Wallet size={20} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spend</p>
                            <p className="text-2xl font-black text-footerBg tabular-nums">₹{totalSpend.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Address Book */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                        <h3 className="font-black text-footerBg text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-gray-400" />
                            Registered Addresses
                        </h3>
                        <div className="space-y-3">
                            {user.addresses.length > 0 ? (
                                user.addresses.map((addr, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-gray-200 group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-footerBg text-white px-2 py-0.5 rounded-lg">
                                                {addr.type}
                                            </span>
                                            {addr.isDefault && <span className="text-[8px] font-black text-emerald-600 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Primary</span>}
                                        </div>
                                        <p className="text-xs font-black text-footerBg mb-1">{addr.fullName}</p>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">
                                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-gray-300 text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-100 rounded-2xl">No data found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                            <h3 className="font-black text-footerBg text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={16} className="text-gray-400" />
                                Order History
                            </h3>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{orderHistory.length} Total Logs</span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {displayedOrders.length > 0 ? (
                                displayedOrders.map((order) => (
                                    <div key={order.id} className="p-4 md:p-5 hover:bg-gray-50 transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-footerBg group-hover:border-footerBg transition-all">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-footerBg uppercase tracking-tighter">{order.id}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                    {new Date(order.createdAt || order.date).toLocaleDateString()} • {order.paymentMethod}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-footerBg mb-1 tabular-nums">₹{order.amount.toLocaleString()}</p>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-footerBg group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <ShoppingBag size={24} className="text-gray-200" />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Profile has no order history</p>
                                </div>
                            )}
                        </div>

                        {orderHistory.length > 4 && (
                            <button
                                onClick={() => setShowAllOrders(!showAllOrders)}
                                className="w-full py-4 bg-gray-50/30 border-t border-gray-50 text-[10px] font-black text-gray-400 hover:text-footerBg hover:bg-gray-50 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                {showAllOrders ? (
                                    <>Show Less <ChevronUp size={14} /></>
                                ) : (
                                    <>View All {orderHistory.length} Orders <ChevronDown size={14} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
