import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  publicId: { type: String }, // For Cloudinary
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  targetLink: { type: String } // e.g., /offers/summer-sale
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
