
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';


const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <div className="bg-[#fcfcfc] min-h-[70vh] flex items-center justify-center py-6 md:py-10 p-3 md:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm w-full bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl overflow-hidden border border-gray-50 text-center p-5 md:p-6"
            >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-emerald-500">
                    <CheckCircle size={28} md:size={32} strokeWidth={3} />
                </div>

                <h1 className="text-lg md:text-xl font-black text-footerBg mb-1.5 md:mb-2 uppercase tracking-tight">Success!</h1>
                <p className="text-[11px] md:text-xs text-gray-400 font-medium leading-relaxed mb-4 md:mb-6 px-2 md:px-6">
                    Your order is confirmed and will be processed shortly.
                </p>

                <div className="bg-gray-50/50 rounded-lg md:rounded-xl p-2.5 md:p-3 mb-4 md:mb-6 border border-gray-100 flex flex-col items-center">
                    <span className="text-[9px] md:text-[10px] text-gray-300 uppercase font-black tracking-widest mb-0.5 md:mb-1">Order Identifier</span>
                    <span className="text-sm md:text-base font-mono font-black text-primary tracking-tighter md:tracking-normal">{orderId}</span>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <Link
                        to={`/order/${orderId}`}
                        className="w-full bg-footerBg text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                        <Package size={14} />
                        Track Order
                    </Link>

                    <Link
                        to="/"
                        className="w-full bg-white text-footerBg border border-gray-100 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Home size={14} />
                        Continue Shopping
                    </Link>
                </div>

                <p className="mt-5 md:mt-7 text-[9px] md:text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                    Thank you for choosing FarmLyf
                </p>
            </motion.div>
        </div>
    );
};

export default OrderSuccessPage;
