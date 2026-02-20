import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // Base64 or URL
  slug: { type: String }, // e.g., 'almonds'
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' },
  showInShopByCategory: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('SubCategory', subCategorySchema);
