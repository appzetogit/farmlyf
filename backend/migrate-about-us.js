import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Define models locally for the migration
const aboutSectionSchema = new mongoose.Schema({
  sectionLabel: String,
  title: String,
  highlightedTitle: String,
  description1: String,
  description2: String,
  image: String,
  stats: [{ label: String, value: String }]
}, { strict: false });

const websiteContentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const AboutSection = mongoose.models.AboutSection || mongoose.model('AboutSection', aboutSectionSchema);
const WebsiteContent = mongoose.models.WebsiteContent || mongoose.model('WebsiteContent', websiteContentSchema);

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const section = await AboutSection.findOne({});
    if (!section) {
      console.log('No About Section data found in old collection. Using defaults...');
    }

    const migrationData = section ? {
      sectionLabel: section.sectionLabel || 'Our Story',
      title: section.title || 'Freshness That',
      highlightedTitle: section.highlightedTitle || 'Connects Us!',
      description1: section.description1 || "Our journey began with a simple mission: to bring the finest, farm-fresh dry fruits and nuts directly to your doorstep. We believe that healthy eating shouldn't be a luxury.",
      description2: section.description2 || "Today, FarmLyf is a community of health enthusiasts. We source premium produce, ensuring every pack carries our promise of quality and nutrition.",
      image: section.image || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1600',
      stats: section.stats && section.stats.length > 0 ? section.stats.map(s => ({ 
        label: s.label, 
        value: s.value,
        id: Math.random().toString(36).substr(2, 9) // Add simple ID for react keys
      })) : [
        { id: '1', label: 'Outlets', value: '15+' },
        { id: '2', label: 'Happy Customers', value: '500,000+' },
        { id: '3', label: 'Orders Delivered', value: '750,000+' }
      ]
    } : {
        sectionLabel: 'Our Story',
        title: 'Freshness That',
        highlightedTitle: 'Connects Us!',
        description1: "Our journey began with a simple mission: to bring the finest, farm-fresh dry fruits and nuts directly to your doorstep. We believe that healthy eating shouldn't be a luxury.",
        description2: "Today, FarmLyf is a community of health enthusiasts. We source premium produce, ensuring every pack carries our promise of quality and nutrition.",
        image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1600',
        stats: [
            { id: '1', label: 'Outlets', value: '15+' },
            { id: '2', label: 'Happy Customers', value: '500,000+' },
            { id: '3', label: 'Orders Delivered', value: '750,000+' }
        ]
    };

    console.log('Migrating to WebsiteContent (slug: about-us)...');
    
    await WebsiteContent.findOneAndUpdate(
      { slug: 'about-us' },
      { 
        slug: 'about-us',
        title: 'About Us',
        content: migrationData,
        metadata: { type: 'structured' }
      },
      { upsert: true, new: true }
    );

    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
