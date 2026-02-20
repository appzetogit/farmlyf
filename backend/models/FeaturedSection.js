import mongoose from 'mongoose';

const featuredSectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Top Selling'
  title: { type: String, required: true },
  subtitle: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('FeaturedSection', featuredSectionSchema);
