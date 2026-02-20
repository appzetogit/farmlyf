import mongoose from 'mongoose';
import WebsiteContent from './models/WebsiteContent.js';
import dotenv from 'dotenv';
dotenv.config();

const testWebsiteContent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const slug = 'privacy-policy';
    const testData = {
      title: 'Privacy Policy',
      content: '<h1>Testing Privacy Policy Content</h1><p>This is a test.</p>',
      isActive: true,
      metadata: { seoTitle: 'Privacy Policy - FarmLyf' }
    };

    console.log(`Upserting content for slug: ${slug}`);
    const updated = await WebsiteContent.findOneAndUpdate(
      { slug },
      testData,
      { new: true, upsert: true }
    );
    console.log('Updated content:', updated);

    const retrieved = await WebsiteContent.findOne({ slug });
    console.log('Retrieved content:', retrieved.title);

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

testWebsiteContent();
