import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String }, // For admin-created testimonials
  image: { type: String }, // For admin-created testimonials (avatar)
  rating: { type: Number, required: false, min: 1, max: 5 }, // Optional for admin reviews
  title: { type: String },
  comment: { type: String, required: true },
  images: [String],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Inactive'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
