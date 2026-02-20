import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthBenefitSection from './models/HealthBenefitSection.js';

dotenv.config({ path: './.env' });

async function testFullUpdate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const section = await HealthBenefitSection.findOne({});
        if (!section) {
            console.log('No section found');
            process.exit(0);
        }

        const fullData = section.toObject();
        fullData.title = "Updated via Full Test " + Date.now();
        
        // Simulating how the frontend sends it
        // Note: req.body will be this fullData object
        
        console.log('Original Title:', section.title);

        const updated = await HealthBenefitSection.findByIdAndUpdate(
            section._id, 
            fullData, 
            { new: true }
        );

        console.log('Updated Title:', updated.title);
        
        const verified = await HealthBenefitSection.findById(section._id);
        console.log('Verified Title in DB:', verified.title);

        process.exit(0);
    } catch (error) {
        console.error('Error Details:', error);
        process.exit(1);
    }
}

testFullUpdate();
