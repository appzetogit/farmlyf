import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
    ChevronRight,
    Filter,
    Star,
    Search,
    ArrowLeft,
    ChevronDown,
    Sparkles,
    LayoutGrid,
    List,
    X,
    Check
} from 'lucide-react';
import { useProducts, useCategories, useSubCategories, useComboCategories } from '../../../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const FilterSection = ({ title, children, openFilters, toggleAccordion }) => (
    <div className="border-b border-[#842A35] last:border-b-0">
        <button
            onClick={() => toggleAccordion(title)}
            className="w-full flex items-center justify-between py-4 px-5 bg-white transition-colors text-left"
        >
            <span className="text-[14px] font-bold text-black tracking-tight">{title}</span>
            <ChevronDown size={18} className={`transition-transform duration-300 text-black ${openFilters.includes(title) ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
            {openFilters.includes(title) && (
                <motion.div
                    initial={false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white"
                >
                    <div className="px-5 pb-5 pt-1 space-y-2.5">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const CatalogPage = () => {
    const navigate = useNavigate();
    const { category, subCategory } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    // React Query Hooks
    const { data: products = [] } = useProducts();
    const { data: categories = [] } = useCategories();
    const { data: subCategories = [] } = useSubCategories();
    const { data: comboCategories = [] } = useComboCategories();

    // States for Filters
    const [openFilters, setOpenFilters] = useState([]); // Start closed to prevent mobile clutter
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 10000 });
    const [activeSlider, setActiveSlider] = useState('min'); // To control z-index
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [selectedDiscounts, setSelectedDiscounts] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredFilterCategory, setHoveredFilterCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [isDesktopSortOpen, setIsDesktopSortOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setOpenFilters(prev => prev.length === 5 ? prev : ['Price', 'Availability', 'Discount', 'Shop By Category', 'Shop By Weight']);
            } else {
                setOpenFilters([]);
            }
        };

        handleResize(); // Run on mount

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortOptions = [
        { value: 'featured', label: 'Featured' },
        { value: 'best-selling', label: 'Best Selling' },
        { value: 'alphabetical-az', label: 'Alphabetically: A-Z' },
        { value: 'alphabetical-za', label: 'Alphabetically: Z-A' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Date: New to Old' },
    ];

    const toggleFilterAccordion = (filterName) => {
        setOpenFilters(prev =>
            prev.includes(filterName)
                ? prev.filter(f => f !== filterName)
                : [...prev, filterName]
        );
    };

    // Derived Categories Data
    const categoriesData = useMemo(() => {
        const parents = (categories || []).filter(c => c.status === 'Active');
        const regularCats = parents.map(p => ({
            id: p.slug,
            _id: p._id,
            name: p.name,
            subcategories: subCategories
                .filter(s => (s.parent === p._id || s.parent?._id === p._id || s.parent === p.id) && s.status === 'Active')
                .map(s => s.name)
        }));

        // Add virtual Combo Packs category if not present
        if (!regularCats.some(c => c.id === 'combos-packs')) {
            regularCats.push({
                id: 'combos-packs',
                _id: 'virtual-combos',
                name: 'Combos & Packs',
                subcategories: comboCategories
                    .filter(c => c.status === 'Active')
                    .map(c => c.name)
            });
        }

        return regularCats;
    }, [categories, subCategories, comboCategories]);

    // Unique values for filters
    const filterOptions = useMemo(() => {
        const weights = [...new Set(products.flatMap(p => {
            if (p.variants) return p.variants.map(v => v.weight);
            return [p.weight];
        }).filter(Boolean))];

        // Calculate price bounds from variants
        const allPrices = products.flatMap(p => {
            const vPrices = (p.variants || []).map(v => v.price || v.mrp || 0);
            if (vPrices.length > 0) return vPrices;
            return [p.price, p.mrp].filter(pr => pr > 0);
        }).filter(pr => pr > 0);

        const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0;
        const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 10000;

        return { weights, minPrice, maxPrice };
    }, [products]);

    const hasInitializedRef = React.useRef(false);
    useEffect(() => {
        if (products.length > 0 && !hasInitializedRef.current && filterOptions.minPrice !== undefined) {
            setPriceRange({ min: filterOptions.minPrice, max: filterOptions.maxPrice });
            setLocalPriceRange({ min: filterOptions.minPrice, max: filterOptions.maxPrice });
            hasInitializedRef.current = true;
        }
    }, [filterOptions.minPrice, filterOptions.maxPrice, products.length]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const min = localPriceRange.min === '' ? 0 : Number(localPriceRange.min);
            const max = localPriceRange.max === '' ? 1000000 : Number(localPriceRange.max);
            setPriceRange({ min, max });
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [localPriceRange]);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');

    useEffect(() => {
        const searchVal = searchParams.get('search');
        if (searchVal) setSearchQuery(searchVal);

        if (subCategory) {
            const mainCat = categoriesData.find(c => c.id === category);
            if (mainCat) {
                setSelectedCategory(mainCat.id);
                const sub = mainCat.subcategories.find(s => s.toLowerCase().replace(/ /g, '-') === subCategory);
                setSelectedSubcategory(sub || 'all');
            }
        } else if (category) {
            const mainCat = categoriesData.find(c => c.id === category || c.name.toLowerCase().replace(/ /g, '-') === category);
            if (mainCat) {
                setSelectedCategory(mainCat.id);
                setSelectedSubcategory('all');
            } else {
                for (const cat of categoriesData) {
                    const sub = cat.subcategories.find(s => s.toLowerCase().replace(/ /g, '-') === category);
                    if (sub) {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(sub);
                        break;
                    }
                }
            }
        } else {
            setSelectedCategory('all');
            setSelectedSubcategory('all');
        }
    }, [category, subCategory, searchParams, categoriesData]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q))
            );
        }

        // Category/Subcategory Filter
        if (selectedCategory !== 'all') {
            result = result.filter(p => {
                // Find category slug by ID, Slug, or Name
                const pCatRef = p.category?._id || p.category?.id || p.category;
                const categoryObj = categories.find(c =>
                    String(c._id || c.id) === String(pCatRef) ||
                    String(c.slug).toLowerCase() === String(pCatRef).toLowerCase() ||
                    String(c.name).toLowerCase() === String(pCatRef).toLowerCase()
                );

                const productCatSlug = categoryObj ? categoryObj.slug : String(pCatRef || '').toLowerCase().replace(/ /g, '-');

                // Special case for virtual Combos & Packs
                if (selectedCategory === 'combos-packs') {
                    const isExplicitCombo = productCatSlug === 'combos-packs';
                    const hasComboContents = p.contents && p.contents.length > 0;
                    if (isExplicitCombo || hasComboContents) return true;
                }

                return productCatSlug === selectedCategory;
            });
        }
        if (selectedSubcategory !== 'all') {
            result = result.filter(p => {
                const pSubRef = p.subcategory?.name || p.subcategory?._id || p.subcategory?.id || p.subcategory || '';

                // Try to find subcategory object to get its name
                const subObj = subCategories.find(s =>
                    String(s._id || s.id) === String(pSubRef) ||
                    String(s.name).toLowerCase() === String(pSubRef).toLowerCase()
                );

                const productSubName = subObj ? subObj.name : String(pSubRef);
                const productSubSlug = productSubName.toLowerCase().replace(/ /g, '-');
                const selectedSubSlug = String(selectedSubcategory).toLowerCase().replace(/ /g, '-');

                // Lenient check: ID, Name, or Slug match
                return String(pSubRef) === String(selectedSubcategory) || 
                       productSubSlug === selectedSubSlug || 
                       productSubName === selectedSubcategory;
            });
        }

        // Price Filter - use starting price for filtering
        result = result.filter(p => {
            let startPrice;
            
            if (p.variants && p.variants.length > 0) {
                const variantPrices = p.variants
                    .map(v => v.price || p.price || 0)
                    .filter(pr => pr > 0);
                startPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : (p.price || 0);
            } else {
                startPrice = p.price || 0;
            }

            // Stricter check: Does the starting price fall within the selected range?
            return startPrice >= priceRange.min && startPrice <= priceRange.max;
        });

        // Availability Filter
        if (selectedAvailability.length > 0) {
            result = result.filter(p => {
                let stock = 0;
                if (p.variants && p.variants.length > 0) {
                     stock = p.variants[0].stock || 0;
                } else {
                     stock = p.stock?.quantity || 0;
                }
                const status = stock > 0 ? 'In Stock' : 'Out of Stock';
                return selectedAvailability.includes(status);
            });
        }



        // Weight Filter
        if (selectedWeights.length > 0) {
            result = result.filter(p => {
                const pWeights = p.variants ? p.variants.map(v => v.weight) : [p.weight];
                return pWeights.some(w => selectedWeights.includes(w));
            });
        }

        // Discount Filter
        if (selectedDiscounts.length > 0) {
            result = result.filter(p => {
                // Calculate discount percentage from mrp and price
                const mrp = p.mrp || (p.variants?.[0]?.mrp) || p.price;
                const price = p.price || (p.variants?.[0]?.price) || mrp;
                const discountPercent = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

                // Check if product matches any selected discount threshold
                return selectedDiscounts.some(d => {
                    const threshold = parseInt(d); // e.g., "10% and Above" -> 10
                    return discountPercent >= threshold;
                });
            });
        }

        // Sorting
        const getDisplayPrice = (p) => {
            if (p.variants && p.variants.length > 0) {
                return Math.min(...p.variants.map(v => v.price || v.mrp || Infinity));
            }
            return p.price || 0;
        };

        switch (sortBy) {
            case 'price-low': result.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b)); break;
            case 'price-high': result.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a)); break;
            case 'newest': result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
            case 'alphabetical-az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'alphabetical-za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
            default: break;
        }

        return result;
    }, [products, searchQuery, selectedCategory, selectedSubcategory, priceRange, selectedAvailability, selectedWeights, selectedDiscounts, sortBy]);

    const handleCategoryClick = (catId) => {
        if (selectedCategory === catId) {
            navigate('/catalog');
        } else {
            navigate(`/category/${catId}`);
        }
        setIsMobileMenuOpen(false);
    };

    const clearAllFilters = () => {
        setLocalPriceRange({ min: filterOptions.minPrice || 0, max: filterOptions.maxPrice || 10000 });
        setPriceRange({ min: filterOptions.minPrice || 0, max: filterOptions.maxPrice || 10000 });
        setSelectedAvailability([]);
        setSelectedWeights([]);
        setSelectedDiscounts([]);
        setSearchQuery('');
        navigate('/catalog');
    };


    return (
        <div className="bg-white min-h-screen font-['Inter']">

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 md:px-12 py-2 md:py-4 flex items-center gap-2 text-[12px] font-medium text-gray-400">
                <Link to="/" className="hover:text-[#842A35]">Home</Link>
                <ChevronRight size={14} />
                <span className="text-black font-semibold">Shop</span>
            </div>

            {/* Mobile Action Bar - Sticky Top or Inline */}
            <div className="lg:hidden container mx-auto px-4 mb-3 flex gap-2 sticky top-[70px] z-30 bg-white py-2">
                {/* All Filters Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex-1 border border-black rounded-lg py-2 flex items-center justify-center gap-1.5 bg-white"
                >
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">All Filters</span>
                    <Filter size={12} strokeWidth={2.5} />
                </button>

                {/* Sort By Dropdown - Mobile */}
                <div className="flex-1 relative">
                    <button
                        onClick={() => setIsSortMenuOpen(true)}
                        className="w-full border border-black rounded-lg py-2 flex items-center justify-center gap-1.5 bg-white"
                    >
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Sort By</span>
                        <ChevronDown size={12} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 pb-12 relative">

                {/* Mobile Sort Menu Drawer */}
                <AnimatePresence>
                    {isSortMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSortMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[80] lg:hidden backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                className="fixed bottom-0 left-0 right-0 bg-white z-[90] lg:hidden rounded-t-[20px] overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <span className="text-sm font-black text-[#842A35] uppercase tracking-widest">Sort By</span>
                                    <button onClick={() => setIsSortMenuOpen(false)} className="p-1.5 bg-gray-50 rounded-full">
                                        <X size={16} className="text-gray-500" />
                                    </button>
                                </div>
                                <div className="p-4 pb-8 space-y-1.5 max-h-[60vh] overflow-y-auto">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setIsSortMenuOpen(false);
                                            }}
                                            className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors border ${sortBy === option.value
                                                ? 'bg-[#842A35]/5 border-[#842A35] text-[#842A35] font-bold'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50 font-medium'
                                                }`}
                                        >
                                            <span className="text-xs">{option.label}</span>
                                            {sortBy === option.value && <Check size={14} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Mobile Filter Backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                {/* SIDEBAR - Mobile Bottom Sheet & Desktop Sidebar */}
                <aside
                    className={`
                        fixed bottom-0 left-0 right-0 z-[100] w-full bg-white h-[85vh] overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out rounded-t-[24px]
                        lg:static lg:w-72 lg:shrink-0 lg:shadow-none lg:translate-x-0 lg:translate-y-0 lg:z-auto lg:h-auto lg:overflow-visible lg:bg-transparent lg:rounded-none
                        ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}
                    `}
                >
                    {/* Mobile Drawer Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <span className="text-sm font-black text-[#842A35] uppercase tracking-widest">Filters</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1.5 bg-gray-50 rounded-full hover:bg-gray-100"
                        >
                            <X size={16} className="text-black" />
                        </button>
                    </div>

                    <div className="lg:border lg:border-[#842A35] lg:rounded-sm lg:overflow-hidden lg:sticky lg:top-24 pb-24 lg:pb-0">
                        <FilterSection title="Price" openFilters={openFilters} toggleAccordion={toggleFilterAccordion}>
                            <div className="space-y-6 mt-2">
                                {/* Dual Input Section */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 border border-gray-200 rounded-xl p-3 bg-white focus-within:border-blue-500 transition-colors">
                                        <span className="text-[10px] font-bold text-[#8E92BC] uppercase block mb-1">MIN</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[#E7E9F4] text-lg">₹</span>
                                            <input
                                                type="number"
                                                value={localPriceRange.min}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setLocalPriceRange(prev => ({ ...prev, min: val === '' ? '' : Number(val) }));
                                                }}
                                                className="w-full bg-transparent border-none outline-none text-base font-bold text-gray-700 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-gray-300 font-light">—</div>

                                    <div className="flex-1 border border-gray-200 rounded-xl p-3 bg-white focus-within:border-blue-500 transition-colors">
                                        <span className="text-[10px] font-bold text-[#8E92BC] uppercase block mb-1">MAX</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[#E7E9F4] text-lg">₹</span>
                                            <input
                                                type="number"
                                                value={localPriceRange.max}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setLocalPriceRange(prev => ({ ...prev, max: val === '' ? '' : Number(val) }));
                                                }}
                                                className="w-full bg-transparent border-none outline-none text-base font-bold text-gray-700 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preset Buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[
                                        { label: '< ₹200', min: 0, max: 200 },
                                        { label: '₹200-500', min: 200, max: 500 },
                                        { label: '₹500-1k', min: 500, max: 1000 },
                                        { label: '1k+', min: 1000, max: 1000000 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                const range = { min: preset.min, max: preset.max };
                                                setLocalPriceRange(range);
                                                // Apply immediately for presets to feel responsive
                                                setPriceRange(range);
                                            }}
                                            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${Number(localPriceRange.min) === preset.min && Number(localPriceRange.max) === preset.max
                                                ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-md'
                                                : 'bg-white border-gray-200 text-[#4B5563] hover:border-gray-300'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FilterSection>

                        <FilterSection title="Availability" openFilters={openFilters} toggleAccordion={toggleFilterAccordion}>
                            {['In Stock', 'Out of Stock'].map(status => (
                                <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedAvailability.includes(status)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedAvailability([...selectedAvailability, status]);
                                            else setSelectedAvailability(selectedAvailability.filter(s => s !== status));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{status}</span>
                                </label>
                            ))}
                        </FilterSection>



                        <FilterSection title="Discount" openFilters={openFilters} toggleAccordion={toggleFilterAccordion}>
                            {['10% and Above', '20% and Above', '30% and Above', '40% and Above'].map(d => (
                                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedDiscounts.includes(d)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedDiscounts([...selectedDiscounts, d]);
                                            else setSelectedDiscounts(selectedDiscounts.filter(disc => disc !== d));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{d}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Shop By Category" openFilters={openFilters} toggleAccordion={toggleFilterAccordion}>
                            <button
                                onClick={() => navigate('/catalog')}
                                className={`w-full text-left py-1 text-sm transition-all ${selectedCategory === 'all' ? 'text-[#842A35] font-bold' : 'text-gray-600 hover:text-black font-medium'}`}
                            >
                                All Products
                            </button>
                            {categoriesData.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="space-y-1"
                                    onMouseEnter={() => setHoveredFilterCategory(cat.id)}
                                    onMouseLeave={() => setHoveredFilterCategory(null)}
                                >
                                    <button
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`w-full text-left py-1 text-sm transition-all ${selectedCategory === cat.id ? 'text-[#842A35] font-bold' : 'text-gray-600 hover:text-black font-medium'}`}
                                    >
                                        {cat.name}
                                    </button>
                                    <AnimatePresence>
                                        {hoveredFilterCategory === cat.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-4 space-y-1.5 py-1 border-l border-gray-100"
                                            >
                                                {cat.subcategories.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => {
                                                            navigate(`/category/${sub.toLowerCase().replace(/ /g, '-')}`);
                                                            // Keep mobile menu open or close it? Usually close it after selection.
                                                            // setIsMobileMenuOpen(false); // Let user close it manually if they want multiple filters? 
                                                            // Wait, categories usually navigate. Let's close it.
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left py-0.5 text-xs transition-all ${selectedSubcategory === sub ? 'text-[#842A35] font-bold' : 'text-gray-400 hover:text-black font-medium'}`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </FilterSection>

                        <FilterSection title="Shop By Weight" openFilters={openFilters} toggleAccordion={toggleFilterAccordion}>
                            {filterOptions.weights.length > 0 ? filterOptions.weights.map(weight => (
                                <label key={weight} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedWeights.includes(weight)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedWeights([...selectedWeights, weight]);
                                            else setSelectedWeights(selectedWeights.filter(w => w !== weight));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{weight}</span>
                                </label>
                            )) : <p className="text-xs text-gray-400 italic">No weight options</p>}
                        </FilterSection>
                    </div>

                    <button
                        onClick={clearAllFilters}
                        className="w-full mt-4 text-[11px] font-black text-[#842A35] uppercase tracking-widest hover:underline text-left px-2"
                    >
                        Clear all filters
                    </button>
                </aside>

                {/* MAIN GRID */}
                <main className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 md:mb-8 md:pb-4 border-b border-gray-100 gap-2 md:gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl md:text-2xl font-black text-black uppercase">
                                {selectedSubcategory !== 'all' ? selectedSubcategory : (selectedCategory !== 'all' ? (categoriesData.find(c => c.id === selectedCategory)?.name || selectedCategory.replace(/-/g, ' ')) : 'All Products')}
                            </h1>
                            <span className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-1 rounded-full">
                                {filteredProducts.length} ITEMS
                            </span>
                            
                            {/* Clear All Button - Prominent Quick Action */}
                            {(selectedCategory !== 'all' || 
                              selectedSubcategory !== 'all' || 
                              selectedAvailability.length > 0 || 
                              selectedWeights.length > 0 || 
                              selectedDiscounts.length > 0 || 
                              searchQuery !== '' ||
                              (priceRange.min !== filterOptions.minPrice || priceRange.max !== filterOptions.maxPrice)
                             ) && (
                                <button 
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black text-[#842A35] uppercase tracking-wider hover:underline bg-[#842A35]/5 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <X size={12} strokeWidth={3} />
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {/* Sort By Dropdown - Desktop Custom UI */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDesktopSortOpen(!isDesktopSortOpen)}
                                    className="flex items-center gap-2.5 px-4 py-1.5 md:px-6 md:py-2 border border-black rounded-xl bg-white transition-all hover:bg-gray-50"
                                >
                                    <span className="text-xs md:text-[13px] font-bold text-black font-['Poppins']">
                                        Sort By
                                    </span>
                                    <ChevronDown size={14} className={`text-black transition-transform ${isDesktopSortOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Desktop Sort Menu */}
                                <AnimatePresence>
                                    {isDesktopSortOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10 cursor-default"
                                                onClick={() => setIsDesktopSortOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
                                            >
                                                <div className="py-1">
                                                    {sortOptions.map(option => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setSortBy(option.value);
                                                                setIsDesktopSortOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'font-bold text-[#842A35] bg-[#842A35]/5' : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {option.label}
                                                            {sortBy === option.value && <Check size={16} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-10">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-32 bg-[#fafafa] rounded-3xl border-2 border-dashed border-gray-100 mt-4">
                            <div className="mb-6 flex justify-center text-gray-200">
                                <Search size={80} strokeWidth={0.5} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">No Matches Found</h3>
                            <p className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wide">
                                We couldn't find any products matching your specific filters.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-8 bg-black text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#842A35] transition-all"
                            >
                                Start Over / Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CatalogPage;
