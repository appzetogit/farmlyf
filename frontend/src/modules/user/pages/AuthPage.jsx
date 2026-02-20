import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Leaf, Tag, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import authShowcaseImg from '../../../assets/auth_showcase.jpg';

const AuthPage = () => {
    const { sendOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const queryParams = new URLSearchParams(location.search);
    const redirect = queryParams.get('redirect');

    const handleChange = (e) => {
        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        setError('');

        const res = await sendOtp(phone);
        setIsLoading(false);

        if (res.success) {
            navigate('/otp-verification', { state: { contact: phone, redirect } });
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 font-['Inter']">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop')",
                    filter: "blur(12px) brightness(0.5)",
                    transform: "scale(1.1)"
                }}
            />
            {/* Dark Overlay for contrast */}
            <div className="absolute inset-0 bg-black/30 z-0" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-medium backdrop-blur-md bg-black/20 px-4 py-2 rounded-full hover:bg-black/30"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[900px] h-auto md:h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
            >
                {/* Left Side - Image & Branding (Hidden on mobile) */}
                <div className="hidden md:flex w-1/2 bg-gray-100 relative items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${authShowcaseImg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 p-10 text-white text-center">
                        <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                            <Leaf size={40} className="text-[#4ade80]" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-bold font-['Poppins'] mb-3">Pure Goodness</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Experience the finest selection of organic dry fruits, delivered straight from the farm to your doorstep.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="text-center md:text-left mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
                            Welcome to Farmlyf
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Enter your mobile number to get started.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 bg-red-50 text-red-600 text-xs font-medium py-3 px-4 rounded-lg border border-red-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Mobile Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-sm">+91</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={phone}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-20 pr-4 text-sm font-bold text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
                                    placeholder="Enter 10 digit number"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2c5336] text-white font-bold text-sm py-3.5 rounded-lg hover:bg-[#1f3b26] transition-all shadow-md active:translate-y-0.5 mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Sending...' : 'Get OTP'}
                        </button>
                    </form>

                    <div className="mt-auto pt-6 text-center">
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            By continuing, you agree to our <Link to="/terms-conditions" className="text-gray-600 font-bold hover:text-primary transition-colors">Terms of Service</Link> and <Link to="/privacy-policy" className="text-gray-600 font-bold hover:text-primary transition-colors">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </motion.div >
        </div >
    );
};

export default AuthPage;
