import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiUrl';
import { useSetting, useUpdateSetting } from '../../../hooks/useSettings';
import {
    Send,
    Save,
    User,
    Bell,
    Globe,
    Mail,
    Phone,
    Eye,
    EyeOff,
    CheckCircle,
    Shield,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = API_BASE_URL;

const SettingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [showPassword, setShowPassword] = useState(false);
    const [pushMessage, setPushMessage] = useState({
        heading: '',
        message: '',
        target: 'all'
    });
    const [checkoutFees, setCheckoutFees] = useState({
        paymentHandlingFee: 0,
        platformFee: 0,
        handlingFee: 0
    });
    const [invoiceSettings, setInvoiceSettings] = useState({
        sellerName: '',
        sellerAddress: '',
        companyOfficeAddress: '',
        gstNumber: '',
        panNumber: '',
        fssai: ''
    });

    const { data: checkoutFeeConfigSetting } = useSetting('checkout_fee_config');
    const { data: invoiceSettingsData } = useSetting('invoice_settings');
    const updateSettingMutation = useUpdateSetting();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);

    useEffect(() => {
        const value = checkoutFeeConfigSetting?.value;
        if (!value || typeof value !== 'object' || Array.isArray(value)) return;
        setCheckoutFees({
            paymentHandlingFee: Number(value.paymentHandlingFee || 0),
            platformFee: Number(value.platformFee || 0),
            handlingFee: Number(value.handlingFee || 0)
        });
    }, [checkoutFeeConfigSetting]);

    useEffect(() => {
        const value = invoiceSettingsData?.value;
        if (!value || typeof value !== 'object' || Array.isArray(value)) return;
        setInvoiceSettings({
            sellerName: value.sellerName || '',
            sellerAddress: value.sellerAddress || '',
            companyOfficeAddress: value.companyOfficeAddress || '',
            gstNumber: value.gstNumber || '',
            panNumber: value.panNumber || '',
            fssai: value.fssai || ''
        });
    }, [invoiceSettingsData]);

    const handleSave = async () => {
        toast.success("Settings preferences saved! (Simulated)");
    };

    const handleSendPush = () => {
        if (!pushMessage.heading || !pushMessage.message) {
            toast.error('Please enter both heading and message');
            return;
        }
        toast.success('Push message queued (simulated)');
    };

    const handleFeeInputChange = (field, value) => {
        const numeric = Number(value);
        setCheckoutFees((prev) => ({
            ...prev,
            [field]: Number.isFinite(numeric) && numeric >= 0 ? numeric : 0
        }));
    };

    const handleSaveCheckoutFees = async () => {
        try {
            await updateSettingMutation.mutateAsync({
                key: 'checkout_fee_config',
                value: checkoutFees
            });
            toast.success("Checkout fees saved successfully!");
        } catch (error) {
            // Error toast already handled in hook
        }
    };

    const handleSaveInvoiceSettings = async () => {
        try {
            await updateSettingMutation.mutateAsync({
                key: 'invoice_settings',
                value: invoiceSettings
            });
            toast.success("Invoice settings saved successfully!");
        } catch (error) {
            // Error toast already handled in hook
        }
    };
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Settings</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage your dashboard preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px] relative overflow-hidden">
                
                {/* Tab Bar Internal Navigation (Optional but helpful for UI) */}
                <div className="flex items-center gap-6 border-b border-gray-100 mb-8 pb-4">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'general', label: 'Store General', icon: Globe },
                        { id: 'invoice', label: 'Invoice Settings', icon: FileText },
                        { id: 'notifications', label: 'Notifications', icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSearchParams({ tab: tab.id });
                            }}
                            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all pb-4 -mb-4 border-b-2 ${
                                activeTab === tab.id 
                                ? 'border-black text-black' 
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-gray-100">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                    <User size={40} className="text-gray-300" />
                                </div>
                                <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <Send size={12} className="rotate-0" />
                                </button>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Admin User</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Super Administrator</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle size={10} /> Active
                                    </span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <Shield size={10} /> Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" defaultValue="Admin User" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input type="email" defaultValue="admin@farmlyf.com" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                <input type="text" defaultValue="Super Admin" disabled className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-400 cursor-not-allowed outline-none" />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-8 border-t border-gray-100 space-y-6">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Security</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all outline-none pr-12"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Push Notifications</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Engage with your mobile users</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                            <h4 className="flex items-center gap-2 text-black font-black uppercase tracking-wider mb-6 pb-4 border-b border-gray-100">
                                <Send size={18} /> Compose New Message
                            </h4>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Flash Sale is Live! 🔥"
                                        value={pushMessage.heading}
                                        onChange={(e) => setPushMessage({ ...pushMessage, heading: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. Get 50% OFF on all items valid for next 2 hours only."
                                        value={pushMessage.message}
                                        onChange={(e) => setPushMessage({ ...pushMessage, message: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-black transition-all shadow-sm resize-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Audience</label>
                                    <select
                                        value={pushMessage.target}
                                        onChange={(e) => setPushMessage({ ...pushMessage, target: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="all">Send to All Users</option>
                                        <option value="active">Active Users (Last 30 Days)</option>
                                        <option value="cart">Users with Abandoned Cart</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSendPush}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 mt-4"
                                >
                                    <Send size={16} /> Send Blast
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">History</h4>
                            {[
                                { t: 'Big Savings on Almonds', m: 'Check out our refined selection...', d: '2 hours ago', s: 'Sent' },
                                { t: 'Welcome Gift Inside 🎁', m: 'Open to redeem your code...', d: 'Yesterday', s: 'Sent' },
                            ].map((n, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{n.t}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[200px]">{n.m}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">{n.s}</span>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase">{n.d}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Store General</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Platform Identity & Configuration</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                                <input type="text" defaultValue="FarmLyf Dryfruits" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                                <input type="email" defaultValue="admin@farmlyf.com" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none">
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none">
                                    <option>Asia/Kolkata (GMT +5:30)</option>
                                    <option>UTC</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <div className="mb-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Checkout Fees</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Used in checkout price details breakdown</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Handling Fee</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={checkoutFees.paymentHandlingFee}
                                        onChange={(e) => handleFeeInputChange('paymentHandlingFee', e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Fee</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={checkoutFees.platformFee}
                                        onChange={(e) => handleFeeInputChange('platformFee', e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Handling Fee</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={checkoutFees.handlingFee}
                                        onChange={(e) => handleFeeInputChange('handlingFee', e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveCheckoutFees}
                                disabled={updateSettingMutation.isPending}
                                className="mt-5 bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                            >
                                {updateSettingMutation.isPending ? 'Saving...' : 'Save Checkout Fees'}
                            </button>
                        </div>
                    </div>
                )}

                {/* INVOICE TAB */}
                {activeTab === 'invoice' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Invoice Configuration</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Setup your billing & seller details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seller Name</label>
                                <input 
                                    type="text" 
                                    value={invoiceSettings.sellerName}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, sellerName: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                                    placeholder="FarmLyf Dryfruits"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GSTIN Number</label>
                                <input 
                                    type="text" 
                                    value={invoiceSettings.gstNumber}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, gstNumber: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                                    placeholder="24AAAAA0000A1Z5"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Number</label>
                                <input 
                                    type="text" 
                                    value={invoiceSettings.panNumber}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, panNumber: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">FSSAI Number</label>
                                <input 
                                    type="text" 
                                    value={invoiceSettings.fssai}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, fssai: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                                    placeholder="12345678901234"
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seller Address (for Label)</label>
                                <textarea 
                                    rows="2"
                                    value={invoiceSettings.sellerAddress}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, sellerAddress: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none" 
                                    placeholder="123, Green Park, Delhi - 110016"
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Registered/Office Address (for Invoice)</label>
                                <textarea 
                                    rows="2"
                                    value={invoiceSettings.companyOfficeAddress}
                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyOfficeAddress: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none" 
                                    placeholder="FarmLyf PVT LTD, Corporate House, Mumbai - 400001"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleSaveInvoiceSettings}
                                disabled={updateSettingMutation.isPending}
                                className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-60 text-xs flex items-center gap-2"
                            >
                                {updateSettingMutation.isPending ? 'Saving...' : <><Save size={16} /> Save Invoice Settings</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default SettingsPage;
