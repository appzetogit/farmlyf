import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import SubCategory from './models/SubCategory.js';

dotenv.config();

const debugCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const categories = await Category.find({});
        const subCategories = await SubCategory.find({});
        
        console.log(`Total Categories: ${categories.length}`);
        categories.forEach(c => {
            console.log(`CAT: ${c.name} (ID: ${c._id})`);
            const subs = subCategories.filter(s => String(s.parent) === String(c._id));
            console.log(`  -> Subcats (${subs.length}): ${subs.map(s => s.name).join(', ')}`);
        });

        console.log(`Total SubCategories in DB: ${subCategories.length}`);
        
        // Orphaned subs
        const orphaned = subCategories.filter(s => !categories.find(c => String(c._id) === String(s.parent)));
        if (orphaned.length > 0) {
            console.log(`Orphaned SubCategories (${orphaned.length}):`);
            orphaned.forEach(s => console.log(`  - ${s.name} (ParentID: ${s.parent})`));
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugCategories();
