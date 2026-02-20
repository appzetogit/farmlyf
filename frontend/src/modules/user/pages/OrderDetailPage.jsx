import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';
import {
    ArrowLeft, Package, MapPin, Phone, CreditCard,
    Truck, CheckCircle, Clock, Archive, RefreshCw, AlertCircle, ExternalLink, XCircle, Ban, FileText
} from 'lucide-react';
import OrderInvoice from '../components/OrderInvoice';
import { motion } from 'framer-motion';
import { useOrders, useReturns, useUpdateOrderStatus, useCancelOrder } from '../../../hooks/useOrders';
import { useProducts } from '../../../hooks/useProducts';

const API_URL = API_BASE_URL;

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, getAuthHeaders } = useAuth();

    // Hooks
    const { data: orders = [] } = useOrders(user?.id);
    const { data: returns = [] } = useReturns(user?.id);

    const { mutate: updateStatus } = useUpdateOrderStatus();
    const { mutate: cancelOrderMutation, isPending: isCancelling } = useCancelOrder();
    const { data: products = [] } = useProducts();

    const [order, setOrder] = useState(null);
    const [availableItemsCount, setAvailableItemsCount] = useState(0);
    const [liveTracking, setLiveTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        if (orders.length > 0 && orderId) {
            const foundOrder = orders.find(o => o.id === orderId);
            if (foundOrder) {
                setOrder(foundOrder);

                // Calculate returns
                const orderReturns = returns.filter(r => r.orderId === orderId && r.status !== 'Rejected');
                const returnedPackIds = new Set();
                orderReturns.forEach(ret => {
                    ret.items.forEach(item => returnedPackIds.add(item.packId));
                });

                const available = foundOrder.items.filter(item => !returnedPackIds.has(item.packId));
                setAvailableItemsCount(available.length);
            }
        }
    }, [orders, returns, orderId]);

    const getProductImage = (item) => {
        if (item.image) return item.image;

        // Fallback: Find in products
        // Try by ID (variant ID)
        let product = products.find(p => p.variants?.some(v => v.id === item.id));
        if (product) return product.image;

        // Try by productId if available
        if (item.productId) {
            product = products.find(p => p.id === item.productId);
            if (product) return product.image;
        }

        // Try matching by name (fuzzy)
        product = products.find(p => p.name === item.name);
        if (product) return product.image;

        return 'https://via.placeholder.com/150?text=No+Image';
    };

    // Fetch live tracking from Shiprocket
    useEffect(() => {
        const fetchLiveTracking = async () => {
            if (!order?.awbCode) return; // Only fetch if AWB is assigned

            setTrackingLoading(true);
            try {
                const response = await fetch(`${API_URL}/orders/${order.id}/tracking`, {
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    setLiveTracking(data);
                }
            } catch (error) {
                console.error('Failed to fetch live tracking:', error);
            } finally {
                setTrackingLoading(false);
            }
        };

        fetchLiveTracking();
    }, [order?.awbCode, order?.id]);

    const updateOrderStatus = (uid, oid, status) => {
        updateStatus({ userId: uid, orderId: oid, status });
        // For simulation, we might need to manually update local state or force refresh if mutation doesn't persist to where fetch reads
        // Assuming the previous implementation had some way to persist. 
        // If not, this is just a visual toast in this refactor step unless we fully implement LS persistence in useOrders.
        // For now, we keep it as a mutation call.
        if (order) setOrder({ ...order, deliveryStatus: status });
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading order details...</p>
            </div>
        );
    }

    // Check if eligible for return (delivered and within 7 days)
    const isDelivered = order.deliveryStatus === 'Delivered';
    const isWithinReturnWindow = () => {
        if (!order.deliveredDate) return false;
        const deliveryDate = new Date(order.deliveredDate);
        const now = new Date();
        const diffDays = Math.ceil((now - deliveryDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const canReturn = isDelivered && isWithinReturnWindow() && availableItemsCount > 0;

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'Processing', 'Received', 'Processed'];
    const canCancel = cancellableStatuses.includes(order.status) && order.status !== 'Cancelled';
    const isCancelled = order.status === 'Cancelled';

    // Handle cancel order
    const handleCancelOrder = () => {
        cancelOrderMutation(
            { orderId: order.id, reason: cancelReason || 'Customer requested cancellation' },
            {
                onSuccess: () => {
                    setShowCancelConfirm(false);
                    setCancelReason('');
                    navigate('/orders');
                }
            }
        );
    };

    // Get refund status display
    const getRefundStatusBadge = () => {
        if (!isCancelled) return null;

        switch (order.refundStatus) {
            case 'pending':
                return (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <Clock size={14} className="text-amber-600" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Refund Processing</span>
                    </div>
                );
            case 'processed':
                return (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Refund Completed</span>
                    </div>
                );
            case 'failed':
                return (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle size={14} className="text-red-600" />
                        <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Refund Failed - Contact Support</span>
                    </div>
                );
            case 'not_applicable':
            default:
                if (order.paymentMethod === 'cod') {
                    return (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <CreditCard size={14} className="text-gray-500" />
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">COD - No Refund Required</span>
                        </div>
                    );
                }
                return null;
        }
    };

    // Timeline steps for UI
    const steps = [
        { status: 'Processing', label: 'Order Placed', icon: Archive },
        { status: 'Packed', label: 'Packed', icon: Package },
        { status: 'Shipped', label: 'Shipped', icon: Truck },
        { status: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
        { status: 'Delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.deliveryStatus);
    const trackingActivities = liveTracking?.tracking?.tracking_data?.shipment_track_activities || [];
    const latestTrackingActivity = trackingActivities[0];

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={() => navigate('/orders')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                            <ArrowLeft size={20} md:size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">Order Details</h1>
                            <p className="text-[10px] md:text-sm font-mono text-slate-400 mt-1">#{order.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInvoice(true)}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <FileText size={16} />
                        View Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Main Content (Timeline & Items) */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-4">

                        {/* Delivery Track & Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center text-green-600">
                                        <Truck size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                                            {order.awbCode ? 'AWB / Tracking ID' : 'Order Status'}
                                        </p>
                                        <p className="text-sm font-bold text-footerBg">
                                            {order.awbCode || order.status || 'Processing'}
                                        </p>
                                        {order.courierName && (
                                            <p className="text-[10px] text-gray-400">via {order.courierName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    {order.awbCode && (
                                        <a
                                            href={`https://www.shiprocket.co/tracking/${order.awbCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline mb-1"
                                        >
                                            Track on Courier <ExternalLink size={10} />
                                        </a>
                                    )}
                                    {order.estimatedDelivery && (
                                        <>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Estimated Delivery</p>
                                            <p className="text-xs font-bold text-footerBg">
                                                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 md:p-8">
                                {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
                                <div className="flex flex-col md:flex-row justify-between gap-4 relative">
                                    {steps.map((step, index) => {
                                        const isActive = index <= currentStepIndex;
                                        const isCompleted = index < currentStepIndex || (index === currentStepIndex && order.deliveryStatus === 'Delivered');
                                        const isCurrent = index === currentStepIndex;
                                        const Icon = step.icon;

                                        return (
                                            <div key={index} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative min-h-[64px] md:min-h-0">
                                                {/* Vertical Connector Line (Mobile Only) */}
                                                {index < steps.length - 1 && (
                                                    <div className="md:hidden absolute top-[40px] left-[20px] w-0.5 h-[calc(100%-16px)] bg-gray-100 z-0">
                                                        <div className={`w-full bg-green-500 transition-all duration-500 ${index < currentStepIndex ? 'h-full' : 'h-0'}`} />
                                                    </div>
                                                )}

                                                {/* Connector Lines (Desktop Only) */}
                                                {index < steps.length - 1 && (
                                                    <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-gray-100">
                                                        <div className={`h-full bg-green-500 transition-all duration-500 ${index < currentStepIndex ? 'w-full' : 'w-0'}`} />
                                                    </div>
                                                )}

                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all relative z-10 shrink-0
                                                    ${isCompleted ? 'bg-green-50 border-green-100 text-green-600' : 'bg-white'}
                                                    ${isCurrent && !isCompleted ? 'border-primary text-primary bg-primary/5 shadow-lg shadow-primary/10' : ''}
                                                    ${!isCompleted && !isCurrent ? 'border-gray-50 text-gray-300' : ''}
                                                `}>
                                                    <Icon size={isCurrent ? 20 : 18} strokeWidth={isCurrent ? 3 : 2} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest leading-none md:text-center
                                                        ${isActive ? 'text-footerBg' : 'text-slate-300'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-[9px] font-bold text-green-500 mt-1 md:text-center">Live Update</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Live Tracking Activities from Shiprocket */}
                            {(liveTracking?.tracking || trackingLoading) && (
                                <div className="p-5 md:p-8 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> Live Tracking Activity
                                        </h3>
                                        {trackingLoading && (
                                            <RefreshCw size={12} className="animate-spin text-gray-400" />
                                        )}
                                    </div>
                                    {latestTrackingActivity && (
                                        <div className="flex gap-3 items-start">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-footerBg">{latestTrackingActivity.activity}</p>
                                                <p className="text-[9px] text-gray-300 mt-0.5">
                                                    {new Date(latestTrackingActivity.date).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {!latestTrackingActivity && !trackingLoading && (
                                        <p className="text-xs text-gray-400">Tracking activities will appear once shipment is picked up.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Product Items List (Compact) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items in Package</h3>
                                <div className="text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-green-100 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {order.items.length} Units
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item, i) => (
                                    <div key={i} className="p-4 flex gap-4 items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                            <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] md:text-sm font-black text-footerBg truncate mb-0.5">{item.name}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 tracking-tight">
                                                Qty: {item.qty} <span className="mx-1 opacity-20">×</span> ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[13px] md:text-sm font-black text-footerBg">₹{item.price * item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Detailed Info */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-4">

                        {/* Address & Payment Merged Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Delivered To</p>
                                        <p className="text-sm font-black text-footerBg">{order.shippingAddress.fullName}</p>
                                        <p className="text-[11px] font-medium text-slate-400 leading-tight pr-4 mt-0.5">
                                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.pincode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Payment Method</p>
                                        <p className="text-xs font-black text-footerBg uppercase tracking-tighter">
                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Secure Online Payment'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-50">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pr-4 leading-none">Order Total</p>
                                    <p className="text-2xl font-black text-footerBg leading-none">₹{order.amount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Status Display */}
                        {isCancelled && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-xl">
                                    <Ban size={16} className="text-red-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Order Cancelled</p>
                                        {order.cancelledAt && (
                                            <p className="text-[9px] text-red-500 mt-0.5">
                                                {new Date(order.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {getRefundStatusBadge()}
                                {order.refundAmount && (
                                    <p className="text-xs text-gray-500 text-center">Refund amount: ₹{order.refundAmount}</p>
                                )}
                            </div>
                        )}

                        {/* Cancel Order Action */}
                        {canCancel && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                disabled={isCancelling}
                                className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-red-100 disabled:opacity-50"
                            >
                                <XCircle size={14} strokeWidth={3} />
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}

                        {/* Return Action (High Contrast) */}
                        {isDelivered && canReturn && (
                            <button
                                onClick={() => navigate(`/request-return/${order.id}`)}
                                className="w-full bg-footerBg text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-primary shadow-xl shadow-footerBg/10"
                            >
                                <RefreshCw size={14} strokeWidth={3} />
                                Return / Exchange
                            </button>
                        )}

                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-footerBg">Cancel Order?</h3>
                                <p className="text-xs text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tell us why you're cancelling..."
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        {order.paymentMethod !== 'cod' && order.paymentStatus === 'paid' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                                <p className="text-xs font-bold text-green-700 flex items-center gap-2">
                                    <CheckCircle size={14} />
                                    Refund of ₹{order.amount} will be initiated
                                </p>
                                <p className="text-[10px] text-green-600 mt-1">Typically processed within 5-7 business days</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCancelling ? (
                                    <><RefreshCw size={14} className="animate-spin" /> Cancelling...</>
                                ) : (
                                    'Yes, Cancel'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Invoice Modal */}
            <OrderInvoice
                order={order}
                isOpen={showInvoice}
                onClose={() => setShowInvoice(false)}
            />
        </div>
    );
};

export default OrderDetailPage;
