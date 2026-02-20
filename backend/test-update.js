import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthBenefitSection from './models/HealthBenefitSection.js';

dotenv.config({ path: './.env' });

async function testUpdate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const section = await HealthBenefitSection.findOne({});
        if (!section) {
            console.log('No section found');
            process.exit(0);
        }

        console.log('Original Title:', section.title);

        // Simulate the update logic from controller
        const newTitle = "Health Benefits " + Date.now();
        const updated = await HealthBenefitSection.findByIdAndUpdate(
            section._id, 
            { title: newTitle }, 
            { new: true }
        );

        console.log('Updated Title:', updated.title);
        
        const verified = await HealthBenefitSection.findById(section._id);
        console.log('Verified Title in DB:', verified.title);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testUpdate();
