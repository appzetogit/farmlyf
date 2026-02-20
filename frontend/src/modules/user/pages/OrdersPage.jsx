import React, { useEffect, useMemo, useState } from 'react';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { useOrders } from '../../../hooks/useOrders';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: orders = [] } = useOrders(user?.id); // useOrders hook
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;

    const totalPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ordersPerPage;
        const end = start + ordersPerPage;
        return orders.slice(start, end);
    }, [orders, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <Package size={80} className="text-gray-200 mb-6" />
                <h2 className="text-2xl font-bold text-footerBg mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
                <Link to="/catalog" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight">My Orders</h1>
                </div>

                <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
                    {paginatedOrders.map((order, index) => {
                        const firstItem = order.items?.[0];
                        const extraItems = Math.max((order.items?.length || 0) - 1, 0);
                        const orderId = order.id || order._id;

                        return (
                            <motion.div
                                key={order._id || order.id || index}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-3 md:p-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[9px] md:text-[11px] text-slate-400 tracking-wide">Order ID: {orderId}</span>
                                                    <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${order.status?.toLowerCase() === 'shipped' ? 'bg-indigo-50 text-indigo-500' : 'bg-green-50 text-green-500'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Clock size={10} className="shrink-0" />
                                                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] md:text-[10px] text-slate-300 uppercase font-black tracking-widest leading-none mb-1">Total</p>
                                                <p className="text-base md:text-2xl font-black text-footerBg leading-none">Rs. {order.amount}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                                            <div className="h-12 w-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                                                <img
                                                    src={firstItem?.image || 'https://via.placeholder.com/100?text=No+Image'}
                                                    alt={firstItem?.name || 'Product'}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-wider leading-none mb-1">Product</p>
                                                <p className="text-sm md:text-base font-black text-footerBg truncate">
                                                    {firstItem?.name || 'Product details unavailable'}
                                                </p>
                                                {extraItems > 0 && (
                                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">+{extraItems} more item{extraItems > 1 ? 's' : ''}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <Link
                                                to={`/order/${orderId}`}
                                                className="w-full md:w-fit md:ml-auto md:px-10 bg-slate-50 border border-slate-100 text-footerBg py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-footerBg hover:text-white"
                                            >
                                                View Details
                                                <ChevronRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="max-w-4xl mx-auto mt-6 md:mt-8 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-bold text-footerBg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-lg text-xs md:text-sm font-black transition-colors ${
                                        currentPage === page
                                            ? 'bg-footerBg text-white'
                                            : 'bg-white border border-slate-200 text-footerBg hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-bold text-footerBg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;

