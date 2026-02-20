import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Return from './models/Return.js';
import Coupon from './models/Coupon.js';
import Admin from './models/Admin.js';
import Category from './models/Category.js';
import SubCategory from './models/SubCategory.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Return.deleteMany({});
        await Coupon.deleteMany({});
        await Admin.deleteMany({});

        console.log('Cleared existing data...');

        // --- USERS ---
        const users = [
            { id: 'user-1', name: 'Aditya Raj', email: 'aditya@example.com', phone: '9876543210', gender: 'Male', birthDate: '1995-05-20', addresses: [{ id: 1, type: 'Home', fullName: 'Aditya Raj', address: '123 Sky Tower', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true }], usedCoupons: [] },
            { id: 'user-2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9988776655', gender: 'Female', birthDate: '1998-08-15', addresses: [{ id: 1, type: 'Work', fullName: 'Priya Sharma', address: 'Office 404, Tech Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001', isDefault: true }], usedCoupons: [] },
            { id: 'user-3', name: 'Rohan Gupta', email: 'rohan@example.com', phone: '9123456789', gender: 'Male', birthDate: '1992-12-10', addresses: [], usedCoupons: [] },
            { id: 'user-4', name: 'Sneha Patel', email: 'sneha@example.com', phone: '8877665544', gender: 'Female', birthDate: '1996-03-25', addresses: [], usedCoupons: [] },
            { id: 'user-5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '7766554433', gender: 'Male', birthDate: '1990-07-06', addresses: [], usedCoupons: [] }
        ];

        await User.insertMany(users);
        console.log('Users Seeded');

        // --- PRODUCTS ---
        const products = [
             {
                id: 'p1',
                brand: 'FARMLYF ANMOL',
                name: 'Farmlyf Anmol Jumbo Size Sonora Almonds',
                category: 'nuts',
                rating: 4.9,
                reviews: 120,
                tag: 'PREMIUM',
                image: '/assets/baadaam.png', // Note: Needs handling on frontend
                variants: [
                    { id: 'p1-v1', weight: '250g', mrp: 480, price: 399, discount: '17%off', unitPrice: '159.6/100g' },
                    { id: 'p1-v2', weight: '500g', mrp: 929, price: 782, discount: '15%off', unitPrice: '156.4/100g' },
                    { id: 'p1-v3', weight: '1kg', mrp: 1800, price: 1499, discount: '17%off', unitPrice: '149.9/100g' }
                ]
            },
            {
                id: 'p2',
                brand: 'FARMLYF PREMIUM',
                name: 'Farmlyf Jumbo Roasted Royale Cashews',
                category: 'nuts',
                rating: 4.8,
                reviews: 85,
                tag: 'BESTSELLER',
                image: '/assets/cashew.png',
                variants: [
                    { id: 'p2-v1', weight: '250g', mrp: 650, price: 549, discount: '15%off', unitPrice: '219.6/100g' },
                    { id: 'p2-v2', weight: '500g', mrp: 1200, price: 980, discount: '18%off', unitPrice: '196/100g' },
                    { id: 'p2-v3', weight: '1kg', mrp: 2300, price: 1899, discount: '17%off', unitPrice: '189.9/100g' }
                ]
            },
            // ... Add more if needed from mockData
        ];
        
        await Product.insertMany(products);
        console.log('Products Seeded');

        // --- ORDERS ---
        const orders = [
            {
                id: 'ORD-1001',
                userId: 'user-1',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
                status: 'Delivered',
                deliveryStatus: 'Delivered',
                amount: 2540,
                paymentMethod: 'Online',
                courierPartner: 'FarmLyf Express',
                trackingId: 'TRK-1001',
                items: [
                    { id: 'p1-v2', name: 'Farmlyf Anmol Jumbo Size Sonora Almonds', qty: 2, price: 782 },
                    { id: 'p2-v2', name: 'Farmlyf Jumbo Roasted Royale Cashews', qty: 1, price: 980 }
                ],
                shippingAddress: { fullName: 'Aditya Raj', address: '123 Sky Tower', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
            },
            {
                id: 'ORD-1002',
                userId: 'user-2',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
                status: 'Processing',
                deliveryStatus: 'Processing',
                amount: 1499,
                paymentMethod: 'Online',
                items: [
                    { id: 'p4-v1', name: 'Farmlyf Medjool Dates', qty: 1, price: 1450 }
                ],
                shippingAddress: { fullName: 'Priya Sharma', address: 'Office 404, Tech Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
            }
        ];

        await Order.insertMany(orders);
        console.log('Orders Seeded');

        // --- COUPONS ---
        const coupons = [
             {
                id: 'cpn_01',
                code: 'WELCOME50',
                type: 'flat',
                value: 50,
                minOrderValue: 500,
                validUntil: '2026-12-31',
                usageLimit: 1000,
                perUserLimit: 1,
                active: true
            },
            {
                id: 'cpn_02',
                code: 'SAVE100',
                type: 'flat',
                value: 100,
                minOrderValue: 1000,
                validUntil: '2026-12-31',
                usageLimit: 500,
                perUserLimit: 3,
                active: true
            }
        ];
        
        await Coupon.insertMany(coupons);
        console.log('Coupons Seeded');



        // --- CATEGORIES & SUBCATEGORIES ---
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        
        // Parent Categories
        const catNuts = await Category.create({ name: 'Nuts', slug: 'nuts', status: 'Active', showInNavbar: true });
        const catDriedFruits = await Category.create({ name: 'Dried Fruits', slug: 'dried-fruits', status: 'Active', showInNavbar: true });
        const catSeeds = await Category.create({ name: 'Seeds', slug: 'seeds', status: 'Active', showInNavbar: true });
        const catCombos = await Category.create({ name: 'Combos & Packs', slug: 'combos-packs', status: 'Active', showInNavbar: true });

        // Sub Categories
        const subCategories = [
            // Nuts
            { name: 'Almonds', parent: catNuts._id, slug: 'almonds', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=400' },
            { name: 'Cashews', parent: catNuts._id, slug: 'cashews', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1533230408806-3883e580e605?auto=format&fit=crop&w=400' },
            { name: 'Walnuts (Akhrot)', parent: catNuts._id, slug: 'walnuts', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=400' },
            { name: 'Pistachios (Pista)', parent: catNuts._id, slug: 'pistachios', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1606822361688-467ce880a133?auto=format&fit=crop&w=400' },
            // Dried Fruits
            { name: 'Dates', parent: catDriedFruits._id, slug: 'dates', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1628795556276-886ec168536f?auto=format&fit=crop&w=400' },
            { name: 'Dried Figs (Anjeer)', parent: catDriedFruits._id, slug: 'figs', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1594051516003-889a744cb89f?auto=format&fit=crop&w=400' },
            { name: 'Raisins (Kishmish)', parent: catDriedFruits._id, slug: 'raisins', showInShopByCategory: true, image: 'https://images.unsplash.com/photo-1596525737299-db0ebcf199df?auto=format&fit=crop&w=400' },
            { name: 'Cranberries', parent: catDriedFruits._id, slug: 'cranberries', showInShopByCategory: false, image: 'https://images.unsplash.com/photo-1596524483785-3b171c84d339?auto=format&fit=crop&w=400' },
            // Seeds
            { name: 'Chia Seeds', parent: catSeeds._id, slug: 'chia-seeds', image: 'https://images.unsplash.com/photo-1615485925763-867862f85770?auto=format&fit=crop&w=400' },
            { name: 'Pumpkin Seeds', parent: catSeeds._id, slug: 'pumpkin-seeds', image: 'https://images.unsplash.com/photo-1606990497558-7c8584852928?auto=format&fit=crop&w=400' },
            // Combos
            { name: 'Daily Packs', parent: catCombos._id, slug: 'daily-packs', image: 'https://images.unsplash.com/photo-1596525737299-db0ebcf199df?auto=format&fit=crop&w=400' },
            { name: 'Festival Combos', parent: catCombos._id, slug: 'festival-combos', image: 'https://images.unsplash.com/photo-1594051516003-889a744cb89f?auto=format&fit=crop&w=400' }
        ];

        await SubCategory.insertMany(subCategories);
        console.log('Categories & SubCategories Seeded');

        console.log('Database Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
