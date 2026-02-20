import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    ArrowLeft,
    Box,
    Truck,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    CheckCircle2,
    XCircle,
    FileText,
    Image as ImageIcon,
    Video,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    IndianRupee,
    CreditCard,
    Check,
    X,
    Send,
    Printer,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import baadaamImg from '../../../assets/baadaam.png';
import cashewImg from '../../../assets/cashew.png';

const API_URL = API_BASE_URL;

const ReturnDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // DUMMY DATA CASES
    const DUMMY_CASES = {
        // CASE 101: PENDING
        '101': {
            id: '101',
            orderId: '5001',
            type: 'Refund',
            status: 'Pending',
            requestDate: '2025-02-06T09:00:00Z',
            amount: 1200,
            refundAmount: 1200,
            reason: 'Damaged Product',
            userName: 'Rahul Sharma',
            phone: '+91 98765 00001',
            email: 'rahul.s@example.com',
            address: {
                line1: 'A-12, Green Park',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110016',
                fullName: 'Rahul Sharma'
            },
            items: [
                {
                    name: "Organic Cashew Nuts (W320) 250g",
                    sku: "PRO-CAS-250",
                    qty: 1,
                    reason: "Damaged",
                    condition: "Opened",
                    price: 1200,
                    image: cashewImg
                }
            ],
            evidence: {
                comment: "The packet was torn on arrival.",
                images: [cashewImg],
                video: null
            },
            timeline: [
                { status: 'Return Requested', date: '2025-02-06', done: true },
                { status: 'Admin Approved', date: null, done: false },
                { status: 'Pickup Scheduled', date: null, done: false }
            ],
            logs: [
                { type: 'Email', msg: 'Return Request Received', date: '06 Feb 2025, 09:00 AM' }
            ]
        },

        // CASE 102: APPROVED (Pickup Scheduled)
        '102': {
            id: '102',
            orderId: '5002',
            type: 'Refund',
            status: 'Approved',
            requestDate: '2025-02-04T14:30:00Z',
            amount: 850,
            refundAmount: 850,
            reason: 'Wrong Item Received',
            userName: 'Priya Singh',
            phone: '+91 98765 00002',
            email: 'priya.s@example.com',
            address: {
                line1: 'B-402, Lotus Tower, Andheri West',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400053',
                fullName: 'Priya Singh'
            },
            items: [
                {
                    name: "Premium California Almonds",
                    sku: "PRO-ALM-500",
                    qty: 1,
                    reason: "Wrong Item",
                    condition: "Unopened",
                    price: 850,
                    image: baadaamImg
                }
            ],
            evidence: {
                comment: "I ordered Cashews but received Almonds.",
                images: [baadaamImg],
                video: null
            },
            courier: {
                partner: 'Delhivery',
                awb: 'RT987654321',
                pickupDate: '2025-02-07',
                status: 'Scheduled'
            },
            timeline: [
                { status: 'Return Requested', date: '2025-02-04', done: true },
                { status: 'Admin Approved', date: '2025-02-05', done: true },
                { status: 'Pickup Scheduled', date: '2025-02-05', done: true },
                { status: 'Picked Up', date: null, done: false }
            ],
            logs: [
                { type: 'Email', msg: 'Return Request Received', date: '04 Feb 2025, 02:30 PM' },
                { type: 'System', msg: 'Pickup Scheduled via Delhivery', date: '05 Feb 2025, 10:00 AM' }
            ]
        },

        // CASE 103: REFUNDED (Completed)
        '103': {
            id: '103',
            orderId: '5003',
            type: 'Refund',
            status: 'Refunded',
            requestDate: '2025-01-20T09:15:00Z',
            amount: 2500,
            refundAmount: 2500,
            reason: 'Quality Issue',
            userName: 'Amit Verma',
            phone: '+91 98765 00003',
            email: 'amit.v@example.com',
            address: {
                line1: 'C-15, Golf Links',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560071',
                fullName: 'Amit Verma'
            },
            items: [
                {
                    name: "Family Dry Fruit Mix 1kg",
                    sku: "PRO-MIX-1KG",
                    qty: 2,
                    reason: "Not Fresh",
                    condition: "Opened",
                    price: 1250,
                    image: cashewImg
                }
            ],
            evidence: {
                comment: "Nuts taste stale.",
                images: [],
                video: null
            },
            courier: {
                partner: 'BlueDart',
                awb: 'RT555666777',
                pickupDate: '2025-01-22',
                status: 'Delivered'
            },
            refund: {
                method: 'UPI',
                amount: 2500,
                transactionId: 'UPI-1234567890',
                date: '2025-01-25'
            },
            timeline: [
                { status: 'Return Requested', date: '2025-01-20', done: true },
                { status: 'Admin Approved', date: '2025-01-21', done: true },
                { status: 'Picked Up', date: '2025-01-22', done: true },
                { status: 'Received', date: '2025-01-24', done: true },
                { status: 'Refund Completed', date: '2025-01-25', done: true }
            ],
            logs: [
                { type: 'Email', msg: 'Refund Processed successfully', date: '25 Jan 2025, 02:00 PM' }
            ]
        },

        // CASE 104: REJECTED
        '104': {
            id: '104',
            orderId: '5004',
            type: 'Refund',
            status: 'Rejected',
            requestDate: '2025-02-01T16:45:00Z',
            amount: 500,
            refundAmount: 0,
            reason: 'Changed Mind',
            userName: 'Sneha Gupta',
            phone: '+91 98765 00004',
            email: 'sneha.g@example.com',
            address: {
                line1: 'D-5, Civil Lines',
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302006',
                fullName: 'Sneha Gupta'
            },
            items: [
                {
                    name: "Raisins 250g",
                    sku: "PRO-RAI-250",
                    qty: 1,
                    reason: "Changed Mind",
                    condition: "Unopened",
                    price: 500,
                    image: baadaamImg
                }
            ],
            evidence: {
                comment: "I don't need it anymore.",
                images: [],
                video: null
            },
            adminComment: 'Return policy does not cover "Change of Mind" for food items.',
            timeline: [
                { status: 'Return Requested', date: '2025-02-01', done: true },
                { status: 'Rejected', date: '2025-02-02', done: true }
            ],
            logs: [
                { type: 'Email', msg: 'Return Request Rejected', date: '02 Feb 2025, 09:30 AM' }
            ]
        },

    // CASE 201: REPLACEMENT APPROVED
    '201': {
        id: '201',
            orderId: '6001',
                type: 'Replacement',
                    status: 'Approved',
                        requestDate: '2025-02-02T14:30:00Z',
                            amount: 899,
                                reason: 'Wrong Color',
                                    userName: 'Priya Verma',
                                        phone: '+91 98765 00005',
                                            email: 'priya.v@example.com',
                                                address: {
            line1: 'E-20, Park Street',
                city: 'Kolkata',
                    state: 'West Bengal',
                        pincode: '700016',
                            fullName: 'Priya Verma'
        },
        items: [
            {
                name: "Saree - Red",
                sku: "CLO-SAR-RED",
                qty: 1,
                reason: "Wrong Color",
                condition: "Unopened",
                price: 899,
                image: baadaamImg
            }
        ],
            evidence: {
            comment: "I ordered Blue but got Red.",
                images: [baadaamImg],
                    video: null
        },
        courier: {
            partner: 'Delhivery',
                awb: 'RPL123456',
                    pickupDate: '2025-02-03',
                        status: 'Scheduled'
        },
        timeline: [
            { status: 'Return Requested', date: '2025-02-02', done: true },
            { status: 'Approved', date: '2025-02-03', done: true },
            { status: 'Pickup Scheduled', date: '2025-02-03', done: true }
        ],
            logs: []
    },

    // CASE 202: REPLACEMENT PENDING
    '202': {
        id: '202',
            orderId: '6002',
                type: 'Replacement',
                    status: 'Pending',
                        requestDate: '2025-02-04T12:00:00Z',
                            amount: 750,
                                reason: 'Defective',
                                    userName: 'Neha Gupta',
                                        phone: '+91 99999 88888',
                                            email: 'neha.g@example.com',
                                                address: {
            line1: 'F-45, Hitech City',
                city: 'Hyderabad',
                    state: 'Telangana',
                        pincode: '500081',
                            fullName: 'Neha Gupta'
        },
        items: [
            {
                name: "Earbuds",
                sku: "ELEC-EAR-01",
                qty: 1,
                reason: "Defective",
                condition: "Opened",
                price: 750,
                image: cashewImg
            }
        ],
            evidence: {
            comment: "One side not working.",
                images: [],
                    video: null
        },
        timeline: [
            { status: 'Return Requested', date: '2025-02-04', done: true }
        ],
            logs: []
    },

    // CASE 203: REPLACEMENT SHIPPED
    '203': {
        id: '203',
            orderId: '6003',
                type: 'Replacement',
                    status: 'Shipped',
                        requestDate: '2025-02-06T09:00:00Z',
                            amount: 500,
                                reason: 'Damaged',
                                    userName: 'Rahul Roy',
                                        phone: '+91 77777 66666',
                                            email: 'rahul.r@example.com',
                                                address: {
            line1: 'G-10, Salt Lake',
                city: 'Kolkata',
                    state: 'West Bengal',
                        pincode: '700091',
                            fullName: 'Rahul Roy'
        },
        items: [
            {
                name: "Mug",
                sku: "HOM-MUG-01",
                qty: 1,
                reason: "Damaged",
                condition: "Opened",
                price: 500,
                image: baadaamImg
            }
        ],
            evidence: {
            comment: "Handle broken.",
                images: [baadaamImg],
                    video: null
        },
        courier: {
            partner: 'BlueDart',
                awb: 'RPL987654',
                    pickupDate: '2025-02-07',
                        status: 'Picked Up'
        },
        timeline: [
            { status: 'Return Requested', date: '2025-02-06', done: true },
            { status: 'Approved', date: '2025-02-06', done: true },
            { status: 'Shipped', date: '2025-02-07', done: true }
        ],
            logs: []
    }
};

const currentDummyData = DUMMY_CASES[id] || DUMMY_CASES['101'];

// Fetch Return Details
const { data: ret, isLoading } = useQuery({
    queryKey: ['return', id],
    queryFn: async () => {
        const res = await fetch(`${API_URL}/returns/${id}`);
        if (!res.ok) throw new Error('Failed to fetch return details');
        return res.json();
    }
});

// Approve Return Mutation
const approveMutation = useMutation({
    mutationFn: async () => {
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
        queryClient.invalidateQueries(['return', id]);
        queryClient.invalidateQueries(['returns']);
        toast.success(`Return approved! ${data.return?.awbCode ? `AWB: ${data.return.awbCode}` : ''}`);
    },
    onError: (err) => toast.error(err.message || 'Failed to approve')
});

// Update Status Mutation
const updateStatusMutation = useMutation({
    mutationFn: async ({ status }) => {
        const res = await fetch(`${API_URL}/returns/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['return', id]);
        queryClient.invalidateQueries(['returns']);
        toast.success('Return status updated');
    },
    onError: () => toast.error('Failed to update status')
});

const [adminComment, setAdminComment] = useState('');

if (isLoading) return <div className="p-20 text-center">Loading Return Details...</div>;
if (!ret) return <div className="p-20 text-center text-red-500">Return not found</div>;

const isReplacement = ret.type === 'replace' || ret.type === 'Replacement';

const getStatusColor = (st) => {
    switch (st) {
        case 'Completed':
        case 'Refunded': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'Approved': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'Rejected': return 'text-red-600 bg-red-50 border-red-100';
        default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};

return (
    <div className="space-y-6 pb-20 text-left font-['Inter']">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
            <button
                onClick={() => navigate('/admin/returns')}
                className="flex items-center gap-2 text-gray-500 hover:text-footerBg font-bold text-xs uppercase tracking-widest transition-colors"
            >
                <ArrowLeft size={16} /> Back to Requests
            </button>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-footerBg hover:text-footerBg transition-all shadow-sm">
                    <Printer size={14} /> Print Slip
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-footerBg text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-footerBg/20">
                    <Download size={14} /> Download
                </button>
            </div>
        </div>

        {/* 1. Return Summary (Top Card) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Return ID</p>
                <p className="text-lg font-black text-footerBg select-all">#{ret.id}</p>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                <p className="text-sm font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate(`/admin/orders/${ret.orderId}`)}>
                    #{ret.orderId}
                </p>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(ret.status)}`}>
                    {ret.status}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                <p className="text-xl font-black text-footerBg">₹{(ret.refundAmount || 0).toLocaleString()}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Items, Breakup, Evidence */}
            <div className="lg:col-span-2 space-y-6">

                {/* 4. Return Items Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Box size={16} /> Return Items ({ret.items?.length})
                        </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <th className="p-4">Item Details</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4 text-right">Condition</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ret.items?.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 p-1 shrink-0">
                                                    <img src={item.image || "https://placehold.co/400x400/png?text=Product"} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-footerBg">{item.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-xs text-footerBg uppercase">{item.sku}</span>
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-600">{item.qty}</td>
                                        <td className="p-4 text-right font-bold text-footerBg">₹{item.price.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase tracking-wider">{item.reason}</span>
                                        </td>
                                        <td className="p-4 text-right text-xs font-bold text-gray-500">{item.condition}</td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. Customer Evidence */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle size={16} /> Customer Evidence
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                        <div className="flex gap-3">
                            <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Comment</p>
                                <p className="text-xs font-bold text-footerBg mt-1 italic leading-relaxed">"{ret.evidence?.comment}"</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Proof Uploads</p>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {ret.evidence?.images?.map((img, i) => (
                                <div key={i} className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shrink-0 relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                    <img src={img} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {ret.evidence?.video && (
                                <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:shadow-md transition-all">
                                    <Video className="text-gray-400" size={20} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 9. Refund Details (Conditional) */}
                {(!isReplacement && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <IndianRupee size={16} /> Refund Details
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between text-gray-500">
                                <span className="font-medium">Refund Method</span>
                                <span className="font-bold text-footerBg flex items-center gap-1">
                                    <CreditCard size={12} /> {ret.refund?.method || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span className="font-medium">Transaction ID</span>
                                <span className="font-mono font-bold text-footerBg">{ret.refund?.transactionId || 'Pending'}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                                <span className="font-black text-footerBg uppercase tracking-tight">Total Refund Amount</span>
                                <span className="text-xl font-black text-emerald-600">₹{ret.refund?.amount || '0'}</span>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Right Column: Customer, Timeline, Actions */}
            <div className="space-y-6">

                {/* 6. Admin Actions (For Pending Requests) */}
                {ret.status === 'Pending' && (
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Admin Actions</h3>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary min-h-[80px] resize-none mb-2 text-gray-800"
                            placeholder="Add internal comment..."
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                        ></textarea>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => approveMutation.mutate()}
                                disabled={approveMutation.isPending}
                                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                            >
                                <Check size={16} /> {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => updateStatusMutation.mutate({ status: 'Rejected' })}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                                <X size={16} /> Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* Shiprocket Tracking Card (If approved/has AWB) */}
                {(ret.shiprocketReturnId || ret.awbCode) && (
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Truck size={16} className="text-purple-500" /> Shiprocket Tracking
                        </h3>
                        <div className="space-y-3">
                            {ret.shiprocketReturnId && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Shiprocket Return ID</span>
                                    <span className="font-mono font-bold text-footerBg select-all">{ret.shiprocketReturnId}</span>
                                </div>
                            )}
                            {ret.awbCode && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">AWB Code</span>
                                    <span className="font-mono font-bold text-purple-600 select-all">{ret.awbCode}</span>
                                </div>
                            )}
                            {ret.courierName && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Courier</span>
                                    <span className="font-bold text-footerBg">{ret.courierName}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Pickup Status</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                                    ret.pickupStatus === 'Picked Up' || ret.pickupStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                    ret.pickupStatus === 'Scheduled' ? 'bg-purple-50 text-purple-600' :
                                    ret.pickupStatus === 'In Transit' ? 'bg-blue-50 text-blue-600' :
                                    'bg-gray-50 text-gray-500'
                                }`}>{ret.pickupStatus || 'Not Scheduled'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* REJECTION REASON (If Rejected) */}
                {ret.status === 'Rejected' && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <XCircle size={12} /> Rejection Reason
                        </h3>
                        <p className="text-xs font-bold text-red-700 leading-relaxed">
                            {ret.adminComment || "No reason provided."}
                        </p>
                    </div>
                )}

                {/* 2. Customer & Pickup Details */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                    {/* Customer Info */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={14} /> Customer
                        </h3>
                        <div className="flex items-center gap-4 p-2 -ml-2 rounded-xl transition-all">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-black text-sm text-gray-400 uppercase border border-gray-200 shrink-0">
                                {ret.userName?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-footerBg text-sm truncate">{ret.userName}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                                    <Phone size={12} /> {ret.phone}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                                    <Mail size={12} /> {ret.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-50"></div>

                    {/* Pickup Address */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={14} /> Pickup Address
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {ret.address?.line1}<br />
                                <span className="block mt-1 font-bold text-gray-700">
                                    {ret.address?.city}, {ret.address?.state} - {ret.address?.pincode}
                                </span>
                            </p>
                            <p className="text-[9px] font-bold text-blue-400 mt-2 flex items-center gap-1">
                                <Truck size={10} /> Shiprocket API Integration
                            </p>
                        </div>
                    </div>
                </div>

                {/* 7. Return Timeline */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={16} /> Return Timeline
                    </h3>
                    <div className="space-y-6 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                        {ret.timeline?.map((step, idx) => (
                            <div key={idx} className={`relative flex items-start gap-4 ${step.done ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${step.done ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                    {step.done ? <Check size={12} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-gray-200"></div>}
                                </div>
                                <div className="-mt-1">
                                    <p className="text-xs font-bold text-footerBg">{step.status}</p>
                                    {step.date && <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">{step.date}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Logistics Info (If Approved) - Legacy support */}
                {(ret.courier) && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Truck size={16} /> Return Pickup Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Partner</span>
                                <span className="font-bold text-footerBg">{ret.courier?.partner}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Return AWB</span>
                                <span className="font-mono font-bold text-footerBg select-all">{ret.courier?.awb}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Pickup Scheduled</span>
                                <span className="font-bold text-footerBg">{ret.courier?.pickupDate}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Pickup Status</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{ret.courier?.status}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status History Timeline from Shiprocket */}
                {ret.pickupStatusHistory && ret.pickupStatusHistory.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={16} /> Status History
                        </h3>
                        <div className="space-y-3">
                            {ret.pickupStatusHistory.slice().reverse().map((entry, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="font-bold text-footerBg">{entry.status}</p>
                                        <p className="text-gray-400 text-[10px]">{entry.info}</p>
                                        <p className="text-gray-400 text-[9px] mt-0.5">
                                            {new Date(entry.timestamp).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 10. Notifications */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100">
                        <Send size={14} /> WhatsApp
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                        <Mail size={14} /> Email Log
                    </button>
                </div>

            </div>
        </div>
    </div>
);
};

export default ReturnDetailPage;
