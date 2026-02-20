
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    ShieldCheck,
    Truck,
    RotateCcw,
    Award,
    Star,
    Leaf,
    Zap,
    Heart,
    ThumbsUp
} from 'lucide-react';
import logo from '../../../assets/logo.png';

import { useWebsiteContent } from '../../../hooks/useContent';

const DEFAULT_FOOTER_CONFIG = {
    brand: {
        description: "Fine, hand-picked dry fruits from around the globe. Quality that nourishes."
    },
    socials: {
        facebook: '#',
        instagram: '#',
        twitter: '#'
    },
    columns: [
        {
            id: 'col1',
            title: 'Quick Shop',
            links: [
                { label: 'Daily Health', url: '/shop' },
                { label: 'Family Packs', url: '/shop?category=packs' },
                { label: 'Energy & Fitness', url: '/shop?tag=energy' },
                { label: 'Festival', url: '/shop?tag=festival' },
                { label: 'Gifting', url: '/shop?tag=gifting' }
            ]
        },
        {
            id: 'col2',
            title: 'Information',
            links: [
                { label: 'About Us', url: '/about-us' },
                { label: 'Track Order', url: '/orders' },
                { label: 'Returns', url: '/returns' },
                { label: 'Privacy Policy', url: '/privacy-policy' },
                { label: 'Terms & Conditions', url: '/terms-conditions' }
            ]
        }
    ],
    contact: {
        address: "Office No 501, Princess center, 5th Floor, New Palasia, Indore, 452001",
        phone: "+91 98765 43210",
        email: "support@farmlyf.com"
    }
};

const Footer = () => {
    const { data: serverData } = useWebsiteContent('footer-config');
    const [config, setConfig] = React.useState(DEFAULT_FOOTER_CONFIG);

    React.useEffect(() => {
        if (serverData?.content) {
            setConfig(serverData.content);
        }
    }, [serverData]);

    return (
        <footer className="bg-footerBg text-white pt-10 md:pt-20 pb-10 px-4 md:px-12 relative overflow-hidden">
            {/* Newsletter Section */}


            <div className="container mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8 mb-16 md:mb-20">
                {/* Brand Column */}
                <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-8 mb-4 md:mb-0">
                    <Link to="/" className="inline-block">
                        <img src={logo} alt="FarmLyf" className="h-8 md:h-10 w-auto object-contain" />
                    </Link>
                    <p className="text-gray-400 text-xs md:text-base leading-relaxed">
                        {config.brand.description}
                    </p>
                    <div className="flex gap-3 md:gap-4">
                        {config.socials.facebook && (
                            <a href={config.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
                                <Facebook size={16} md:size={18} />
                            </a>
                        )}
                        {config.socials.instagram && (
                            <a href={config.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
                                <Instagram size={16} md:size={18} />
                            </a>
                        )}
                        {config.socials.twitter && (
                            <a href={config.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
                                <Twitter size={16} md:size={18} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Dynamic Columns */}
                {config.columns.map((col, index) => (
                    <div key={col.id || index} className="col-span-1">
                        <h4 className="text-sm md:text-lg font-bold mb-4 md:mb-8 font-['Poppins']">{col.title}</h4>
                        <ul className="space-y-2 md:space-y-4 text-gray-400">
                            {col.links.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.url} className="hover:text-primary transition-colors flex items-center gap-2 group text-[11px] md:text-sm">
                                        <ArrowRight size={12} md:size={14} className="group-hover:translate-x-1 transition-transform" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Contact Info */}
                <div className="col-span-2 lg:col-span-1 mt-4 md:mt-0">
                    <h4 className="text-sm md:text-lg font-bold mb-4 md:mb-8 font-['Poppins']">Contact Us</h4>
                    <ul className="space-y-3 md:space-y-6 text-gray-400 text-[11px] md:text-sm">
                        <li className="flex gap-3 md:gap-4">
                            <MapPin className="text-primary shrink-0" size={16} md:size={20} />
                            <span>{config.contact.address}</span>
                        </li>
                        <li className="flex gap-3 md:gap-4">
                            <Phone className="text-primary shrink-0" size={16} md:size={20} />
                            <span>{config.contact.phone}</span>
                        </li>
                        <li className="flex gap-3 md:gap-4">
                            <Mail className="text-primary shrink-0" size={16} md:size={20} />
                            <span>{config.contact.email}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="container mx-auto border-t border-white/5 pt-8 md:pt-10 pb-10 md:pb-20 flex flex-wrap justify-center md:justify-between items-center gap-4 md:gap-8">
                {(config.badges || [
                    { icon: 'Award', text: 'Certified Quality' },
                    { icon: 'Truck', text: 'Pan-India Delivery' },
                    { icon: 'ShieldCheck', text: 'Secure Checkout' },
                    { icon: 'RotateCcw', text: '7-Day Return' }
                ]).map((badge, index) => {
                    const IconComponent = { Award, Truck, ShieldCheck, RotateCcw, Star, Leaf, Zap, Heart, ThumbsUp }[badge.icon] || Star;
                    return (
                        <div key={index} className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-gray-400 bg-white/5 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl">
                            <IconComponent className="text-primary" size={16} md:size={20} />
                            <span>{badge.text}</span>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Credit */}
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 font-medium text-xs text-gray-500 gap-4">
                <p className="flex items-center gap-1">© 2026 <img src={logo} alt="FarmLyf" className="h-4 w-auto object-contain" />. Crafted with ❤️ for healthy living.</p>
                <div className="flex gap-6">
                    <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms</Link>
                    <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
