import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../../assets/logo.png';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await login(email, password);
            if (res.success) {
                // Double check if the logged in user is actually an admin
                // Note: AuthContext should ideally handle this storage update before returning
                const user = JSON.parse(localStorage.getItem('farmlyf_current_user'));
                if (user && user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    setError('Unauthorized Access: Administrative credentials required.');
                    setIsSubmitting(false);
                }
            } else {
                setError(res.message || 'Invalid administrative credentials');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError(err.message || 'Login failed');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-footerBg flex items-center justify-center p-6 text-left selection:bg-primary selection:text-white">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Branding */}
                {/* Branding */}
                <div className="flex flex-col items-center justify-center mb-6 text-center">
                    <img src={logo} alt="FarmLyf" className="h-12 w-auto mb-4" />
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">
                        Admin <span className="text-primary">Portal</span>
                    </h1>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl shadow-black/40">
                    <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Verify Identity</h2>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@farmlyf.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Authorizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Initialize Access</span>
                                        <ArrowRight size={16} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>


            </motion.div>
        </div>
    );
};

export default LoginPage;
