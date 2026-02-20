
import React, { useState } from 'react';
import { useCategories, useSubCategories, useProducts, useComboCategories } from '../../../hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import {
    Store,
    Nut,
    Coffee,
    Calendar,
    Package2,
    Sprout,
    Gift,
    Gem,
    ChevronDown,
    Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const shopMenuData = [
    {
        title: 'NUTS',
        items: ['WALNUTS (AKHROT)', 'ALMONDS (BADAM)', 'CASHEW (KAJU)', 'PISTACHIO (PISTA)']
    },
    {
        title: 'DRIED FRUITS',
        items: ['RAISINS (KISHMISH)', 'DRIED FIGS (ANJEER)', 'DRIED APRICOTS (KHUBANI)', 'DRIED KIWI', 'DRIED PRUNES (AALOOBUKHAARA)']
    },
    {
        title: 'DATES',
        items: ['WET DATES (KHAJUR)', 'DRY DATES (CHUARA)']
    },
    {
        title: 'SEEDS',
        items: ['CHIA SEEDS', 'CUCUMBER SEEDS', 'FLAX SEEDS', 'MUSK MELON SEEDS', 'PUMPKIN SEEDS', 'QUINOA SEEDS', 'SUNFLOWER SEEDS', 'FOX NUTS (PHOOL MAKHANA)']
    },
    {
        title: 'EXOTIC NUTS',
        items: ['HAZELNUTS', 'MACADAMIA NUTS', 'PECAN NUTS']
    },
    {
        title: 'MIXES',
        items: ['BERRIES MIX', 'NUT MIX', 'SEEDS MIX', 'TRAIL MIX']
    }
];



const CategoryNav = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { data: rawCategories = [] } = useCategories();
    const { data: rawSubCategories = [] } = useSubCategories();
    const { data: products = [] } = useProducts();

    // Fetch Combo Categories from centralized hook
    const { data: comboCategories = [] } = useComboCategories();

    // Deduplicate and filter active categories
    const categoriesDB = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        for (const cat of rawCategories) {
            const id = cat._id || cat.id;
            if (id && !seen.has(id) && cat.status === 'Active' && cat.showInNavbar === true) {
                seen.add(id);
                unique.push(cat);
            }
        }
        return unique.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [rawCategories]);

    // Build Shop Menu Data properly from DB
    const shopMenuData = React.useMemo(() => {
        return categoriesDB.map(cat => {
            const catId = cat._id || cat.id;
            const subs = rawSubCategories.filter(sub => {
                const subParentId = sub.parent?._id || sub.parent;
                return subParentId && catId && String(subParentId) === String(catId) && sub.status === 'Active';
            });

            return {
                title: cat.name,
                slug: cat.slug,
                items: subs.map(s => ({ name: s.name, slug: s.slug }))
            };
        });
    }, [categoriesDB, rawSubCategories]);

    // Build Combo Menu Data dynamically from new dedicated DB
    const comboMenuData = React.useMemo(() => {
        const activeCombos = comboCategories.filter(c => c.status === 'Active');
        return [{
            title: 'ALL COMBOS',
            slug: 'combos-packs',
            items: activeCombos.map(s => ({ name: s.name, slug: s.slug }))
        }];
    }, [comboCategories]);

    // Build Top Level Navigation Items
    const navItems = React.useMemo(() => {
        const items = [
            { name: 'Home', icon: Home, path: '/' },
            {
                name: 'Shop',
                icon: Store,
                path: '/catalog',
                hasMenu: true,
                menuData: shopMenuData
            },
            {
                name: 'Combos & Packs',
                icon: Package2,
                path: '/category/combos-packs',
                hasMenu: true,
                menuData: comboMenuData
            },
        ];

        // Add Categories as top level links
        categoriesDB.forEach(cat => {
            const catId = cat._id || cat.id;

            // Find subcategories for this category
            const catSubs = rawSubCategories.filter(sub => {
                const subParentId = sub.parent?._id || sub.parent;
                return subParentId && catId && String(subParentId) === String(catId) && sub.status === 'Active';
            });

            // Prepare menu data
            const menuData = [{
                title: 'Collections',
                slug: cat.slug,
                items: catSubs.map(s => ({ name: s.name, slug: s.slug }))
            }];

            items.push({
                name: cat.name,
                icon: Store,
                path: `/category/${cat.slug}`,
                hasMenu: catSubs.length > 0,
                menuType: 'categories',
                menuData: menuData
            });
        });

        return items;
    }, [categoriesDB, rawSubCategories, shopMenuData]);

    const activeItem = navItems.find(c => c.name === activeMenu);

    return (
        <div className="bg-footerBg text-white py-3.5 hidden md:block border-t border-gray-800 shadow-lg relative" style={{ zIndex: 10000 }}>
            <div className="w-full overflow-x-auto no-scrollbar px-4 lg:px-12">
                <div className="w-max min-w-full flex items-center justify-between gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-black tracking-widest uppercase">
                    {navItems.map((cat, index) => {
                        const Icon = cat.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center shrink-0"
                                onMouseEnter={() => cat.hasMenu && setActiveMenu(cat.name)}
                                onMouseLeave={() => cat.hasMenu && setActiveMenu(null)}
                            >
                                <Link
                                    to={cat.path}
                                    onClick={() => setActiveMenu(null)}
                                    className={`flex items-center gap-2 py-1 transition-all duration-300 ${activeMenu === cat.name ? 'text-primary' : 'hover:text-primary text-white/90'}`}
                                >
                                    <Icon size={14} className={`transition-colors duration-300 ${activeMenu === cat.name ? 'text-primary' : 'text-primary/70'}`} />
                                    <span className="whitespace-nowrap">{cat.name}</span>
                                    {cat.hasMenu && <ChevronDown size={11} className={`ml-0.5 transition-transform duration-300 ${activeMenu === cat.name ? 'rotate-180' : ''}`} />}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Popup Mega Menu */}
            <AnimatePresence>
                {activeMenu && activeItem && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-white shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] rounded-b-[2rem] border-t border-gray-100 overflow-hidden"
                        style={{ zIndex: 10001 }}
                        onMouseEnter={() => setActiveMenu(activeMenu)}
                        onMouseLeave={() => setActiveMenu(null)}
                    >
                        <div className="max-w-[1500px] mx-auto px-12 py-12">
                            {activeItem.menuType === 'products' ? (
                                <div>
                                    <h4 className="text-footerBg font-black text-[12px] tracking-[0.15em] mb-6 border-b border-gray-100 pb-3 uppercase">
                                        Top Products in {activeItem.name}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {activeItem.products.map((product) => (
                                            <Link
                                                key={product.id || product._id}
                                                to={`/product/${product.slug || product.id}`}
                                                className="group bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                <div className="aspect-[4/5] w-full overflow-hidden rounded-lg mb-3 bg-white p-2">
                                                    <img
                                                        src={product.image || product.images?.[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <h5 className="font-bold text-gray-800 text-[11px] leading-tight mb-1 line-clamp-2 min-h-[2.5em]">
                                                    {product.name}
                                                </h5>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary font-black text-xs">
                                                        ₹{product.variants?.[0]?.price || product.price || 0}
                                                    </span>
                                                    {(product.variants?.[0]?.mrp || product.mrp) > (product.variants?.[0]?.price || product.price) && (
                                                        <span className="text-gray-400 text-[10px] line-through">
                                                            ₹{product.variants?.[0]?.mrp || product.mrp}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={`grid ${activeMenu.startsWith('Shop') ? 'grid-cols-6' : 'grid-cols-4'} gap-x-10 gap-y-12`}>
                                    {activeItem.menuData?.map((section, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <h4 className="text-footerBg font-black text-[12px] tracking-[0.15em] mb-6 border-b border-gray-100 pb-3 uppercase">
                                                {section.title}
                                            </h4>
                                            <ul className="space-y-4">
                                                {section.items.map((item, i) => (
                                                    <li key={i} className="group/item">
                                                        <div className="flex items-start gap-2.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-[6px] flex-shrink-0" />
                                                            <Link
                                                                to={`/category/${section.slug}/${item.slug}`}
                                                                onClick={() => setActiveMenu(null)}
                                                                className="text-[#374151] group-hover/item:text-primary font-black text-[12px] leading-tight transition-all duration-200 tracking-wide uppercase"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryNav;
