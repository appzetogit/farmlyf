import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  id: String,
  weight: String, // Kept for backward compatibility
  quantity: String, // Numeric value (e.g., "250", "1")
  unit: String,     // Unit type (e.g., "g", "kg", "piece")
  mrp: Number,
  price: Number,
  unitPrice: String,
  discount: String,
  stock: { type: Number, default: 0 }
});

const contentSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  quantity: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "prod_001"
  slug: { type: String, unique: true },
  brand: String,
  name: String,
  category: String,
  subcategory: String,
  type: { type: String, default: 'product' }, // 'product' or 'combo'
  image: String,
  images: [String],
  description: String,
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  tag: String,
  variants: [variantSchema],
  benefits: [{ title: String, description: String, _id: false }],
  specifications: [{ label: String, value: String, _id: false }],
  faqs: [{ q: String, a: String, _id: false }],
  nutrition: [{ label: String, value: String, _id: false }],
  contents: [contentSchema], // For combo packs
  stock: {
    quantity: { type: Number, default: 0 }
  },
  lowStockThreshold: { type: Number, default: 10 },
  inStock: { type: Boolean, default: true },
  seoImage: { type: String, default: null },
  seoTitle: { type: String, default: null },
  seoDescription: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
