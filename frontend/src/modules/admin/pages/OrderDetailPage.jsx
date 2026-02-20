import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    ArrowLeft,
    Printer,
    Truck,
    Package,
    Clock,
    CheckCircle2,
    MapPin,
    CreditCard,
    Phone,
    Mail,
    Building2,
    FileText,
    Check,
    X,
    Send,
    User,
    ChevronRight,
    XCircle,
    Ban,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import InvoiceGenerator from '../components/InvoiceGenerator';

const API_URL = API_BASE_URL;

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch single order
    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const allOrders = await res.json();
            return allOrders.find(o => o._id === id || o.id === id);
        }
    });

    const [status, setStatus] = useState(null);
    const [liveTracking, setLiveTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const queryClient = useQueryClient();

    // Sync status when order loads
    useEffect(() => {
        if (order) setStatus(order.status);
    }, [order]);

    // Fetch live tracking from Shiprocket
    useEffect(() => {
        const fetchLiveTracking = async () => {
            if (!order?.awbCode) return;
            setTrackingLoading(true);
            try {
                const res = await fetch(`${API_URL}/orders/${order._id || order.id}/tracking`);
                if (res.ok) {
                    const data = await res.json();
                    setLiveTracking(data);
                }
            } catch (error) {
                console.error('Failed to fetch live tracking:', error);
            } finally {
                setTrackingLoading(false);
            }
        };
        fetchLiveTracking();
    }, [order?.awbCode, order?._id, order?.id]);

    // Fetch user details to get accountType and gstNumber
    const { data: user } = useQuery({
        queryKey: ['order-user', order?.userId],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users/${order.userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
                }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!order?.userId
    });

    if (!order && !isLoading) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold text-gray-400">Order Not Found</h2>
                <button onClick={() => navigate('/admin/orders')} className="mt-4 text-primary font-bold hover:underline">
                    Back to Orders
                </button>
            </div>
        );
    }

    if (isLoading) return <div className="p-20 text-center">Loading Order...</div>;

    const handleUpdateStatus = async (newStatus) => {
        try {
            const res = await fetch(`${API_URL}/orders/${order._id || order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setStatus(newStatus);
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Network error updating status');
        }
    };

    // Use real user data if available, otherwise fallback to order fields
    const isBusiness = user?.accountType === 'Business' || order.accountType === 'Business';
    const gstNumber = user?.gstNumber || order.gstNumber || null;
    const companyName = isBusiness ? (user?.name || order.userName || order.shippingAddress?.fullName) : null;

    const timelineSteps = [
        { label: 'Order Placed', status: 'Processing', completed: true, date: new Date(order.date).toLocaleDateString() },
        { label: 'Payment Confirmed', status: 'Processing', completed: true, date: new Date(order.date).toLocaleDateString() },
        { label: 'Admin Approved', status: 'Processing', completed: status !== 'Cancelled' && status !== 'Pending', date: 'Pending' },
        { label: 'Shipment Created', status: 'Shipped', completed: status === 'Shipped' || status === 'Delivered', date: status === 'Shipped' ? new Date().toLocaleDateString() : 'Pending' },
        { label: 'Out for Delivery', status: 'OutForDelivery', completed: status === 'Delivered', date: 'Pending' },
        { label: 'Delivered', status: 'Delivered', completed: status === 'Delivered', date: status === 'Delivered' ? new Date().toLocaleDateString() : 'Pending' }
    ];

    const getStatusColor = (st) => {
        switch (st) {
            case 'Delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
            case 'ReturnInitiated': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Returned': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    // Cancel order handler for admin

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order? This will notify Shiprocket and initiate a refund if applicable.')) {
            return;
        }

        setIsCancelling(true);
        try {
            const res = await fetch(`${API_URL}/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Cancelled by admin' })
            });

            if (res.ok) {
                const data = await res.json();
                setStatus('Cancelled');
                queryClient.invalidateQueries({ queryKey: ['order', id] });
                queryClient.invalidateQueries({ queryKey: ['all-orders'] });
                const refundMsg = data.refund?.initiated 
                    ? ` Refund of ₹${data.refund.amount} initiated.` 
                    : '';
                toast.success(`Order cancelled successfully!${refundMsg}`);
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to cancel order');
            }
        } catch (error) {
            toast.error('Network error cancelling order');
        } finally {
            setIsCancelling(false);
        }
    };

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'Processing', 'Received', 'Processed'];
    const canCancel = cancellableStatuses.includes(status) && status !== 'Cancelled';
    const isCancelledOrder = status === 'Cancelled';

    const dummyItems = [
        {
            name: 'Premium California Almonds',
            weight: '500g',
            image: 'https://placehold.co/400x400/png?text=Almonds',
            id: 'PRO-ALM-500',
            quantity: 2,
            price: 850
        },
        {
            name: 'Organic Cashew Nuts (W320)',
            weight: '1kg',
            image: 'https://placehold.co/400x400/png?text=Cashews',
            id: 'PRO-CAS-1KG',
            quantity: 1,
            price: 1200
        },
        {
            name: 'Medjool Dates (Imported)',
            weight: '250g',
            image: 'https://placehold.co/400x400/png?text=Dates',
            id: 'PRO-DAT-250',
            quantity: 3,
            price: 450
        }
    ];

    const itemsToDisplay = order.items && order.items.length > 0 ? order.items : dummyItems;

    // Calculate derived totals from displayed items
    const derivedSubtotal = itemsToDisplay.reduce((acc, item) => {
        const q = item.quantity || item.qty || 1;
        return acc + (item.price * q);
    }, 0);
    const derivedDiscount = order.discount || 0;
    const derivedShipping = order.deliveryCharges || 0;
    const derivedTotal = derivedSubtotal - derivedDiscount + derivedShipping;

    return (
        <div className="space-y-6 pb-20 text-left font-['Inter']">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center gap-2 text-gray-500 hover:text-footerBg font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Orders
                </button>
                <div className="flex gap-2">
                    <InvoiceGenerator 
                        order={order} 
                        customTrigger={
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-footerBg hover:text-footerBg transition-all shadow-sm">
                                <Printer size={14} /> Print Invoice
                            </button>
                        }
                    />
                </div>
            </div>

            {/* 1. Order Summary (Top Card) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-lg font-black text-footerBg select-all">#{order.id}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold text-footerBg">
                        {new Date(order.date).toLocaleDateString()}
                        <span className="block text-xs font-medium text-gray-400">{new Date(order.date).toLocaleTimeString()}</span>
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
                        {status}
                    </span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Mode</p>
                    <p className={`text-sm font-black uppercase ${order.paymentMethod === 'cod' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Order Value</p>
                    <p className="text-xl font-black text-footerBg">₹{derivedTotal.toLocaleString()}</p>
                </div>
            </div>

            {/* Cancellation Info Card (show when cancelled) */}
            {isCancelledOrder && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <Ban size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-red-800">Order Cancelled</h3>
                            {order.cancelledAt && (
                                <p className="text-xs text-red-600">
                                    Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {order.cancellationReason && (
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Reason</p>
                            <p className="text-sm text-red-700">{order.cancellationReason}</p>
                        </div>
                    )}

                    {/* Refund Status */}
                    <div className="border-t border-red-200 pt-4">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Refund Status</p>
                        {order.refundStatus === 'pending' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                <Clock size={14} className="text-amber-600" />
                                <span className="text-xs font-bold text-amber-700">Processing</span>
                                {order.refundAmount && <span className="ml-auto text-sm font-black text-amber-700">₹{order.refundAmount}</span>}
                            </div>
                        )}
                        {order.refundStatus === 'processed' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                <CheckCircle2 size={14} className="text-green-600" />
                                <span className="text-xs font-bold text-green-700">Completed</span>
                                {order.refundAmount && <span className="ml-auto text-sm font-black text-green-700">₹{order.refundAmount}</span>}
                            </div>
                        )}
                        {order.refundStatus === 'failed' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-300 rounded-xl">
                                <AlertCircle size={14} className="text-red-600" />
                                <span className="text-xs font-bold text-red-700">Failed - Manual Action Required</span>
                            </div>
                        )}
                        {order.refundStatus === 'not_applicable' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl">
                                <CreditCard size={14} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-600">No Refund Required (COD)</span>
                            </div>
                        )}
                        {order.refundId && (
                            <p className="text-[10px] text-gray-400 mt-2 font-mono">Refund ID: {order.refundId}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items, Price, Notifications */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 4. Order Items Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Package size={16} /> Order Items ({itemsToDisplay.length})
                            </h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <th className="p-4">Item Details</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4 text-center">Qty</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {itemsToDisplay.map((item, idx) => {
                                    const qty = item.quantity || item.qty || 1;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 p-1 shrink-0">
                                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-footerBg">{item.name}</p>
                                                        <p className="text-[10px] font-medium text-gray-500">{item.weight}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-xs text-footerBg uppercase">SKU-{item.id?.slice(-4).toUpperCase()}</span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-gray-600">
                                                {qty}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                                                    {qty} x ₹{item.price}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-xs font-black text-footerBg">
                                                ₹{(item.price * qty).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 5. Price Breakup */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={16} /> Billing Summary
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between text-gray-500">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-bold text-footerBg">₹{derivedSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span className="font-medium">Discount (Coupon)</span>
                                <span className="font-bold">-₹{derivedDiscount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span className="font-medium">GST (18% Included)</span>
                                <span className="font-bold text-footerBg">₹{Math.round(derivedSubtotal * 0.18).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span className="font-medium">Shipping Charges</span>
                                <span className="font-bold text-footerBg">
                                    {(derivedShipping === 0) ? <span className="text-emerald-600">Free</span> : `₹${derivedShipping}`}
                                </span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                                <span className="font-black text-footerBg uppercase tracking-tight">Final Payable Amount</span>
                                <span className="text-xl font-black text-footerBg">₹{derivedTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. Coupon Info (Conditional) */}
                    {(derivedDiscount > 0 || order.appliedCoupon || order.coupon || order.couponCode) && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Applied Code</p>
                                    <p className="text-sm font-black text-purple-900">
                                        {order.appliedCoupon || order.coupon || order.couponCode || 'UNKNOWN COUPON'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-purple-600 bg-white px-2 py-1 rounded shadow-sm uppercase">Coupon Saved</p>
                                <p className="text-lg font-black text-purple-600">₹{derivedDiscount.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Customer, Timeline, Actions */}
                <div className="space-y-6">

                    {/* 8. Admin Actions (For New Orders) */}
                    {status === 'Processing' && (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Admin Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleUpdateStatus('Shipped')} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                                    <Check size={16} /> Approve
                                </button>
                                <button onClick={() => handleUpdateStatus('Rejected')} className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all">
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cancel Order Button (for admin) */}
                    {canCancel && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                            {isCancelling ? (
                                <><RefreshCw size={14} className="animate-spin" /> Cancelling...</>
                            ) : (
                                <><XCircle size={16} /> Cancel Order</>
                            )}
                        </button>
                    )}

                    {/* 2. Customer & Delivery Details */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                        {/* Section A: Ordered By (Account Info) */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={14} /> Ordered By
                            </h3>
                            <div
                                onClick={() => {
                                    const userId = order.userId || order.user?.id || order.user?._id;
                                    if (userId) navigate(`/admin/users/${userId}`);
                                }}
                                className={`flex items-center gap-4 p-2 -ml-2 rounded-xl transition-all ${(order.userId || order.user?.id || order.user?._id) ? 'cursor-pointer hover:bg-gray-50 group' : ''}`}
                            >
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-black text-sm text-gray-400 uppercase border border-gray-200 shrink-0 group-hover:border-gray-300 group-hover:bg-white transition-colors">
                                    {(order.userName || order.shippingAddress?.fullName || 'U').charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-footerBg text-sm truncate group-hover:text-primary group-hover:underline decoration-2 underline-offset-2 transition-all">
                                        {order.userName || order.shippingAddress?.fullName || 'Unknown User'}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 truncate group-hover:text-gray-700">
                                        <Phone size={12} /> {order.user?.phone || order.address?.phone || order.shippingAddress?.phone || 'N/A'}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${isBusiness ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            {isBusiness ? 'Business' : 'Individual'}
                                        </span>
                                    </div>
                                </div>
                                {(order.userId || order.user?.id || order.user?._id) && (
                                    <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                )}
                            </div>

                            {isBusiness && (
                                <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 size={12} className="text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Company Info</span>
                                    </div>
                                    <p className="text-xs font-bold text-footerBg">{companyName}</p>
                                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">GST: {gstNumber}</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full h-px bg-gray-50"></div>

                        {/* Section B: Delivery Details (Form Data) */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Truck size={14} /> Delivery Details
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Recipient</p>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-black text-footerBg">
                                                {order.shippingAddress?.fullName || order.address?.fullName || 'N/A'}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                                                <Phone size={12} /> {order.shippingAddress?.phone || order.address?.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200/50"></div>

                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <MapPin size={10} /> Shipping Address
                                    </p>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {order.shippingAddress?.address || order.address?.address || 'No Address Provided'}
                                        {(order.shippingAddress?.landmark || order.address?.landmark) && (
                                            <span className="block text-gray-400 text-[10px] italic mt-1">
                                                Near {order.shippingAddress?.landmark || order.address?.landmark}
                                            </span>
                                        )}
                                        <span className="block mt-1 font-bold text-gray-700">
                                            {order.shippingAddress?.city || order.address?.city || ''}
                                            {(order.shippingAddress?.state || order.address?.state) ? `, ${order.shippingAddress?.state || order.address?.state}` : ''}
                                            {(order.shippingAddress?.pincode || order.address?.pincode) ? ` - ${order.shippingAddress?.pincode || order.address?.pincode}` : ''}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. Order Status Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock size={16} /> Order Timeline
                        </h3>
                        <div className="space-y-6 relative">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                            {timelineSteps.map((step, idx) => (
                                <div key={idx} className={`relative flex items-start gap-4 ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${step.completed ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                        {step.completed ? <Check size={12} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-gray-200"></div>}
                                    </div>
                                    <div className="-mt-1">
                                        <p className="text-xs font-bold text-footerBg">{step.label}</p>
                                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">{step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 9. Shipment Details (If Shipped) */}
                    {(status === 'Shipped' || status === 'Delivered' || status === 'OutForDelivery') && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Truck size={16} /> Shipment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Courier Partner</span>
                                    <span className="font-bold text-footerBg">{order.courierName || 'Pending Assignment'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">AWB Number</span>
                                    <span className="font-mono font-bold text-footerBg select-all">{order.awbCode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Estimated Delivery</span>
                                    <span className="font-bold text-emerald-600">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                {order.awbCode && (
                                    <a 
                                        href={`https://www.shiprocket.co/tracking/${order.awbCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors text-center"
                                    >
                                        Track Shipment
                                    </a>
                                )}
                            </div>
                            {/* Live Tracking Activities */}
                            {(liveTracking?.tracking || trackingLoading) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Clock size={12} /> Live Tracking Activity
                                        {trackingLoading && <span className="animate-pulse">...</span>}
                                    </h4>
                                    {liveTracking?.tracking?.tracking_data?.shipment_track_activities && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {liveTracking.tracking.tracking_data.shipment_track_activities.map((activity, idx) => (
                                                <div key={idx} className="flex gap-2 items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-footerBg">{activity.activity}</p>
                                                        <p className="text-[9px] text-gray-400">{activity.location} - {new Date(activity.date).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!liveTracking?.tracking?.tracking_data?.shipment_track_activities && !trackingLoading && (
                                        <p className="text-[10px] text-gray-400 italic">Tracking activities will appear once shipment is picked up.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 10. Notifications */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100">
                            <Send size={14} /> WhatsApp
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                            <Mail size={14} /> Resend Email
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
