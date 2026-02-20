import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronRight, Package, RefreshCw, Heart, Ticket, User, MapPin, Bookmark, Headphones, Mail, Share2, CreditCard, Plus, Home, Edit3, Trash2, Check, Lock, LogOut, Copy, Percent, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Context & Stores
import { useAuth } from '../../../context/AuthContext';

// Hooks
import { useUserProfile, useUpdateProfile } from '../../../hooks/useUser';
import { useActiveCoupons } from '../../../hooks/useCoupons';


const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, logout } = useAuth();
    const { data: userData, isLoading: profileLoading, isError: profileError } = useUserProfile();
    const updateProfileMutation = useUpdateProfile();
    const { data: activeCoupons = [], isLoading: couponsLoading } = useActiveCoupons();
    const { tab } = useParams();
    const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1) : 'Overview';
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        birthDate: '',
        accountType: 'Individual',
        gstNumber: ''
    });
    const profileSeedRef = useRef('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [addressForm, setAddressForm] = useState({
        type: 'Home',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Check for auth and redirect if needed
    useEffect(() => {
        if (!authLoading && !user) {
            const isLoggingOut = sessionStorage.getItem('farmlyf_logout_pending');
            if (isLoggingOut) {
                // Clear the flag and redirect silently
                sessionStorage.removeItem('farmlyf_logout_pending');
                navigate('/login', { state: { from: '/profile' } });
                return;
            }
            navigate('/login', { state: { from: '/profile' } });
            toast.error('Please login to view your profile');
        }
    }, [authLoading, user, navigate]);


    useEffect(() => {
        if (!userData) return;
        const nextSeed = [
            userData._id || userData.id || '',
            userData.updatedAt || '',
            userData.name || '',
            userData.email || '',
            userData.phone || '',
            userData.gender || '',
            userData.birthDate || '',
            userData.accountType || '',
            userData.gstNumber || ''
        ].join('|');
        if (profileSeedRef.current === nextSeed) return;
        profileSeedRef.current = nextSeed;
        setEditForm({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || 'Male',
            birthDate: userData.birthDate || '',
            accountType: userData.accountType || 'Individual',
            gstNumber: userData.gstNumber || ''
        });
    }, [userData]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfileMutation.mutateAsync({
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                birthDate: editForm.birthDate,
                accountType: editForm.accountType,
                gstNumber: editForm.gstNumber
            });
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
            setIsEditing(false);
        } catch (err) {
            console.error('Update profile error:', err);
        }
    };

    const handleAddAddress = () => {
        setAddressToEdit(null);
        setAddressForm({
            type: 'Home',
            fullName: userData?.name || '',
            phone: userData?.phone || '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: (userData?.addresses || []).length === 0
        });
        setShowAddressForm(true);
    };

    const handleEditAddress = (addr) => {
        setAddressToEdit(addr);
        setAddressForm(addr);
        setShowAddressForm(true);
    };

    const handleSaveAddress = async (e) => {
        if (e) e.preventDefault();
        
        let updatedAddresses = [...(userData?.addresses || [])];

        if (addressForm.isDefault) {
            updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
        }

        if (addressToEdit) {
            updatedAddresses = updatedAddresses.map(a => a.id === addressToEdit.id ? { ...addressForm } : a);
        } else {
            const newAddress = { ...addressForm, id: Date.now() };
            updatedAddresses.push(newAddress);
        }

        try {
            await updateProfileMutation.mutateAsync({ addresses: updatedAddresses });
            setShowAddressForm(false);
        } catch (error) {
            console.error('Save address error:', error);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        const updatedAddresses = (userData?.addresses || []).filter(a => a.id !== id);

        if (updatedAddresses.length > 0 && !updatedAddresses.find(a => a.isDefault)) {
            updatedAddresses[0].isDefault = true;
        }

        try {
            await updateProfileMutation.mutateAsync({ addresses: updatedAddresses });
        } catch (error) {
            console.error('Delete address error:', error);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!API_KEY) {
            toast.error('Google Maps API Key missing. Please add it to your environment.');
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
                    );
                    const data = await response.json();

                    if (data.status === 'OK') {
                        const result = data.results[0];
                        const components = result.address_components;

                        const getComponent = (type) =>
                            components.find((c) => c.types.includes(type))?.long_name || '';

                        const city = getComponent('locality') || getComponent('administrative_area_level_2');
                        const state = getComponent('administrative_area_level_1');
                        const pincode = getComponent('postal_code');
                        const address = result.formatted_address;

                        setAddressForm((prev) => ({
                            ...prev,
                            address: address || prev.address,
                            city: city || prev.city,
                            state: state || prev.state,
                            pincode: pincode || prev.pincode,
                        }));
                        toast.success('Location detected and address filled!');
                    } else {
                        toast.error('Failed to get address details');
                    }
                } catch (err) {
                    console.error('Location detection error:', err);
                    toast.error('Error fetching location details');
                } finally {
                    setDetectingLocation(false);
                }
            },
            () => {
                toast.error('Location permission denied');
                setDetectingLocation(false);
            }
        );
    };

    const renderDashboard = () => {

        // Mobile View Items
        const shoppingItems = [
            { id: 'orders', label: 'Order History', icon: Package, desc: 'Track shipments and reorder', action: () => navigate('/orders') },
            { id: 'returns', label: 'Returns', icon: RefreshCw, desc: 'Refunds and exchanges', action: () => navigate('/returns') },
            { id: 'wishlist', label: 'Wishlist', icon: Heart, desc: 'Manage your favorite items', action: () => navigate('/wishlist') },
            { id: 'coupons', label: 'Coupons', icon: Ticket, desc: 'Discover extra discounts', action: () => navigate('/profile/coupons') },
        ];

        const accountItems = [
            { id: 'settings', label: 'Settings', icon: User, desc: 'Update profile and security', action: () => { setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
            { id: 'addresses', label: 'Addresses', icon: MapPin, desc: 'Manage shipping locations', action: () => navigate('/profile/addresses') },
        ];

        // Desktop View Items
        const desktopItems = [
            { id: 'orders', label: 'Orders', icon: Package, desc: 'Check your orders status and history here', action: () => navigate('/orders') },
            { id: 'returns', label: 'Returns', icon: RefreshCw, desc: 'Manage refunds and exchanges requests', action: () => navigate('/returns') },
            { id: 'coupons', label: 'Coupons', icon: Ticket, desc: 'Explore great coupon deals to get extra discounts', action: () => navigate('/profile/coupons') },
            { id: 'settings', label: 'Profile Settings', icon: User, desc: 'Update your password, profile details and more', action: () => { setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
            { id: 'addresses', label: 'Addresses', icon: Home, desc: 'Add, edit, or manage your address easily', action: () => navigate('/profile/addresses') },
            { id: 'wishlist', label: 'Wishlist', icon: Heart, desc: 'Shop your specially saved items from here', action: () => navigate('/wishlist') }
        ];

        return (
            <div className="w-full max-w-7xl p-4 md:p-10">
                {/* MOBILE VIEW: List Layout */}
                <div className="md:hidden space-y-6">
                    {/* Group 1 */}
                    <div>
                        <h4 className="text-[9px] font-bold text-primary uppercase tracking-[0.25em] mb-3 px-2 flex items-center gap-2">
                            <span className="w-3 h-[1px] bg-primary"></span>
                            Shopping & Rewards
                        </h4>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {shoppingItems.map((item, idx) => (
                                <button key={idx} onClick={item.action} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all border-b last:border-0 border-gray-50 group text-left">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                        <div className="min-w-0">
                                            <h5 className="font-semibold text-footerBg text-xs truncate">{item.label}</h5>
                                            <p className="text-[9px] text-slate-400 font-medium truncate">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-all shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Group 2 */}
                    <div>
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3 px-2 flex items-center gap-2">
                            <span className="w-3 h-[1px] bg-slate-200"></span>
                            Account & Support
                        </h4>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {accountItems.map((item, idx) => (
                                <button key={idx} onClick={item.action} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all border-b last:border-0 border-gray-50 group text-left">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                        <div className="min-w-0">
                                            <h5 className="font-semibold text-footerBg text-xs truncate">{item.label}</h5>
                                            <p className="text-[9px] text-slate-400 font-medium truncate">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-all shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DESKTOP VIEW: Grid Layout */}
                <div className="hidden md:block">
                    <div className="mb-10 flex items-center gap-5">
                        <div>
                            <h1 className="text-2xl font-bold text-footerBg tracking-tight">Dashboard Overview</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Manage your account and view orders</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {desktopItems.map((item, idx) => (
                            <button
                                key={item.id || idx}
                                onClick={item.action}
                                className="flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left h-full"
                            >
                                <div className="flex items-center gap-4 mb-2 w-full">
                                    <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <item.icon size={42} strokeWidth={1.5} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-footerBg group-hover:text-green-600 transition-colors">{item.label}</h3>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-1">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };







    const renderCoupons = () => {
        const coupons = activeCoupons; // getActiveCoupons();
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 md:p-10 min-h-[600px]"
            >
                <div className="mb-10 flex items-center gap-5">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2.5 bg-slate-50 text-footerBg rounded-xl hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-footerBg tracking-tight uppercase">Available Coupons</h2>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Discover extra discounts and festive offers</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div />
                    <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Available Offers
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                    {couponsLoading ? (
                        <div className="col-span-full py-16 text-center">
                            <RefreshCw className="animate-spin mx-auto text-primary mb-3" size={32} />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Coupons...</p>
                        </div>
                    ) : coupons.length > 0 ? coupons.map(coupon => (
                        <div key={coupon.id} className="relative group bg-primary/[0.03] border border-primary/20 rounded-[16px] md:rounded-[24px] p-2.5 md:p-4 hover:border-primary hover:bg-primary/[0.06] transition-all shadow-sm">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <Percent size={11} className="md:w-[14px] md:h-[14px]" />
                                </div>
                                <span className="text-[7px] md:text-[8px] font-black md:font-bold text-primary uppercase tracking-tighter md:tracking-widest bg-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg border border-primary/10 shadow-sm leading-none">
                                    {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                </span>
                            </div>

                            <div className="mb-3 md:mb-4">
                                <h4 className="text-[11px] md:text-sm font-black md:font-bold text-footerBg mb-0.5 tracking-tighter md:tracking-tight uppercase leading-none">{coupon.code}</h4>
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-bold md:font-medium leading-tight line-clamp-2 mt-1">
                                    {coupon.description || `Valid over ₹${coupon.minOrderValue}`}
                                </p>
                            </div>

                            <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="w-full bg-footerBg border-0 py-2 rounded-lg md:rounded-xl font-black md:font-bold text-[8px] md:text-[9px] text-white hover:bg-primary transition-all flex items-center justify-center gap-1.5 md:gap-2 uppercase tracking-tighter md:tracking-widest active:scale-95"
                            >
                                <Copy size={10} className="md:w-3 md:h-3" />
                                Copy Code
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-none border border-dashed border-gray-200">
                            <Ticket size={32} className="mx-auto text-gray-200 mb-3" />
                            <h3 className="text-base font-bold text-gray-300">No active coupons right now</h3>
                            <p className="text-[10px] text-gray-400">Keep checking for festive offers and deals!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };




    const renderAddresses = () => {
        const addresses = userData?.addresses || [];

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 md:p-10 min-h-[600px]"
            >
                <div className="mb-8 md:mb-10 flex items-center gap-3 md:gap-5">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 md:p-2.5 bg-slate-50 text-footerBg rounded-lg md:rounded-xl hover:bg-footerBg hover:text-white transition-all group shrink-0"
                    >
                        <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-black text-footerBg tracking-tighter md:tracking-tight uppercase leading-none">Addresses</h2>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 truncate">Manage shipping locations</p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="min-w-0">
                        <h2 className="text-sm md:text-base font-black text-footerBg tracking-tight">Your Locations</h2>
                    </div>
                    {!showAddressForm && (
                        <button
                            onClick={handleAddAddress}
                            className="px-5 py-2.5 md:px-6 md:py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-footerBg hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/10 active:scale-95 shrink-0"
                        >
                            <Plus size={14} />
                            <span className="hidden md:inline">Add New</span>
                            <span className="md:hidden">Add</span>
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {showAddressForm ? (
                        <motion.div
                            key="address-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <h3 className="text-xl font-black text-footerBg">{addressToEdit ? 'Edit Address' : 'Add New Address'}</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={detectingLocation}
                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {detectingLocation ? 'Detecting...' : 'Detect Location'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveAddress}
                                        className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-green-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Check size={14} /> Quick Save
                                    </button>
                                    <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-footerBg font-bold text-sm">Cancel</button>
                                </div>
                            </div>

                            <form onSubmit={handleSaveAddress} className="space-y-6">
                                {/* Address Type Selector */}
                                <div className="flex p-1 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 w-fit mb-6">
                                    {['Home', 'Office', 'Other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setAddressForm({ ...addressForm, type })}
                                            className={`px-5 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${addressForm.type === type ? 'bg-white text-primary shadow-sm border border-primary/10' : 'text-slate-400 hover:text-footerBg'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            required
                                            value={addressForm.fullName}
                                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 font-black text-sm text-footerBg focus:border-primary outline-none transition-all placeholder:font-bold placeholder:text-slate-200"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            required
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 font-black text-sm text-footerBg focus:border-primary outline-none transition-all placeholder:font-bold placeholder:text-slate-200"
                                            placeholder="+91"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Full Address</label>
                                    <textarea
                                        required
                                        value={addressForm.address}
                                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                        rows="2"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 font-black text-sm text-footerBg focus:border-primary outline-none transition-all resize-none placeholder:font-bold placeholder:text-slate-200"
                                        placeholder="Flat No, Building, Street Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">City</label>
                                        <input
                                            required
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 flex md:px-6 py-3 md:py-3.5 font-black text-xs md:text-sm text-footerBg focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">State</label>
                                        <input
                                            required
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-3.5 font-black text-xs md:text-sm text-footerBg focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Pincode</label>
                                        <input
                                            required
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-3.5 font-black text-xs md:text-sm text-footerBg focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary shadow-sm"
                                    />
                                    <label htmlFor="isDefault" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">Set as default address</label>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        className="w-full bg-footerBg text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs md:text-sm hover:bg-primary transition-all shadow-xl shadow-footerBg/10 active:scale-[0.98]"
                                    >
                                        {addressToEdit ? 'Update details' : 'Save location'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="address-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5"
                        >
                            {addresses.length > 0 ? addresses.map(addr => (
                                <div key={addr.id} className={`p-3 md:p-8 rounded-2xl md:rounded-[32px] border ${addr.isDefault ? 'border-primary/30 bg-primary/5' : 'border-gray-100 bg-gray-50/30'} relative group hover:shadow-xl transition-all`}>
                                    <div className="flex justify-between items-start mb-4 md:mb-8">
                                        <div className={`w-8 h-8 md:w-14 md:h-14 ${addr.isDefault ? 'bg-primary text-white' : 'bg-white text-primary'} rounded-lg md:rounded-2xl flex items-center justify-center shadow-sm border border-gray-100`}>
                                            {addr.type === 'Home' ? <Home size={16} /> : <MapPin size={16} />}
                                        </div>
                                        <div className="flex gap-1 md:gap-2">
                                            <button
                                                onClick={() => handleEditAddress(addr)}
                                                className="w-7 h-7 md:w-10 md:h-10 bg-white text-gray-400 rounded-lg border border-gray-100 flex items-center justify-center shadow-sm"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="w-7 h-7 md:w-10 md:h-10 bg-white text-gray-400 rounded-lg border border-gray-100 flex items-center justify-center shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:space-y-5">
                                        <h4 className="text-sm md:text-xl font-bold text-footerBg tracking-tight flex items-center gap-2">
                                            {addr.type}
                                            {addr.isDefault && (
                                                <span className="text-[7px] md:text-[9px] font-bold uppercase bg-primary text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-full">Default</span>
                                            )}
                                        </h4>

                                        <div className="space-y-0.5 md:space-y-1.5 min-h-[40px] md:min-h-0">
                                            <p className="text-[10px] md:text-sm font-bold text-footerBg/80 truncate">{addr.fullName}</p>
                                            <p className="text-[9px] md:text-[11px] font-medium text-slate-400 leading-tight line-clamp-2">
                                                {addr.address}, {addr.city}
                                            </p>
                                        </div>

                                        <div className="pt-2 md:pt-5 border-t border-gray-100 flex items-center gap-1.5 text-primary">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate">{addr.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-none border border-dashed border-gray-200">
                                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-400 font-bold">No saved addresses found</p>
                                    <button onClick={handleAddAddress} className="mt-4 text-primary font-black uppercase tracking-widest text-xs">Add your first address</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };





    const renderSettings = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 md:p-10 min-h-[600px]"
        >
            <div className="mb-10 flex items-center gap-5">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2.5 bg-slate-50 text-footerBg rounded-xl hover:bg-footerBg hover:text-white transition-all group"
                >
                    <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-footerBg tracking-tight uppercase">Account Settings</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Update profile and security details</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div />
                <div className="px-6 py-2 bg-gray-50 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest">
                    Account Security
                </div>
            </div>

            <div className="max-w-xl">
                <h2 className="text-4xl font-black text-footerBg mb-4">Profile Settings</h2>
                <p className="text-gray-400 font-medium mb-12">Update your personal information and keep your account secure.</p>

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Full Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-none px-6 py-4 font-bold text-footerBg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-none px-6 py-4 font-bold text-footerBg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-none px-6 py-4 font-bold text-footerBg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="+91"
                            />
                        </div>


                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
                                <div className="flex bg-gray-50 rounded-none p-1 border border-gray-100">
                                    {['Individual', 'Business'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, accountType: type })}
                                            className={`flex-1 py-3 px-1 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${editForm.accountType === type ? 'bg-footerBg text-white' : 'text-gray-400 hover:text-footerBg'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                    <div className="flex bg-gray-50 rounded-none p-1 border border-gray-100">
                                        {['Male', 'Female', 'Other'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, gender: g })}
                                                className={`flex-1 py-3 px-1 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${editForm.gender === g ? 'bg-footerBg text-white' : 'text-gray-400 hover:text-footerBg'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth (DOB)</label>
                                    <input
                                        type="date"
                                        value={editForm.birthDate}
                                        onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-none px-6 py-3 font-bold text-footerBg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {editForm.accountType === 'Business' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={editForm.gstNumber}
                                        onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value.toUpperCase() })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-none px-6 py-4 font-bold text-footerBg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength={15}
                                    />
                                    <p className="text-[9px] text-gray-400 ml-1">Leave blank if you don't have a GST number</p>
                                </div>
                            )}
                        </div>

                    <div className="pt-4 flex items-center gap-6">
                        <button
                            type="submit"
                            className="bg-footerBg text-white px-10 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-lg shadow-footerBg/10"
                        >
                            Save Changes
                        </button>
                        {updateSuccess && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center gap-2"
                            >
                                <Check size={16} /> Updated Successfully!
                            </motion.span>
                        )}
                    </div>
                </form>

                <div className="mt-16 pt-12 border-t border-gray-100">
                    <h4 className="text-sm font-black text-footerBg uppercase tracking-widest mb-6">Security Settings</h4>
                    <button className="w-full flex items-center justify-between p-6 rounded-none border border-gray-100 bg-gray-50/50 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                <Lock size={20} />
                            </div>
                            <span className="font-bold text-footerBg text-sm">Change Account Password</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>
            </div>
        </motion.div>
    );


    // Handle loading and error states
    if (authLoading || (profileLoading && !!user)) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading profile...</p>
            </div>
        </div>
    );

    if (profileError || (!userData && !profileLoading && !!user)) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <X size={32} />
            </div>
            <h2 className="text-xl font-bold text-footerBg mb-2">Failed to load profile</h2>
            <p className="text-slate-500 text-center mb-6">There was an issue fetching your profile data. Please try again.</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs"
            >
                Retry
            </button>
        </div>
    );

    if (!user) return null; // Redirection handled by useEffect

    return (
        <div className="bg-[#f8fafc] lg:min-h-screen pb-4 md:pb-20 font-['Inter'] flex flex-col">
            <div className="w-full flex-1">
                <div className="flex flex-col lg:flex-row items-stretch lg:min-h-screen">

                    {/* LEFT SIDEBAR - Integrated Profile Info */}
                    <div className="w-full lg:w-[350px] bg-footerBg text-white relative overflow-hidden shrink-0 flex flex-col lg:sticky lg:top-0 h-auto lg:h-screen">
                        {/* Decorative background circle */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                        <div className="relative z-10 flex-1 p-5 md:p-8 overflow-y-auto">
                            {/* Header: Hey Name + Avatar */}
                            <div className="flex justify-between items-start mb-6 md:mb-10">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold font-['Poppins'] tracking-tight">Hey</h3>
                                    <h2 className="text-2xl md:text-3xl font-bold font-['Poppins'] tracking-tight text-white">{userData.name.split(' ')[0]}</h2>
                                </div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-2xl font-bold lowercase">
                                        {userData.name.charAt(0)}
                                    </div>

                                    {/* Desktop Edit Button */}
                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                const fakeEvent = { preventDefault: () => { } };
                                                handleUpdateProfile(fakeEvent);
                                                setIsEditing(false);
                                            } else {
                                                setIsEditing(true);
                                            }
                                        }}
                                        className="hidden lg:flex absolute -top-1 -right-1 w-7 h-7 bg-white text-footerBg rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all"
                                    >
                                        {isEditing ? <Check size={12} className="text-primary" strokeWidth={3} /> : <Edit3 size={12} />}
                                    </button>

                                    {/* Mobile Toggle Icons */}
                                    <button
                                        onClick={() => setShowMobileDetails(!showMobileDetails)}
                                        className="lg:hidden absolute -top-1 -right-1 w-7 h-7 bg-white text-footerBg rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                    >
                                        {showMobileDetails ? <X size={12} /> : <Eye size={12} />}
                                    </button>
                                </div>
                            </div>

                            {/* Details Container - Always visible on Web, Toggled on Mobile */}
                            <div className={`${showMobileDetails ? 'block' : 'hidden lg:block'} space-y-4 md:space-y-6`}>
                                {/* Mobile-only Action Row: Edit/Save buttons when details are open */}
                                <div className="lg:hidden flex items-center justify-end gap-2 mb-2">
                                    {isEditing ? (
                                        <button
                                            onClick={(e) => {
                                                handleUpdateProfile(e);
                                                setIsEditing(false);
                                            }}
                                            className="bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95"
                                        >
                                            <Check size={12} strokeWidth={3} /> Save Change
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95"
                                        >
                                            <Edit3 size={12} /> Edit Details
                                        </button>
                                    )}
                                </div>

                                {/* Info Fields */}
                                <div className="space-y-4 md:space-y-5">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white outline-none focus:border-primary transition-all text-sm"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white/90 text-sm">
                                                {userData.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white outline-none focus:border-primary transition-all text-sm"
                                            />
                                        ) : (
                                            <div className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white/90 truncate text-[13px]">
                                                {userData.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                placeholder="+91"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white outline-none focus:border-primary transition-all text-[13px]"
                                            />
                                        ) : (
                                            <div className={`w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold ${userData.phone ? 'text-white/90' : 'text-white/40'} text-[13px]`}>
                                                {userData.phone || 'Not Linked'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Gender</label>
                                            {isEditing ? (
                                                <div className="flex bg-white/5 rounded-xl md:rounded-2xl p-1 border border-white/10">
                                                    {['Male', 'Female', 'Other'].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setEditForm({ ...editForm, gender: g })}
                                                            className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${editForm.gender === g ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white/90 text-xs">
                                                    {userData.gender || 'N/A'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Date of Birth (DOB)</label>
                                            {isEditing ? (
                                                <div className="relative group">
                                                    <input
                                                        type="date"
                                                        value={editForm.birthDate}
                                                        onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl md:rounded-2xl px-3 md:px-6 py-2.5 md:py-3.5 font-semibold text-white outline-none focus:border-primary transition-all text-[10px]"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-semibold text-white/90 text-xs">
                                                    {userData.birthDate || 'Not Set'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    handleUpdateProfile(e);
                                                    setIsEditing(false);
                                                }}
                                                className="w-full bg-primary text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                                            >
                                                Save Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Footer: Full-width Red Logout (Web Only) */}
                        <button
                            onClick={handleLogout}
                            className="w-full hidden lg:flex items-center bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all group border-0 shrink-0"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-black/10 flex items-center justify-center shrink-0 group-hover:bg-black/20 transition-all border-r border-white/10">
                                <LogOut size={20} />
                            </div>
                            <div className="flex-1 px-4 md:px-6 text-left">
                                <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Logout</p>
                                <p className="text-[9px] md:text-[10px] text-white/60 font-medium">End session</p>
                            </div>
                        </button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 bg-white min-w-0 lg:h-screen lg:overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activeTab === 'Overview' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    {renderDashboard()}
                                </motion.div>
                            )}
                            {activeTab === 'Coupons' && renderCoupons()}

                            {activeTab === 'Addresses' && renderAddresses()}
                            {activeTab === 'Settings' && renderSettings()}
                        </AnimatePresence>
                    </div>
                </div>

                {activeTab === 'Overview' && (
                    <div className="lg:hidden px-4 pb-1 pt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center bg-[#ef4444] text-white rounded-2xl overflow-hidden shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all"
                        >
                            <div className="w-14 h-14 bg-black/10 flex items-center justify-center border-r border-white/10 text-white">
                                <LogOut size={20} />
                            </div>
                            <div className="flex-1 px-6 text-left">
                                <p className="text-xs font-black uppercase tracking-widest">Logout</p>
                                <p className="text-[9px] text-white/60 font-medium">End current session</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

};

export default ProfilePage;
