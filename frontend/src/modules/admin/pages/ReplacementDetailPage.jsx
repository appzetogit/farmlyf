import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/apiUrl';
import {

    ArrowLeft,
    Printer,
    Download,
    User,
    MapPin,
    Package,
    AlertCircle,
    Truck,
    CheckCircle2,
    History,
    RotateCcw,
    Box,
    Shield,
    Phone,
    Mail,
    AlertTriangle,
    Archive,
    Calendar,
    PenTool // Added generic icon for courier/edit if needed
} from 'lucide-react';
import toast from 'react-hot-toast';
import baadaamImg from '../../../assets/baadaam.png';
import cashewImg from '../../../assets/cashew.png';

const API_URL = API_BASE_URL;

const ReplacementDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for Admin Actions
    const [adminComment, setAdminComment] = useState('');
    const [replacementMode, setReplacementMode] = useState('after_pickup');

    // State for Verification Step (Step 3)
    const [itemCondition, setItemCondition] = useState('Good');
    const [stockAction, setStockAction] = useState('Restock');

    // DUMMY DATA FOR REPLACEMENTS
    const DUMMY_CASES = {
        '201': {
            id: '201',
            orderId: 'ORD-6001',
            requestDate: '02 Feb 2025',
            status: 'Pickup Scheduled',
            type: 'Same Product',
            customer: {
                name: 'Priya Verma',
                phone: '+91 98765 00005',
                email: 'priya.v@example.com'
            },
            addresses: {
                delivery: { line1: 'E-20, Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
                pickup: { line1: 'E-20, Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' }
            },
            originalItems: [{ name: "Saree - Red", sku: "CLO-SAR-RED", qty: 1, price: 899, reason: "Wrong Color", image: baadaamImg }],
            replacementItems: [{ name: "Saree - Blue", sku: "CLO-SAR-BLU", qty: 1, price: 0, image: baadaamImg }],
            evidence: { reason: 'Wrong Color', comment: 'I ordered Blue but got Red.', images: [baadaamImg], video: null },
            pickup: { partner: 'Delhivery', awb: 'PICK-889900', date: '03 Feb 2025', status: 'Scheduled' },
            timeline: [
                { status: 'Requested', date: '02 Feb 2025', done: true },
                { status: 'Approved', date: '03 Feb 2025', done: true },
                { status: 'Pickup Scheduled', date: '03 Feb 2025', done: true },
            ],
            logs: [{ action: 'Approved', comment: 'Approved for pickup first.', user: 'Admin', date: '03 Feb 2025' }]
        },
        '202': {
            id: '202',
            orderId: 'ORD-6002',
            requestDate: '04 Feb 2025',
            status: 'Pending',
            type: 'Same Product',
            customer: {
                name: 'Neha Gupta',
                phone: '+91 99999 88888',
                email: 'neha.g@example.com'
            },
            addresses: {
                delivery: { line1: 'F-45, Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
                pickup: { line1: 'F-45, Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081' }
            },
            originalItems: [{ name: "Earbuds", sku: "ELEC-EAR-01", qty: 1, price: 750, reason: "Defective", image: cashewImg }],
            replacementItems: [{ name: "Earbuds", sku: "ELEC-EAR-01", qty: 1, price: 0, image: cashewImg }],
            evidence: { reason: 'Defective', comment: 'One side not working.', images: [], video: null },
            timeline: [
                { status: 'Requested', date: '04 Feb 2025', done: true },
            ],
            logs: []
        },
        '203': {
            id: '203',
            orderId: 'ORD-6003',
            requestDate: '06 Feb 2025',
            status: 'Pickup Completed',
            type: 'Same Product',
            customer: { name: 'Rahul Roy', phone: '+91 77777 66666', email: 'rahul.r@example.com' },
            addresses: {
                delivery: { line1: 'G-10, Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
                pickup: { line1: 'G-10, Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091' }
            },
            originalItems: [{ name: "Mug", sku: "HOM-MUG-01", qty: 1, price: 500, reason: "Damaged", image: baadaamImg }],
            replacementItems: [{ name: "Mug", sku: "HOM-MUG-01", qty: 1, price: 0, image: baadaamImg }],
            evidence: { reason: "Damaged", comment: "Handle broken.", images: [baadaamImg], video: null },
            pickup: { partner: 'BlueDart', awb: 'PICK-777', date: '06 Feb 2025', status: 'Picked' },
            timeline: [
                { status: 'Requested', date: '06 Feb 2025', done: true },
                { status: 'Approved', date: '06 Feb 2025', done: true },
                { status: 'Pickup Scheduled', date: '06 Feb 2025', done: true },
                { status: 'Pickup Completed', date: '07 Feb 2025', done: true },
            ],
            logs: [{ action: 'Approved', comment: 'Standard replacement.', user: 'Admin', date: '06 Feb 2025' }]
        }
    };

    // Fetch Replacement Details
    const queryClient = useQueryClient();
    const { data: currentData, isLoading, isError } = useQuery({
        queryKey: ['replacement', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/replacements/${id}`);
            if (!res.ok) throw new Error('Failed to fetch replacement');
            return res.json();
        }
    });

    // Approve Mutation
    const approveMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/replacements/${id}/approve`, {
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
            queryClient.invalidateQueries(['replacement', id]);
            queryClient.invalidateQueries(['replacements']);
            toast.success(`Approved! ${data.replacement?.pickupAwbCode ? `AWB: ${data.replacement.pickupAwbCode}` : 'Pickup scheduled.'}`);
        },
        onError: (err) => toast.error(err.message || 'Failed to approve')
    });

    // Reject Mutation
    const rejectMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/replacements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Rejected' })
            });
            if (!res.ok) throw new Error('Failed to reject');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['replacement', id]);
            queryClient.invalidateQueries(['replacements']);
            toast.error('Replacement Rejected.');
        }
    });

    // Ship Replacement Mutation
    const shipMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/replacements/${id}/ship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to ship');
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['replacement', id]);
            queryClient.invalidateQueries(['replacements']);
            toast.success(`Shipped! ${data.replacement?.shipmentAwbCode ? `AWB: ${data.replacement.shipmentAwbCode}` : ''}`);
        },
        onError: (err) => toast.error(err.message || 'Failed to ship replacement')
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': case 'Requested': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Pickup Scheduled': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Pickup Completed': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Replacement Shipped': case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (isError || !currentData) return <div className="p-10 text-center text-red-500">Replacement not found</div>;

    return (
        <div className="space-y-6 pb-20 text-left font-['Inter']">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/admin/replacements')} className="flex items-center gap-2 text-gray-500 hover:text-footerBg font-bold text-xs uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} /> Back to Replacements
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

            {/* 1. REPLACEMENT SUMMARY */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Replacement ID</p>
                    <p className="text-lg font-black text-footerBg select-all">{currentData.id || `REP-${currentData._id?.slice(-6)}`}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Original Order</p>
                    <p className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">{currentData.orderId}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Request Date</p>
                    <p className="text-sm font-bold text-gray-600">{currentData.requestDate ? new Date(currentData.requestDate).toLocaleDateString('en-GB') : '-'}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusColor(currentData.status)}`}>
                        {currentData.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN (2/3) - Items, Evidence, Logistics */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 3. ORIGINAL ITEM DETAILS */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <RotateCcw size={16} /> Original Item Details (To Be Returned)
                        </h3>
                        <div className="bg-red-50/50 rounded-xl border border-red-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-red-50 text-[10px] uppercase font-black text-red-400 tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3 text-right">Paid Price</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentData.originalItems.map((item, i) => (
                                        <tr key={i} className="border-b border-red-100 last:border-0">
                                            <td className="px-4 py-3 font-bold text-footerBg flex items-center gap-3">
                                                <img src={item.image} className="w-8 h-8 rounded border border-gray-200" alt="" />
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{item.sku}</td>
                                            <td className="px-4 py-3 font-bold">{item.qty}</td>
                                            <td className="px-4 py-3 text-right font-bold text-footerBg">₹{item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. REPLACEMENT ITEM DETAILS */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Box size={16} /> Replacement Item Details (New Shipment)
                        </h3>
                        <div className="bg-green-50/50 rounded-xl border border-green-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-green-50 text-[10px] uppercase font-black text-green-600 tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentData.replacementItems.map((item, i) => (
                                        <tr key={i} className="border-b border-green-100 last:border-0">
                                            <td className="px-4 py-3 font-bold text-footerBg flex items-center gap-3">
                                                <img src={item.image} className="w-8 h-8 rounded border border-gray-200" alt="" />
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{item.sku}</td>
                                            <td className="px-4 py-3 font-bold">{item.qty}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-600">₹0 <span className="text-[9px] text-gray-400 font-normal uppercase">(Free Replacement)</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 5. REASON & EVIDENCE */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={16} /> Reason & Evidence
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Reason</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-footerBg text-sm">{currentData.evidence.reason}</span>
                                    <span className="text-xs text-gray-500 italic">"{currentData.evidence.comment}"</span>
                                </div>
                            </div>
                            {currentData.evidence.images.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Uploaded Proof</p>
                                    <div className="flex gap-4">
                                        {currentData.evidence.images.map((img, i) => (
                                            <img key={i} src={img} alt="Proof" className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 7. PICKUP DETAILS */}
                    {/* Show when Picked Up Scheduled or later */}
                    {(['Pickup Scheduled', 'Pickup Completed', 'Replacement Shipped', 'Shipped', 'Delivered', 'Closed'].includes(currentData.status)) && currentData.pickup && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Truck size={16} /> Pickup Details (Old Item)
                            </h3>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Courier & AWB</p>
                                    <p className="text-sm font-bold text-footerBg">{currentData.pickup.partner} | {currentData.pickup.awb}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled Date</p>
                                    <p className="text-sm font-bold text-gray-600 flex items-center gap-1">
                                        <Calendar size={12} /> {currentData.pickup.date}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup Status</p>
                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-footerBg">{currentData.pickup.status}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. REPLACEMENT SHIPMENT DETAILS */}
                    {(['Replacement Shipped', 'Shipped', 'Delivered', 'Closed'].includes(currentData.status)) && currentData.shipment && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-primary">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} /> Replacement Shipment (New Item)
                            </h3>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipment AWB</p>
                                    <p className="text-sm font-bold text-footerBg">{currentData.shipment.partner} - {currentData.shipment.awb}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <span className="px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-xs font-black uppercase tracking-widest">{currentData.shipment.status}</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN (1/3) - Actions, Customer, Timeline */}
                <div className="space-y-6">

                    {/* 6. ADMIN ACTION PANEL */}
                    {(currentData.status === 'Pending' || currentData.status === 'Requested') && (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 sticky top-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Shield size={14} /> Admin Actions
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Replacement Mode</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setReplacementMode('after_pickup')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${replacementMode === 'after_pickup' ? 'bg-footerBg text-white border-footerBg' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            After Pickup
                                        </button>
                                        <button
                                            onClick={() => setReplacementMode('immediate')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${replacementMode === 'immediate' ? 'bg-footerBg text-white border-footerBg' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            Immediate
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary min-h-[80px] resize-none text-gray-800"
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
                                        {approveMutation.isPending ? 'Processing...' : <><CheckCircle2 size={16} /> Approve</>}
                                    </button>
                                    <button
                                        onClick={() => rejectMutation.mutate()}
                                        disabled={rejectMutation.isPending}
                                        className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                                    >
                                        {rejectMutation.isPending ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shiprocket Pickup Tracking */}
                    {(currentData.shiprocketPickupId || currentData.pickupAwbCode) && (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Truck size={16} className="text-purple-500" /> Shiprocket Pickup
                            </h3>
                            <div className="space-y-3">
                                {currentData.shiprocketPickupId && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Shiprocket ID</span>
                                        <span className="font-mono font-bold text-footerBg">{currentData.shiprocketPickupId}</span>
                                    </div>
                                )}
                                {currentData.pickupAwbCode && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">AWB Code</span>
                                        <span className="font-mono font-bold text-purple-600 select-all">{currentData.pickupAwbCode}</span>
                                    </div>
                                )}
                                {currentData.pickupCourierName && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Courier</span>
                                        <span className="font-bold text-footerBg">{currentData.pickupCourierName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Pickup Status</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                                        currentData.pickupStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                        currentData.pickupStatus === 'Scheduled' ? 'bg-purple-50 text-purple-600' :
                                        'bg-gray-50 text-gray-500'
                                    }`}>{currentData.pickupStatus || 'Not Scheduled'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shiprocket Shipment Tracking */}
                    {(currentData.shiprocketShipmentId || currentData.shipmentAwbCode) && (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                            <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} className="text-green-500" /> Replacement Shipment
                            </h3>
                            <div className="space-y-3">
                                {currentData.shipmentAwbCode && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">AWB Code</span>
                                        <span className="font-mono font-bold text-green-600 select-all">{currentData.shipmentAwbCode}</span>
                                    </div>
                                )}
                                {currentData.shipmentCourierName && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Courier</span>
                                        <span className="font-bold text-footerBg">{currentData.shipmentCourierName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Shipment Status</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                                        currentData.shipmentStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                        currentData.shipmentStatus === 'Shipped' ? 'bg-green-50 text-green-600' :
                                        'bg-gray-50 text-gray-500'
                                    }`}>{currentData.shipmentStatus || 'Not Shipped'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 Action: Verify & Ship (If Pickup Completed) */}
                    {currentData.status === 'Pickup Completed' && (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 sticky top-6 border-l-4 border-l-orange-400">
                            <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <AlertTriangle size={14} /> Action: Verify Old Item
                            </h3>
                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Item Condition</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setItemCondition('Good')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${itemCondition === 'Good' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            Good Condition
                                        </button>
                                        <button
                                            onClick={() => setItemCondition('Damaged')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${itemCondition === 'Damaged' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            Damaged
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Inventory Action</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStockAction('Restock')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${stockAction === 'Restock' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            <Archive size={12} className="inline mr-1" /> Restock
                                        </button>
                                        <button
                                            onClick={() => setStockAction('Discard')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${stockAction === 'Discard' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-white text-gray-500 border-gray-200'}`}
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => shipMutation.mutate()}
                                    disabled={shipMutation.isPending}
                                    className="w-full bg-footerBg text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {shipMutation.isPending ? 'Processing...' : <><Package size={16} /> Process & Ship New Item</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* REJECTION REASON (If Rejected) */}
                    {currentData.status === 'Rejected' && (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <AlertCircle size={12} /> Rejection Reason
                            </h3>
                            <p className="text-xs font-bold text-red-700 leading-relaxed">
                                {currentData.logs?.find(l => l.action === 'Rejected')?.comment || adminComment || "No reason provided."}
                            </p>
                        </div>
                    )}

                    {/* APPROVAL & PICKUP INFO (If Approved) */}
                    {(['Approved', 'Pickup Scheduled', 'Pickup Completed', 'Replacement Shipped', 'Shipped', 'Delivered', 'Closed'].includes(currentData.status)) && (
                        <div className="space-y-3">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Approved
                                </h3>
                                <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                                    {currentData.logs?.find(l => l.action === 'Approved')?.comment || "Replacement Approved. Pickup Generated."}
                                </p>
                            </div>

                            {/* Courier Info Card (Matches Screenshot Design) */}
                            {currentData.pickup && (
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-600">
                                    <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <Truck size={16} /> Return Pickup Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Partner</span>
                                            <span className="font-bold text-footerBg text-right">{currentData.pickup.partner}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Return AWB</span>
                                            <span className="font-black text-footerBg text-right">{currentData.pickup.awb}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Pickup Scheduled</span>
                                            <span className="font-bold text-footerBg text-right">{currentData.pickup.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Pickup Status</span>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                                                {currentData.pickup.status}
                                            </span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-6 bg-blue-50 text-blue-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors">
                                        Track Status
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Customer & Pickup Details (Exact Match) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={14} /> Customer
                            </h3>
                            <div className="flex items-center gap-4 p-2 -ml-2 rounded-xl transition-all">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-black text-sm text-gray-400 uppercase border border-gray-200 shrink-0">
                                    {currentData.customer.name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-footerBg text-sm truncate">{currentData.customer.name}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                                        <Phone size={12} /> {currentData.customer.phone}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                                        <Mail size={12} /> {currentData.customer.email}
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
                                    {currentData.addresses.pickup.line1}<br />
                                    <span className="block mt-1 font-bold text-gray-700">
                                        {currentData.addresses.pickup.city}, {currentData.addresses.pickup.state} - {currentData.addresses.pickup.pincode}
                                    </span>
                                </p>
                                <p className="text-[9px] font-bold text-blue-400 mt-2 flex items-center gap-1">
                                    <Truck size={10} /> Shiprocket API Integration
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 10. TIMELINE */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-footerBg uppercase tracking-widest mb-4 flex items-center gap-2">
                            <History size={16} /> Status Timeline
                        </h3>
                        <div className="space-y-0 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-gray-100"></div>

                            {currentData.timeline?.map((step, i) => (
                                <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                                    <div className={`w-5 h-5 rounded-full border-2 z-10 bg-white shrink-0 flex items-center justify-center ${step.done ? 'border-primary text-primary' : 'border-gray-200 text-gray-300'}`}>
                                        <div className={`w-2 h-2 rounded-full ${step.done ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div className="-mt-1">
                                        <p className={`text-xs font-bold ${step.done ? 'text-footerBg' : 'text-gray-400'}`}>{step.status}</p>
                                        {step.date && <p className="text-[10px] font-bold text-gray-400">{step.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReplacementDetailPage;
