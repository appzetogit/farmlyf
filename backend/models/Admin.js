import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Should be hashed
  name: { type: String, required: true },
  phone: { type: String }, // Added phone field
  fcmToken: { type: String }, // Added for admin order notifications
  role: { type: String, default: 'Admin' } // Future proofing for roles
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
