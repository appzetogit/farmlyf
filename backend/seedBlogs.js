import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const initialBlogs = [
  {
    title: "Dry Fruits Must Have in Winters for Health and Wellness",
    slug: "dry-fruits-must-have-in-winters",
    excerpt: "When the air turns cool, the body naturally burns more energy to maintain warmth. According to nutrition research...",
    content: "<p>When the air turns cool, the body naturally burns more energy to maintain warmth. According to nutrition research, dry fruits are essential for winter health.</p><p>They provide necessary fats and vitamins that keep you energized and warm.</p>",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    author: "FarmLyf",
    category: "Dry Fruits",
    status: "Published",
    date: new Date("2026-01-29")
  },
  {
    title: "Inside the House of Dates: Exploring Nature's Sweetest Varieties",
    slug: "exploring-nature-sweetest-varieties-dates",
    excerpt: "From ancient food traditions to today's lifestyle, dates have gained a permanent place in our kitchens...",
    content: "<p>From ancient food traditions to today's lifestyle, dates have gained a permanent place in our kitchens. Learn about the different varieties and their benefits.</p>",
    image: "https://images.unsplash.com/photo-1596515298511-0672023d6a7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    author: "FarmLyf",
    category: "Dates Uses",
    status: "Published",
    date: new Date("2026-01-29")
  },
  {
    title: "How FarmLyf Ensures high quality in every dry fruit Pack",
    slug: "how-farmlyf-ensures-quality",
    excerpt: "When buying dried fruit packs, quality matters just as much as taste. From freshness and appearance to safety...",
    content: "<p>When buying dried fruit packs, quality matters just as much as taste. From freshness and appearance to safety, we ensure the best for our customers.</p>",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.1&auto=format&fit=crop&w=800&q=80",
    author: "FarmLyf",
    category: "Quality",
    status: "Published",
    date: new Date("2026-01-14")
  }
];

const seedBlogs = async () => {
  try {
    await Blog.deleteMany();
    console.log('Existing blogs deleted');
    await Blog.insertMany(initialBlogs);
    console.log('Sample blogs seeded');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedBlogs();
