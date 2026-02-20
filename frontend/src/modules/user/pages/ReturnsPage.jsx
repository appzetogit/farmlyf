
import React from 'react';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { useReturns } from '../../../hooks/useOrders'; // Assuming useReturns is exported from useOrders or useReturns file
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ReturnsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: returns = [] } = useReturns(user?.id);

    if (returns.length === 0) {
        return (
            <div className="bg-[#fcfcfc] min-h-screen py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <RefreshCw size={32} />
                </div>
                <h2 className="text-2xl font-black text-footerBg mb-2">No Returns Yet</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    You haven't placed any return or replacement requests yet.
                </p>
                <Link to="/orders" className="bg-footerBg text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg">
                    Go to My Orders
                </Link>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Picked Up': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Quality Check': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'Dispatched': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Refunded': return 'bg-green-100 text-green-700 border-green-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate('/orders')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">Returns</h1>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Manage Your Requests</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                    {returns.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="p-3 md:p-6">
                                <div className="flex flex-col gap-3">
                                    {/* Top Row: ID & Request Type */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-footerBg text-sm md:text-lg tracking-tight">{request.id}</span>
                                                <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock size={10} className="shrink-0" />
                                                {new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest leading-none mb-1">Type</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${request.type === 'replace' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {request.type === 'replace' ? 'Exchange' : 'Refund'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Row: View Status Button */}
                                    <div className="pt-1 flex flex-col gap-3">
                                        <button
                                            onClick={() => navigate(`/${request.type === 'replace' ? 'replacement' : 'return'}/${request.id}`)}
                                            className="w-full md:w-fit md:ml-auto md:px-10 bg-slate-50 border border-slate-100 text-footerBg py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 group hover:bg-footerBg hover:text-white"
                                        >
                                            View Status
                                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        {request.status === 'Pending' && (
                                            <div className="flex gap-2 items-center text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-tight justify-center md:justify-end">
                                                <AlertCircle size={10} className="text-blue-400 shrink-0" />
                                                Reviewing Your request shortly.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReturnsPage;
