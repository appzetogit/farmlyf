import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Announcement from './models/Announcement.js';
import AboutSection from './models/AboutSection.js';
import HealthBenefitSection from './models/HealthBenefitSection.js';
import TrustSignal from './models/TrustSignal.js';
import FAQ from './models/FAQ.js';
import FeaturedSection from './models/FeaturedSection.js';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmlyf';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Announcements
        const announcements = [
            { text: "Free Shipping On Orders Above ₹1499/-", position: 'topbar', isActive: true },
            { text: "✨ REPUBLIC DAY SALE: UP TO 60% OFF ✨", position: 'marquee', isActive: true },
            { text: "PREMIUM DRY FRUITS FOR YOUR FAMILY", position: 'marquee', isActive: true },
            { text: "🥜 EXTRA 10% OFF ON JUMBO NUTS 🥜", position: 'marquee', isActive: true },
            { text: "100% ORGANIC & FRESH", position: 'marquee', isActive: true }
        ];
        for (const a of announcements) {
            await Announcement.findOneAndUpdate({ text: a.text, position: a.position }, a, { upsert: true });
        }
        console.log('Announcements seeded');

        // 2. About Section
        const aboutData = {
            sectionLabel: "Our Story",
            title: "Freshness That",
            highlightedTitle: "Connects Us!",
            description1: "Our journey began with a simple mission: to bring the finest, farm-fresh dry fruits and nuts directly to your doorstep. We believe that healthy eating shouldn't be a luxury.",
            description2: "Today, FarmLyf is a community of health enthusiasts. We source premium produce, ensuring every pack carries our promise of quality and nutrition.",
            image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1600",
            stats: [
                { label: 'Outlets', value: '15+' },
                { label: 'Happy Customers', value: '500,000+' },
                { label: 'Orders Delivered', value: '750,000+' }
            ]
        };
        await AboutSection.findOneAndUpdate({}, aboutData, { upsert: true });
        console.log('About Section seeded');

        // 3. Health Benefits
        const healthBenefits = {
            title: "Health Benefits",
            subtitle: "Discover the amazing benefits of premium dry fruits for your health and wellness",
            benefits: [
                { icon: "Heart", title: "Heart Health", description: "Rich in omega-3 fatty acids and antioxidants that support cardiovascular health.", baseColor: "#006071" },
                { icon: "Brain", title: "Brain Function", description: "Enhance cognitive function, memory, and mental clarity with essential nutrients.", baseColor: "#67705B" },
                { icon: "Zap", title: "Energy Boost", description: "Natural sustained energy from healthy fats and proteins.", baseColor: "#902D45" },
                { icon: "Shield", title: "Immunity", description: "Strengthen your immune system with vitamin E and antioxidants.", baseColor: "#7E3021" },
                { icon: "Scale", title: "Weight Balance", description: "High protein and fiber content helps maintain healthy weight goals.", baseColor: "#C08552" }
            ]
        };
        await HealthBenefitSection.findOneAndUpdate({}, healthBenefits, { upsert: true });
        console.log('Health Benefits seeded');

        // 4. Trust Signals
        const trustSignals = [
            { icon: "Truck", topText: "FREE SHIPPING", bottomText: "On orders above ₹1499", isActive: true },
            { icon: "Wallet", topText: "SECURE PAYMENT", bottomText: "100% safe transactions", isActive: true },
            { icon: "ShieldCheck", topText: "PREMIUM QUALITY", bottomText: "Sourced from best farms", isActive: true },
            { icon: "Trophy", topText: "BEST PRICES", bottomText: "Unmatched value", isActive: true }
        ];
        for (const t of trustSignals) {
            await TrustSignal.findOneAndUpdate({ topText: t.topText }, t, { upsert: true });
        }
        console.log('Trust Signals seeded');

        // 5. FAQs
        const faqs = [
            { question: "Are your dry fruits organic?", answer: "Yes, we source naturally grown premium products from selected farms to ensure the highest quality and nutritional value.", isActive: true },
            { question: "How should I store dry fruits?", answer: "Store them in an airtight container in a cool, dry place. For longer shelf life, you can also refrigerate them.", isActive: true },
            { question: "Do you offer bulk discounts?", answer: "Yes, we have special pricing for bulk orders and corporate gifting. Please contact our support team for details.", isActive: true }
        ];
        for (const f of faqs) {
            await FAQ.findOneAndUpdate({ question: f.question }, f, { upsert: true });
        }
        console.log('FAQs seeded');

        // 6. Featured Section (Top Selling)
        const products = await Product.find({}).limit(8);
        if (products.length > 0) {
            const featuredData = {
                name: 'top-selling',
                title: 'Top Selling Products',
                products: products.map(p => p._id),
                isActive: true
            };
            await FeaturedSection.findOneAndUpdate({ name: 'top-selling' }, featuredData, { upsert: true });
            console.log('Featured Section seeded');
        } else {
            console.log('No products found to seed Featured Section');
        }

        console.log('All seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
