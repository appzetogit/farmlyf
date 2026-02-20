import mongoose from 'mongoose';

const comboCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // Base64 or URL
  slug: { type: String },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ComboCategory', comboCategorySchema);
