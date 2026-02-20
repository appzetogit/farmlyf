import React, { useState, useEffect } from 'react';
import {
    Save,
    User,
    Eye,
    EyeOff,
    CheckCircle,
    Shield,
    Send,
    Lock,
    Edit,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

const AdminProfilePage = () => {
    const { user, getAuthHeaders } = useAuth();
    const API_URL = API_BASE_URL;

    const [showPassword, setShowPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ password: passwordData.newPassword }),
                credentials: 'include'
            });

            if (response.ok) {
                toast.success("Password updated successfully!");
                setIsChangingPassword(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Update password error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">My Profile</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage your personal information</p>
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        <Edit size={14} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Profile Header */}
                    <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                        <div className="relative group">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                                <User size={24} className="text-gray-300" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{formData.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Super Administrator</span>
                                <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle size={8} /> Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields - Compact Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all ${isEditing ? 'bg-gray-50 focus:ring-1 focus:ring-black/5' : 'bg-transparent pl-0'}`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all ${isEditing ? 'bg-gray-50 focus:ring-1 focus:ring-black/5' : 'bg-transparent pl-0'}`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all ${isEditing ? 'bg-gray-50 focus:ring-1 focus:ring-black/5' : 'bg-transparent pl-0'}`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                            <input
                                type="text"
                                value="Super Admin"
                                disabled
                                className="w-full bg-transparent pl-0 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-400 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    {/* Password Section - Toggle */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={14} /> Security
                            </h4>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-[10px] font-bold text-black uppercase tracking-widest hover:underline"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {isChangingPassword && (
                            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                name="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:border-black transition-all outline-none pr-10"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm new password"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:border-black transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setIsChangingPassword(false)}
                                        className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={isSaving}
                                        className="bg-black text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
