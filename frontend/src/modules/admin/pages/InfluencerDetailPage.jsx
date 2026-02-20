import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    IndianRupee, Users, Plus, X, ArrowLeft, Calendar,
    TrendingUp, Award, Download, Filter, Search, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useReferral, useAddPayout, useReferralOrders } from '../../../hooks/useReferrals';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const InfluencerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: influencer, isLoading, isError } = useReferral(id);
    const { data: orders = [], isLoading: ordersLoading } = useReferralOrders(id);
    const addPayoutMutation = useAddPayout();

    const [isAddingPayout, setIsAddingPayout] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');


    if (isLoading) return <div className="p-10 text-center font-black animate-pulse uppercase tracking-widest text-gray-400">Loading Performance Data...</div>;
    if (!influencer) return <div className="p-10 text-center font-black uppercase tracking-widest text-gray-400">Influencer Not Found</div>;

    const calculateEarnings = (item) => {
        const totalSales = item.totalSales || 0;
        const discountValue = item.value || 0;
        
        let netSales = totalSales;
        if (item.type === 'percentage') {
            netSales = totalSales * (1 - (discountValue / 100));
        } else {
            netSales = Math.max(0, totalSales - (discountValue * (item.usageCount || 0)));
        }
        
        return Math.floor(netSales * (item.commissionRate / 100));
    };

    const handleAddPayout = () => {
        const amount = Number(payoutAmount);
        if (!amount || amount <= 0) return;

        addPayoutMutation.mutate({ id: influencer._id || influencer.id, amount }, {
            onSuccess: () => {
                setIsAddingPayout(false);
                setPayoutAmount('');
                // Success toast is handled in the hook
            }
        });
    };

    const handleExportReport = () => {
        if (!influencer || orders.length === 0) {
            toast.error('No data to export');
            return;
        }

        // Prepare CSV data
        const headers = ['Customer Name', 'Order ID', 'Date', 'Amount (₹)', 'Commission (₹)'];
        const rows = orders.map(order => [
            order.userName || 'N/A',
            order.orderId || 'N/A',
            new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            order.amount || 0,
            order.commission || 0
        ]);

        // Add summary row
        const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const totalCommission = orders.reduce((sum, order) => sum + (order.commission || 0), 0);
        rows.push([]);
        rows.push(['TOTAL', '', '', totalAmount, totalCommission]);

        // Convert to CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${influencer.code}_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report exported successfully!');
    };

    return (
        <div className="space-y-8 font-['Inter']">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/referrals')}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight flex items-center gap-3">
                            {influencer.name}
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">{influencer.code}</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Partner Performance Analytics & History</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportReport}
                        disabled={orders.length === 0 || ordersLoading}
                        className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] hover:border-gray-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={14} strokeWidth={2.5} /> Export Report
                    </button>
                    <button
                        onClick={() => setIsAddingPayout(true)}
                        className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                    >
                        <Plus size={14} strokeWidth={2.5} /> Register Payout
                    </button>
                </div>
            </div>

            {/* Stats Cards - Unified with other pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Total Earnings',
                        value: `₹${calculateEarnings(influencer).toLocaleString()}`,
                        icon: TrendingUp,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50',
                        sub: `Based on ₹${(influencer.totalSales || 0).toLocaleString()} sales`
                    },
                    {
                        label: 'Amount Paid',
                        value: `₹${(influencer.totalPaid || 0).toLocaleString()}`,
                        icon: IndianRupee,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        sub: `${((influencer.totalPaid || 0) / calculateEarnings(influencer) * 100 || 0).toFixed(0)}% of total cleared`
                    },
                    {
                        label: 'Pending Dues',
                        value: `₹${(calculateEarnings(influencer) - (influencer.totalPaid || 0)).toLocaleString()}`,
                        icon: Calendar,
                        color: 'text-orange-600',
                        bg: 'bg-orange-50',
                        sub: 'Awaiting next payout cycle'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                        <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight">{stat.value}</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Payout Input Section (Only when adding) */}
            {isAddingPayout && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <IndianRupee size={24} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Register New Payout</h3>
                            <p className="text-[9px] font-bold text-emerald-600/60 uppercase">Deduct from pending balance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            autoFocus
                            type="number"
                            placeholder="Enter Amount"
                            value={payoutAmount}
                            onChange={e => setPayoutAmount(e.target.value)}
                            className="bg-white border border-emerald-200 rounded-xl px-5 py-3 text-sm font-black outline-none focus:border-emerald-400 text-[#1a1a1a] w-full md:w-64 shadow-sm"
                        />
                        <button
                            onClick={handleAddPayout}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setIsAddingPayout(false)}
                            className="p-3 bg-white border border-emerald-100 text-emerald-300 hover:text-red-400 rounded-xl transition-all"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table Area - Unified using AdminTable */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                            <Activity size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-[0.2em]">Usage History</h3>
                    </div>
                    <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                        Performance History
                    </div>
                </div>

                <div className="p-4">
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead>Customer</AdminTableHead>
                            <AdminTableHead>Order ID</AdminTableHead>
                            <AdminTableHead>Date</AdminTableHead>
                            <AdminTableHead>Value</AdminTableHead>
                            <AdminTableHead className="text-right">Commission</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {orders.map((record, idx) => (
                                <AdminTableRow key={idx}>
                                    <AdminTableCell>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{record.userName}</span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider cursor-pointer hover:underline">
                                            {record.orderId}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                            {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-1.5 font-black text-[#1a1a1a] text-xs">
                                            <IndianRupee size={12} strokeWidth={3} className="text-gray-300" />
                                            {record.amount.toLocaleString()}
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <div className="inline-flex items-center gap-1.5 font-black text-purple-600 text-[11px] bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 uppercase tracking-widest">
                                            <IndianRupee size={12} strokeWidth={3} />
                                            {record.commission.toLocaleString()}
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                        </AdminTableBody>
                    </AdminTable>
                    {orders.length === 0 && !ordersLoading && (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No usage history recorded yet</p>
                        </div>
                    )}
                    {ordersLoading && (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading orders...</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InfluencerDetailPage;
