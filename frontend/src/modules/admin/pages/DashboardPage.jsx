import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    Clock,
    Banknote,
    Box,
    FileWarning,
    History,
    TrendingUp,
    AlertTriangle,
    Layers,
    Boxes,
    CheckCircle2,
    Truck,
    MapPin,
    XCircle,
    TicketPercent,
    Share2,
    MessageSquare,
    ShieldCheck,
    Plus,
    List,
    Bell,
    Settings
} from 'lucide-react';
import { useAllOrders, useAllReturns } from '../../../hooks/useOrders';
import { useProducts, useCategories, useSubCategories } from '../../../hooks/useProducts';
import { useUsers } from '../../../hooks/useUsers';
import { useCoupons } from '../../../hooks/useCoupons';
import { useReferrals } from '../../../hooks/useReferrals';
import { useUserReviews, useAdminReviews } from '../../../hooks/useReviews';

const DashboardPage = () => {
    const navigate = useNavigate();

    // Data Fetching
    const { data: orders = [] } = useAllOrders();
    const { data: returns = [] } = useAllReturns();
    const { data: products = [] } = useProducts();
    const { data: userData } = useUsers();
    const totalUsersCount = userData?.total || 0;
    const { data: categories = [] } = useCategories();
    const { data: subcategories = [] } = useSubCategories();
    const { data: coupons = [] } = useCoupons();
    const { data: referrals = [] } = useReferrals();
    const { data: userReviews = [] } = useUserReviews();
    const { data: adminReviews = [] } = useAdminReviews();

    // Calculate Stats
    const stats = useMemo(() => {
        // Business Overview
        const totalRevenue = orders
            .filter(order => order.status !== 'Cancelled')
            .reduce((acc, order) => acc + (order.amount || 0), 0);
        const combos = products.filter(p =>
            p.category === 'combos-packs' ||
            p.subcategory?.toLowerCase().includes('pack') ||
            p.name?.toLowerCase().includes('combo') ||
            p.type === 'combo'
        );

        // Order Breakdown
        const pendingOrders = orders.filter(o => o.status === 'Processing').length;
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
        const outForDelivery = orders.filter(o => o.status === 'OutForDelivery').length;
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
        const processingOrders = orders.filter(o => ['Received', 'Processed'].includes(o.status)).length;

        // Inventory
        const outOfStock = products.filter(p => !p.variants || p.variants.every(v => v.stock === 0)).length;
        const lowStock = products.filter(p => p.variants && p.variants.some(v => v.stock > 0 && v.stock < 15)).length;

        // Returns
        const pendingReturns = returns.filter(r => r.status === 'Pending').length;
        const activeReplacements = returns.filter(r => r.type === 'replacement' && r.status !== 'Completed').length;
        const completedReturns = returns.filter(r => r.status === 'Completed').length;

        return [
            // Section 1: Business Overview
            { label: 'Total Users', value: totalUsersCount, icon: Users, color: 'text-blue-500', link: '/admin/users' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', link: '/admin/orders' },
            { label: 'Total Categories', value: categories.length, icon: Layers, color: 'text-indigo-500', link: '/admin/categories' },
            { label: 'Total Subcategories', value: subcategories.length, icon: Layers, color: 'text-violet-500', link: '/admin/sub-categories' },
            { label: 'Total Products', value: products.length, icon: Box, color: 'text-amber-500', link: '/admin/products' },
            { label: 'Total Combos', value: combos.length, icon: Boxes, color: 'text-orange-500', link: '/admin/combo-products' },

            // Section 2: Order Analytics
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-slate-500', link: '/admin/orders' },
            { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-amber-600', link: '/admin/orders?status=Processing', badge: 'Action Required' },
            { label: 'Delivered Orders', value: deliveredOrders, icon: CheckCircle2, color: 'text-emerald-600', link: '/admin/orders?status=Delivered' },
            { label: 'Shipped Orders', value: shippedOrders, icon: Truck, color: 'text-blue-600', link: '/admin/orders?status=Shipped' },
            { label: 'Out for Delivery', value: outForDelivery, icon: MapPin, color: 'text-purple-600', link: '/admin/orders?status=OutForDelivery' },
            { label: 'Cancelled Orders', value: cancelledOrders, icon: XCircle, color: 'text-red-500', link: '/admin/orders?status=Cancelled' },
            { label: 'In-Process', value: processingOrders, icon: TrendingUp, color: 'text-teal-500', link: '/admin/orders' },

            // Section 3: Inventory
            { label: 'Sold Out', value: outOfStock, icon: FileWarning, color: 'text-red-600', link: '/admin/inventory/alerts', badge: outOfStock > 0 ? 'Urgent' : null },
            { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'text-amber-500', link: '/admin/inventory/alerts' },

            // Section 4: Returns
            { label: 'Pending Returns', value: pendingReturns, icon: History, color: 'text-orange-500', link: '/admin/returns', badge: pendingReturns > 0 ? 'New' : null },
            { label: 'Active Replacements', value: activeReplacements, icon: History, color: 'text-blue-500', link: '/admin/replacements' },
            { label: 'Completed Returns', value: completedReturns, icon: CheckCircle2, color: 'text-emerald-500', link: '/admin/returns' },

            // Section 5: Engagement
            { label: 'Active Coupons', value: coupons.filter(c => c.active).length, icon: TicketPercent, color: 'text-pink-500', link: '/admin/coupons' },
            { label: 'Total Referrals', value: referrals.length, icon: Share2, color: 'text-cyan-500', link: '/admin/referrals' },
            { label: 'User Reviews', value: userReviews.length, icon: MessageSquare, color: 'text-blue-400', link: '/admin/reviews' },
            { label: 'Admin Reviews', value: adminReviews.length, icon: ShieldCheck, color: 'text-slate-600', link: '/admin/reviews' },
        ];
    }, [orders, products, returns, userData, categories, subcategories, coupons, referrals, userReviews, adminReviews]);

    const quickActions = [
        { label: 'Add Product', icon: Plus, link: '/admin/products/add', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Create Coupon', icon: TicketPercent, link: '/admin/coupons/add', color: 'bg-pink-50 text-pink-600' },
        { label: 'Pending Orders', icon: Clock, link: '/admin/orders?status=Processing', color: 'bg-amber-50 text-amber-600' },
        { label: 'Check Returns', icon: History, link: '/admin/returns', color: 'bg-orange-50 text-orange-600' },
        { label: 'Stock Alerts', icon: AlertTriangle, link: '/admin/inventory/alerts', color: 'bg-red-50 text-red-600' },
        { label: 'Manage Banners', icon: Boxes, link: '/admin/banners', color: 'bg-blue-50 text-blue-600' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Admin Dashboard</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Platform Analytics & Quick Controls</p>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-left">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Quick Management</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            to={action.link}
                            className={`${action.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-all border border-transparent hover:border-current/10`}
                        >
                            <action.icon size={20} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Stats Grid - Compact 5 column */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {stats.map((stat, idx) => (
                    <Link to={stat.link} key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all group relative block overflow-hidden hover:shadow-md">
                        <div className="flex items-start justify-between relative z-10 h-full">
                            <div className="flex flex-col justify-between h-full pr-2">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                    <h3 className="text-lg font-black text-footerBg leading-none">{stat.value}</h3>
                                </div>
                                {stat.badge && (
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-2 ${stat.badge === 'Urgent' || stat.badge === 'Action Required' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        } uppercase tracking-tight`}>
                                        {stat.badge}
                                    </span>
                                )}
                            </div>
                            <div className={`p-2.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors shrink-0`}>
                                <stat.icon size={20} className={stat.color} strokeWidth={2} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Existing Row: Recent Orders & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Recent Orders Widget */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-full">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-black text-footerBg uppercase tracking-tight">Recent Orders</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Queue of latest customer orders</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs italic">No orders found yet</td>
                                        </tr>
                                    ) : (
                                        orders.slice().sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 5).map((order) => (
                                            <tr key={order._id || order.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-footerBg text-xs">#{(order._id || order.id).slice(-8)}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{(new Date(order.createdAt || order.date)).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-footerBg text-xs">{order.userName || order.shippingAddress?.fullName || 'Guest User'}</p>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <p className="font-black text-footerBg text-xs">₹{order.amount}</p>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Stock Alerts Sidebar */}
                <div className="lg:col-span-4 bg-footerBg p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-footerBg/20 text-white flex flex-col relative overflow-hidden text-left h-fit">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertTriangle size={20} className="text-red-400" strokeWidth={2.5} />
                        <h4 className="text-lg font-black uppercase tracking-tight">Stock Alerts</h4>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {products.filter(p => !p.variants || p.variants.some(v => (v.stock || 0) < 15)).slice(0, 4).map((item, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight line-clamp-1 w-2/3">{item.name}</p>
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter shrink-0">Low</span>
                                </div>
                                {item.variants ? item.variants.filter(v => (v.stock || 0) < 15).map((v, vIdx) => (
                                    <div key={vIdx} className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        <span>Size: {v.weight}</span>
                                        <span className="text-white bg-red-500/20 px-1.5 py-0.5 rounded">{(v.stock || 0)} left</span>
                                    </div>
                                )) : (
                                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        <span>Default</span>
                                        <span className="text-white bg-red-500/20 px-1.5 py-0.5 rounded">Low</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {products.filter(p => !p.variants || p.variants.some(v => (v.stock || 0) < 15)).length === 0 && (
                            <div className="text-center py-20 text-white/20 font-black uppercase tracking-[0.2em] text-[10px]">
                                All items in stock
                            </div>
                        )}
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
