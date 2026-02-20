import React from 'react';
import { X, Tag, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CouponsModal = ({ isOpen, onClose, coupons, onApply }) => {
    const [copiedCode, setCopiedCode] = React.useState('');

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10020] flex items-start justify-center p-4 pt-24 md:pt-28 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-9rem)] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-footerBg p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Tag size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Available Coupons</h2>
                                <p className="text-sm opacity-90 mt-1">Choose a coupon to save more!</p>
                            </div>
                        </div>
                    </div>

                    {/* Coupons List */}
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
                        {coupons.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tag size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No coupons available right now</p>
                            </div>
                        ) : (
                            coupons.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className="border-2 border-dashed border-primary/30 rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* Coupon Code */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="bg-primary text-white px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider">
                                                    {coupon.code}
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Copy code"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <Check size={14} className="text-emerald-600" />
                                                    ) : (
                                                        <Copy size={14} className="text-gray-400" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm font-bold text-footerBg mb-2">
                                                {coupon.description}
                                            </p>

                                            {/* Details */}
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-medium">
                                                <span>Min order: ₹{coupon.minOrderValue}</span>
                                                {coupon.maxDiscount && <span>Max discount: ₹{coupon.maxDiscount}</span>}
                                                {coupon.applicableCategories?.length > 0 && (
                                                    <span className="text-primary font-bold">
                                                        Only on {coupon.applicableCategories.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Apply Button */}
                                        <button
                                            onClick={() => {
                                                onApply(coupon.code);
                                                onClose();
                                            }}
                                            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm whitespace-nowrap"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CouponsModal;
