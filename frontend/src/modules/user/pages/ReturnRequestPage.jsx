
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, RefreshCw, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useOrders, useReturns, useCreateReturn } from '../../../hooks/useOrders';
import { useProducts } from '../../../hooks/useProducts';

const ReturnRequestPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { data: orders = [] } = useOrders(user?.id);
    const { data: returns = [] } = useReturns(user?.id);
    const { mutate: createReturn } = useCreateReturn();
    const { data: products = [] } = useProducts();

    const order = orders.find(o => o.id === orderId);
    
    // Helper helpers
    const getVariantById = (variantId) => {
         for(let p of products) {
            const v = p.variants?.find(v => v.id === variantId);
            if(v) return { ...v, product: p };
        }
        return null;
    };
    
    // Create wrapper for createReturnRequest
    const createReturnRequest = (uid, data) => {
        createReturn({ userId: uid, returnData: data });
    };

    // Get items already returned for this order
    const orderReturns = returns.filter(r => r.orderId === orderId && r.status !== 'Rejected');
    const returnedPackIds = new Set();
    orderReturns.forEach(ret => {
        ret.items.forEach(item => returnedPackIds.add(item.packId));
    });

    const [selectedItems, setSelectedItems] = useState([]);
    const [returnType, setReturnType] = useState('refund'); // 'refund' | 'replace'
    const [replacementVariantId, setReplacementVariantId] = useState(null);
    const [replacementMethod, setReplacementMethod] = useState('reverse'); // 'reverse' | 'advance'
    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = React.useRef(null);

    // const { getProductById, getVariantById } = useShop(); // Removed

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setSelectedImages(prev => [...prev, ...imageUrls].slice(0, 4));
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Identify the product and its variants for the first selected item
    // (In a real app, you'd handle multi-item replacement differently, but here we'll simplify)
    const firstSelectedId = selectedItems.length > 0 ? selectedItems[0] : null;
    let variants = [];
    let currentItemData = null;
    if (firstSelectedId) {
        const variantInfo = getVariantById(firstSelectedId);
        if (variantInfo) {
            variants = variantInfo.product.variants;
            currentItemData = variantInfo;
        }
    }

    const handleToggleItem = (packId) => {
        // For simplicity in this demo, we only allow exchanging one item at a time 
        // if user wants to change variants.
        if (selectedItems.includes(packId)) {
            setSelectedItems(selectedItems.filter(id => id !== packId));
            if (selectedItems.length === 1) setReplacementVariantId(null);
        } else {
            setSelectedItems([...selectedItems, packId]);
        }
    };

    const selectedReplacementVariant = replacementVariantId ? variants.find(v => v.id === replacementVariantId) : null;
    const priceDiff = (selectedReplacementVariant && currentItemData)
        ? selectedReplacementVariant.price - currentItemData.price
        : 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to return');
            return;
        }

        setLoading(true);

        const returnItems = order.items.filter(item => selectedItems.includes(item.packId));
        const refundAmount = returnItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

        const returnData = {
            orderId: order.id,
            userId: user.id,
            items: returnItems,
            type: returnType,
            replacementMethod: returnType === 'replace' ? replacementMethod : null,
            replacementVariantId: returnType === 'replace' ? replacementVariantId : null,
            priceDifference: priceDiff,
            reason: reason,
            comments: comments,
            refundAmount: refundAmount,
            images: selectedImages,
            courierStatus: 'Pending Pickup',
            requestDate: Date.now()
        };

        // Simulate network delay
        setTimeout(() => {
            createReturnRequest(user.id, returnData);
            setLoading(false);
            navigate('/returns'); // Redirect to Returns List
        }, 1500);
    };

    const reasons = [
        "Damaged / Defective Product",
        "Wrong Item Delivered",
        "Quality Issues / Expired",
        "Item Not as Described",
        "Package Tampered",
        "Changed Mind"
    ];

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-12">
            <div className="container mx-auto px-4 md:px-12 max-w-3xl">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-footerBg uppercase tracking-tight">Request Return / Exchange</h1>
                        <p className="text-gray-500 text-sm mt-1">Order #{order.id}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Step 1: Select Items */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <h3 className="font-bold text-footerBg mb-4 flex items-center gap-2">
                            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                            SELECT ITEMS
                        </h3>
                        <div className="space-y-4">
                            {order.items.map((item) => {
                                const isAlreadyReturned = returnedPackIds.has(item.packId);
                                const isSelected = selectedItems.includes(item.packId);

                                return (
                                    <label key={item.packId}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all 
                                            ${isAlreadyReturned ? 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed' :
                                                isSelected ? 'border-primary bg-primary/5 cursor-pointer ring-2 ring-primary/10' : 'border-gray-100 hover:border-gray-200 cursor-pointer'}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 accent-primary border-gray-300 rounded"
                                            checked={isSelected || isAlreadyReturned}
                                            disabled={isAlreadyReturned}
                                            onChange={() => !isAlreadyReturned && handleToggleItem(item.packId)}
                                        />
                                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-[#FDFDFD] p-1">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-footerBg text-sm leading-tight max-w-[200px]">{item.name}</p>
                                                {isAlreadyReturned && (
                                                    <span className="text-[9px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Returned</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {item.qty} × ₹{item.price}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Choose Resolution */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <h3 className="font-bold text-footerBg mb-6 flex items-center gap-2">
                            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                            WHAT DO YOU WANT TO DO?
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div
                                onClick={() => setReturnType('refund')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${returnType === 'refund' ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity ${returnType === 'refund' ? 'opacity-100' : 'opacity-0'}`} />
                                <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${returnType === 'refund' ? 'bg-primary text-white scale-110' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                    <CheckCircle size={24} />
                                </div>
                                <p className="font-black text-footerBg text-base uppercase tracking-tight">Refund</p>
                                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">Get 100% money back to your original payment method.</p>
                                {returnType === 'refund' && <div className="absolute top-4 right-4 text-primary"><CheckCircle size={16} fill="currentColor" /></div>}
                            </div>

                            <div
                                onClick={() => setReturnType('replace')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${returnType === 'replace' ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity ${returnType === 'replace' ? 'opacity-100' : 'opacity-0'}`} />
                                <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${returnType === 'replace' ? 'bg-primary text-white scale-110' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                    <RefreshCw size={24} />
                                </div>
                                <p className="font-black text-footerBg text-base uppercase tracking-tight">Replacement</p>
                                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">Exchange item for a new one or change the pack size.</p>
                                {returnType === 'replace' && <div className="absolute top-4 right-4 text-primary"><CheckCircle size={16} fill="currentColor" /></div>}
                            </div>
                        </div>

                        {/* Replacement Options (Size selector + Method) */}
                        {returnType === 'replace' && selectedItems.length > 0 && variants.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 pt-8 border-t border-gray-100 space-y-8"
                            >
                                {/* Variant Selection */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Replacement Variant</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {variants.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => setReplacementVariantId(v.id)}
                                                className={`px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-center min-w-[120px] ${replacementVariantId === v.id ? 'border-primary bg-primary/5 ring-2 ring-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                            >
                                                <div className={`text-sm font-black ${replacementVariantId === v.id ? 'text-primary' : 'text-footerBg'}`}>{v.weight}</div>
                                                <div className="text-[10px] text-gray-500 font-bold mt-1">₹{v.price}</div>
                                                {v.id !== currentItemData.id && (
                                                    <div className={`text-[9px] font-bold mt-1 ${v.price > currentItemData.price ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {v.price > currentItemData.price ? `+₹${v.price - currentItemData.price}` : `-₹${currentItemData.price - v.price}`}
                                                    </div>
                                                )}
                                                {v.id === currentItemData.id && (
                                                    <div className="text-[9px] text-gray-400 font-bold mt-1">(Same Item)</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {priceDiff !== 0 && (
                                        <p className="mt-3 text-[10px] font-bold text-gray-500 text-left">
                                            * {priceDiff > 0 ? `You will need to pay ₹${priceDiff} extra.` : `₹${Math.abs(priceDiff)} will be refunded to your balance.`}
                                        </p>
                                    )}
                                </div>

                                {/* Method Selection */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Exchange Method</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${replacementMethod === 'reverse' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input type="radio" checked={replacementMethod === 'reverse'} onChange={() => setReplacementMethod('reverse')} className="accent-primary w-4 h-4" />
                                            <div>
                                                <p className="text-sm font-bold text-footerBg uppercase tracking-tight">Standard Exchange</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Old item picked up first (7 days)</p>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${replacementMethod === 'advance' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input type="radio" checked={replacementMethod === 'advance'} onChange={() => setReplacementMethod('advance')} className="accent-primary w-4 h-4" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-footerBg uppercase tracking-tight">Advance Exchange</p>
                                                    <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded">FAST</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">New item delivered immediately (2 days)</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Step 3: Reason & Photos */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <h3 className="font-bold text-footerBg mb-4 flex items-center gap-2">
                            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                            REASON & EVIDENCE
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Reason for Resolution</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-bold text-footerBg appearance-none"
                                    >
                                        <option value="">Select a reason</option>
                                        {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <RefreshCw size={14} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Additional Comments</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                    placeholder="Please describe the issue in detail..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Upload Photos (Optional)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500">Click to select images from local</p>
                                </div>

                                {selectedImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {selectedImages.map((src, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(idx);
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <AlertCircle size={14} className="rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
                        <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                            <strong>Note:</strong> Items must be in original condition with tags and packaging intact.
                            Pickup will be scheduled within 24-48 hours after approval.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-footerBg text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                            {!loading && <CheckCircle size={18} />}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ReturnRequestPage;
