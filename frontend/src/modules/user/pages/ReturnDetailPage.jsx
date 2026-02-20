
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, RefreshCw, CheckCircle, Clock, Truck, XCircle, AlertCircle, Search, Package, ShoppingBag } from 'lucide-react';
import { useReturns } from '../../../hooks/useOrders';
import { useProducts } from '../../../hooks/useProducts';

const ReturnDetailPage = () => {
    const { returnId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { data: returns = [] } = useReturns(user?.id);
    const { data: products = [] } = useProducts();
    
    // Helper used in render
    const getVariantById = (variantId) => {
         for(let p of products) {
            const v = p.variants?.find(v => v.id === variantId);
            if(v) return { ...v, product: p };
        }
        return null;
    };

    const [returnRequest, setReturnRequest] = React.useState(null);

    React.useEffect(() => {
        if (returns.length > 0 && returnId) {
            const found = returns.find(r => r.id === returnId);
            setReturnRequest(found);
        }
    }, [returns, returnId]);

    if (!returnRequest) {
        return <div className="min-h-screen flex items-center justify-center">Return request not found</div>;
    }

    const isReplace = returnRequest.type === 'replace';

    const refundSteps = [
        { status: 'Pending', label: 'Requested', icon: Clock },
        { status: 'Approved', label: 'Approved', icon: CheckCircle },
        { status: 'Picked Up', label: 'Picked Up', icon: Truck },
        { status: 'Refunded', label: 'Refunded', icon: RefreshCw }
    ];

    const replaceSteps = [
        { status: 'Pending', label: 'Requested', icon: Clock },
        { status: 'Approved', label: 'Approved', icon: CheckCircle },
        { status: 'Picked Up', label: 'Picked Up', icon: Truck },
        { status: 'Quality Check', label: 'QC Check', icon: Search },
        { status: 'Dispatched', label: 'Dispatched', icon: Package },
        { status: 'Delivered', label: 'Delivered', icon: ShoppingBag }
    ];

    const steps = isReplace ? replaceSteps : refundSteps;
    const currentStepIndex = steps.findIndex(s => s.status === returnRequest.status);
    const isRejected = returnRequest.status === 'Rejected';
    const isCompleted = isReplace
        ? returnRequest.status === 'Delivered'
        : returnRequest.status === 'Refunded';

    const replacementVariant = isReplace && returnRequest.replacementVariantId
        ? getVariantById(returnRequest.replacementVariantId)
        : null;

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12 max-w-4xl">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate('/returns')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">
                            {isReplace ? 'Replacement Status' : 'Return Status'}
                        </h1>
                        <p className="text-[10px] md:text-sm font-mono text-slate-400 mt-1">#{returnRequest.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Status Timeline Section */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Request Timeline</h3>

                            {isRejected ? (
                                <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-700 border border-red-100">
                                    <XCircle size={20} />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">Request Rejected</p>
                                        <p className="text-[11px] font-medium opacity-80">Please contact support for details.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative px-2">
                                    {steps.map((step, index) => {
                                        const isActive = index <= currentStepIndex;
                                        const isStepCompleted = index < currentStepIndex || (index === currentStepIndex && isCompleted);
                                        const isCurrent = index === currentStepIndex;
                                        const Icon = step.icon;

                                        return (
                                            <div key={index} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative min-h-[64px] md:min-h-0">
                                                {/* Vertical Connector Line (Mobile) */}
                                                {index < steps.length - 1 && (
                                                    <div className="md:hidden absolute top-[40px] left-[20px] w-0.5 h-[calc(100%-16px)] bg-gray-100 z-0">
                                                        <div className={`w-full bg-primary transition-all duration-500 ${index < currentStepIndex ? 'h-full' : 'h-0'}`} />
                                                    </div>
                                                )}

                                                {/* Horizontal Connector Line (Desktop) */}
                                                {index < steps.length - 1 && (
                                                    <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-gray-100">
                                                        <div className={`h-full bg-primary transition-all duration-500 ${index < currentStepIndex ? 'w-full' : 'w-0'}`} />
                                                    </div>
                                                )}

                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all relative z-10 shrink-0
                                                    ${isStepCompleted ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white'}
                                                    ${isCurrent && !isStepCompleted ? 'border-primary text-primary bg-primary/5 shadow-lg shadow-primary/10' : ''}
                                                    ${!isActive ? 'border-gray-50 text-gray-300' : ''}
                                                `}>
                                                    <Icon size={isCurrent ? 20 : 18} strokeWidth={isCurrent ? 3 : 2} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest leading-none md:text-center
                                                        ${isActive ? 'text-footerBg' : 'text-slate-300'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-[9px] font-bold text-primary mt-1 md:text-center">Active Now</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Items Section (Compact) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Item(s)</h3>
                                <div className="text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-primary/10">
                                    ₹{returnRequest.refundAmount}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {returnRequest.items.map((item, i) => (
                                    <div key={i} className="p-4 flex gap-4 items-center">
                                        <div className="relative shrink-0">
                                            <div className="w-14 h-14 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-center p-1">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-footerBg text-white text-[9px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                                                {item.qty}
                                            </span>
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

                    {/* Request Details Sidebar */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isReplace ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isReplace ? 'Replacement' : 'Refund'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Reason</p>
                                    <p className="text-sm font-black text-footerBg leading-snug">{returnRequest.reason}</p>
                                </div>

                                {returnRequest.comments && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Comments</p>
                                        <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed border-l-2 border-slate-100 pl-3">
                                            "{returnRequest.comments}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Replacement Choice (if applicable) */}
                            {isReplace && replacementVariant && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Replacement Item</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-primary/10 p-1 flex items-center justify-center shrink-0">
                                            <img src={replacementVariant.product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-footerBg truncate">{replacementVariant.product.name}</p>
                                            <p className="text-[10px] font-bold text-primary">{replacementVariant.weight}</p>
                                        </div>
                                    </div>
                                    {returnRequest.priceDifference !== 0 && (
                                        <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500">Difference</span>
                                            <span className={`font-black ${returnRequest.priceDifference > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {returnRequest.priceDifference > 0 ? `+₹${returnRequest.priceDifference}` : `-₹${Math.abs(returnRequest.priceDifference)}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-5 border-t border-gray-50 flex items-center gap-3 bg-blue-50/50 p-4 -m-5 mt-5">
                                <AlertCircle size={16} className="text-blue-600 shrink-0" />
                                <p className="text-[10px] font-bold text-blue-700 leading-snug">
                                    Keep tags and packaging intact. Our executive will call before pickup.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnDetailPage;
