import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Package, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAllOrders, useAllReturns } from '../../../hooks/useOrders';
import { useProducts } from '../../../hooks/useProducts';
import { Link } from 'react-router-dom';

const AdminHeader = () => {
    const { user } = useAuth();
    // Using All Data Hooks for Admin
    const { data: orders = [] } = useAllOrders(); 
    const { data: returns = [] } = useAllReturns();
    const { data: products = [] } = useProducts();
    
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const prevCountRef = useRef(0);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Aggregate Notifications
    const allNotifications = [];

    // 1. New & Cancelled Orders
    orders.forEach(order => {
        if (order.status === 'Processing') {
            allNotifications.push({
                type: 'order',
                id: order.id || order._id,
                title: 'New Order Received',
                message: `Order #${order.displayId || order.id || order._id} is waiting for processing.`,
                time: order.date || order.createdAt,
                link: `/admin/orders/${order.id || order._id}`,
                color: 'blue'
            });
        } else if (order.status === 'Cancelled') {
             allNotifications.push({
                type: 'cancel',
                id: order.id || order._id,
                title: 'Order Cancelled',
                message: `Order #${order.displayId || order.id || order._id} was cancelled by user.`,
                time: order.updatedAt || order.date,
                link: `/admin/orders/${order.id || order._id}`,
                color: 'red'
            });
        }
    });

    // 2. Pending Returns
    returns.forEach(ret => {
        if (ret.status === 'Pending') {
            allNotifications.push({
                type: 'return',
                id: ret.id || ret._id,
                title: 'New Return Request',
                message: `Return #${ret.id || ret._id} needs approval.`,
                time: ret.requestDate || ret.createdAt,
                link: `/admin/returns`,
                color: 'orange'
            });
        }
    });

    // 3. Low Stock Alerts
    products.forEach(p => {
        const stock = p.stock?.quantity || 0;
        const threshold = p.lowStockThreshold || 10;
        if (stock <= threshold) {
            allNotifications.push({
                type: 'stock',
                id: p._id,
                title: 'Low Stock Alert',
                message: `${p.name} is running low (#${stock} left).`,
                time: new Date(), // Real-time alert
                link: `/admin/inventory/alerts`,
                color: 'red'
            });
        }
    });

    // Sort by newest
    allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    const unreadCount = allNotifications.length;

    // Keep ref in sync for future notification behaviors without autoplay audio.
    useEffect(() => {
        prevCountRef.current = unreadCount;
    }, [unreadCount]);

    return (
        <header className="h-20 bg-footerBg border-b border-white/5 flex items-center justify-end sticky top-0 z-40 text-left">
            <div className="h-full bg-white/5 px-8 flex items-center gap-6 border-l border-white/5" ref={dropdownRef}>
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 bg-white/5 text-gray-400 rounded-xl hover:text-white border border-white/10 shadow-sm transition-all focus:ring-2 focus:ring-primary/10 ${showNotifications ? 'text-white bg-white/10' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-footerBg shadow-sm animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alerts Center</h3>
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">{unreadCount} Active</span>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {allNotifications.length > 0 ? (
                                    allNotifications.map((notif, idx) => {
                                        const getColorClasses = () => {
                                            if (notif.color === 'blue') return 'bg-blue-500/10 text-blue-400';
                                            if (notif.color === 'red') return 'bg-red-500/10 text-red-400';
                                            if (notif.color === 'orange') return 'bg-orange-500/10 text-orange-400';
                                            return 'bg-gray-500/10 text-gray-400';
                                        };

                                        const getIcon = () => {
                                            if (notif.type === 'order') return <Package size={16} />;
                                            if (notif.type === 'cancel') return <XCircle size={16} />;
                                            if (notif.type === 'return') return <RotateCcw size={16} />;
                                            if (notif.type === 'stock') return <AlertTriangle size={16} />;
                                            return <Bell size={16} />;
                                        };

                                        return (
                                            <Link 
                                                key={idx} 
                                                to={notif.link} 
                                                className="block p-4 border-b border-white/5 hover:bg-white/5 transition-all group"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${getColorClasses()}`}>
                                                        {getIcon()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">{notif.title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                        <p className="text-[9px] font-bold text-gray-600 mt-2 uppercase tracking-widest">{new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.time).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <Bell size={20} className="text-gray-600" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No Alerts Found</p>
                                    </div>
                                )}
                            </div>
                            
                            {allNotifications.length > 0 && (
                                <div className="p-3 border-t border-white/10 bg-white/5 text-center">
                                    <Link to="/admin/orders" className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors" onClick={() => setShowNotifications(false)}>View Operational Log</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-white/10 mx-1" />

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right">
                        <p className="text-sm font-black text-white leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">Staff Account</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
