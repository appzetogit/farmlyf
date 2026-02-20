import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiUrl';
import {
    LayoutDashboard,
    Users,
    Layers,
    Package,
    Boxes,
    ShoppingBag,
    RefreshCcw,
    TicketPercent,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Plus,
    List,
    Share2,
    Monitor,
    Video,
    MessageSquare,
    ShieldCheck,
    ShoppingCart,
    Clock,
    FileText,
    MapPin,
    XCircle,
    CheckCircle,
    Truck,
    CheckCircle2,
    ArrowLeftRight,
    AlertTriangle,
    Upload,
    Activity,
    Star,
    Info,
    Layout,
    HelpCircle,
    User,
    Bell,
    Globe,
    Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import logo from '../../../assets/logo.png';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const API_URL = API_BASE_URL;

    // Fetch Order Stats
    const { data: orderStats = {} } = useQuery({
        queryKey: ['orderStats'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
        refetchInterval: 30000 // Refetch every 30 seconds
    });

    const [openSection, setOpenSection] = useState(null);

    // Helpers to determine active states
    const isPathInInventory = (path) => path.startsWith('/admin/inventory');
    const isPathInHomepage = (path) => (path.startsWith('/admin/banners') || path.startsWith('/admin/sections') || path.startsWith('/admin/manage-header') || path.startsWith('/admin/manage-faq')) && !path.startsWith('/admin/manage-footer');
    const isPathInProducts = (path) => path.startsWith('/admin/products');
    const isPathInCombos = (path) => path.startsWith('/admin/combo');
    const isPathInOrders = (path) => path.startsWith('/admin/orders');
    const isPathInPages = (path) => path.startsWith('/admin/pages');
    const isPathInBlogs = (path) => path.startsWith('/admin/blogs');
    const isPathInReviews = (path) => path.startsWith('/admin/reviews');
    const isPathInNotifications = (path) => path.startsWith('/admin/notifications');
    const isPathInSettings = (path) => path.startsWith('/admin/settings');

    const getSectionFromPath = (path) => {
        if (isPathInProducts(path)) return 'products';
        if (isPathInCombos(path)) return 'combos';
        if (isPathInOrders(path)) return 'orders';
        if (isPathInInventory(path)) return 'inventory';
        if (isPathInHomepage(path)) return 'homepage';
        if (isPathInPages(path)) return 'pages';
        if (isPathInBlogs(path)) return 'blogs';
        if (isPathInReviews(path)) return 'reviews';
        if (isPathInNotifications(path)) return 'notifications';
        if (isPathInSettings(path)) return 'settings';
        return null;
    };

    // Auto-sync section with route
    useEffect(() => {
        const section = getSectionFromPath(location.pathname);
        if (section) setOpenSection(section);
        else setOpenSection(null);
    }, [location.pathname]);

    const toggleSection = (sectionId) => {
        setOpenSection(prev => prev === sectionId ? null : sectionId);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Layers, label: 'Categories', path: '/admin/categories' },
        { icon: Layers, label: 'Sub-categories', path: '/admin/sub-categories' },
        { icon: RefreshCcw, label: 'Returns', path: '/admin/returns' },
        { icon: ArrowLeftRight, label: 'Replacements', path: '/admin/replacements' },
        { icon: TicketPercent, label: 'Coupons', path: '/admin/coupons' },
        { icon: Tag, label: 'Offers & Collections', path: '/admin/offers' },
        { icon: Share2, label: 'Referrals', path: '/admin/referrals' },
    ];

    // Main highlight logic: Only one item in the main list can be green at once
    const isSectionHighlighted = (sectionId) => {
        // Highlight if open or if the current route belongs to this section (and no other section is open)
        return openSection === sectionId || (!openSection && getSectionFromPath(location.pathname) === sectionId);
    };

    const isDirectItemHighlighted = (path) => {
        // Highlight only if no section is active/open and the path matches
        return !openSection && location.pathname === path;
    };

    return (
        <div className="w-72 h-screen bg-footerBg text-white flex flex-col fixed left-0 top-0 z-50 overflow-hidden" style={{ overscrollBehavior: 'contain' }} data-lenis-prevent>
            {/* Logo Section */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3 shrink-0">
                <img src={logo} alt="FarmLyf" className="h-8 w-auto object-contain" />
                <span className="font-brand font-bold text-xl tracking-tight">Admin</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar" style={{ overscrollBehavior: 'contain' }} data-lenis-prevent>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-2 tracking-widest">Main Menu</p>

                {/* Items Before Products (Dashboard to Sub-categories) */}
                {menuItems.slice(0, 4).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isDirectItemHighlighted(item.path)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} strokeWidth={isDirectItemHighlighted(item.path) ? 2.5 : 2} />
                        <span className="font-bold text-sm">{item.label}</span>
                    </Link>
                ))}

                {/* Products Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('products')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Package size={20} strokeWidth={isSectionHighlighted('products') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Products</span>
                        {openSection === 'products' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'products' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/products/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/products/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Product</span>
                            </Link>
                            <Link
                                to="/admin/products"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/products'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Product List</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Combos Section - Updated to 3 Sub-items */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('combos')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('combos')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Boxes size={20} strokeWidth={isSectionHighlighted('combos') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Combos</span>
                        {openSection === 'combos' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'combos' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/combo-categories"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-categories'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layers size={16} />
                                <span className="font-semibold">Combo Categories</span>
                            </Link>
                            <Link
                                to="/admin/combo-products/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-products/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Combo</span>
                            </Link>
                            <Link
                                to="/admin/combo-products"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-products'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Combo List</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Homepage Sections - NEW */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('homepage')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('homepage')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Monitor size={20} strokeWidth={isSectionHighlighted('homepage') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Homepage Sections</span>
                        {openSection === 'homepage' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'homepage' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/banners"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/banners'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Banners</span>
                            </Link>
                            <Link
                                to="/admin/manage-header"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-header'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layout size={16} />
                                <span className="font-semibold">Top Bar & Marquee</span>
                            </Link>
                            <Link
                                to="/admin/manage-header-categories"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-header-categories'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layers size={16} />
                                <span className="font-semibold">Header Categories</span>
                            </Link>
                            <Link
                                to="/admin/sections/top-selling"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/top-selling'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Activity size={16} />
                                <span className="font-semibold">Top Selling Products</span>
                            </Link>
                            <Link
                                to="/admin/sections/why-choose-us"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/why-choose-us'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Star size={16} />
                                <span className="font-semibold">Why Choose Us</span>
                            </Link>

                            <Link
                                to="/admin/sections/about-us"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/about-us'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Info size={16} />
                                <span className="font-semibold">About Us Section</span>
                            </Link>

                            <Link
                                to="/admin/sections/health-benefits"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/health-benefits'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Activity size={16} />
                                <span className="font-semibold">Health Benefits</span>
                            </Link>
                            <Link
                                to="/admin/manage-faq"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-faq'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <HelpCircle size={16} />
                                <span className="font-semibold">FAQ</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Website Pages - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('pages')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('pages')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText size={20} strokeWidth={isSectionHighlighted('pages') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Website Pages</span>
                        {openSection === 'pages' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'pages' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-4 py-2">
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 pl-2 tracking-wider">Pages</h4>
                                <div className="space-y-1">
                                    {[
                                        { name: 'About Us', id: 'about-us', icon: Info },
                                        { name: 'Contact Us', id: 'contact-us', icon: Info },
                                        { name: 'How to Order', id: 'how-to-order', icon: Info },
                                        { name: 'Size Guide', id: 'size-guide', icon: Info },
                                        { name: 'Payment Methods', id: 'payment-methods', icon: Info },
                                        { name: 'Privacy Policy', id: 'privacy-policy', icon: ShieldCheck },
                                        { name: 'Terms & Conditions', id: 'terms-conditions', icon: ShieldCheck },
                                        { name: 'Return Policy', id: 'refund-policy', icon: ShieldCheck },
                                        { name: 'Shipping Policy', id: 'shipping-policy', icon: ShieldCheck },
                                        { name: 'Cookie Policy', id: 'cookie-policy', icon: ShieldCheck },
                                        { name: 'Cancellation Policy', id: 'cancellation-policy', icon: ShieldCheck },
                                        { name: 'Disclaimer', id: 'disclaimer', icon: ShieldCheck }
                                    ].map(page => (
                                        <Link
                                            key={page.id}
                                            to={`/admin/pages/${page.id}`}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${location.pathname === `/admin/pages/${page.id}`
                                                ? 'bg-primary/20 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <page.icon size={14} />
                                            <span className="font-medium text-xs">{page.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Blogs Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('blogs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('blogs')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText size={20} strokeWidth={isSectionHighlighted('blogs') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Blogs</span>
                        {openSection === 'blogs' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'blogs' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/blogs"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/blogs'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Blog List</span>
                            </Link>
                            <Link
                                to="/admin/blogs/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/blogs/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Blog</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Management */}
                <Link
                    to="/admin/manage-footer"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-1 ${isDirectItemHighlighted('/admin/manage-footer')
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Layout size={20} strokeWidth={isDirectItemHighlighted('/admin/manage-footer') ? 2.5 : 2} />
                    <span className="font-bold text-sm">Footer</span>
                </Link>

                {/* Reviews Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('reviews')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('reviews')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <MessageSquare size={20} strokeWidth={isSectionHighlighted('reviews') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Reviews</span>
                        {openSection === 'reviews' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'reviews' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/reviews?tab=user"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/reviews' && new URLSearchParams(location.search).get('tab') !== 'admin'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">User Reviews</span>
                            </Link>
                            <Link
                                to="/admin/reviews?tab=admin"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${new URLSearchParams(location.search).get('tab') === 'admin'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <ShieldCheck size={16} />
                                <span className="font-semibold">Admin Reviews</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ORDER SECTION */}
                <div className="mt-6 mb-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 px-2 tracking-widest">Order Section</p>
                    <button
                        onClick={() => toggleSection('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('orders')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <ShoppingCart size={20} strokeWidth={isSectionHighlighted('orders') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Order List</span>
                        {openSection === 'orders' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'orders' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            {[
                                { label: 'All Order', count: orderStats.All || 0, color: 'bg-pink-500', icon: ShoppingCart, path: '/admin/orders?status=All' },
                                { label: 'Pending Order', count: (orderStats.Processing || 0) + (orderStats.pending || 0), color: 'bg-orange-500', icon: Clock, path: '/admin/orders?status=Processing' },
                                { label: 'Delivered Order', count: orderStats.Delivered || 0, color: 'bg-orange-600', icon: CheckCircle2, path: '/admin/orders?status=Delivered' },
                                { label: 'Cancelled Order', count: orderStats.Cancelled || 0, color: 'bg-red-500', icon: XCircle, path: '/admin/orders?status=Cancelled' },
                            ].map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm group ${location.search.includes(item.path.split('?')[1]) || (item.label === 'All Order' && location.pathname === '/admin/orders' && !location.search)
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} />
                                        <span className="font-semibold text-xs">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.color} ${item.color.includes('text-') ? '' : 'text-white'}`}>
                                        {item.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>

                {/* Items After Reviews (Returns and Replacements) */}
                {
                    menuItems.slice(4, 6).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isDirectItemHighlighted(item.path)
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isDirectItemHighlighted(item.path) ? 2.5 : 2} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </Link>
                    ))
                }

                {/* Inventory Management Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => toggleSection('inventory')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('inventory')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Package size={20} strokeWidth={isSectionHighlighted('inventory') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Inventory Management</span>
                        {openSection === 'inventory' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openSection === 'inventory' && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/inventory/adjust"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/adjust'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Stock Adjustments</span>
                            </Link>
                            <Link
                                to="/admin/inventory/history"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/history'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Clock size={16} />
                                <span className="font-semibold">Stock History</span>
                            </Link>
                            <Link
                                to="/admin/inventory/alerts"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/alerts'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <AlertTriangle size={16} />
                                <span className="font-semibold">Low Stock Alerts</span>
                            </Link>

                            <Link
                                to="/admin/inventory/reports"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/reports'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <FileText size={16} />
                                <span className="font-semibold">Reports & Export</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Remaining Menu Items (Coupons, Referrals) */}
                {
                    menuItems.slice(6).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isDirectItemHighlighted(item.path)
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isDirectItemHighlighted(item.path) ? 2.5 : 2} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </Link>
                    ))
                }
                {/* Footer Actions - Now part of scrollable nav as requested */}
                <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
                    {/* Push Notifications Section - Expandable */}
                    <div className="mt-1">
                        <button
                            onClick={() => toggleSection('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('notifications')
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Bell size={20} strokeWidth={isSectionHighlighted('notifications') ? 2.5 : 2} />
                            <span className="font-bold text-sm flex-1 text-left">Push Notifications</span>
                            {openSection === 'notifications' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {openSection === 'notifications' && (
                            <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                                <Link
                                    to="/admin/notifications?tab=list"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/notifications' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'list')
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <List size={16} />
                                    <span className="font-semibold">Notification List</span>
                                </Link>
                                <Link
                                    to="/admin/notifications?tab=add"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/notifications' && new URLSearchParams(location.search).get('tab') === 'add'
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Plus size={16} />
                                    <span className="font-semibold">Add Notification</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Settings Section - Expandable */}
                    <div className="mt-1">
                        <button
                            onClick={() => toggleSection('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSectionHighlighted('settings')
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings size={20} strokeWidth={isSectionHighlighted('settings') ? 2.5 : 2} />
                            <span className="font-bold text-sm flex-1 text-left">Settings</span>
                            {openSection === 'settings' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {openSection === 'settings' && (
                            <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                                <Link
                                    to="/admin/settings?tab=general"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/settings' && new URLSearchParams(location.search).get('tab') === 'general'
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Globe size={16} />
                                    <span className="font-semibold">Store General</span>
                                </Link>
                                <Link
                                    to="/admin/settings?tab=invoice"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/settings' && new URLSearchParams(location.search).get('tab') === 'invoice'
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <FileText size={16} />
                                    <span className="font-semibold">Invoice Settings</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/admin/profile"
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-1 ${isDirectItemHighlighted('/admin/profile')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <User size={20} strokeWidth={isDirectItemHighlighted('/admin/profile') ? 2.5 : 2} />
                        <span className="font-bold text-sm">Profile</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-left group"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                    <div className="h-8" /> {/* Extra bottom padding for comfortable scrolling */}
                </div>
            </nav >
        </div >
    );
};

export default AdminSidebar;
