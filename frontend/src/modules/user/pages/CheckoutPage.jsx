
import React, { useState, useEffect } from 'react';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Truck, Tag, X, Percent } from 'lucide-react';
import CouponsModal from '../components/CouponsModal';
import logo from '../../../assets/logo.png';
import toast from 'react-hot-toast';

// Stores & Hooks
import useCartStore from '../../../store/useCartStore';
import { useProducts } from '../../../hooks/useProducts';
import { useUserProfile } from '../../../hooks/useUser';
import { usePlaceOrder, useVerifyPayment } from '../../../hooks/useOrders';
import { useActiveCoupons } from '../../../hooks/useCoupons';
import { useValidateReferral } from '../../../hooks/useReferrals';
import { useSetting } from '../../../hooks/useSettings';
import { API_BASE_URL } from '@/lib/apiUrl';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Hooks
    const { getCart, clearCart, getAppliedCoupon, removeCoupon, applyCoupon } = useCartStore(); // Added clearCart destructuring logic if needed implicitly by placeOrder in old context? 
    // Old context placeOrder likely cleared cart. We need to do it manually or via mutation onSuccess.

    // Data
    const { data: products = [] } = useProducts();
    const { data: activeCoupons = [] } = useActiveCoupons();
    const { data: userData } = useUserProfile();
    const { data: checkoutFeeSetting } = useSetting('checkout_fee_config');
    const { mutateAsync: validateReferralMutate } = useValidateReferral();
    const { mutateAsync: placeOrderMutate } = usePlaceOrder();
    const { mutateAsync: verifyPaymentMutate } = useVerifyPayment();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(amount || 0));

    // Helpers
    const getProductById = (pid) => products.find(p => p.id === pid);
    // Legacy support for getPackById, getVariantById - mapped to products
    const getVariantById = (variantId) => {
        for (let p of products) {
            const v = p.variants?.find(v => v.id === variantId);
            if (v) return { ...v, product: p };
        }
        return null;
    };
    const getPackById = (packId) => products.find(p => p.id === packId);

    const validateCoupon = (userId, code, orderValue, cartItems) => {
        // First check actual coupons
        const coupon = activeCoupons.find(c => c.code === code);
        if (coupon) {
            if (orderValue < coupon.minOrderValue) return { valid: false, error: `Minimum order value of ${formatINR(coupon.minOrderValue)} required` };

            let discount = 0;
            if (coupon.type === 'percent') {
                discount = Math.round((orderValue * coupon.value) / 100);
                if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
            } else {
                discount = coupon.value;
            }
            return { valid: true, coupon, discount };
        }

        // If not a coupon, return null to trigger API check
        return null;
    };

    const recordCouponUsage = (userId, couponId) => {
        // Logic to track usage - handled by backend usually. 
        // For local dev, we might update local storage, but for now we skip strict usage tracking in this refactor step 
        // OR we can assume usePlaceOrder handles it if we pass coupon info.
    };

    const directBuyItem = location.state?.directBuyItem;
    const cartItems = directBuyItem
        ? [directBuyItem]
        : getCart(user?.id);

    const enrichedCart = cartItems.map(item => {
        // Try to get variant first
        const variantData = getVariantById(item.packId);
        if (variantData) {
            return {
                ...item,
                id: variantData.id,
                name: variantData.product.name,
                weight: variantData.weight,
                price: variantData.price,
                mrp: variantData.mrp,
                image: variantData.product.image,
                category: variantData.product.category,
                subcategory: variantData.product.subcategory,
                productId: variantData.product.id,
                stock: variantData.stock || 0
            };
        }

        // Fallback to legacy pack
        const pack = getPackById(item.packId);
        if (pack) {
            return {
                ...item,
                ...pack,
                stock: pack.stock?.quantity || pack.stock || 0
            };
        }
        return null;
    }).filter(Boolean);

    const subtotal = enrichedCart.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0);
    const mrpTotal = enrichedCart.reduce((acc, item) => {
        const qty = Number(item.qty) || 0;
        const unitMrp = Number(item.mrp || item.price || 0);
        return acc + (unitMrp * qty);
    }, 0);
    const shippingItemsPayload = enrichedCart.map((item) => ({
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        qty: Number(item.qty) || 0,
        price: Number(item.price) || 0,
        weight: item.weight,
        sku: item.id
    }));
    const shippingItemsSignature = JSON.stringify(shippingItemsPayload);
    // const cartCategories = [...new Set(enrichedCart.map(item => item.category))]; // Unused variable warning potentially, check usage. Used in original code? Line 46.
    // Line 46 in original was: const cartCategories = [...new Set(enrichedCart.map(item => item.category))]; 
    // It seems unused in the view_file output I saw (lines 1-447). I'll keep it commented or remove if I am sure.
    // I will keep it to avoid breaking unseen logic if any unique category logic exists. 
    // Actually, I'll remove it as it looks unused in the provided snippet.

    // ... rest of component logic ...


    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [selectedAddressId, setSelectedAddressId] = useState('manual');

    const userAddresses = Array.isArray(userData?.addresses) ? userData.addresses : [];

    const getAddressId = (address, index) => String(address?._id || address?.id || `address-${index}`);

    const applyAddressToForm = (address) => {
        setFormData((prev) => ({
            ...prev,
            fullName: address?.fullName || userData?.name || prev.fullName || '',
            phone: address?.phone || userData?.phone || prev.phone || '',
            address: address?.address || '',
            city: address?.city || '',
            state: address?.state || '',
            pincode: String(address?.pincode || '')
        }));
    };

    const isFilled = (value) => typeof value === 'string' && value.trim().length > 0;
    const hasRequiredAddress = (address = {}) => (
        isFilled(address.address)
        && isFilled(address.city)
        && isFilled(address.state)
        && isFilled(String(address.pincode || ''))
    );

    const getMissingCheckoutFields = () => {
        const hasAnyPhone = isFilled(formData.phone)
            || isFilled(userData?.phone)
            || userAddresses.some(a => isFilled(a?.phone));
        const hasAnyAddress = hasRequiredAddress(formData)
            || userAddresses.some(a => hasRequiredAddress(a));

        const missing = [];
        if (!hasAnyPhone) missing.push('phone number');
        if (!hasAnyAddress) {
            missing.push('address');
            missing.push('city');
            missing.push('state');
            missing.push('pincode');
        }
        return missing;
    };

    const missingCheckoutFields = getMissingCheckoutFields();
    const isProfileComplete = missingCheckoutFields.length === 0;

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [shippingQuote, setShippingQuote] = useState({
        loading: false,
        shippingCharge: 0,
        source: 'fallback',
        courierName: null,
        courierId: null,
        estimatedDays: null,
        weight: null,
        error: ''
    });

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

                        setFormData((prev) => ({
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
                } catch (error) {
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

    // Coupon management state
    // Coupon management state
    const [couponCode, setCouponCode] = useState('');
    const globalAppliedCoupon = getAppliedCoupon(user?.id);
    const [appliedCoupon, setAppliedCoupon] = useState(globalAppliedCoupon);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [showCouponsModal, setShowCouponsModal] = useState(false);

    useEffect(() => {
        if (appliedCoupon) {
            const result = validateCoupon(user?.id, appliedCoupon.code, subtotal, enrichedCart);
            // Only validate if it's a standard coupon (not null)
            // If null, it's a referral code validated via API, so skip
            if (result === null) {
                // This is a referral code, keep it as is
                return;
            }
            if (result && result.valid) {
                setCouponDiscount(result.discount);
            } else {
                setAppliedCoupon(null);
                setCouponDiscount(0);
                removeCoupon(user?.id);
            }
        }
    }, [appliedCoupon, subtotal, enrichedCart, user]);

    useEffect(() => {
        if (userData) {
            // Pre-fill address from saved addresses
            if (userAddresses.length > 0) {
                const defaultAddressIndex = userAddresses.findIndex(a => a.isDefault);
                const selectedIndex = defaultAddressIndex >= 0 ? defaultAddressIndex : 0;
                const defaultAddr = userAddresses[selectedIndex];
                setSelectedAddressId(getAddressId(defaultAddr, selectedIndex));
                applyAddressToForm(defaultAddr);
            } else {
                // Fallback to basic user info
                setSelectedAddressId('manual');
                setFormData(prev => ({
                    ...prev,
                    fullName: userData.name || '',
                    phone: userData.phone || '',
                }));
            }
        }
    }, [userData]);

    useEffect(() => {
        const pincode = String(formData.pincode || '').trim();
        if (!enrichedCart.length || pincode.length !== 6) {
            setShippingQuote(prev => ({
                ...prev,
                loading: false,
                shippingCharge: 0,
                source: 'fallback',
                courierName: null,
                courierId: null,
                estimatedDays: null,
                weight: null,
                error: ''
            }));
            return;
        }

        let isCancelled = false;
        const timer = setTimeout(async () => {
            setShippingQuote(prev => ({ ...prev, loading: true, error: '' }));

            try {
                const payload = {
                    deliveryPincode: pincode,
                    paymentMethod,
                    orderAmount: Math.max(0, subtotal - couponDiscount),
                    items: shippingItemsPayload
                };

                const res = await fetch(`${API_BASE_URL}/shipments/quote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch shipping quote');
                }

                if (!isCancelled) {
                    setShippingQuote({
                        loading: false,
                        shippingCharge: Number(data.shippingCharge || 0),
                        source: data.source || 'fallback',
                        courierName: data.courierName || null,
                        courierId: data.courierId ? String(data.courierId) : null,
                        estimatedDays: data.estimatedDays || null,
                        weight: data.weight || null,
                        error: ''
                    });
                }
            } catch (error) {
                if (!isCancelled) {
                    setShippingQuote(prev => ({
                        ...prev,
                        loading: false,
                        source: prev.source || 'fallback',
                        error: error.message || 'Unable to fetch shipping quote'
                    }));
                }
            }
        }, 450);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [formData.pincode, paymentMethod, subtotal, couponDiscount, shippingItemsSignature]);

    const shippingCharge = Number(shippingQuote.shippingCharge || 0);
    const parseFeeAmount = (value) => {
        const amount = Number(value);
        return Number.isFinite(amount) && amount > 0 ? amount : 0;
    };
    const feeConfigValue = checkoutFeeSetting?.value;
    const feeConfig = (feeConfigValue && typeof feeConfigValue === 'object' && !Array.isArray(feeConfigValue))
        ? feeConfigValue
        : {};
    const paymentHandlingFee = parseFeeAmount(feeConfig.paymentHandlingFee);
    const platformFee = parseFeeAmount(feeConfig.platformFee);
    const handlingFee = parseFeeAmount(feeConfig.handlingFee);
    const totalAdditionalFees = paymentHandlingFee + platformFee + handlingFee + shippingCharge;
    const mrpDiscount = Math.max(0, mrpTotal - subtotal);
    const total = Math.max(0, subtotal + totalAdditionalFees - couponDiscount);

    const getActiveCoupons = () => {
        if (!activeCoupons) return [];
        return activeCoupons.filter(coupon => {
            if (coupon.applicabilityType === 'all') return true;
            return enrichedCart.some(item => {
                if (coupon.applicabilityType === 'product') {
                    return coupon.targetItems.includes(item.id) || coupon.targetItems.includes(item.productId);
                }
                if (coupon.applicabilityType === 'category') {
                    return coupon.targetItems.includes(item.category);
                }
                if (coupon.applicabilityType === 'subcategory') {
                    return item.subcategory && coupon.targetItems.includes(item.subcategory);
                }
                return false;
            });
        });
    };
    const availableCoupons = getActiveCoupons();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedAddressId('manual');
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        // First try validating as a coupon
        const result = await validateCoupon(user?.id, couponCode, subtotal, enrichedCart);

        if (result && result.valid) {
            // Valid coupon
            setAppliedCoupon(result.coupon);
            setCouponDiscount(result.discount);
            setCouponError('');
            applyCoupon(user?.id, result.coupon);
        } else {
            // Not a valid coupon, try as referral code via API
            try {
                const referralData = await validateReferralMutate(couponCode);

                // Calculate discount based on referral
                let discount = 0;
                if (referralData.type === 'percentage') {
                    discount = Math.round((subtotal * referralData.value) / 100);
                } else {
                    discount = referralData.value;
                }

                // Convert to coupon format for UI
                const referralAsCoupon = {
                    ...referralData,
                    type: referralData.type === 'percentage' ? 'percent' : 'fixed'
                };

                setAppliedCoupon(referralAsCoupon);
                setCouponDiscount(discount);
                setCouponError('');
                applyCoupon(user?.id, referralAsCoupon);
            } catch (error) {
                // Neither coupon nor referral
                setCouponError(result?.error || 'Invalid Coupon or Referral Code');
                setAppliedCoupon(null);
                setCouponDiscount(0);
            }
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
        removeCoupon(user?.id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const insufficientItem = enrichedCart.find(item => (Number(item.qty) || 0) > (Number(item.stock) || 0));
        if (insufficientItem) {
            toast.error(`Insufficient stock for ${insufficientItem.name}. Available: ${insufficientItem.stock || 0}`);
            return;
        }

        setLoading(true);

        const orderData = {
            userId: user?.id,
            userName: formData.fullName,
            items: enrichedCart,
            shippingAddress: formData,
            paymentMethod: paymentMethod,
            subtotal,
            deliveryCharges: shippingCharge,
            additionalFees: {
                paymentHandlingFee,
                platformFee,
                handlingFee
            },
            shippingQuote: {
                source: shippingQuote.source,
                courierName: shippingQuote.courierName,
                courierId: shippingQuote.courierId,
                estimatedDays: shippingQuote.estimatedDays,
                shippingCharge,
                weight: shippingQuote.weight
            },
            amount: total,
            currency: 'INR',
            appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
            discount: couponDiscount
        };

        try {
            if (paymentMethod === 'cod') {
                const res = await placeOrderMutate({ userId: user?.id, orderData });
                clearCart(user?.id);
                navigate(`/order-success/${res.orderId}`);
            } else {
                // Online Payment
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // Create Razorpay Order on Backend
                const orderResponse = await placeOrderMutate({ userId: user?.id, orderData });

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // User needs to provide this
                    amount: orderResponse.amount,
                    currency: orderResponse.currency,
                    name: 'FarmLyf',
                    description: 'Order Payment',
                    image: logo,
                    order_id: orderResponse.id,
                    handler: async (response) => {
                        try {
                            setLoading(true);
                            await verifyPaymentMutate({
                                userId: user?.id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData: {
                                    ...orderData,
                                    id: `ORD-${Date.now()}` // Backend will generate a better one but we send a temp if needed
                                }
                            });
                            clearCart(user?.id);
                            navigate('/order-success'); // Or specific order ID if returned from verify
                        } catch (err) {
                            toast.error(err.message || 'Payment verification failed');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: formData.fullName,
                        contact: formData.phone,
                    },
                    theme: {
                        color: '#4ADE80', // Match FarmLyf primary
                    },
                    modal: {
                        ondismiss: () => {
                            setLoading(false);
                            toast.error('Payment cancelled');
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            const backendMessage = String(error?.message || '');
            if (/complete your profile/i.test(backendMessage)) {
                if (missingCheckoutFields.length > 0) {
                    toast.error(`Please add ${missingCheckoutFields.join(', ')} before placing the order.`);
                } else {
                    toast.error('Please check your profile details and try again.');
                }
            } else {
                toast.error(error.message || 'Something went wrong');
            }
        } finally {
            if (paymentMethod === 'cod') setLoading(false);
        }
    };

    if (enrichedCart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No items to checkout</h2>
                    <button onClick={() => navigate('/catalog')} className="text-primary font-bold hover:underline">Return to Shop</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">Checkout</h1>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Complete your order</p>
                    </div>
                </div>

                {!isProfileComplete && (
                    <div className="mb-8 p-4 md:p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                <X size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-800 text-sm md:text-base">Profile Incomplete</h4>
                                <p className="text-[11px] md:text-sm text-red-600 font-medium">Please provide mobile number and delivery address to continue.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column: Forms */}
                    <div className="space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-footerBg flex items-center gap-2">
                                    <Truck size={18} className="text-primary" />
                                    Delivery Details
                                </h3>
                                {selectedAddressId === 'manual' && (
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={detectingLocation}
                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {detectingLocation ? 'Detecting...' : 'Detect Location'}
                                    </button>
                                )}
                            </div>
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                                {userAddresses.length > 0 && (
                                    <div className="space-y-2 md:space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Saved Addresses</p>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAddressId('manual')}
                                                className="text-[10px] md:text-xs font-bold text-primary hover:underline uppercase"
                                            >
                                                Use Custom
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {userAddresses.map((address, index) => {
                                                const addressId = getAddressId(address, index);
                                                const isSelected = selectedAddressId === addressId;

                                                return (
                                                    <button
                                                        key={addressId}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedAddressId(addressId);
                                                            applyAddressToForm(address);
                                                        }}
                                                        className={`text-left border rounded-lg p-3 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-footerBg">{address.fullName || userData?.name || 'Saved Address'}</p>
                                                                <p className="text-[11px] text-gray-500">{address.phone || userData?.phone || ''}</p>
                                                            </div>
                                                            {address.isDefault && (
                                                                <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary font-black uppercase tracking-wider">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-600 mt-1">
                                                            {[address.address, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {userAddresses.length === 0 && (
                                    <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                        No saved address found. Please fill your delivery details below.
                                    </p>
                                )}

                                {(userAddresses.length === 0 || selectedAddressId === 'manual') ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                                <input
                                                    required
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="Ex: John Doe"
                                                />
                                            </div>
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Phone</label>
                                                <input
                                                    required
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="+91"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Detailed Address</label>
                                            <textarea
                                                required
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                placeholder="Flat No, Building, Area"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">City</label>
                                                <input
                                                    required
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Pincode</label>
                                                <input
                                                    required
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">State</label>
                                                <input
                                                    required
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                        Using selected saved address for this order.
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-footerBg mb-4 md:mb-6 flex items-center gap-2">
                                <CreditCard size={18} className="text-primary" />
                                Payment Method
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-footerBg flex items-center gap-2 text-sm md:text-base">
                                            <Banknote size={14} /> Cash on Delivery
                                        </div>
                                        <div className="text-[10px] md:text-sm text-gray-500">COD Available</div>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={() => setPaymentMethod('online')}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-footerBg flex items-center gap-2 text-sm md:text-base">
                                            <CreditCard size={14} /> UPI/Card
                                        </div>
                                        <div className="text-[10px] md:text-sm text-gray-500">Secure Online</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Apply Coupon */}
                        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-footerBg mb-4 md:mb-6 flex items-center gap-2">
                                <Tag size={18} className="text-primary" />
                                Apply Coupon / Referral
                            </h3>

                            {!appliedCoupon ? (
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon or Referral Code"
                                            value={couponCode}
                                            onChange={(e) => {
                                                setCouponCode(e.target.value.toUpperCase());
                                                setCouponError('');
                                            }}
                                            className="flex-1 bg-gray-50/50 border border-gray-100 rounded-lg px-3 py-2 md:py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase font-bold text-xs md:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            className="bg-footerBg text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCouponsModal(true)}
                                        className="text-primary text-[10px] md:text-sm font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Tag size={12} />
                                        View All Coupons ({availableCoupons.length})
                                    </button>
                                    {couponError && (
                                        <p className="text-red-500 text-[10px] md:text-xs font-bold mt-1 animate-pulse">
                                            {couponError}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 md:p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center border border-emerald-100">
                                            <Percent size={14} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-600 text-[10px] md:text-sm uppercase tracking-wider">{appliedCoupon.code}</p>
                                            <p className="text-[9px] md:text-xs text-emerald-500 font-bold">Saved {formatINR(couponDiscount)}!</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-[10px] md:text-xs font-bold text-red-500 hover:text-red-600 hover:underline uppercase tracking-wide px-2 py-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="h-fit sticky top-28">
                        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-primary to-footerBg" />

                            <h2 className="text-lg md:text-xl font-black text-footerBg uppercase tracking-tight mb-4 md:mb-6">Order Summary</h2>

                            <div className="max-h-48 md:max-h-60 overflow-y-auto pr-2 space-y-3 md:space-y-4 mb-4 md:mb-6 custom-scrollbar">
                                {enrichedCart.map((item) => (
                                    <div key={item.id} className="flex gap-3 md:gap-4 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs md:text-sm font-bold text-footerBg line-clamp-2 md:line-clamp-1 truncate-none whitespace-normal leading-tight">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] md:text-xs text-gray-400">Qty: {item.qty}</span>
                                                    {item.weight && <span className="text-[10px] text-primary font-bold">{item.weight}</span>}
                                                </div>
                                                <span className="text-xs md:text-sm font-black text-footerBg">{formatINR(item.price * item.qty)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-3 md:pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-[13px] md:text-base text-gray-700">
                                    <span className="font-medium">MRP (incl. of all taxes)</span>
                                    <span className="font-semibold text-footerBg">{formatINR(mrpTotal)}</span>
                                </div>

                                <div className="pt-1">
                                    <p className="text-[13px] md:text-sm font-semibold text-gray-700 mb-2">Fees</p>
                                    <div className="space-y-2 text-[12px] md:text-sm text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Payment Handling Fee</span>
                                            <span className="font-semibold text-footerBg">{formatINR(paymentHandlingFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Platform Fee</span>
                                            <span className="font-semibold text-footerBg">{formatINR(platformFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Handling Fee</span>
                                            <span className="font-semibold text-footerBg">{formatINR(handlingFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span className={`${shippingCharge > 0 ? 'text-footerBg' : 'text-emerald-500'} font-semibold`}>
                                                {shippingQuote.loading ? 'Calculating...' : shippingCharge > 0 ? formatINR(shippingCharge) : 'FREE'}
                                            </span>
                                        </div>
                                    </div>
                                    {(shippingQuote.courierName || shippingQuote.error || shippingQuote.source) && (
                                        <div className="text-[9px] md:text-[11px] text-gray-400 mt-2">
                                            {shippingQuote.loading && <span>Checking live shipping rates...</span>}
                                            {!shippingQuote.loading && shippingQuote.source === 'shiprocket' && (
                                                <span>
                                                    Live rate via {shippingQuote.courierName || 'Shiprocket'}
                                                    {shippingQuote.estimatedDays ? ` | ETA ${shippingQuote.estimatedDays} day(s)` : ''}
                                                    {shippingQuote.weight ? ` | ${shippingQuote.weight} kg` : ''}
                                                </span>
                                            )}
                                            {!shippingQuote.loading && shippingQuote.source !== 'shiprocket' && (
                                                <span>
                                                    Standard shipping applied
                                                    {shippingQuote.error ? ` (${shippingQuote.error})` : ''}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[13px] md:text-sm font-semibold text-gray-700 mb-2">Discounts</p>
                                    <div className="space-y-2 text-[12px] md:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">MRP Discount</span>
                                            <span className={`${mrpDiscount > 0 ? 'text-emerald-600' : 'text-gray-400'} font-semibold`}>
                                                {mrpDiscount > 0 ? `-${formatINR(mrpDiscount)}` : formatINR(0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Coupons for you</span>
                                            <span className={`${couponDiscount > 0 ? 'text-emerald-600' : 'text-gray-400'} font-semibold`}>
                                                {couponDiscount > 0 ? `-${formatINR(couponDiscount)}` : formatINR(0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl md:text-2xl font-black text-primary pt-2 border-t border-gray-100">
                                    <span className="text-base md:text-lg">Total Amount</span>
                                    <span>{formatINR(total)}</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={loading || !isProfileComplete || shippingQuote.loading}
                                className="w-full bg-footerBg text-white py-3 md:py-4 rounded-xl font-black text-[11px] md:text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg mt-5 md:mt-8 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                            >
                                {loading ? 'Securing Order...' : shippingQuote.loading ? 'Calculating Shipping...' : !isProfileComplete ? 'Please Complete Profile' : `Place Order - ${formatINR(total)}`}
                            </button>

                            <p className="text-[9px] md:text-xs text-center text-gray-400 mt-3 md:mt-4">
                                Secure Checkout with FarmLyf
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Modal */}
            <CouponsModal
                isOpen={showCouponsModal}
                onClose={() => setShowCouponsModal(false)}
                coupons={availableCoupons}
                onApply={(code) => {
                    setCouponCode(code);
                    setTimeout(() => handleApplyCoupon(), 100);
                }}
            />
        </div>
    );
};

export default CheckoutPage;
